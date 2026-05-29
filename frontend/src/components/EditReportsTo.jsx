import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Modal,
  ModalClose,
  ModalDialog,
  Typography,
} from "@mui/joy";
import axios from "axios";
import React, { useEffect, useState } from "react";
import Toast from "./Toast";

const EditReportsTo = ({
  open,
  onClose,
  reportsToId,
  empId,
  reportsToName,
  empName,
}) => {
  useEffect(() => {
    axios.defaults.baseURL = "http://localhost:5002";
  }, []);

  const [toast, setToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastStatus, setToastStatus] = useState("");

  const handleReportsToChange = () => {
    const formData = new FormData();
    formData.append("reportsToId", reportsToId);
    formData.append("empId", empId);
    axios
      .put("/updateReportsTo", formData)
      .then((res) => {
        if (res.status === 200) {
          const data = res.data;
          setToast(true);
          setToastMessage(data.message);
          setToastStatus("success");
        }
      })
      .catch((err) => {
        setToast(true);
        setToastMessage("Something Went Wrong. Please Check the Console.");
        setToastStatus("error");
        console.error(err);
      });
  };

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <ModalDialog>
          <DialogTitle>
            <Typography level="title-md">
              Reports To Edit Confirmation
            </Typography>
            <ModalClose />
          </DialogTitle>
          <DialogContent>
            Do You want to change the Reporting To for {empName}? Changing
            Reporting To: {reportsToName}
          </DialogContent>
          <DialogActions>
            <Button color="primary" variant="solid" onClick={onClose}>
              No
            </Button>
            <Button
              color="success"
              variant="solid"
              onClick={handleReportsToChange}
            >
              Yes
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal>
      <Toast
        open={toast}
        onClose={() => setToast(false)}
        message={toastMessage}
        status={toastStatus}
      />
    </>
  );
};

export default EditReportsTo;
