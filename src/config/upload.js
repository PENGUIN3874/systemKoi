// firebaseUpload.js
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase"; // Đường dẫn tới file cấu hình Firebase

const handleImageUpload = async (file) => {
  const storageRef = ref(storage, `images/${file.name}`); // Tạo reference đến nơi lưu trữ
  try {
    await uploadBytes(storageRef, file); // Upload ảnh lên Firebase
    const downloadURL = await getDownloadURL(storageRef); // Lấy URL ảnh đã upload
    return downloadURL; // Trả về URL ảnh
  } catch (error) {
    console.error("Error uploading image:", error); // Xử lý lỗi
    throw error;
  }
};

export { handleImageUpload };
