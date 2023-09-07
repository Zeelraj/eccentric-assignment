import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { notify } from "../../utils/utils";
import { NOTIFICATION_TYPES, RECOVERY_QUESTIONS } from "../../utils/constants";
import { registerUser, resetMessages } from "../../features/auth/authSlice";

// MUI
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";

const formDataInitial = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  cnfPassword: "",
  passwordRecoveryQuestion: "",
  passwordRecoveryAnswer: "",
};

const Copyright = (props) => {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      {...props}
    >
      {"Copyright © "}
      <Link color="inherit" href="https://nxthop.in/nxt/zrsmahida">
        Zeelrajsinh Mahida
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
};

const RegisterPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    isAuthenticated,
    isLoading: isRegistering,
    message,
  } = useSelector((state) => state.auth);
  const [params] = useSearchParams();

  const [formData, setFormData] = useState(formDataInitial);

  useEffect(() => {
    if (isAuthenticated)
      return navigate(params.get("to") || "/", {
        replace: true,
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Handle Data
  const handleOnChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const resetFormData = () => {
    setFormData(formDataInitial);
  };

  const validateFormDetails = () => {
    if (!formData.firstName) {
      notify(NOTIFICATION_TYPES.ERROR, "Please, provide first name");
      return false;
    }

    if (!formData.lastName) {
      notify(NOTIFICATION_TYPES.ERROR, "Please, provide last name");
      return false;
    }

    if (!formData.email) {
      notify(NOTIFICATION_TYPES.ERROR, "Please, provide email");
      return false;
    }

    if (!formData.password) {
      notify(NOTIFICATION_TYPES.ERROR, "Please, provide password");
      return false;
    }

    if (formData.password.length < 8) {
      notify(
        NOTIFICATION_TYPES.ERROR,
        "Password must be greater than 8 characters"
      );
      return false;
    }

    if (!formData.cnfPassword) {
      notify(NOTIFICATION_TYPES.ERROR, "Please, re-enter password to confirm");
      return false;
    }

    if (formData.password !== formData.cnfPassword) {
      notify(
        NOTIFICATION_TYPES.ERROR,
        "Confirm Password is not same as the password"
      );
      return false;
    }

    if (!formData.passwordRecoveryQuestion) {
      notify(
        NOTIFICATION_TYPES.ERROR,
        "Please, select password recovery question"
      );
      return false;
    }

    if (!formData.passwordRecoveryAnswer) {
      notify(
        NOTIFICATION_TYPES.ERROR,
        "Please, answer the password recovery question"
      );
      return false;
    }

    return true;
  };

  // Register User
  const onRegisterUser = async (e) => {
    e.preventDefault();

    if (!validateFormDetails()) return;

    const payload = {
      name: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      password: formData.password,
      cnfPassword: formData.cnfPassword,
      passwordRecovery: {
        question: formData.passwordRecoveryQuestion,
        answer: formData.passwordRecoveryAnswer,
      },
    };

    dispatch(registerUser(payload))
      .unwrap()
      .then((res) => {
        if (res.status === 200) {
          resetFormData();
          notify(NOTIFICATION_TYPES.SUCCESS, res.body.message);
          dispatch(resetMessages());
          window.location.reload();
        } else {
          notify(NOTIFICATION_TYPES.ERROR, res.body.message);
        }
      });
  };

  return (
    <div className="overflow-y-scroll h-screen w-screen">
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: "primary.main" }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign up
          </Typography>
          {message && (
            <Stack sx={{ width: "100%", marginTop: 2 }} spacing={2}>
              <Alert severity="error" onClose={() => dispatch(resetMessages())}>
                {message}
              </Alert>
            </Stack>
          )}
          <Box
            component="form"
            noValidate
            onSubmit={onRegisterUser}
            sx={{ mt: 3 }}
          >
            <Grid container spacing={2}>
              {/* Firstname */}
              <Grid item xs={12} sm={6}>
                <TextField
                  name="firstName"
                  autoComplete="given-name"
                  required
                  fullWidth
                  id="firstName"
                  label="First Name"
                  onChange={handleOnChange}
                />
              </Grid>
              {/* Lastname */}
              <Grid item xs={12} sm={6}>
                <TextField
                  name="lastName"
                  required
                  fullWidth
                  id="lastName"
                  label="Last Name"
                  autoComplete="family-name"
                  onChange={handleOnChange}
                />
              </Grid>
              {/* Email Address */}
              <Grid item xs={12}>
                <TextField
                  name="email"
                  id="email"
                  required
                  fullWidth
                  label="Email Address"
                  autoComplete="email"
                  onChange={handleOnChange}
                />
              </Grid>
              {/* Password */}
              <Grid item xs={12}>
                <TextField
                  name="password"
                  required
                  fullWidth
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  onChange={handleOnChange}
                />
              </Grid>
              {/* Confirm Password */}
              <Grid item xs={12}>
                <TextField
                  name="cnfPassword"
                  required
                  fullWidth
                  label="Confirm Password"
                  type="password"
                  id="password"
                  onChange={handleOnChange}
                />
              </Grid>
              {/* Select Password Recovery Question */}
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="passwordRecoveryQuestion">
                    Password Recovery Question
                  </InputLabel>
                  <Select
                    name="passwordRecoveryQuestion"
                    id="passwordRecoveryQuestion"
                    labelId="passwordRecoveryQuestion"
                    value={formData.passwordRecoveryQuestion}
                    label="Password Recovery Question"
                    onChange={handleOnChange}
                  >
                    {RECOVERY_QUESTIONS.map((question) => (
                      <MenuItem key={question.id} value={question.id}>
                        {question.question}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              {/* Password Recovery Answer */}
              <Grid item xs={12}>
                <TextField
                  name="passwordRecoveryAnswer"
                  id="passwordRecoveryAnswer"
                  required
                  fullWidth
                  disabled={!formData.passwordRecoveryQuestion}
                  label="Recovery Answer"
                  onChange={handleOnChange}
                />
              </Grid>
            </Grid>
            {/* Sign Up */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isRegistering}
            >
              {isRegistering ? "Signing Up..." : "Sign Up"}
            </Button>
            {/* Login Page */}
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link href="login" variant="body2">
                  Already have an account? Sign in
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
        <Copyright sx={{ mt: 5, mb: 2 }} />
      </Container>
    </div>
  );
};

export default RegisterPage;
