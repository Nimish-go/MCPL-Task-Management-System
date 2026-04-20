import React, { useEffect, useState } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import {
  Alert,
  Box,
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Typography,
} from "@mui/joy";
import {
  GppGood,
  Key,
  LoginOutlined,
  Person,
  Security,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    axios.defaults.baseURL = "https://mcpl-task-management-system.vercel.app/";
    if (sessionStorage.getItem("empName")) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [orgId, setOrgId] = useState("");
  const [orgCode, setOrgCode] = useState("");
  const [validOrgCode, setValidOrgCode] = useState(null);
  const [error, setError] = useState(false);
  const [passType, setPassType] = useState("password");
  const [loading, setLoading] = useState(false);
  const [orgCodeLoading, setOrgCodeLoading] = useState(false);
  const [loginError, setLoginError] = useState(false);

  const toggleShowPass = () =>
    setPassType((p) => (p === "password" ? "text" : "password"));

  const validateOrgCode = (e) => {
    e.preventDefault();
    setOrgCodeLoading(true);
    axios
      .get(`/validate_org_code/${orgCode}`)
      .then((res) => {
        if (res.status === 200) {
          setError(false);
          setValidOrgCode(true);
          setOrgId(res.data.org_id);
        }
      })
      .catch(() => {
        setError(true);
        setValidOrgCode(false);
      })
      .finally(() => setOrgCodeLoading(false));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    const loginData = new FormData();
    loginData.append("username", username);
    loginData.append("password", password);
    loginData.append("org_id", orgId);
    axios
      .post("/login", loginData)
      .then((res) => {
        if (res.status === 200) {
          const data = res.data;
          sessionStorage.setItem("empName", data.empName);
          sessionStorage.setItem("designation", data.designation);
          sessionStorage.setItem("role", data.role);
          sessionStorage.setItem("email", data.email);
          sessionStorage.setItem("org", data.org_id);
          navigate("/dashboard");
        }
      })
      .catch(() => setLoginError(true))
      .finally(() => setLoading(false));
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #0f1b35 0%, #1565c0 55%, #1976d2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background decorative circles */}
      <Box
        sx={{
          position: "absolute",
          top: -120,
          right: -120,
          width: 400,
          height: 400,
          borderRadius: "50%",
          backgroundColor: "rgba(255,255,255,0.04)",
          pointerEvents: "none",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: -80,
          left: -80,
          width: 300,
          height: 300,
          borderRadius: "50%",
          backgroundColor: "rgba(255,255,255,0.04)",
          pointerEvents: "none",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          top: "40%",
          left: "10%",
          width: 150,
          height: 150,
          borderRadius: "50%",
          backgroundColor: "rgba(255,255,255,0.03)",
          pointerEvents: "none",
        }}
      />

      {/* Card */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          backgroundColor: "#fff",
          borderRadius: "24px",
          overflow: "hidden",
          width: "100%",
          maxWidth: 900,
          boxShadow: "0 32px 80px rgba(0,0,0,0.35)",
        }}
      >
        {/* Left — Animation Panel */}
        <Box
          sx={{
            flex: 1,
            background: "linear-gradient(160deg, #0f1b35 0%, #1565c0 100%)",
            display: { xs: "none", md: "flex" },
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            px: 4,
            py: 6,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative ring */}
          <Box
            sx={{
              position: "absolute",
              width: 320,
              height: 320,
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.08)",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              pointerEvents: "none",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              width: 480,
              height: 480,
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.05)",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              pointerEvents: "none",
            }}
          />

          {/* Logo / brand */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              mb: 3,
              zIndex: 1,
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "12px",
                background: "rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                color: "#fff",
                fontSize: "1.1rem",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              M
            </Box>
            <Box>
              <Typography
                sx={{
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: "0.95rem",
                  lineHeight: 1.2,
                }}
              >
                MCPL
              </Typography>
              <Typography
                sx={{ color: "rgba(255,255,255,0.55)", fontSize: "0.7rem" }}
              >
                Task Management
              </Typography>
            </Box>
          </Box>

          <DotLottieReact
            src="https://lottie.host/da195e13-e534-42c2-96b0-47981986cd4f/qt5oPHsj7k.lottie"
            style={{ width: 320, height: 300, zIndex: 1 }}
            loop
            autoplay
          />

          <Typography
            sx={{
              color: "rgba(255,255,255,0.7)",
              fontSize: "0.82rem",
              textAlign: "center",
              mt: 2,
              zIndex: 1,
              maxWidth: 260,
              lineHeight: 1.6,
            }}
          >
            Streamline your team's productivity with smart task tracking and
            management.
          </Typography>
        </Box>

        {/* Right — Form Panel */}
        <Box
          sx={{
            flex: 1,
            px: { xs: 3, md: 5 },
            py: { xs: 5, md: 6 },
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {/* Mobile logo */}
          <Box
            sx={{
              display: { xs: "flex", md: "none" },
              alignItems: "center",
              gap: 1.5,
              mb: 4,
              justifyContent: "center",
            }}
          >
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: "10px",
                background: "linear-gradient(135deg, #1565c0, #42a5f5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                color: "#fff",
                fontSize: "1rem",
              }}
            >
              M
            </Box>
            <Typography
              sx={{ fontWeight: 800, color: "#0f1b35", fontSize: "1rem" }}
            >
              MCPL Task Management
            </Typography>
          </Box>

          <Typography
            level="h3"
            sx={{
              fontWeight: 800,
              color: "#0f1b35",
              letterSpacing: "-0.02em",
              mb: 0.5,
            }}
          >
            Welcome back
          </Typography>
          <Typography sx={{ color: "#94a3b8", fontSize: "0.875rem", mb: 4 }}>
            Sign in to your account to continue
          </Typography>

          {/* Step 1 — Org Code */}
          <Box
            sx={{
              p: 2.5,
              borderRadius: "14px",
              backgroundColor: validOrgCode ? "#f0fdf4" : "#f8faff",
              border: `1px solid ${validOrgCode ? "#86efac" : "#e2e8f0"}`,
              mb: 3,
              transition: "all 0.3s ease",
            }}
          >
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}
            >
              <Box
                sx={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  backgroundColor: validOrgCode ? "#22c55e" : "#1976d2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Typography
                  sx={{ color: "#fff", fontSize: "0.65rem", fontWeight: 700 }}
                >
                  1
                </Typography>
              </Box>
              <Typography
                sx={{
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  color: validOrgCode ? "#16a34a" : "#0f1b35",
                }}
              >
                {validOrgCode
                  ? "Organisation Verified ✓"
                  : "Verify Organisation"}
              </Typography>
            </Box>

            <FormControl error={error}>
              <Input
                type="text"
                placeholder="Enter organisation code (e.g. MCPL01)"
                value={orgCode}
                onChange={(e) => setOrgCode(e.target.value)}
                disabled={validOrgCode}
                startDecorator={
                  <Security
                    sx={{
                      fontSize: "1rem",
                      color: validOrgCode ? "#22c55e" : "#94a3b8",
                    }}
                  />
                }
                sx={{
                  borderRadius: "10px",
                  fontSize: "0.875rem",
                  "--Input-focusedHighlight": "#1976d2",
                  backgroundColor: validOrgCode ? "#dcfce7" : "#fff",
                }}
              />
              {error && (
                <FormHelperText sx={{ mt: 0.5, fontSize: "0.75rem" }}>
                  ✕ Invalid organisation code. Please try again.
                </FormHelperText>
              )}
            </FormControl>

            {!validOrgCode && (
              <Button
                variant="solid"
                color="primary"
                onClick={validateOrgCode}
                startDecorator={<Security sx={{ fontSize: "0.9rem" }} />}
                loading={orgCodeLoading}
                disabled={!orgCode.trim()}
                sx={{
                  mt: 1.5,
                  borderRadius: "10px",
                  fontWeight: 600,
                  fontSize: "0.82rem",
                  background: "linear-gradient(135deg, #1565c0, #1976d2)",
                  width: "100%",
                  boxShadow: "0 4px 12px rgba(25,118,210,0.25)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #0d47a1, #1565c0)",
                  },
                }}
              >
                Validate Organisation Code
              </Button>
            )}
          </Box>

          {/* Step 2 — Login Form */}
          {validOrgCode && (
            <Box
              sx={{
                animation: "fadeSlideIn 0.3s ease",
                "@keyframes fadeSlideIn": {
                  from: { opacity: 0, transform: "translateY(10px)" },
                  to: { opacity: 1, transform: "translateY(0)" },
                },
              }}
            >
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
              >
                <Box
                  sx={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    backgroundColor: "#1976d2",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Typography
                    sx={{ color: "#fff", fontSize: "0.65rem", fontWeight: 700 }}
                  >
                    2
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    color: "#0f1b35",
                  }}
                >
                  Enter your credentials
                </Typography>
              </Box>

              <form onSubmit={handleSubmit}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <FormControl error={loginError}>
                    <FormLabel
                      sx={{
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        color: "#475569",
                      }}
                    >
                      Username
                    </FormLabel>
                    <Input
                      type="text"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      startDecorator={
                        <Person sx={{ fontSize: "1rem", color: "#94a3b8" }} />
                      }
                      sx={{
                        borderRadius: "10px",
                        fontSize: "0.875rem",
                        "--Input-focusedHighlight": "#1976d2",
                      }}
                    />
                  </FormControl>

                  <FormControl error={loginError}>
                    <FormLabel
                      sx={{
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        color: "#475569",
                      }}
                    >
                      Password
                    </FormLabel>
                    <Input
                      type={passType}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      startDecorator={
                        <Key sx={{ fontSize: "1rem", color: "#94a3b8" }} />
                      }
                      endDecorator={
                        <Box
                          onClick={toggleShowPass}
                          sx={{
                            cursor: "pointer",
                            color: "#94a3b8",
                            display: "flex",
                            alignItems: "center",
                            "&:hover": { color: "#1976d2" },
                            transition: "color 0.2s",
                          }}
                        >
                          {passType === "password" ? (
                            <Visibility sx={{ fontSize: "1.1rem" }} />
                          ) : (
                            <VisibilityOff sx={{ fontSize: "1.1rem" }} />
                          )}
                        </Box>
                      }
                      sx={{
                        borderRadius: "10px",
                        fontSize: "0.875rem",
                        "--Input-focusedHighlight": "#1976d2",
                      }}
                    />
                    {loginError && (
                      <FormHelperText sx={{ fontSize: "0.75rem" }}>
                        ✕ Invalid username or password.
                      </FormHelperText>
                    )}
                  </FormControl>

                  <Button
                    type="submit"
                    variant="solid"
                    loading={loading}
                    startDecorator={
                      !loading && <LoginOutlined sx={{ fontSize: "1rem" }} />
                    }
                    sx={{
                      mt: 1,
                      borderRadius: "10px",
                      fontWeight: 700,
                      fontSize: "0.9rem",
                      py: 1.4,
                      background: "linear-gradient(135deg, #0f1b35, #1565c0)",
                      boxShadow: "0 6px 20px rgba(25,118,210,0.35)",
                      "&:hover": {
                        background: "linear-gradient(135deg, #0a1628, #0d47a1)",
                        boxShadow: "0 8px 24px rgba(25,118,210,0.45)",
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    Sign In
                  </Button>
                </Box>
              </form>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
