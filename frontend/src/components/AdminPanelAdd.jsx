import { AddCircle, CreateNewFolder, PersonAdd } from "@mui/icons-material";
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
import React, { useState } from "react";

const AdminPanelAdd = ({ open, onClose, type }) => {
  //   const [projectName, setProjectName] = useState("");
  //   const [projectCode, setProjectCode] = useState("");
  //   const [clientName, setClientName] = useState("");
  //   const [clientAddr, setClientAddr] = useState("");
  //   const [clientContact, setClientContact] = useState("");

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
        <Box textAlign={"center"} justifyContent={"center"} mx={"auto"}>
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
            <div className="text-center mx-2">
              <FormControl>
                <FormLabel>Enter Employee Name</FormLabel>
                <Input
                  type="text"
                  variant="soft"
                  color="primary"
                  placeholder="Joe Stern"
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
                <Input type="text" variant="soft" placeholder="Mobile/Email" />
              </FormControl>
              <FormControl sx={{ mt: 3 }}>
                <FormLabel>Enter Branch</FormLabel>
                <Input type="text" variant="soft" placeholder="Remarks...." />
              </FormControl>
              <FormControl sx={{ mt: 3 }}>
                <FormLabel>Enter Role</FormLabel>
                <Select variant="soft" placeholder="Select Role">
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
