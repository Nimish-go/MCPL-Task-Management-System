import {
  Box,
  Button,
  Chip,
  Link,
  Option,
  Select,
  Stack,
  Table,
  Typography,
} from "@mui/joy";
import { Skeleton } from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";

const AllTasksAssigned = () => {
  const [tasks, setTasks] = useState([]);
  const [employeeNames, setEmployeeNames] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState(3);
  const [expandedRow, setExpandedRow] = useState(null);
  const [expandedRemarksRow, setExpandedRemarksRow] = useState(null);

  useEffect(() => {
    setLoading(true);
    axios
      .get("http://localhost:5002/get_employee_names")
      .then((res) => {
        if (res.status === 200) {
          const data = res.data;
          setEmployeeNames(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!selectedEmployee) return;
    setLoading(true);
    axios
      .get(
        `http://localhost:5002/tasks_assigned_to/${encodeURIComponent(selectedEmployee)}`,
      )
      .then((res) => {
        if (res.status === 200) {
          const data = res.data;
          setTasks(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [selectedEmployee]);

  const startIndex = page * rows;
  const endIndex = startIndex + rows;
  const paginatedData = tasks.slice(startIndex, endIndex);

  const totalPages = Math.ceil(tasks.length / rows);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

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

  const formatDateOfEntry = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="allTasksAssigned">
      <div className="title">
        <Typography level="title-md">
          Tasks Assigned to All Employees
        </Typography>
      </div>
      <Stack spacing={2}>
        <Typography level="body-sm">
          Tasks Assigned to: {selectedEmployee}
        </Typography>
        <Select
          placeholder="Select Employee Names"
          onChange={(e, newVal) => setSelectedEmployee(newVal)}
        >
          <Option value="All">All</Option>
          {employeeNames.map((employee, index) => (
            <Option value={employee.name} key={index}>
              {employee.name}
            </Option>
          ))}
        </Select>
        <Table
          variant="soft"
          color="primary"
          sx={{ width: "100%", tableLayout: "fixed", cursor: "pointer" }}
          borderAxis="bothBetween"
        >
          <thead>
            <tr>
              <th className="w-10">Sr.No</th>
              <th className="w-10">Task Id</th>
              <th className="w-10">Assigned Date</th>
              <th className="w-10">Assigned To</th>
              <th className="w-10">Assigned By</th>
              <th className="w-10">Task Description</th>
              <th className="w-10">Status</th>
              <th className="w-10">Deadline</th>
              <th className="w-10">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: rows }).map((_, index) => (
                <tr key={index} style={{ height: "55px" }}>
                  <td>
                    <Skeleton variant="text" level="body-md" animation="wave" />
                  </td>
                  <td>
                    <Skeleton variant="text" level="body-md" animation="wave" />
                  </td>
                  <td>
                    <Skeleton variant="text" level="body-md" animation="wave" />
                  </td>
                  <td>
                    <Skeleton variant="text" level="body-md" animation="wave" />
                  </td>
                  <td>
                    <Skeleton variant="text" level="body-md" animation="wave" />
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
                    <Skeleton variant="text" level="body-md" animation="wave" />
                  </td>
                  <td>
                    <Skeleton variant="text" level="body-md" animation="wave" />
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
                      Please Select an Employee from above dropdown
                    </Typography>
                  </Box>
                </td>
              </tr>
            ) : (
              paginatedData.map((task, index) => {
                const isExpanded = expandedRow === index;
                const deadline = new Date(task.deadline);
                deadline.setHours(0, 0, 0, 0);
                const isOverdue = today > deadline && task.status === "Pending";

                const dateOfEntry = new Date(task.dateOfEntry);
                dateOfEntry.setHours(0, 0, 0, 0);
                // const diffInDays =
                //   (today - dateOfEntry) / (1000 * 60 * 60 * 24);

                // const newTask = diffInDays === 0 || diffInDays <= 2;

                return (
                  <tr key={index}>
                    <td>{startIndex + index + 1}</td>
                    <td style={{ position: "relative" }}>
                      <Box
                        sx={{ position: "relative", display: "inline-block" }}
                      >
                        {task.id}
                        {/* {newTask && (
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
                          )} */}
                      </Box>
                    </td>
                    <td>{formatDateOfEntry(task.date_of_entry)}</td>
                    <td>{task.assigned_to}</td>
                    <td>{task.assigned_by}</td>
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
      </Stack>
    </div>
  );
};

export default AllTasksAssigned;
