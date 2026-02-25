import {
  Button,
  Chip,
  DialogContent,
  DialogTitle,
  Modal,
  ModalDialog,
  Stack,
  Table,
  Link,
} from "@mui/joy";
import React, { useState } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
const TasksModal = ({ open, onClose, taskData, name, loading }) => {
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState(3);
  const [expandedRow, setExpandedRow] = useState(null);
  const [expandedRemarksRow, setExpandedRemarksRow] = useState(null);
  const [expandedProjectRow, setExpandedProjectRow] = useState(null);

  const startIndex = page * rows;
  const endIndex = startIndex + rows;
  const paginatedData = taskData.slice(startIndex, endIndex);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

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
              {paginatedData.map((task, index) => {
                const isExpanded = expandedRow === index;
                const deadline = new Date(task.deadline);
                deadline.setHours(0, 0, 0, 0);
                const isOverdue = today > deadline && task.status === "Pending";
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
                          Overdue by <br />
                          {deadline.getDay() - today.getDay()} days
                        </Chip>
                      ) : task.status === "Completed" ? (
                        <Chip variant="soft" color="success">
                          Completed
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
                      {task.remarks && task.remarks.split(/\s+/).length > 3 && (
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
                      <Button color="primary" variant="soft">
                        Edit
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </ModalDialog>
      </Modal>
    </div>
  );
};

export default TasksModal;
