import "./mykoi.scss";
import Header from "../../components/header/header";
import {
  Button,
  Col,
  Divider,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Tooltip,
} from "antd";
import { FilterOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ca from "../../img/a1.jpg";
import Footer from "../../components/footer/footer";
const { Option } = Select;

function Mykoi() {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [ponds, setPonds] = useState([]);
  const [koiData, setKoiData] = useState([]);
  const [selectedPond, setSelectedPond] = useState(null);
  const [image, setImage] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [filteredKoiData, setFilteredKoiData] = useState([]);
  const [sortOption, setSortOption] = useState("newest");
  const [filterPond, setFilterPond] = useState("All");
  const [filterSex, setFilterSex] = useState("All");
  const navigate = useNavigate();

  const fetchKoiData = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const accId = localStorage.getItem("userId");

    if (!user || !accId) {
      console.error("Thiếu user hoặc accId trong localStorage");
      alert("Vui lòng đăng nhập trước khi truy cập trang này.");
      navigate("/login");
      return;
    }

    try {
      const response = await axios.get(
        `https://koicaresystemapi.azurewebsites.net/api/user/${accId}/Koi?accId=${accId}`
      );
      const koiList = response.data.$values.map((koi) => ({
        koiId: koi.koiId,
        name: koi.name,
        age: koi.age,
        breed: koi.breed,
        image: koi.image,
        length: koi.length,
        pondId: koi.pondId, 
        sex: koi.sex ? "male" : "female",
      }));
      const koiCountByPond = koiList.reduce((count, koi) => {
        count[koi.pondId] = (count[koi.pondId] || 0) + 1;
        return count;
      }, {});

      setKoiData(koiList);
      localStorage.setItem("koiCountByPond", JSON.stringify(koiCountByPond));
      setFilteredKoiData(koiList); // Cập nhật dữ liệu đã lọc ban đầu
    } catch (error) {
      console.error("Lỗi khi lấy danh sách cá Koi:", error);
    }
  };

  const fetchPonds = async () => {
    try {
      const accId = localStorage.getItem("userId");
      const response = await axios.get(
        `https://koicaresystemapi.azurewebsites.net/api/Show-All-Ponds-UserID/${accId}`
      );
      const pondList = response.data.listPond["$values"]; // Lưu danh sách hồ từ API
      setPonds(pondList);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách hồ", error);
    }
  };

  useEffect(() => {
    fetchKoiData(); // Gọi API để lấy danh sách Koi khi component render
    fetchPonds(); // Gọi API để lấy danh sách hồ
  }, [navigate]);

  const applyFilters = () => {
    let filteredData = [...koiData];

    // Filter by pond
    if (filterPond !== "All") {
      filteredData = filteredData.filter(koi => koi.pondId === filterPond);
    }

    // Filter by sex
    if (filterSex !== "All") {
      filteredData = filteredData.filter(koi => koi.sex === filterSex);
    }

    // Sort data
    switch (sortOption) {
      case "newest":
        filteredData.sort((a, b) => b.koiId - a.koiId);
        break;
      case "oldest":
        filteredData.sort((a, b) => a.koiId - b.koiId);
        break;
      case "name-asc":
        filteredData.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        filteredData.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "length-desc":
        filteredData.sort((a, b) => b.length - a.length);
        break;
      case "length-asc":
        filteredData.sort((a, b) => a.length - b.length);
        break;
      case "age-desc":
        filteredData.sort((a, b) => b.age - a.age);
        break;
      case "age-asc":
        filteredData.sort((a, b) => a.age - b.age);
        break;
      default:
        break;
    }

    setFilteredKoiData(filteredData);
    setIsFilterModalVisible(false);
  };

  const showFilterModal = () => {
    setIsFilterModalVisible(true);
  };

  const handleFilterCancel = () => {
    setIsFilterModalVisible(false);
  };

  const checkDuplicateName = (name) => {
    return koiData.some((koi) => koi.name.toLowerCase() === name.toLowerCase());
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      if (!selectedPond) {
        console.error("Vui lòng chọn hồ trước khi thêm cá koi.");
        return;
      }

      const newKoi = {
        koiId: 0,
        name: values.name,
        image: image,
        physique: values.physique || "string",
        age: values.age || 0,
        length: values.length || 0,
        weight: values.weight || 0,
        sex: values.sex === "male",
        breed: values.breed || "string",
        pondId: selectedPond, 
      };

      const response = await fetch(
        `https://koicaresystemapi.azurewebsites.net/api/pond/${selectedPond}/Koi`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newKoi),
        }
      );

      if (response.ok) {
        console.log("Cá koi đã được thêm thành công vào hồ.");
        fetchKoiData(); // Gọi lại hàm fetchKoiData để cập nhật danh sách Koi

        form.resetFields();
        setIsModalVisible(false);
        setFileList([]);
        setImage(null);
      } else {
        const errorData = await response.json();
        console.error("Lỗi khi thêm cá vào hồ:", errorData);
      }
    } catch (error) {
      console.log("Validation failed or API error:", error);
    }
  };

  const handlePondChange = (value) => {
    setSelectedPond(value); // Lưu giá trị pondId khi chọn hồ
    console.log(value);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setImage(null);
    setFileList([]);
  };

  const handleNavigateToKoiDetail = (koi) => {
    if (koi.koiId) {
      console.log("Navigating to KoiDetail with pondId:", koi.pondId);
      navigate(`/koidetail/${koi.koiId}`, {
        state: { pondId: koi.pondId },
      });
    } else {
      console.error("Pond ID is undefined for this koi.");
    }
  };

  return (
    <>
      <Header />
      <div className="mykoi_background"></div>
      <div className="mykoi_title">
        <h1>My Koi Fish</h1>
      </div>
      <div className="mykoi_divider">
        <Divider />
      </div>

      <div className="mykoi_area">
        <Button type="primary" onClick={showModal}>
          Add new koi
        </Button>

        <Tooltip title="Filter">
          <Button
            type="default"
            shape="circle"
            icon={<FilterOutlined />}
            onClick={showFilterModal}
            style={{ marginLeft: 10 }}
          />
        </Tooltip>
      </div>

      {/* Hiển thị danh sách cá koi đã lọc */}
      <div className="koi_list">
        {filteredKoiData.length === 0 ? (
          <div className="empty_message">
            <p>
              Oops :(( You don't add any koi yet. Press "Add new koi" button to
              add the new one !!!
            </p>
          </div>
        ) : (
          filteredKoiData.map((koi, index) => (
            <div
              key={index}
              className="koi_item"
              onClick={() => handleNavigateToKoiDetail(koi)}
              style={{ cursor: "pointer" }}
            >
              <img src={ca} style={{ width: 200, height: 100 }} />
              <div className="koi_info">
                <p>
                  <strong>Name:</strong> {koi.name}
                </p>
                <p>
                  <strong>Age:</strong> {koi.age || "-"}
                </p>
                <p>
                  <strong>Variety:</strong> {koi.breed || "-"}
                </p>
                <p>
                  <strong>Length:</strong> {koi.length} cm
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Filter Modal */}
      <Modal
        title="Filter Options"
        visible={isFilterModalVisible}
        onCancel={handleFilterCancel}
        onOk={applyFilters}
        className="mykoi_filter_modal"
      >
        {/* Sort Option */}
        <div>
          <label style={{ fontSize: "19px", fontWeight: "bold", fontFamily: "'Gowun Batang", color: "#333" }}>Sort by:</label>
          <Select value={sortOption} onChange={setSortOption} style={{ width: "100%" }}>
            <Option value="newest">In pond since (newest first)</Option>
            <Option value="oldest">In pond since (oldest first)</Option>
            <Option value="name-asc">Name (A-Z)</Option>
            <Option value="name-desc">Name (Z-A)</Option>
            <Option value="length-desc">Length (descending)</Option>
            <Option value="length-asc">Length (ascending)</Option>
            <Option value="age-desc">Age (descending)</Option>
            <Option value="age-asc">Age (ascending)</Option>
          </Select>
        </div>

        {/* Pond Filter */}
        <div style={{ marginTop: "16px" }}>
          <label style={{ fontSize: "19px", fontWeight: "bold", fontFamily: "'Gowun Batang'", color: "#333" }}>Pond:</label>
          <Select value={filterPond} onChange={setFilterPond} style={{ width: "100%" }}>
            <Option value="All">All</Option>
            {ponds.map((pond) => (
              <Option key={pond.pondId} value={pond.pondId}>
                {pond.name}
              </Option>
            ))}
          </Select>
        </div>

        {/* Sex Filter */}
        <div style={{ marginTop: "16px" }}>
          <label style={{ fontSize: "19px", fontWeight: "bold", fontFamily: "'Gowun Batang'", color: "#333" }}>Sex:</label>
          <Select value={filterSex} onChange={setFilterSex} style={{ width: "100%" }}>
            <Option value="All">All</Option>
            <Option value="male">Male</Option>
            <Option value="female">Female</Option>
          </Select>
        </div>
      </Modal>

      {/* Modal */}
      <Modal
        title="Add new koi"
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        className="mykoi_modal"
      >
        <Divider />

        <Form form={form} layout="vertical">
          <div className="add_image">
            <img src={ca} style={{ width: 200, height: 100 }} />
          </div>
          <Row gutter={16}>
            <Col span={12}>
            <Form.Item
                label="Name:"
                name="name"
                rules={[
                  {
                    required: true,
                    message: "Please enter your Koi fish name!",
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || !checkDuplicateName(value)) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("The name of the fish already exists, please change the name !")
                      );
                    },
                  }),
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Pond:"
                name="pond"
                rules={[
                  { required: true, message: "Please choose your pond !" },
                ]}
              >
                <Select onChange={handlePondChange}>
                  {ponds.map((pond) => (
                    <Option key={pond.pondId} value={pond.pondId}>
                      {pond.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={
                  <span>
                    Physique:{" "}
                    <Tooltip title="Suggested options: slim, normal, corpulent">
                      <InfoCircleOutlined style={{ color: "black" }} />
                    </Tooltip>
                  </span>
                }
                name="physique"
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={
                  <span>
                    Age:{" "}
                    <Tooltip title="Please enter a positive integer (1 or greater)">
                      <InfoCircleOutlined style={{ color: "black" }} />
                    </Tooltip>
                  </span>
                }
                name="age"
                rules={[
                  {
                    required: true,
                    message: "Please enter the age of the Koi fish!",
                  },
                  {
                    validator(_, value) {
                      const ageValue = Number(value);
                      if (!value || (Number.isInteger(ageValue) && ageValue > 0)) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("Please enter a valid age (positive integers only)!")
                      );
                    },
                  },
                ]}
              >
                <Input type="number" min={1} step={1} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={
                  <span>
                    Length (cm):{" "}
                    <Tooltip title="Length must be a positive number !">
                      <InfoCircleOutlined
                        style={{ color: "black" }}
                      />
                    </Tooltip>
                  </span>
                }
                name="length"
                rules={[
                  { required: true, message: "Please enter the length !" },
                  {
                    type: "number",
                    min: 0.01,
                    transform: (value) => Number(value),
                  },
                ]}
              >
                <Input type="number" min={0.01} step={0.01} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={
                  <span>
                    Weight (g):{" "}
                    <Tooltip title="Weight must be a positive number !">
                      <InfoCircleOutlined
                        style={{ color: "black" }}
                      />
                    </Tooltip>
                  </span>
                }
                name="weight"
                rules={[
                  { required: true, message: "Please enter the weight !" },
                  {
                    type: "number",
                    min: 0.01,
                    transform: (value) => Number(value),
                  },
                ]}
              >
                <Input type="number" min={0.01} step={0.01} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                label="Sex:" 
                name="sex" 
                rules={[{ required: true, message: "Please select the sex of the Koi fish!" }]}
              >
                <Select>
                  <Option value="male">Male</Option>
                  <Option value="female">Female</Option>
                  <Option value="not_specified">Not specified</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Breed:" name="breed">
                <Input />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
      <br />
      <Footer />
    </>
  );
}

export default Mykoi;
