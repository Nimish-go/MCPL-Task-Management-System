import { ListItemDecorator, Tab, TabList, TabPanel, Tabs } from "@mui/joy";
import { TableChart, PieChart } from "@mui/icons-material";
import React, { useEffect, useState } from "react";
import Tables from "./Tables";
import Charts from "./Charts";
import axios from "axios";

const DashboardTasksUnderReview = () => {
  const [tableData, setTableData] = useState([]);
  const [chartData, setChartData] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.defaults.baseURL = "https://mcpl-task-management-system.vercel.app/";
    axios
      .get(`/dashboard_tasks_under_review/${sessionStorage.getItem("empName")}`)
      .then((res) => {
        if (res.status === 200) {
          const data = res.data;
          setTableData(data);
          setChartData(data);
          console.log("Data: ", data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="tasksUnderReview">
      <div className="tabs">
        <Tabs variant="soft">
          <TabList>
            <Tab indicatorInset>
              <ListItemDecorator>
                <TableChart />
              </ListItemDecorator>
              Tabular View
            </Tab>
            <Tab indicatorInset>
              <ListItemDecorator>
                <PieChart />
              </ListItemDecorator>
              Chart View
            </Tab>
          </TabList>
          <TabPanel value={0}>
            <Tables
              type="underReview"
              tableData={tableData}
              loading={loading}
            />
          </TabPanel>
          <TabPanel value={1}>
            <Charts chartData={chartData} loading={loading} />
          </TabPanel>
        </Tabs>
      </div>
    </div>
  );
};

export default DashboardTasksUnderReview;
