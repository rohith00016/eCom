const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
  },
  products: [
    {
      product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', // Reference to the Product model
      },
      quantity: Number,
      price: Number,
      subtotal: Number, // You can add the subtotal field if needed
    },
  ],
  total_amount: Number, // Corrected the field name
  order_date: Date,
  status: String,
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
