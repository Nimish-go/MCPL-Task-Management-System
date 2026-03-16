import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import {
  Alert,
  Box,
  Button,
  Divider,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Typography,
} from "@mui/joy";
import {
  Check,
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
  }, []);

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

  const toggleShowPass = () => {
    if (passType === "password") {
      setPassType("text");
    } else {
      setPassType("password");
    }
  };

  const validateOrgCode = (event) => {
    event.preventDefault();
    setOrgCodeLoading(true);
    axios
      .get(`/validate_org_code/${orgCode}`)
      .then((res) => {
        const data = res.data;
        if (res.status === 200) {
          setError(false);
          setOrgCodeLoading(false);
          setValidOrgCode(true);
          setOrgId(data.org_id);
        }
      })
      .catch((err) => {
        console.error(err);
        setError(true);
        setOrgCodeLoading(false);
        setValidOrgCode(false);
      });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
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
          setLoading(false);
          navigate("/dashboard");
        }
      })
      .catch((err) => {
        setLoginError(true);
        setLoading(false);
        console.error(err);
      });
  };

  return (
    <div className="w-full min-h-screen bg-gray-100 flex flex-col">
      <Navbar />

      <div className="flex flex-1 items-center justify-center px-4">
        <div className="flex flex-col md:flex-row items-center gap-10 bg-white shadow-xl rounded-xl p-8 md:p-12 max-w-5xl w-full">
          {/* Animation */}
          <div className="flex w-full md:w-1/2 md:flex-2 justify-center">
            <DotLottieReact
              src="https://lottie.host/dd0592d7-45b7-43b9-9eda-6eaefdf12b9d/n2rwX61ovC.lottie"
              style={{
                maxWidth: 400,
                height: 400,
              }}
              loop
              autoplay
            />
          </div>

          <Divider
            orientation="vertical"
            sx={{
              display: {
                md: {
                  display: "none",
                },
              },
            }}
          />

          {/* Login Form */}
          <div className="w-full md:w-1/2 space-y-4">
            <Typography level="h3" textAlign="center">
              Login
            </Typography>

            <FormControl error={error}>
              <FormLabel>Enter Org Code</FormLabel>
              <Input
                type="text"
                placeholder="XXXX"
                value={orgCode}
                onChange={(e) => setOrgCode(e.target.value)}
              />
              {error && <FormHelperText>Invalid Org Code</FormHelperText>}
              <Button
                variant="soft"
                color="primary"
                onClick={validateOrgCode}
                startDecorator={<Security />}
                sx={{ mt: 2 }}
                disabled={validOrgCode}
                loading={orgCodeLoading}
              >
                Validate Code
              </Button>
            </FormControl>

            {validOrgCode && (
              <>
                <Alert
                  variant="soft"
                  color="success"
                  startDecorator={<GppGood />}
                >
                  Organisation Code is Valid
                </Alert>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <FormControl error={loginError}>
                    <FormLabel>Username</FormLabel>
                    <Input
                      type="text"
                      placeholder="Joe Stern"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      startDecorator={<Person />}
                    />
                  </FormControl>

                  <FormControl error={loginError}>
                    <FormLabel>Password</FormLabel>
                    <Input
                      type={passType}
                      placeholder="XXXXXXXX"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      startDecorator={<Key />}
                      endDecorator={
                        <Button variant="soft" onClick={toggleShowPass}>
                          {passType === "password" ? (
                            <Visibility />
                          ) : (
                            <VisibilityOff />
                          )}
                        </Button>
                      }
                    />
                    {loginError && (
                      <FormHelperText>
                        Login Credentials are invalid
                      </FormHelperText>
                    )}
                  </FormControl>

                  <Button
                    type="submit"
                    color="primary"
                    variant="solid"
                    startDecorator={<LoginOutlined />}
                    loading={loading}
                    className="w-full"
                  >
                    Login
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
