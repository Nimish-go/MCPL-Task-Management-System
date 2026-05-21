import {
  Box,
  Button,
  Modal,
  ModalDialog,
  Typography,
} from "@mui/joy";
import { LockOutlined, LoginOutlined } from "@mui/icons-material";
import React from "react";
import { useNavigate } from "react-router-dom";

const SessionExpiredModal = ({ open }) => {
  const navigate = useNavigate();

  const handleLogin = () => {
    sessionStorage.clear();
    navigate("/");
  };

  return (
    <Modal
      open={open}
      // Prevent closing by clicking backdrop or pressing Escape
      onClose={(_, reason) => {
        if (reason === "backdropClick" || reason === "escapeKeyDown") return;
      }}
      // Keep it above everything else
      sx={{ zIndex: 9999 }}
    >
      <ModalDialog
        sx={{
          p: 0,
          borderRadius: "20px",
          width: 380,
          maxWidth: "92vw",
          overflow: "hidden",
          bgcolor: "#0f1117",
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "0 40px 80px rgba(0,0,0,0.8)",
          "@keyframes modalIn": {
            from: { opacity: 0, transform: "scale(0.94) translateY(12px)" },
            to:   { opacity: 1, transform: "scale(1)   translateY(0)" },
          },
          animation: "modalIn 0.28s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        {/* Top accent bar */}
        <Box
          sx={{
            height: 4,
            background: "linear-gradient(90deg, #0f1b35, #1565c0, #1976d2)",
          }}
        />

        <Box sx={{ p: 3.5 }}>
          {/* Icon */}
          <Box
            sx={{
              width: 56, height: 56, borderRadius: "16px",
              background: "rgba(21,101,192,0.12)",
              border: "1px solid rgba(21,101,192,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              mb: 2.5,
            }}
          >
            <LockOutlined sx={{ fontSize: "1.6rem", color: "#42a5f5" }} />
          </Box>

          {/* Text */}
          <Typography
            sx={{
              fontWeight: 800, fontSize: "1.1rem", color: "#f0f0f5",
              mb: 0.8, letterSpacing: "-0.02em",
            }}
          >
            Session Expired
          </Typography>
          <Typography sx={{ fontSize: "0.82rem", color: "#4a5260", lineHeight: 1.65 }}>
            You've been logged out due to inactivity or your session has ended.
            Please sign in again to continue.
          </Typography>

          {/* Divider */}
          <Box sx={{ height: "1px", backgroundColor: "rgba(255,255,255,0.05)", my: 2.5 }} />

          {/* Info row */}
          <Box
            sx={{
              display: "flex", alignItems: "center", gap: 1.5,
              p: 1.5, borderRadius: "10px",
              backgroundColor: "rgba(21,101,192,0.06)",
              border: "1px solid rgba(21,101,192,0.12)",
              mb: 2.5,
            }}
          >
            <Box
              sx={{
                width: 8, height: 8, borderRadius: "50%", bgcolor: "#ef4444", flexShrink: 0,
                "@keyframes blink": {
                  "0%,100%": { opacity: 1 },
                  "50%":     { opacity: 0.3 },
                },
                animation: "blink 1.4s ease-in-out infinite",
              }}
            />
            <Typography sx={{ fontSize: "0.75rem", color: "#5a7090" }}>
              Your session is no longer active
            </Typography>
          </Box>

          {/* CTA */}
          <Button
            fullWidth
            startDecorator={<LoginOutlined sx={{ fontSize: "1.1rem" }} />}
            onClick={handleLogin}
            sx={{
              borderRadius: "10px", fontWeight: 700, fontSize: "0.9rem",
              background: "linear-gradient(135deg, #0f1b35, #1565c0)",
              color: "#fff", border: "none",
              boxShadow: "0 4px 16px rgba(21,101,192,0.4)",
              py: 1.3,
              "&:hover": {
                background: "linear-gradient(135deg, #1a2d54, #1976d2)",
                boxShadow: "0 6px 20px rgba(21,101,192,0.5)",
              },
            }}
          >
            Go to Login
          </Button>
        </Box>
      </ModalDialog>
    </Modal>
  );
};

export default SessionExpiredModal;