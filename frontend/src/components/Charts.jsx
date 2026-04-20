import React, { useEffect, useState } from "react";
import { PieChart } from "@mui/x-charts/PieChart";
import { Box, Typography, Chip } from "@mui/joy";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import {
  CheckCircle,
  HourglassEmpty,
  Warning,
  Refresh,
  PieChartOutlined,
} from "@mui/icons-material";

const loadingTexts = [
  "Crunching task numbers...",
  "Analyzing employee productivity...",
  "Preparing task insights...",
  "Gathering project statistics...",
  "Calculating task distribution...",
  "Loading performance metrics...",
  "Organizing task data...",
  "Fetching team task progress...",
  "Building productivity charts...",
  "Visualizing workload distribution...",
];

const statConfig = [
  {
    key: "pending_count",
    label: "Pending",
    color: "#f59e0b",
    bg: "#fffbeb",
    icon: <HourglassEmpty sx={{ fontSize: "0.8rem" }} />,
  },
  {
    key: "completed_count",
    label: "Completed",
    color: "#10b981",
    bg: "#ecfdf5",
    icon: <CheckCircle sx={{ fontSize: "0.8rem" }} />,
  },
  {
    key: "overdue_count",
    label: "Overdue",
    color: "#ef4444",
    bg: "#fef2f2",
    icon: <Warning sx={{ fontSize: "0.8rem" }} />,
  },
  {
    key: "reloaded_count",
    label: "Reloaded",
    color: "#f97316",
    bg: "#fff7ed",
    icon: <Refresh sx={{ fontSize: "0.8rem" }} />,
  },
];

const Charts = ({ chartData, loading }) => {
  const [loadingIndex, setLoadingIndex] = useState(0);

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setLoadingIndex((prev) => {
        let next;
        do {
          next = Math.floor(Math.random() * loadingTexts.length);
        } while (next === prev);
        return next;
      });
    }, 1500);
    return () => clearInterval(interval);
  }, [loading]);

  if (loading) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <DotLottieReact
          src="https://lottie.host/69a6f85a-81d8-434a-aa6c-fac8bd63c4ca/PI6BQuDIXP.lottie"
          loop
          autoplay
          style={{ height: 240, width: 240, marginInline: "auto" }}
        />
        <Typography
          level="body-sm"
          sx={{
            color: "#64748b",
            fontWeight: 500,
            mt: 1,
            transition: "opacity 0.4s ease",
          }}
        >
          {loadingTexts[loadingIndex]}
        </Typography>
      </Box>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <PieChartOutlined sx={{ fontSize: "3rem", color: "#c5cae9", mb: 1 }} />
        <Typography level="title-sm" sx={{ color: "#90a4ae" }}>
          No chart data available
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: 3,
        justifyContent: "center",
        py: 2,
      }}
    >
      {chartData.map((emp) => {
        const pieData = statConfig
          .map((s) => ({
            id: s.key,
            value: emp[s.key] || 0,
            label: s.label,
            color: s.color,
          }))
          .filter((d) => d.value > 0);

        const total = statConfig.reduce((sum, s) => sum + (emp[s.key] || 0), 0);

        return (
          <Box
            key={emp.id}
            sx={{
              backgroundColor: "#fff",
              borderRadius: "18px",
              border: "1px solid #e8ecf4",
              boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
              p: 3,
              width: 300,
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              "&:hover": {
                transform: "translateY(-3px)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
              },
            }}
          >
            {/* Card Header */}
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}
            >
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #1565c0, #42a5f5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 8px rgba(25,118,210,0.3)",
                  flexShrink: 0,
                }}
              >
                <Typography
                  sx={{ color: "#fff", fontWeight: 700, fontSize: "0.85rem" }}
                >
                  {emp.name?.charAt(0).toUpperCase()}
                </Typography>
              </Box>
              <Box>
                <Typography
                  level="title-sm"
                  sx={{ fontWeight: 700, color: "#0f1b35" }}
                >
                  {emp.name}
                </Typography>
                <Typography level="body-xs" sx={{ color: "#94a3b8" }}>
                  {total} total task{total !== 1 ? "s" : ""}
                </Typography>
              </Box>
            </Box>

            {/* Pie Chart */}
            {pieData.length > 0 ? (
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <PieChart
                  series={[
                    {
                      data: pieData,
                      innerRadius: 45,
                      outerRadius: 90,
                      paddingAngle: 3,
                      cornerRadius: 4,
                      highlightScope: { faded: "global", highlighted: "item" },
                    },
                  ]}
                  width={260}
                  height={220}
                  slotProps={{ legend: { hidden: true } }}
                />
              </Box>
            ) : (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography level="body-sm" sx={{ color: "#94a3b8" }}>
                  No task data
                </Typography>
              </Box>
            )}

            {/* Stat Pills */}
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 0.8,
                mt: 1.5,
                justifyContent: "center",
              }}
            >
              {statConfig.map((s) =>
                (emp[s.key] || 0) > 0 ? (
                  <Box
                    key={s.key}
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 0.5,
                      backgroundColor: s.bg,
                      color: s.color,
                      px: 1.2,
                      py: 0.4,
                      borderRadius: "8px",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      border: `1px solid ${s.color}33`,
                    }}
                  >
                    {s.icon}
                    {emp[s.key]} {s.label}
                  </Box>
                ) : null,
              )}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export default Charts;
