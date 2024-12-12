import Footer from "../../components/footer/footer";
import Header from "../../components/header/header";
import "./yourOrder.scss";
import { Layout, Menu } from "antd";
import { useEffect, useState } from "react";
import axios from "axios";
const { Sider, Content } = Layout;

import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));
///// ham tao don hang
function YourOrder() {
  const [orders, setOrders] = useState([]);
  const [orderDetails, setOrderDetails] = useState([]);
  const [api, setApi] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  // Fetch order details sau khi orders được thiết lập
  useEffect(() => {
    if (orders.length > 0) {
      fetchOrderDetails();
    }
  }, [orders]);

  const fetchOrders = async () => {
    const user = localStorage.getItem("userId");

    try {
      const response = await axios.get(
        `https://koicaresystemapi.azurewebsites.net/GetAll/${user}`
      );

      if (response.status === 200 && response.data.orders.$values) {
        console.log("Orders API Response:", response.data.orders.$values); // Log kiểm tra
        setOrders(response.data.orders.$values);
      } else {
        console.error("Error fetching orders:", response.data);
      }
    } catch (error) {
      console.error("Error calling order API:", error);
    }
  };

  const fetchOrderDetails = async () => {
    try {
      const orderDetailsList = [];

      // Lặp qua tất cả các orderId từ `orders` và lấy chi tiết từng đơn hàng
      for (const order of orders) {
        const response = await axios.get(
          `https://koicaresystemapi.azurewebsites.net/api/Get-All-Order-Details?orderId=${order.orderId}`
        );

        if (response.status === 200 && response.data.$values) {
          console.log(
            `Order Details for Order ID ${order.orderId}:`,
            response.data.$values
          );
          orderDetailsList.push(...response.data.$values); // Thêm tất cả chi tiết vào danh sách
        } else {
          console.error(
            `Error fetching details for Order ID ${order.orderId}:`,
            response.data
          );
        }
      }

      // Sau khi lấy tất cả chi tiết, cập nhật `orderDetails`
      setOrderDetails(orderDetailsList);
    } catch (error) {
      console.error("Error calling order details API:", error);
    }
  };

  const combinedOrders = orders.map((order) => {
    const detail = orderDetails.find(
      (d) => String(d.orderId) === String(order.orderId)
    );

    return {
      ...order,
      productId: detail ? detail.productId : "N/A",
      quantity: detail ? detail.quantity : "N/A",
      totalAmount: detail ? detail.totalPrice : order.totalAmount,
    };
  });

  console.log("Combined Orders:", combinedOrders); // Kiểm tra cuối cùng

  return (
    <>
      <Header />
      <div>
        <Layout>
          <Sider className="order_sidebar" width={250} theme="light">
            <Menu
              mode="vertical"
              defaultSelectedKeys={[1]}
              className="order_menu"
            >
              <Menu.Item key={1}>Danh sách đơn hàng</Menu.Item>
              <Menu.Item key={2}>Thanh toán đang chờ</Menu.Item>
              <Menu.Item key={3}>Giao hàng</Menu.Item>
              <Menu.Item key={4}>Hoàn thành</Menu.Item>
              <Menu.Item key={5}>Đã hủy</Menu.Item>
              <Menu.Item key={6}>Trả hàng / Hoàn tiền</Menu.Item>
            </Menu>
          </Sider>

          <Content>
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 700 }} aria-label="customized table">
                <TableHead>
                  <TableRow>
                    <StyledTableCell align="left">Stt</StyledTableCell>
                    <StyledTableCell align="left">Product ID</StyledTableCell>
                    <StyledTableCell align="left">Quantity</StyledTableCell>
                    <StyledTableCell align="left">
                      Total Amount (VND)
                    </StyledTableCell>
                    <StyledTableCell align="left">Date</StyledTableCell>
                    <StyledTableCell>Status Order</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {combinedOrders.map((item, index) => (
                    <StyledTableRow key={index}>
                      <StyledTableCell align="left">
                        {index + 1}
                      </StyledTableCell>
                      <StyledTableCell align="left">
                        {item.productId}
                      </StyledTableCell>
                      <StyledTableCell align="left">
                        {item.quantity}
                      </StyledTableCell>
                      <StyledTableCell align="left">
                        {(item.totalAmount * 1000).toLocaleString("vi-VN")} VND
                      </StyledTableCell>
                      <StyledTableCell align="left">
                        {item.date}
                      </StyledTableCell>
                      <StyledTableCell align="left">
                        {item.statusOrder}
                      </StyledTableCell>
                    </StyledTableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Content>
        </Layout>
      </div>
      <Footer />
    </>
  );
}

export default YourOrder;
