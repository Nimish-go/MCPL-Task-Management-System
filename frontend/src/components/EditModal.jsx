import {
  Button,
  Chip,
  DialogContent,
  DialogTitle,
  FormControl,
  FormLabel,
  Modal,
  ModalClose,
  ModalDialog,
  Option,
  Select,
  Skeleton,
  Stack,
  Textarea,
} from "@mui/joy";
import axios from "axios";
import React, { useEffect, useState } from "react";
import Toast from "./Toast";
import { useLocation } from "react-router-dom";

const EditModal = ({ open, onClose, taskId, type }) => {
  const [taskData, setTaskData] = useState({});
  const [loading, setLoading] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);

  const [taskUpdates, setTaskUpdates] = useState("");
  const [remarksUpdates, setRemarksUpdates] = useState("");
  const [toastStatus, setToastStatus] = useState("");
  const [toastShow, setToastShow] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [statusUpdates, setStatusUpdates] = useState("");

  useEffect(() => {
    axios.defaults.baseURL = "https://mcpl-task-management-system.vercel.app/";
    if (!open || !taskId) return;
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
  }, [taskId, open]);

  const handleTasksUnderReviewUpdate = (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("id", taskId);
    formData.append("taskDescUpdates", taskUpdates);
    formData.append("remarksUpdates", remarksUpdates);
    formData.append("status", statusUpdates);
    formData.append("editedBy", sessionStorage.getItem("empName"));
    setButtonLoading(true);
    axios
      .put("/update_tasks_under_review", formData)
      .then((res) => {
        if (res.status === 200) {
          const data = res.data;
          setToastStatus(data.status);
          setToastMessage(data.message);
          setToastShow(true);
        }
      })
      .catch((err) => {
        console.error(err);
        setToastStatus("error");
        setToastMessage("Something Went Wrong. Please Check the Console.");
        setToastShow(true);
      });
  };

  const handleTaskUpdate = (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("taskId", taskId);
    formData.append("taskDesc", taskUpdates);
    formData.append("remarks", remarksUpdates);
    formData.append("editedBy", sessionStorage.getItem("empName"));
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
          {type === "assigned" ? (
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
          ) : type === "underReview" ? (
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
                  <FormControl>
                    <FormLabel>Update Status of Task#{taskId}</FormLabel>
                    <Select
                      color="primary"
                      variant="outlined"
                      onChange={(e, newVal) => setStatusUpdates(newVal)}
                      placeholder="Update Task Status"
                    >
                      <Option value="Pending">
                        <Chip color="warning" size="md" variant="soft">
                          Pending
                        </Chip>
                      </Option>
                      <Option value="Reloaded">
                        <Chip color="danger" size="md" variant="soft">
                          Reloaded
                        </Chip>
                      </Option>
                      <Option value="Cleared">
                        <Chip color="success" size="md" variant="soft">
                          Cleared
                        </Chip>
                      </Option>
                    </Select>
                  </FormControl>
                  <Button
                    variant="soft"
                    color="success"
                    sx={{
                      width: "10rem",
                      my: 3,
                    }}
                    className="text-center"
                    onClick={handleTasksUnderReviewUpdate}
                  >
                    Save
                  </Button>
                </div>
              )}
            </Stack>
          ) : (
            <></>
          )}
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
