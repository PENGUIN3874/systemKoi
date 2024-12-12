import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import "./profile.scss";
import axios from "axios";
import {
  Button,
  Image,
  Input,
  Layout,
  Menu,
  message,
  Modal,
  Form,
  List,
} from "antd";
import { useNavigate } from "react-router-dom";

import { useEffect, useState } from "react";
import api from "../../config/axios";

import axiosInstance from "../../components/api/axiosInstance";

function Profile() {
  const { Sider, Content } = Layout;
  const [accId, setAccId] = useState(localStorage.getItem("userId"));
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [imageUrl, setImageUrl] = useState("");
  const formatCurrency = (value) => {
    if (typeof value !== "number" || isNaN(value)) {
      return "0 VND";
    }
    return ` ${new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(value * 1000)}`;
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get(
        `https://koicaresystemapi.azurewebsites.net/GetAll/${accId}`
      );
      const userOrders = response.data.orders.$values || [];
      if (userOrders.length === 0) {
        message.info("You have no orders yet.");
      } else {
        setOrders(userOrders);
        setIsOrderModalOpen(true);
      }
    } catch (error) {
      message.error("Failed to fetch orders");
      console.error("Error fetching orders:", error);
    }
  };

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [userInfo, setUserInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    image: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Lấy thông tin để show ra ở profile
  const fetchUserInfo = async () => {
    try {
      const response = await axiosInstance.get("/api/Account/Profile");
      setImageUrl(response.data.image || "");
      setUserInfo({
        fullName: response.data.name || "",
        email: response.data.email || "",
        phone: response.data.phone || "",
        address: response.data.address || "",
        image: response.data.image || "",
      });
    } catch (error) {
      console.error("Error fetching user info:", error);
      if (error.response && error.response.status === 401) {
        localStorage.clear();
        navigate("/login");
      }
    }
  };

  useEffect(() => {
    fetchUserInfo(); // Gọi hàm này khi component được tải
  }, [navigate]);

  const handleEditToggle = () => {
    if (isEditing) {
      handleSave();
    } else {
      setIsEditing(true);
    }
  };

  // Sửa thay đổi thông tin người dùng và lưu
  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("name", userInfo.fullName);
      formData.append("phone", userInfo.phone);
      formData.append("address", userInfo.address);

      // Kiểm tra và thêm hình ảnh vào formData
      if (image) {
        formData.append("image", "string"); // Sử dụng hình ảnh đã tải lên
      } else if (imageUrl) {
        formData.append("image", "string"); // Sử dụng URL hình ảnh hiện có
      } else {
        formData.append("image", ""); // Nếu không có hình ảnh
      }
      const response = await axios.put(
        `https://koicaresystemapi.azurewebsites.net/api/Account/Profile?accId=${accId}`,
        formData,
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.status === 200) {
        message.success("Update successfully!");
        setIsEditing(false);
        // Gọi lại fetchUserInfo để cập nhật thông tin người dùng bao gồm hình ảnh
        fetchUserInfo();
      }
    } catch (error) {
      message.error("Failed to update information");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = async () => {
    try {
      const response = await axios.post(
        `https://koicaresystemapi.azurewebsites.net/api/Payment/checkout?accId=${accId}`
      );
      // Check if paymentUrl is returned correctlyx
      if (response.data && response.data.paymentUrl) {
        const paymentWindow = window.open(response.data.paymentUrl, "_blank");
        const checkWindow = setInterval(() => {
          if (paymentWindow.closed) {
            clearInterval(checkWindow);
            fetchUserInfo();
            message.success("Payment completed, profile updated!");
          }
        }, 1000);
      } else {
        throw new Error("Payment URL not found in response");
      }
    } catch (error) {
      message.error("Failed to update membership");
      console.error("Error updating membership:", error);
    }
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };
  useEffect(() => {
    return () => {
      if (previewImage) {
        URL.revokeObjectURL(previewImage); // Giải phóng URL blob khi component unmount
      }
    };
  }, [previewImage]);

  // Reset password
  const handleResetPassword = async () => {
    if (passwords.newPassword !== passwords.confirmNewPassword) {
      message.error("New passwords do not match!");
      return;
    }

    try {
      console.log(accId);
      console.log(passwords.confirmNewPassword);
      const respones = await api.put(
        `https://koicaresystemapi.azurewebsites.net/api/Account/change-password${accId}?changePassword=${passwords.confirmNewPassword}` // API reset password
      );

      if (respones.status === 200) {
        message.success("Password reset successfully!");
        setIsResetModalOpen(false); // Đóng modal khi thành công
      }
    } catch (error) {
      message.error("Failed to reset password. Please try again.");
    }
  };
  return (
    <>
      <div>
        <Header />
      </div>
      <div className="profile_background">
        <div className="profile_container">
          {/* Sider */}
          <Layout style={{ width: "100%", minHeight: "500px" }}>
            <Sider className="profile_sider" width={250} theme="light">
              <Menu
                mode="vertical"
                defaultSelectedKeys={[1]}
                className="profile_menu"
              >
                <Menu.Item className="accountSetting" key={1}>
                  Account Settings
                </Menu.Item>
                <Menu.Item
                  key={2}
                  onClick={() => {
                    const user = JSON.parse(localStorage.getItem("user"));
                    if (user && user.role !== "member") showModal();
                    else message.info("You are already a member");
                  }}
                >
                  Membership
                </Menu.Item>
                <Menu.Item key={3} onClick={fetchOrders}>
                  Your Order
                </Menu.Item>

                <Menu.Item key={4} onClick={() => setIsResetModalOpen(true)}>
                  Reset Password
                </Menu.Item>
              </Menu>
            </Sider>

            <Content className="profile_content">
              <h5>Account Settings</h5>

              {/* Modal Order */}
              <Modal
                title="Your Orders"
                visible={isOrderModalOpen}
                onCancel={() => setIsOrderModalOpen(false)}
                footer={null}
                width={700}
              >
                <List
                  itemLayout="horizontal"
                  dataSource={orders}
                  renderItem={(order) => (
                    <List.Item>
                      <List.Item.Meta
                        title={`Order ID: ${order.orderId}`}
                        description={`Date: ${order.date}, Status: ${order.statusOrder}, Payment: ${order.statusPayment}`}
                      />
                      <div>
                        Total Amount: {formatCurrency(order.totalAmount)}
                      </div>
                      {/* Hiển thị chi tiết các sản phẩm trong đơn hàng */}
                      {order.orderDetailsTbls &&
                        order.orderDetailsTbls.$values.length > 0 && (
                          <List
                            itemLayout="horizontal"
                            dataSource={order.orderDetailsTbls.$values}
                            renderItem={(detail) => (
                              <List.Item>
                                <List.Item.Meta
                                  title={`Product: ${detail.productName}}
                                  description={Quantity: ${
                                    detail.quantity
                                  }, Price: ${formatCurrency(detail.price)}`}
                                />
                              </List.Item>
                            )}
                          />
                        )}
                    </List.Item>
                  )}
                />
              </Modal>

              {/*Modal Membership*/}
              <Modal
                title="Membership"
                visible={isModalOpen}
                onOk={handleOk}
                okText="Buy Now"
                onCancel={handleCancel}
              >
                <p>99.000 (VND) / 6 months </p>
              </Modal>

              {/*Modal reset password */}
              <Modal
                title="Reset Password"
                visible={isResetModalOpen}
                onOk={handleResetPassword}
                onCancel={() => setIsResetModalOpen(false)}
                okText="Reset Password"
                cancelText="Cancel"
                className="reset_password_modal"
                centered
                width={500}
              >
                <Form layout="vertical" className="reset_password_form">
                  <Form.Item
                    label="Current Password"
                    name="currentPassword"
                    rules={[
                      {
                        required: true,
                        message: "Please enter your current password",
                      },
                    ]}
                  >
                    <Input.Password
                      value={passwords.currentPassword}
                      onChange={(e) =>
                        setPasswords({
                          ...passwords,
                          currentPassword: e.target.value,
                        })
                      }
                      placeholder="Enter your current password"
                    />
                  </Form.Item>
                  <Form.Item
                    label="New Password"
                    name="newPassword"
                    rules={[
                      {
                        required: true,
                        message: "Please enter your new password",
                      },
                    ]}
                  >
                    <Input.Password
                      value={passwords.newPassword}
                      onChange={(e) =>
                        setPasswords({
                          ...passwords,
                          newPassword: e.target.value,
                        })
                      }
                      placeholder="Enter your new password"
                    />
                  </Form.Item>
                  <Form.Item
                    label="Confirm New Password"
                    name="confirmNewPassword"
                    rules={[
                      {
                        required: true,
                        message: "Please confirm your new password",
                      },
                    ]}
                  >
                    <Input.Password
                      value={passwords.confirmNewPassword}
                      onChange={(e) =>
                        setPasswords({
                          ...passwords,
                          confirmNewPassword: e.target.value,
                        })
                      }
                      placeholder="Confirm your new password"
                    />
                  </Form.Item>
                </Form>
              </Modal>

              <div className="profile_body_form">
                <Form name="fullName">
                  <div className="title">Full Name: </div>
                  <Input
                    name="fullName"
                    placeholder="Full Name"
                    value={userInfo.fullName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    style={{
                      backgroundColor: isEditing ? "white" : "#f0f0f0",
                    }}
                  />
                </Form>

                <Form name="phone">
                  <div className="title">Phone: </div>
                  <Input
                    placeholder="Number Phone"
                    name="phone"
                    value={userInfo.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    style={{
                      backgroundColor: isEditing ? "white" : "#f0f0f0",
                    }}
                  />
                </Form>

                <Form name="email">
                  <div className="title">Email: </div>
                  <Input
                    placeholder="Email"
                    name="email"
                    value={userInfo.email}
                    onChange={handleInputChange}
                    disabled // Email không cho phép chỉnh sửa
                    style={{ backgroundColor: "#f0f0f0" }}
                  />
                </Form>

                <Form name="address">
                  <div className="title">Address: </div>
                  <Input
                    placeholder="Address: 445/12 Tan Hoa Dong Str, ..."
                    name="address"
                    value={userInfo.address}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    style={{
                      backgroundColor: isEditing ? "white" : "#f0f0f0",
                    }}
                  />
                </Form>
              </div>

              {/* Edit*/}
              <Button
                className="edit_button"
                onClick={handleEditToggle}
                style={{ marginBottom: "15px" }}
              >
                {isEditing ? "Save" : "Edit"}
              </Button>
              {successMessage && (
                <div className="success_message">{successMessage}</div>
              )}
            </Content>
          </Layout>
          {previewImage && (
            <Image
              wrapperStyle={{
                display: "none",
              }}
              preview={{
                visible: previewOpen,
                onVisibleChange: (visible) => setPreviewOpen(visible),
                afterOpenChange: (visible) => !visible && setPreviewImage(""),
              }}
              src={previewImage}
            />
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Profile;
