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

const LogoutConfirm = ({ open, onClose }) => {
  const navigate = useNavigate();

  const logout = () => {
    navigate("/");
    sessionStorage.clear();
  };

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <ModalDialog color="danger" variant="soft">
          <ModalClose />
          <DialogTitle>Logout Confirmation</DialogTitle>
          <DialogContent>Are You Sure You want to Logout?</DialogContent>
          <DialogActions>
            <Button variant="soft" color="danger" onClick={logout}>
              Yes
            </Button>
            <Button variant="solid" color="success">
              No
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal>
    </>
  );
};

export default LogoutConfirm;
