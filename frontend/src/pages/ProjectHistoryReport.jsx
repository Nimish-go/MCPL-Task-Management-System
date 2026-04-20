import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useLocation } from "react-router-dom";
import axios from "axios";
import Toast from "../components/Toast";
import {
  Autocomplete,
  Button,
  Chip,
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
  Divider,
  Card,
  CardContent,
} from "@mui/joy";
import {
  Download,
  Search,
  FolderOpen,
  CalendarMonth,
  TableChart,
  Refresh,
} from "@mui/icons-material";
import { downloadReport } from "../hooks/downloadReport";

const ProjectHistoryReport = () => {
  const today = new Date().toISOString().split("T")[0];

  const [projectData, setProjectData] = useState([]);
  const [projectName, setProjectName] = useState("");
  const [projectLoading, setProjectLoading] = useState(false);
  const [selectedProjectCode, setSelectedProjectCode] = useState(null);
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [historyData, setHistoryData] = useState([]);
  const [toastStatus, setToastStatus] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [toastShow, setToastShow] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState(5);
  const [expandedRows, setExpandedRows] = useState({});
  const [hasSearched, setHasSearched] = useState(false);

  const startIndex = page * rows;
  const endIndex = startIndex + rows;
  const paginatedData = historyData.slice(startIndex, endIndex);
  const totalPages = Math.ceil(historyData.length / rows);

  const showToast = (status, message) => {
    setToastStatus(status);
    setToastMessage(message);
    setToastShow(true);
  };

  useEffect(() => {
    axios.defaults.baseURL = "https://mcpl-task-management-system.vercel.app/";
    setProjectLoading(true);
    axios
      .get("/get_all_projects")
      .then((res) => {
        if (res.status === 200) setProjectData(res.data);
      })
      .catch(() => showToast("error", "Failed to load projects."))
      .finally(() => setProjectLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedProjectCode) {
      setProjectName("");
      return;
    }
    setProjectName("Loading...");
    axios
      .get(`/get_project_data/${selectedProjectCode}`)
      .then((res) => {
        if (res.status === 200) setProjectName(res.data.project_name);
      })
      .catch(() => showToast("error", "Failed to load project details."));
  }, [selectedProjectCode]);

  const getFirstThreeWords = (text) => {
    if (!text) return "";
    const words = text.trim().split(/\s+/);
    return words.length > 3 ? words.slice(0, 3).join(" ") + "..." : text;
  };

  const toggleExpand = (index) => {
    setExpandedRows((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const downloadPDF = (e) => {
    e.preventDefault();
    downloadReport(
      historyData,
      "history",
      `Project History Of ${selectedProjectCode} : ${projectName}`,
    );
  };

  const searchProjectHistory = (e) => {
    e.preventDefault();
    if (!selectedProjectCode) {
      showToast("warning", "Please select a project code first.");
      return;
    }
    setHistoryLoading(true);
    setHasSearched(false);
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
          setHistoryData(res.data);
          setPage(0);
          setHasSearched(true);
        }
      })
      .catch((err) => {
        showToast(
          "error",
          err.response?.data?.message || "Something went wrong.",
        );
        setHistoryData([]);
        setHasSearched(true);
      })
      .finally(() => setHistoryLoading(false));
  };

  const resetForm = () => {
    setSelectedProjectCode(null);
    setProjectName("");
    setFromDate(today);
    setToDate(today);
    setHistoryData([]);
    setHasSearched(false);
    setPage(0);
    setExpandedRows({});
  };

  return (
    <div className="w-screen overflow-hidden">
      <Navbar />

      <Box sx={{ px: 4, py: 3, maxWidth: 1400, mx: "auto" }}>
        {/* Page Header */}
        <Box
          sx={{
            mb: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Typography level="h3" fontWeight={700}>
              Project History Report
            </Typography>
            <Typography
              level="body-sm"
              sx={{ color: "text.secondary", mt: 0.5 }}
            >
              Search and export project history records by date range.
            </Typography>
          </Box>
          <Chip
            variant="soft"
            color="neutral"
            startDecorator={<CalendarMonth sx={{ fontSize: "0.9rem" }} />}
          >
            Today: {new Date().toDateString()}
          </Chip>
        </Box>

        <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start" }}>
          {/* Left: Search Form */}
          <Card
            variant="outlined"
            sx={{ minWidth: 340, borderRadius: "16px", flexShrink: 0 }}
          >
            <CardContent>
              {/* Card Header */}
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    backgroundColor: "#e8f0fe",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Search sx={{ fontSize: "1.1rem", color: "#1976d2" }} />
                </Box>
                <Box>
                  <Typography level="title-md" fontWeight={700}>
                    Search Filters
                  </Typography>
                  <Typography level="body-xs" sx={{ color: "text.secondary" }}>
                    Select project and date range
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: 2 }} />

              {/* Project Code */}
              <FormControl sx={{ mb: 2 }}>
                <FormLabel>Project Code</FormLabel>
                <Autocomplete
                  placeholder="Search project code..."
                  loading={projectLoading}
                  options={projectData}
                  getOptionLabel={(option) => option.code}
                  onChange={(e, newValue) => {
                    setSelectedProjectCode(newValue?.code || null);
                  }}
                  startDecorator={
                    <FolderOpen
                      sx={{ fontSize: "1rem", color: "text.tertiary" }}
                    />
                  }
                />
              </FormControl>

              {/* Project Name */}
              {projectName && (
                <Box
                  sx={{
                    mb: 2,
                    p: 1.5,
                    borderRadius: "10px",
                    backgroundColor: "#f0f4ff",
                    border: "1px solid #d0d9f0",
                  }}
                >
                  <Typography
                    level="body-xs"
                    sx={{
                      color: "text.secondary",
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    Project Name
                  </Typography>
                  <Typography level="title-sm" sx={{ mt: 0.5 }}>
                    {projectName}
                  </Typography>
                </Box>
              )}

              <Divider sx={{ mb: 2 }} />

              {/* Date Range */}
              <FormControl sx={{ mb: 2 }}>
                <FormLabel>From Date</FormLabel>
                <Input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  startDecorator={<CalendarMonth sx={{ fontSize: "1rem" }} />}
                />
              </FormControl>

              <FormControl sx={{ mb: 3 }}>
                <FormLabel>To Date</FormLabel>
                <Input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  startDecorator={<CalendarMonth sx={{ fontSize: "1rem" }} />}
                />
              </FormControl>

              {/* Actions */}
              <Button
                fullWidth
                variant="solid"
                color="primary"
                startDecorator={<Search />}
                onClick={searchProjectHistory}
                loading={historyLoading}
                sx={{ mb: 1.5, borderRadius: "10px" }}
              >
                Search History
              </Button>
              <Button
                fullWidth
                variant="outlined"
                color="neutral"
                startDecorator={<Refresh />}
                onClick={resetForm}
                sx={{ borderRadius: "10px" }}
              >
                Reset
              </Button>
            </CardContent>
          </Card>

          {/* Right: Results Table */}
          <Card variant="outlined" sx={{ flex: 1, borderRadius: "16px" }}>
            <CardContent>
              {/* Table Header */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 2,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      backgroundColor: "#e8f0fe",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <TableChart sx={{ fontSize: "1.1rem", color: "#1976d2" }} />
                  </Box>
                  <Box>
                    <Typography level="title-md" fontWeight={700}>
                      {selectedProjectCode
                        ? `${selectedProjectCode} — History`
                        : "Results"}
                    </Typography>
                    <Typography
                      level="body-xs"
                      sx={{ color: "text.secondary" }}
                    >
                      {historyData.length > 0
                        ? `${historyData.length} record${historyData.length !== 1 ? "s" : ""} found`
                        : "No records yet"}
                    </Typography>
                  </Box>
                </Box>
                {historyData.length > 0 && (
                  <IconButton
                    color="danger"
                    variant="soft"
                    onClick={downloadPDF}
                    title="Download PDF"
                    sx={{ borderRadius: "10px" }}
                  >
                    <Download />
                  </IconButton>
                )}
              </Box>

              <Divider sx={{ mb: 2 }} />

              {/* Table */}
              <Box sx={{ maxHeight: "420px", overflowY: "auto" }}>
                {!hasSearched ? (
                  <Box
                    sx={{
                      textAlign: "center",
                      py: 8,
                      borderRadius: "12px",
                      border: "2px dashed #e0e0e0",
                      backgroundColor: "#fafafa",
                    }}
                  >
                    <Typography sx={{ fontSize: "2.5rem", mb: 1 }}>
                      🔍
                    </Typography>
                    <Typography
                      level="title-md"
                      sx={{ color: "text.secondary" }}
                    >
                      No search performed yet
                    </Typography>
                    <Typography
                      level="body-xs"
                      sx={{ color: "text.tertiary", mt: 0.5 }}
                    >
                      Select a project and date range, then click Search.
                    </Typography>
                  </Box>
                ) : historyLoading ? (
                  <Table
                    variant="soft"
                    borderAxis="bothBetween"
                    sx={{ tableLayout: "fixed", width: "100%" }}
                  >
                    <thead>
                      <tr>
                        {[
                          "Sr.No",
                          "Event Date",
                          "Filled By",
                          "History ID",
                          "Description",
                          "Rework?",
                          "Remarks",
                        ].map((h) => (
                          <th key={h}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: rows }).map((_, i) => (
                        <tr key={i} style={{ height: 55 }}>
                          {Array.from({ length: 7 }).map((_, j) => (
                            <td key={j}>
                              <Skeleton
                                variant="text"
                                level="body-md"
                                animation="wave"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : historyData.length === 0 ? (
                  <Box
                    sx={{
                      textAlign: "center",
                      py: 8,
                      borderRadius: "12px",
                      border: "2px dashed #e0e0e0",
                      backgroundColor: "#fafafa",
                    }}
                  >
                    <Typography sx={{ fontSize: "2.5rem", mb: 1 }}>
                      📭
                    </Typography>
                    <Typography
                      level="title-md"
                      sx={{ color: "text.secondary" }}
                    >
                      No records found
                    </Typography>
                    <Typography
                      level="body-xs"
                      sx={{ color: "text.tertiary", mt: 0.5 }}
                    >
                      Try adjusting the date range or project code.
                    </Typography>
                  </Box>
                ) : (
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
                        <th style={{ width: 60 }}>Sr.No</th>
                        <th style={{ width: 100 }}>Event Date</th>
                        <th style={{ width: 110 }}>Filled By</th>
                        <th style={{ width: 110 }}>History ID</th>
                        <th>Description</th>
                        <th style={{ width: 100 }}>Rework?</th>
                        <th style={{ width: 120 }}>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedData.map((history, index) => (
                        <tr key={index}>
                          <td>{startIndex + index + 1}</td>
                          <td>{history.eventDate}</td>
                          <td>{history.filledBy}</td>
                          <td>{history.id}</td>
                          <td>
                            {expandedRows[index]
                              ? history.desc
                              : getFirstThreeWords(history.desc)}
                            {history.desc?.split(" ").length > 3 && (
                              <Button
                                size="sm"
                                variant="plain"
                                sx={{ ml: 1 }}
                                onClick={() => toggleExpand(index)}
                              >
                                {expandedRows[index] ? "See Less" : "Read More"}
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
                              size="sm"
                            >
                              {history.isRework}
                            </Chip>
                          </td>
                          <td>{history.remarks}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Box>

              {/* Pagination */}
              {historyData.length > 0 && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mt: 2,
                    pt: 2,
                    borderTop: "1px solid #f0f0f0",
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
                      sx={{ width: 75 }}
                    >
                      <Option value={3}>3</Option>
                      <Option value={5}>5</Option>
                      <Option value={10}>10</Option>
                    </Select>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Button
                      size="sm"
                      variant="outlined"
                      disabled={page === 0}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      Prev
                    </Button>
                    <Typography level="body-sm">
                      Page {page + 1} of {totalPages || 1}
                    </Typography>
                    <Button
                      size="sm"
                      variant="outlined"
                      disabled={page + 1 >= totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>

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
