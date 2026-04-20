import { TableChart, PieChart } from "@mui/icons-material";
import { Box, Tab, TabList, TabPanel, Tabs, ListItemDecorator } from "@mui/joy";
import React, { useEffect, useState } from "react";
import Tables from "./Tables";
import Charts from "./Charts";
import axios from "axios";

const DashboardTasksUnderReview = () => {
  const [tableData, setTableData] = useState([]);
  const [chartData, setChartData] = useState({});
  const [loading, setLoading] = useState(true);
  const [tabIndex, setTabIndex] = useState(0);

  useEffect(() => {
    axios.defaults.baseURL = "https://mcpl-task-management-system.vercel.app";
    axios
      .get(`/dashboard_tasks_under_review/${sessionStorage.getItem("empName")}`)
      .then((res) => {
        if (res.status === 200) {
          setTableData(res.data);
          setChartData(res.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Tabs
        value={tabIndex}
        onChange={(e, val) => setTabIndex(val)}
        sx={{ backgroundColor: "transparent" }}
      >
        <TabList
          sx={{
            mb: 2.5,
            gap: 1,
            backgroundColor: "#f4f6fb",
            borderRadius: "12px",
            p: 0.5,
            width: "fit-content",
            "& .MuiTab-root": {
              borderRadius: "10px",
              fontWeight: 600,
              fontSize: "0.825rem",
              color: "#64748b",
              border: "none",
              px: 2,
              py: 1,
              minHeight: "unset",
              transition: "all 0.2s ease",
              "&.Mui-selected": {
                backgroundColor: "#fff",
                color: "#1976d2",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              },
            },
          }}
        >
          <Tab value={0} disableIndicator>
            <ListItemDecorator sx={{ mr: 0.5 }}>
              <TableChart sx={{ fontSize: "0.9rem" }} />
            </ListItemDecorator>
            Tabular View
          </Tab>
          <Tab value={1} disableIndicator>
            <ListItemDecorator sx={{ mr: 0.5 }}>
              <PieChart sx={{ fontSize: "0.9rem" }} />
            </ListItemDecorator>
            Chart View
          </Tab>
        </TabList>

        <TabPanel value={0} sx={{ p: 0 }}>
          <Tables type="underReview" tableData={tableData} loading={loading} />
        </TabPanel>
        <TabPanel value={1} sx={{ p: 0 }}>
          <Charts chartData={chartData} loading={loading} />
        </TabPanel>
      </Tabs>
    </Box>
  );
};

export default DashboardTasksUnderReview;
