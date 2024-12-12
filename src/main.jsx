import { createRoot } from "react-dom/client";
import Koi from "./App.jsx";
import "./index.css";
import "./main.scss";
import { UserProvider } from "./components/UserProvider/UserProvider/UserProvider.jsx";

createRoot(document.getElementById("root")).render(
  <UserProvider>
    <Koi />
  </UserProvider>
);