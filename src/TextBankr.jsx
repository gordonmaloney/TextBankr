import React, { useState, useEffect } from "react";
import GeneratedLinks from "./GeneratedLinks";
import { Box, Button } from "@mui/material";
import Grid from "@mui/material/Grid2";

import DataGrid from "./DataGrid";
import GenerateMobileData from "./GenerateMobileData";
import Scanning from "./Scanning";
import InputFields from "./InputFields";
import Header from "./Header";
import CountrySelect from "./CountrySelect";
import { BtnStyleSmall } from "./MUIShared";
import Footer from "./Footer";

const TextBankr = ({ Translation }) => {
	const [rowData, setRowData] = useState([]);
	const [noAnswerMessage, setNoAnswerMessage] = useState("");
	const [followUpMessage, setFollowUpMessage] = useState("");

	const [extensionCode, setExtensionCode] = useState(() => "+44"); // Lazy initialization

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

	useEffect(() => {
		window.scrollTo({ top: 0, behavior: "smooth" });
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
				<Scanning
					Translation={Translation}
					isMobile={isMobile}
					rowData={rowData}
					setRowData={setRowData}
					setNoAnswerMessage={setNoAnswerMessage}
					setFollowUpMessage={setFollowUpMessage}
					setExtensionCode={setExtensionCode}
				/>

				<Box sx={{ flexGrow: 1 }}>
					<Grid container spacing={2}>
						<Grid size={{ xs: 12, sm: 6 }}>
							<InputFields
								Translation={Translation}
								noAnswerMessage={noAnswerMessage}
								setNoAnswerMessage={setNoAnswerMessage}
								followUpMessage={followUpMessage}
								setFollowUpMessage={setFollowUpMessage}
							/>

							<br />
						</Grid>

						<Grid size={{ xs: 12, sm: 6 }}>
							<DataGrid
								Translation={Translation}
								rowData={rowData}
								setRowData={setRowData}
								clearAllData={clearAllData}
								extensionCode={extensionCode}
								setExtensionCode={setExtensionCode}
							/>
						</Grid>
					</Grid>

					<Grid
						container
						spacing={2}
						justifyContent={"space-between"}
						style={{ marginTop: "14px" }}
					>
						<Grid item size={12}>
							<h3 style={{ marginTop: 0 }}>{Translation.textbankrSendMsg}</h3>

							{!isMobile ? (
								<>
									<p style={{ marginTop: 0, fontSize: "small" }}>
										{Translation.textbankrSendBlurb}
									</p>

									<GenerateMobileData
										Translation={Translation}
										rowData={rowData}
										isMobile={isMobile}
										followUpMessage={followUpMessage}
										noAnswerMessage={noAnswerMessage}
										extensionCode={extensionCode}
									/>

									<Button
										variant="contained"
										sx={{
											...BtnStyleSmall,
											marginLeft: isMobile ? 0 : "20px",
										}}
										disabled={rowData.length == 0}
										onClick={() =>
											document
												.getElementById("generatedLinks")
												.scrollIntoView({ behavior: "smooth" })
										}
									>
										{Translation.textbankrSendBrowser}
									</Button>
								</>
							) : (
								<>
									<p style={{ marginTop: 0, fontSize: "small" }}>
										{Translation.textbankrFallback}
									</p>
								</>
							)}
						</Grid>
					</Grid>
				</Box>

				<GeneratedLinks
					Translation={Translation}
					extensionCode={extensionCode}
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
