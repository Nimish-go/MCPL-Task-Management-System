import {
  Check,
  Edit,
  KeyboardArrowRight,
  PowerSettingsNew,
  PersonOutline,
  LockOutlined,
  VerifiedUser,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Chip,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalClose,
  ModalDialog,
  Typography,
  Divider,
  IconButton,
} from "@mui/joy";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import Toast from "./Toast";
import LogoutConfirm from "./LogoutConfirm";

const NAV_ITEMS = [
  {
    id: "profile",
    label: "Profile Settings",
    icon: <PersonOutline sx={{ fontSize: 18 }} />,
  },
  {
    id: "password",
    label: "Password & Security",
    icon: <LockOutlined sx={{ fontSize: 18 }} />,
  },
];

const SettingsModal = ({ open, onClose }) => {
  const [activeTab, setActiveTab] = useState("profile");
  const [userId, setUserId] = useState("");
  const [userMobile, setUserMobile] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [editState, setEditState] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordChangeState, setPasswordChangeState] = useState(false);
  const [toastStatus, setToastStatus] = useState("");
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [logoutConfirm, setLogoutConfirm] = useState(false);

  useEffect(() => {
    axios.defaults.baseURL = "https://mcpl-task-management-system.vercel.app/";
    if (!open) return;
    setLoading(true);
    axios
      .get(`/getProfile/${sessionStorage.getItem("empName")}`)
      .then((res) => {
        if (res.status === 200) {
          const data = res.data;
          setUsername(data.username);
          setUserId(data.id);
          setEmail(data.email);
          setUserMobile(data.mobile);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [open]);

  const getInitials = (name) => {
    if (!name) return "?";
    const words = name.trim().split(" ");
    return words.length === 1
      ? words[0][0].toUpperCase()
      : (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  const updateProfile = () => {
    setUpdateLoading(true);
    const formData = new FormData();
    formData.append("username", username);
    formData.append("email", email);
    formData.append("mobile", userMobile);
    axios
      .put(`/updateProfile/${userId}`, formData)
      .then((res) => {
        if (res.status === 200) {
          setToastStatus("success");
          setToastMessage("Profile updated successfully.");
          setToastOpen(true);
          setEditState(false);
        }
      })
      .catch((err) => {
        setToastStatus("error");
        setToastMessage("Something went wrong. Please try again.");
        setToastOpen(true);
        console.error(err);
      })
      .finally(() => setUpdateLoading(false));
  };

  const empName = sessionStorage.getItem("empName") || "User";
  const designation = sessionStorage.getItem("designation") || "";
  const role = sessionStorage.getItem("role") || "";

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <ModalDialog
          sx={{
            p: 0,
            borderRadius: "20px",
            width: "880px",
            maxWidth: "95vw",
            height: "540px",
            overflow: "hidden",
            bgcolor: "#0f1117",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "0 40px 100px rgba(0,0,0,0.7)",
            "@keyframes modalIn": {
              from: { opacity: 0, transform: "scale(0.96) translateY(16px)" },
              to: { opacity: 1, transform: "scale(1) translateY(0)" },
            },
            animation: "modalIn 0.3s cubic-bezier(0.34,1.56,0.64,1)",
          }}
        >
          <Box sx={{ display: "flex", height: "100%" }}>
            {/* ── Sidebar ── */}
            <Box
              sx={{
                width: 260,
                flexShrink: 0,
                bgcolor: "#13151c",
                borderRight: "1px solid rgba(255,255,255,0.06)",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              {/* Cover + Avatar */}
              <Box sx={{ position: "relative", mb: 5 }}>
                <Box
                  sx={{
                    height: 90,
                    background:
                      "linear-gradient(135deg, #0d3b5e 0%, #023047 50%, #051923 100%)",
                    position: "relative",
                    overflow: "hidden",
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      inset: 0,
                      background:
                        "radial-gradient(ellipse at 60% 50%, rgba(2,143,188,0.25) 0%, transparent 70%)",
                    },
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    bottom: -28,
                    left: 20,
                    p: "3px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #028FB9, #0d3b5e)",
                    boxShadow: "0 4px 20px rgba(2,143,188,0.4)",
                  }}
                >
                  <Avatar
                    sx={{
                      width: 52,
                      height: 52,
                      bgcolor: "#023047",
                      color: "#7dd3fc",
                      fontFamily: "'Syne', sans-serif",
                      fontWeight: 700,
                      fontSize: 18,
                      border: "2px solid #13151c",
                    }}
                  >
                    {getInitials(empName)}
                  </Avatar>
                </Box>
              </Box>

              {/* User Info */}
              <Box sx={{ px: 2.5, mb: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 0.5,
                  }}
                >
                  <Box
                    sx={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      bgcolor: "#22c55e",
                      boxShadow: "0 0 6px #22c55e",
                      flexShrink: 0,
                      "@keyframes onlinePulse": {
                        "0%, 100%": { boxShadow: "0 0 4px #22c55e" },
                        "50%": {
                          boxShadow:
                            "0 0 10px #22c55e, 0 0 20px rgba(34,197,94,0.4)",
                        },
                      },
                      animation: "onlinePulse 2s ease-in-out infinite",
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: 11,
                      color: "#22c55e",
                      fontWeight: 600,
                      letterSpacing: "0.8px",
                    }}
                  >
                    ONLINE
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    fontFamily: "'Syne', sans-serif",
                    fontWeight: 700,
                    fontSize: 15,
                    color: "#f0f0f5",
                    lineHeight: 1.3,
                  }}
                >
                  {empName}
                </Typography>
                {designation && (
                  <Typography sx={{ fontSize: 12, color: "#5a6070", mt: 0.3 }}>
                    {designation}
                  </Typography>
                )}
                {role && (
                  <Chip
                    size="sm"
                    sx={{
                      mt: 1,
                      bgcolor: "rgba(2,143,188,0.12)",
                      border: "1px solid rgba(2,143,188,0.25)",
                      color: "#7dd3fc",
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: "0.6px",
                    }}
                  >
                    {role.toUpperCase()}
                  </Chip>
                )}
              </Box>

              <Divider
                sx={{ borderColor: "rgba(255,255,255,0.05)", mx: 2.5, mb: 2 }}
              />

              {/* Nav */}
              <Box sx={{ px: 1.5, flex: 1 }}>
                {NAV_ITEMS.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <Box
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        px: 2,
                        py: 1.3,
                        mb: 0.5,
                        borderRadius: "10px",
                        cursor: "pointer",
                        transition: "all 0.18s ease",
                        bgcolor: isActive
                          ? "rgba(2,143,188,0.12)"
                          : "transparent",
                        border: isActive
                          ? "1px solid rgba(2,143,188,0.2)"
                          : "1px solid transparent",
                        color: isActive ? "#7dd3fc" : "#5a6070",
                        "&:hover": {
                          bgcolor: isActive
                            ? "rgba(2,143,188,0.15)"
                            : "rgba(255,255,255,0.04)",
                          color: isActive ? "#7dd3fc" : "#9aa3b0",
                        },
                      }}
                    >
                      {item.icon}
                      <Typography
                        sx={{
                          fontSize: 13,
                          fontWeight: isActive ? 600 : 400,
                          color: "inherit",
                          flex: 1,
                        }}
                      >
                        {item.label}
                      </Typography>
                      {isActive && (
                        <Box
                          sx={{
                            width: 5,
                            height: 5,
                            borderRadius: "50%",
                            bgcolor: "#028FB9",
                          }}
                        />
                      )}
                    </Box>
                  );
                })}
              </Box>

              {/* Logout */}
              <Box sx={{ p: 2 }}>
                <Button
                  fullWidth
                  size="sm"
                  startDecorator={<PowerSettingsNew sx={{ fontSize: 16 }} />}
                  onClick={() => setLogoutConfirm(true)}
                  sx={{
                    bgcolor: "rgba(239,68,68,0.08)",
                    color: "#f87171",
                    border: "1px solid rgba(239,68,68,0.15)",
                    borderRadius: "10px",
                    fontWeight: 500,
                    fontSize: 13,
                    "&:hover": {
                      bgcolor: "rgba(239,68,68,0.14)",
                      borderColor: "rgba(239,68,68,0.3)",
                    },
                  }}
                >
                  Sign Out
                </Button>
              </Box>
            </Box>

            {/* ── Content ── */}
            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                position: "relative",
                bgcolor: "#0f1117",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: -60,
                  right: -60,
                  width: 200,
                  height: 200,
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle, rgba(2,143,188,0.06) 0%, transparent 70%)",
                  pointerEvents: "none",
                },
              }}
            >
              <ModalClose
                sx={{
                  top: 14,
                  right: 14,
                  borderRadius: "50%",
                  bgcolor: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#5a6070",
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.1)",
                    color: "#fff",
                  },
                }}
              />

              {/* Header */}
              <Box
                sx={{
                  px: 4,
                  pt: 3.5,
                  pb: 2.5,
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "'Syne', sans-serif",
                    fontWeight: 800,
                    fontSize: 19,
                    color: "#f0f0f5",
                    letterSpacing: "-0.3px",
                  }}
                >
                  {activeTab === "profile"
                    ? "Profile Settings"
                    : "Password & Security"}
                </Typography>
                <Typography sx={{ fontSize: 13, color: "#4a5260", mt: 0.3 }}>
                  {activeTab === "profile"
                    ? "Manage your personal information"
                    : "Update your password and verify changes via OTP"}
                </Typography>
              </Box>

              {/* Body */}
              <Box sx={{ flex: 1, overflowY: "auto", px: 4, py: 3 }}>
                {loading && (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%",
                      gap: 1,
                    }}
                  >
                    <DotLottieReact
                      src="https://lottie.host/876ba248-54ac-48d0-a9dc-67747bd5b80a/0QJm3EJB8I.lottie"
                      loop
                      autoplay
                      style={{ width: 100, height: 100 }}
                    />
                    <Typography sx={{ fontSize: 13, color: "#4a5260" }}>
                      Loading profile…
                    </Typography>
                  </Box>
                )}

                {/* Profile Tab */}
                {activeTab === "profile" && !loading && (
                  <>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 2.5,
                      }}
                    >
                      {[
                        {
                          label: "User ID",
                          value: userId,
                          setter: null,
                          disabled: true,
                        },
                        {
                          label: "Username",
                          value: username,
                          setter: setUsername,
                          disabled: !editState || updateLoading,
                        },
                        {
                          label: "Email Address",
                          value: email,
                          setter: setEmail,
                          disabled: !editState || updateLoading,
                        },
                        {
                          label: "Mobile Number",
                          value: userMobile,
                          setter: setUserMobile,
                          disabled: !editState || updateLoading,
                        },
                      ].map((field) => (
                        <FormControl key={field.label}>
                          <FormLabel
                            sx={{
                              fontSize: 11,
                              fontWeight: 600,
                              letterSpacing: "0.7px",
                              color: "#4a5260",
                              textTransform: "uppercase",
                              mb: 0.8,
                            }}
                          >
                            {field.label}
                          </FormLabel>
                          <Input
                            value={field.value}
                            onChange={
                              field.setter
                                ? (e) => field.setter(e.target.value)
                                : undefined
                            }
                            disabled={field.disabled}
                            sx={{
                              bgcolor: field.disabled
                                ? "rgba(255,255,255,0.02)"
                                : "rgba(2,143,188,0.06)",
                              border: "1px solid",
                              borderColor: field.disabled
                                ? "rgba(255,255,255,0.06)"
                                : "rgba(2,143,188,0.25)",
                              borderRadius: "10px",
                              color: field.disabled ? "#4a5260" : "#e0e8f0",
                              fontSize: 13.5,
                              "&:focus-within": {
                                borderColor: "#028FB9",
                                boxShadow: "0 0 0 3px rgba(2,143,188,0.15)",
                              },
                            }}
                          />
                        </FormControl>
                      ))}
                    </Box>

                    <Box
                      sx={{
                        mt: 3,
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                      }}
                    >
                      {editState ? (
                        <>
                          <Button
                            startDecorator={<Check sx={{ fontSize: 16 }} />}
                            onClick={updateProfile}
                            loading={updateLoading}
                            size="sm"
                            sx={{
                              background:
                                "linear-gradient(135deg, #059669, #047857)",
                              color: "#fff",
                              borderRadius: "9px",
                              fontWeight: 600,
                              fontSize: 13,
                              px: 2.5,
                              border: "none",
                              boxShadow: "0 4px 12px rgba(5,150,105,0.3)",
                              "&:hover": {
                                background:
                                  "linear-gradient(135deg, #10b981, #059669)",
                              },
                            }}
                          >
                            Save Changes
                          </Button>
                          <Button
                            variant="plain"
                            size="sm"
                            onClick={() => setEditState(false)}
                            sx={{
                              color: "#4a5260",
                              fontSize: 13,
                              "&:hover": { color: "#9aa3b0" },
                            }}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            startDecorator={<Edit sx={{ fontSize: 15 }} />}
                            onClick={() => setEditState(true)}
                            size="sm"
                            sx={{
                              bgcolor: "rgba(2,143,188,0.1)",
                              color: "#7dd3fc",
                              border: "1px solid rgba(2,143,188,0.2)",
                              borderRadius: "9px",
                              fontWeight: 600,
                              fontSize: 13,
                              px: 2.5,
                              "&:hover": {
                                bgcolor: "rgba(2,143,188,0.18)",
                                borderColor: "rgba(2,143,188,0.35)",
                              },
                            }}
                          >
                            Edit Profile
                          </Button>
                          <Typography sx={{ fontSize: 12, color: "#3a4050" }}>
                            Click edit to modify your details
                          </Typography>
                        </>
                      )}
                    </Box>
                  </>
                )}

                {/* Password Tab */}
                {activeTab === "password" && !loading && (
                  <Box sx={{ maxWidth: 380 }}>
                    {[
                      { label: "New Password", disabled: false },
                      { label: "Confirm New Password", disabled: false },
                    ].map((field) => (
                      <FormControl key={field.label} sx={{ mb: 2 }}>
                        <FormLabel
                          sx={{
                            fontSize: 11,
                            fontWeight: 600,
                            letterSpacing: "0.7px",
                            color: "#4a5260",
                            textTransform: "uppercase",
                            mb: 0.8,
                          }}
                        >
                          {field.label}
                        </FormLabel>
                        <Input
                          type="password"
                          sx={{
                            bgcolor: "rgba(2,143,188,0.05)",
                            border: "1px solid rgba(2,143,188,0.2)",
                            borderRadius: "10px",
                            color: "#e0e8f0",
                            fontSize: 13.5,
                            "&:focus-within": {
                              borderColor: "#028FB9",
                              boxShadow: "0 0 0 3px rgba(2,143,188,0.15)",
                            },
                          }}
                        />
                      </FormControl>
                    ))}

                    <Button
                      size="sm"
                      sx={{
                        mb: 3,
                        background: "linear-gradient(135deg, #028FB9, #0369a1)",
                        color: "#fff",
                        borderRadius: "9px",
                        fontWeight: 600,
                        fontSize: 13,
                        px: 2.5,
                        border: "none",
                        boxShadow: "0 4px 12px rgba(2,143,188,0.3)",
                        "&:hover": {
                          background:
                            "linear-gradient(135deg, #0ea5e9, #028FB9)",
                        },
                      }}
                    >
                      Send OTP to Email
                    </Button>

                    <Divider
                      sx={{ borderColor: "rgba(255,255,255,0.05)", mb: 3 }}
                    />

                    <FormControl disabled={!passwordChangeState} sx={{ mb: 2 }}>
                      <FormLabel
                        sx={{
                          fontSize: 11,
                          fontWeight: 600,
                          letterSpacing: "0.7px",
                          color: passwordChangeState ? "#4a5260" : "#2e3440",
                          textTransform: "uppercase",
                          mb: 0.8,
                        }}
                      >
                        OTP Verification
                      </FormLabel>
                      <Input
                        type="password"
                        placeholder="Enter OTP sent to your email"
                        sx={{
                          bgcolor: passwordChangeState
                            ? "rgba(2,143,188,0.05)"
                            : "rgba(255,255,255,0.02)",
                          border: "1px solid",
                          borderColor: passwordChangeState
                            ? "rgba(2,143,188,0.2)"
                            : "rgba(255,255,255,0.05)",
                          borderRadius: "10px",
                          color: "#e0e8f0",
                          fontSize: 13.5,
                        }}
                      />
                    </FormControl>

                    <Button
                      disabled={!passwordChangeState}
                      size="sm"
                      startDecorator={<VerifiedUser sx={{ fontSize: 15 }} />}
                      sx={{
                        background: passwordChangeState
                          ? "linear-gradient(135deg, #059669, #047857)"
                          : "rgba(255,255,255,0.04)",
                        color: passwordChangeState ? "#fff" : "#3a4050",
                        border: "none",
                        borderRadius: "9px",
                        fontWeight: 600,
                        fontSize: 13,
                        px: 2.5,
                        boxShadow: passwordChangeState
                          ? "0 4px 12px rgba(5,150,105,0.3)"
                          : "none",
                      }}
                    >
                      Verify & Update Password
                    </Button>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </ModalDialog>
      </Modal>

      <Toast open={toastOpen} message={toastMessage} status={toastStatus} />
      <LogoutConfirm
        open={logoutConfirm}
        onClose={() => setLogoutConfirm(false)}
      />
    </>
  );
};

export default SettingsModal;
