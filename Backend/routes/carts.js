const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Product = require('../models/product');
const middleware = require('../middleware/index');

// Add a product to the user's cart
router.post('/add-to-cart', middleware.ensureCustomerLoggedIn, async (req, res) => {
  try {
    const { user_id, product_id, quantity } = req.body;

    // Validate the data
    if (!user_id || !product_id || isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({ error: 'Invalid request data.' });
    }

    // Use findByIdAndUpdate with $addToSet to add the product to the cart
    await User.findByIdAndUpdate(
      user_id,
      {
        $addToSet: {
          cart: { product_id: product_id, quantity: quantity },
        },
      },
      { new: true }
    );

    res.json({ message: 'Product added to the cart.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add the product to the cart.' });
  }
});

// Add a rating and review for a product
router.post('/add-review', middleware.ensureCustomerLoggedIn, async (req, res) => {
  try {
    const { user_id, product_id, rating, comment } = req.body;

    // Validate the data
    if (!user_id || !product_id || !rating || !comment) {
      return res.status(400).json({ error: 'Invalid request data.' });
    }

    // Use findByIdAndUpdate with $push to add the review to the product
    await Product.findByIdAndUpdate(
      product_id,
      {
        $push: {
          reviews: {
            user: user_id,
            rating: rating,
            comment: comment,
          },
        },
      },
      { new: true }
    );

    res.json({ message: 'Rating and review added for the product.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add the rating and review.' });
  }
});

module.exports = router;
