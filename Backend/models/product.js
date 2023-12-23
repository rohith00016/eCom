const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
  category: String,
  price: Number,
  quantity: Number,
  image_url: String,
  is_organic: Boolean,
  manufacturer: String,
  ingredients: [String],
  reviews: [
    {
      user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
      },
      rating: Number,
      comment: String,
      date: Date,
    },
  ],
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
