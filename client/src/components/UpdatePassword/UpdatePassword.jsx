import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { NOTIFICATION_TYPES, RECOVERY_QUESTIONS } from "../../utils/constants";
import {
  isJSONEmpty,
  notify,
  removeLocalStorageToken,
} from "../../utils/utils";
import AuthServices from "../../services/AuthServices";

// MUI
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";

const UpdatePassword = ({
  title = "Update Password",
  isModal = false,
  closeModal = () => {},
}) => {
  const navigate = useNavigate();

  const { currentUser } = useSelector((state) => state.auth);

  const formDataInitial = {
    email: currentUser?.email || "",
    question: currentUser?.passwordRecovery?.question || "",
    answer: "",
    password: "",
    cnfPassword: "",
  };

  const [formData, setFormData] = useState(formDataInitial);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handleOnChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      email: formData.email,
      answer: formData.answer,
      password: formData.password,
      cnfPassword: formData.cnfPassword,
    };

    setIsUpdatingPassword(true);
    await AuthServices.passwordReset(payload).then((res) => {
      setIsUpdatingPassword(false);
      if (res.status === 200) {
        notify(NOTIFICATION_TYPES.SUCCESS, res.body?.message);
        removeLocalStorageToken();
        navigate("/");
        window.location.reload();
      } else {
        notify(NOTIFICATION_TYPES.ERROR, res.body.message);
      }
    });
  };

  return (
    <Container component="div" maxWidth={false} className="my-4">
      <Typography variant="h3">{title}</Typography>
      <Box component="form" onSubmit={onSubmit} sx={{ mt: 1 }}>
        {/* Email Address */}
        <TextField
          name="email"
          id="email"
          margin="normal"
          required
          fullWidth
          label="Email Address"
          disabled={!isJSONEmpty(currentUser)}
          value={formData?.email}
          onChange={handleOnChange}
        />
        {/* Password */}
        <TextField
          name="password"
          margin="normal"
          required
          fullWidth
          label="Password"
          type="password"
          id="password"
          onChange={handleOnChange}
        />
        {/* Confirm Password */}
        <TextField
          name="cnfPassword"
          margin="normal"
          required
          fullWidth
          label="Confirm Password"
          type="password"
          id="cnfPassword"
          onChange={handleOnChange}
        />
        {/* Select Password Recovery Question */}
        <FormControl fullWidth margin="normal">
          <InputLabel id="question">Password Recovery Question</InputLabel>
          <Select
            name="question"
            id="question"
            labelId="question"
            label="Password Recovery Question"
            disabled={!isJSONEmpty(currentUser)}
            value={formData.question}
            onChange={handleOnChange}
          >
            {RECOVERY_QUESTIONS.map((question) => (
              <MenuItem key={question.id} value={question.id}>
                {question.question}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {/* Password Recovery Answer */}
        <TextField
          name="answer"
          id="answer"
          margin="normal"
          required
          fullWidth
          disabled={!formData.question}
          label="Recovery Answer"
          onChange={handleOnChange}
        />
        {/* Update Password Button */}
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          disabled={isUpdatingPassword}
        >
          {isUpdatingPassword ? "Updating Password" : "Update Password"}
        </Button>
        {/* Close Button */}
        {isModal && (
          <Button
            fullWidth
            variant="outlined"
            sx={{ mb: 2 }}
            disabled={isUpdatingPassword}
            onClick={closeModal}
          >
            Close
          </Button>
        )}
      </Box>
    </Container>
  );
};

export default UpdatePassword;
