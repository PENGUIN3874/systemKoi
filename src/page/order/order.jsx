import { Button, Result } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

function OrderSuccess() {
  return (
    <div className="payment-success-container">
      <div className="sparkling-background"></div>

      <div className="payment-success-card">
        <Result
          icon={
            <CheckCircleOutlined
              style={{ color: "#28a745", fontSize: "80px" }}
            />
          }
          title={
            <span className="gradient-text">Your order is proccessing!</span>
          }
          subTitle="Thank you for your order! We have received your payment and sent a confirmation email."
          extra={[
            <Link to="/profile" key="orders">
              <Button
                type="primary"
                size="large"
                shape="round"
                className="animate-button"
              >
                View My Orders
              </Button>
            </Link>,
            <Link to="/viewproduct" key="home">
              <Button
                size="large"
                shape="round"
                className="animate-button-secondary"
              >
                Continue Shopping
              </Button>
            </Link>,
          ]}
        />
      </div>

      <div className="confetti">
        <div className="confetti-piece"></div>
        <div className="confetti-piece"></div>
        <div className="confetti-piece"></div>
        <div className="confetti-piece"></div>
      </div>
      <div className="sparkles"></div>
    </div>
  );
}

export default OrderSuccess;
