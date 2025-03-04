import React from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { Button } from "@mui/material";
import { BtnStyleSmall } from "./MUIShared";
import CountrySelect from "./CountrySelect";

const DataGrid = ({
	Translation,

	rowData,
	setRowData,
	clearAllData,
	extensionCode,
	setExtensionCode,
}) => {
	const columnDefs = [
		{ headerName: "Name", field: "name", editable: true },
		{ headerName: "Number", field: "number", editable: true },
	];

	// Add a new empty row for editing
	const addNewRow = () => {
		const newRow = { name: "", number: "" }; // Define structure for a new row
		if (!Array.isArray(rowData)) {
			// Ensure rowData is always an array
			console.error("rowData is not an array! Initializing as an empty array.");
			setRowData([newRow]);
		} else {
			setRowData([...rowData, newRow]);
		}
	};

	// Handle changes to cell values
	const onCellValueChanged = (event) => {
		if (!Array.isArray(rowData)) {
			console.error("rowData is not an array! Cannot update cell value.");
			return;
		}

		const updatedRowData = [...rowData];
		const { rowIndex, column, value } = event;

		if (updatedRowData[rowIndex]) {
			// Safeguard against invalid rowIndex
			const newValue = value ? value.toString().trim() : ""; // Ensure value is a string or empty
			updatedRowData[rowIndex][column.colId] = newValue;

			// Remove rows where both "name" and "number" are empty
			const filteredData = updatedRowData.filter(
				(row) => row.name.trim() || row.number.trim()
			);

			setRowData(filteredData);
		} else {
			console.error("Invalid rowIndex:", rowIndex);
		}
	};

	return (
		<div>
			<h3 style={{ marginTop: 0 }}>Import your contacts</h3>

			<div className="field-cont">
				<p style={{ marginTop: 0, fontSize: "small" }}>
					You can enter your contacts’ details in here manually, but it is much
					easier to copy-paste it in from a CRM or Google Spreadsheet. Just take
					the columns with their name and number -{" "}
					<a
						style={{ color: "white" }}
						target="_blank"
						href="https://docs.google.com/spreadsheets/d/1o6ngmC_uSebVxtB36EGMIrogNwz_Bn9ktJ8fCOZPCnA/edit?gid=0#gid=0"
					>
						like in this example.
					</a>
					<br />
					<br />
					This will then pull their first name only into the message, and it
					should handle the formatting of the number for you.
				</p>
				<div
					className="ag-theme-alpine"
					style={{
						height: 300,
						width: "100%",
						marginBottom: "2px",
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
						onCellValueChanged={onCellValueChanged} // Update row data on edit
						overlayNoRowsTemplate={`<div style="padding: 10px; text-align: center; color: gray;">
              Use ctrl/cmd + v to paste names and phone numbers from a spreadsheet here, or hit 'new entry' to type in manually.
            </div>`} // Custom no-rows message
					/>
				</div>

				{/* Action Buttons */}
				<div style={{ display: "flex", justifyContent: "space-between" }}>
					<Button
						variant="contained"
						onClick={addNewRow}
						sx={BtnStyleSmall}
						size="small"
						style={{ marginTop: "5px" }}
					>
						Add New Entry
					</Button>

					<Button
						variant="contained"
						onClick={clearAllData}
						size="small"
						sx={BtnStyleSmall}
						style={{ marginTop: "5px", backgroundColor: "#ff4d4d" }}
					>
						Clear Data
					</Button>
				</div>
				<br />
				<CountrySelect
					extensionCode={extensionCode}
					setExtensionCode={setExtensionCode}
				/>
			</div>
		</div>
	);
};

export default DataGrid;
