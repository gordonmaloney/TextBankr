import React, { useState, useEffect } from "react";
import GeneratedLinks from "./GeneratedLinks";
import { Box, Button } from "@mui/material";
import Grid from "@mui/material/Grid2";

import DataGrid from "./DataGrid";
import GenerateMobileData from "./GenerateMobileData";
import Scanning from "./Scanning";
import InputFields from "./InputFields";
import Header from "./Header";

const TextBankr = () => {
	const [rowData, setRowData] = useState([]);
	const [noAnswerMessage, setNoAnswerMessage] = useState("");
	const [followUpMessage, setFollowUpMessage] = useState("");


	const clearAllData = () => {
		setRowData([]);
	};

	const [isMobile, setIsMobile] = useState(false);

	// Detect mobile devices
	useEffect(() => {
		const checkMobile = () => {
			const userAgent = navigator.userAgent || navigator.vendor || window.opera;
			setIsMobile(/android|iphone|ipad|ipod|mobile/i.test(userAgent));
		};
		checkMobile();
	}, []);

	const handlePaste = (event) => {
		// Check if the paste target is an input or textarea to avoid interfering
		if (
			event.target.tagName === "TEXTAREA" ||
			event.target.tagName === "INPUT"
		) {
			return;
		}

		event.preventDefault();
		const clipboardData = event.clipboardData.getData("text/plain");

		// Split the clipboard data into rows
		const rows = clipboardData.split("\n").filter((row) => row.trim() !== "");

		const parsedData = [];
		let buffer = null;

		rows.forEach((row) => {
			// Split row into cells and clean up each cell
			const cells = row
				.split("\t")
				.map((cell) => cell.replace(/["]/g, "").trim()); // Remove quotes and trim

			if (cells.length === 2 && /^\d/.test(cells[1])) {
				// If row has two valid cells and the second one starts with a digit
				if (buffer) {
					// If there's a buffer, finalize it before adding this valid row
					parsedData.push(buffer);
					buffer = null;
				}
				parsedData.push({ name: cells[0], number: cells[1] });
			} else if (cells.length === 1) {
				// If row has one cell, assume it's part of a split entry
				if (buffer) {
					// Add this line to the existing buffer
					buffer.number += ` ${cells[0]}`;
				} else {
					// Start a buffer for the split entry
					buffer = { name: cells[0], number: "" };
				}
			} else if (cells.length === 2) {
				// If row has two cells but the second is not a valid number
				if (buffer) {
					buffer.number += ` ${cells[0]}`; // Treat as continuation of previous
				} else {
					buffer = { name: cells[0], number: cells[1] }; // Start buffer
				}
			}
		});

		// Add any remaining buffer as a valid entry
		if (buffer) {
			parsedData.push(buffer);
		}

		// Clean and format the data
		const formattedData = parsedData.map((entry) => ({
			name: entry.name || "",
			number: entry.number ? entry.number.replace(/[^0-9+]/g, "").trim() : "",
		}));

		setRowData(formattedData); // Update the table data
	};

	useEffect(() => {
		const globalPasteHandler = (event) => {
			handlePaste(event);
		};

		document.addEventListener("paste", globalPasteHandler);
		return () => {
			document.removeEventListener("paste", globalPasteHandler);
		};
	}, []);

	return (
		<div>
			<Header />
			<div style={{ padding: "20px" }}>
				<p style={{ textAlign: "center" }}>
					<em>
						You are viewing a work in progress - please be patient 🙏
						<br />
						Any comments, email gordonmaloney @ gmail . com
					</em>
				</p>

				<Scanning
					isMobile={isMobile}
					setRowData={setRowData}
					setNoAnswerMessage={setNoAnswerMessage}
					setFollowUpMessage={setFollowUpMessage}
				/>

				<Box sx={{ flexGrow: 1 }}>
					<Grid container spacing={2}>
						<Grid size={{ xs: 12, sm: 6 }}>
							<InputFields
								noAnswerMessage={noAnswerMessage}
								setNoAnswerMessage={setNoAnswerMessage}
								followUpMessage={followUpMessage}
								setFollowUpMessage={setFollowUpMessage}
							/>

							<br />
							<Grid
								container
								spacing={2}
								justifyContent={"space-between"}
								style={{ marginTop: "14px" }}
							>
								<Grid item size={6}>
									<Button
										variant="contained"
										disabled={rowData.length == 0}
										onClick={() =>
											document
												.getElementById("generatedLinks")
												.scrollIntoView({ behavior: "smooth" })
										}
									>
										Go to links
									</Button>
								</Grid>
								<Grid item size={6}>
									<GenerateMobileData
										rowData={rowData}
										isMobile={isMobile}
										followUpMessage={followUpMessage}
										noAnswerMessage={noAnswerMessage}
									/>
								</Grid>
							</Grid>
						</Grid>

						<Grid size={{ xs: 12, sm: 6 }}>
							<DataGrid rowData={rowData} clearAllData={clearAllData} />
						</Grid>
					</Grid>
				</Box>

				<GeneratedLinks
					rowData={rowData}
					isMobile={isMobile}
					followUpMessage={followUpMessage}
					noAnswerMessage={noAnswerMessage}
				/>
			</div>
		</div>
	);
};

export default TextBankr;
