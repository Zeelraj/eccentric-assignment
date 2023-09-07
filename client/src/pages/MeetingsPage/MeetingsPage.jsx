import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import DataServices from "../../services/DataServices";
import { notify } from "../../utils/utils";
import { NOTIFICATION_TYPES } from "../../utils/constants";
import MeetingsTable from "../../components/Tables/MeetingsTable";
import CustomModal from "../../components/CustomModal/CustomModal";
import ScheduleMeeting from "../../components/ScheduleMeeting/ScheduleMeeting";

// MUI
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Switch from "@mui/material/Switch";

const MeetingsPage = () => {
  const { currentUser } = useSelector((state) => state.auth);

  const [meetings, setMeetings] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAllMeetings, setIsAllMeetings] = useState(false);

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

        return !meeting.isDeleted && !meeting.isCancelled;
      })
      .reverse();
  };

  return (
    <>
      <Container component="div" maxWidth={false} className="my-4">
        <Box
          component="div"
          className="flex flex-col md:flex-row justify-between items-start md:items-center"
        >
          <Typography variant="h3">Meetings</Typography>
          {/* Schedule Meeting Option */}
          <Button variant="outlined" onClick={() => setIsModalOpen(true)}>
            Schedule Meeting
          </Button>
        </Box>
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
            defaultChecked={!isAllMeetings}
            value={isAllMeetings}
            onChange={() => setIsAllMeetings((prev) => !prev)}
          />
          Active Meetings
        </Box>
        <Box sx={{ m: 2 }}>
          {isFetching && <Typography variant="h5">Loading...</Typography>}
          {!isFetching &&
            (finalMeetings().length > 0 ? (
              <MeetingsTable
                meetings={finalMeetings()}
                fetchMeetings={fetchMeetings}
              />
            ) : (
              <Typography variant="h5">No meetings found!!</Typography>
            ))}
        </Box>
      </Container>
      <CustomModal open={isModalOpen} setOpen={setIsModalOpen}>
        <ScheduleMeeting
          closeModal={() => setIsModalOpen(false)}
          fetchMeetings={fetchMeetings}
        />
      </CustomModal>
    </>
  );
};

export default MeetingsPage;
