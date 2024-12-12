import { useParams } from "react-router-dom";
import "./detail.scss";
import React, { useState, useEffect } from 'react';
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import bg from '../../img/news.jpg';
import { Button } from "antd";

function Detail() {
    const { id } = useParams();  // Get productId from the route parameter
    const [product, setProduct] = useState(null);  // State to hold the fetched product
    const [count, setCount] = useState(1);

    // Fetch product details from API using productId
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await fetch('https://koicaresystemapi.azurewebsites.net/api/Product/get-all');
                const data = await response.json();
                const products = data?.product?.$values || [];

                // Find the specific product by id
                const foundProduct = products.find(pro => pro.productId === parseInt(id, 10));
                if (foundProduct) {
                    setProduct(foundProduct);
                } else {
                    console.error("Product not found");
                }
            } catch (error) {
                console.error("Error fetching product details:", error);
            }
        };
        
        fetchProduct();
    }, [id]);

    const totalPrice = product ? (product.price * count).toLocaleString("vi-VN") : '';

    const handleMinion = () => {
        setCount(prevCount => (prevCount > 1 ? prevCount - 1 : 1));
    };

    const handlePlus = () => {
        setCount(prevCount => prevCount + 1);
    };

    const handleChange = (e) => {
        const value = parseInt(e.target.value, 10);
        if (!isNaN(value) && value >= 1) {
            setCount(value);
        }
    };

    return (
        <>
            <Header />
            <div className="detail__img">
                <img src={bg} alt="" />
            </div>
            <br />
            <div className="detail__title">
                <h1>Information of product</h1>
            </div>

            <div className="detail__divider"></div>

            {product ? (
                <div className="row detailPage__product">
                    <div className="col-md-6 detailPage__left">
                        <img src={product.image} alt={product.name} />
                    </div>

                    <div className="col-md-6 detailPage__right">
                        <br />
                        <h1>{product.name}</h1>
                        <b><p>{product.productInfo}</p></b>
                        <b>Category: <p>{product.category}</p></b>
                        <b>Stock: <p>{product.stock}</p></b>
                        <div className="modal-promotions">
                            <ul>
                                <li>Genuine product commitment</li>
                                <li>Cash on Delivery</li>
                            </ul>
                        </div>
                        <div className="detail__quantity">
                            <p onClick={handleMinion} style={{ cursor: 'pointer' }}>-</p>
                            <input type="text" value={count} onChange={handleChange} style={{ textAlign: "center" }} />
                            <p onClick={handlePlus} style={{ cursor: 'pointer' }}>+</p>
                        </div>
                        {/* Display formatted total price */}
                        <h3>Total Price: {totalPrice}.000 VND</h3>

                        <Button type="secondary">Check out</Button>
                    </div>
                </div>
            ) : (
                <p>Loading product details...</p>
            )}
            <Footer />
        </>
    );
}

export default Detail;
