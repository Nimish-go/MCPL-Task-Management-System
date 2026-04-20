import React, { useState } from "react";
import Navbar from "../components/Navbar";
import {
  ListItemDecorator,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Typography,
  Box,
  Chip,
} from "@mui/joy";
import { Assignment, TaskAlt, TaskSharp, WavingHand } from "@mui/icons-material";
import DashboardTasksAssigned from "../components/DashboardTasksAssigned";
import DashboardTasksUnderReview from "../components/DashboardTasksUnderReview";
import AllTasksAssigned from "../components/AllTasksAssigned";
import { useLocation } from "react-router-dom";

const Dashboard = () => {
  const [tasksIndex, setTasksIndex] = useState(0);
  const location = useLocation();
  const designation = sessionStorage.getItem("designation") || "";
  const empName = sessionStorage.getItem("empName") || "User";
  const isDirector = designation.toUpperCase().includes("DIRECTOR");

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f4f6fb" }}>
      <Navbar active={"/dashboard"} />

      {/* Hero Header */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #0f1b35 0%, #1565c0 60%, #1976d2 100%)",
          px: { xs: 3, md: 6 },
          py: 4,
          mb: 0,
        }}
      >
        <Box sx={{ maxWidth: 1200, mx: "auto" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
            <WavingHand sx={{ color: "#ffd54f", fontSize: "1.6rem" }} />
            <Typography
              sx={{
                color: "rgba(255,255,255,0.75)",
                fontSize: "0.95rem",
                fontWeight: 400,
                letterSpacing: "0.04em",
              }}
            >
              {getGreeting()}
            </Typography>
          </Box>
          <Typography
            level="h3"
            sx={{
              color: "#fff",
              fontWeight: 800,
              fontSize: { xs: "1.6rem", md: "2rem" },
              letterSpacing: "-0.02em",
            }}
          >
            {empName}
          </Typography>
          <Chip
            size="sm"
            sx={{
              mt: 1,
              backgroundColor: "rgba(255,255,255,0.15)",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.25)",
              fontWeight: 500,
              letterSpacing: "0.05em",
              fontSize: "0.75rem",
            }}
          >
            {designation}
          </Chip>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, md: 4 }, py: 4 }}>
        <Box
          sx={{
            backgroundColor: "#fff",
            borderRadius: "20px",
            boxShadow: "0 4px 32px rgba(0,0,0,0.07)",
            overflow: "hidden",
            border: "1px solid #e8ecf4",
          }}
        >
          {/* Section Title Bar */}
          <Box
            sx={{
              px: 3,
              py: 2.5,
              borderBottom: "1px solid #f0f2f8",
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: 4,
                height: 28,
                borderRadius: "4px",
                background: "linear-gradient(180deg, #1976d2, #42a5f5)",
              }}
            />
            <Typography
              level="title-lg"
              sx={{ fontWeight: 700, color: "#0f1b35", letterSpacing: "-0.01em" }}
            >
              Task Section
            </Typography>
          </Box>

          <Tabs
            value={tasksIndex}
            onChange={(e, val) => setTasksIndex(val)}
            sx={{ backgroundColor: "transparent" }}
          >
            <TabList
              sx={{
                px: 3,
                pt: 2,
                gap: 1,
                backgroundColor: "transparent",
                borderBottom: "2px solid #f0f2f8",
                "& .MuiTab-root": {
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  borderRadius: "10px 10px 0 0",
                  color: "#64748b",
                  border: "none",
                  py: 1.2,
                  px: 2.5,
                  transition: "all 0.2s ease",
                  "&:hover": { backgroundColor: "#f0f4ff", color: "#1976d2" },
                  "&.Mui-selected": {
                    color: "#1976d2",
                    backgroundColor: "#e8f0fe",
                    fontWeight: 700,
                  },
                },
              }}
            >
              <Tab value={0} disableIndicator>
                <ListItemDecorator sx={{ mr: 0.5 }}>
                  <TaskSharp sx={{ fontSize: "1rem" }} />
                </ListItemDecorator>
                Tasks Assigned To You
              </Tab>
              <Tab value={1} disableIndicator>
                <ListItemDecorator sx={{ mr: 0.5 }}>
                  <Assignment sx={{ fontSize: "1rem" }} />
                </ListItemDecorator>
                Tasks Assigned By You
              </Tab>
              {isDirector && (
                <Tab value={2} disableIndicator>
                  <ListItemDecorator sx={{ mr: 0.5 }}>
                    <TaskAlt sx={{ fontSize: "1rem" }} />
                  </ListItemDecorator>
                  All Tasks Assigned
                </Tab>
              )}
            </TabList>

            <TabPanel value={0} sx={{ p: 0 }}>
              <DashboardTasksAssigned />
            </TabPanel>
            <TabPanel value={1} sx={{ p: 0 }}>
              <DashboardTasksUnderReview />
            </TabPanel>
            <TabPanel value={2} sx={{ p: 0 }}>
              <AllTasksAssigned />
            </TabPanel>
          </Tabs>
        </Box>
      </Box>
    </div>
  );
};

export default Dashboard;