import React, { useEffect, useState } from "react";
import { PieChart } from "@mui/x-charts/PieChart";
import { Box, Typography } from "@mui/joy";
import { Skeleton } from "@mui/material";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const Charts = ({ chartData, loading }) => {
  const [loadingIndex, setLoadingIndex] = useState(0);
  const loadingText = [
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

  useEffect(() => {
    if (!loading) return;

    const interval = setInterval(() => {
      setLoadingIndex((prev) => {
        let randomIndex;
        do {
          randomIndex = Math.floor(Math.random() * loadingText.length);
        } while (randomIndex === prev);
        return randomIndex;
      });
      console.log(loadingIndex);
    }, 1500);

    return () => clearInterval(interval);
  }, [loading]);

  return (
    <Box sx={{ width: "100%" }}>
      {loading ? (
        <Box
          sx={{
            gap: 4,
            textAlign: "center",
          }}
        >
          <DotLottieReact
            src="https://lottie.host/69a6f85a-81d8-434a-aa6c-fac8bd63c4ca/PI6BQuDIXP.lottie"
            loop
            autoplay
            style={{ height: 300, width: 300, marginInline: "auto" }}
          />
          <Typography level="body-md" textAlign={"center"}>
            {loadingText[loadingIndex]}
          </Typography>
        </Box>
      ) : chartData.length === 0 ? (
        <Typography level="body-md">No Data Available</Typography>
      ) : (
        <div className="flex flex-wrap justify-center gap-10">
          {chartData.map((emp) => {
            const pieData = [
              {
                id: 1,
                value: emp.pending_count,
                label: "Pending",
                color: "#ffb703",
              },
              {
                id: 2,
                value: emp.completed_count,
                label: "Completed",
                color: "#52b69a",
              },
              {
                id: 3,
                value: emp.overdue_count,
                label: "Overdue",
                color: "#bf0603",
              },
              {
                id: 4,
                value: emp.reloaded_count,
                label: "Reloaded",
                color: "#e85d04",
              },
            ].filter((item) => item.value > 0);

            return (
              <Box
                key={emp.id}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  p: 2,
                  borderRadius: "15px",
                  boxShadow: "sm",
                  backgroundColor: "background.body",
                }}
              >
                <Typography level="title-md" sx={{ mb: 1 }}>
                  {emp.name}'s Task Counts
                </Typography>

                <PieChart
                  series={[
                    {
                      data: pieData,
                      innerRadius: 40,
                      outerRadius: 100,
                    },
                  ]}
                  width={300}
                  height={250}
                />
              </Box>
            );
          })}
        </div>
      )}
    </Box>
  );
};

export default Charts;
