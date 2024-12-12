import {
  DollarOutlined,
  ProductOutlined,
  ShopOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Card,
  Space,
  Statistic,
  Table,
  Typography,
  Tooltip,
  Select,
} from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import { Column, Pie } from "@ant-design/plots";
import "./dashboard.scss";
function Dashboard() {
  const [totalAccounts, setTotalAccounts] = useState(0);
  const [totalShops, setTotalShops] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalMemberRevenue, setTotalMemberRevenue] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const accountRes = await axios.get(
          "https://koicaresystemapi.azurewebsites.net/api/Account/get-all"
        );
        setTotalAccounts(accountRes.data.total);

        const shopRes = await axios.get(
          "https://koicaresystemapi.azurewebsites.net/api/Shop/get-all"
        );
        setTotalShops(shopRes.data.total);

        const productRes = await axios.get(
          "https://koicaresystemapi.azurewebsites.net/api/Product/get-all"
        );
        setTotalProducts(productRes.data.total);

        const memberRevenue = await axios.get(
          "https://koicaresystemapi.azurewebsites.net/api/MemberRevenue"
        );
        setTotalMemberRevenue(memberRevenue.data.total);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <Space size={20} direction="vertical">
        <h1 className="vertical">Dashboard</h1>
        <Space direction="horizontal">
          <DashboardCard
            icon={
              <UserOutlined
                style={{
                  color: "dark",
                  backgroundColor: "#b3f0ff",
                  borderRadius: 20,
                  fontSize: 24,
                  padding: 8,
                }}
              />
            }
            title={"Accounts"}
            value={totalAccounts}
          />
          <DashboardCard
            icon={
              <ShopOutlined
                style={{
                  color: "#666600",
                  backgroundColor: "#ffff66",
                  borderRadius: 20,
                  fontSize: 24,
                  padding: 8,
                }}
              />
            }
            title={"Shops"}
            value={totalShops}
          />
          <DashboardCard
            icon={
              <ProductOutlined
                style={{
                  color: "brown",
                  backgroundColor: "burlywood",
                  borderRadius: 20,
                  fontSize: 24,
                  padding: 8,
                }}
              />
            }
            title={"Products"}
            value={totalProducts}
          />
          <DashboardCard
            icon={
              <DollarOutlined
                style={{
                  color: "green",
                  backgroundColor: "lightgreen",
                  borderRadius: 20,
                  fontSize: 24,
                  padding: 8,
                }}
              />
            }
            title={"Membership Revenue (VND)"}
            value={totalMemberRevenue * 1000}
          />
        </Space>
        <Space direction="horizontal">
          <Space direction="horizontal">
            <Space direction="vertical">
              <TableList />
            </Space>
            <Space direction="vertical">
              <PieChart />
              <BarChart />
            </Space>
          </Space>
        </Space>
      </Space>
    </div>
  );
}

function DashboardCard({ title, value, icon }) {
  return (
    <Card>
      <Space direction="horizontal">
        {icon}
        <Statistic title={title} value={value} />
      </Space>
    </Card>
  );
}

function TableList() {
  const [admins, setAdmins] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(
        "https://koicaresystemapi.azurewebsites.net/api/Account/get-all-byadmin"
      )
      .then((res) => {
        setAdmins(res.data.accs.$values);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching accounts:", error);
        setLoading(false);
      });

    axios
      .get("https://koicaresystemapi.azurewebsites.net/api/Shop/get-all")
      .then((res) => {
        setShops(res.data.shops.$values);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching shops:", error);
        setLoading(false);
      });
  }, []);

  return (
    <Space direction="vertical">
      <>
        <Typography.Text level={4}>Admins</Typography.Text>
        <Table
          columns={[
            {
              title: "Image",
              dataIndex: "image",
              render: (link) => {
                return <Avatar src={link} />;
              },
              width: 80,
            },
            { title: "Account ID", dataIndex: "accId", width: 120 },
            {
              title: "Name",
              dataIndex: "name",
            },
            {
              title: "Email",
              dataIndex: "email",
            },
            {
              title: "Phone",
              dataIndex: "phone",
            },
          ]}
          loading={loading}
          dataSource={admins.map((admin) => ({ ...admin, key: admin.accId }))}
          pagination={{ pageSize: 4 }}
        />
      </>
      <>
        <Typography.Text level={4}>Shops</Typography.Text>
        <Table
          columns={[
            { title: "Shop ID", dataIndex: "shopId", width: 100 },
            { title: "Name", dataIndex: "name", width: 150 },
            { title: "Phone", dataIndex: "phone", width: 150 },
            {
              title: "Address",
              dataIndex: "address",
              ellipsis: { showTitle: false },
              render: (address) => (
                <Tooltip placement="topLeft" title={address}>
                  {address}
                </Tooltip>
              ),
            },
          ]}
          loading={loading}
          dataSource={shops.map((shop) => ({ ...shop, key: shop.shopId }))}
          pagination={{ pageSize: 4 }}
        />
      </>
    </Space>
  );
}

