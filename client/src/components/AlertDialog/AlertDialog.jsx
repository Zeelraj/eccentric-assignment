import React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

const AlertDialog = ({
  title = "Alert dialog",
  message = "This is alert message",
  successButton = "",
  cancelButton = "Cancel",
  open = false,
  onSuccess = () => {},
  onCancel = () => {},
}) => {
  return (
    <div>
      <Dialog
        open={open}
        onClose={onCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        style={{ width: "100%" }}
      >
        <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          {cancelButton && <Button onClick={onCancel}>{cancelButton}</Button>}
          {successButton && (
            <Button onClick={onSuccess} autoFocus variant="contained">
              {successButton}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AlertDialog;
