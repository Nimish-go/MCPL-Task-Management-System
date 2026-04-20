import React, { useEffect, useState } from "react";
import AccessDenied from "../components/AccessDenied";
import { useNavigate } from "react-router-dom";
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Typography,
} from "@mui/joy";
import Navbar from "../components/Navbar";
import {
  GroupAdd,
  MeetingRoom,
  PostAdd,
  Schedule,
  TableView,
  TableViewTwoTone,
  ViewAgenda,
} from "@mui/icons-material";
import axios from "axios";
import AddDirectorMeetingRecords from "../components/AddDirectorMeetingRecords";
import ViewPastMeetings from "../components/ViewPastMeetings";

const DirectorMeetings = () => {
  const [accessDenied, setAccessDenied] = useState(null);
  const [meetingData, setMeetingData] = useState([]);
  const [lodingMeeting, setLoadingMeeting] = useState(false);
  const [addMeeting, setAddMeeting] = useState(false);
  const navigate = useNavigate();

  // const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const designation = sessionStorage.getItem("designation") || "";
    if (!designation.toUpperCase().includes("DIRECTOR")) {
      setAccessDenied(true);
    }
    // axios.defaults.baseURL = "https://mcpl-task-management-system.vercel.app/";
  }, []);

  useEffect(() => {
    setLoadingMeeting(true);
    axios
      .get("http://localhost:5002/getDirectorMeetings")
      .then((res) => {
        if (res.status === 200) {
          const data = res.data;
          setMeetingData(data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoadingMeeting(false));
  }, []);

  return (
    <div className="w-screen min-w-full">
      <div className="navbar">
        <Navbar />
      </div>
      <div className="main w-screen">
        <div className="title">
          <Typography textAlign={"center"} level="h2" fontWeight={500} mt={3}>
            Director Meetings
          </Typography>
        </div>
        <div className="addNew-btn flex justify-center items-center text-center my-3">
          <Button
            sx={{ mx: 2 }}
            color="primary"
            variant="solid"
            startDecorator={<Schedule />}
          >
            Schedule Next Meeting.
          </Button>
        </div>
        <div className="flex justify-center items-center text-center my-1 overflow-x-hidden w-screen">
          <Tabs color="primary" sx={{ width: "80%" }}>
            <TabList>
              <Tab indicatorInset value={0}>
                <TableViewTwoTone /> View Past Meeting Records
              </Tab>
              <Tab value={1}>
                <PostAdd /> Add Meeting Record
              </Tab>
            </TabList>
            <TabPanel value={0}>
              <ViewPastMeetings
                meetingData={meetingData}
                isLoading={lodingMeeting}
              />
            </TabPanel>
            <TabPanel value={1}>
              <AddDirectorMeetingRecords meetingData={meetingData} />
            </TabPanel>
          </Tabs>
        </div>
        <div className="meetingData flex justify-center items-center text-center"></div>
      </div>
      <AccessDenied
        open={accessDenied}
        onClose={() => {
          setAccessDenied(false);
          navigate("/dashboard");
        }}
        location={"Director Meetings"}
      />
    </div>
  );
};

export default DirectorMeetings;
