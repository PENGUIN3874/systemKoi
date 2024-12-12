import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import bg from "../../img/news.jpg";
import "./contact.scss";
import { Button, Form, Input, notification, Table } from "antd";
import axios from "axios";
import CarouselContact from "../../components/carouselContact/carouselContact";
import { useState, useEffect } from "react";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
function Contact() {
  const [form] = Form.useForm();
  const [submissions, setSubmissions] = useState([]);

  // Load submissions from localStorage on component mount
  useEffect(() => {
    const savedSubmissions =
      JSON.parse(localStorage.getItem("submissions")) || [];
    setSubmissions(savedSubmissions);
  }, []);

  // Update localStorage whenever submissions change
  useEffect(() => {
    localStorage.setItem("submissions", JSON.stringify(submissions));
  }, [submissions]);

  const onFinish = async (values) => {
    const accId = localStorage.getItem("userId");
    try {
      const payload = {
        noteId: 1,
        noteName: values.Name,
        noteText: values.Message,
        accId: accId,
      };

      const response = await axios.post(
        `https://koicaresystemapi.azurewebsites.net/api/Note?accId=${accId}`,
        payload
      );

      if (response.status === 200) {
        notification.success({
          message: "Submission Successful",
          description: "Your message has been sent successfully!",
        });
        form.resetFields();

        // Add new message and update local storage
        const newSubmission = { name: values.Name, message: values.Message };
        setSubmissions([...submissions, newSubmission]);
      } else {
        notification.error({
          message: "Submission Failed",
          description: "Something went wrong, please try again.",
        });
      }
    } catch (error) {
      console.error("Error sending data to API:", error);
      notification.error({
        message: "Submission Failed",
        description: "Unable to send message. Please try again later.",
      });
    }
  };

  // Handle message deletion
  const handleDelete = (index) => {
    const updatedSubmissions = submissions.filter((_, i) => i !== index);
    setSubmissions(updatedSubmissions);
    notification.info({
      message: "Message Deleted",
      description: "The message has been successfully deleted.",
    });
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Message",
      dataIndex: "message",
      key: "message",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record, index) => (
        <DeleteForeverIcon
          style={{ cursor: "pointer" }}
          type="link"
          onClick={() => handleDelete(index)}
        >
          Delete
        </DeleteForeverIcon>
      ),
    },
  ];

  return (
    <>
      <Header />
      <img src={bg} className="Contact__img" alt="" />
      <div className="ContactPage__tiltle">
        <br />
        <h3>The Royal Koi of system</h3>
        <p>Contact Royal Koi</p>
        <div className="divider"></div>
      </div>

      <div className="ContactPage">
        <div className="ContactPage__left">
          <Form form={form} onFinish={onFinish}>
            <p>Name</p>
            <Form.Item
              name="Name"
              rules={[{ required: true, message: "Please input your name!" }]}
            >
              <Input className="input" />
            </Form.Item>

            <p>Message</p>
            <Form.Item
              name="Message"
              rules={[
                { required: true, message: "Please input your message!" },
              ]}
            >
              <Input.TextArea className="input" rows={5} />
            </Form.Item>

            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form>
          <div className="divider"></div>
        </div>
        <div className="ContactPage__right">
          <div className="ContactPage__top">
            <h5>Contact Information</h5>
            <p className="p1">contact@gmail.com</p>
            <p className="p2">+1 (555) 123 4567</p>
            <p className="p3">123 Example Street City, Country...</p>
          </div>
          <div className="ContactPage__bottom">
            <h5>Our Location</h5>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.163958945934!2d106.79814837485847!3d10.875131189279713!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3174d8a6b19d6763%3A0x143c54525028b2e!2zTmjDoCBWxINuIGjDs2EgU2luaCB2acOqbiBUUC5IQ00!5e0!3m2!1svi!2s!4v1727801844992!5m2!1svi!2s"
              width="100%"
              height="350px"
              title="Location"
            ></iframe>
          </div>
        </div>
      </div>

      <div className="ContactPage__submissions">
        <h3>Submitted Messages</h3>
        <Table
          dataSource={submissions}
          columns={columns}
          rowKey={(record, index) => index}
          style={{ width: "80%", margin: "0 auto" }}
        />
      </div>

      <div className="ContactPage__popular">
        <h3>Some Koi popular</h3>
        <div className="divider"></div>
      </div>
      <div className="ContactPage__carousel">
        <CarouselContact numberOfSlide={4} autoplay={true} />
      </div>
      <Footer />
    </>
  );
}

export default Contact;
