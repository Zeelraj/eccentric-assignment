import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import AdbIcon from "@mui/icons-material/Adb";
import { APP_NAME } from "../../utils/constants";
import { useNavigate } from "react-router-dom";
import { logoutUser, resetMessages } from "../../features/auth/authSlice";
import AlertDialog from "../AlertDialog/AlertDialog";

const stringToColor = (string) => {
  let hash = 0;
  let i;

  /* eslint-disable no-bitwise */
  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = "#";

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  /* eslint-enable no-bitwise */

  return color;
};

const stringAvatar = (name) => {
  return {
    sx: {
      bgcolor: stringToColor(name),
    },
    children: `${name.split(" ")[0][0]}${name.split(" ")[1][0]}`,
  };
};

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.auth);
  const [open, setOpen] = useState(false);

  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const logout = () => {
    dispatch(logoutUser())
      .unwrap()
      .then((res) => {
        if (res.status === 200) {
          navigate("/login");
          dispatch(resetMessages());
        }
      });
  };

  const onLogout = () => {
    setOpen(true);
  };

  return (
    <>
      <AlertDialog
        open={open}
        title="Logout?"
        message="Are you sure you want to leave?"
        successButton="Logout"
        cancelButton="Stay"
        onSuccess={logout}
        onCancel={() => setOpen(false)}
      />
      <AppBar position="static">
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {/* App Title */}
            <AdbIcon sx={{ display: { xs: "none", md: "flex" }, mr: 1 }} />
            <Typography
              variant="h6"
              noWrap
              component="span"
              sx={{
                mr: 2,
                display: { xs: "none", md: "flex" },
                fontFamily: "monospace",
                fontWeight: 700,
                letterSpacing: ".3rem",
                color: "inherit",
                textDecoration: "none",
              }}
              onClick={() => navigate("/")}
              className="cursor-pointer"
            >
              {APP_NAME.toUpperCase()}
            </Typography>

            {/* Navbar Options and Menu */}
            <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenNavMenu}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorElNav}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "left",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                sx={{
                  display: { xs: "block", md: "none" },
                }}
              >
                {/* Home */}
                <MenuItem
                  onClick={() => {
                    navigate("/");
                    handleCloseNavMenu();
                  }}
                >
                  <Typography textAlign="center">Home</Typography>
                </MenuItem>
                {/* Meetings */}
                <MenuItem
                  onClick={() => {
                    navigate("/meetings");
                    handleCloseNavMenu();
                  }}
                >
                  <Typography textAlign="center">Meetings</Typography>
                </MenuItem>
              </Menu>
            </Box>
            <AdbIcon sx={{ display: { xs: "flex", md: "none" }, mr: 1 }} />
            <Typography
              variant="h5"
              noWrap
              component="a"
              href="/"
              sx={{
                mr: 2,
                display: { xs: "flex", md: "none" },
                flexGrow: 1,
                fontFamily: "monospace",
                fontWeight: 700,
                letterSpacing: ".3rem",
                color: "inherit",
                textDecoration: "none",
              }}
            >
              {APP_NAME.toUpperCase()}
            </Typography>
            <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
              {/* Home */}
              <Button
                onClick={() => navigate("/")}
                sx={{ my: 2, color: "white", display: "block" }}
              >
                Home
              </Button>
              {/* Meetings */}
              <Button
                onClick={() => navigate("/meetings")}
                sx={{ my: 2, color: "white", display: "block" }}
              >
                Meetings
              </Button>
            </Box>

            {/* Profile Icon and Settings */}
            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Open settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar {...stringAvatar(currentUser?.name || "John Doe")} />
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: "45px" }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                {/* Profile */}
                <MenuItem
                  onClick={() => {
                    navigate("/profile");
                    handleCloseUserMenu();
                  }}
                >
                  <Typography textAlign="center">Profile</Typography>
                </MenuItem>
                {/* Logout */}
                <MenuItem onClick={onLogout}>
                  <Typography textAlign="center">Logout</Typography>
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </>
  );
};

export default Navbar;
