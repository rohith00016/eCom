// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ProductList from '../components/ProductList';
import ProductDetail from '../components/ProductDetail';

const App = () => {
  return (
    <Router>
      <div className="app-container">
        <h1>Your Online Store</h1>
        <Routes>
          <Route path="/" exact component={ProductList} element = {<ProductList/>} />
          <Route path="/product/:id" component={ProductDetail} element = {<ProductDetail/>} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
