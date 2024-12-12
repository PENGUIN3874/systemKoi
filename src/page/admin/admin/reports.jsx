import React, { useEffect, useState } from "react";
import { Table } from "react-bootstrap";
import { getMessage } from "./api";

function Report() {
  const [api, setApi] = useState({});
  const accId = localStorage.getItem("userId");
  const fetchData = () => {
    console.log("Link:" + getMessage());
    getMessage().then((data) => {
      console.log(accId);
      if (data) {
        setApi(data.noteList.$values);
      } else {
        console.error(
          "Expected array in noteList.$values, but received:",
          data
        );
      }
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <Table striped hover bordered>
        <thead>
          <tr>
            <th>Stt</th>
            <th>Name</th>
            <th>Message</th>
          </tr>
        </thead>

        <tbody>
          {api.length > 0 ? ( // Kiểm tra nếu api chứa dữ liệu
            api.map((note, index) => (
              <tr key={note.noteId}>
                <td>{index + 1}</td> {/* Tự động đánh số thứ tự */}
                <td>{note.noteName}</td> {/* Hiển thị tên ghi chú */}
                <td>{note.noteText}</td> {/* Hiển thị nội dung ghi chú */}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3">No data available</td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
}

export default Report;
