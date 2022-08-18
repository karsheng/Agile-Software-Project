import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { renderCellExpand } from "../utils/renderCellExpand";

const columns = [
  {
    field: "text",
    flex: 0.8,
    headerName: "Tweet",
    renderCell: renderCellExpand,
  },
  { field: "followers", flex: 0.2, headerName: "Followers" },
];

const TopTweets = ({ rows }) => {
  return (
    <div style={{ height: 400, width: "100%" }}>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5]}
      />
    </div>
  );
};

export default TopTweets;
