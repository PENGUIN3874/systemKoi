import { Navigate } from "react-router-dom";

import "react-toastify/dist/ReactToastify.css";
import { useEffect } from "react";
import { useUser } from "../../UserProvider/UserProvider/UserProvider";

const ProtectedRoute = ({ element, requiredRole }) => {
  const { user } = useUser();

  useEffect(() => {
    if (user && requiredRole === "member" && user.role !== "member") {
      alert("You must buy membership!");
    }
  }, [user, requiredRole]);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole && user.role.toLowerCase() !== requiredRole.toLowerCase()) {
    return (
      <>
        <Navigate to="/" replace />
      </>
    );
  }

  return element;
};

export default ProtectedRoute;