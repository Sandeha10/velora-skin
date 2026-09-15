import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'A botanical product must have a name'],
      trim: true,
      maxlength: [100, 'Product name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    subtitle: {
      type: String,
      required: [true, 'Product must have a descriptive botanical subtitle'],
      trim: true,
      maxlength: [120, 'Subtitle cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Product formulation description is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Product must have a retail price'],
      min: [0, 'Price cannot be negative'],
    },
    discountPrice: {
      type: Number,
      validate: {
        validator: function (val) {
          // 'this' refers to current doc ONLY on new document creation
          return !val || val < this.price;
        },
        message: 'Discount price ({VALUE}) must be less than the regular price',
      },
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ['cleansers', 'toners', 'serums', 'creams', 'masks', 'oils'],
        message: '{VALUE} is not a supported catalog category',
      },
      lowercase: true,
      index: true,
    },
    skinType: [
      {
        type: String,
        enum: ['all', 'dry', 'oily', 'sensitive', 'combination', 'mature'],
        lowercase: true,
      },
    ],
    volume: {
      type: String, // e.g., "50ml / 1.7 fl. oz."
      required: [true, 'Net volume is required'],
    },
    ingredients: [
      {
        type: String,
        trim: true,
      },
    ],
    ritualGuide: {
      type: String, // Application instructions
      required: [true, 'Ritual / usage instructions are required'],
    },
    stockCount: {
      type: Number,
      required: [true, 'Stock count is required for inventory integrity'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    ratingsAverage: {
      type: Number,
      default: 5.0,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    images: [
      {
        url: { type: String, required: true },
        alt: { type: String, required: true },
        isPrimary: { type: Boolean, default: false },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//  Slug generator pre-save hook (Synchronous)
productSchema.pre('save', function () {
  if (!this.isModified('title')) return;

  this.slug = this.title
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
});

// Compound Indexing Strategy for Fast Faceted Search:
// 1. High-frequency filter combo: Category + Price Sorting
productSchema.index({ category: 1, price: 1 });

// 2. Skin Type multi-key index combined with Price
productSchema.index({ skinType: 1, price: 1 });

// 3. Text Search Index across Title, Subtitle, and Ingredients
productSchema.index({
  title: 'text',
  subtitle: 'text',
  ingredients: 'text',
});

export const Product = mongoose.model('Product', productSchema);