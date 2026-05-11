import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
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
  AssignmentOutlined,
  CalendarToday,
} from "@mui/icons-material";
import { downloadReport } from "../hooks/downloadReport";

const ProjectHistoryReport = () => {
  const today = new Date().toISOString().split("T")[0];

  const [projectData, setProjectData]             = useState([]);
  const [projectName, setProjectName]             = useState("");
  const [projectLoading, setProjectLoading]       = useState(false);
  const [selectedProjectCode, setSelectedProjectCode] = useState(null);
  const [fromDate, setFromDate]                   = useState(today);
  const [toDate, setToDate]                       = useState(today);
  const [historyData, setHistoryData]             = useState([]);
  const [toastStatus, setToastStatus]             = useState("");
  const [toastMessage, setToastMessage]           = useState("");
  const [toastShow, setToastShow]                 = useState(false);
  const [historyLoading, setHistoryLoading]       = useState(false);
  const [page, setPage]                           = useState(0);
  const [rows, setRows]                           = useState(5);
  const [expandedRows, setExpandedRows]           = useState({});
  const [hasSearched, setHasSearched]             = useState(false);

  const startIndex    = page * rows;
  const paginatedData = historyData.slice(startIndex, startIndex + rows);
  const totalPages    = Math.ceil(historyData.length / rows);

  const showToast = (status, message) => {
    setToastStatus(status);
    setToastMessage(message);
    setToastShow(true);
  };

  const todayDisplay = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  useEffect(() => {
    axios.defaults.baseURL = "https://mcpl-task-management-system.vercel.app/";
    setProjectLoading(true);
    axios.get("/get_all_projects")
      .then((res) => { if (res.status === 200) setProjectData(res.data); })
      .catch(() => showToast("error", "Failed to load projects."))
      .finally(() => setProjectLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedProjectCode) { setProjectName(""); return; }
    setProjectName("Loading...");
    axios.get(`/get_project_data/${selectedProjectCode}`)
      .then((res) => { if (res.status === 200) setProjectName(res.data.project_name); })
      .catch(() => showToast("error", "Failed to load project details."));
  }, [selectedProjectCode]);

  const getFirstThreeWords = (text) => {
    if (!text) return "";
    const words = text.trim().split(/\s+/);
    return words.length > 3 ? words.slice(0, 3).join(" ") + "..." : text;
  };

  const toggleExpand = (index) =>
    setExpandedRows((prev) => ({ ...prev, [index]: !prev[index] }));

  const downloadPDF = (e) => {
    e.preventDefault();
    downloadReport(historyData, "history", `Project History Of ${selectedProjectCode} : ${projectName}`);
  };

  const searchProjectHistory = (e) => {
    e.preventDefault();
    if (!selectedProjectCode) { showToast("warning", "Please select a project code first."); return; }
    setHistoryLoading(true);
    setHasSearched(false);
    axios.get("/getProjectHistory", { params: { projectCode: selectedProjectCode, dateFrom: fromDate, dateTo: toDate } })
      .then((res) => { if (res.status === 200) { setHistoryData(res.data); setPage(0); setHasSearched(true); } })
      .catch((err) => { showToast("error", err.response?.data?.message || "Something went wrong."); setHistoryData([]); setHasSearched(true); })
      .finally(() => setHistoryLoading(false));
  };

  const resetForm = () => {
    setSelectedProjectCode(null); setProjectName(""); setFromDate(today);
    setToDate(today); setHistoryData([]); setHasSearched(false); setPage(0); setExpandedRows({});
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f4f6fb" }}>
      <Navbar />

      {/* ── Full-width flush hero — matches Dashboard exactly ── */}
      <Box sx={{
        background: "linear-gradient(135deg, #0f1b35 0%, #1565c0 60%, #1976d2 100%)",
        px: { xs: 2, sm: 3, md: 6 },
        py: { xs: 3, md: 4 },
        mb: 0,
      }}>
        <Box sx={{ maxWidth: 1200, mx: "auto" }}>
          {/* Breadcrumb */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
            <AssignmentOutlined sx={{ color: "rgba(255,255,255,0.7)", fontSize: 18 }} />
            <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.85rem", fontWeight: 500 }}>
              Reports
            </Typography>
          </Box>

          {/* Title */}
          <Typography
            level="h3"
            sx={{
              color: "#fff",
              fontWeight: 800,
              fontSize: { xs: "1.4rem", sm: "1.6rem", md: "2rem" },
              letterSpacing: "-0.02em",
              mb: 0.5,
            }}
          >
            Project History Report
          </Typography>

          {/* Date */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <CalendarToday sx={{ color: "rgba(255,255,255,0.55)", fontSize: 14 }} />
            <Typography sx={{ color: "rgba(255,255,255,0.55)", fontSize: "0.85rem" }}>
              {todayDisplay}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ── Content ── */}
      <Box sx={{ px: { xs: 1.5, sm: 2, md: 4 }, py: { xs: 2, md: 3 }, maxWidth: 1400, mx: "auto" }}>
        <Box sx={{ display: "flex", flexDirection: { xs: "column", lg: "row" }, gap: 3, alignItems: "flex-start" }}>

          {/* Left: Search Form */}
          <Card variant="outlined" sx={{ minWidth: { xs: "100%", lg: 340 }, width: { xs: "100%", lg: "auto" }, borderRadius: "16px", flexShrink: 0 }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                <Box sx={{ width: 36, height: 36, borderRadius: "50%", backgroundColor: "#e8f0fe", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Search sx={{ fontSize: "1.1rem", color: "#1976d2" }} />
                </Box>
                <Box>
                  <Typography level="title-md" fontWeight={700}>Search Filters</Typography>
                  <Typography level="body-xs" sx={{ color: "text.secondary" }}>Select project and date range</Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <FormControl sx={{ mb: 2 }}>
                <FormLabel>Project Code</FormLabel>
                <Autocomplete
                  placeholder="Search project code..."
                  loading={projectLoading}
                  options={projectData}
                  getOptionLabel={(option) => option.code}
                  onChange={(e, newValue) => setSelectedProjectCode(newValue?.code || null)}
                  startDecorator={<FolderOpen sx={{ fontSize: "1rem", color: "text.tertiary" }} />}
                />
              </FormControl>

              {projectName && (
                <Box sx={{ mb: 2, p: 1.5, borderRadius: "10px", backgroundColor: "#f0f4ff", border: "1px solid #d0d9f0" }}>
                  <Typography level="body-xs" sx={{ color: "text.secondary", textTransform: "uppercase", letterSpacing: 1 }}>Project Name</Typography>
                  <Typography level="title-sm" sx={{ mt: 0.5 }}>{projectName}</Typography>
                </Box>
              )}

              <Divider sx={{ mb: 2 }} />

              <FormControl sx={{ mb: 2 }}>
                <FormLabel>From Date</FormLabel>
                <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} startDecorator={<CalendarMonth sx={{ fontSize: "1rem" }} />} />
              </FormControl>

              <FormControl sx={{ mb: 3 }}>
                <FormLabel>To Date</FormLabel>
                <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} startDecorator={<CalendarMonth sx={{ fontSize: "1rem" }} />} />
              </FormControl>

              <Button fullWidth variant="solid" color="primary" startDecorator={<Search />} onClick={searchProjectHistory} loading={historyLoading} sx={{ mb: 1.5, borderRadius: "10px" }}>
                Search History
              </Button>
              <Button fullWidth variant="outlined" color="neutral" startDecorator={<Refresh />} onClick={resetForm} sx={{ borderRadius: "10px" }}>
                Reset
              </Button>
            </CardContent>
          </Card>

          {/* Right: Results Table */}
          <Card variant="outlined" sx={{ flex: 1, borderRadius: "16px", minWidth: 0 }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Box sx={{ width: 36, height: 36, borderRadius: "50%", backgroundColor: "#e8f0fe", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <TableChart sx={{ fontSize: "1.1rem", color: "#1976d2" }} />
                  </Box>
                  <Box>
                    <Typography level="title-md" fontWeight={700}>
                      {selectedProjectCode ? `${selectedProjectCode} — History` : "Results"}
                    </Typography>
                    <Typography level="body-xs" sx={{ color: "text.secondary" }}>
                      {historyData.length > 0 ? `${historyData.length} record${historyData.length !== 1 ? "s" : ""} found` : "No records yet"}
                    </Typography>
                  </Box>
                </Box>
                {historyData.length > 0 && (
                  <IconButton color="danger" variant="soft" onClick={downloadPDF} title="Download PDF" sx={{ borderRadius: "10px" }}>
                    <Download />
                  </IconButton>
                )}
              </Box>

              {/* ── Table ── */}
              {!hasSearched ? (
                <Box sx={{ textAlign: "center", py: 8, borderRadius: "12px", border: "2px dashed #e0e0e0", backgroundColor: "#fafafa" }}>
                  <Typography sx={{ fontSize: "2.5rem", mb: 1 }}>🔍</Typography>
                  <Typography level="title-md" sx={{ color: "text.secondary" }}>No search performed yet</Typography>
                  <Typography level="body-xs" sx={{ color: "text.tertiary", mt: 0.5 }}>Select a project and date range, then click Search.</Typography>
                </Box>
              ) : (
                <>
                  <Box sx={{ overflowX: "auto", borderRadius: "12px", border: "1px solid #e8ecf4", overflow: "hidden" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", minWidth: 680 }}>
                      <colgroup>
                        <col style={{ width: 56 }} />
                        <col style={{ width: 110 }} />
                        <col style={{ width: 120 }} />
                        <col style={{ width: 100 }} />
                        <col />
                        <col style={{ width: 100 }} />
                        <col style={{ width: 130 }} />
                      </colgroup>

                      {/* Header — same gradient as page hero */}
                      <thead>
                        <tr style={{ background: "linear-gradient(135deg, #0f1b35 0%, #1565c0 60%, #1976d2 100%)" }}>
                          {["#", "Event Date", "Filled By", "History ID", "Description", "Rework?", "Remarks"].map((h, i, arr) => (
                            <th key={h} style={{
                              padding: "12px 14px",
                              textAlign: "left",
                              color: "rgba(255,255,255,0.85)",
                              fontWeight: 700,
                              fontSize: "0.72rem",
                              letterSpacing: "0.05em",
                              textTransform: "uppercase",
                              whiteSpace: "nowrap",
                              borderRight: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.1)" : "none",
                            }}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>

                      {/* Body */}
                      <tbody>
                        {historyLoading ? (
                          Array.from({ length: rows }).map((_, i) => (
                            <tr key={i} style={{ backgroundColor: i % 2 === 0 ? "#fff" : "#fafbff" }}>
                              {Array.from({ length: 7 }).map((_, j) => (
                                <td key={j} style={{ padding: "11px 14px", borderBottom: "1px solid #f0f2f8" }}>
                                  <Skeleton variant="text" animation="wave" height={16} style={{ borderRadius: 4 }} />
                                </td>
                              ))}
                            </tr>
                          ))
                        ) : historyData.length === 0 ? (
                          <tr>
                            <td colSpan={7} style={{ padding: "48px 16px", textAlign: "center" }}>
                              <Typography sx={{ fontSize: "2rem", mb: 1 }}>📭</Typography>
                              <Typography level="title-md" sx={{ color: "text.secondary" }}>No records found</Typography>
                              <Typography level="body-xs" sx={{ color: "text.tertiary", mt: 0.5 }}>Try adjusting the date range or project code.</Typography>
                            </td>
                          </tr>
                        ) : (
                          paginatedData.map((history, index) => (
                            <tr
                              key={index}
                              style={{ backgroundColor: index % 2 === 0 ? "#fff" : "#fafbff" }}
                              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f0f4ff")}
                              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = index % 2 === 0 ? "#fff" : "#fafbff")}
                            >
                              {/* # */}
                              <td style={{ padding: "11px 14px", borderBottom: "1px solid #f0f2f8" }}>
                                <Box sx={{ width: 26, height: 26, borderRadius: "50%", backgroundColor: "#e8f0fe", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                  <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: "#1976d2" }}>{startIndex + index + 1}</Typography>
                                </Box>
                              </td>

                              {/* Event Date */}
                              <td style={{ padding: "11px 14px", fontSize: "0.78rem", color: "#475569", borderBottom: "1px solid #f0f2f8" }}>
                                {history.eventDate}
                              </td>

                              {/* Filled By */}
                              <td style={{ padding: "11px 14px", borderBottom: "1px solid #f0f2f8" }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                  <Box sx={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg, #1565c0, #42a5f5)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 2px 6px rgba(25,118,210,0.25)" }}>
                                    <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: "#fff" }}>
                                      {history.filledBy?.charAt(0).toUpperCase()}
                                    </Typography>
                                  </Box>
                                  <Typography sx={{ fontSize: "0.8rem", fontWeight: 500, color: "#1e293b" }}>{history.filledBy}</Typography>
                                </Box>
                              </td>

                              {/* History ID */}
                              <td style={{ padding: "11px 14px", borderBottom: "1px solid #f0f2f8" }}>
                                <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: "#1976d2", fontFamily: "monospace" }}>#{history.id}</Typography>
                              </td>

                              {/* Description */}
                              <td style={{ padding: "11px 14px", fontSize: "0.8rem", color: "#1e293b", borderBottom: "1px solid #f0f2f8", lineHeight: 1.5 }}>
                                {expandedRows[index] ? history.desc : getFirstThreeWords(history.desc)}
                                {history.desc?.split(" ").length > 3 && (
                                  <Button size="sm" variant="plain" sx={{ ml: 0.5, fontSize: "0.72rem", fontWeight: 600, minHeight: "auto", py: 0.2 }} onClick={() => toggleExpand(index)}>
                                    {expandedRows[index] ? "Less ▲" : "More ▼"}
                                  </Button>
                                )}
                              </td>

                              {/* Rework */}
                              <td style={{ padding: "11px 14px", borderBottom: "1px solid #f0f2f8" }}>
                                <Chip
                                  size="sm"
                                  variant="soft"
                                  color={history.isRework === "Rework" ? "danger" : "success"}
                                  sx={{ fontWeight: 700, fontSize: "0.7rem" }}
                                >
                                  {history.isRework}
                                </Chip>
                              </td>

                              {/* Remarks */}
                              <td style={{ padding: "11px 14px", fontSize: "0.8rem", color: "#475569", borderBottom: "1px solid #f0f2f8" }}>
                                {history.remarks || "—"}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </Box>

                  {/* Pagination */}
                  {historyData.length > 0 && (
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2, pt: 2, borderTop: "1px solid #f0f2f8", flexWrap: "wrap", gap: 1.5 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography level="body-xs" sx={{ color: "#64748b", fontWeight: 500 }}>Rows per page:</Typography>
                        <Select size="sm" value={rows} onChange={(_, v) => { setRows(v); setPage(0); }} sx={{ width: 70, borderRadius: "8px", fontSize: "0.8rem", fontWeight: 600 }}>
                          <Option value={3}>3</Option>
                          <Option value={5}>5</Option>
                          <Option value={10}>10</Option>
                        </Select>
                      </Box>
                      <Typography level="body-xs" sx={{ color: "#94a3b8" }}>
                        Showing {startIndex + 1}–{Math.min(startIndex + rows, historyData.length)} of {historyData.length}
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Button size="sm" variant="outlined" disabled={page === 0} onClick={() => setPage((p) => p - 1)} sx={{ borderRadius: "8px", fontWeight: 600 }}>← Prev</Button>
                        <Box sx={{ px: 2, py: 0.5, borderRadius: "8px", backgroundColor: "#e8f0fe", border: "1px solid #c5cae9" }}>
                          <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: "#1976d2" }}>{page + 1} / {totalPages || 1}</Typography>
                        </Box>
                        <Button size="sm" variant="outlined" disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)} sx={{ borderRadius: "8px", fontWeight: 600 }}>Next →</Button>
                      </Box>
                    </Box>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>

      <Toast status={toastStatus} open={toastShow} onClose={() => setToastShow(false)} message={toastMessage} />
    </div>
  );
};

export default ProjectHistoryReport;