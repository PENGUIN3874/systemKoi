import Carousel from "../../components/carousel/carousel";
import Header from "../../components/header/header";
import "./home.scss";
import { Button, Modal } from "antd";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Footer from "../../components/footer/footer";
import cakoi from "../../img/cakoi.png.jpg";
import axios from "axios";
import { Listproduct } from "../../share/listproduct";
function HomePage() {
  const [notification, setNotification] = useState(false);
  const [cartItems, setCartItems] = useState(() => {
    const storedCart = localStorage.getItem("cartItems");
    return storedCart ? JSON.parse(storedCart) : [];
  });

  const [visible, setVisible] = useState(false);
  const [pro, setPro] = useState([]);
  const [num, setNum] = useState(1);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(
          "https://koicaresystemapi.azurewebsites.net/api/Product/get-all"
        );
        const data = await response.json();
        const productList = data?.product?.$values || [];

        // Kết hợp dữ liệu với Listproduct để lấy hình ảnh
        const combinedProducts = productList.slice(0, 4).map((product) => {
          const matchedProduct = Listproduct.find(
            (p) => p.Id === String(product.productId)
          );
          return {
            ...product,
            image: matchedProduct ? matchedProduct.Image : "/default-image.jpg", // Sử dụng hình ảnh từ Listproduct nếu có, nếu không thì dùng ảnh mặc định
          };
        });

        setProducts(combinedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  // const addToCart = () => {
  //   const productToAdd = { ...pro, quantity: num };
  //   setCartItems([...cartItems, productToAdd]);
  // setVisible(false);
  // setNotification(true);
  //   console.log("Product to add:", productToAdd);

  // setTimeout(() => {
  //   setNotification(false);
  // }, 3000);
  // };

  const addToCart = async () => {
    const accId = localStorage.getItem("userId");

    const cart = await axios.get(
      `https://koicaresystemapi.azurewebsites.net/api/Show-All-Carts-From-User/${accId}`
    );
    localStorage.setItem(
      "cart",
      JSON.stringify(cart.data.listUserCart.$values)
    );
    console.log("Cart" + localStorage.getItem("cart"));
    const number = localStorage.getItem("cart");

    let parsedCart = [];
    if (number) {
      try {
        parsedCart = JSON.parse(number);
      } catch (error) {
        console.error("Lỗi khi parse dữ liệu từ localStorage:", error);
      }
    }
    const value = {
      AccId: parseInt(accId),
      ProductId: pro.productId,
      Quantity: num,
    };

    const exists =
      Array.isArray(parsedCart) &&
      parsedCart.some((item) => item.productId === value.ProductId);

    let update;
    let add;
    if (exists) {
      console.log("Giá trị đã tồn tại trong giỏ hàng.");
      update = await axios.put(
        `https://koicaresystemapi.azurewebsites.net/api/Update-Cart-Quantity?AccId=${value.AccId}&ProductId=${value.ProductId}&Quantity=${value.Quantity}`
      );
    } else {
      console.log("Giá trị chưa có trong giỏ hàng.");
      add = await axios.post(
        `https://koicaresystemapi.azurewebsites.net/api/Add-Carts-For-User?AccId=${value.AccId}&ProductId=${value.ProductId}&Quantity=${value.Quantity}`
      );
    }
    setVisible(false);
    setVisible(false);
    setNotification(true);
    setTimeout(() => {
      setNotification(false);
    }, 3000);
    if ((update && update.status === 200) || (add && add.status === 201)) {
      console.log("Sản phẩm đã được gửi lên API thành công.");
    } else {
      console.log("Lỗi khi gửi sản phẩm lên API.");
    }
  };

  const handleOpen = (values) => {
    setVisible(true);
    setPro(values);
  };

  const Ok = () => {
    setVisible(false);
  };

  const handleCancle = () => {
    setVisible(false);
  };

  const handleNumbePlus = () => {
    setNum(num + 1);
  };

  const handleNumbeMinus = () => {
    if (num <= 1) {
      setNum(1);
    } else {
      setNum(num - 1);
    }
  };

  return (
    <div>
      <Header />
      <Carousel numberOfSlide={1} autoplay={true} />

      <div className="HomePage">
        <br />
        <div className="row HomePage__Introduce">
          <div className="col-md-6 HomPage__left">
            <img src={cakoi} alt="" width="90%" />
          </div>
          <div className="col-md-6 HomPage__right">
            <h1>Royal Koi</h1>
            <div className="border"></div>
            <p>
              Is a web-app that helps users proactively manage and provide the
              best assessments so that users can take good care of Koi fish.
            </p>
            <p>
              In addition, we also provide products that help users take the
              best care of Koi fish from fish care accessories from leading
              countries in the world such as the US, Japan,... and foods that
              help increase color and size come from the US, Vietnam,... with
              the aim of supporting users in managing Koi fish ponds at home.
            </p>
          </div>
        </div>
        <br />
        <br />

        <div className="HomePage__body__product">
          <h1>Product</h1>
        </div>
        <div className="HomePage__body__divider"></div>

        <div className="row HomePage__body">
          {products.map((product) => (
            <div className="col-md-3 koi" key={product.productId}>
              <img src={product.image} alt={product.name} />{" "}
              {/* Sử dụng hình ảnh từ Listproduct */}
              <br />
              <Button type="secondary" onClick={() => handleOpen(product)}>
                View product
              </Button>
            </div>
          ))}
        </div>

        <div className="HomePage__viewmore">
          <Link to="/viewproduct">View More [+]</Link>
        </div>

        {notification && <div className="notification">Add successfully!</div>}

        <Modal open={visible} onCancel={handleCancle} onOk={Ok} footer={null}>
          <div className="modal-content">
            <div className="modal-image">
              <img src={pro.image} alt={pro.name} />
            </div>
            <div className="modal-details">
              <h3>{pro.name}</h3>
              <span className="modal-sku">Product code: {pro.productId}</span>
              <span className="modal-stock">Status: Available </span>
              <h5 className="modal-price">Price: {pro.price}.000 VND</h5>
              <div className="modal-promotions">
                <li>
                  <i className="confirm bi bi-check-circle-fill"></i> Genuine
                  product commitment
                </li>
                <li>
                  <i className="confirm bi bi-check-circle-fill"></i> Cash on
                  Delivery
                </li>
              </div>
              <div className="Viewproduct__buy">
                <h5>Quantity: </h5>
                <p style={{ cursor: "pointer" }} onClick={handleNumbeMinus}>
                  -
                </p>
                <input type="text" value={num} readOnly />
                <p style={{ cursor: "pointer" }} onClick={handleNumbePlus}>
                  +
                </p>
              </div>
              <div className="modal-actions">
                {/* <Link type="secondary" to={`/detail/${pro.productId}`}>
                  BUY NOW
                </Link> */}
                <Button className="modal-add-cart" onClick={addToCart}>
                  ADD TO CART
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      </div>
      <Footer />
    </div>
  );
}

export default HomePage;
