import React from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { Button } from "@mui/material";

const DataGrid = ({ rowData, clearAllData }) => {
	const columnDefs = [
		{ headerName: "Name", field: "name", editable: true },
		{ headerName: "Number", field: "number", editable: true },
	];
	return (
		<div
			className="ag-theme-alpine"
			style={{
				height: 300,
				width: "100%",
				marginBottom: "20px",
				border: "1px solid #ccc",
			}}
			tabIndex={0}
		>
			<AgGridReact
				rowData={rowData}
				columnDefs={columnDefs}
				defaultColDef={{
					editable: true,
					resizable: true,
				}}
				overlayNoRowsTemplate={`<div style="padding: 10px; text-align: center; color: gray;">
      Paste your data here using ctrl/cmnd + v.
    </div>`} // Custom no-rows message
			/>

			<Button
				variant="contained"
				onClick={clearAllData}
				size="small"
				style={{ marginTop: "5px", float: "right" }}
			>
				Clear data
			</Button>
		</div>
	);
};

export default DataGrid;
