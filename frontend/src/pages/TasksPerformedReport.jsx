import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  FormControl,
  FormLabel,
  IconButton,
  Input,
  Option,
  Select,
  Skeleton,
  Table,
  Typography,
} from "@mui/joy";
import axios from "axios";
import { Download, Search, Visibility } from "@mui/icons-material";
import { downloadReport } from "../hooks/downloadReport";
import Toast from "../components/Toast";

const TasksPerformedReport = () => {
  // useEffect(() => {
  //   axios.defaults.baseURL = "https://mcpl-task-management-system.vercel.app/";
  // }, []);

  const today = new Date().toISOString().split("T")[0];

  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [employeeLoading, setEmployeeLoading] = useState(false);
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [chartData, setChartData] = useState([]);

  const [toastStatus, setToastStatus] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [toastShow, setToastShow] = useState(false);

  const [title, setTitle] = useState("Employee Report");

  const [page, setPage] = useState(0);
  const [rows, setRows] = useState(3);
  const [expandedRows, setExpandedRows] = useState({});

  useEffect(() => {
    setEmployeeLoading(true);
    axios
      .get("http://localhost:5002/get_employee_names")
      .then((res) => {
        if (res.status === 200) {
          const data = res.data;
          setEmployees(data);
        }
      })
      .catch((err) => {
        console.error(err);
        setToastStatus("error");
        setToastMessage("Something Went Wrong. Please Check the Console.");
        setToastShow(true);
      })
      .finally(() => setEmployeeLoading(false));
  }, []);

  const search = (event) => {
    event.preventDefault();
    setReportLoading(true);
    axios
      .get("http://localhost:5002/getEmployeeReport", {
        params: {
          employeeName: selectedEmployee,
          from: fromDate,
          to: toDate,
        },
      })
      .then((res) => {
        if (res.status === 200) {
          const data = res.data;
          setReportData(data);
          setTitle(
            `${selectedEmployee}'s Report from ${fromDate} to ${toDate}`,
          );
        }
      })
      .catch((err) => {
        if (err.response.status === 404) {
          setToastStatus("error");
          setToastMessage(`${selectedEmployee}'s Report came Empty.`);
          setToastShow(true);
        } else {
          console.error(err);
          setToastStatus("error");
          setToastMessage("Something Went Wrong. Please Check the Console.");
          setToastShow(true);
        }
      })
      .finally(() => setReportLoading(false));
  };

  const startIndex = page * rows;
  const endIndex = startIndex + rows;
  const paginatedData = reportData.slice(startIndex, endIndex);

  const totalPages = Math.ceil(reportData.length / rows);

  const getFirstThreeWords = (text) => {
    if (!text) return "";

    const words = text.trim().split(/\s+/);
    return words.length > 3 ? words.slice(0, 3).join(" ") + "..." : text;
  };

  const toggleExpand = (index) => {
    setExpandedRows((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const download = (event) => {
    event.preventDefault();
    const pdfTitle = `Employee Report Of ${selectedEmployee} from ${fromDate} to ${toDate}`;

    downloadReport(reportData, "performed", pdfTitle);
  };

  return (
    <div className="w-screen overflow-x-hidden h-screen">
      <div className="navbar">
        <Navbar />
      </div>
      <div className="main justify-center items-center text-center">
        <Typography level="h3">Tasks Performed Report</Typography>
        <div className="flex justify-center items-center text-center">
          <div className="shadow-lg box-border rounded-md m-3 p-5 w-3xl">
            <div className="title my-1">
              <Typography level="title-lg">Employee Task Report</Typography>
            </div>
            <div className="form flex flex-col my-5">
              <FormControl>
                <FormLabel sx={{ textAlign: "center" }}>
                  Select Employee Name
                </FormLabel>
                <Autocomplete
                  placeholder="Enter Employee Name"
                  options={employees}
                  loading={employeeLoading}
                  getOptionLabel={(employee) => employee.name}
                  onChange={(e, newValue) =>
                    setSelectedEmployee(newValue?.name || "")
                  }
                />
              </FormControl>
              <div className="dates flex justify-center my-3">
                <FormControl sx={{ mx: 3 }}>
                  <FormLabel>From</FormLabel>
                  <Input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>To</FormLabel>
                  <Input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                </FormControl>
              </div>
              <div className="button flex justify-center items-center text-center m-1">
                <Button
                  color="primary"
                  variant="solid"
                  onClick={search}
                  loading={reportLoading}
                >
                  Search Database for Employee Report
                </Button>
                <IconButton
                  color="danger"
                  variant="soft"
                  sx={{ mx: 3 }}
                  onClick={download}
                >
                  <Download />
                </IconButton>
              </div>
            </div>
          </div>
          <div className="table-div w-full shadow-lg rounded-xl p-3">
            <Typography level="title-lg" sx={{ mx: 5 }}>
              {title}
            </Typography>
            <Box
              sx={{
                maxHeight: "350px",
                overflowY: "auto",
                mt: 2,
              }}
            >
              {reportData.length > 0 ? (
                <Table
                  stickyHeader
                  hoverRow
                  variant="soft"
                  borderAxis="bothBetween"
                  sx={{
                    tableLayout: "fixed",
                    width: "100%",
                    cursor: "pointer",
                  }}
                >
                  <thead>
                    <tr>
                      <th className="w-14">Sr.No</th>
                      <th className="w-14">Event Date</th>
                      <th className="w-14">Task ID</th>
                      <th className="w-14">Work Type</th>
                      <th className="w-14">Project Details</th>
                      <th className="w-14">Event Desc.</th>
                      <th className="w-14">Time Spent</th>
                      <th className="w-14">Is it a rework?</th>
                      <th className="w-14">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportLoading
                      ? Array.from({ length: rows }).map((_, index) => (
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
                            </td>
                            <td>
                              <Skeleton
                                variant="text"
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
                                variant="text"
                                level="body-md"
                                animation="wave"
                              />
                            </td>
                          </tr>
                        ))
                      : //   <th className="w-14">Sr.No</th>
                        // <th className="w-14">Event Date</th>
                        // <th className="w-14">Task ID</th>
                        // <th className="w-14">Project Details</th>
                        // <th className="w-14">Event Desc.</th>
                        // <th className="w-14">Is it a rework?</th>
                        // <th className="w-14">Remarks</th>
                        paginatedData.map((element, index) => (
                          <tr>
                            <td>{startIndex + index + 1}</td>
                            <td>{element.eventDate}</td>
                            <td>{element.id}</td>
                            <td>{element.workType}</td>
                            <td>{element.projectDetails}</td>
                            <td>
                              {expandedRows[index]
                                ? element.event
                                : getFirstThreeWords(element.event)}

                              {element.event &&
                                element.event.split(" ").length > 3 && (
                                  <Button
                                    size="sm"
                                    variant="plain"
                                    sx={{ ml: 1 }}
                                    onClick={() => toggleExpand(index)}
                                  >
                                    {expandedRows[index]
                                      ? "See Less"
                                      : "Read More"}
                                  </Button>
                                )}
                            </td>
                            <td>{element.timeSpent}</td>
                            <td>
                              <Chip
                                color={
                                  element.isRework === "Rework"
                                    ? "danger"
                                    : "primary"
                                }
                                variant="soft"
                              >
                                {element.isRework}
                              </Chip>
                            </td>
                            <td>
                              {expandedRows[index]
                                ? element.remarks
                                : getFirstThreeWords(element.remarks)}

                              {element.remarks &&
                                element.remarks.split(" ").length > 3 && (
                                  <Button
                                    size="sm"
                                    variant="plain"
                                    sx={{ ml: 1 }}
                                    onClick={() => toggleExpand(index)}
                                  >
                                    {expandedRows[index]
                                      ? "See Less"
                                      : "Read More"}
                                  </Button>
                                )}
                            </td>
                          </tr>
                        ))}
                  </tbody>
                </Table>
              ) : !selectedEmployee ? (
                <Typography level="title-lg">
                  Please Select Employee Name
                </Typography>
              ) : (
                <Typography level="title-lg">
                  No Employee Record Data Found.
                </Typography>
              )}
            </Box>
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
          </div>
        </div>
      </div>
      <Toast
        status={toastStatus}
        message={toastMessage}
        open={toastShow}
        onClose={() => setToastShow(false)}
      />
    </div>
  );
};

export default TasksPerformedReport;
