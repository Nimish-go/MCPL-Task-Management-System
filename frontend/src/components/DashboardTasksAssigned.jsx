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

  const today = new Date();

  const pending = tasksData.filter((t) => t.status === "Pending").length;
  const completed =
    tasksData.length > 0 ? tasksData[0].completed_tasks_count : 0;
  const reloaded = tasksData.filter((t) => t.status === "Reloaded").length;
  const overdue = tasksData.filter(
    (t) =>
      t.status === "Pending" && t.deadline < today.toISOString().split("T")[0],
  ).length;
  const total = tasksData.length;

  const stats = [
    { label: "Total",     value: total,     color: "#1976d2", bg: "#e8f0fe" },
    { label: "Pending",   value: pending,   color: "#e65100", bg: "#fff3e0" },
    { label: "Completed", value: completed, color: "#2e7d32", bg: "#e8f5e9" },
    { label: "Reloaded",  value: reloaded,  color: "#991B1B", bg: "#FEE2E2" },
    { label: "Overdue",   value: overdue,   color: "#7F1D1D", bg: "#FECACA" },
  ];

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Summary Pills — 2-col grid on mobile, flex-wrap on larger */}
      {!loading && total > 0 && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(2, 1fr)",
              sm: "repeat(3, auto)",
              md: "repeat(5, auto)",
            },
            gap: { xs: 1, sm: 1.5, md: 2 },
            mb: { xs: 2, md: 3 },
          }}
        >
          {stats.map((stat) => (
            <Box
              key={stat.label}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                px: { xs: 1.5, md: 2.5 },
                py: { xs: 1.2, md: 1.5 },
                borderRadius: "12px",
                backgroundColor: stat.bg,
                border: `1px solid ${stat.color}22`,
                justifyContent: { xs: "center", sm: "flex-start" },
              }}
            >
              <Typography
                sx={{
                  fontSize: { xs: "1.25rem", md: "1.5rem" },
                  fontWeight: 800,
                  color: stat.color,
                  lineHeight: 1,
                }}
              >
                {stat.value}
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: "0.72rem", md: "0.8rem" },
                  color: stat.color,
                  fontWeight: 600,
                }}
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