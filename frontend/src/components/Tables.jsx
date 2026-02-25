import {
  Badge,
  Box,
  Button,
  Chip,
  Link,
  Option,
  Select,
  Skeleton,
  Table,
  Textarea,
  Typography,
} from "@mui/joy";
import React, { useState } from "react";
import EditModal from "./EditModal";
import axios from "axios";

const Tables = ({ type, tableData, loading = true }) => {
  const [expandedRow, setExpandedRow] = useState(null);
  const [taskId, setTaskId] = useState(0);
  const [editModal, setEditModal] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [expandedRemarksRow, setExpandedRemarksRow] = useState(null);

  const [page, setPage] = useState(0);
  const [rows, setRows] = useState(3);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startIndex = page * rows;
  const endIndex = startIndex + rows;
  const paginatedData = tableData.slice(startIndex, endIndex);

  const totalPages = Math.ceil(tableData.length / rows);

  const formatDateOfEntry = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
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
    <div className="table">
      {type === "assigned" ? (
        <>
          <Table
            variant="soft"
            borderAxis="bothBetween"
            sx={{ tableLayout: "fixed", width: "100%" }}
          >
            <thead>
              <tr>
                <th className="w-7">Sr.No</th>
                <th className="w-8">Task Id</th>
                <th className="w-10">Assigned Date</th>
                <th className="w-11">Assigned By</th>
                <th className="w-18">Task Description</th>
                <th className="w-15">Status</th>
                <th className="w-11">Deadline</th>
                <th className="w-15">Remarks</th>
                <th className="w-11">Actions</th>
              </tr>
            </thead>
            <tbody>
              {console.log(paginatedData)}
              {loading ? (
                Array.from({ length: rows }).map((_, index) => (
                  <tr key={index} style={{ height: "55px" }}>
                    <td>
                      <Skeleton
                        variant="text"
                        level="body-md"
                        animation="wave"
                      />
                    </td>
                    <td>
                      <Skeleton
                        variant="text"
                        level="body-md"
                        animation="wave"
                      />
                    </td>
                    <td>
                      <Skeleton
                        variant="text"
                        level="body-md"
                        animation="wave"
                      />
                    </td>
                    <td>
                      <Skeleton
                        variant="text"
                        level="body-md"
                        animation="wave"
                      />
                    </td>
                    <td>
                      <Skeleton
                        variant="text"
                        level="body-md"
                        animation="wave"
                      />
                      <Skeleton
                        variant="text"
                        level="body-sm"
                        width="60%"
                        animation="wave"
                      />
                    </td>
                    <td>
                      <Skeleton
                        variant="rectangular"
                        width={80}
                        height={24}
                        animation="wave"
                      />
                    </td>
                    <td>
                      <Skeleton
                        variant="text"
                        level="body-md"
                        animation="wave"
                      />
                    </td>
                    <td>
                      <Skeleton
                        variant="text"
                        level="body-md"
                        animation="wave"
                      />
                    </td>
                    <td>
                      <Skeleton
                        variant="rectangular"
                        width={60}
                        height={24}
                        animation="wave"
                      />
                    </td>
                  </tr>
                ))
              ) : !paginatedData || paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <Box
                      sx={{
                        textAlign: "center",
                        py: 4,
                        color: "text.secondary",
                      }}
                    >
                      <Typography level="body-md" fontWeight="md">
                        No Tasks Pending
                      </Typography>
                    </Box>
                  </td>
                </tr>
              ) : (
                paginatedData.map((task, index) => {
                  const isExpanded = expandedRow === index;
                  const deadline = new Date(task.deadline);
                  deadline.setHours(0, 0, 0, 0);
                  const isOverdue =
                    today > deadline && task.status === "Pending";

                  const dateOfEntry = new Date(task.dateOfEntry);
                  dateOfEntry.setHours(0, 0, 0, 0);
                  const diffinMins = today - dateOfEntry;
                  if (
                    dateOfEntry.getDate() - today.getDate() === 0 ||
                    diffinMins / (1000 * 60 * 60 * 24) >= 2
                  ) {
                    setIsNew(true);
                  }

                  return (
                    <tr key={index}>
                      <td>{startIndex + index + 1}</td>
                      <td style={{ position: "relative" }}>
                        <Box
                          sx={{ position: "relative", display: "inline-block" }}
                        >
                          {task.id}

                          {isNew && (
                            <Badge
                              badgeContent="NEW"
                              color="primary"
                              variant="solid"
                              size="sm"
                              sx={{
                                position: "absolute",
                                top: -8,
                                right: -28,
                                animation: "pulse 1.5s infinite",

                                "@keyframes pulse": {
                                  "0%": { transform: "scale(1)" },
                                  "50%": { transform: "scale(1.15)" },
                                  "100%": { transform: "scale(1)" },
                                },
                              }}
                            />
                          )}
                        </Box>
                      </td>
                      <td>{formatDateOfEntry(task.date_of_entry)}</td>
                      <td>{task.assigned_to}</td>
                      <td>
                        {isExpanded
                          ? task.task_desc
                          : getShortDescription(task.task_desc)}{" "}
                        {task.task_desc.includes("Task Assigned:") && (
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
                      <td>{formatDateOfEntry(task.deadline)}</td>
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
                          id={task.id}
                          variant="outlined"
                          color="primary"
                          onClick={(e) => {
                            setTaskId(e.target.id);
                            setEditModal(true);
                          }}
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
        </>
      ) : type === "underReview" ? (
        <>
          <Table
            variant="soft"
            borderAxis="bothBetween"
            color="primary"
            sx={{ tableLayout: "fixed", width: "100%" }}
          >
            <thead>
              <tr>
                <th>Sr.No</th>
                <th>Assigned To</th>
                <th>Pending Tasks</th>
                <th>Completed Tasks</th>
                <th>Overdue Tasks</th>
                <th>Reloaded Tasks</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                Array.from({ length: rows }).map((_, index) => (
                  <tr key={index} style={{ height: "55px" }}>
                    {Array.from({ length: 6 }).map((_, i) => (
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
              ) : !paginatedData || paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <Box
                      sx={{
                        textAlign: "center",
                        py: 4,
                        color: "text.secondary",
                      }}
                    >
                      <Typography level="body-md" fontWeight="md">
                        No Tasks Under Review
                      </Typography>
                    </Box>
                  </td>
                </tr>
              ) : (
                paginatedData.map((task, index) => (
                  <tr key={index}>
                    <td>{startIndex + index + 1}</td>
                    <td>{task.name}</td>
                    <td>{task.pending_count}</td>
                    <td>{task.completed_count}</td>
                    <td>{task.overdue_count}</td>
                    <td>{task.reloaded_count}</td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>

          {/* Pagination Controls (Same as Assigned Table) */}
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
                <Option value={3}>3</Option>
                <Option value={5}>5</Option>
                <Option value={6}>6</Option>
              </Select>
            </Box>

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
        </>
      ) : (
        <></>
      )}
      <EditModal
        taskId={taskId}
        open={editModal}
        onClose={() => setEditModal(false)}
      />
    </div>
  );
};

export default Tables;
