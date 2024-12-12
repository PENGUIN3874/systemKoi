import { Divider, Form, Select, Slider, Spin } from "antd";
import "./expert.scss";
import Header from "../../components/header/header";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
const { Option } = Select;
function Expert() {
  const navigate = useNavigate();
  const [ponds, setPonds] = useState([]);
  const [selectedPond, setSelectedPond] = useState("All pond");
  const [koiWeight, setKoiWeight] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPercentage, setCurrentPercentage] = useState(0.1);
  const [recommendedAmount, setRecommendedAmount] = useState(0);

  useEffect(() => {
    const fetchPonds = async () => {
      try {
        const accID = localStorage.getItem("userId");
        const response = await axios.get(
          `https://koicaresystemapi.azurewebsites.net/api/Show-All-Ponds-UserID/${accID}`
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

  const handlePercentageChange = (value) => {
    setCurrentPercentage(value);
  };

  const calculateRecommendedAmount = useCallback(() => {
    const amount = (koiWeight * currentPercentage) / 100;
    setRecommendedAmount(amount.toFixed(2));
  }, [koiWeight, currentPercentage]);

  useEffect(() => {
    calculateRecommendedAmount();
  }, [koiWeight, currentPercentage, calculateRecommendedAmount]);

  return (
    <>
      <Header />
      <div className="exp_background_form">
        <div className="exp_container">
          <div className="exp_header">
            <button
              className="normal_mode_button"
              onClick={() => navigate("/food")}
            >
              <span className="back_arrow">←</span> Normal mode
            </button>
            <div className="exp_title">Food Calculator</div>
          </div>

          <div className="exp_divider">
            <Divider />
          </div>

          <div className="exp_form_wrapper">
            <div className="exp_left_form">
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
                <Form.Item>
                  <div className="koi_weight_wrapper">
                    <span>Total weight of kois in pond: </span>
                    {loading ? <Spin /> : <span className="koi_weight_value">{koiWeight} g</span>}
                  </div>
                </Form.Item>

                <Form.Item label="Current percentage: ">
                  <Slider
                    min={0.1} 
                    max={2.5} 
                    step={0.1} 
                    marks={{
                      0.1: "",
                      0.2: "",
                      0.3: "",
                      0.4: "",
                      0.5: "",
                      0.6: "",
                      0.7: "",
                      0.8: "",
                      0.9: "",
                      1: "",
                      1.1: "",
                      1.2: "",
                      1.3: "",
                      1.4: "",
                      1.5: "",
                      1.6: "",
                      1.7: "",
                      1.8: "",
                      1.9: "",
                      2: "",
                      2.1: "",
                      2.2: "",
                      2.3: "",
                      2.4: "",
                      2.5: "",
                    }}
                    defaultValue={0.1}
                    value={currentPercentage}
                    onChange={handlePercentageChange}
                  />
                  <p>{currentPercentage}%</p>
                </Form.Item>
              </Form>
            </div>

            {/*Right form: Info*/}
            <div className="exp_right_form">
              <div className="exp_warning">
                <h3>
                  <ExclamationCircleOutlined
                    style={{ color: "red", marginRight: 8}}
                  />
                  Info about the expert mode
                </h3>
                <p>
                  <strong>We still recommend using the preset food calculator! Use the
                  expert mode only if you already have a lot of experience with
                  koi and know what you are doing!</strong>
                </p>
                <p>
                  The expert mode offers you customized setting options to
                  determine what proportion of the total fish weight you want to
                  feed. The total fish weight is the sum of the weights for each
                  individual koi in the selected pond. The weight of an
                  individual koi can either be approximated by its length or
                  entered by you directly.
                </p>
              </div>
            </div>
          </div>
          <div className="exp_recommendation">
            <div className="exp_recommendation_label">Recommended amount: </div>
            <div className="exp_recommendation_value">
              {recommendedAmount} g per day
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
export default Expert;
