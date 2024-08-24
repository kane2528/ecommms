import React, { useState, useEffect } from 'react';
import "./ListProduct.css";
import cross_icon from '../../assets/cross_icon.png';

const ListProduct = () => {

  const [allproducts, setAllProducts] = useState([]);

  const fetchInfo = async () => {
    await fetch("http://localhost:4000/allproducts")
      .then((res) => res.json())
      .then((data) => { setAllProducts(data) });
  }

  useEffect(() => {
    fetchInfo();
  }, []);

  const remove_product = async (id) => { // Pass id as a parameter
    await fetch('http://localhost:4000/removeproduct', {
      method: "POST",
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json', // 'Application/json' should be 'application/json'
      },
      body: JSON.stringify({ id: id }) // Pass id as part of the body
    });
    await fetchInfo();
  }

  return (
    <div className='list-product'>
      <h1>All product list</h1>
      <div className="listproduct-format-main">
        <p>Products</p>
        <p>Title</p>
        <p>Old Price</p>
        <p>New Price</p>
        <p>Category</p>
        <p>Remove</p>
      </div>
      <div className='listproduct-allproducts'>
        <hr />
        {allproducts.map((product, index) => (
          <div key={index} className='listproduct-format-main listproduct-format'>
            <img src={product.image} alt="" className="listproduct-product-icon" />
            <p>{product.name}</p>
            <p>${product.old_price}</p>
            <p>${product.new_price}</p>
            <p>{product.category}</p>
            {/* Pass product.id to remove_product */}
            <img id="cross" onClick={() => { remove_product(product.id) }} src={cross_icon} alt="" className='listproduct-remove-icon' />
          </div>
        ))}
      </div>
    </div>
  );
}

export default ListProduct;
