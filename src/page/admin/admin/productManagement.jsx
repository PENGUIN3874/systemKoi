import { useState, useEffect } from "react";
import {
  Form,
  Input,
  Table,
  message,
  Avatar,
  Radio,
  Space,
  Button,
  Typography,
} from "antd";
import axios from "axios";
import "./productManagement.scss";
const EditableCell = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  ...restProps
}) => {
  const inputNode = <Input />;
  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules={[{ required: true, message: `Please Input ${title}!` }]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

function ProductManagement() {
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "https://koicaresystemapi.azurewebsites.net/api/Product/get-all"
        );
        const products = response.data.product.$values;

        if (Array.isArray(products)) {
          const formattedData = products.map((product) => ({
            key: product.productId.toString(),
            image: product.image,
            name: product.name,
            price: product.price,
            stock: product.stock,
            category: product.category,
            productInfo: product.productInfo,
            status: product.status,
          }));
          setData(formattedData);
          setFilteredData(formattedData);
        } else {
          console.error("Unexpected data format:", products);
        }
      } catch (error) {
        console.error("Failed to fetch product data:", error);
      }
    };
    fetchData();
  }, []);

  const handleSearch = () => {
    const filtered = data.filter((item) =>
      item.name.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredData(filtered);
    setSearchText(""); // Reset searchText after search
  };

  const handleStatusChange = async (key, newStatus) => {
    try {
      await axios.put(
        `https://koicaresystemapi.azurewebsites.net/api/Product/edit-status${key}?status=${newStatus}`
      );

      const updatedData = data.map((item) =>
        item.key === key ? { ...item, status: newStatus } : item
      );
      setData(updatedData);
      setFilteredData(updatedData);

      message.success(
        `Product ${newStatus ? "unbanned" : "banned"} successfully`
      );
    } catch (error) {
      message.error("Failed to update product status: " + error.message);
    }
  };

  const columns = [
    {
      title: "Image",
      dataIndex: "image",
      width: 100,
      render: (image) => <Avatar src={image} alt="product_img" />,
    },
    {
      title: "Name",
      dataIndex: "name",
      width: 200,
      editable: true,
    },
    {
      title: "Price",
      dataIndex: "price",
      width: 200,
      editable: true,
    },
    {
      title: "Category",
      dataIndex: "category",
      width: 200,
      editable: true,
    },
    {
      title: "Information",
      dataIndex: "productInfo",
      width: 200,
      editable: true,
    },
    {
      title: "Status",
      dataIndex: "status",
      width: 150,
      render: (_, record) => (
        <Radio.Group
          value={record.status}
          onChange={(e) => handleStatusChange(record.key, e.target.value)}
        >
          <Radio value={true}>Unbanned</Radio>
          <Radio value={false}>Banned</Radio>
        </Radio.Group>
      ),
    },
  ];

  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: "text",
        dataIndex: col.dataIndex,
        title: col.title,
        editing: false,
      }),
    };
  });

  return (
    <Space direction="vertical" style={{ width: "100%" }}>
      <h1 className="vertical">Product Management</h1>
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Search by Name"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 200 }}
        />
        <Button type="primary" className="search__product" onClick={handleSearch}>
          Search
        </Button>
      </Space>
      <Form form={form} component={false}>
        <Table
          components={{ body: { cell: EditableCell } }}
          bordered
          dataSource={filteredData}
          columns={mergedColumns}
          rowClassName="editable-row"
          pagination={{ pageSize: 5 }}
        />
      </Form>
    </Space>
  );
}

export default ProductManagement;
