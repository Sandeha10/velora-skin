import { Product } from '../models/product.model.js';
import { APIFeatures } from '../utils/apiFeatures.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// @desc    Get all catalog products with dynamic facets & pagination
// @route   GET /api/v1/products
export const getAllProducts = asyncHandler(async (req, res, next) => {
  // Execute Features Pipeline
  const features = new APIFeatures(Product.find(), req.query)
    .filter()
    .search()
    .sort()
    .limitFields()
    .paginate();

  const products = await features.query;

  // Metadata for client pagination UI
  const totalCount = await Product.countDocuments();

  res.status(200).json({
    status: 'success',
    results: products.length,
    totalRecords: totalCount,
    data: { products },
  });
});

// @desc    Get single product by unique slug
// @route   GET /api/v1/products/:slug
export const getProductBySlug = asyncHandler(async (req, res, next) => {
  const product = await Product.findOne({ slug: req.params.slug });

  if (!product) {
    return next(new ApiError('Product not found with this identifier', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { product },
  });
});

// @desc    Create new product formulation (Admin Only)
// @route   POST /api/v1/products
export const createProduct = asyncHandler(async (req, res, next) => {
  const newProduct = await Product.create(req.body);

  res.status(201).json({
    status: 'success',
    data: { product: newProduct },
  });
});