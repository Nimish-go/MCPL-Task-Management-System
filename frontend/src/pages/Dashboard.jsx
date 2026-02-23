import React, { useState } from "react";
import Navbar from "../components/Navbar";
import {
  ListItemDecorator,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Typography,
} from "@mui/joy";
import { Assignment, TaskSharp } from "@mui/icons-material";
import DashboardTasksAssigned from "../components/DashboardTasksAssigned";
import DashboardTasksUnderReview from "../components/DashboardTasksUnderReview";

const Dashboard = () => {
  const [tasksIndex, setTasksIndex] = useState(0);

  return (
    <div className="min-w-screen w-full overflow-x-hidden ">
      <div className="navbar-container">
        <Navbar />
      </div>
      <div className="title text-center">
        <Typography level="h3">
          Welcome {sessionStorage.getItem("empName")} -{" "}
          {sessionStorage.getItem("designation")}
        </Typography>
      </div>
      <div className="main min-w-screen w-full flex justify-between text-center items-center ml-1">
        <div className="tasks-assigned-tasks-under-review w-full">
          <Typography level="h3">Tasks</Typography>
          <Tabs value={tasksIndex} onChange={(e, val) => setTasksIndex(val)}>
            <TabList>
              <Tab color="primary" variant="soft" indicatorInset>
                <ListItemDecorator>
                  <TaskSharp />
                </ListItemDecorator>{" "}
                Tasks Assigned To You
              </Tab>
              <Tab color="primary" variant="soft" indicatorInset>
                <ListItemDecorator>
                  <Assignment />
                </ListItemDecorator>
                Tasks Assigned By You
              </Tab>
            </TabList>
            {tasksIndex === 0 && (
              <TabPanel value={0}>
                <DashboardTasksAssigned />
              </TabPanel>
            )}
            {tasksIndex === 1 && (
              <TabPanel value={1}>
                <DashboardTasksUnderReview />
              </TabPanel>
            )}
          </Tabs>
        </div>
        <div className="w-full"></div>
      </div>
    </div>
  );
};

export default Dashboard;
