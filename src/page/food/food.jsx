import { Button, Divider, Form, Select, Spin, Tooltip } from "antd";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import "./food.scss";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { InfoCircleOutlined } from "@ant-design/icons";
const { Option } = Select;
function Food() {
  const navigate = useNavigate();
  const [ponds, setPonds] = useState([]);
  const [selectedPond, setSelectedPond] = useState("All pond");
  const [koiWeight, setKoiWeight] = useState("");
  const [loading, setLoading] = useState(false);
  const [growth, setGrowth] = useState("low");
  const [temperature, setTemperature] = useState("6-8");
  const [isMediumHighDisabled, setIsMediumHighDisabled] = useState(true);

  useEffect(() => {
    const fetchPonds = async () => {
      try {
        const accId = localStorage.getItem("userId");
        const response = await axios.get(
          `https://koicaresystemapi.azurewebsites.net/api/Show-All-Ponds-UserID/${accId}`
        );
        setPonds(response.data.listPond["$values"]);
        console.log(response.data.listPond["$values"]);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách hồ", error);
      }
    };
    fetchPonds();
  }, []);

  // const lấy tổng cân nặng
  const fetchAllKoiWeights = async () => {
    let totalWeight = 0;
    for (const pond of ponds) {
      try {
        const response = await axios.get(
          `https://koicaresystemapi.azurewebsites.net/api/pond/${pond.pondId}/Koi` //API lấy danh sách cá koi trong ponds
        );
        const koiList = response.data.$values;
        const pondWeight = koiList.reduce((sum, koi) => sum + koi.weight, 0);
        totalWeight += pondWeight;
      } catch (error) {
        console.error(`Error fetching koi data for pond ${pond.pondId}`, error);
      }
    }
    return totalWeight;
  };

  // Const chọn một hồ hoặc tất cả hồ
  const handlePondChange = async (value) => {
    setSelectedPond(value);
    if (value === "All ponds") {
      setLoading(true);
      const totalWeight = await fetchAllKoiWeights();
      setKoiWeight(totalWeight);
      setLoading(false);
    } else {
      setLoading(true);
      try {
        const response = await axios.get(
          `https://koicaresystemapi.azurewebsites.net/api/pond/${value}/Koi`
        );
        const koiList = response.data.$values;
        const totalWeight = koiList.reduce((sum, koi) => sum + koi.weight, 0);
        setKoiWeight(totalWeight);
      } catch (error) {
        console.error("Error fetching koi data", error);
      }
      setLoading(false);
    }
  };

  const calculateRecommendedAmount = (weight, growth, temperatureRange) => {
    let recommendedAmount = 0;

    const [minTemp, maxTemp] = temperatureRange.split("-").map(Number);
    const avgTemp = (minTemp + maxTemp) / 2;

    // Const tính lượng thức ăn
    if (growth === "low") {
      if (avgTemp < 15) {
        recommendedAmount = weight * 0.005;
      } else if (avgTemp >= 15 && avgTemp <= 20) {
        recommendedAmount = weight * 0.01;
      } else if (avgTemp > 20) {
        recommendedAmount = weight * 0.02;
      }
    } else if (growth === "medium") {
      if (avgTemp < 15) {
        recommendedAmount = weight * 0.01;
      } else if (avgTemp >= 15 && avgTemp <= 20) {
        recommendedAmount = weight * 0.015;
      } else if (avgTemp > 20) {
        recommendedAmount = weight * 0.025;
      }
    } else if (growth === "high") {
      if (avgTemp < 15) {
        recommendedAmount = weight * 0.01;
      } else if (avgTemp >= 15 && avgTemp <= 20) {
        recommendedAmount = weight * 0.025;
      } else if (avgTemp > 20) {
        recommendedAmount = weight * 0.04;
      }
    }
    return recommendedAmount;
  };

  // Xử lý khi thay đổi nhiệt độ nước
  const handleTemperatureChange = (value) => {
    setTemperature(value);
    if (value === "6-8" || value == "9-12") {
      setGrowth("low");
      setIsMediumHighDisabled(true);
    } else if (value === "13-16") {
      setIsMediumHighDisabled(false);
    }
  };

  // Xử lý khi thay đổi mức tăng trưởng
  const handleGrowthChange = (value) => {
    setGrowth(value);
  };
  return (
    <>
      <Header />
      <div className="food_background_form">
        <div className="food_container">
          <div className="food_title">Food Calculator</div>
          <div className="food_divi">
            <Divider />
          </div>
          <div className="food_form_wrapper">
            {/*Left-form*/}
            <div className="food_left_form">
              <Form layout="vertical">
                <Form.Item label="Name: ">
                  <Select
                    defaultValue="All ponds"
                    onChange={handlePondChange}
                    style={{ width: 200 }}
                  >
                    <Option value="All ponds">All ponds</Option>
                    {ponds.map((pond) => (
                      <Option key={pond.pondId} value={pond.pondId}>
                        {pond.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item label="Total koi weight: ">
                  {loading ? <Spin /> : <p>{koiWeight} g</p>}
                </Form.Item>

                {/*Desired Growth*/}
                <Form.Item label="Desired Growth:">
                  <div className="growth-buttons">
                    <Button
                      type={growth === "low" ? "primary" : "default"}
                      onClick={() => handleGrowthChange("low")}
                    >
                      Low
                    </Button>
                    <Button
                      type={growth === "medium" ? "primary" : "default"}
                      onClick={() => handleGrowthChange("medium")}
                      disabled={isMediumHighDisabled}
                    >
                      Medium
                    </Button>
                    <Button
                      type={growth === "high" ? "primary" : "default"}
                      onClick={() => handleGrowthChange("high")}
                      disabled={isMediumHighDisabled}
                    >
                      High
                    </Button>
                  </div>
                </Form.Item>

                {/* Water Temperature */}
                <Form.Item label="Water Temperature:">
                  <div className="temperature-buttons">
                    <Button
                      type={temperature === "6-8" ? "primary" : "default"}
                      onClick={() => handleTemperatureChange("6-8")}
                    >
                      6-8°
                    </Button>
                    <Button
                      type={temperature === "9-12" ? "primary" : "default"}
                      onClick={() => handleTemperatureChange("9-12")}
                    >
                      9-12°
                    </Button>
                    <Button
                      type={temperature === "13-16" ? "primary" : "default"}
                      onClick={() => handleTemperatureChange("13-16")}
                    >
                      13-16°
                    </Button>
                    <Button
                      type={temperature === "17-20" ? "primary" : "default"}
                      onClick={() => handleTemperatureChange("17-20")}
                    >
                      17-20°
                    </Button>
                    <Button
                      type={temperature === "21-28" ? "primary" : "default"}
                      onClick={() => handleTemperatureChange("21-28")}
                    >
                      21-28°
                    </Button>
                  </div>
                </Form.Item>
              </Form>
            </div>

            {/*Right-form: Feeding infomation */}
            <div className="food_right_form">
              {temperature === "6-8" && (
                <div>
                  <h3>Feeding information</h3>
                  <p>
                    The specified amount of food should only be given to the koi{" "}
                    <strong>every 2-3 days</strong>. When the temperature is
                    below 6°C, feeding should be omitted in any case! In the
                    temperature range 6-8°C, the growth targets{" "}
                    <strong>medium</strong> and <strong>high</strong> are not
                    selectable due to the reduced metabolism of the koi.
                  </p>
                </div>
              )}
              {temperature === "9-12" && (
                <div>
                  <h3>Feeding information</h3>
                  <p>
                    The recommended amount of food should be split evenly into{" "}
                    <strong>2-3 feedings per day</strong>. In the temperature
                    range 9-12°C the growth targets <strong>medium</strong> and{" "}
                    <strong>high</strong> are not selectable due to the reduced
                    metabolism of the koi.
                  </p>
                </div>
              )}
              {temperature === "13-16" && (
                <div>
                  <h3>Feeding information</h3>
                  <p>
                    The recommended amount of food should be split evenly into{" "}
                    <strong>3-5 feedings per day</strong>. This way the koi will
                    ingest the food better.
                  </p>
                </div>
              )}
              {temperature === "17-20" && (
                <div>
                  <h3>Feeding information</h3>
                  <p>
                    The recommended amount of food should be split evenly into{" "}
                    <strong>4-6 feedings per day</strong>. This way the koi will
                    ingest the food better.
                  </p>
                </div>
              )}
              {temperature === "21-28" && (
                <div>
                  <h3>Feeding information</h3>
                  <p>
                    The recommended amount of food should be split evenly into{" "}
                    <strong>4-8 feedings per day</strong>. This way the koi will
                    ingest the food better. Feeding is not recommended at a
                    temperature above 28°C!
                  </p>
                </div>
              )}
              <div className="food_expert">
                <div className="food_expert_info">
                <h4>Expert mode</h4>
                <Tooltip 
                  title="When this mode is activated, users can adjust the percentage of food
                  based on the total koi weight of the fish in the pond"
                >
                  <InfoCircleOutlined style={{ fontSize: '20px', color: 'red', marginRight: '8px' }} />
                </Tooltip>
                </div>
                <p> <strong>"Expert mode"</strong> is an optional setting in the application or calculation 
                  system designed for users 
                  with experience in caring for Koi fish.</p>
                <Button
                  type="primary"
                  onClick={() => navigate("/expert")}
                  style={{ display: "inline-block" }}
                >
                  <p>Go to expert mode</p>
                </Button>
              </div>
            </div>
          </div>

          <div className="recommend_amount_section">
              {loading ? (
                <Spin />
              ) : (
                <>
                  <p>Recommended food amount:</p>
                  <p className="amount-value">
                    {growth === "low" && temperature === "6-8"
                      ? `${calculateRecommendedAmount(
                          koiWeight,
                          growth,
                          temperature
                        ).toFixed(2)} g per feeding`
                      : `${calculateRecommendedAmount(
                          koiWeight,
                          growth,
                          temperature
                        ).toFixed(2)} g per day`}
                  </p>
                </>
              )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Food;
