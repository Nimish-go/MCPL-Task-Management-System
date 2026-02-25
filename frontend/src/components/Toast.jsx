import { Check, Close, Report, Warning } from "@mui/icons-material";
import { Button, ModalClose, Snackbar } from "@mui/joy";
import React from "react";

const Toast = ({ status, message, open, onClose }) => {
  return (
    <Snackbar
      variant="soft"
      color={
        status === "success"
          ? "success"
          : status === "error"
            ? "danger"
            : "warning"
      }
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      startDecorator={
        status === "success" ? (
          <Check />
        ) : status === "error" ? (
          <Report />
        ) : (
          <Warning />
        )
      }
      open={open}
      onClose={onClose}
    >
      {message}{" "}
      <Button
        onClick={onClose}
        color={
          status === "success"
            ? "success"
            : status === "error"
              ? "danger"
              : "warning"
        }
        variant="soft"
      >
        Dismiss
      </Button>
    </Snackbar>
  );
};

export default Toast;