function PieChart() {
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const totalAdmins = await axios
          .get(
            "https://koicaresystemapi.azurewebsites.net/api/Account/get-all-byadmin"
          )
          .then((res) => res.data.total);
        const totalShops = await axios
          .get(
            "https://koicaresystemapi.azurewebsites.net/api/Account/get-all-byshop"
          )
          .then((res) => res.data.total);
        const totalGuests = await axios
          .get(
            "https://koicaresystemapi.azurewebsites.net/api/Account/get-all-byguest"
          )
          .then((res) => res.data.total);
        const totalMembers = await axios
          .get(
            "https://koicaresystemapi.azurewebsites.net/api/Account/get-all-bymember"
          )
          .then((res) => res.data.total);

        setData([
          { type: "Admins", value: totalAdmins },
          { type: "Shops", value: totalShops },
          { type: "Guests", value: totalGuests },
          { type: "Members", value: totalMembers },
        ]);
      } catch (error) {
        console.error("Error fetching data for pie chart:", error);
      }
    };

    fetchData();
  }, []);
  const dataChart = {
    appendPadding: 5,
    data,
    angleField: "value",
    colorField: "type",
    color: COLORS,
    radius: 0.8,
    label: {
      type: "spider",
      labelLine: {
        length: 5,
        style: {
          stroke: "#8c8c8c",
          lineDash: [2, 2],
        },
      },
      content: (item) => {
        `${item.type}: ${item.value}`;
      },
    },
    interactions: [{ type: "element-active" }],
  };

  return (
    <Card title={"Accounts"}>
      <Pie {...dataChart} width={500} height={200} />
    </Card>
  );
}

function BarChart() {
  const [data, setData] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [allData, setAllData] = useState([]);

  useEffect(() => {
    const fetchMonthlyRevenue = async () => {
      try {
        const response = await axios.get(
          "https://koicaresystemapi.azurewebsites.net/api/MemberRevenue"
        );

        const formattedData = response.data.$values.map((item) => ({
          year: item.year,
          month: item.month - 1, // Adjust month to 0-based index (0 for January, 11 for December)
          revenue: item.totalRevenue,
        }));

        setAllData(formattedData); // Store all data

        // Tìm năm lớn nhất trong dữ liệu và chọn nó làm mặc định
        const availableYears = Array.from(
          new Set(formattedData.map((item) => item.year))
        ).sort((a, b) => b - a);

        const latestYear = availableYears[0]; // Năm gần nhất

        setSelectedYear(latestYear);
        setData(groupDataByMonth(formattedData, latestYear)); // Hiển thị dữ liệu cho năm gần nhất
      } catch (error) {
        console.error("Error fetching monthly revenue data:", error);
      }
    };

    fetchMonthlyRevenue();
  }, []);

  // Group revenue by month for a specific year
  const groupDataByMonth = (data, year) => {
    const monthlyData = Array(12).fill(0); // Create an array for 12 months, initialize with 0

    data.forEach((item) => {
      if (item.year === year) {
        monthlyData[item.month] += item.revenue; // Add revenue to the respective month
      }
    });

    // Format the data for the chart
    return monthlyData.map((revenue, month) => ({
      month: `Month ${month + 1}`, // Month 1-12
      revenue,
    }));
  };

  // Handle year change
  const handleYearChange = (year) => {
    setSelectedYear(year);
    setData(groupDataByMonth(allData, year));
  };

  const config = {
    title: {
      visible: true,
      text: `Revenue - ${selectedYear}`,
    },
    data,
    xField: "month",
    yField: "revenue",
    label: {
      visible: true,
      position: "middle",
    },
    meta: {
      month: { alias: "Month" },
      revenue: { alias: "Revenue (VND)" },
    },
  };

  // Create a list of available years
  const availableYears = Array.from(
    new Set(allData.map((item) => item.year))
  ).sort((a, b) => b - a);

  return (
    <Card title={"Revenue Membership"}>
      <Select
        value={selectedYear}
        onChange={handleYearChange}
        style={{ marginBottom: 20, width: 120 }}
      >
        {availableYears.map((year) => (
          <Select.Option key={year} value={year}>
            {year}
          </Select.Option>
        ))}
      </Select>
      <Column width={550} height={300} {...config} />
    </Card>
  );
}

export default Dashboard;
