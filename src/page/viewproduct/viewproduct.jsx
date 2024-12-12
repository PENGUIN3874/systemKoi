import { useState, useEffect } from "react";
import "./viewproduct.scss";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import bg from "../../img/news.jpg";
import { Button, Input, Modal } from "antd";
import axios from "axios";
import { Listproduct } from "../../share/listproduct";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
function Viewproduct() {
  const [visible, setVisible] = useState(false);
  const [pro, setPro] = useState({});
  const [num, setNum] = useState(1);
  const [search, setSearch] = useState("");
  const [store, setStore] = useState([]);
  const [filteredStore, setFilteredStore] = useState([]);
  const [notification, setNotification] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(
          "https://koicaresystemapi.azurewebsites.net/api/Product/get-all"
        );
        const data = await response.json();
        if (data && data.product && data.product.$values) {
          const productsFromAPI = data.product.$values;

          const combinedProducts = productsFromAPI.map((product) => {
            const matchedProduct = Listproduct.find(
              (p) => p.Id === String(product.productId)
            );
            return {
              ...product,
              image: matchedProduct
                ? matchedProduct.Image
                : "/default-image.jpg",
            };
          });

          setStore(combinedProducts);
          setFilteredStore(combinedProducts);

          // Lưu danh sách sản phẩm có hình ảnh vào localStorage
          localStorage.setItem(
            "productStore",
            JSON.stringify(combinedProducts)
          );
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  const handleOpen = (product) => {
    setVisible(true);
    setPro(product);
  };

  const handleCancel = () => {
    setVisible(false);
    setNum(1);
  };

  const handleNumPlus = () => {
    setNum(num + 1);
  };

  const handleNumMinus = () => {
    if (num > 1) {
      setNum(num - 1);
    }
  };

  const handleSearch = () => {
    if (search.trim() === "") {
      setFilteredStore(store);
    } else {
      const filtered = store.filter((product) =>
        product.name.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredStore(filtered);
    }
    setSearch("");
  };

  const handleQuantity = async () => {
    const accId = localStorage.getItem("userId");

    const cart = await axios.get(
      `https://koicaresystemapi.azurewebsites.net/api/Show-All-Carts-From-User/${accId}`
    );
    if (cart.status === 404) {
      localStorage.setItem("cart", []);
    } else {
      localStorage.setItem(
        "cart",
        JSON.stringify(cart.data.listUserCart.$values)
      );
    }

    console.log("Cart" + localStorage.getItem("cart"));
    const number = localStorage.getItem("cart");

    // Kiểm tra nếu 'cart' tồn tại trong localStorage
    let parsedCart = [];
    if (number) {
      try {
        parsedCart = JSON.parse(number); // Chuyển chuỗi JSON về mảng
      } catch (error) {
        console.error("Lỗi khi parse dữ liệu từ localStorage:", error);
      }
    }
    const value = {
      AccId: parseInt(accId), // Lấy accId từ localStorage và chuyển sang số
      ProductId: pro.productId,
      Quantity: num,
    };

    // Kiểm tra nếu mảng parsedCart tồn tại sản phẩm với ProductId
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

    if ((update && update.status === 200) || (add && add.status === 201)) {
      console.log("Sản phẩm đã được gửi lên API thành công.");
    } else {
      console.log("Lỗi khi gửi sản phẩm lên API.");
    }
    setVisible(false);
    setNum(1);
    setNotification(true);
    setTimeout(() => {
      setNotification(false);
    }, 1000);
  };

  return (
    <>
      <Header />
      <div className="Viewproduct__img">
        <img src={bg} alt="" />
      </div>
      <div className="Viewproduct__title">
        <h3>List of Products</h3>
      </div>
      <div className="Viewproduct__search">
        <Input
          placeholder="Search Product"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button type="secondary" onClick={handleSearch}>
          Search
        </Button>
      </div>
      <ArrowBackIcon />
      <div className="row Viewproduct__product">
        {filteredStore.map((product) => (
          <div className="col-md-3 product" key={product.productId}>
            <img src={product.image} alt={product.name} />{" "}
            <Button type="secondary" onClick={() => handleOpen(product)}>
              View Product
            </Button>
          </div>
        ))}
      </div>
      {notification && <div className="notification">Added successfully!</div>}
      <Modal open={visible} onCancel={handleCancel} footer={null}>
        <div className="modal-content">
          <div className="modal-image">
            <img src={pro.image} alt={pro.name} />
          </div>
          <div className="modal-details">
            <h3>{pro.name}</h3>
            <span className="modal-sku">Product code: {pro.productId}</span>
            <p>{pro.productInfo}</p>
            <p>Status: Available</p>
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

            <h5 className="modal-price">Price: {pro.price}.000 VND</h5>

            <div className="Viewproduct__buy">
              <h5>Quantity: </h5>
              <p style={{ cursor: "pointer" }} onClick={handleNumMinus}>
                -
              </p>
              <input type="text" value={num} readOnly />
              <p style={{ cursor: "pointer" }} onClick={handleNumPlus}>
                +
              </p>
            </div>

            <div className="modal-actions">
              {/* <Link to={`/detail/${pro.productId}`}>BUY NOW</Link> */}
              <Button className="modal-add-cart" onClick={handleQuantity}>
                ADD TO CART
              </Button>
            </div>
          </div>
        </div>
      </Modal>
      <Footer />
    </>
  );
}

export default Viewproduct;
