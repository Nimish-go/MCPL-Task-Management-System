import {
  Box,
  Button,
  Modal,
  ModalDialog,
  Typography,
} from "@mui/joy";
import { PowerSettingsNew, WarningAmberRounded } from "@mui/icons-material";
import React from "react";
import { useNavigate } from "react-router-dom";

const LogoutConfirm = ({ open, onClose }) => {
  const navigate = useNavigate();

  const logout = () => {
    sessionStorage.clear();
    navigate("/");
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog
        sx={{
          p: 0,
          borderRadius: "20px",
          width: 360,
          maxWidth: "90vw",
          overflow: "hidden",
          bgcolor: "#0f1117",
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "0 40px 80px rgba(0,0,0,0.7)",
          "@keyframes modalIn": {
            from: { opacity: 0, transform: "scale(0.94) translateY(12px)" },
            to:   { opacity: 1, transform: "scale(1) translateY(0)" },
          },
          animation: "modalIn 0.25s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        {/* Top accent bar */}
        <Box sx={{ height: 4, background: "linear-gradient(90deg, #ef4444, #dc2626)" }} />

        <Box sx={{ p: 3.5 }}>
          {/* Icon */}
          <Box
            sx={{
              width: 56, height: 56, borderRadius: "16px",
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              mb: 2.5,
            }}
          >
            <PowerSettingsNew sx={{ fontSize: "1.6rem", color: "#f87171" }} />
          </Box>

          {/* Title */}
          <Typography
            sx={{ fontWeight: 800, fontSize: "1.1rem", color: "#f0f0f5", mb: 0.8, letterSpacing: "-0.02em" }}
          >
            Sign out of MCPL?
          </Typography>
          <Typography sx={{ fontSize: "0.82rem", color: "#4a5260", lineHeight: 1.6 }}>
            You'll be returned to the login screen. Any unsaved work will remain in the system.
          </Typography>

          {/* Actions */}
          <Box sx={{ display: "flex", gap: 1.5, mt: 3 }}>
            <Button
              variant="outlined"
              onClick={onClose}
              sx={{
                flex: 1, borderRadius: "10px", fontWeight: 600, fontSize: "0.85rem",
                borderColor: "rgba(255,255,255,0.08)", color: "#5a6070",
                "&:hover": { backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.15)" },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={logout}
              startDecorator={<PowerSettingsNew sx={{ fontSize: "1rem" }} />}
              sx={{
                flex: 1, borderRadius: "10px", fontWeight: 700, fontSize: "0.85rem",
                background: "linear-gradient(135deg, #ef4444, #dc2626)",
                color: "#fff", border: "none",
                boxShadow: "0 4px 14px rgba(239,68,68,0.35)",
                "&:hover": { background: "linear-gradient(135deg, #f87171, #ef4444)" },
              }}
            >
              Sign Out
            </Button>
          </Box>
        </Box>
      </ModalDialog>
    </Modal>
  );
};

export default LogoutConfirm;