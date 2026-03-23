import jsPdf from "jspdf";
import autoTable from "jspdf-autotable";
import mitimitraLogo from "../assets/pdf/pdflogo.jpeg";

export const downloadReport = (data, type, title) => {
  const doc = new jsPdf({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);

  doc.text(title, pageWidth / 2 - 20, 18, {
    align: "center",
    maxWidth: pageWidth - 120,
  });

  let body = null;
  let head = null;

  if (type === "performed") {
    {
      /* employeeReport = 
          [{ "id" : row[0], "projectDetails" : row[1]+" : "+row[2], "event" : row[3], 
           "remarks" : row[4], "workType" : row[5], "isRework" : row[6] 
           }for row in cursor.fetchall()] */
    }

    body = data.map((task, index) => [
      index + 1,
      task.id,
      task.eventDate,
      task.projectDetails,
      task.event,
      task.workType,
      task.timeSpent,
      task.remarks,
    ]);
    head = [
      [
        "Sr. No",
        "Task Performed ID",
        "Event Date",
        "Project Details",
        "Task Description",
        "Work Type",
        "Time Spent",
        "Remarks",
      ],
    ];
    autoTable(doc, {
      startY: 35,
      margin: {
        top: 35,
      },
      head,
      body,
      tableWidth: "auto",
      styles: {
        fontSize: 8,
        cellPadding: 3,
        overflow: "linebreak",
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: "bold",
      },
      didDrawPage: function (data) {
        const pageWidth = doc.internal.pageSize.getWidth();

        const logoWidth = 55;
        const logoHeight = 20;

        doc.addImage(
          mitimitraLogo,
          "JPEG",
          pageWidth - logoWidth - 10,
          8,
          logoWidth,
          logoHeight,
        );
      },
    });

    const projectMap = {};

    data.forEach((task) => {
      const project = task.projectDetails || "Unknown";

      if (!projectMap[project]) {
        projectMap[project] = 0;
      }

      projectMap[project] += parseFloat(task.timeSpent) || 0;
    });

    const projectSummaryBody = Object.entries(projectMap).map(
      ([project, time], index) => [index + 1, project, time.toFixed(2)],
    );

    const totalTime = Object.values(projectMap).reduce((a, b) => a + b, 0);

    projectSummaryBody.push([
      {
        content: "Total",
        colSpan: 2,
        styles: { halign: "right", fontStyle: "bold" },
      },
      { content: totalTime.toFixed(2), styles: { fontStyle: "bold" } },
    ]);

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");

    doc.text("Project Wise Task Abstract", 14, doc.lastAutoTable.finalY + 15);

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 20,
      head: [["Sr.No", "Project Details", "Time Spent (in hrs)"]],
      body: projectSummaryBody,
      styles: {
        fontSize: 9,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
      },
    });
  } else if (type === "history") {
    body = data.map((history, index) => [
      index + 1,
      history.id,
      history.eventDate,
      history.filledBy,
      history.desc,
      history.workType,
      history.remarks ? history.remarks : "No Remarks Entered.",
    ]);
    head = [
      [
        "Sr. No",
        "Project History ID",
        "Event Date",
        "Filled By",
        "Description",
        "Work Type",
        "Remarks",
      ],
    ];
    autoTable(doc, {
      startY: 35,
      margin: {
        top: 35,
      },
      head,
      body,
      tableWidth: "auto",
      styles: {
        fontSize: 8,
        cellPadding: 3,
        overflow: "linebreak",
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: "bold",
      },
      didDrawPage: function (data) {
        const pageWidth = doc.internal.pageSize.getWidth();

        const logoWidth = 55;
        const logoHeight = 20;

        doc.addImage(
          mitimitraLogo,
          "JPEG",
          pageWidth - logoWidth - 10,
          8,
          logoWidth,
          logoHeight,
        );
      },
    });
  }

  const pageCount = doc.getNumberOfPages();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    doc.setFontSize(10);

    doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, {
      align: "center",
    });
  }

  doc.save(title);
};
