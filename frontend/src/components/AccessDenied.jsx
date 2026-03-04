import { GppBad } from "@mui/icons-material";
import {
  DialogContent,
  DialogTitle,
  Modal,
  ModalClose,
  ModalDialog,
} from "@mui/joy";
import React from "react";

const AccessDenied = ({ open, onClose, location }) => {
  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog variant="soft" color="danger">
        <DialogTitle>
          <GppBad />
          Access Denied
        </DialogTitle>
        <DialogContent>Access Denied at {location}. </DialogContent>
      </ModalDialog>
    </Modal>
  );
};

export default AccessDenied;
