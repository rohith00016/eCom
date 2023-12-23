// ProductDetail.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import '../styles/ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (!id) {
          console.error('Product ID not found in useParams');
          setLoading(false);
          return;
        }

        const response = await axios.get(`http://localhost:3000/products/getItem/${id}`);
        setProduct(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching product details:', error);
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  return (
    <div className="product-detail-container">
      {loading ? (
        <p>Loading...</p>
      ) : product ? (
        <div className="product-detail">
          <h2>{product.name}</h2>
          {product.image_url && <img src={product.image_url} alt={product.name} className="product-image" />}
          <p>Description: {product.description}</p>
          <p>Price: ${product.price}</p>
          {/* Add more details as needed */}
        </div>
      ) : (
        <p>Product not found</p>
      )}
    </div>
  );
};

export default ProductDetail;
