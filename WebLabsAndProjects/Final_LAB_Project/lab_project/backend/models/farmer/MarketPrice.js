import mongoose from 'mongoose';

const marketPriceSchema = new mongoose.Schema(
  {
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    crop: {
      type: String,
      required: [true, 'Crop name is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
    },
    unit: {
      type: String,
      required: [true, 'Unit is required (e.g., 40kg, Quintal)'],
      default: '40kg',
    },
    source: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    // lastUpdated will be handled by timestamps or can be set manually if needed
    // For simplicity, we'll rely on `updatedAt` from timestamps for "last updated"
  },
  {
    timestamps: true, // Adds createdAt and updatedAt (use updatedAt for "last updated")
  }
);

// Index for efficient querying by farmer and crop
marketPriceSchema.index({ farmer: 1, crop: 1 });
// Index for sorting by last updated time
marketPriceSchema.index({ farmer: 1, updatedAt: -1 });


const MarketPrice = mongoose.model('MarketPrice', marketPriceSchema);

export default MarketPrice;