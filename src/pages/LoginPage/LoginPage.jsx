import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { loginUser, resetMessages } from "../../features/auth/authSlice";
import { notify } from "../../utils/utils";
import { NOTIFICATION_TYPES } from "../../utils/constants";

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

const formDataInitial = {
  email: "",
  password: "",
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

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    isAuthenticated,
    isLoading: isLoggingIn,
    message,
  } = useSelector((state) => state.auth);
  const [params] = useSearchParams();

  const [formData, setFormData] = useState(formDataInitial);
  const resetFormData = () => {
    setFormData(formDataInitial);
  };

  useEffect(() => {
    if (isAuthenticated)
      return navigate(params.get("to") || "/", {
        replace: true,
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const handleOnChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!formData.email) {
      notify(NOTIFICATION_TYPES.ERROR, "Please, provide valid email address");
      return false;
    }

    if (!formData.password) {
      notify(NOTIFICATION_TYPES.ERROR, "Please, provide password");
      return false;
    }

    return true;
  };

  const login = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    dispatch(loginUser(formData))
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
    <Container maxWidth="xs">
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
          Sign in
        </Typography>
        {message && (
          <Stack sx={{ width: "100%", marginTop: 2 }} spacing={2}>
            <Alert severity="error" onClose={() => dispatch(resetMessages())}>
              {message}
            </Alert>
          </Stack>
        )}
        <Box component="form" onSubmit={login} sx={{ mt: 1 }}>
          {/* Email Address */}
          <TextField
            name="email"
            id="email"
            margin="normal"
            required
            fullWidth
            label="Email Address"
            autoComplete="email"
            onChange={handleOnChange}
          />
          {/* Password */}
          <TextField
            name="password"
            id="password"
            margin="normal"
            required
            fullWidth
            label="Password"
            type="password"
            autoComplete="current-password"
            onChange={handleOnChange}
          />
          {/* Sign In Button */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={isLoggingIn}
          >
            {isLoggingIn ? "Signing In..." : "Sign In"}
          </Button>
          <Grid container>
            {/* Forgot Password */}
            <Grid item xs>
              <Link href="password/forgot" variant="body2">
                Forgot password?
              </Link>
            </Grid>
            {/* New User */}
            <Grid item>
              <Link href="register" variant="body2">
                {"Don't have an account? Sign Up"}
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>
      <Copyright sx={{ mt: 8, mb: 4 }} />
    </Container>
  );
};

export default LoginPage;
