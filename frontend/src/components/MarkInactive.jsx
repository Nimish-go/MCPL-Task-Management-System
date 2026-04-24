import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Modal,
  ModalDialog,
  Typography,
} from "@mui/joy";
import axios from "axios";
import React, { useState } from "react";

const MarkInactive = ({ open, onClose, employeeName }) => {
  const [toastStatus, setToastStatus] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [toastOpen, setToastOpen] = useState(false);

  axios.defaults.baseURL = "https://mcpl-task-management-system.vercel.app/"

  const handleMarkInactive = (event) => {
    event.preventDefault();
    axios
      .put(`/markInactive/${employeeName}`)
      .then((res) => {
        if (res.status === 200) {
          setToastStatus(res.data.status);
          setToastMessage(res.data.message);
          setToastOpen(true);
          onClose();
          window.location.reload();
        }
      })
      .catch((err) => {
        console.error(err);
        setToastStatus("error");
        setToastMessage("Something Went Wrong. Please Check The Console.");
        setToastOpen(true);
        onClose();
      });
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog variant="outlined" color="danger" role="alertdialog">
        <DialogTitle level="title-sm">Mark Inactive</DialogTitle>
        <DialogContent>
          <Typography level="body-md">
            Do You want to Mark <strong>{'"' + employeeName + '"'}</strong> as
            Inactive?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="soft" color="primary" onClick={() => onClose()}>
            Cancel
          </Button>
          <Button variant="solid" color="danger" onClick={handleMarkInactive}>
            Mark Inactive
          </Button>
        </DialogActions>
      </ModalDialog>
    </Modal>
  );
};

export default MarkInactive;
