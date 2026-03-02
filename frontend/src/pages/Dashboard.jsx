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
import { Assignment, TaskAlt, TaskSharp } from "@mui/icons-material";
import DashboardTasksAssigned from "../components/DashboardTasksAssigned";
import DashboardTasksUnderReview from "../components/DashboardTasksUnderReview";
import AllTasksAssigned from "../components/AllTasksAssigned";

const Dashboard = () => {
  const [tasksIndex, setTasksIndex] = useState(0);
  const designation = sessionStorage.getItem("designation") || "";
  const isDirector = designation.toUpperCase().includes("DIRECTOR")
    ? true
    : false;

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
              {isDirector && (
                <Tab color="primary" variant="soft" indicatorInset>
                  <ListItemDecorator>
                    <TaskAlt /> All Tasks Assigned
                  </ListItemDecorator>
                </Tab>
              )}
            </TabList>
            <TabPanel value={0}>
              <DashboardTasksAssigned />
            </TabPanel>
            <TabPanel value={1}>
              <DashboardTasksUnderReview />
            </TabPanel>
            <TabPanel value={2}>
              <AllTasksAssigned />
            </TabPanel>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
