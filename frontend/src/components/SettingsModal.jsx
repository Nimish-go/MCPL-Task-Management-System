import {
  Check,
  Edit,
  KeyboardArrowRight,
  PowerOff,
  PowerSettingsNew,
} from "@mui/icons-material";
import {
  Avatar,
  Badge,
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalClose,
  ModalDialog,
  Sheet,
  Typography,
} from "@mui/joy";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import Toast from "./Toast";
import LogoutConfirm from "./LogoutConfirm";

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
    if (!open) {
      return;
    }
    // user_details = [{ "id" : row[0], "username" : row[1], "branch" : row[2], "email" : row[3], "role" : row[4], "mobile" : row[5] }]
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
      .catch((err) => {
        console.error("An error occurred..//");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [open]);

  const getInitials = (name) => {
    if (!name) return "";

    const words = name.trim().split(" ");
    if (words.length === 1) {
      return words[0][0].toUpperCase();
    }

    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
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
          setToastMessage("Employee record updated successfully.");
          setToastOpen(true);
        }
      })
      .catch((err) => {
        setToastStatus("error");
        setToastMessage("Something Went Wrong. Please Check the Console.");
        setToastOpen(true);
        console.error(err);
      })
      .finally(() => {
        setUpdateLoading(false);
      });
  };

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <ModalDialog
          sx={{
            p: 0,
            borderRadius: "16px",
            width: "900px",
            height: "500px",
          }}
        >
          <Box sx={{ display: "flex", height: "100%" }}>
            <Sheet
              sx={{
                width: "35%",
                bgcolor: "neutral.softBg",
                position: "relative",
                borderRadius: "10px",
              }}
            >
              <Box
                sx={{
                  height: 120,
                  bgcolor: "#023047",
                  borderRadius: "10px",
                  left: 0,
                }}
              />
              <Avatar
                color="primary"
                variant="solid"
                sx={{ position: "absolute", top: 100, left: 20 }}
              >
                {getInitials(sessionStorage.getItem("empName"))}
              </Avatar>
              <Box sx={{ mt: 8, px: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      position: "relative",
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      bgcolor: "success.500",
                      "&::after": {
                        content: '""',
                        position: "absolute",
                        width: "100%",
                        height: "100%",
                        borderRadius: "50%",
                        bgcolor: "success.500",
                        animation: "pulse 1.5s infinite",
                        opacity: 0.6,
                      },
                      "@keyframes pulse": {
                        "0%": {
                          transform: "scale(1)",
                          opacity: 0.6,
                        },
                        "70%": {
                          transform: "scale(2.5)",
                          opacity: 0,
                        },
                        "100%": {
                          transform: "scale(1)",
                          opacity: 0,
                        },
                      },
                    }}
                  />
                  <Typography color="success">Active</Typography>
                </Box>
                <Typography level="title-lg">
                  Welcome {sessionStorage.getItem("empName")}
                </Typography>
                <Typography level="body-md">
                  {sessionStorage.getItem("designation")}
                </Typography>
                <Typography level="body-md">
                  {sessionStorage.getItem("role")}
                </Typography>
              </Box>
              <Box sx={{ mt: 6, px: 3 }}>
                <Typography
                  onClick={() => setActiveTab("profile")}
                  sx={{
                    cursor: "pointer",
                    mb: 2,
                    color:
                      activeTab === "profile" ? "primary.500" : "neutral.700",
                    fontWeight: activeTab === "profile" ? "bold" : "normal",
                  }}
                >
                  Profile Settings <KeyboardArrowRight />
                </Typography>
                <Typography
                  onClick={() => setActiveTab("password")}
                  sx={{
                    cursor: "pointer",
                    color:
                      activeTab === "password" ? "primary.500" : "neutral.700",
                    fontWeight: activeTab === "password" ? "bold" : "normal",
                  }}
                >
                  Password Settings <KeyboardArrowRight />
                </Typography>
                <Button
                  color="danger"
                  startDecorator={<PowerSettingsNew />}
                  sx={{ my: 2 }}
                  onClick={() => setLogoutConfirm(true)}
                >
                  Logout
                </Button>
              </Box>
            </Sheet>
            <Box sx={{ flex: 1, p: 4, position: "relative" }}>
              <ModalClose />
              {loading && (
                <div className="flex flex-col justify-center items-center text-center">
                  <DotLottieReact
                    src="https://lottie.host/876ba248-54ac-48d0-a9dc-67747bd5b80a/0QJm3EJB8I.lottie"
                    loop
                    autoplay
                    className="h-100 w-100"
                  />
                  <Typography level="body-md">
                    Loading Employee Profile
                  </Typography>
                </div>
              )}
              {activeTab === "profile" && !loading && (
                <>
                  <Typography level="h4" textAlign={"center"}>
                    Profile Settings
                  </Typography>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 3,
                      mt: 6,
                    }}
                  >
                    <FormControl>
                      <FormLabel>User ID</FormLabel>
                      <Input disabled value={userId} />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Username</FormLabel>
                      <Input
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={!editState || updateLoading}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Email</FormLabel>
                      <Input
                        onChange={(e) => setEmail(e.target.value)}
                        value={email}
                        disabled={!editState || updateLoading}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Mobile</FormLabel>
                      <Input
                        value={userMobile}
                        onChange={(e) => setUserMobile(e.target.value)}
                        placeholder={
                          userMobile
                            ? "+91 " + userMobile
                            : "Please Enter your mobile number"
                        }
                        disabled={!editState || updateLoading}
                      />
                    </FormControl>
                  </Box>
                  {editState ? (
                    <div className="flex">
                      <Button
                        sx={{ mt: 2 }}
                        startDecorator={<Check />}
                        color="success"
                        onClick={updateProfile}
                        loading={updateLoading}
                      >
                        Save
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center text-center">
                      <Button
                        sx={{ mt: 2 }}
                        startDecorator={<Edit />}
                        onClick={() => setEditState(true)}
                      >
                        Edit
                      </Button>
                      <Typography
                        level="body-md"
                        sx={{ marginLeft: 2, opacity: 0.5 }}
                      >
                        Please Click Edit Button to Edit Profile
                      </Typography>
                    </div>
                  )}
                </>
              )}
              {activeTab === "password" && !loading && (
                <>
                  <Typography level="h4" textAlign={"center"} mb={3}>
                    Password Settings
                  </Typography>
                  <FormControl>
                    <FormLabel>Enter New Password</FormLabel>
                    <Input type="password" sx={{ my: 2 }} />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Confirm New Password</FormLabel>
                    <Input type="password" sx={{ my: 2 }} />
                  </FormControl>
                  <Button color="primary" sx={{ my: 2 }}>
                    Change Password
                  </Button>
                  <FormControl disabled={!passwordChangeState}>
                    <FormLabel>Enter OTP sent on Email</FormLabel>
                    <Input type="password" />
                  </FormControl>
                  <Button
                    color="success"
                    disabled={!passwordChangeState}
                    sx={{ my: 2 }}
                  >
                    Verify OTP
                  </Button>
                </>
              )}
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
