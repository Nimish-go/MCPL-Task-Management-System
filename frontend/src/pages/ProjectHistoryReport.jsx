import React from "react";
import Navbar from "../components/Navbar";
import { useLocation } from "react-router-dom";

const ProjectHistoryReport = () => {
  const location = useLocation();
  return (
    <div className="w-screen overflow-hidden">
      <div className="navbar">
        <Navbar location={location.pathname} />
      </div>
    </div>
  );
};

export default ProjectHistoryReport;
