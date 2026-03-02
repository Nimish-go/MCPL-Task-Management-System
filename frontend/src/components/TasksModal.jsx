import {
  Button,
  Chip,
  DialogTitle,
  Modal,
  ModalDialog,
  Table,
  Link,
  Box,
  Typography,
  Select,
  Option,
  Skeleton,
} from "@mui/joy";
import React, { useEffect, useState } from "react";
import EditModal from "./EditModal";
const TasksModal = ({ open, onClose, taskData, name, loading }) => {
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState(3);
  const [expandedRow, setExpandedRow] = useState(null);
  const [expandedRemarksRow, setExpandedRemarksRow] = useState(null);
  const [expandedProjectRow, setExpandedProjectRow] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [taskId, setTaskId] = useState(null);

  const startIndex = page * rows;
  const endIndex = startIndex + rows;
  const paginatedData = taskData.slice(startIndex, endIndex);
  const totalPages = Math.ceil(taskData.length / rows);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  useEffect(() => {
    setPage(0);
    setExpandedRow(null);
    setExpandedRemarksRow(null);
    setExpandedProjectRow(null);
  }, [name]);

  const handleEditModal = (id) => {
    setOpenModal(true);
    setTaskId(id);
  };

  const getProjectCodeOnly = (text) => {
    if (!text) return "";
    return text.split(":")[0].trim();
  };

  const getShortDescription = (desc) => {
    if (!desc.includes("Task Assigned: ")) return desc;

    const afterText = desc.split("Task Assigned: ")[1].trim();
    const words = afterText.split(" ");
    return words.slice(0, 3).join(" ");
  };

  const getFirstThreeWords = (text) => {
    if (!text) return "";

    const words = text.trim().split(/\s+/);
    return words.length > 3 ? words.slice(0, 3).join(" ") + "..." : text;
  };

  return (
    <div>
      <Modal open={open} onClose={onClose}>
        <ModalDialog variant="solid" color="primary">
          <DialogTitle>
            {sessionStorage.getItem("empName") === name
              ? `Tasks Assigned To Yourself`
              : `${name}'s Task Assigned By You`}
          </DialogTitle>
          {/* /**   tasks = [{ "id": row[0], "taskDesc" : row[1], "projectDetails" : row[2] + " : "+row[3], "remarks" : row[4],
           * "deadline" : row[5], "dateOfEntry" : row[6], "status" : row[7] } for row in cursor.fetchall()] */}
          <Table
            sx={{ tableLayout: "fixed", width: "100%" }}
            borderAxis="bothBetween"
            variant="soft"
          >
            <thead>
              <tr>
                <th>Sr. No</th>
                <th>Task ID</th>
                <th>Assigned On</th>
                <th>Project Details</th>
                <th>Task Desc</th>
                <th>Task Status</th>
                <th>Deadline</th>
                <th>Remarks</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: rows }).map((_, index) => (
                  <tr key={index}>
                    {Array.from({ length: 9 }).map((_, i) => (
                      <td key={i}>
                        <Skeleton
                          variant="rectangular"
                          animation="wave"
                          sx={{
                            height: 20,
                            width: "100%",
                            borderRadius: "6px",
                          }}
                        />
                      </td>
                    ))}
                  </tr>
                ))
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    style={{ textAlign: "center", padding: "20px" }}
                  >
                    No Tasks Found
                  </td>
                </tr>
              ) : (
                paginatedData.map((task, index) => {
                  const isExpanded = expandedRow === index;
                  const deadline = new Date(task.deadline);
                  deadline.setHours(0, 0, 0, 0);
                  const isOverdue = task.isOverdue;
                  return (
                    <tr>
                      <td>{index + startIndex + 1}</td>
                      <td>{task.id}</td>
                      <td>{task.dateOfEntry}</td>
                      <td>
                        {expandedProjectRow === index
                          ? task.projectDetails
                          : getProjectCodeOnly(task.projectDetails)}{" "}
                        {task.projectDetails?.includes(":") && (
                          <Link
                            component="button"
                            underline="hover"
                            color="primary"
                            sx={{ ml: 1, fontSize: "sm" }}
                            onClick={() =>
                              setExpandedProjectRow(
                                expandedProjectRow === index ? null : index,
                              )
                            }
                          >
                            {expandedProjectRow === index
                              ? "Show Less"
                              : "Read More"}
                          </Link>
                        )}
                      </td>
                      <td>
                        {isExpanded
                          ? task.taskDesc
                          : getShortDescription(task.taskDesc)}{" "}
                        {task.taskDesc.includes("Task Assigned:") && (
                          <Link
                            component="button"
                            underline="hover"
                            variant="soft"
                            color="primary"
                            sx={{ ml: 1, fontSize: "sm" }}
                            onClick={() =>
                              setExpandedRow(isExpanded ? null : index)
                            }
                          >
                            {isExpanded ? "Show Less" : "Read More"}
                          </Link>
                        )}
                      </td>
                      <td>
                        {isOverdue ? (
                          <Chip variant="solid" color="danger">
                            Overdue
                          </Chip>
                        ) : task.status === "Cleared" ? (
                          <Chip variant="soft" color="success">
                            Cleared
                          </Chip>
                        ) : task.status === "Pending" ? (
                          <Chip variant="soft" color="warning">
                            Pending
                          </Chip>
                        ) : task.status === "Reloaded" ? (
                          <Chip variant="soft" color="danger">
                            Reloaded
                          </Chip>
                        ) : null}
                      </td>
                      <td>{task.deadline}</td>
                      <td>
                        {expandedRemarksRow === index
                          ? task.remarks
                          : getFirstThreeWords(task.remarks)}{" "}
                        {task.remarks &&
                          task.remarks.split(/\s+/).length > 3 && (
                            <Link
                              component="button"
                              underline="hover"
                              color="primary"
                              sx={{ ml: 1, fontSize: "sm" }}
                              onClick={() =>
                                setExpandedRemarksRow(
                                  expandedRemarksRow === index ? null : index,
                                )
                              }
                            >
                              {expandedRemarksRow === index
                                ? "Show Less"
                                : "Read More"}
                            </Link>
                          )}
                      </td>
                      <td>
                        <Button
                          color="primary"
                          variant="soft"
                          onClick={() => handleEditModal(task.id)}
                        >
                          Edit
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mt: 2,
              p: 1.5,
              borderRadius: "md",
              backgroundColor: "background.level1",
            }}
          >
            {/* Rows Per Page */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography level="body-sm">Rows per page:</Typography>
              <Select
                size="sm"
                value={rows}
                onChange={(e, newValue) => {
                  setRows(newValue);
                  setPage(0);
                }}
                sx={{ width: 80 }}
              >
                <Option value={3} selected>
                  3
                </Option>
                <Option value={5}>5</Option>
                <Option value={6}>6</Option>
              </Select>
            </Box>

            {/* Page Controls */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Button
                size="sm"
                variant="outlined"
                disabled={page === 0}
                onClick={() => setPage((prev) => prev - 1)}
              >
                Prev
              </Button>

              <Typography level="body-sm">
                Page {page + 1} of {totalPages}
              </Typography>

              <Button
                size="sm"
                variant="outlined"
                disabled={page + 1 >= totalPages}
                onClick={() => setPage((prev) => prev + 1)}
              >
                Next
              </Button>
            </Box>
          </Box>
        </ModalDialog>
      </Modal>
      <EditModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        taskId={taskId}
        type="underReview"
      />
    </div>
  );
};

export default TasksModal;
