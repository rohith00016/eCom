const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const middleware = require('../middleware/index');

// Create a new product
router.post('/addItem', middleware.ensureAdminLoggedIn, async (req, res) => {
  try {
    const product = new Product(req.body);
    const savedProduct = await product.save();
    res.status(201).json(savedProduct); // Use status 201 for resource creation
  } catch (error) {
    res.status(500).json({ error: 'Failed to create the product.' });
  }
});

// Get a list of all products
router.get('/getItems', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products.' });
  }
});

// Get a specific product by ID
router.get('/getItem/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch the product.' });
  }
});

// Combined search route
router.get('/getItems/search', async (req, res) => {
  try {
    const query = req.query.q;
    const priceMin = parseFloat(req.query.priceMin) || 0;
    const priceMax = parseFloat(req.query.priceMax) || Number.MAX_VALUE;

    let filter = {};

    if (query) {
      // If a query is provided, use a regular expression for case-insensitive search
      const regex = new RegExp(query, 'i');
      filter.name = regex;
    }

    filter.price = { $gte: priceMin, $lte: priceMax };

    let sortOption = {};

    const sortBy = req.query.sortBy;
    if (sortBy === 'newest') {
      // Sort by newest first
      sortOption = { date_added: -1 };
    }

    // Use the filter and sort options to perform the search
    const results = await Product.find(filter).sort(sortOption);

    res.json({ success: true, results });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to perform the search.' });
  }
});


// Update a product by ID
router.put('/updateItem/:id', middleware.ensureAdminLoggedIn, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update the product.' });
  }
});

// Delete a product by ID
router.delete('/delItem/:id', middleware.ensureAdminLoggedIn, async (req, res) => {
  try {
    const product = await Product.findByIdAndRemove(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete the product.' });
  }
});

module.exports = router;
