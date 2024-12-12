import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import "./koidetail.scss";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import {
  Divider,
  Form,
  Input,
  Button,
  Upload,
  Modal,
  Select,
  Table,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function KoiDetail() {
  const { koiId } = useParams();
  const location = useLocation();
  const pondId = location.state?.pondId;
  const [selectedPond, setSelectedPond] = useState(null);
  const [koiDetails, setKoiDetails] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [ponds, setPonds] = useState([]);
  const [isDelete, setIsDelete] = useState(false);
  const { Option } = Select;
  const [originalChartData, setOriginalChartData] = useState([]);
  const [isReportVisible, setIsReportVisible] = useState(false);
  const [isMember, setIsMember] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  const handleReport = () => {
    setIsReportVisible(true);
  };

  const closeReport = () => {
    setIsReportVisible(false);
  };

  // Tính Health Status
  const dataWithHealthStatus = originalChartData.map((data, index, arr) => {
    if (index === 0) {
      return { ...data, healthStatus: "Good" };
    }

    const prevData = arr[index - 1];
    const weightChange =
      ((data.weight - prevData.weight) / prevData.weight) * 100;

    let healthStatus = "Good"; // Mặc định là "Good"
    if (weightChange > 15 || weightChange < -15) {
      healthStatus = "Warning";
    }

    return { ...data, healthStatus };
  });

  const reportColumns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Length (cm)",
      dataIndex: "length",
      key: "length",
    },
    {
      title: "Weight (g)",
      dataIndex: "weight",
      key: "weight",
    },
    {
      title: "Health Status",
      dataIndex: "healthStatus",
      key: "healthStatus",
      render: (text) => (
        <span style={{ color: text === "Warning" ? "red" : "green" }}>
          {text}
        </span>
      ),
    },
  ];

  const fetchPonds = async () => {
    try {
      const accId = localStorage.getItem("userId");
      const response = await axios.get(
        `https://koicaresystemapi.azurewebsites.net/api/Show-All-Ponds-UserID/${accId}`
      );
      const pondList = response.data.listPond["$values"];
      setPonds(pondList);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách hồ", error);
    }
  };

  const handlePondChange = (value) => {
    setSelectedPond(value);
    console.log(value);
  };

  const fetchKoiDetails = async () => {
    if (!koiId) {
      console.error("Koi ID is invalid.");
      return;
    }

    try {
      const response = await axios.get(
        `https://koicaresystemapi.azurewebsites.net/api/Koi/${koiId}`
      );
      setKoiDetails(response.data);
      form.setFieldsValue({
        ...response.data,
        pond: response.data.pondId,
      });
      setImage(response.data.image);
    } catch (error) {
      console.error("Error fetching Koi details:", error);
    }
  };

  const fetchChartData = async () => {
    try {
      const response = await axios.get(
        `https://koicaresystemapi.azurewebsites.net/api/KoiChart/${koiId}`
      );
      setOriginalChartData(response.data["$values"]);
    } catch (error) {
      console.error("Error fetching chart data:", error);
    }
  };

  useEffect(() => {
    if (user.role.toLocaleLowerCase() === "member") {
      setIsMember(true);
    } else {
      setIsMember(false);
    }
    fetchPonds();
    fetchKoiDetails();
    fetchChartData();
    if (pondId) {
      setSelectedPond(pondId); // Set selectedPond only once
    }
  }, [koiId, form, navigate, pondId]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      const updatedData = {
        koiId: koiDetails.koiId || 0,
        name: values.name || "string",
        image: image || "string",
        physique: values.physique || "string",
        age: values.age || 0,
        length: values.length || 0,
        weight: values.weight || 0,
        sex: values.sex === "male",
        breed: values.breed || "string",
        pondId: pondId,
      };

      console.log("Dữ liệu gửi đến API:", updatedData);

      const response = await axios.put(
        `https://koicaresystemapi.azurewebsites.net/api/pond/${selectedPond}/Koi/${koiId}`,
        updatedData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        console.log("Cập nhật thành công");
        setIsEditing(false);
        setKoiDetails(updatedData);
        console.log(koiDetails);
        setOriginalChartData((prev) => [
          ...prev,
          {
            date: new Date().toLocaleDateString(),
            length: values.length,
            weight: values.weight,
          },
        ]);
      }
    } catch (error) {
      if (error.response) {
        console.error("Lỗi khi lưu dữ liệu:", error.response.data);
        console.error("Trạng thái lỗi:", error.response.status);
      } else {
        console.error("Lỗi khác:", error.message);
      }
    }
  };

  const onDelete = async () => {
    try {
      const response = await axios.delete(
        `https://koicaresystemapi.azurewebsites.net/api/Koi/${koiId}`
      );

      if (response.status === 200) {
        console.log("Xóa thành công");
        navigate("/mykoi");
      } else {
        console.error("Lỗi khi xóa cá Koi:", response.data);
      }
    } catch (error) {
      console.error("Lỗi khi xoá Cá Koi:", error);
    }
  };

  const chartData = {
    labels: originalChartData.map((data) => data.date),
    datasets: [
      {
        label: "Length (cm)",
        data: originalChartData.map((data) => data.length),
        borderColor: "orange",
        yAxisID: "y1",
      },
      {
        label: "Weight (g)",
        data: originalChartData.map((data) => data.weight),
        borderColor: "blue",
        yAxisID: "y2",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    scales: {
      x: {
        title: {
          display: true,
          text: "Date",
          font: {
            size: 16,
          },
        },
        ticks: {
          font: {
            size: 14,
          },
        },
      },
      y1: {
        type: "linear",
        position: "left",
        title: {
          display: true,
          text: "Length (cm)",
          font: {
            size: 16,
          },
        },
        ticks: {
          font: {
            size: 14,
          },
        },
      },
      y2: {
        type: "linear",
        position: "right",
        title: {
          display: true,
          text: "Weight (g)",
          font: {
            size: 16,
          },
        },
        ticks: {
          font: {
            size: 14,
          },
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          font: {
            size: 16,
          },
        },
      },
      tooltip: {
        titleFont: {
          size: 14,
        },
        bodyFont: {
          size: 12,
        },
      },
    },
  };

  return (
    <>
      {/* Modal cho báo cáo */}
      <Modal
        title="Koi Growth Report"
        visible={isReportVisible}
        onCancel={closeReport}
        footer={[
          <Button key="close" onClick={closeReport}>
            Close
          </Button>,
        ]}
      >
        <div style={{ marginBottom: "20px" }}>
          <p style={{ color: "green", fontWeight: "bold" }}>
            Good: Your fish are growing very well. Please continue to take care
            of your fish at all times!
          </p>
          <p style={{ color: "red", fontWeight: "bold" }}>
            Warning: Your Koi fish's weight is increasing or decreasing by more
            than 15%. Review your fish feeding process or check your pond's
            water quality!
          </p>
          <p>
            <strong>Suggestion:</strong>
            <ul>
              <li>
                You can use the Food Calculator or Salt Calculator function to
                calculate the amount of food or salt for your pond.
              </li>
              <li>
                Visit the product store at Home page to buy accessories to care
                for your fish!
              </li>
            </ul>
          </p>
        </div>

        <Table
          dataSource={dataWithHealthStatus}
          columns={reportColumns}
          rowKey="chartId"
          pagination={false}
        />
      </Modal>

      <Modal
        title="Accept Delete"
        visible={isDelete}
        onCancel={() => setIsDelete(false)}
        footer={[
          <Button
            key="cancel"
            onClick={() => setIsDelete(false)}
            className="modal-cancel-button"
          >
            Cancel
          </Button>,
          <Button
            key="ok"
            type="primary"
            onClick={onDelete}
            className="modal-delete-button"
          >
            Delete
          </Button>,
        ]}
        className="custom-modal"
      >
        <p className="modal-content-text">You want to delete this Koi fish ?</p>
      </Modal>

      <Header />
      <div className="koide_background"></div>
      <div className="koide_header">
        <button className="koide_button" onClick={() => navigate("/mykoi")}>
          <span className="koide_back">←Back</span>
        </button>
        <div className="koide_title">Koi Details</div>
      </div>
      <div className="koide_divider">
        <Divider />
      </div>

      <div className="koide_form_wrapper">
        <div className="koide_left">
          <Form form={form} layout="vertical">
            <Form.Item label="Name:" name="name">
              <Input disabled={!isEditing} />
            </Form.Item>

            <Form.Item label="Age: " name="age">
              <Input type="number" disabled={!isEditing} />
            </Form.Item>

            <Form.Item label="Length (cm): " name="length">
              <Input type="number" disabled={!isEditing} />
            </Form.Item>

            <Form.Item label="Physique: " name="physique">
              <Input disabled={!isEditing} />
            </Form.Item>

            <Form.Item label="Weight (g): " name="weight">
              <Input type="number" disabled={!isEditing} />
            </Form.Item>
            <Form.Item label="Pond: " name="pond">
              <Select onChange={handlePondChange} disabled={!isEditing}>
                {ponds.map((pond) => (
                  <Option key={pond.pondId} value={pond.pondId}>
                    {pond.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {/* Các nút Edit và Delete */}
            <div className="koide_button_1">
              {isEditing ? (
                <>
                  <Button type="primary" onClick={handleSave}>
                    Save
                  </Button>
                  <Button type="primary" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button type="primary" onClick={() => setIsEditing(true)}>
                    Edit
                  </Button>
                  <Button type="primary" onClick={() => setIsDelete(true)}>
                    Delete
                  </Button>
                </>
              )}
            </div>
          </Form>
          {isMember ? (
            <></>
          ) : (
            <b className="buymembership">
              You must buy membership to view chart information!
            </b>
          )}
        </div>
        {isMember ? (
          <div className="koide_right">
            <Line data={chartData} options={chartOptions} />
            <div className="report-button-container">
              <Button
                type="primary"
                className="report-button"
                onClick={handleReport}
              >
                Report
              </Button>
            </div>
          </div>
        ) : (
          <></>
        )}
      </div>
      <Footer />
    </>
  );
}

export default KoiDetail;
