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

const BlockedTimeBlock = ({ blockedTimeSlot }) => {
  return (
    <Container
      maxWidth={false}
      component="div"
      style={{
        height: "100%",
        backgroundColor: "gray",
        color: "white",
      }}
    >
      <Typography component="p">
        {`${getTime(blockedTimeSlot?.time?.start)} - ${getTime(
          blockedTimeSlot?.time?.end
        )}: ${blockedTimeSlot?.title}`}
      </Typography>
    </Container>
  );
};

export default BlockedTimeBlock;
