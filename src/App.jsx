import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Login from "./page/login/login";
import HomePage from "./page/home/home";
import Environment from "./page/environment/environment";
import Viewpond from "./page/view/viewpond";
import Viewproduct from "./page/viewproduct/viewproduct";
import Cart from "./page/cart/cart";
import Contact from "./page/contact/contact";
import News from "./page/news/news";
import Profile from "./page/profile/profile";
import Mykoi from "./page/mykoi/mykoi";
import Detail from "./page/detail/detail";
import Expert from "./page/expert/expert";
import Salt from "./page/salt/salt";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute/ProtectedRoute";
import Admin from "./page/admin/admin/admin";
import AdminRoutes from "./components/admin/admin/routes";
import Food from "./page/food/food";
import PaymentSuccess from "./page/payment/payment/payment";
import Koidetail from "./page/koidetail/koidetail";
import Register from "./page/register/register/register";
import OrderSuccess from "./page/order/order";
import PaymentFail from "./page/paymentFail/paymentFail";
import YourOrder from "./page/yourorder/yourOrder";
import Shop from "./page/shop/Shop";
function Koi() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <HomePage />,
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/food",
      element: <ProtectedRoute element={<Food />} requiredRole="member" />,
    },
    {
      path: "/environment",
      element: <Environment />,
    },
    {
      path: "/view/:id",
      element: <Viewpond />,
    },
    {
      path: "/viewproduct",
      element: <Viewproduct />,
    },
    {
      path: "/cart",
      element: <Cart />,
    },
    {
      path: "/contact",
      element: <Contact />,
    },
    {
      path: "/news",
      element: <News />,
    },

    {
      path: "/profile",
      element: <Profile />,
    },
    {
      path: "/mykoi",
      element: <Mykoi />,
    },
    {
      path: "/detail/:id",
      element: <Detail />,
    },
    {
      path: "/expert",
      element: <Expert />,
    },
    {
      path: "/salt",
      element: <ProtectedRoute element={<Salt />} requiredRole="member" />,
    },
    {
      path: "/payment",
      element: <PaymentSuccess />,
    },
    {
      path: "/paymentFail",
      element: <PaymentFail />,
    },
    {
      path: "/order",
      element: <OrderSuccess />,
    },
    {
      path: "/admin",
      element: <ProtectedRoute element={<Admin />} requiredRole="admin" />,
      children: [
        {
          path: "/admin/*",
          element: (
            <ProtectedRoute element={<AdminRoutes />} requiredRole="admin" />
          ),
        },
      ],
    },
    {
      path: "/koidetail/:koiId",
      element: <Koidetail />,
    },
    {
      path: "/register",
      element: <Register />,
    },
    {
      path: "/yourorder",
      element: <YourOrder />,
    },
    {
      path: "/shop",
      element: <ProtectedRoute element={<Shop />} requiredRole="shop" />,
    },
  ]);

  return <RouterProvider router={router} />;
}

export default Koi;
