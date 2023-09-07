import React, { Suspense, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";

import "App.css";
import { authenticate, resetMessages } from "./features/auth/authSlice";
import Loading from "./components/Loading/Loading";
import { getLocalStorageToken } from "./utils/utils";
import LoginPage from "./pages/LoginPage/LoginPage";
import RegisterPage from "./pages/RegisterPage/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage/ForgotPasswordPage";
import routes from "./routes/routes";
import Layout from "./pages/Layout/Layout";
import PrivateRoute from "./PrivateRoute";

import { createTheme, ThemeProvider } from "@mui/material/styles";

const theme = createTheme();

theme.typography.h3 = {
  fontSize: "1.8rem",
  "@media (min-width:600px)": {
    fontSize: "2rem",
  },
  [theme.breakpoints.up("md")]: {
    fontSize: "2rem",
  },
};

const App = () => {
  const dispatch = useDispatch();
  const { isAuthenticating } = useSelector((state) => state.auth);
  const token = getLocalStorageToken();

  useEffect(() => {
    if (token) {
      dispatch(authenticate())
        .unwrap()
        .then(() => {
          dispatch(resetMessages());
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (isAuthenticating) {
    return <Loading />;
  }

  return (
    <ThemeProvider theme={theme}>
      <div className="w-screen h-screen overflow-hidden">
        <Router>
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route path="password/forgot" element={<ForgotPasswordPage />} />
              {/* Dashboard */}
              <Route path="" element={<Layout />}>
                {routes.map((route, index) => (
                  <Route
                    key={index}
                    path={route.path}
                    element={
                      route.isPrivate ? (
                        <PrivateRoute>{route.element}</PrivateRoute>
                      ) : (
                        route.element
                      )
                    }
                  />
                ))}
              </Route>
              <Route
                path="*"
                element={
                  <div className="w-screen h-screen overflow-hidden">
                    <div className="text-4xl flex justify-center items-center w-full h-full">
                      No Page Found
                    </div>
                  </div>
                }
              />
            </Routes>
          </Suspense>
        </Router>

        <ToastContainer />
      </div>
    </ThemeProvider>
  );
};

export default App;
