import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import DataServices from "../../services/DataServices";
import { notify, padTo2Digits } from "../../utils/utils";
import { NOTIFICATION_TYPES } from "../../utils/constants";
import MeetingBlock from "../../components/MeetingBlock/MeetingBlock";
import ScheduleMeeting from "../../components/ScheduleMeeting/ScheduleMeeting";
import CustomModal from "../../components/CustomModal/CustomModal";

// MUI
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Switch from "@mui/material/Switch";

// Calender
import format from "date-fns/format";
import getDay from "date-fns/getDay";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import BlockedTimeBlock from "../../components/BlockedTimeBlock/BlockedTimeBlock";

const locales = {
  "en-US": require("date-fns/locale/en-US"),
};
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const getTimeInFormat = (time = "") => {
  const date = new Date();

  const day = `${padTo2Digits(date.getFullYear())}-${padTo2Digits(
    date.getMonth() + 1
  )}-${padTo2Digits(date.getDate())}`;

  return `${day}T${time}`;
};

const HomePage = () => {
  const { currentUser } = useSelector((state) => state.auth);

  const [meetings, setMeetings] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isAllMeetings, setIsAllMeetings] = useState(false);
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [meeting, setMeeting] = useState({});

  const fetchMeetings = async (isLoading = false) => {
    setIsFetching(isLoading);
    await DataServices.getAllMeetings(currentUser?._id).then((res) => {
      setIsFetching(false);
      if (res.status === 200) {
        setMeetings(res.body?.meetings);
      } else {
        notify(NOTIFICATION_TYPES.ERROR, res.body?.message);
      }
    });
  };

  useEffect(() => {
    fetchMeetings(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finalMeetings = () => {
    return meetings
      .filter((meeting) => {
        if (isAllMeetings) {
          return !meeting.isDeleted;
        }

        return (
          !meeting.isDeleted &&
          !meeting.isCancelled &&
          (meeting.isGuestAccepted || !meeting?.isGuestReviewed)
        );
      })
      .map((meeting) => {
        return {
          start: new Date(meeting?.time?.start),
          end: new Date(meeting?.time?.end),
          data: { meeting },
        };
      });
  };

  const blockedTimeSlots = () => {
    return currentUser?.blockedTimeSlots?.map((time) => {
      return {
        start: new Date(getTimeInFormat(time?.time?.start)),
        end: new Date(getTimeInFormat(time?.time?.end)),
        data: {
          blockedTimeSlot: {
            title: "Off Hour",
            time: {
              start: getTimeInFormat(time?.time?.start),
              end: getTimeInFormat(time?.time?.end),
            },
          },
        },
      };
    });
  };

  const components = {
    event: ({ event }) => {
      const data = event?.data;

      if (data?.meeting) {
        return (
          <MeetingBlock
            meeting={data?.meeting}
            onDoubleClick={() => {
              setOpen(true);
              setIsEdit(true);
              setMeeting(data?.meeting);
            }}
          />
        );
      }

      if (data?.blockedTimeSlot) {
        return <BlockedTimeBlock blockedTimeSlot={data?.blockedTimeSlot} />;
      }

      return null;
    },
  };

  return (
    <>
      <Container
        maxWidth={false}
        component="div"
        className="my-4"
        style={{ height: "100%" }}
      >
        <Typography component="p" variant="h4">
          Welcome, {currentUser?.name || "John Doe"}
        </Typography>
        <Box sx={{ mt: 2 }}>
          {isFetching ? (
            <Typography variant="h5">Loading...</Typography>
          ) : (
            <>
              {/* Meeting toggle */}
              <Box
                sx={{
                  m: 2,
                  display: "flex",
                  justifyContent: "end",
                  alignItems: "center",
                }}
              >
                All Meetings
                <Switch
                  checked={!isAllMeetings}
                  value={isAllMeetings}
                  onChange={() => setIsAllMeetings((prev) => !prev)}
                />
                Active Meetings
              </Box>
              {/* Calendar */}
              <Calendar
                onSelectSlot={({ start, end }) => {
                  setOpen(true);
                  setMeeting({
                    time: { start, end },
                  });
                }}
                localizer={localizer}
                events={[...finalMeetings(), ...blockedTimeSlots()]}
                components={components}
                defaultView={"week"}
                startAccessor="start"
                endAccessor="end"
                selectable
                style={{ height: 500 }}
                step={60}
                timeslots={1}
              />
            </>
          )}
        </Box>
      </Container>
      <CustomModal open={open} setOpen={setOpen}>
        <ScheduleMeeting
          isEdit={isEdit}
          meeting={meeting}
          closeModal={() => {
            setOpen(false);
            setIsEdit(false);
          }}
          fetchMeetings={fetchMeetings}
        />
      </CustomModal>
    </>
  );
};

export default HomePage;
