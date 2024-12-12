import "./register.scss";
import koi from "../../../img/koi.jpg";
import logo from "../../../img/logo.png.jpg";
import { Link, useNavigate } from "react-router-dom";
import { Form, Input, Button, notification } from "antd";
import { useState } from "react";
import api from "../../../config/axios";

function Register() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [error, setError] = useState("");
  const [isVerify, setIsVerify] = useState(false);
  const [verificationCode, setVerificationCode] = useState(""); // State for verification code
  const [registerEmail, setEmail] = useState("");
  const handleRegister = async (values) => {
    const { name, phone, email, password, confirmedPassword } = values;

    try {
      const response = await api.post(
        `User/Register?name=${name}&phone=${phone}&email=${email}&password=${password}&confirmedPassword=${confirmedPassword}`
      );
      console.log(response);
      if (response.status === 200) {
        setEmail(email);
        const sendEmailresponse = await api.post(
          `User/verficode?receiveEmail=${email}`
        );
        if (sendEmailresponse.status === 200) {
          setVerificationCode(sendEmailresponse.data.code);
          setIsVerify(true);
        } else {
          notification.error({
            description:
              "There was an issue while processing. Please try again later.",
            placement: "topRight",
          });
        }
      }
      console.log(response.data);
      //   console.log(sendEmailresponse.data);
      // Show verification code input after registration
    } catch (error) {
      let message = "An error occurred. Please try again.";
      if (error.response && error.response.data) {
        message = error.response.data.message;
        notification.error({
          description: message,
          placement: "topRight",
        });
      }
    }
  };
  const handleResendCode = async () => {
    try {
      const sendEmailresponse = await api.post(
        `User/verficode?receiveEmail=${registerEmail}`
      );
      if (sendEmailresponse.status === 200) {
        setVerificationCode(sendEmailresponse.data.code);
        setIsVerify(true);
      }
      notification.success({
        description: "The verification code is sent succefully!!",
        placement: "topRight",
      });
    } catch (e) {
      notification.error({
        description:
          "There was an issue while processing. Please try again later.",
        placement: "topRight",
      });
    }
  };
  const handleVerify = async (value) => {
    const { code } = value;
    try {
      console.log(code);
      const verifyResponse = await api.put(
        `User?userCode=${code}&verifyCode=${verificationCode}&email=${registerEmail}`
      );
      if (verifyResponse.status === 200) {
        setEmail("");
        setVerificationCode("");
        setIsVerify(false);
        notification.success({
          description: "The account is registered successfully!!.",
          placement: "topRight",
        });
        navigate("/login");
      }
    } catch (e) {
      notification.error({
        description:
          "There was an issue while processing. Please try again later.",
        placement: "topRight",
      });
    }
    console.log("Verification Code:", verificationCode);
    // Optionally, navigate to another page on successful verification
  };

  return (
    <div className="container__login">
      <div className="row login__page">
        <div className="col-md-6 left">
          <img className="koi" src={koi} alt="Koi" width="59%" />
        </div>
        <div className="col-md-6 right">
          <div className="login">
            <img className="login__logo" src={logo} alt="" width="30%" />
            <p>Royal Koi</p>
            <h2>Register</h2>
            {isVerify ? (
              <div>
                <p>Please enter the verification code sent to your email:</p>
                <Form
                  className="login__form"
                  onFinish={handleVerify}
                  form={form}
                >
                  <Form.Item
                    name="code"
                    rules={[
                      {
                        required: true,
                        message: "Please enter the verification code",
                      },
                      {
                        pattern: /^[0-9]{6}$/,
                        message:
                          "The verification code must be a 6-digit number",
                      },
                    ]}
                  >
                    <Input
                      placeholder="Enter 6-digit code"
                      maxLength={6} // Limit to 6 digits
                      onChange={(e) => setVerificationCode(e.target.value)}
                    />
                  </Form.Item>
                  <Form.Item>
                    <Button
                      type="secondary"
                      htmlType="submit"
                      className="login__but1"
                      block
                    >
                      Verify
                    </Button>
                  </Form.Item>
                </Form>
                <a
                  href="#"
                  onClick={handleResendCode}
                  style={{
                    color: "blue",
                    textDecoration: "underline",
                    cursor: "pointer",
                  }}
                >
                  Resend Verification Code
                </a>
              </div>
            ) : (
              <Form
                className="login__form"
                onFinish={handleRegister}
                form={form}
              >
                <Form.Item
                  name="email"
                  rules={[
                    {
                      type: "email",
                      required: true,
                      message: "Please enter your email",
                    },
                  ]}
                >
                  <Input placeholder="Enter your email" />
                </Form.Item>
                <Form.Item
                  name="name"
                  rules={[
                    { required: true, message: "Please enter your name" },
                  ]}
                >
                  <Input placeholder="Enter your full name" />
                </Form.Item>
                <Form.Item
                  name="phone"
                  rules={[
                    { required: true, message: "Please enter your phone" },
                  ]}
                  tooltip="Ensure typing correct phone"
                >
                  <Input placeholder="Enter your phone" />
                </Form.Item>
                <Form.Item
                  name="password"
                  rules={[
                    { required: true, message: "Please enter your password" },
                  ]}
                >
                  <Input.Password placeholder="Password" />
                </Form.Item>
                {error && (
                  <Form.Item>
                    <div style={{ color: "red" }}>{error}</div>
                  </Form.Item>
                )}
                <Form.Item
                  name="confirmedPassword"
                  dependencies={["password"]}
                  rules={[
                    { required: true, message: "Please confirm your password" },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("password") === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error("The passwords do not match")
                        );
                      },
                    }),
                  ]}
                >
                  <Input.Password placeholder="Confirm Password" />
                </Form.Item>
                <Form.Item>
                  <Button
                    type="secondary"
                    htmlType="submit"
                    className="login__but1"
                    block
                  >
                    Register
                  </Button>
                </Form.Item>
              </Form>
            )}

            <b>Forgot password?</b>
            <div className="signup">
              <h3>Already signed up?</h3>
              <Link to="/login">Sign In Now!</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
