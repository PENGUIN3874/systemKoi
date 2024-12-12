import { useState, useEffect } from "react";
import Header from "../../components/header/header";
import "./environment.scss";
import koi from "../../img/news.jpg";
import {
  Form,
  Input,
  Button,
  Modal,
  Upload,
  Row,
  Col,
  notification,
} from "antd";
import Footer from "../../components/footer/footer";
import { UploadOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import debounce from "lodash/debounce";
import ca from "../../img/hoca.jpg";
function Environment() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalUpdateVisible, setIsModalUpdateVisible] = useState(false);
  const [environmentForm] = Form.useForm();
  const [pondDataList, setPondDataList] = useState([]);
  const [updatePond, setUpdatePond] = useState([]);
  const [originalPondDataList, setOriginalPondDataList] = useState([]);
  const [image, setImage] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  // const [editingIndex, setEditingIndex] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));

  const fetchPondData = async () => {
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        throw new Error("No user found in localStorage");
      }

      const user = JSON.parse(storedUser);
      const userId = user.accId;

      const response = await fetch(
        `https://koicaresystemapi.azurewebsites.net/api/Show-All-Ponds-UserID/${userId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch pond data");
      }

      const data = await response.json();
      const koiCountByPond =
        JSON.parse(localStorage.getItem("koiCountByPond")) || {};

      // Gắn số lượng koi vào từng hồ cá
      const updatedPondDataList = data.listPond.$values.map((pond) => ({
        ...pond,
        koiCount: koiCountByPond[pond.pondId] || 0,
      }));

      setPondDataList(updatedPondDataList);
      setOriginalPondDataList(updatedPondDataList);
    } catch (error) {
      console.error("Error fetching pond data:", error);
      setPondDataList([]);
      setOriginalPondDataList([]);
    }
  };

  useEffect(() => {
    fetchPondData();
  }, []);

  const showModalCreate = () => {
    setIsModalVisible(true);
  };

  const handleDeletePond = async (index) => {
    const pondToDelete = pondDataList[index];
    const pondId = pondToDelete.pondId;

    try {
      const response = await fetch(
        `https://koicaresystemapi.azurewebsites.net/api/Delete-Pond/${pondId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete the pond");
      }

      const updatedPondDataList = pondDataList.filter(
        (_, pondIndex) => pondIndex !== index
      );
      setPondDataList(updatedPondDataList);
      setOriginalPondDataList(updatedPondDataList);

      notification.success({
        message: "Pond Deleted",
        description: `Pond ${pondToDelete.name} has been deleted successfully.`,
        placement: "topRight",
      });
    } catch (error) {
      console.error("Error deleting pond:", error);
      notification.error({
        message: "Error Deleting Pond",
        description:
          "There was an issue deleting the pond. Please try again later.",
        placement: "topRight",
      });
    }
  };

  const handleEditPond = (index) => {
    const pondToEdit = pondDataList[index];
    environmentForm.setFieldsValue(pondToEdit);
    setUpdatePond(pondToEdit);
    setImage(pondToEdit.image);
    // setEditingIndex(index);
    setIsEditing(true);
    setIsModalUpdateVisible(true);
  };

  const handleOk = async () => {
    const formData = environmentForm.getFieldsValue();
    const userId = user.accId;
    const pondId = isEditing ? updatePond?.pondId : 0;
    const newPondData = { ...formData, image, userId, pondId };

    try {
      let response;
      let messageText = "Create Pond";
      let description = "New Pond is created successfully!";

      if (isEditing) {
        response = await fetch(
          `https://koicaresystemapi.azurewebsites.net/api/Update-Pond/${updatePond.pondId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(newPondData),
          }
        );
        messageText = "Edit Pond";
        description = `Pond ${newPondData.name} has been updated successfully.`;
      } else {
        response = await fetch(
          `https://koicaresystemapi.azurewebsites.net/api/Create-Pond?accId=${user.accId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(newPondData),
          }
        );
      }

      if (!response.ok) {
        throw new Error("Failed to save the pond data");
      }

      notification.success({
        message: messageText,
        description: description,
        placement: "topRight",
      });

      // Gọi lại fetchPondData để cập nhật danh sách hồ cá
      await fetchPondData();

      // Đóng modal và reset form
      setIsModalVisible(false);
      setIsModalUpdateVisible(false);
      environmentForm.resetFields();
      setImage(null);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving pond data:", error);
      notification.error({
        message: "Error Processing Pond",
        description:
          "There was an issue while processing. Please try again later.",
        placement: "topRight",
      });
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setIsModalUpdateVisible(false);
    environmentForm.resetFields();
    setImage(null);
    setIsEditing(false);
  };

  const handleImageUpload = (file) => {
    setImage(URL.createObjectURL(file));
    return false;
  };

  const handleSearch = debounce(() => {
    if (searchText.trim() === "") {
      setPondDataList(originalPondDataList);
    } else {
      const filteredPonds = originalPondDataList.filter((pond) =>
        pond.name.toLowerCase().includes(searchText.toLowerCase())
      );
      setPondDataList(filteredPonds);
    }
    setSearchText("");
  });

  useEffect(() => {
    console.log("Updated Pond Data List:", pondDataList);
  }, [pondDataList]);

  return (
    <div className="EnvironmentPage">
      <Header />
      <div className="Environment__img">
        <img src={koi} alt="" />
      </div>
      <div
        className="Environment__body"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "auto",
          marginBottom: "20px",
        }}
      >
        <Space direction="vertical" align="center">
          <Space>
            <div className="title">
              <h3>Environment monitor</h3>
            </div>
          </Space>
          <Space direction="horizontal" className="search">
            <Input
              className="input-custom"
              placeholder="Search Pond"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Button
              className="button-custom"
              type="secondary"
              onClick={handleSearch}
            >
              Search
            </Button>
            <Button
              className="add-button-custom"
              type="secondary"
              onClick={showModalCreate}
            >
              Add Pond
            </Button>
          </Space>
        </Space>
      </div>

      {pondDataList.length > 0 ? (
        pondDataList.map((pondData, index) => (
          <div key={index} className="uploaded__pond__info">
            <h3>
              {pondData.name
                ? pondData.name.toUpperCase()
                : "No Name Available"}
            </h3>
            <Row gutter={16}>
              <Col md={12} xs={24} className="uploaded__pond__info__left">
                <img
                  src={pondData.image ? pondData.image : ca}
                  alt={`Pond ${pondData.name}`}
                  style={{ width: "90%" }}
                />
              </Col>
              <Col md={12} xs={24} className="uploaded__pond__info__right">
                <Row gutter={16}>
                  <Col span={12} className="pond__infor">
                    <p>
                      <strong>Pumping Capacity:</strong> {pondData.pumpCapacity}{" "}
                      L/min
                    </p>
                    <p>
                      <strong>Drain Count:</strong> {pondData.drainCount}
                    </p>
                    <p>
                      <strong>Number of Koi:</strong> {pondData.koiCount}
                    </p>
                  </Col>
                  <Col span={12} className="pond__infor">
                    <p>
                      <strong>Depth:</strong> {pondData.depth} m
                    </p>
                    <p>
                      <strong>Volume:</strong> {pondData.volume} m³
                    </p>
                  </Col>
                </Row>
                <div className="action">
                  <Link to={`/view/${pondData.pondId}`}>View</Link>
                  <Button
                    type="secondary"
                    onClick={() => handleEditPond(index)}
                  >
                    Edit
                  </Button>
                  <Button
                    type="secondary"
                    danger
                    onClick={() => handleDeletePond(index)}
                  >
                    Delete
                  </Button>
                </div>
              </Col>
            </Row>
          </div>
        ))
      ) : (
        <p style={{ textAlign: "center", margin: "20px 0 20px 0" }}>
          No ponds available.
        </p>
      )}

      <Modal
        title={isEditing ? "Edit Pond" : "Add Pond"}
        visible={isModalVisible || isModalUpdateVisible}
        onCancel={handleCancel}
        footer={null}
        width={800}
      >
        <Form form={environmentForm} onFinish={handleOk} layout="vertical">
          <Form.Item
            label="Pond Name"
            name="name"
            rules={[
              {
                required: true,
                message: "Please input the pond name!",
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Pump Capacity (L/min)"
            name="pumpCapacity"
            rules={[
              {
                type: "number",
                min: 0,
                message: "Pump Capacity must be 0 or greater!",
                transform: (value) => Number(value),
              },
            ]}
          >
            <Input type="number" />
          </Form.Item>

          <Form.Item
            label="Depth (m)"
            name="depth"
            rules={[
              {
                type: "number",
                min: 0,
                message: "Depth must be 0 or greater!",
                transform: (value) => Number(value),
              },
            ]}
          >
            <Input type="number" />
          </Form.Item>

          <Form.Item
            label="Volume (m³)"
            name="volume"
            rules={[
              {
                type: "number",
                min: 0,
                message: "Volume must be 0 or greater!",
                transform: (value) => Number(value),
              },
            ]}
          >
            <Input type="number" />
          </Form.Item>

          <Form.Item
            label="Drain Count"
            name="drainCount"
            rules={[
              {
                type: "number",
                min: 0,
                message: "Drain Count must be 0 or greater!",
                transform: (value) => Number(value),
              },
            ]}
          >
            <Input type="number" />
          </Form.Item>

          <Form.Item>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Button type="primary" htmlType="submit" style={{ width: "48%" }}>
                {isEditing ? "Update Pond" : "Create Pond"}
              </Button>
              <Button
                type="default"
                onClick={handleCancel}
                htmlType="button"
                style={{ width: "48%" }}
              >
                Cancel
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      <Footer />
    </div>
  );
}

export default Environment;
