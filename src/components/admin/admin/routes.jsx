import { Route, Routes } from "react-router-dom";




import Dashboard from "../../../page/admin/admin/dashboard";
import UserManagement from "../../../page/admin/admin/userManagement";
import ShopManagement from "../../../page/admin/admin/shopManagement";
import ProductManagement from "../../../page/admin/admin/productManagement";

function AdminRoutes() {
  return (
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      {/* <Route path="/reporting" element={}></Route> */}
      <Route path="/userManagement" element={<UserManagement />} />
      <Route path="/shopManagement" element={<ShopManagement />} />
      <Route path="/productManagement" element={<ProductManagement />} />
    </Routes>
  );
}
export default AdminRoutes;
