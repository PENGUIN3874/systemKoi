import { Button, Result } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import "./paymentFail";

function PaymentFail() {
  return (
    <div className="payment-success-container">
      <div className="sparkling-background"></div>

      <div className="payment-success-card">
        <Result
          icon={
            <CloseCircleOutlined style={{ color: "red", fontSize: "80px" }} />
          }
          title={<span className="gradient-text">Payment Successful!</span>}
          subTitle="Thank you for your order! We have received your payment and sent a confirmation email."
          extra={[
            <Link to="/profile" key="orders">
              <Button
                type="primary"
                size="large"
                shape="round"
                className="animate-button"
              >
                Back my profile
              </Button>
            </Link>,
            <Link to="/home" key="home">
              <Button
                size="large"
                shape="round"
                className="animate-button-secondary"
              >
                Come Home!
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

export default PaymentFail;
