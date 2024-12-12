import { useState, useEffect } from "react";
import {
  Form,
  Input,
  Table,
  Typography,
  Popconfirm,
  message,
  Space,
  Button,
} from "antd";
import axios from "axios";

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

function ShopManagement() {
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [editingKey, setEditingKey] = useState("");
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "https://koicaresystemapi.azurewebsites.net/api/Shop/get-all"
        );
        const shops = response.data.shops.$values;
        const formattedData = shops.map((shop) => ({
          key: shop.shopId.toString(),
          name: shop.name,
          phone: shop.phone,
          address: shop.address,
        }));
        setData(formattedData);
        setFilteredData(formattedData);
      } catch (error) {
        console.error("Failed to fetch shop data:", error);
      }
    };
    fetchData();
  }, []);

  const isEditing = (record) => record.key === editingKey;

  const edit = (record) => {
    form.setFieldsValue({
      name: "",
      phone: "",
      address: "",
      ...record,
    });
    setEditingKey(record.key);
  };

  const cancel = () => {
    setEditingKey("");
  };

  const save = async (key) => {
    try {
      const row = await form.validateFields();
      const newData = [...data];
      const index = newData.findIndex((item) => key === item.key);
      const updatedShop = {
        shopId: key,
        name: row.name,
        phone: row.phone,
        address: row.address,
      };

      const apiUrl = `https://koicaresystemapi.azurewebsites.net/api/Shop/update${key}`;
      await axios.put(apiUrl, updatedShop, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, { ...item, ...row });
        setData(newData);
        setFilteredData(newData);
        setEditingKey("");
        message.success("Update successful");
      }
    } catch (errInfo) {
      message.error("Update failed: " + errInfo.message);
    }
  };

  const handleDelete = async (key) => {
    try {
      await axios.delete(
        `https://koicaresystemapi.azurewebsites.net/api/Shop/delete?shopId=${key}`
      );
      const newData = data.filter((item) => item.key !== key);
      setData(newData);
      setFilteredData(newData);
      message.success("Deleted successfully");
    } catch (error) {
      message.error("Delete failed: " + error.message);
    }
  };

  const handleSearch = () => {
    const filtered = data.filter((item) =>
      item.name.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredData(filtered);
    setSearchText("");
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      width: 200,
      editable: true,
    },
    {
      title: "Phone Number",
      dataIndex: "phone",
      width: 200,
      editable: true,
    },
    {
      title: "Address",
      dataIndex: "address",
      width: 500,
      editable: true,
    },
    {
      title: "Operation",
      dataIndex: "operation",
      width: 150,
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <a onClick={() => save(record.key)} style={{ marginRight: 8 }}>
              Save
            </a>
            <a onClick={cancel}>Cancel</a>
          </span>
        ) : (
          <span>
            <Typography.Link
              disabled={editingKey !== ""}
              onClick={() => edit(record)}
              style={{ marginRight: 8 }}
            >
              Edit
            </Typography.Link>
          </span>
        );
      },
    },
    {
      title: "Delete",
      dataIndex: "delete",
      width: 100,
      render: (_, record) => (
        <Popconfirm
          title="Are you sure to delete?"
          onConfirm={() => handleDelete(record.key)}
          okText="Yes"
          cancelText="No"
        >
          <a>Delete</a>
        </Popconfirm>
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
        editing: isEditing(record),
      }),
    };
  });

  return (
    <Space direction="vertical" style={{ width: "100%" }}>
      <h1 className="vertical">Shop Management</h1>
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Search by Name"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 200, marginRight: 8 }}
        />
        <Button
          type="primary"
          className="search__product"
          onClick={handleSearch}
        >
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

export default ShopManagement;
