import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";

const Layout = () => {
  return (
    <div className="flex h-screen w-screen">
      <div className="w-full h-full overflow-y-scroll">
        <Navbar />
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
