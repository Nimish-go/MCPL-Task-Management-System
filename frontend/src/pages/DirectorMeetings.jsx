import React, { useEffect, useState } from "react";
import AccessDenied from "../components/AccessDenied";
import { useNavigate } from "react-router-dom";
import { FormControl, FormLabel, Input, Typography } from "@mui/joy";
import Navbar from "../components/Navbar";

const DirectorMeetings = () => {
  const [accessDenied, setAccessDenied] = useState(null);
  const navigate = useNavigate();

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (
      !sessionStorage.getItem("designation").toUpperCase().includes("DIRECTOR")
    ) {
      setAccessDenied(true);
    }
  }, []);

  return (
    <div className="w-screen min-w-full">
      <div className="navbar">
        <Navbar />
      </div>
      <div className="main w-screen">
        <div className="title">
          <Typography textAlign={"center"} level="h2" fontWeight={500} mt={3}>
            Director Meetings
          </Typography>
        </div>
        <div className="form w-screen flex flex-wrap justify-center items-center">
          <FormControl sx={{ width: "30%" }}>
            <FormLabel>Date Of Entry</FormLabel>
            <Input
              type="date"
              value={today}
              placeholder="Enter Date of Entry"
            />
          </FormControl>
          <FormControl sx={{ mx: 2 }}>
            <FormLabel></FormLabel>
          </FormControl>
        </div>
      </div>
      <AccessDenied
        open={accessDenied}
        onClose={() => {
          setAccessDenied(false);
          navigate("/dashboard");
        }}
        location={"Director Meetings"}
      />
    </div>
  );
};

export default DirectorMeetings;
