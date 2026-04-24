import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Modal,
  ModalDialog,
  ModalClose,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  Divider,
  Box,
  Typography,
} from "@mui/joy";
import { ShieldX } from "lucide-react";

const AccessDenied = ({ open, onClose, location }) => {
  const navigate = useNavigate();

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog
        variant="plain"
        sx={{
          p: 0,
          overflow: "hidden",
          maxWidth: 420,
          width: "100%",
          borderRadius: "20px",
          border: "1px solid",
          borderColor: "rgba(255,255,255,0.07)",
          bgcolor: "#16161a",
          boxShadow:
            "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(220,38,38,0.12)",
          "@keyframes slideUp": {
            from: { opacity: 0, transform: "translateY(24px) scale(0.96)" },
            to: { opacity: 1, transform: "translateY(0) scale(1)" },
          },
          animation: "slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        {/* Header band */}
        <Box
          sx={{
            background: "linear-gradient(135deg, #1a0808 0%, #220b0b 100%)",
            borderBottom: "1px solid rgba(220,38,38,0.18)",
            px: 4.5,
            pt: 4.5,
            pb: 3.5,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse at 50% 0%, rgba(220,38,38,0.18) 0%, transparent 70%)",
            },
          }}
        >
          {/* Pulsing shield icon */}
          <Box sx={{ position: "relative", mb: 2, zIndex: 1 }}>
            {[80, 104].map((size, i) => (
              <Box
                key={i}
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: size,
                  height: size,
                  borderRadius: "50%",
                  border: `1.5px solid rgba(220,38,38,${i === 0 ? 0.3 : 0.15})`,
                  transform: "translate(-50%, -50%)",
                  "@keyframes pulseRing": {
                    "0%": {
                      transform: "translate(-50%,-50%) scale(0.8)",
                      opacity: 0,
                    },
                    "40%": { opacity: 1 },
                    "100%": {
                      transform: "translate(-50%,-50%) scale(1.4)",
                      opacity: 0,
                    },
                  },
                  animation: `pulseRing 2.2s ease-out ${i * 0.4}s infinite`,
                }}
              />
            ))}
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "linear-gradient(145deg, #3d1111, #1f0a0a)",
                border: "1.5px solid rgba(220,38,38,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow:
                  "0 0 24px rgba(220,38,38,0.25), inset 0 1px 0 rgba(255,255,255,0.06)",
                position: "relative",
                zIndex: 2,
              }}
            >
              <ShieldX
                size={28}
                color="#ef4444"
                style={{ filter: "drop-shadow(0 0 8px rgba(239,68,68,0.6))" }}
              />
            </Box>
          </Box>

          <Chip
            size="sm"
            sx={{
              mb: 1.5,
              zIndex: 1,
              bgcolor: "rgba(220,38,38,0.15)",
              border: "1px solid rgba(220,38,38,0.3)",
              color: "#f87171",
              fontWeight: 600,
              letterSpacing: "1.2px",
              fontSize: "10px",
              textTransform: "uppercase",
            }}
          >
            Error 403
          </Chip>

          <DialogTitle
            sx={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              fontSize: "22px",
              color: "#fff",
              letterSpacing: "-0.3px",
              p: 0,
              zIndex: 1,
            }}
          >
            Access Denied
          </DialogTitle>
        </Box>

        {/* Body */}
        <DialogContent
          sx={{
            px: 4.5,
            py: 3.5,
            textAlign: "center",
            bgcolor: "transparent",
          }}
        >
          <Typography
            sx={{
              color: "#9a9aaa",
              fontSize: "14.5px",
              lineHeight: 1.65,
              fontWeight: 300,
            }}
          >
            You don't have permission to access the{" "}
            <Box
              component="span"
              sx={{
                display: "inline-block",
                bgcolor: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#e0e0e0",
                fontWeight: 500,
                px: 0.9,
                borderRadius: "6px",
                fontSize: "13.5px",
              }}
            >
              {location}
            </Box>{" "}
            page. Contact your administrator if you think this is a mistake.
          </Typography>
        </DialogContent>

        <Divider sx={{ borderColor: "rgba(255,255,255,0.06)", mx: 4.5 }} />

        {/* Actions */}
        <DialogActions
          sx={{
            flexDirection: "column",
            gap: 1.5,
            px: 4.5,
            pt: 2.5,
            pb: 3.5,
          }}
        >
          <Button
            fullWidth
            size="lg"
            onClick={() => navigate("/dashboard")}
            startDecorator={
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            }
            sx={{
              background: "linear-gradient(135deg, #dc2626, #b91c1c)",
              color: "#fff",
              border: "none",
              borderRadius: "12px",
              fontWeight: 500,
              fontSize: "14px",
              boxShadow: "0 4px 16px rgba(220,38,38,0.3)",
              "&:hover": {
                background: "linear-gradient(135deg, #ef4444, #dc2626)",
                boxShadow: "0 6px 20px rgba(220,38,38,0.45)",
                transform: "translateY(-1px)",
              },
            }}
          >
            Return to Dashboard
          </Button>

          <Button
            fullWidth
            variant="plain"
            onClick={onClose}
            sx={{
              color: "#666",
              borderRadius: "12px",
              border: "1px solid rgba(255,255,255,0.07)",
              fontSize: "13.5px",
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.04)",
                color: "#999",
              },
            }}
          >
            Contact Administrator
          </Button>
        </DialogActions>

        <Typography
          sx={{
            textAlign: "center",
            fontSize: "10px",
            color: "#2e2e3a",
            letterSpacing: "0.8px",
            pb: 1.5,
            fontWeight: 500,
          }}
        >
          ERR · AUTHORIZATION_FAILED · 403
        </Typography>
      </ModalDialog>
    </Modal>
  );
};

export default AccessDenied;
