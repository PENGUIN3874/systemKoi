import "./header.scss";
import { Link, useNavigate } from "react-router-dom";
import koi from "../../img/logo.png.jpg";
import { useState, useEffect } from "react";
import { Button } from "antd";
import { MenuOutlined } from "@ant-design/icons";

function Header() {
  const [visible, setVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true); // Logged in
    } else {
      setIsLoggedIn(false); // Not logged in
    }
  }, []);

  const handleMenu = () => {
    setVisible(true);
  };

  const handleClose = () => {
    setVisible(false);
  };

  const handleLogout = () => {
    // Remove token and user info from localStorage when logging out
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    navigate("/login");
  };

  return (
    <>
      <div className="header">
        <div className="header__logo">
          <img src={koi} alt="Koi" width={80} />
          <h2>Royal Koi</h2>
        </div>

        <div className="header__nav">
          <Link to="/" className="nav__news">
            Home
          </Link>
          <Link to="/news" className="nav__news">
            Blog and News
          </Link>
          <Link to="/cart" className="nav__news">
            Cart
          </Link>
          <Link to="/yourorder" className="nav__news">
            Your orders
          </Link>
          {isLoggedIn ? (
            <Link to="/profile" className="nav__profile">
              Profile
            </Link>
          ) : (
            <>
              <Link to="/login" className="nav__login">
                Login
              </Link>
            </>
          )}

          <span className="nav__menu">
            <Button onClick={handleMenu}>
              <MenuOutlined />
            </Button>
          </span>
        </div>
      </div>

      {visible && <div className="overlay" onClick={handleClose}></div>}

      <div className={`sidebar ${visible ? "active" : ""}`}>
        <a href="#" className="closebtn" onClick={handleClose}>
          ×
        </a>
        <Link to="/mykoi" className="nav__news">
          My Koi Fish
        </Link>
        <Link to="/environment" className="nav__news">
          Environment Monitor
        </Link>
        <Link to="/food" className="nav__news">
          Food Calculator
        </Link>
        <Link to="/salt" className="nav__news">
          Salt Calculator
        </Link>
        <Link to="/contact" className="nav__news">
          Contact Us
        </Link>
        {isLoggedIn && (
          <Link onClick={handleLogout} className="nav__logout">
            Logout
          </Link>
        )}
      </div>
    </>
  );
}

export default Header;
