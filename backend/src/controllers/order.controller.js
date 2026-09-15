import 'dotenv/config';
import Stripe from 'stripe';
import { Product } from '../models/product.model.js';
import { Order } from '../models/order.model.js';
import { User } from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { EmailService } from '../services/email.service.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const FREE_SHIPPING_THRESHOLD = 75;

// @desc    Initiate checkout session with server-side price validation
// @route   POST /api/v1/orders/checkout-session
export const createCheckoutSession = asyncHandler(async (req, res, next) => {
  const { cartItems, shippingAddress } = req.body;

  if (!cartItems || cartItems.length === 0) {
    return next(new ApiError('Cart is empty. Cannot initiate checkout', 400));
  }

  // 1. Fetch live products from DB (Authority Check)
  const productIds = cartItems.map((item) => item._id);
  const dbProducts = await Product.find({ _id: { $in: productIds } });

  const lineItems = [];
  const validatedOrderItems = [];
  let calculatedSubtotal = 0;

  for (const clientItem of cartItems) {
    const matchedProduct = dbProducts.find((p) => p._id.toString() === clientItem._id);

    if (!matchedProduct) {
      return next(new ApiError(`Product not found: ${clientItem._id}`, 404));
    }

    if (matchedProduct.stockCount < clientItem.quantity) {
      return next(
        new ApiError(`Insufficient allocation for ${matchedProduct.title}. Only ${matchedProduct.stockCount} left.`, 400)
      );
    }

    const unitPrice = matchedProduct.discountPrice || matchedProduct.price;
    calculatedSubtotal += unitPrice * clientItem.quantity;

    validatedOrderItems.push({
      product: matchedProduct._id,
      title: matchedProduct.title,
      quantity: clientItem.quantity,
      price: unitPrice,
      image: matchedProduct.images[0]?.url || '',
    });

    // Build Stripe Line Item (Stripe takes cents)
    lineItems.push({
      price_data: {
        currency: 'usd',
        unit_amount: Math.round(unitPrice * 100),
        product_data: {
          name: matchedProduct.title,
          description: matchedProduct.subtitle,
          images: matchedProduct.images.length > 0 ? [matchedProduct.images[0].url] : [],
        },
      },
      quantity: clientItem.quantity,
    });
  }

  const shippingPrice = calculatedSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 8.0;
  const totalPrice = calculatedSubtotal + shippingPrice;

  // 2. Persist Pending Order to Database
  const pendingOrder = await Order.create({
    user: req.user._id,
    orderItems: validatedOrderItems,
    shippingAddress,
    itemsPrice: calculatedSubtotal,
    shippingPrice,
    totalPrice,
  });

  // 3. Create Stripe Checkout Session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: req.user.email,
    client_reference_id: pendingOrder._id.toString(),
    line_items: lineItems,
    shipping_options: [
      {
        shipping_rate_data: {
          type: 'fixed_amount',
          fixed_amount: { amount: Math.round(shippingPrice * 100), currency: 'usd' },
          display_name: shippingPrice === 0 ? 'Complimentary Botanical Delivery' : 'Standard Carbon-Neutral Delivery',
        },
      },
    ],
    success_url: `${process.env.CLIENT_URL}/order-success?orderId=${pendingOrder._id}`,
    cancel_url: `${process.env.CLIENT_URL}/checkout-cancelled`,
  });

  res.status(200).json({
    status: 'success',
    sessionId: session.id,
    url: session.url,
  });
});

// @desc    Stripe Webhook Listener (Atomic stock decrement & order completion)
// @route   POST /api/v1/orders/webhook
export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Cryptographic validation of Stripe payload
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error(`[Webhook Verification Error]: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle successful payment event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = session.client_reference_id;

    try {
      const order = await Order.findById(orderId);
      if (!order || order.isPaid) {
        return res.status(200).json({ received: true });
      }

      // 1. Atomic Stock Decrement with Race-Condition Guard
      for (const item of order.orderItems) {
        const updated = await Product.findOneAndUpdate(
          {
            _id: item.product,
            stockCount: { $gte: item.quantity }, // Prevent negative inventory
          },
          { $inc: { stockCount: -item.quantity } }
        );

        if (!updated) {
          console.error(`[CRITICAL INVENTORY RACE]: Stock depleted for item ${item.product}`);
        }
      }

      // 2. Mark Order Paid
      order.isPaid = true;
      order.paidAt = Date.now();
      order.orderStatus = 'processing';
      order.paymentResult = {
        id: session.payment_intent,
        status: session.payment_status,
        email_address: session.customer_email,
      };
      await order.save();

      // 3. Dispatch Invoice Email (Non-blocking worker)
      const user = await User.findById(order.user);
      if (user) {
        new EmailService(user).sendOrderReceipt(order).catch((err) => {
          console.error('[Invoice Email Failed]:', err.message);
        });
      }

      console.log(`[Order Paid & Finalized]: Order #${order._id}`);
    } catch (dbErr) {
      console.error('[Webhook Processing Exception]:', dbErr);
      return res.status(500).json({ error: 'Failed to process order persistence' });
    }
  }

  res.status(200).json({ received: true });
};



// @desc    Get order details by ID
// @route   GET /api/v1/orders/:id
export const getOrderById = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (!order) {
    return next(new ApiError('Order not found with this identifier', 404));
  }

  // IDOR Protection: Verify requesting user is owner or admin
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new ApiError('Not authorized to access this order record', 403));
  }

  res.status(200).json({
    status: 'success',
    data: { order },
  });
});