import React, { useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import QRCode from "qrcode";
import { Html5QrcodeScanner } from "html5-qrcode"; // Import QR code scanner
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

const TextBankr = () => {
	const [rowData, setRowData] = useState([]);
	const [noAnswerMessage, setNoAnswerMessage] = useState("");
	const [followUpMessage, setFollowUpMessage] = useState("");
	const [qrCodes, setQrCodes] = useState([]);
	const [isScanning, setIsScanning] = useState(false); // Scanning state

	const handlePaste = (event) => {
		event.preventDefault();
		const clipboardData = event.clipboardData.getData("text/plain");
		const rows = clipboardData.split("\n").filter((row) => row.trim() !== "");
		const parsedData = rows.map((row) => row.split("\t"));

		const formattedData = parsedData.map((cells) => ({
			name: cells[0] || "",
			number: cells[1] || "",
		}));

		setRowData(formattedData);
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

	const generateMobileData = async () => {
		const mobileData = {
			templateMessages: {
				noAnswer: noAnswerMessage,
				followUp: followUpMessage,
			},
			contacts: rowData.map((row) => ({
				name: row.name,
				number: row.number,
			})),
		};

		const jsonData = JSON.stringify(mobileData);

		const chunkSize = 1000; // Define a maximum chunk size (in characters)
		const chunks = [];

		for (let i = 0; i < jsonData.length; i += chunkSize) {
			chunks.push(jsonData.slice(i, i + chunkSize));
		}

		const qrCodeUrls = await Promise.all(
			chunks.map((chunk) =>
				QRCode.toDataURL(chunk, { errorCorrectionLevel: "H" })
			)
		);

		setQrCodes(qrCodeUrls);
	};

	const startScanning = () => {
		setIsScanning(true);

		const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });

		scanner.render(
			(decodedText) => {
				// Stop scanning once data is captured
				scanner.clear();
				setIsScanning(false);

				try {
					const parsedData = JSON.parse(decodedText);

					// Populate state with scanned data
					setRowData(parsedData.contacts || []);
					setNoAnswerMessage(parsedData.templateMessages?.noAnswer || "");
					setFollowUpMessage(parsedData.templateMessages?.followUp || "");

					alert("Data successfully scanned and loaded!");
				} catch (error) {
					alert("Invalid QR Code data. Please try again.");
				}
			},
			(error) => {
				console.error("QR Code scan error:", error);
			}
		);
	};

	const columnDefs = [
		{ headerName: "Name", field: "name", editable: true },
		{ headerName: "Number", field: "number", editable: true },
	];

	return (
		<div style={{ padding: "20px" }}>
			<h1>TextBankr</h1>

			{/* Input Fields for Template Messages */}
			<div style={{ marginBottom: "20px" }}>
				<label>
					No Answer Message:
					<input
						type="text"
						value={noAnswerMessage}
						onChange={(e) => setNoAnswerMessage(e.target.value)}
						placeholder="Type your 'No Answer' message here"
						style={{
							width: "100%",
							padding: "8px",
							marginTop: "8px",
							boxSizing: "border-box",
						}}
					/>
				</label>
				<br />
				<label>
					Follow Up Message:
					<input
						type="text"
						value={followUpMessage}
						onChange={(e) => setFollowUpMessage(e.target.value)}
						placeholder="Type your 'Follow Up' message here"
						style={{
							width: "100%",
							padding: "8px",
							marginTop: "8px",
							boxSizing: "border-box",
						}}
					/>
				</label>
			</div>

			{/* Grid Container */}
			<div
				className="ag-theme-alpine"
				style={{
					height: 400,
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
				/>
			</div>

			{/* Generate Mobile Data Button */}
			<button
				onClick={generateMobileData}
				style={{
					padding: "10px 20px",
					backgroundColor: "#007bff",
					color: "#fff",
					border: "none",
					borderRadius: "5px",
					cursor: "pointer",
					marginBottom: "20px",
				}}
			>
				Generate Mobile Data
			</button>

			{/* Display QR Codes */}
			{qrCodes.length > 0 && (
				<div>
					<h2>Scan these QR Codes</h2>
					{qrCodes.map((qrCode, index) => (
						<div key={index} style={{ marginBottom: "10px" }}>
							<h3>QR Code {index + 1}</h3>
							<img
								src={qrCode}
								alt={`QR Code ${index + 1}`}
								style={{ maxWidth: "100%", height: "auto" }}
							/>
						</div>
					))}
				</div>
			)}

			{/* Scan QR Code from Desktop Button */}
			<button
				onClick={startScanning}
				style={{
					padding: "10px 20px",
					backgroundColor: "#28a745",
					color: "#fff",
					border: "none",
					borderRadius: "5px",
					cursor: "pointer",
				}}
			>
				Scan Data from Desktop
			</button>

			{/* QR Code Scanner Container */}
			{isScanning && (
				<div id="reader" style={{ width: "100%", marginTop: "20px" }}></div>
			)}
		</div>
	);
};

export default TextBankr;
