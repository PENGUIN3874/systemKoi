import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import "bootstrap-icons/font/bootstrap-icons.css";
import bg from "../../img/a10.jpg";
import "./viewpond.scss";
import { Form, Input, Row, Col, Button, Select, notification } from "antd";
import { useEffect, useState } from "react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Label,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const { Option } = Select;

function Viewpond() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [waterParamsForm] = Form.useForm();
  const [chartData, setChartData] = useState([]);
  const [pondData, setPondData] = useState([]);
  const [selectedParameter, setSelectedParameter] = useState("temperature");
  const [isMember, setIsMember] = useState(false);
  const [outOfStandard, setOutOfStandard] = useState({});
  const [radarData, setRadarData] = useState([]);

  useEffect(() => {
    const fetchPondData = async () => {
      try {
        const response = await axios.get(
          `https://koicaresystemapi.azurewebsites.net/api/WaterParameter/get-all${id}`
        );
        if (response.status === 200) {
          const data = response.data.parameter.$values;
          setPondData(data);
          setRadarData(createRadarData(data[data.length - 1])); // Lấy dữ liệu mới nhất để tạo biểu đồ radar
        }
      } catch (error) {
        console.error("Error fetching pond data:", error);
      }
    };

    fetchPondData();
  }, [id]);

  // Hàm chuyển đổi dữ liệu sang dạng radar
  const createRadarData = (data) => {
    return [
      {
        parameter: "Temperature",
        value: parseFloat(((data.temperature / 26) * 100).toFixed(2)), // Làm tròn đến 2 chữ số thập phân
        fullMark: 100,
      },
      {
        parameter: "Salt",
        value: parseFloat(((data.salt / 0.1) * 100).toFixed(2)),
        fullMark: 100,
      },
      {
        parameter: "pH Level",
        value: parseFloat(((data.phLevel / 8) * 100).toFixed(2)),
        fullMark: 100,
      },
      {
        parameter: "O2 Level",
        value: parseFloat(((data.o2Level / 18) * 100).toFixed(2)),
        fullMark: 100,
      },
      {
        parameter: "PO4 Level",
        value: parseFloat(((data.po4Level / 0.035) * 100).toFixed(2)),
        fullMark: 100,
      },
      {
        parameter: "NO2 Level",
        value: parseFloat(((data.no2Level / 0.1) * 100).toFixed(2)),
        fullMark: 100,
      },
      {
        parameter: "NO3 Level",
        value: parseFloat(((data.no3Level / 20) * 100).toFixed(2)),
        fullMark: 100,
      },
    ];
  };

  useEffect(() => {
    createChartData();
  }, []);

  // Khởi tạo các giá trị ban đầu là null
  const [currentParameter, setCurrentParameter] = useState({
    temperature: null,
    salt: null,
    phLevel: null,
    o2Level: null,
    totalChlorines: null,
    po4Level: null,
    no2Level: null,
    no3Level: null,
  });

  const [isEditing, setIsEditing] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));

  // gán thông số tiêu chuẩn cho các thông số
  const standardData = {
    temperature: { min: 5, max: 26 },
    salt: { min: 0, max: 0.1 },
    phLevel: { min: 6.9, max: 8 },
    o2Level: { min: 6.5, max: 18 },
    totalChlorines: { min: 0, max: 0.001 },
    po4Level: { min: 0, max: 0.035 },
    no2Level: { min: 0, max: 0.1 },
    no3Level: { min: 0, max: 20 },
  };

  // render lại kiểm tra tài khoản có phải member không
  useEffect(() => {
    if (user.role.toLocaleLowerCase() === "member") {
      setIsMember(true);
    } else {
      setIsMember(false);
    }
    console.log(isMember);
    const fetchParamData = async () => {
      try {
        const response = await axios.get(
          `https://koicaresystemapi.azurewebsites.net/api/WaterParameter/get-param${id}`
        );
        if (response.status === 200) {
          const data = response.data.parameter;
          waterParamsForm.setFieldsValue(data);
          setCurrentParameter({
            temperature: data.temperature || null,
            salt: data.salt || null,
            phLevel: data.phLevel || null,
            o2Level: data.o2Level || null,
            totalChlorines: data.totalChlorines || null,
            po4Level: data.po4Level || null,
            no2Level: data.no2Level || null,
            no3Level: data.no3Level || null,
          });
        }
      } catch (error) {
        console.error("Error fetching pond data:", error);
      }
    };
    fetchParamData();
  }, [id]);

  // Thiết lập giá trị mới nhất cho mực nước
  useEffect(() => {
    if (currentParameter) {
      waterParamsForm.setFieldsValue(currentParameter);
    }
  }, [currentParameter, waterParamsForm]);

  // Thiết lập các giá trị cho chart
  useEffect(() => {
    const fetchPondData = async () => {
      try {
        const response = await axios.get(
          `https://koicaresystemapi.azurewebsites.net/api/WaterParameter/get-all${id}`
        );
        if (response.status === 200) {
          const data = response.data.parameter.$values;
          setPondData(data);
          const chartDataFormatted = createChartData(data, selectedParameter);
          setChartData(chartDataFormatted);
        }
      } catch (error) {
        console.error("Error fetching pond data:", error);
      }
    };

    fetchPondData();
  }, [id, selectedParameter]);

  // Hàm tạo chart
  const createChartData = (updatedValues, selectedParam) => {
    if (!Array.isArray(updatedValues)) {
      console.error("Expected array, but got:", updatedValues);
      return [];
    }

    return updatedValues.map((data) => {
      const date = new Date(data.date);
      return {
        name: date.toDateString(),
        min: standardData[selectedParam].min,
        max: standardData[selectedParam].max,
        value: data[selectedParam] || 0,
      };
    });
  };

  // Kiểm tra thông số có đạt tiêu chuẩn hay không
  const checkAllParameters = () => {
    let newOutOfStandard = {};
    Object.keys(currentParameter).forEach((param) => {
      const value = currentParameter[param];
      if (value !== null && standardData[param]) {
        if (value < standardData[param].min) {
          newOutOfStandard[param] = `below standard by ${
            standardData[param].min - value
          }`;
        } else if (value > standardData[param].max) {
          newOutOfStandard[param] = `above standard by ${
            value - standardData[param].max
          }`;
        }
      }
    });
    setOutOfStandard(newOutOfStandard);
  };
  useEffect(() => {
    checkAllParameters();
  }, [currentParameter]);

  // thiết lập lựa chọn các thông số
  const handleParameterChange = (value) => {
    setSelectedParameter(value);
    const updatedChartData = createChartData(pondData, value);
    setChartData(updatedChartData);
  };

  // Hàm submit form
  const handleWaterParamsFormFinish = async (values) => {
    const pondId = pondData.length > 0 ? pondData[0].pondId : values.pondId;

    const postData = {
      pondId,
      temperature: values.temperature,
      salt: values.salt,
      phLevel: values.phLevel,
      o2Level: values.o2Level,
      totalChlorines: values.totalChlorines,
      po4Level: values.po4Level,
      no2Level: values.no2Level,
      no3Level: values.no3Level,
    };

    try {
      const response = await axios.post(
        `https://koicaresystemapi.azurewebsites.net/api/WaterParameter/save-param${id}`,
        postData,
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.status === 200 || response.status === 201) {
        const newData = response.data;
        setCurrentParameter({
          temperature: newData.temperature || null,
          salt: newData.salt || null,
          phLevel: newData.phLevel || null,
          o2Level: newData.o2Level || null,
          totalChlorines: newData.totalChlorines || null,
          po4Level: newData.po4Level || null,
          no2Level: newData.no2Level || null,
          no3Level: newData.no3Level || null,
        });
        setRadarData(createRadarData(newData));
        setPondData((prevData) => {
          const updatedPondData = [...prevData, newData];
          setChartData(createChartData(updatedPondData, selectedParameter));
          return updatedPondData;
        });
        notification.success({
          description: `The parameters have save succefully!!`,
          placement: "topRight",
        });
      } else {
        console.error("Failed to save Water Parameters:", response);
        notification.error({
          description:
            "There was an issue while processing. Please try again later.",
          placement: "topRight",
        });
      }
    } catch (error) {
      console.error(
        "Error saving Water Parameters:",
        error.response ? error.response.data : error
      );
    }
  };

  // Chuyển đổi giữa view và edit
  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  return (
    <>
      <Header />

      <div className="ViewPage">
        <div className="ViewPage__img">
          <img src={bg} alt="" />
        </div>

        <h1>Water Parameters</h1>
        <i
          className="bi bi-arrow-left-circle"
          style={{
            fontSize: "40px",
            marginLeft: "100px",
            cursor: "pointer",
          }}
          onClick={() => navigate("/environment")}
        ></i>
        <div className="ViewPage__Water">
          <Form
            form={waterParamsForm}
            className="Environment__form"
            onFinish={handleWaterParamsFormFinish}
            onValuesChange={checkAllParameters}
            layout="vertical"
            initialValues={currentParameter}
          >
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  hidden={true}
                  label="ParameterId:"
                  name="parameterId"
                >
                  <Input />
                </Form.Item>

                <Form.Item
                  label="Temperature:"
                  name="temperature"
                  tooltip="Please enter a value between 5 and 26 °C."
                  rules={[
                    {
                      type: "number",
                      min: 0,
                      message: "Temperature must be 0 or greater!",
                      transform: (value) => Number(value),
                    },
                  ]}
                >
                  <Input type="number" disabled={!isEditing} />
                </Form.Item>
                {outOfStandard.temperature && (
                  <p className="out-of-standard">
                    Warning: Temperature {outOfStandard.temperature} !
                  </p>
                )}

                <Form.Item
                  label="Salt:"
                  name="salt"
                  tooltip="Please enter a value between 0 and 0.1 %."
                  rules={[
                    {
                      type: "number",
                      min: 0,
                      message: "Salt must be 0 or greater!",
                      transform: (value) => Number(value),
                    },
                  ]}
                >
                  <Input type="number" disabled={!isEditing} />
                </Form.Item>
                {outOfStandard.salt && (
                  <p className="out-of-standard">
                    Warning: Salt {outOfStandard.salt} !
                  </p>
                )}

                <Form.Item
                  label="PhLevel:"
                  name="phLevel"
                  tooltip="Please enter a value between 6.9 and 8."
                  rules={[
                    {
                      type: "number",
                      min: 0,
                      message: "PhLevel must be 0 or greater!",
                      transform: (value) => Number(value),
                    },
                  ]}
                >
                  <Input type="number" disabled={!isEditing} />
                </Form.Item>
                {outOfStandard.phLevel && (
                  <p className="out-of-standard">
                    Warning: PhLevel {outOfStandard.phLevel} !
                  </p>
                )}

                <Form.Item
                  label="O2Level:"
                  name="o2Level"
                  tooltip="Please enter a value between 6.5 and 18 mg/l."
                  rules={[
                    {
                      type: "number",
                      min: 0,
                      message: "O2Level must be 0 or greater!",
                      transform: (value) => Number(value),
                    },
                  ]}
                >
                  <Input type="number" disabled={!isEditing} />
                </Form.Item>
                {outOfStandard.o2Level && (
                  <p className="out-of-standard">
                    Warning: O2Level {outOfStandard.o2Level} !
                  </p>
                )}
              </Col>

              <Col xs={24} sm={12}>
                <Form.Item
                  label="Po4Level:"
                  name="po4Level"
                  tooltip="Please enter a value between 0 and 0.035 mg/l."
                  rules={[
                    {
                      type: "number",
                      min: 0,
                      message: "Po4Level must be 0 or greater!",
                      transform: (value) => Number(value),
                    },
                  ]}
                >
                  <Input type="number" disabled={!isEditing} />
                </Form.Item>
                {outOfStandard.po4Level && (
                  <p className="out-of-standard">
                    Warning: Po4Level {outOfStandard.po4Level} !
                  </p>
                )}

                <Form.Item
                  label="No2Level:"
                  name="no2Level"
                  tooltip="Please enter a value between 0 and 0.1 mg/l."
                  rules={[
                    {
                      type: "number",
                      min: 0,
                      message: "No2Level must be 0 or greater!",
                      transform: (value) => Number(value),
                    },
                  ]}
                >
                  <Input type="number" disabled={!isEditing} />
                </Form.Item>
                {outOfStandard.no2Level ? (
                  <p className="out-of-standard">
                    Warning: No2Level {outOfStandard.no2Level} !
                  </p>
                ) : (
                  ""
                )}

                <Form.Item
                  label="No3Level:"
                  name="no3Level"
                  tooltip="Please enter a value between 0 and 20 mg/l."
                  rules={[
                    {
                      type: "number",
                      min: 0,
                      message: "No3Level must be 0 or greater!",
                      transform: (value) => Number(value),
                    },
                  ]}
                >
                  <Input type="number" disabled={!isEditing} />
                </Form.Item>
                {outOfStandard.no3Level && (
                  <p className="out-of-standard">
                    Warning: No3Level {outOfStandard.no3Level} !
                  </p>
                )}

                <Form.Item
                  label="TotalChlorines:"
                  name="totalChlorines"
                  hidden={true}
                  tooltip="Please enter a value between 0 and 0.001 mg/l."
                  rules={[
                    {
                      type: "number",
                      min: 0,
                      message: "TotalChlorines must be 0 or greater!",
                      transform: (value) => Number(value),
                    },
                  ]}
                >
                  <Input type="number" disabled={!isEditing} />
                </Form.Item>
                {/* {outOfStandard.totalChlorines && (
                  <p className="out-of-standard">
                    Warning: TotalChlorines {outOfStandard.totalChlorines} !
                  </p>
                )} */}
              </Col>
            </Row>

            <div className="save-edit-buttons">
              <Button type="primary" htmlType="submit" disabled={!isEditing}>
                Save
              </Button>
              <Button type="default" onClick={toggleEditMode}>
                {isEditing ? "Cancel" : "Edit"}
              </Button>
            </div>
          </Form>

          {isMember ? (
            <div>
              <Select
                value={selectedParameter}
                style={{ width: 120 }}
                onChange={handleParameterChange}
              >
                <Option value="temperature">Temperature</Option>
                <Option value="salt">Salt</Option>
                <Option value="phLevel">pH Level</Option>
                <Option value="o2Level">O2 Level</Option>
                {/* <Option value="totalChlorines">Total Chlorines</Option> */}
                <Option value="po4Level">PO4 Level</Option>
                <Option value="no2Level">NO2 Level</Option>
                <Option value="no3Level">NO3 Level</Option>
              </Select>
              <LineChart
                key={JSON.stringify(chartData)}
                width={600}
                height={300}
                data={chartData}
                margin={{ top: 25, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name">
                  <Label value="Date" offset={-7} position="bottom" />
                </XAxis>
                <YAxis
                  domain={[
                    standardData[selectedParameter].min,
                    standardData[selectedParameter].max,
                  ]}
                >
                  <Label
                    value={selectedParameter}
                    angle={-90}
                    position="insideLeft"
                  />
                </YAxis>
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#8884d8"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="min"
                  stroke="#82ca9d"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="max"
                  stroke="#ff7300"
                  dot={false}
                />
                <Legend />
              </LineChart>

              <RadarChart
                outerRadius={90}
                width={650}
                height={400}
                data={radarData}
              >
                <PolarGrid />
                <PolarAngleAxis dataKey="parameter" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Tooltip />
                <Radar
                  name="Water Parameters"
                  dataKey="value"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.6}
                />
              </RadarChart>

              <div className="Warning">
                <h3>Parameter Status</h3>
                <div className="warning-content">
                  <p>
                    <strong>Temperature:</strong>
                    {outOfStandard.temperature ? (
                      <span className="out-of-standard">
                        <i className="icon-warning"></i>{" "}
                        {outOfStandard.temperature}
                      </span>
                    ) : (
                      <span className="in-standard">Within standard range</span>
                    )}
                  </p>
                  <p>
                    <strong>Salt:</strong>
                    {outOfStandard.salt ? (
                      <span className="out-of-standard">
                        <i className="icon-warning"></i> {outOfStandard.salt}
                      </span>
                    ) : (
                      <span className="in-standard">Within standard range</span>
                    )}
                  </p>
                  <p>
                    <strong>pH Level:</strong>
                    {outOfStandard.phLevel ? (
                      <span className="out-of-standard">
                        <i className="icon-warning"></i> {outOfStandard.phLevel}
                      </span>
                    ) : (
                      <span className="in-standard">Within standard range</span>
                    )}
                  </p>
                  <p>
                    <strong>O2 Level:</strong>
                    {outOfStandard.o2Level ? (
                      <span className="out-of-standard">
                        <i className="icon-warning"></i> {outOfStandard.o2Level}
                      </span>
                    ) : (
                      <span className="in-standard">Within standard range</span>
                    )}
                  </p>
                  <p>
                    <strong>PO4 Level:</strong>
                    {outOfStandard.po4Level ? (
                      <span className="out-of-standard">
                        <i className="icon-warning"></i>{" "}
                        {outOfStandard.po4Level}
                      </span>
                    ) : (
                      <span className="in-standard">Within standard range</span>
                    )}
                  </p>
                  <p>
                    <strong>NO2 Level:</strong>
                    {outOfStandard.no2Level ? (
                      <span className="out-of-standard">
                        <i className="icon-warning"></i>{" "}
                        {outOfStandard.no2Level}
                      </span>
                    ) : (
                      <span className="in-standard">Within standard range</span>
                    )}
                  </p>
                  <p>
                    <strong>NO3 Level:</strong>
                    {outOfStandard.no3Level ? (
                      <span className="out-of-standard">
                        <i className="icon-warning"></i>{" "}
                        {outOfStandard.no3Level}
                      </span>
                    ) : (
                      <span className="in-standard">Within standard range</span>
                    )}
                  </p>
                  {/* <p>
                    <strong>Total Chlorines:</strong>
                    {outOfStandard.totalChlorines ? (
                      <span className="out-of-standard">
                        <i className="icon-warning"></i>{" "}
                        {outOfStandard.totalChlorines}
                      </span>
                    ) : (
                      <span className="in-standard">Within standard range</span>
                    )}
                  </p> */}
                </div>
              </div>
            </div>
          ) : (
            <b className="buymembership">
              You must buy membership to view chart information!
            </b>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Viewpond;
