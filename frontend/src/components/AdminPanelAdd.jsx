import {
  AddCircle,
  CreateNewFolder,
  PersonAdd,
  KeyboardArrowDown,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Drawer,
  FormControl,
  FormLabel,
  Input,
  ModalClose,
  Option,
  Select,
  Typography,
} from "@mui/joy";
import { selectClasses } from "@mui/material/Select";
import axios from "axios";
import React, { useEffect, useState } from "react";

const AdminPanelAdd = ({ open, onClose, type, designations, branches }) => {
  // const [projectName, setProjectName] = useState("");
  // const [projectCode, setProjectCode] = useState("");
  // const [clientName, setClientName] = useState("");
  // const [clientAddr, setClientAddr] = useState("");
  // const [clientContact, setClientContact] = useState("");
  // const [remarks, setRemarks] = useState("");

  // const [employeeName, setEmployeeName] = useState("");
  // const [employeeEmail, setEmployeeEmail] = useState("");
  // const [dob, setDOB] = useState("");
  // const [doj, setDOJ] = useState("");

  return (
    <Drawer variant="soft" anchor="right" open={open} onClose={onClose}>
      <Box>
        <Typography level="h4" mb={2} textAlign={"center"}>
          {type === "project"
            ? "Add a Project"
            : type === "workType"
              ? "Add Work Type"
              : type === "employee"
                ? "Add An Employee"
                : ""}
        </Typography>
        <ModalClose></ModalClose>
        <Box
          textAlign={"center"}
          justifyContent={"center"}
          mx={"auto"}
          alignItems={"center"}
        >
          {type === "project" ? (
            <>
              <FormControl>
                <FormLabel>Enter Project Code</FormLabel>
                <Input type="text" variant="soft" placeholder="XYZ01" />
              </FormControl>
              <FormControl>
                <FormLabel>Enter Project Name</FormLabel>
                <Input
                  type="text"
                  variant="soft"
                  color="primary"
                  placeholder="Lorem Ipsum dolor sit amet......."
                />
              </FormControl>
              <FormControl>
                <FormLabel>Enter Client Name</FormLabel>
                <Input
                  type="text"
                  variant="soft"
                  placeholder="ABC Client...."
                />
              </FormControl>
              <FormControl>
                <FormLabel>Enter Client Contact Info</FormLabel>
                <Input type="text" variant="soft" placeholder="Mobile/Email" />
              </FormControl>
              <FormControl>
                <FormLabel>Enter Address</FormLabel>
                <Input
                  type="text"
                  variant="soft"
                  placeholder="221B Baker Street"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Enter Remarks</FormLabel>
                <Input type="text" variant="soft" placeholder="Remarks...." />
              </FormControl>
              <Button variant="soft" color="primary">
                <CreateNewFolder /> Add Project Details
              </Button>
            </>
          ) : type === "workType" ? (
            <>
              <FormControl>
                <FormLabel>Enter Work Type</FormLabel>
                <Input
                  type="text"
                  variant="soft"
                  color="primary"
                  placeholder="Designing/Drafting/Dr..."
                />
              </FormControl>
              <FormControl>
                <FormLabel>Enter Remarks</FormLabel>
                <Input
                  type="text"
                  variant="soft"
                  color="primary"
                  placeholder="Remarks...."
                />
              </FormControl>
              <Button variant="soft" color="primary">
                <AddCircle /> Add Project Details
              </Button>
            </>
          ) : type === "employee" ? (
            <div className="text-center m-5">
              <FormControl>
                <FormLabel>Enter Employee Name</FormLabel>
                <Input type="text" variant="soft" placeholder="Joe Stern" />
              </FormControl>
              <FormControl sx={{ mt: 3 }}>
                <FormLabel>Enter Employee Email</FormLabel>
                <Input
                  type="email"
                  variant="soft"
                  placeholder="joestern@example.com"
                />
              </FormControl>
              <FormControl sx={{ mt: 3 }}>
                <FormLabel>Enter Date Of Birth</FormLabel>
                <Input type="date" variant="soft" />
              </FormControl>
              <FormControl sx={{ mt: 3 }}>
                <FormLabel>Enter Date Of Joining</FormLabel>
                <Input type="date" variant="soft" />
              </FormControl>
              <FormControl sx={{ mt: 3 }}>
                <FormLabel>Enter Designation</FormLabel>
                <Select variant="soft" placeholder="Analyst">
                  {designations.map((designation) => (
                    <Option value={designation.id}>{designation.name}</Option>
                  ))}
                </Select>
              </FormControl>
              <FormControl sx={{ mt: 3 }}>
                <FormLabel>Enter Branch</FormLabel>
                <Select variant="soft" placeholder="Director">
                  {branches.map((branch) => (
                    <Option value={branch.id}>{branch.name}</Option>
                  ))}
                </Select>
              </FormControl>
              <FormControl sx={{ mt: 3 }}>
                <FormLabel>Enter Role</FormLabel>
                <Select
                  variant="soft"
                  placeholder="Select Role"
                  indicator={<KeyboardArrowDown />}
                  sx={{
                    [`& .${selectClasses.indicator}`]: {
                      transition: "0.2s",
                      [`&.${selectClasses.expanded}`]: {
                        transform: "rotate(-180deg)",
                      },
                    },
                  }}
                >
                  <Option>User</Option>
                  <Option>Admin</Option>
                </Select>
              </FormControl>
              <Button variant="soft" color="primary" sx={{ mt: 4 }}>
                <PersonAdd /> Add Employee Details
              </Button>
            </div>
          ) : (
            <></>
          )}
        </Box>
      </Box>
    </Drawer>
  );
};

export default AdminPanelAdd;
