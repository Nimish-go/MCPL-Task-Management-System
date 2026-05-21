import {
  Check,
  Edit,
  PowerSettingsNew,
  PersonOutline,
  LockOutlined,
  VerifiedUser,
  Close,
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
} from "@mui/joy";
import { useMediaQuery } from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import Toast from "./Toast";
import LogoutConfirm from "./LogoutConfirm";

const NAV_ITEMS = [
  { id: "profile",  label: "Profile Settings",     icon: <PersonOutline sx={{ fontSize: 18 }} /> },
  { id: "password", label: "Password & Security",  icon: <LockOutlined  sx={{ fontSize: 18 }} /> },
];

// ─── Shared input style ───────────────────────────────────────────────────────
const inputSx = (editable) => ({
  bgcolor: editable ? "rgba(2,143,188,0.06)" : "rgba(255,255,255,0.02)",
  border: "1px solid",
  borderColor: editable ? "rgba(2,143,188,0.25)" : "rgba(255,255,255,0.06)",
  borderRadius: "10px",
  color: editable ? "#e0e8f0" : "#4a5260",
  fontSize: "0.85rem",
  "&:focus-within": {
    borderColor: "#028FB9",
    boxShadow: "0 0 0 3px rgba(2,143,188,0.15)",
  },
});

const labelSx = {
  fontSize: "0.68rem",
  fontWeight: 600,
  letterSpacing: "0.7px",
  color: "#4a5260",
  textTransform: "uppercase",
  mb: 0.8,
};

