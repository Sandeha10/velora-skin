import express from 'express';
import {
  getAllProducts,
  getProductBySlug,
  createProduct,
} from '../controllers/product.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';

const router = express.Router();

router
  .route('/')
  .get(getAllProducts)
  .post(protect, restrictTo('admin'), createProduct);

router.route('/:slug').get(getProductBySlug);

export default router;