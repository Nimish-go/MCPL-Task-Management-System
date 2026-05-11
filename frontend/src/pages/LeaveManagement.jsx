import React from "react";
import Navbar from "../components/Navbar";
import { Typography, Box } from "@mui/joy";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const LeaveManagement = () => {
  return (
    <div className="flex">
      <div className="navbar">
        <Navbar />
      </div>
      <div className="leave-management w-full flex flex-col justify-center items-center text-center">
        <div className="lottie">
          <DotLottieReact
            src="https://lottie.host/a0c5dd74-5403-4618-ac04-375507f87668/HjxMVUMm94.lottie"
            loop
            autoplay
            className="w-125 h-125 flex items-center justify-center text-center"
          />
        </div>
        <div className="text text-center">
          <Typography level="title-lg" textAlign={"center"}>This Module is still under construction. Will be updated in the coming days.</Typography>
        </div>
      </div>
    </div>
  );
};

export default LeaveManagement;
