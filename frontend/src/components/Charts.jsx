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
    <Box>
      <Select
        variant="soft"
        color="primary"
        onChange={(e, newVal) => setName(newVal)}
        sx={{ width: 5 }}
      >
        
        {chartData.map((task, index) => (
          <Option key={index} value={task.name}>
            {task.name}
          </Option>
        ))}
      </Select>
      {selectedData && (
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
      )}
    </Box>
  );
};

export default Charts;
