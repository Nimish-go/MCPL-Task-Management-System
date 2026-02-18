import { Check, Report, Warning } from "@mui/icons-material";
import { Snackbar } from "@mui/joy";
import React from "react";

const Toast = ({ status, message, open }) => {
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
    >
      {message}
    </Snackbar>
  );
};

export default Toast;
