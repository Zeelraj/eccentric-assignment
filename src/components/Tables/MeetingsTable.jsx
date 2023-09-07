import React, { useState } from "react";
import { useSelector } from "react-redux";
import { convertDateTime, notify } from "../../utils/utils";
import { INVITATION_STATUS, NOTIFICATION_TYPES } from "../../utils/constants";
import AlertDialog from "../AlertDialog/AlertDialog";
import DataServices from "../../services/DataServices";
import ScheduleMeeting from "../ScheduleMeeting/ScheduleMeeting";
import CustomModal from "../CustomModal/CustomModal";

// MUI
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";

// MUI Icons
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DoDisturbIcon from "@mui/icons-material/DoDisturb";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import useTable from "../../hooks/useTable";
import Pagination from "./Pagination";

const MeetingsTable = ({ meetings = [], fetchMeetings = () => {} }) => {
  const { currentUser } = useSelector((state) => state.auth);
  const [page, setPage] = useState(1);
  const { data, range } = useTable(meetings, page, 5);

  const [isUpdatingMeeting, setIsUpdatingMeeting] = useState(false);
  const [isUpdatingAction, setIsUpdatingAction] = useState(false);
  const [updateMeetingId, setUpdateMeetingId] = useState(false);
  const [updateMeeting, setUpdateMeeting] = useState({});

  const [cancelOpen, setCancelOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const onUpdateInvitation = async (meeting, status) => {
    const payload = { status };

    setIsUpdatingMeeting(true);
    setUpdateMeetingId(meeting?._id);
    await DataServices.updateMeetingInvitationStatus(
      meeting?._id,
      payload
    ).then((res) => {
      setIsUpdatingMeeting(false);
      setUpdateMeetingId("");
      if (res.status === 200) {
        notify(NOTIFICATION_TYPES.SUCCESS, res.body?.message);
        fetchMeetings();
      } else {
        notify(NOTIFICATION_TYPES.ERROR, res.body?.message);
      }
    });
  };

  const UpdateInvitation = ({ meeting = {} }) => {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "start",
          alignItems: "center",
        }}
      >
        {isUpdatingMeeting && updateMeetingId === meeting?._id ? (
          "Updating..."
        ) : (
          <>
            <CheckCircleOutlineIcon
              className="hover:text-green-400 mr-2 cursor-pointer"
              onClick={() =>
                onUpdateInvitation(meeting, INVITATION_STATUS.ACCEPTED)
              }
            />
            <HighlightOffIcon
              className="hover:text-red-400 ml-2 cursor-pointer"
              onClick={() =>
                onUpdateInvitation(meeting, INVITATION_STATUS.REJECT)
              }
            />
          </>
        )}
      </Box>
    );
  };

  const meetingStatus = (meeting) => {
    if (meeting?.isCancelled) {
      return <Chip label="Cancelled" className="text-gray-400" />;
    }

    if (meeting?.isGuestAccepted) {
      return <Chip label="Accepted" color="success" />;
    }

    if (meeting?.isGuestReviewed) {
      return <Chip label="Not Accepted" color="error" />;
    }

    return currentUser?._id === meeting?.guest?._id ? (
      <UpdateInvitation meeting={meeting} />
    ) : (
      <Chip label="Not Reviewed" color="secondary" />
    );
  };

  const cancelMeeting = async (meetingId) => {
    setCancelOpen(false);
    setIsUpdatingAction(true);
    await DataServices.cancelMeeting(meetingId).then((res) => {
      setIsUpdatingAction(false);
      if (res.status === 200) {
        notify(NOTIFICATION_TYPES.SUCCESS, res.body.message);
        fetchMeetings();
      } else {
        notify(NOTIFICATION_TYPES.ERROR, res.body.message);
      }
    });
  };

  const deleteMeeting = async (meetingId) => {
    setDeleteOpen(false);
    setIsUpdatingAction(true);
    await DataServices.deleteMeeting(meetingId).then((res) => {
      setIsUpdatingAction(false);
      if (res.status === 200) {
        notify(NOTIFICATION_TYPES.SUCCESS, res.body.message);
        fetchMeetings();
      } else {
        notify(NOTIFICATION_TYPES.ERROR, res.body.message);
      }
    });
  };

  const MeetingAction = ({ meeting = {} }) => {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "start",
          alignItems: "center",
        }}
      >
        {isUpdatingAction && updateMeetingId === meeting?._id ? (
          "Updating..."
        ) : (
          <>
            {!meeting?.isCancelled && (
              <EditIcon
                className="hover:text-blue-400 mr-2 cursor-pointer"
                onClick={() => {
                  setIsModalOpen(true);
                  setUpdateMeeting(meeting);
                }}
              />
            )}
            {!meeting?.isCancelled && (
              <DoDisturbIcon
                className="hover:text-red-400 mr-2 cursor-pointer"
                onClick={() => {
                  setCancelOpen(true);
                  setUpdateMeetingId(meeting?._id);
                }}
              />
            )}
            {!meeting?.isDeleted && (
              <DeleteIcon
                className="hover:text-red-400 ml-2 cursor-pointer"
                onClick={() => {
                  setDeleteOpen(true);
                  setUpdateMeetingId(meeting?._id);
                }}
              />
            )}
          </>
        )}
      </Box>
    );
  };

  return (
    <>
      <AlertDialog
        open={cancelOpen}
        setOpen={setCancelOpen}
        title="Cancel Meeting?"
        message="Are you sure you want to cancel the meeting?"
        successButton="Cancel Meeting"
        cancelButton="Keep"
        onSuccess={() => cancelMeeting(updateMeetingId)}
        onCancel={() => setCancelOpen(false)}
      />
      <AlertDialog
        open={deleteOpen}
        setOpen={setDeleteOpen}
        title="Cancel Meeting?"
        message="Are you sure you want to cancel the meeting?"
        successButton="Delete Meeting"
        cancelButton="Keep"
        onSuccess={() => deleteMeeting(updateMeetingId)}
        onCancel={() => setDeleteOpen(false)}
      />
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Id</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Agenda</TableCell>
              <TableCell>Start</TableCell>
              <TableCell>End</TableCell>
              <TableCell>Host</TableCell>
              <TableCell>Guest</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((meeting, idx) => (
              <TableRow
                key={meeting._id}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell className={meeting.isCancelled && "line-through"}>
                  {idx + 1}
                </TableCell>
                <TableCell className={meeting.isCancelled && "line-through"}>
                  {meeting?.title}
                </TableCell>
                <TableCell className={meeting.isCancelled && "line-through"}>
                  {meeting?.agenda}
                </TableCell>
                <TableCell
                  width={200}
                  className={meeting.isCancelled && "line-through"}
                >
                  {convertDateTime(meeting?.time?.start)}
                </TableCell>
                <TableCell
                  width={200}
                  className={meeting.isCancelled && "line-through"}
                >
                  {convertDateTime(meeting?.time?.end)}
                </TableCell>
                <TableCell className={meeting.isCancelled && "line-through"}>
                  {currentUser?._id === meeting?.host?._id
                    ? "You"
                    : meeting?.host?.name}
                </TableCell>
                <TableCell className={meeting.isCancelled && "line-through"}>
                  {currentUser?._id === meeting?.guest?._id
                    ? "You"
                    : meeting?.guest?.name}
                </TableCell>
                <TableCell className={meeting.isCancelled && "line-through"}>
                  {meetingStatus(meeting)}
                </TableCell>
                <TableCell className={meeting.isCancelled && "line-through"}>
                  <MeetingAction meeting={meeting} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {meetings.length > 0 && (
        <Pagination
          range={range}
          data={data}
          setPage={setPage}
          page={page}
          total={meetings.length}
          field="Meetings"
        />
      )}
      <CustomModal open={isModalOpen} setOpen={setIsModalOpen}>
        <ScheduleMeeting
          isEdit
          meeting={updateMeeting}
          closeModal={() => setIsModalOpen(false)}
          fetchMeetings={fetchMeetings}
        />
      </CustomModal>
    </>
  );
};

export default MeetingsTable;
