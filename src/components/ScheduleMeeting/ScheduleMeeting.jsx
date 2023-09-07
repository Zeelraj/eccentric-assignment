import React, { useEffect, useState } from "react";
import DataServices from "../../services/DataServices";
import { compareDates, notify, padTo2Digits } from "../../utils/utils";
import { NOTIFICATION_TYPES } from "../../utils/constants";

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
import dayjs from "dayjs";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { useSelector } from "react-redux";

const getDateInFormat = (d = "") => {
  const date = new Date(d);

  const day = `${padTo2Digits(date.getFullYear())}-${padTo2Digits(
    date.getMonth() + 1
  )}-${padTo2Digits(date.getDate())}`;
  const time = `${padTo2Digits(date.getHours())}:${padTo2Digits(
    date.getMinutes()
  )}`;

  return `${day}T${time}`;
};

const ScheduleMeeting = ({
  title = "Schedule Meeting",
  meeting = {},
  isEdit = false,
  closeModal = () => {},
  fetchMeetings = () => {},
}) => {
  const { currentUser } = useSelector((state) => state.auth);
  const [users, setUsers] = useState([]);
  const [isFetchingUsers, setIsFetchingUsers] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);

  const formDataInitial = {
    title: meeting?.title || "",
    agenda: meeting?.agenda || "",
    start: meeting?.time?.start || new Date(),
    end: meeting?.time?.end || new Date().getTime() + 60 * 60 * 1000,
    guest: meeting?.guest?._id || "",
  };

  const [formData, setFormData] = useState(formDataInitial);

  const fetchUsers = async (isLoading = false) => {
    setIsFetchingUsers(isLoading);
    await DataServices.getAllUsers().then((res) => {
      setIsFetchingUsers(false);
      if (res.status === 200) {
        setUsers(res.body.users);
      } else {
        notify(NOTIFICATION_TYPES.ERROR, res.body.message);
      }
    });
  };

  useEffect(() => {
    fetchUsers(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOnChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!formData.title) {
      notify(NOTIFICATION_TYPES.ERROR, "Please, provide meeting title");
      return false;
    }

    if (!formData.agenda) {
      notify(NOTIFICATION_TYPES.ERROR, "Please, provide meeting agenda");
      return false;
    }

    if (!formData.start) {
      notify(NOTIFICATION_TYPES.ERROR, "Please, select meeting start time");
      return false;
    }

    if (!formData.end) {
      notify(NOTIFICATION_TYPES.ERROR, "Please, select meeting end time");
      return false;
    }

    if (compareDates(formData.start, new Date()) < 0) {
      notify(
        NOTIFICATION_TYPES.ERROR,
        "Meeting cannot be set in the past time"
      );
      return false;
    }

    if (compareDates(formData.start, formData.end) >= 0) {
      notify(NOTIFICATION_TYPES.ERROR, "Meeting cannot end before start time");
      return false;
    }

    if (!isEdit) {
      if (!formData.guest) {
        notify(NOTIFICATION_TYPES.ERROR, "Please, select meeting guest");
        return false;
      }
    }

    return true;
  };

  const onScheduleMeeting = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const payload = {
      title: formData.title,
      agenda: formData.agenda,
      time: {
        start: getDateInFormat(formData.start),
        end: getDateInFormat(formData.end),
      },
      guest: formData.guest,
    };

    setIsScheduling(true);
    await DataServices.createMeeting(payload).then((res) => {
      setIsScheduling(false);
      if (res.status === 200) {
        notify(NOTIFICATION_TYPES.SUCCESS, res.body.message);
        closeModal();
        fetchMeetings();
      } else {
        notify(NOTIFICATION_TYPES.ERROR, res.body.message);
      }
    });
  };

  const onEditMeeting = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const payload = {
      title: formData.title,
      agenda: formData.agenda,
      time: {
        start: getDateInFormat(formData.start),
        end: getDateInFormat(formData.end),
      },
    };

    setIsScheduling(true);
    await DataServices.updateMeeting(meeting?._id, payload).then((res) => {
      setIsScheduling(false);
      if (res.status === 200) {
        notify(NOTIFICATION_TYPES.SUCCESS, res.body.message);
        closeModal();
        fetchMeetings();
      } else {
        notify(NOTIFICATION_TYPES.ERROR, res.body.message);
      }
    });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DemoContainer components={["DateTimePicker", "DateTimePicker"]}>
        <Container component="div" maxWidth={false} className="my-4 w-screen">
          <Typography variant="h3">{title}</Typography>
          <Box
            component="form"
            onSubmit={isEdit ? onEditMeeting : onScheduleMeeting}
            sx={{ mt: 1 }}
          >
            {/* Title */}
            <TextField
              name="title"
              id="title"
              margin="normal"
              label="Meeting Title"
              required
              fullWidth
              value={formData.title}
              onChange={handleOnChange}
            />
            {/* Agenda */}
            <TextField
              name="agenda"
              id="agenda"
              margin="normal"
              label="Meeting Agenda"
              required
              fullWidth
              value={formData.agenda}
              onChange={handleOnChange}
            />
            {/* Start Date and Time */}
            <Box sx={{ mt: 2 }}>
              <DateTimePicker
                label="Meeting Start Time"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    name: "start",
                  },
                }}
                minDateTime={dayjs(new Date())}
                value={dayjs(formData.start)}
                onChange={(value) => {
                  setFormData({ ...formData, start: value });
                }}
              />
            </Box>
            {/* End Date and Time */}
            <Box sx={{ mt: 2 }}>
              <DateTimePicker
                label="Meeting End Time"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    name: "end",
                  },
                }}
                // minDate={formData.start}
                value={dayjs(formData.end)}
                onChange={(value) => {
                  setFormData({ ...formData, end: value });
                }}
              />
            </Box>
            {/* Select Guest */}
            <FormControl fullWidth margin="normal">
              <InputLabel id="guest">Guest</InputLabel>
              <Select
                name="guest"
                id="guest"
                labelId="guest"
                label="Guest"
                required
                disabled={isEdit}
                value={formData.guest}
                onChange={handleOnChange}
              >
                {isFetchingUsers ? (
                  <MenuItem disabled value="">
                    Fetching...
                  </MenuItem>
                ) : (
                  users
                    .filter((user) => user?._id !== currentUser?._id)
                    .map((user) => (
                      <MenuItem key={user?._id} value={user?._id}>
                        {user?.name}
                      </MenuItem>
                    ))
                )}
              </Select>
            </FormControl>
            {/* Schedule/Update Meeting Button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={meeting?.isCancelled || isScheduling}
            >
              {meeting?.isCancelled
                ? "Meeting Cancelled"
                : isScheduling
                ? isEdit
                  ? "Updating Meeting..."
                  : "Scheduling Meeting..."
                : isEdit
                ? "Update Meeting"
                : "Schedule Meeting"}
            </Button>
            {/* Close Button */}
            <Button
              fullWidth
              variant="outlined"
              sx={{ mb: 2 }}
              disabled={isScheduling}
              onClick={closeModal}
            >
              Close
            </Button>
          </Box>
        </Container>
      </DemoContainer>
    </LocalizationProvider>
  );
};

export default ScheduleMeeting;
