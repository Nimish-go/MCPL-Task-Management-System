import { GppBad } from "@mui/icons-material";
import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Modal,
  ModalClose,
  ModalDialog,
} from "@mui/joy";
import React from "react";
import { useNavigate } from "react-router-dom";

const AccessDenied = ({ open, onClose, location }) => {
  const navigate = useNavigate();

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog variant="soft" color="danger" sx={{ textAlign: "center" }}>
        <DialogTitle>
          <GppBad />
          Access Denied
        </DialogTitle>
        <DialogContent>
          Oops!! Looks Like you dont have the authorization to enter {location}{" "}
          Page.
        </DialogContent>
        <DialogActions>
          <Button
            color="danger"
            variant="outlined"
            onClick={() => navigate("/dashboard")}
          >
            Return to Dashboard
          </Button>
        </DialogActions>
      </ModalDialog>
    </Modal>
  );
};

export default AccessDenied;
