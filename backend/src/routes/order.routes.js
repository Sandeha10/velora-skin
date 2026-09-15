import express from 'express';
import { createCheckoutSession , getOrderById} from '../controllers/order.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/checkout-session', protect, createCheckoutSession);
router.get('/:id', protect, getOrderById);

export default router;