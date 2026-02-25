import {
  Button,
  DialogContent,
  DialogTitle,
  FormControl,
  FormLabel,
  Modal,
  ModalClose,
  ModalDialog,
  Skeleton,
  Stack,
  Textarea,
} from "@mui/joy";
import axios from "axios";
import React, { useEffect, useState } from "react";
import Toast from "./Toast";
import { useLocation } from "react-router-dom";

const EditModal = ({ open, onClose, taskId }) => {
  const [taskData, setTaskData] = useState({});
  const [loading, setLoading] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);

  const [taskUpdates, setTaskUpdates] = useState("");
  const [remarksUpdates, setRemarksUpdates] = useState("");
  const [toastStatus, setToastStatus] = useState("");
  const [toastShow, setToastShow] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    axios.defaults.baseURL = "https://mcpl-task-management-system.vercel.app/";
    setLoading(true);
    axios
      .get(`/getTaskUpdates/${taskId}`)
      .then((res) => {
        if (res.status === 200) {
          const data = res.data;
          setTaskData(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [taskId]);

  const handleTaskUpdate = (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("taskId", taskId);
    formData.append("taskDesc", taskUpdates);
    formData.append("remarks", remarksUpdates);
    setButtonLoading(true);
    axios
      .put("/update_task_assigned", formData)
      .then((res) => {
        if (res.status === 200) {
          const data = res.data;
          setToastStatus(data.status);
          setToastMessage(data.message);
          setToastShow(true);
          setButtonLoading(false);
          window.location.reload();
        }
      })
      .catch((err) => {
        console.error(err);
        setButtonLoading(false);
        setToastStatus("error");
        setToastMessage("Something Went Wrong. Please Check The Console.");
        setToastShow(true);
      });
  };

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <ModalDialog variant="soft" color="primary">
          <ModalClose />
          <DialogTitle>Edit Task {taskId}</DialogTitle>
          <DialogContent>
            Please Update The Task Contents using below form
          </DialogContent>
          <Stack>
            {loading ? (
              <Skeleton variant="rectangular" animation="wave" />
            ) : (
              <div className="text-center justify-center items-center m-[0 auto]">
                <FormControl>
                  <FormLabel sx={{ textAlign: "justify" }}>
                    {taskData.taskDesc}
                    <br />
                    {"Remarks: " + taskData.remarks}
                  </FormLabel>
                  <Textarea
                    placeholder="Enter Task Updates"
                    onChange={(e) => setTaskUpdates(e.target.value)}
                  ></Textarea>
                </FormControl>
                <FormControl>
                  <Textarea
                    placeholder="Enter Remarks Updates"
                    onChange={(e) => setRemarksUpdates(e.target.value)}
                  ></Textarea>
                </FormControl>
                <Button
                  variant="soft"
                  color="success"
                  sx={{
                    width: "10rem",
                    my: 3,
                  }}
                  className="text-center"
                  onClick={handleTaskUpdate}
                >
                  Save
                </Button>
              </div>
            )}
          </Stack>
        </ModalDialog>
      </Modal>
      <Toast
        open={toastShow}
        message={toastMessage}
        status={toastStatus}
        onClose={() => setToastShow(false)}
      />
    </>
  );
};

export default EditModal;
