import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import CustomModal from "../../components/CustomModal/CustomModal";
import UpdatePassword from "../../components/UpdatePassword/UpdatePassword";
import DataServices from "../../services/DataServices";
import { areObjectsEqual, notify } from "../../utils/utils";
import { NOTIFICATION_TYPES, TIME_HOURS } from "../../utils/constants";
import { setCurrentUser } from "../../features/auth/authSlice";

// MUI
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";

const getTimeSlotsIndexes = (timeSlots) => {
  const idxs = [];

  TIME_HOURS.forEach((time, idx) => {
    timeSlots.forEach((_time) => {
      if (areObjectsEqual(time?.time, _time?.time)) {
        idxs.push(idx);
      }
    });
  });

  return idxs;
};

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.auth);

  const formDataInitial = {
    name: currentUser?.name || "",
    blockedTimeSlots: getTimeSlotsIndexes(currentUser?.blockedTimeSlots) || [],
  };

  const [formData, setFormData] = useState(formDataInitial);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateProfile, setIsUpdateProfile] = useState(false);

  const handleOnChange = (e) => {
    if (e.target.name === "blockedTimeSlots") {
      const _blockedTimeSlots = formData.blockedTimeSlots;
      const value = Number(e.target.value);

      if (_blockedTimeSlots.includes(value)) {
        const idx = _blockedTimeSlots.indexOf(Number(value));
        _blockedTimeSlots.splice(idx, 1);
        setFormData({
          ...formData,
          [e.target.name]: [..._blockedTimeSlots],
        });
      } else {
        setFormData({
          ...formData,
          [e.target.name]: [..._blockedTimeSlots, value],
        });
      }

      return;
    }

    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    const offHours = formData.blockedTimeSlots.map((time) => {
      return {
        time: TIME_HOURS[time].time,
      };
    });

    const payload = {
      name: formData.name,
      blockedTimeSlots: offHours,
    };

    setIsUpdateProfile(true);
    await DataServices.updateUserDetails(payload).then((res) => {
      setIsUpdateProfile(false);
      if (res.status === 200) {
        notify(NOTIFICATION_TYPES.SUCCESS, res.body?.message);
        dispatch(
          setCurrentUser({
            body: res.body,
          })
        );
      } else {
        notify(NOTIFICATION_TYPES.ERROR, res.body?.message);
      }
    });
  };

  return (
    <>
      <Container component="div" maxWidth={false} className="my-4">
        <Typography variant="h3">Profile</Typography>
        <Box component="form" onSubmit={onSubmit} sx={{ mt: 1 }}>
          {/* Name */}
          <TextField
            name="name"
            id="name"
            margin="normal"
            required
            fullWidth
            label="Name"
            value={formData.name}
            onChange={handleOnChange}
          />
          {/* Email Address */}
          <TextField
            name="email"
            id="email"
            margin="normal"
            required
            fullWidth
            label="Email Address"
            disabled
            value={currentUser?.email}
          />
          {/* Off Hours */}
          <Container component="div" maxWidth={false} className="my-2">
            <Typography style={{ fontSize: 20 }}>Off Hours</Typography>
            <Box sx={{ display: "flex" }}>
              <Box component="div" className="flex flex-col md:flex-row">
                {/* 0-6 */}
                <FormControl component="fieldset" variant="standard">
                  <FormGroup>
                    {TIME_HOURS.slice(0, 6).map((hour, idx) => (
                      <FormControlLabel
                        key={idx}
                        control={
                          <Checkbox
                            checked={formData.blockedTimeSlots.includes(idx)}
                            name="blockedTimeSlots"
                            value={idx}
                            onChange={handleOnChange}
                          />
                        }
                        className="mt-4 md:mt-2"
                        label={`${hour.display.start} - ${hour.display.end}`}
                      />
                    ))}
                  </FormGroup>
                </FormControl>
                {/* 6-12 */}
                <FormControl component="fieldset" variant="standard">
                  <FormGroup>
                    {TIME_HOURS.slice(6, 12).map((hour, idx) => (
                      <FormControlLabel
                        key={idx}
                        control={
                          <Checkbox
                            checked={formData.blockedTimeSlots.includes(
                              idx + 6
                            )}
                            name="blockedTimeSlots"
                            value={idx + 6}
                            onChange={handleOnChange}
                          />
                        }
                        className="mt-4 md:mt-2"
                        label={`${hour.display.start} - ${hour.display.end}`}
                      />
                    ))}
                  </FormGroup>
                </FormControl>
              </Box>
              <Box component="div" className="flex flex-col md:flex-row">
                {/* 12-18 */}
                <FormControl component="fieldset" variant="standard">
                  <FormGroup>
                    {TIME_HOURS.slice(12, 18).map((hour, idx) => (
                      <FormControlLabel
                        key={idx}
                        control={
                          <Checkbox
                            checked={formData.blockedTimeSlots.includes(
                              idx + 12
                            )}
                            name="blockedTimeSlots"
                            value={idx + 12}
                            onChange={handleOnChange}
                          />
                        }
                        className="mt-4 md:mt-2"
                        label={`${hour.display.start} - ${hour.display.end}`}
                      />
                    ))}
                  </FormGroup>
                </FormControl>
                {/* 18-24 */}
                <FormControl component="fieldset" variant="standard">
                  <FormGroup>
                    {TIME_HOURS.slice(18, 24).map((hour, idx) => (
                      <FormControlLabel
                        key={idx}
                        control={
                          <Checkbox
                            checked={formData.blockedTimeSlots.includes(
                              idx + 18
                            )}
                            name="blockedTimeSlots"
                            value={idx + 18}
                            onChange={handleOnChange}
                          />
                        }
                        className="mt-4 md:mt-2"
                        label={`${hour.display.start} - ${hour.display.end}`}
                      />
                    ))}
                  </FormGroup>
                </FormControl>
              </Box>
            </Box>
          </Container>
          {/* Update Password Option */}
          <Button
            fullWidth
            variant="outlined"
            sx={{ mt: 3 }}
            onClick={() => setIsModalOpen(true)}
          >
            Update Password
          </Button>
          {/* Update Profile Button */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={isUpdateProfile}
          >
            {isUpdateProfile ? "Updating Profile" : "Update Profile"}
          </Button>
        </Box>
      </Container>
      <CustomModal open={isModalOpen} setOpen={setIsModalOpen}>
        <UpdatePassword isModal closeModal={() => setIsModalOpen(false)} />
      </CustomModal>
    </>
  );
};

export default ProfilePage;
