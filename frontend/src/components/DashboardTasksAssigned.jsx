import { PieChart, TableChart } from "@mui/icons-material";
import { ListItemDecorator, Tab, TabList, TabPanel, Tabs } from "@mui/joy";
import React, { useEffect, useState } from "react";
import Tables from "./Tables";
import axios from "axios";

const DashboardTasksAssigned = () => {
  const [tasksData, setTasksData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    axios.defaults.baseURL = "http://localhost:5002";

    setLoading(true);
    axios
      .get(`/dashboard_tasks_assigned/${sessionStorage.getItem("empName")}`)
      .then((res) => {
        if (res.status === 200) {
          const data = res.data;
          setTasksData(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="tasksAssigned">
      <div className="tabs">
        <Tables type="assigned" tableData={tasksData} loading={loading} />
      </div>
    </div>
  );
};

export default DashboardTasksAssigned;
