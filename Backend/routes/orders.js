const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const middleware = require('../middleware/index');

// Create a new order
router.post('/addOrder', middleware.ensureCustomerLoggedIn, async (req, res) => {
  try {
    const { user_id, products } = req.body;

    // Validate the data
    if (!user_id || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: 'Invalid request data. Please provide user_id and products array.' });
    }

    // Calculate subtotals and total_amount
    const orderProducts = products.map(product => ({
      product_id: product.product_id,
      quantity: product.quantity,
      price: product.price,
      subtotal: product.quantity * product.price,
    }));

    // Calculate the total amount by summing the subtotals
    const total_amount = orderProducts.reduce((total, product) => total + product.subtotal, 0);

    // Create the order
    const order = new Order({
      user_id,
      products: orderProducts,
      total_amount,
      order_date: new Date(), // Set the order date to the current date
      status: 'Pending', // Set the initial status here
    });

    // Save the order to the database
    const savedOrder = await order.save();
    res.status(201).json(savedOrder); // Use status 201 for resource creation
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ error: 'Failed to create the order.' });
  }
});

// Get a list of all orders
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ error: 'Failed to fetch orders.' });
  }
});

// Get all orders of a specific user
router.get('/user/:userId', middleware.ensureCustomerLoggedIn, async (req, res) => {
  try {
    const userId = req.params.userId;

    // Validate the user_id
    if (!userId) {
      return res.status(400).json({ error: 'Invalid user ID.' });
    }

    // Fetch all orders of the specific user
    const userOrders = await Order.find({ user_id: userId });

    res.json(userOrders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch user orders.' });
  }
});

// Get a specific order by ID
router.get('/:id', middleware.ensureCustomerLoggedIn, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }
    res.json(order);
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ error: 'Failed to fetch the order.' });
  }
});

module.exports = router;
