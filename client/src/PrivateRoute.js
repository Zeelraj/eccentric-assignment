import React from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router";

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const location = useLocation();

  return isAuthenticated ? (
    children
  ) : (
    <Navigate to={`/login?to=${encodeURIComponent(location.pathname)}`} />
  );
};

export default PrivateRoute;
