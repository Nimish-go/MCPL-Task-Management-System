import React, { useState } from "react";
import { PieChart } from "@mui/x-charts/PieChart";
import { Box, Option, Typography, Select } from "@mui/joy";
import { Skeleton } from "@mui/material";

const Charts = ({ chartData, loading }) => {
  const [name, setName] = useState("");

  const selectedData = chartData.find((emp) => emp.name === name);

  const pieData = selectedData
    ? [
        {
          id: selectedData.id,
          value: selectedData.pending_count,
          label: "Pending",
          color: "yellow",
        },
        {
          id: selectedData.id,
          value: selectedData.completed_count,
          label: "Completed",
          color: "green",
        },
        {
          id: selectedData.id,
          value: selectedData.overdue_count,
          label: "Overdue",
          color: "red",
        },
        {
          id: selectedData.id,
          value: selectedData.reloaded_count,
          label: "Reloaded",
          color: "orange",
        },
      ]
    : [];

  return (
    <Box sx={{ width: 400 }}>
      {/* Loading State */}
      {loading ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Skeleton variant="rectangular" width={200} height={40} />
          <Skeleton variant="circular" width={250} height={250} />
        </Box>
      ) : chartData.length === 0 ? (
        /* Empty State */
        <Typography level="body-md" sx={{ mt: 2 }}>
          No Data Available
        </Typography>
      ) : (
        <>
          {/* Dropdown */}
          <Select
            variant="soft"
            color="primary"
            placeholder="Select Employee"
            value={name}
            onChange={(e, newVal) => setName(newVal)}
            sx={{ width: 250, mb: 2 }}
          >
            {chartData.map((task, index) => (
              <Option key={index} value={task.name}>
                {task.name}
              </Option>
            ))}
          </Select>

          {/* Pie Chart */}
          {selectedData ? (
            <PieChart
              key={name}
              series={[
                {
                  data: pieData,
                },
              ]}
              width={400}
              height={300}
            />
          ) : (
            <Typography level="body-sm">Please select an employee</Typography>
          )}
        </>
      )}
    </Box>
  );
};

export default Charts;
