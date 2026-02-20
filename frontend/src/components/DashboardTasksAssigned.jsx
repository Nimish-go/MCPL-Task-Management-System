import { PieChart, TableChart } from "@mui/icons-material";
import { ListItemDecorator, Tab, TabList, TabPanel, Tabs } from "@mui/joy";
import React, { useEffect, useState } from "react";
import Tables from "./Tables";
import Charts from "./Charts";
import axios from 'axios';

const DashboardTasksAssigned = () => {

  const [tasksData, setTasksData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.defaults.baseURL = "http://localhost:5002";
    axios.post()
  }, []);

  return (
    <div className="tasksAssigned">
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
            <Tables />
          </TabPanel>
          <TabPanel value={1}>
            <Charts />
          </TabPanel>
        </Tabs>
      </div>
    </div>
  );
};

export default DashboardTasksAssigned;
