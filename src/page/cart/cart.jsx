import { useState, useEffect } from "react";
import "./cart.scss";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import bg from "../../img/news.jpg";
import { Link } from "react-router-dom";
import axios from "axios";
import { Listproduct } from "../../share/listproduct";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [notification, setNotification] = useState(false);
  const fetchCart = async () => {
    const accId = localStorage.getItem("userId");
    try {
      const response = await axios.get(
        `https://koicaresystemapi.azurewebsites.net/api/Get-All-Cart-And-Details-From-User%20(For%20display)?userID=${accId}`
      );
      // Kiểm tra nếu response.data chứa mảng cart items
      if (response.status === 200) {
        const cartItemsWithImages = response.data.$values.map((item) => {
          const matchedProduct = Listproduct.find(
            (p) => p.Id === String(item.cart.productId)
          );
          return {
            ...item,
            image: matchedProduct ? matchedProduct.Image : "/default-image.jpg", // Default image if not found
          };
        });
        setCartItems(cartItemsWithImages);
      } else {
        console.error("Unexpected response data format:", response.data);
        setCartItems([]); // Đảm bảo cartItems là mảng trống nếu dữ liệu không đúng
      }
    } catch (error) {
      console.error("Error fetching cart items:", error);
      setCartItems([]); // Xử lý lỗi bằng cách đặt cartItems là mảng trống
    }
  };

  useEffect(() => {
    fetchCart(); // Gọi fetchCart khi component mount
  }, []);

  const handleRemove = async (productId) => {
    const accId = localStorage.getItem("userId");

    try {
      const response = await axios.delete(
        `https://koicaresystemapi.azurewebsites.net/api/Delete-Items?userID=${accId}&deletePoductID=${productId}`
      );
      console.log(
        `https://koicaresystemapi.azurewebsites.net/api/Delete-Items?userID=${accId}&deletePoductID=${productId}`
      );
      if (response.status === 200) {
        // Xóa thành công, gọi lại fetchCart để cập nhật danh sách giỏ hàng
        fetchCart();
      } else {
        console.error("Error deleting product:", response);
      }
    } catch (error) {
      console.error("Error calling delete API:", error);
    }
  };

  const getTotalPrice = () => {
    return cartItems.reduce((acc, item) => {
      const price = item.cartDetails.price
        ? typeof item.cartDetails.price === "number"
          ? item.cartDetails.price
          : parseFloat(item.cartDetails.price.toString().replace(/,/g, ""))
        : 0;
      // Thêm 3 số 0 vào giá
      return acc + price * 1000;
    }, 0);
  };

  const handleCheckout = async () => {
    const accId = localStorage.getItem("userId");
    const totalAmount = getTotalPrice();

    const orderPayload = {
      userId: accId,
      items: cartItems.map((item) => ({
        productId: item.cart.productId,
        quantity: item.cart.quantity,
        price: item.cartDetails.price,
        image: item.image, // Lưu thông tin hình ảnh
        productName: item.cartDetails.productName, // Lưu tên sản phẩm
      })),
      total: totalAmount,
    };
    // Lưu thông tin đơn hàng vào localStorage
    localStorage.setItem("orderDetails", JSON.stringify(orderPayload));
    setNotification(true);
    setTimeout(() => {
      setNotification(false);
    }, 1000);

    try {
      const response = await axios.post(
        `https://koicaresystemapi.azurewebsites.net/api/Create-Order-And-Calculate-Money?accID=${accId}`,
        orderPayload
      );
      console.log(response.data);
      localStorage.setItem("OrderId", JSON.stringify(response.data.orderId));
      if (response.status === 200) {
        console.log("Order created successfully", response.data);
        localStorage.setItem("checkout", JSON.stringify(totalAmount));
      } else {
        console.error("Error creating order", response.data);
      }
    } catch (error) {
      console.error("Error in API call:", error);
    }
  };

  return (
    <>
      <Header />
      {notification && (
        <div className="notification">Checkout Successfully!</div>
      )}
      <div className="Cart__img">
        <img src={bg} alt="Background" />
      </div>
      <div className="cart__container">
        <h3>Your Cart</h3>
        {cartItems.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <>
            <div className="cart__items">
              {cartItems.map((item, index) => (
                <div className="cart__item" key={index}>
                  <img src={item.image} alt={item.name} />
                  <div className="cart__item__details">
                    <h4>{item.cartDetails.productName}</h4>
                    {console.log(item.cart.productId)}
                    <p>Quantity: {item.cart.quantity}</p>
                    <p>Price: {item.cartDetails.price}.000 VND</p>
                  </div>
                  <button
                    className="button_delete"
                    onClick={() => handleRemove(item.cart.productId)}
                  >
                    <i className="bi bi-archive"></i>
                  </button>
                </div>
              ))}
            </div>
            <div className="cart__summary">
              <span>Total:</span>
              <span>
                {getTotalPrice()
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                VND
              </span>
            </div>
            <Link to="/viewproduct">Continue shopping</Link>
            <div className="cart__checkout">
              <Link to={"/payment"} onClick={handleCheckout}>
                Checkout
              </Link>
            </div>
          </>
        )}
      </div>
      <Footer />
    </>
  );
}

export default Cart;