const SettingsModal = ({ open, onClose }) => {
  const [activeTab, setActiveTab]               = useState("profile");
  const [userId, setUserId]                     = useState("");
  const [userMobile, setUserMobile]             = useState("");
  const [username, setUsername]                 = useState("");
  const [email, setEmail]                       = useState("");
  const [editState, setEditState]               = useState(false);
  const [updateLoading, setUpdateLoading]       = useState(false);
  const [loading, setLoading]                   = useState(false);
  const [passwordChangeState, setPasswordChangeState] = useState(false);
  const [toastStatus, setToastStatus]           = useState("");
  const [toastOpen, setToastOpen]               = useState(false);
  const [toastMessage, setToastMessage]         = useState("");
  const [logoutConfirm, setLogoutConfirm]       = useState(false);
  const [newPassword, setNewPassword]           = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [otp, setOtp]                           = useState("");
  const [enteredOtp, setEnteredOtp]             = useState("");
  const [otpVerifying, setOtpVerifying]         = useState(false);

  const isMobile = useMediaQuery("(max-width:640px)");
  const isTablet = useMediaQuery("(max-width:860px)");

  useEffect(() => {
    axios.defaults.baseURL = "https://mcpl-task-management-system.vercel.app";
    if (!open) return;
    setLoading(true);
    axios.get(`/getProfile/${sessionStorage.getItem("empName")}`)
      .then((res) => {
        if (res.status === 200) {
          const d = res.data;
          setUsername(d.username);
          setUserId(d.id);
          setEmail(d.email);
          setUserMobile(d.mobile);
          setOtp(d.otp);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [open]);

  const getInitials = (name) => {
    if (!name) return "?";
    const w = name.trim().split(" ");
    return w.length === 1 ? w[0][0].toUpperCase() : (w[0][0] + w[w.length - 1][0]).toUpperCase();
  };

  const empName    = sessionStorage.getItem("empName")    || "User";
  const designation = sessionStorage.getItem("designation") || "";
  const role        = sessionStorage.getItem("role")        || "";

  const updateProfile = () => {
    setUpdateLoading(true);
    const fd = new FormData();
    fd.append("username", username);
    fd.append("email", email);
    fd.append("mobile", userMobile);
    axios.put(`/updateProfile/${userId}`, fd)
      .then((res) => {
        if (res.status === 200) {
          setToastStatus("success");
          setToastMessage("Profile updated successfully.");
          setToastOpen(true);
          setEditState(false);
        }
      })
      .catch(() => {
        setToastStatus("error");
        setToastMessage("Something went wrong. Please try again.");
        setToastOpen(true);
      })
      .finally(() => setUpdateLoading(false));
  };

  const sendOTP = async () => {
    const fd = new FormData();
    fd.append("email", sessionStorage.getItem("email").toString());
    if (newPassword === confirmNewPassword) {
      await axios.post("/sendEmail", fd)
        .then((res) => {
          if (res.status === 200) {
            setToastMessage(res.data.message);
            setToastStatus(res.data.status);
            setToastOpen(true);
            setPasswordChangeState(true);
            setOtp(res.data.otp);
          }
        })
        .catch((err) => {
          setToastMessage("Something Went Wrong. Please Check the Console.");
          setToastStatus("error");
          setToastOpen(true);
          console.error(err);
        });
    }
  };

  const verifyOTP = async () => {
    setOtpVerifying(true);
    if (enteredOtp === otp) {
      setToastMessage("OTP Entered is Correct.");
      setToastStatus("success");
      setToastOpen(true);
      const fd = new FormData();
      fd.append("email", sessionStorage.getItem("email").toString());
      fd.append("newPass", newPassword);
      await axios.post("/updatePass", fd)
        .then((res) => {
          if (res.status === 200) {
            setToastMessage(res.data.message);
            setToastStatus(res.data.status);
            setToastOpen(true);
          }
        })
        .catch((err) => {
          setToastMessage("Something Went Wrong. Please Check the Console.");
          setToastStatus("error");
          setToastOpen(true);
          console.error(err);
        })
        .finally(() => setOtpVerifying(false));
    } else {
      setToastMessage("Entered OTP is incorrect. Please check your email.");
      setToastStatus("warning");
      setToastOpen(true);
      setOtpVerifying(false);
    }
  };

  // ─── Sidebar panel ──────────────────────────────────────────────────────────
  const SidebarPanel = () => (
    <Box
      sx={{
        // Desktop: fixed-width left column. Mobile/tablet: full-width top strip.
        width: isTablet ? "100%" : 240,
        flexShrink: 0,
        bgcolor: "#13151c",
        borderRight: isTablet ? "none" : "1px solid rgba(255,255,255,0.06)",
        borderBottom: isTablet ? "1px solid rgba(255,255,255,0.06)" : "none",
        display: "flex",
        flexDirection: isTablet ? "row" : "column",
        overflow: "hidden",
      }}
    >
      {/* Avatar + user info — hidden on mobile to save space */}
      {!isTablet && (
        <>
          <Box sx={{ position: "relative", mb: 5 }}>
            <Box
              sx={{
                height: 80,
                background: "linear-gradient(135deg, #0d3b5e 0%, #023047 50%, #051923 100%)",
                position: "relative",
                overflow: "hidden",
                "&::after": {
                  content: '""', position: "absolute", inset: 0,
                  background: "radial-gradient(ellipse at 60% 50%, rgba(2,143,188,0.25) 0%, transparent 70%)",
                },
              }}
            />
            <Box
              sx={{
                position: "absolute", bottom: -26, left: 18,
                p: "3px", borderRadius: "50%",
                background: "linear-gradient(135deg, #028FB9, #0d3b5e)",
                boxShadow: "0 4px 16px rgba(2,143,188,0.4)",
              }}
            >
              <Avatar
                sx={{
                  width: 48, height: 48, bgcolor: "#023047", color: "#7dd3fc",
                  fontWeight: 700, fontSize: 16, border: "2px solid #13151c",
                }}
              >
                {getInitials(empName)}
              </Avatar>
            </Box>
          </Box>

          <Box sx={{ px: 2.5, mb: 2.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
              <Box
                sx={{
                  width: 7, height: 7, borderRadius: "50%", bgcolor: "#22c55e",
                  "@keyframes onlinePulse": {
                    "0%,100%": { boxShadow: "0 0 4px #22c55e" },
                    "50%":     { boxShadow: "0 0 10px #22c55e, 0 0 20px rgba(34,197,94,0.4)" },
                  },
                  animation: "onlinePulse 2s ease-in-out infinite",
                }}
              />
              <Typography sx={{ fontSize: "0.68rem", color: "#22c55e", fontWeight: 600, letterSpacing: "0.8px" }}>ONLINE</Typography>
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: "#f0f0f5", lineHeight: 1.3 }}>{empName}</Typography>
            {designation && <Typography sx={{ fontSize: "0.72rem", color: "#5a6070", mt: 0.3 }}>{designation}</Typography>}
            {role && (
              <Chip size="sm" sx={{ mt: 1, bgcolor: "rgba(2,143,188,0.12)", border: "1px solid rgba(2,143,188,0.25)", color: "#7dd3fc", fontSize: "0.62rem", fontWeight: 600, letterSpacing: "0.6px" }}>
                {role.toUpperCase()}
              </Chip>
            )}
          </Box>

          <Divider sx={{ borderColor: "rgba(255,255,255,0.05)", mx: 2.5, mb: 1.5 }} />
        </>
      )}

      {/* Tab navigation */}
      <Box
        sx={{
          px: 1.5,
          flex: 1,
          display: "flex",
          flexDirection: isTablet ? "row" : "column",
          alignItems: isTablet ? "center" : "stretch",
          gap: isTablet ? 1 : 0,
          py: isTablet ? 1 : 0,
          overflowX: isTablet ? "auto" : "unset",
          "&::-webkit-scrollbar": { height: 0 },
        }}
      >
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <Box
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.2,
                px: isTablet ? 2 : 1.8,
                py: isTablet ? 0.9 : 1.2,
                mb: isTablet ? 0 : 0.5,
                borderRadius: "10px",
                cursor: "pointer",
                transition: "all 0.18s ease",
                bgcolor: isActive ? "rgba(2,143,188,0.12)" : "transparent",
                border: isActive ? "1px solid rgba(2,143,188,0.2)" : "1px solid transparent",
                color: isActive ? "#7dd3fc" : "#5a6070",
                whiteSpace: "nowrap",
                flexShrink: 0,
                "&:hover": { bgcolor: isActive ? "rgba(2,143,188,0.15)" : "rgba(255,255,255,0.04)", color: isActive ? "#7dd3fc" : "#9aa3b0" },
              }}
            >
              {item.icon}
              <Typography sx={{ fontSize: "0.8rem", fontWeight: isActive ? 600 : 400, color: "inherit" }}>
                {item.label}
              </Typography>
              {isActive && !isTablet && (
                <Box sx={{ ml: "auto", width: 5, height: 5, borderRadius: "50%", bgcolor: "#028FB9" }} />
              )}
            </Box>
          );
        })}
      </Box>

      {/* Sign out — inline on tablet, bottom on desktop */}
      <Box sx={{ p: isTablet ? 1 : 2, display: "flex", alignItems: "center" }}>
        <Button
          fullWidth={!isTablet}
          size="sm"
          startDecorator={<PowerSettingsNew sx={{ fontSize: 15 }} />}
          onClick={() => setLogoutConfirm(true)}
          sx={{
            bgcolor: "rgba(239,68,68,0.08)", color: "#f87171",
            border: "1px solid rgba(239,68,68,0.15)", borderRadius: "10px",
            fontWeight: 500, fontSize: "0.8rem",
            whiteSpace: "nowrap",
            "&:hover": { bgcolor: "rgba(239,68,68,0.14)", borderColor: "rgba(239,68,68,0.3)" },
          }}
        >
          {isTablet ? "Sign Out" : "Sign Out"}
        </Button>
      </Box>
    </Box>
  );

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <ModalDialog
          sx={{
            p: 0,
            borderRadius: { xs: "16px", sm: "20px" },
            width: { xs: "96vw", sm: "92vw", md: "860px" },
            maxWidth: "860px",
            // Use dvh for iPad compatibility
            maxHeight: { xs: "92dvh", sm: "88dvh", md: "560px" },
            overflow: "hidden",
            bgcolor: "#0f1117",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "0 40px 100px rgba(0,0,0,0.7)",
            "@keyframes modalIn": {
              from: { opacity: 0, transform: "scale(0.96) translateY(16px)" },
              to:   { opacity: 1, transform: "scale(1) translateY(0)" },
            },
            animation: "modalIn 0.3s cubic-bezier(0.34,1.56,0.64,1)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Layout: column on tablet/mobile, row on desktop */}
          <Box
            sx={{
              display: "flex",
              flexDirection: isTablet ? "column" : "row",
              height: "100%",
              overflow: "hidden",
            }}
          >
            <SidebarPanel />

            {/* ── Content panel ── */}
            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                position: "relative",
                bgcolor: "#0f1117",
                overflow: "hidden",
                minHeight: 0,
                "&::before": {
                  content: '""', position: "absolute", top: -60, right: -60,
                  width: 200, height: 200, borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(2,143,188,0.06) 0%, transparent 70%)",
                  pointerEvents: "none",
                },
              }}
            >
              <ModalClose
                sx={{
                  top: 12, right: 12, borderRadius: "50%",
                  bgcolor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                  color: "#5a6070",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.1)", color: "#fff" },
                }}
              />

              {/* Content header */}
              <Box
                sx={{
                  px: { xs: 2.5, md: 4 },
                  pt: { xs: 2.5, md: 3 },
                  pb: 2,
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                  flexShrink: 0,
                }}
              >
                <Typography sx={{ fontWeight: 800, fontSize: { xs: "1rem", md: "1.1rem" }, color: "#f0f0f5", letterSpacing: "-0.3px" }}>
                  {activeTab === "profile" ? "Profile Settings" : "Password & Security"}
                </Typography>
                <Typography sx={{ fontSize: "0.78rem", color: "#4a5260", mt: 0.3 }}>
                  {activeTab === "profile"
                    ? "Manage your personal information"
                    : "Update your password and verify changes via OTP"}
                </Typography>
              </Box>

              {/* Scrollable body */}
              <Box
                sx={{
                  flex: 1, overflowY: "auto", minHeight: 0,
                  px: { xs: 2.5, md: 4 }, py: { xs: 2, md: 3 },
                  "&::-webkit-scrollbar": { width: 4 },
                  "&::-webkit-scrollbar-thumb": { borderRadius: 4, backgroundColor: "#2a2f3d" },
                }}
              >
                {/* Loading */}
                {loading && (
                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 1 }}>
                    <DotLottieReact
                      src="https://lottie.host/876ba248-54ac-48d0-a9dc-67747bd5b80a/0QJm3EJB8I.lottie"
                      loop autoplay style={{ width: 90, height: 90 }}
                    />
                    <Typography sx={{ fontSize: "0.78rem", color: "#4a5260" }}>Loading profile…</Typography>
                  </Box>
                )}

                {/* Profile tab */}
                {activeTab === "profile" && !loading && (
                  <>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                        gap: 2,
                      }}
                    >
                      {[
                        { label: "User ID",        value: userId,      setter: null,          disabled: true },
                        { label: "Username",        value: username,    setter: setUsername,   disabled: !editState || updateLoading },
                        { label: "Email Address",   value: email,       setter: setEmail,      disabled: !editState || updateLoading },
                        { label: "Mobile Number",   value: userMobile,  setter: setUserMobile, disabled: !editState || updateLoading },
                      ].map((field) => (
                        <FormControl key={field.label}>
                          <FormLabel sx={labelSx}>{field.label}</FormLabel>
                          <Input
                            value={field.value}
                            onChange={field.setter ? (e) => field.setter(e.target.value) : undefined}
                            disabled={field.disabled}
                            sx={inputSx(!field.disabled)}
                          />
                        </FormControl>
                      ))}
                    </Box>

                    <Box sx={{ mt: 3, display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                      {editState ? (
                        <>
                          <Button
                            startDecorator={<Check sx={{ fontSize: 16 }} />}
                            onClick={updateProfile}
                            loading={updateLoading}
                            size="sm"
                            sx={{
                              background: "linear-gradient(135deg, #059669, #047857)",
                              color: "#fff", borderRadius: "9px", fontWeight: 600,
                              fontSize: "0.82rem", px: 2.5, border: "none",
                              boxShadow: "0 4px 12px rgba(5,150,105,0.3)",
                              "&:hover": { background: "linear-gradient(135deg, #10b981, #059669)" },
                            }}
                          >
                            Save Changes
                          </Button>
                          <Button
                            variant="plain" size="sm"
                            onClick={() => setEditState(false)}
                            sx={{ color: "#4a5260", fontSize: "0.82rem", "&:hover": { color: "#9aa3b0" } }}
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
                              bgcolor: "rgba(2,143,188,0.1)", color: "#7dd3fc",
                              border: "1px solid rgba(2,143,188,0.2)", borderRadius: "9px",
                              fontWeight: 600, fontSize: "0.82rem", px: 2.5,
                              "&:hover": { bgcolor: "rgba(2,143,188,0.18)", borderColor: "rgba(2,143,188,0.35)" },
                            }}
                          >
                            Edit Profile
                          </Button>
                          <Typography sx={{ fontSize: "0.72rem", color: "#3a4050" }}>
                            Click edit to modify your details
                          </Typography>
                        </>
                      )}
                    </Box>
                  </>
                )}

                {/* Password tab */}
                {activeTab === "password" && !loading && (
                  <Box sx={{ maxWidth: 380 }}>
                    {[
                      { label: "New Password",          value: newPassword,          onChange: (e) => setNewPassword(e.target.value) },
                      { label: "Confirm New Password",  value: confirmNewPassword,   onChange: (e) => setConfirmNewPassword(e.target.value) },
                    ].map((field) => (
                      <FormControl key={field.label} sx={{ mb: 2 }}>
                        <FormLabel sx={labelSx}>{field.label}</FormLabel>
                        <Input type="password" sx={inputSx(true)} value={field.value} onChange={field.onChange} />
                      </FormControl>
                    ))}

                    <Button
                      size="sm"
                      onClick={sendOTP}
                      sx={{
                        mb: 3,
                        background: "linear-gradient(135deg, #028FB9, #0369a1)",
                        color: "#fff", borderRadius: "9px", fontWeight: 600,
                        fontSize: "0.82rem", px: 2.5, border: "none",
                        boxShadow: "0 4px 12px rgba(2,143,188,0.3)",
                        "&:hover": { background: "linear-gradient(135deg, #0ea5e9, #028FB9)" },
                      }}
                    >
                      Send OTP to Email
                    </Button>

                    <Divider sx={{ borderColor: "rgba(255,255,255,0.05)", mb: 3 }} />

                    <FormControl disabled={!passwordChangeState} sx={{ mb: 2 }}>
                      <FormLabel sx={{ ...labelSx, color: passwordChangeState ? "#4a5260" : "#2e3440" }}>
                        OTP Verification
                      </FormLabel>
                      <Input
                        type="text"
                        placeholder="Enter OTP sent to your email"
                        sx={inputSx(passwordChangeState)}
                        value={enteredOtp}
                        onChange={(e) => setEnteredOtp(e.target.value)}
                      />
                    </FormControl>

                    <Button
                      disabled={!passwordChangeState}
                      size="sm"
                      startDecorator={<VerifiedUser sx={{ fontSize: 15 }} />}
                      loading={otpVerifying}
                      onClick={verifyOTP}
                      sx={{
                        background: passwordChangeState
                          ? "linear-gradient(135deg, #059669, #047857)"
                          : "rgba(255,255,255,0.04)",
                        color: passwordChangeState ? "#fff" : "#3a4050",
                        border: "none", borderRadius: "9px", fontWeight: 600,
                        fontSize: "0.82rem", px: 2.5,
                        boxShadow: passwordChangeState ? "0 4px 12px rgba(5,150,105,0.3)" : "none",
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

      <Toast open={toastOpen} message={toastMessage} status={toastStatus} onClose={() => setToastOpen(false)} />
      <LogoutConfirm open={logoutConfirm} onClose={() => setLogoutConfirm(false)} />
    </>
  );
};

export default SettingsModal;