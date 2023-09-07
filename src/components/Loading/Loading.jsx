import React from "react";
import Loader from "../../assets/loading-machines.gif";

const Loading = () => {
  return (
    <div className="w-screen h-screen overflow-hidden flex justify-center items-center">
      <img src={Loader} alt="Loading..." />
    </div>
  );
};

export default Loading;
