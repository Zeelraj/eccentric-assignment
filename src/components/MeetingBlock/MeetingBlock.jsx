import React from "react";

// MUI
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { padTo2Digits } from "../../utils/utils";

const getTime = (d = "") => {
  const date = new Date(d);
  const notation = date.getHours() > 12 ? "PM" : "AM";

  const hours = date.getHours() % 12;

  return `${padTo2Digits(hours)}:${padTo2Digits(
    date.getMinutes()
  )} ${notation}`;
};

const MeetingBlock = ({ meeting, onDoubleClick = () => {} }) => {
  return (
    <Container
      maxWidth={false}
      component="div"
      onDoubleClick={onDoubleClick}
      style={{
        height: "100%",
        backgroundColor: meeting?.isCancelled
          ? "gray"
          : meeting?.isGuestAccepted
          ? "green"
          : meeting?.isGuestReviewed
          ? "red"
          : "purple",
        color: "white",
        cursor: "pointer",
      }}
    >
      <Typography
        component="p"
        className={`${meeting?.isCancelled && "line-through"}`}
      >
        {`${getTime(meeting?.time?.start)} - ${getTime(meeting?.time?.end)}: ${
          meeting?.title
        }`}
      </Typography>
      <Typography
        component="p"
        className={`${meeting?.isCancelled && "line-through"}`}
      >
        {meeting?.agenda}
      </Typography>
    </Container>
  );
};

export default MeetingBlock;
