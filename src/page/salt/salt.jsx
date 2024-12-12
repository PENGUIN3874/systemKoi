import "./salt.scss";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import { Divider, Form, Select, Slider, Tooltip } from "antd";
import { useEffect, useState } from "react";
import axios from "axios";
import { WarningOutlined } from "@ant-design/icons";
const { Option } = Select;
function Salt() {
  const [ponds, setPonds] = useState([]);
  const [totalVolume, setTotalVolume] = useState(0);
  const [currentConcentration, setCurrentConcentration] = useState(0);
  const [disiredConcentration, setDisiredConcentration] = useState(0);
  const [waterChangeAmount, setWaterChangeAmount] = useState(0);

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

  const handlePondChange = async (pondId) => {
    if (pondId === "All ponds") {
      const total = ponds.reduce((sum, pond) => sum + pond.volume, 0);
      setTotalVolume(total);
    } else {
      try {
        const response = await axios.get(
          `https://koicaresystemapi.azurewebsites.net/api/Show-Specific-Pond/${pondId}`
        );
        setTotalVolume(response.data.pond.volume);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin hồ", error);
      }
    }
  };

  // const waterChangePercent = Math.round(
  //   (waterChangeAmount / totalVolume) * 100
  // );

  // const amountOfSalt =
  //   disiredConcentration > currentConcentration
  //     ? (totalVolume * (disiredConcentration - currentConcentration)).toFixed(2)
  //     : 0;

  // const perWaterChange = (waterChangeAmount * disiredConcentration).toFixed(2);

  const waterChangePercent = Math.round(
    (waterChangeAmount / totalVolume) * 100
  );

  // Tính lượng muối cần thêm hoặc nước cần thay để đạt nồng độ mong muốn
  const amountOfSalt = disiredConcentration > currentConcentration
    ? (totalVolume * (disiredConcentration - currentConcentration)).toFixed(2)
    : 0;

  const perWaterChange = (waterChangeAmount * disiredConcentration).toFixed(2);

  // Tính lượng nước cần thay nếu giảm nồng độ muối
  const waterToReduceSalt = disiredConcentration < currentConcentration
    ? (totalVolume * ((currentConcentration - disiredConcentration) / currentConcentration)).toFixed(2)
    : 0;

  return (
    <>
      <Header />
      <div className="salt_background_form">
        <div className="salt_container">
          <div className="salt_title">Salt Calculator</div>
          <div className="salt_divider"><Divider /></div>
          <div className="salt_form-wrapper">
            {/*left-form*/}
            <div className="salt_left_form">
              <Form layout="vertical">
                <Form.Item label="Name:">
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

                <Form.Item label="Total volume:">
                  <div className="salt_totalall">{totalVolume} l</div>
                </Form.Item>

                <Form.Item
                  label={`Current concentration: ${currentConcentration}%`}
                  className="salt_current"
                >
                  <Slider
                    min={0}
                    max={2}
                    step={0.01}
                    value={currentConcentration}
                    onChange={setCurrentConcentration}
                    tooltipVisible
                  />
                </Form.Item>

                <Form.Item
                  label={`Disired concentration: ${disiredConcentration}%`}
                  className="salt_disired"
                >
                  <Slider
                    min={0}
                    max={2}
                    step={0.01}
                    value={disiredConcentration}
                    onChange={setDisiredConcentration}
                    tooltipVisible
                  />
                </Form.Item>

                <Form.Item
                  label={`Water change: ${waterChangeAmount} l (${waterChangePercent}%)`}
                >
                  <Slider
                    min={0}
                    max={100}
                    step={1}
                    value={(waterChangeAmount / totalVolume) * 100}
                    onChange={(percent) => {
                      const newAmount = ((percent / 100) * totalVolume).toFixed(
                        2
                      ); 
                      setWaterChangeAmount(Number(newAmount)); 
                    }}
                    tooltipVisible
                  />
                </Form.Item>
              </Form>
            </div>

            {/*Right form*/}
            <div className="salt_right_form">
              <div className="salt_disclaimer">
                <h3>Disclaimer</h3>
                <p>
                  Only add pure salt without iodine to the water! Too high of a
                  salt concentration can be damaging to the koi. If you are
                  unsure, please talk to a veterinarian. For fighting diseases
                  and algae or for taking precautions a concentration of 0.5 %
                  is recommended.
                </p>
              </div>
              <div className="salt_instruct">
                <h3>Instructions</h3>
                <h4>1. Increase Salt Concentration</h4>
                <ul>
                  <li>
                  The user selects a pond, enters the current salt concentration and the desired concentration
                   (higher than the current concentration), then the tool will calculate the amount of salt needed to add.
                  </li>
                </ul>
                <h4>2. Decrease Salt Concentration</h4>
                <ul>
                  <li>
                  The user selects a pond, enters the current salt concentration and the desired concentration 
                  (lower than the current concentration), then the tool will calculate the amount of water needed to replace.
                  </li>
                </ul>
              </div>
              <div className="salt_warning_tooltip">
                <h3>Warning</h3>
                <Tooltip
                  title={
                    <div className="salt_warning_content">
                      <h3>Warnings</h3>
                      <ul>
                        <li>Only change the salt concentration by 0.5-1% at a time to avoid stressing the fish.</li>
                        <li>Avoid maintaining salt levels above 2% for prolonged periods.</li>
                        <li>Replace water gradually to reduce salt concentration, ideally no more than 10-20% per change.</li>
                        <li>Monitor the fish's health after each adjustment. If they appear stressed, stop and consider returning to a safer level.</li>
                        <li>Consult a specialist if you’re uncertain about the appropriate salt levels.</li>
                      </ul>
                    </div>
                  }
                  placement="top"
                >
                  <WarningOutlined style={{ fontSize: "24px", color: "red", cursor: "pointer" }} />
                </Tooltip>
              </div>
            </div>
          </div>
          <div className="salt_result">
            <div className="result_item">
              <span>Amount of salt: </span>
              <span>{amountOfSalt} kg</span>
            </div>
            <div className="result_item">
              <span>Per water change (refill): </span>
              <span>{perWaterChange} kg</span>
            </div>
            {disiredConcentration < currentConcentration && (
              <div className="result_item">
                <span>Water needed to reduce salt: </span>
                <span>{waterToReduceSalt} l</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Salt;
