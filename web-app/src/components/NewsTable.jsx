import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { renderCellExpand } from "../utils/renderCellExpand";
import LinkIcon from "@mui/icons-material/Link";
import Chip from "@mui/material/Chip";

const getColor = (sentiment) => {
  if (sentiment === "positive") return "success";
  if (sentiment === "neutral") return "primary";
  if (sentiment === "negative") return "error";
};

const columns = [
  {
    field: "title",
    flex: 0.5,
    headerName: "Title",
    renderCell: renderCellExpand,
  },
  { field: "publisher", flex: 0.2, headerName: "Publsiher" },
  {
    field: "sentiment",
    flex: 0.1,
    headerName: "Sentiment",
    renderCell: ({ value }) => {
      return <Chip label={value} color={getColor(value)} />;
    },
  },
  { field: "date", flex: 0.1, headerName: "Date" },
  {
    field: "button",
    flex: 0.1,
    headerName: "Link",
    renderCell: () => <LinkIcon />,
  },
];

const NewsTable = ({ rows }) => {
  const handleOnCellClick = (params, event) => {
    event.defaultMuiPrevented = true;
    const { field, row } = params;
    if (field === "button") {
      window.open(row["link"], "_blank");
    }
  };
  return (
    <div style={{ height: 600, width: "100%" }}>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={10}
        rowsPerPageOptions={[10]}
        onCellClick={handleOnCellClick}
      />
    </div>
  );
};

export default NewsTable;
