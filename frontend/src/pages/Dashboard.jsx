import React from "react";
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
  return (
    <div className="min-w-screen w-full ">
      <div className="navbar-container">
        <Navbar />
      </div>
      <div className="title text-center">
        <Typography level="h3">
          Welcome {sessionStorage.getItem("empName")} -{" "}
          {sessionStorage.getItem("designation")}
        </Typography>
      </div>
      <div className="main min-w-screen w-full flex justify-between text-center items-center">
        <div className="tasks-assigned-tasks-under-review w-full">
          <Typography level="h3">Tasks</Typography>
          <Tabs>
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
            <TabPanel value={0}>
              <DashboardTasksAssigned />
            </TabPanel>
            <TabPanel value={1}>
              <DashboardTasksUnderReview />
            </TabPanel>
          </Tabs>
        </div>
        <div className="w-full">
          
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
