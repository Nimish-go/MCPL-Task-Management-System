import { Table, Typography } from "@mui/joy";
import React from "react";

const Tables = ({ type, tableData = null }) => {
  if (tableData === null) {
    return <Typography level="h3">No Tasks Assigned Yet</Typography>;
  }

    return (
        <Table>
            
        </Table>
    );
};

export default Tables;
