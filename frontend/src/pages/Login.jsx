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
} from "@mui/joy";
import {
  Check,
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
  useEffect(() => {
    axios.defaults.baseURL = "https://mcpl-task-management-system.vercel.app/";
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
  const navigate = useNavigate();

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
          setLoading(false);
          navigate("/dashboard");
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <div className="w-full min-w-screen">
      <div className="navbar-container">
        <Navbar />
      </div>
      <div className="flex justify-center text-center items-center">
        <div className="lottie-container">
          <DotLottieReact
            src="https://lottie.host/dd0592d7-45b7-43b9-9eda-6eaefdf12b9d/n2rwX61ovC.lottie"
            height={500}
            width={500}
            loop
            autoplay
          />
        </div>
        <Divider orientation="vertical" sx={{ mx: 2 }} />
        <div className="login-form">
          <FormControl error={error}>
            <FormLabel>Enter Org Code</FormLabel>
            <Input
              type="text"
              placeholder="XXXX"
              value={orgCode}
              onChange={(e) => setOrgCode(e.target.value)}
            />
            {error ? <FormHelperText>Invalid Org Code</FormHelperText> : <></>}
            <Button
              variant="soft"
              color="primary"
              onClick={validateOrgCode}
              startDecorator={<Security />}
              sx={{ mt: 2 }}
              disabled={validOrgCode ? true : false}
              loading={orgCodeLoading}
            >
              Validate Code
            </Button>
          </FormControl>
          {validOrgCode ? (
            <div>
              <Alert
                variant="soft"
                color="success"
                startDecorator={<Check />}
                sx={{ my: 3 }}
              >
                Organisation Code is Valid
              </Alert>
              <form onSubmit={handleSubmit}>
                <FormControl error={loginError}>
                  <FormLabel>Enter Username</FormLabel>
                  <Input
                    type="text"
                    placeholder="Joe Stern"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    startDecorator={<Person />}
                  />
                  {loginError ? (
                    <FormHelperText>
                      Login Credentials are invalid
                    </FormHelperText>
                  ) : (
                    <></>
                  )}
                </FormControl>
                <FormControl>
                  <FormLabel>Enter Password</FormLabel>
                  <Input
                    type={passType}
                    placeholder="XXXXXXXX"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    startDecorator={<Key />}
                    endDecorator={
                      <Button
                        variant="soft"
                        color="primary"
                        onClick={toggleShowPass}
                      >
                        {passType === "password" ? (
                          <Visibility />
                        ) : (
                          <VisibilityOff />
                        )}
                      </Button>
                    }
                  />
                  {loginError ? (
                    <FormHelperText>
                      Login Credentials are invalid
                    </FormHelperText>
                  ) : (
                    <></>
                  )}
                </FormControl>
                <Button
                  type="submit"
                  color="primary"
                  variant="outlined"
                  startDecorator={<LoginOutlined />}
                  sx={{ my: 2 }}
                  className="w-full"
                  loading={loading}
                >
                  Login
                </Button>
              </form>
            </div>
          ) : (
            <></>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
