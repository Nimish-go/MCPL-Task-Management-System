import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useLocation } from "react-router-dom";
import axios from "axios";
import Toast from "../components/Toast";
import {
  Autocomplete,
  Button,
  Chip,
  Divider,
  FormControl,
  FormLabel,
  Input,
  Option,
  Select,
  Table,
  Textarea,
  Typography,
  Box,
  Skeleton,
  IconButton,
} from "@mui/joy";
import {
  Download,
  DownloadDone,
  DownloadDoneTwoTone,
  DownloadRounded,
  Search,
} from "@mui/icons-material";
import { downloadReport } from "../hooks/downloadReport";

const ProjectHistoryReport = () => {
  const location = useLocation();

  const today = new Date().toISOString().split("T")[0];

  const [projectData, setProjectData] = useState([]);
  const [projectName, setProjectName] = useState("Please Select Project Code");
  const [projectLoading, setProjectLoading] = useState(false);
  const [selectedProjectCode, setSelectedProjectCode] = useState("Project");
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [historyData, setHistoryData] = useState([]);
  const [toastStatus, setToastStatus] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [toastShow, setToastShow] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [page, setPage] = useState(0);
  const [rows, setRows] = useState(3);
  const [expandedRows, setExpandedRows] = useState({});
  const [downloadButton, setDownloadButton] = useState(true);

  const startIndex = page * rows;
  const endIndex = startIndex + rows;
  const paginatedData = historyData.slice(startIndex, endIndex);

  const totalPages = Math.ceil(historyData.length / rows);

  useEffect(() => {
    axios.defaults.baseURL = "https://mcpl-task-management-system.vercel.app/";
    setProjectLoading(true);
    axios
      .get("/get_all_projects")
      .then((res) => {
        if (res.status === 200) {
          const data = res.data;
          setProjectData(data);
        }
      })
      .catch((err) => {
        console.error(err);
        setToastStatus("error");
        setToastMessage("Something Went Wrong. Please Check The Console.");
        setToastShow(true);
      })
      .finally(() => {
        setProjectLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!selectedProjectCode || selectedProjectCode === "Project") {
      setProjectName("Please Select Project Code");
      return;
    }

    axios
      .get(`/get_project_data/${selectedProjectCode}`)
      .then((res) => {
        if (res.status === 200) {
          const data = res.data;
          setProjectName(data.project_name);
        }
      })
      .catch((err) => {
        console.error(err);
        setToastStatus("error");
        setToastMessage("Something Went Wrong. Please Check The Console.");
        setToastShow(true);
      });
  }, [selectedProjectCode]);

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

  const downloadPDF = (event) => {
    event.preventDefault();
    const pdfTitle = `Project History Of ${selectedProjectCode} : ${projectName}`;

    downloadReport(historyData, "history", pdfTitle);
  };

  const searchProjectHistory = (event) => {
    event.preventDefault();
    setHistoryLoading(true);
    axios
      .get("/getProjectHistory", {
        params: {
          projectCode: selectedProjectCode,
          dateFrom: fromDate,
          dateTo: toDate,
        },
      })
      .then((res) => {
        if (res.status === 200) {
          const data = res.data;
          setHistoryData(data);
          setDownloadButton(false);
        }
      })
      .catch((err) => {
        if (err.response.status === 404) {
          setToastStatus("error");
          setToastMessage(err.response.data.message);
          setToastShow(true);
          setDownloadButton(true);
        } else {
          setToastStatus("error");
          setToastMessage("Something went wrong. Please Check the Console.");
          setToastShow(true);
          setDownloadButton(true);
        }
      })
      .finally(() => {
        setHistoryLoading(false);
      });
  };

  return (
    <div className="w-screen overflow-hidden">
      <div className="navbar">
        <Navbar />
      </div>
      <div className="main justify-center items-center text-center">
        <div className="title">
          <Typography level="h3" textAlign={"center"} mt={"1rem"}>
            Project History Report
          </Typography>
        </div>
        <div className="project-history-section flex">
          <div className="form-and-table px-5 m-5 w-screen shadow-md rounded-xl box-border relative">
            <Typography level="title-lg">Search for Project History</Typography>
            <div
              className="mt-10"
              style={{
                display: "grid",
                gridTemplateColumns: "250px 20px 480px",
                alignItems: "center",
                gap: "20px",
              }}
            >
              <FormControl>
                <FormLabel>Project Code</FormLabel>
                <Autocomplete
                  placeholder="Search Project Code"
                  loading={projectLoading}
                  options={projectData}
                  getOptionLabel={(option) => option.code}
                  onChange={(event, newValue) => {
                    setSelectedProjectCode(newValue?.code || "");
                    setProjectName("Loading Project...");
                  }}
                />
              </FormControl>

              <Typography level="body-lg" sx={{ textAlign: "center", mt: 3 }}>
                :
              </Typography>

              <FormControl>
                <FormLabel>Project Name</FormLabel>
                <Textarea
                  readOnly
                  value={projectName}
                  minRows={2}
                  maxRows={2}
                  sx={{
                    resize: "none",
                    overflow: "hidden",
                  }}
                />
              </FormControl>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "200px 200px",
                gap: "120px",
                marginTop: "20px",
              }}
            >
              <FormControl>
                <FormLabel>Select From Date</FormLabel>
                <Input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Select To Date</FormLabel>
                <Input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </FormControl>
            </div>
            <div style={{ textAlign: "center", marginBlock: "40px" }}>
              <Button
                variant="solid"
                color="primary"
                startDecorator={<Search />}
                size="md"
                onClick={searchProjectHistory}
                loading={historyLoading}
              >
                Search Selected Project History Data
              </Button>
            </div>
          </div>
          <div className="history-data w-full p-5 m-5 shadow-md rounded-xl box-border relative">
            <div className="flex justify-center text-center items-center">
              <Typography level="title-lg" sx={{ mx: 5 }}>
                {selectedProjectCode}'s History Data
              </Typography>
              <IconButton
                color="danger"
                variant="soft"
                hidden={downloadButton}
                sx={{ textAlign: "center" }}
                onClick={downloadPDF}
              >
                <Download />
              </IconButton>
            </div>
            <Box
              sx={{
                maxHeight: "350px",
                overflowY: "auto",
                mt: 2,
              }}
            >
              {historyData.length > 0 ? (
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
                      <th className="w-11">Event Date</th>
                      <th className="w-14">Filled By</th>
                      <th className="w-14">Project History ID</th>
                      <th className="w-14">Event Desc.</th>
                      <th className="w-14">Is it a rework?</th>
                      <th className="w-14">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyLoading ? (
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
                              No Project History Data
                            </Typography>
                          </Box>
                        </td>
                      </tr>
                    ) : (
                      paginatedData.map((history, index) => (
                        <tr key={index}>
                          <td>{startIndex + index + 1}</td>
                          <td>{history.eventDate}</td>
                          <td>{history.filledBy}</td>
                          <td>{history.id}</td>
                          <td>
                            {expandedRows[index]
                              ? history.desc
                              : getFirstThreeWords(history.desc)}

                            {history.desc &&
                              history.desc.split(" ").length > 3 && (
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
                          <td>
                            <Chip
                              color={
                                history.isRework === "Rework"
                                  ? "danger"
                                  : "primary"
                              }
                              variant="soft"
                            >
                              {history.isRework}
                            </Chip>
                          </td>
                          <td>{history.remarks}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              ) : (
                <Typography
                  level="title-lg"
                  sx={{
                    display: "flex",
                    textAlign: "center",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  Please Select A Project Code.
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
        open={toastShow}
        onClose={() => setToastShow(false)}
        message={toastMessage}
      />
    </div>
  );
};

export default ProjectHistoryReport;
