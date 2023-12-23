import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/ProductList.css';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceMin, setPriceMin] = useState(null);
  const [priceMax, setPriceMax] = useState(null);
  const [sortBy, setSortBy] = useState('newest');
  const [results, setResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const performSearch = async () => {
    try {
      setSearchLoading(true);
      setSearchError(null);

      console.log('Search parameters:', { searchQuery, priceMin, priceMax, sortBy });

      // Check if any search parameters are provided
      const hasSearchParams = searchQuery || priceMin !== null || priceMax !== null || sortBy !== 'newest';

      const response = await axios.get('http://localhost:3000/products/getItems/search', {
        params: hasSearchParams
          ? {
              q: searchQuery,
              priceMin: priceMin !== null ? priceMin : undefined,
              priceMax: priceMax !== null ? priceMax : undefined,
              sortBy,
            }
          : {},
      });

      setResults(response.data.results);
    } catch (error) {
      console.error(error);
      setSearchError('Failed to perform the search.');
    } finally {
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:3000/products/getItems');
        setProducts(response.data);
        setResults(response.data); // Initialize results with all products
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleSearch = () => {
    performSearch();
  };

  return (
    <div className="product-list-container">
      <h2>Product List</h2>

      {/* Search Input */}
      <input
        type="text"
        placeholder="Search products..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {/* Price Range Filters */}
      <label>
        Min Price:
        <input
          type="range"
          min="0"
          max="100"
          value={priceMin !== null ? priceMin : ''}
          onChange={(e) => setPriceMin(e.target.value === '' ? null : parseInt(e.target.value, 10))}
        />
        {priceMin !== null && <span>${priceMin}</span>}
      </label>
      <label>
        Max Price:
        <input
          type="range"
          min="0"
          max="100"
          value={priceMax !== null ? priceMax : ''}
          onChange={(e) => setPriceMax(e.target.value === '' ? null : parseInt(e.target.value, 10))}
        />
        {priceMax !== null && <span>${priceMax}</span>}
      </label>

      {/* Sorting Options */}
      <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
        <option value="newest">Newest</option>
        {/* Add more sorting options as needed */}
      </select>

      {/* Search Button */}
      <button onClick={handleSearch}>Search</button>

      {/* Display loading spinner or error message if loading or error state is true */}
      {searchLoading && <p>Loading search results...</p>}
      {searchError && <p>{searchError}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul className="product-list">
          {results.map((product) => (
            <li key={product._id} className="product-item">
              <Link to={`/product/${product._id}`}>
                {product.image_url && (
                  <img src={product.image_url} alt={product.name} className="product-image" />
                )}
                <div className="product-details">
                  <h3>{product.name}</h3>
                  <p>Price: ${product.price}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ProductList;
