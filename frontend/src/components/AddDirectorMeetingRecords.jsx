import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalClose,
  ModalDialog,
  Step,
  StepButton,
  StepIndicator,
  Stepper,
  Typography,
} from "@mui/joy";
import axios from "axios";
import React, { useEffect, useState } from "react";
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import { Calendar } from "primereact/calendar";
import { Check } from "@mui/icons-material";
import { PickList } from "primereact/picklist";
import { Editor } from "primereact/editor";

const AddDirectorMeetingRecords = () => {
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const [activeStep, setActiveStep] = useState(0);
  const [allDirectors, setAllDirectors] = useState([]);
  const [selectedDirectors, setSelectedDirectors] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [meetingDate, setMeetingDate] = useState(today);
  const [meetingTitle, setMeetingTitle] = useState("");
  const [mom, setMom] = useState("");
  const [agenda, setAgenda] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:5002/getDirectors")
      .then((res) => {
        if (res.status === 200) {
          const data = res.data;
          setAllDirectors(data);
        }
      })
      .catch((err) => console.error(err));

    axios
      .get("http://localhost:5002/getStaff")
      .then((res) => {
        if (res.status === 200) {
          setAllEmployees(res.data);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return (
          <>
            <FormControl>
              <FormLabel>Meeting Date</FormLabel>
              <Calendar
                value={meetingDate}
                onChange={(e) => setMeetingDate(e.value)}
                showIcon
                dateFormat="dd MM yy"
                inputStyle={{ width: "100%" }}
                panelStyle={{ zIndex: 2000 }}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Meeting Title</FormLabel>
              <Input
                type="text"
                value={meetingTitle}
                onChange={(e) => setMeetingTitle(e.target.value)}
              />
            </FormControl>
          </>
        );
      case 1:
        return (
          <>
            <PickList
              source={allDirectors}
              target={selectedDirectors}
              itemTemplate={(item) => item.name}
              targetHeader="Present Directors"
              sourceHeader="Select Directors Present"
              onChange={(event) => {
                setAllDirectors(event.source);
                setSelectedDirectors(event.target);
                console.log(event.target);
              }}
            />
          </>
        );
      case 2:
        return (
          <>
            <PickList
              source={allEmployees}
              target={selectedEmployees}
              itemTemplate={(item) => item.name}
              targetHeader="Present Staff"
              sourceHeader="Select Staff Present"
              onChange={(event) => {
                setAllEmployees(event.source);
                setSelectedEmployees(event.target);
                console.log(event.target);
              }}
            />
          </>
        );
      case 3:
        return (
          <div className="card">
            <Typography level="title-sm" my={3}>
              Minutes of Meeting
            </Typography>
            <Editor
              value={mom}
              onTextChange={(e) => setMom(e.htmlValue)}
              style={{ height: "320px" }}
            />
          </div>
        );
      case 4:
        return (
          <div>
            <FormControl>
              <FormLabel>Enter Agenda</FormLabel>
              <Input
                value={agenda}
                onChange={(e) => setAgenda(e.target.value)}
              />
            </FormControl>
          </div>
        );
      case 5:
        return (
          <div className="">
            <div className="flex my-2 justify-between">
              <Typography level="title-md">Meeting Date: </Typography>
              <Typography level="body-md">
                {meetingDate.toDateString()}
              </Typography>
            </div>
            <div className="flex my-2 justify-between">
              <Typography level="title-md">Meeting Title: </Typography>
              <Typography level="body-md">{meetingTitle}</Typography>
            </div>
            <div className="flex my-2 justify-between">
              <Typography level="title-md">Directors Presents</Typography>
              <ul>
                {selectedDirectors.map((director, index) => (
                  <li key={index} className="list-disc">
                    {director.name}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex my-2 justify-between">
              <Typography level="title-md">Staff Presents</Typography>
              <ul>
                {selectedEmployees.map((emp, index) => (
                  <li key={index} className="list-disc">
                    {emp.name}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex my-2 justify-between">
              <Typography level="title-md">Minutes of Meeting: </Typography>
              <Box
                sx={{
                  mt: 1,
                  p: 2,
                  borderRadius: "8px",
                  backgroundColor: "#f9fafb",
                  textAlign: "left",
                  maxWidth: "600px",
                }}
                dangerouslySetInnerHTML={{ __html: mom }}
              />
            </div>
            <div className="flex my-2 justify-between">
              <Typography level="title-md">Agenda: </Typography>
              <Typography level="body-md">{agenda}</Typography>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="justify-center text-center items-center overflow-x-hidden">
      <Typography level="title-lg">
        Fill Meeting Details for Meeting On {today.toDateString()}
      </Typography>
      <Box textAlign={"center"}>
        <Stepper sx={{ px: 1, m: 3 }}>
          {[
            "Meeting Details",
            "Directors Present",
            "Additional Staff Present",
            "Minutes Of Meeting",
            "Agenda",
            "Review",
          ].map((label, i) => (
            <Step
              key={i + 1}
              indicator={
                <StepIndicator
                  variant={activeStep <= i ? "soft" : "solid"}
                  color={activeStep < i ? "neutral" : "primary"}
                >
                  {activeStep <= i ? i + 1 : <Check />}
                </StepIndicator>
              }
              sx={[
                activeStep > i &&
                  i !== 2 && { "&::after": { bgcolor: "primary.solidBg" } },
                { mx: 3 },
              ]}
            >
              <StepButton onClick={() => setActiveStep(i)}>{label}</StepButton>
            </Step>
          ))}
        </Stepper>
        <Box sx={{ minHeight: 200 }}>{renderStep()}</Box>
      </Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
        <Button
          disabled={activeStep === 0}
          onClick={() => setActiveStep((prev) => prev - 1)}
        >
          Back
        </Button>
        {activeStep === 5 ? (
          <Button>Submit</Button>
        ) : (
          <Button onClick={() => setActiveStep((prev) => prev + 1)}>
            Next
          </Button>
        )}
      </Box>
    </div>
  );
};

export default AddDirectorMeetingRecords;
