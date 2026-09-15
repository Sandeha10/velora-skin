import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { Product } from '../models/product.model.js';

const botanicalProducts = [
  {
    title: 'Cellular Renewal Nectar',
    subtitle: 'Bio-Fermented Squalane & Blue Tansy Restorative Concentrate',
    description:
      'A nocturnal lipid concentrate infused with cold-pressed Moroccan Blue Tansy and sugarcane squalane to reduce inflammation and accelerate cellular renewal while you sleep.',
    price: 88,
    category: 'oils',
    skinType: ['dry', 'sensitive', 'mature'],
    volume: '30ml / 1.0 fl. oz.',
    ingredients: [
      'Squalane (Olive Derived)',
      'Tanacetum Annuum (Blue Tansy) Flower Oil',
      'Camellia Japonica Seed Oil',
      'Tocopherol (Vitamin E)',
    ],
    ritualGuide:
      'Warm 3 to 4 drops between palms. Inhale aromatic notes deeply before gently pressing onto cleansed skin.',
    stockCount: 45,
    isFeatured: true,
    ratingsAverage: 4.9,
    ratingsQuantity: 38,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1608248597359-00995c73d9d3?auto=format&fit=crop&q=80&w=1200',
        alt: 'Cellular Renewal Nectar dropper bottle against warm stone',
        isPrimary: true,
      },
    ],
  },
  {
    title: 'Hydrosol Mist of Damask Rose',
    subtitle: 'Steam-Distilled Rosewater & Tremella Hyaluronic Barrier Infusion',
    description:
      'Hand-harvested Damask rose petals distilled into pure hydrosol, fortified with silver ear mushroom to flood dermal layers with weightless hydration.',
    price: 46,
    category: 'toners',
    skinType: ['all', 'dry', 'sensitive'],
    volume: '100ml / 3.4 fl. oz.',
    ingredients: [
      'Rosa Damascena Flower Water',
      'Tremella Fuciformis Extract',
      'Aloe Barbadensis Leaf Juice',
      'Sodium PCA',
    ],
    ritualGuide:
      'Mist liberally over face and décolletage post-cleanse or throughout the day to re-establish hydration.',
    stockCount: 80,
    isFeatured: true,
    ratingsAverage: 4.8,
    ratingsQuantity: 52,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&q=80&w=1200',
        alt: 'Hydrosol Mist bottle showing fine mist dispersion',
        isPrimary: true,
      },
    ],
  },
  {
    title: 'Resurfacing Enzymatic Cleanser',
    subtitle: 'Papaya Enzyme, White Willow Bark & Green Clay Emulsion',
    description:
      'A gentle non-stripping gel cleanser that dissolves impurities through enzymatic action while soothing with French green clay.',
    price: 42,
    category: 'cleansers',
    skinType: ['oily', 'combination', 'all'],
    volume: '150ml / 5.1 fl. oz.',
    ingredients: [
      'Camellia Sinensis Leaf Water',
      'Carica Papaya Fruit Extract',
      'Salix Alba (Willow) Bark Extract',
      'Montmorillonite (French Green Clay)',
    ],
    ritualGuide:
      'Massage two pumps onto damp skin for 60 seconds in circular motions. Rinse with lukewarm water.',
    stockCount: 65,
    isFeatured: false,
    ratingsAverage: 4.7,
    ratingsQuantity: 24,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=1200',
        alt: 'Resurfacing Enzymatic Cleanser amber glass pump',
        isPrimary: true,
      },
    ],
  },
  {
    title: 'Phyto-Retinol Bakuchiol Creme',
    subtitle: '2% Bakuchiol, Wild Rock Rose & Peptide Barrier Complex',
    description:
      'A plant-derived retinol alternative delivering smoothing and firming benefits without irritation or photosensitivity.',
    price: 94,
    discountPrice: 82,
    category: 'creams',
    skinType: ['mature', 'dry', 'sensitive'],
    volume: '50ml / 1.7 fl. oz.',
    ingredients: [
      'Betula Alba (Birch) Juice',
      'Bakuchiol',
      'Palmitoyl Tripeptide-5',
      'Cistus Ladaniferus (Rock Rose) Extract',
    ],
    ritualGuide:
      'Smooth a pea-sized amount onto face and neck using upward strokes as the final step of your evening ritual.',
    stockCount: 30,
    isFeatured: true,
    ratingsAverage: 5.0,
    ratingsQuantity: 19,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=1200',
        alt: 'Phyto-Retinol cream in heavy glass jar on linen background',
        isPrimary: true,
      },
    ],
  },
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('[Seed] Database connected successfully.');

    // Clear existing products
    await Product.deleteMany();
    console.log('[Seed] Cleared existing product collection.');

    // Insert botanical products
    await Product.create(botanicalProducts);
    console.log(`[Seed] Successfully seeded ${botanicalProducts.length} Velora Skin formulations.`);

    process.exit(0);
  } catch (error) {
    console.error(`[Seed Error]: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();