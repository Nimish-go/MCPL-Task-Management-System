import {
  PieChart,
  TableChart,
  Refresh,
  FolderOpen,
  HourglassBottom,
  CheckCircle,
  RestartAlt,
  Warning,
} from "@mui/icons-material";
import { Box, Typography, IconButton, Tooltip, Skeleton } from "@mui/joy";
import React, { useEffect, useState } from "react";
import Tables from "./Tables";
import axios from "axios";

const DashboardTasksAssigned = ({ refreshKey = 0, onRefresh }) => {
  const [tasksData, setTasksData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [spinning, setSpinning] = useState(false);

  const fetchTasks = () => {
    setLoading(true);
    axios.defaults.baseURL = "https://mcpl-task-management-system.vercel.app";
    return axios
      .get(`/dashboard_tasks_assigned/${sessionStorage.getItem("empName")}`)
      .then((res) => {
        if (res.status === 200) setTasksData(res.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTasks();
  }, [refreshKey]); // ← re-runs whenever parent increments refreshKey

  const handleRefresh = () => {
    setSpinning(true);
    fetchTasks().finally(() => setTimeout(() => setSpinning(false), 500));
    if (onRefresh) onRefresh();
  };

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
    {
      label: "Total",
      value: total,
      color: "#1976d2",
      bg: "#e8f0fe",
      icon: <FolderOpen sx={{ mx: 1, fontSize: "20px" }} />,
    },
    {
      label: "Pending",
      value: pending,
      color: "#e65100",
      bg: "#fff3e0",
      icon: <HourglassBottom sx={{ mx: 1, fontSize: "20px" }} />,
    },
    {
      label: "Completed",
      value: completed,
      color: "#2e7d32",
      bg: "#e8f5e9",
      icon: <CheckCircle sx={{ mx: 1, fontSize: "20px" }} />,
    },
    {
      label: "Reloaded",
      value: reloaded,
      color: "#991B1B",
      bg: "#FEE2E2",
      icon: <RestartAlt sx={{ mx: 1, fontSize: "20px" }} />,
    },
    {
      label: "Overdue",
      value: overdue,
      color: "#7F1D1D",
      bg: "#FECACA",
      icon: <Warning sx={{ mx: 1, fontSize: "20px" }} />,
    },
  ];

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* ── Header row with refresh button ── */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: { xs: 2, md: 3 },
        }}
      >
        {/* Summary Pills */}
        {loading &&
          [...Array(5)].map((_, i) => (
            <Skeleton
              key={i}
              variant="rectangular"
              animation="wave"
              height={48}
              sx={{ borderRadius: "12px", minWidth: 90, mx: 2 }}
            />
          ))}
        {!loading && total > 0 ? (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, 1fr)",
                sm: "repeat(3, auto)",
                md: "repeat(5, auto)",
              },
              gap: { xs: 1, sm: 1.5, md: 2 },
              flex: 1,
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
                  {stat.icon}
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
        ) : (
          <Box sx={{ flex: 1 }} /> // spacer when pills are hidden
        )}

        {/* Refresh button */}
        <Tooltip title="Refresh Tasks" placement="top">
          <IconButton
            size="sm"
            variant="outlined"
            color="neutral"
            onClick={handleRefresh}
            disabled={loading}
            sx={{
              ml: 2,
              flexShrink: 0,
              borderRadius: "8px",
              borderColor: "#e2e8f0",
              "&:hover": { backgroundColor: "#f0f4ff", borderColor: "#1976d2" },
              transition: "all 0.2s ease",
            }}
          >
            <Refresh
              sx={{
                fontSize: "1.1rem",
                color: loading ? "#c5cae9" : "#64748b",
                transition: "transform 0.5s ease",
                ...(spinning && {
                  animation: "spin 0.5s linear",
                  "@keyframes spin": {
                    from: { transform: "rotate(0deg)" },
                    to: { transform: "rotate(360deg)" },
                  },
                }),
              }}
            />
          </IconButton>
        </Tooltip>
      </Box>

      <Tables type="assigned" tableData={tasksData} loading={loading} />
    </Box>
  );
};

export default DashboardTasksAssigned;
