import { PieChart, TableChart } from "@mui/icons-material";
import { Box, Typography } from "@mui/joy";
import React, { useEffect, useState } from "react";
import Tables from "./Tables";
import axios from "axios";

const DashboardTasksAssigned = () => {
  const [tasksData, setTasksData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.defaults.baseURL = "https://mcpl-task-management-system.vercel.app";
    setLoading(true);
    axios
      .get(`/dashboard_tasks_assigned/${sessionStorage.getItem("empName")}`)
      .then((res) => {
        if (res.status === 200) {
          setTasksData(res.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const pending = tasksData.filter((t) => t.status === "Pending").length;
  const completed = tasksData.filter((t) => t.status === "Completed").length;
  const reloaded = tasksData.filter((t) => t.status === "Reloaded").length;
  const total = tasksData.length;

  return (
    <Box sx={{ p: 3 }}>
      {/* Summary Pills */}
      {!loading && total > 0 && (
        <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
          {[
            {
              label: "Total Tasks",
              value: total,
              color: "#1976d2",
              bg: "#e8f0fe",
            },
            {
              label: "Pending",
              value: pending,
              color: "#e65100",
              bg: "#fff3e0",
            },
            {
              label: "Completed",
              value: completed,
              color: "#2e7d32",
              bg: "#e8f5e9",
            },
            {
              label: "Reloaded",
              value: reloaded,
              color: "#6D28D9",
              bg: "#EDE9FE",
            },
          ].map((stat) => (
            <Box
              key={stat.label}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                px: 2.5,
                py: 1.5,
                borderRadius: "12px",
                backgroundColor: stat.bg,
                border: `1px solid ${stat.color}22`,
              }}
            >
              <Typography
                sx={{
                  fontSize: "1.5rem",
                  fontWeight: 800,
                  color: stat.color,
                  lineHeight: 1,
                }}
              >
                {stat.value}
              </Typography>
              <Typography
                sx={{ fontSize: "0.8rem", color: stat.color, fontWeight: 600 }}
              >
                {stat.label}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
      <Tables type="assigned" tableData={tasksData} loading={loading} />
    </Box>
  );
};

export default DashboardTasksAssigned;
