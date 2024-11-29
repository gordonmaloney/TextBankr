import React, { useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import QRCode from "qrcode";
import { Html5QrcodeScanner } from "html5-qrcode";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

const TextBankr = () => {
	const [rowData, setRowData] = useState([]);
	const [noAnswerMessage, setNoAnswerMessage] = useState("");
	const [followUpMessage, setFollowUpMessage] = useState("");
	const [qrCodes, setQrCodes] = useState([]);
	const [isScanning, setIsScanning] = useState(false);

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
	if (event.target.tagName === "TEXTAREA" || event.target.tagName === "INPUT") {
		return;
	}

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

const generateWhatsAppLink = (name, number, message) => {
	const firstName = name.split(" ")[0]; // Extract first name
	const formattedNumber = `44${number}`; // Add country code
	const encodedMessage = encodeURIComponent(`Hey ${firstName}! ${message}`);
	return `https://api.whatsapp.com/send?phone=${formattedNumber}&text=${encodedMessage}`;
};

const generateSMSLink = (name, number, message) => {
	const firstName = name.split(" ")[0];
	const formattedNumber = `0${number}`; // Format for SMS
	const encodedMessage = encodeURIComponent(`Hey ${firstName}! ${message}`);
	return `sms://${formattedNumber}?&body=${encodedMessage}`;
};

const generateMobileData = async () => {
	const maxChunkSize = 600; // Maximum allowed size per QR code in characters
	const qrChunks = []; // Array to store QR code URLs

	// Prepare data
	const templateMessages = {
		noAnswer: noAnswerMessage,
		followUp: followUpMessage,
	};
	const contacts = rowData.map((row) => ({
		name: row.name,
		number: row.number,
	}));

	// Step 1: Split Template Messages
	const templateChunks = [];
	for (const [key, message] of Object.entries(templateMessages)) {
		let startIndex = 0;
		while (startIndex < message.length) {
			const chunk = {
				type: "template",
				key,
				partIndex: templateChunks.length + 1,
				totalParts: Math.ceil(message.length / maxChunkSize),
				message: message.slice(startIndex, startIndex + maxChunkSize),
			};
			templateChunks.push(chunk);
			startIndex += maxChunkSize;
		}
	}

	// Generate QR codes for template message chunks
	for (let i = 0; i < templateChunks.length; i++) {
		try {
			const qrCodeUrl = await QRCode.toDataURL(
				JSON.stringify(templateChunks[i]),
				{
					errorCorrectionLevel: "H",
				}
			);
			qrChunks.push(qrCodeUrl);
		} catch (error) {
			console.error(
				`Error generating QR code for template chunk ${i + 1}:`,
				error
			);
			return;
		}
	}

	// Step 2: Split Contacts
	const contactsChunks = [];
	const estimatedContactSize = JSON.stringify(contacts[0]).length + 50; // Include some padding for metadata
	const contactsPerChunk = Math.floor(maxChunkSize / estimatedContactSize);

	for (let i = 0; i < contacts.length; i += contactsPerChunk) {
		const chunk = {
			type: "contacts",
			chunkIndex: contactsChunks.length + 1,
			totalChunks: Math.ceil(contacts.length / contactsPerChunk),
			contacts: contacts.slice(i, i + contactsPerChunk),
		};
		contactsChunks.push(chunk);
	}

	// Generate QR codes for contact chunks
	for (let i = 0; i < contactsChunks.length; i++) {
		try {
			const qrCodeUrl = await QRCode.toDataURL(
				JSON.stringify(contactsChunks[i]),
				{
					errorCorrectionLevel: "H",
				}
			);
			qrChunks.push(qrCodeUrl);
		} catch (error) {
			console.error(
				`Error generating QR code for contact chunk ${i + 1}:`,
				error
			);
			return;
		}
	}

	setQrCodes(qrChunks); // Save all QR code URLs
};

const startScanning = () => {
	setIsScanning(true);
	const scannedChunks = []; // To store scanned chunks
	const scanner = new Html5QrcodeScanner("reader", {
		fps: 20,
		qrbox: 800, // Increase QR box size for easier scanning
	});

	const config = {
		experimentalFeatures: {
			useBarCodeDetectorIfSupported: true,
		},
		facingMode: "environment", // Use back camera
	};

	scanner.render(
		(decodedText) => {
			try {
				const chunk = JSON.parse(decodedText);
				const { chunkIndex, totalChunks } = chunk;

				if (scannedChunks.some((c) => c.chunkIndex === chunkIndex)) {
					alert(`Chunk ${chunkIndex} is already scanned!`);
					return;
				}

				scannedChunks.push(chunk);
				alert(`Chunk ${chunkIndex} of ${totalChunks} scanned.`);

				if (scannedChunks.length === totalChunks) {
					scanner.clear();
					setIsScanning(false);

					const combinedContacts = scannedChunks
						.sort((a, b) => a.chunkIndex - b.chunkIndex)
						.flatMap((chunk) => chunk.contacts);

					setRowData(combinedContacts);
					setNoAnswerMessage(scannedChunks[0].templateMessages?.noAnswer || "");
					setFollowUpMessage(scannedChunks[0].templateMessages?.followUp || "");

					alert("All QR codes scanned and data reconstructed!");
				}
			} catch (error) {
				alert("Invalid QR Code data. Please try again.");
			}
		},
		(error) => {
			console.error("QR Code scan error:", error);
		},
		config
	);
};

const columnDefs = [
	{ headerName: "Name", field: "name", editable: true },
	{ headerName: "Number", field: "number", editable: true },
];

const formatForTel = (number) => `+44${number}`;

return (
	<div style={{ padding: "20px" }}>
		<h1>TextBankr</h1>

		{/* Input Fields for Template Messages */}
		<div style={{ marginBottom: "20px" }}>
			<label>
				No Answer Message:
				<textarea
					value={noAnswerMessage}
					onChange={(e) => setNoAnswerMessage(e.target.value)}
					placeholder="Type your 'No Answer' message here"
					style={{
						width: "100%",
						padding: "8px",
						marginTop: "8px",
						boxSizing: "border-box",
						height: "60px", // Space for ~3 lines
					}}
				/>
			</label>
			<br />
			<label>
				Follow Up Message:
				<textarea
					value={followUpMessage}
					onChange={(e) => setFollowUpMessage(e.target.value)}
					placeholder="Type your 'Follow Up' message here"
					style={{
						width: "100%",
						padding: "8px",
						marginTop: "8px",
						boxSizing: "border-box",
						height: "60px", // Space for ~3 lines
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

		{!isMobile && (
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
		)}

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

		{/* Generated Links */}
		{rowData.length > 0 && (
			<div>
				<h2>Generated Links</h2>
				<ul>
					{rowData.map((row, index) => (
						<li key={index}>
							<p>
								<strong>{row.name}</strong> ({row.number})
							</p>
							<div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
								{isMobile && (
									<a
										href={`tel:${formatForTel(row.number)}`}
										target="_blank"
										rel="noopener noreferrer"
									>
										Call
									</a>
								)}

								<a
									href={generateWhatsAppLink(
										row.name,
										row.number,
										noAnswerMessage
									)}
									target="_blank"
									rel="noopener noreferrer"
								>
									WhatsApp - No Answer
								</a>
								<a
									href={generateSMSLink(row.name, row.number, noAnswerMessage)}
									target="_blank"
									rel="noopener noreferrer"
								>
									SMS - No Answer
								</a>
								<a
									href={generateWhatsAppLink(
										row.name,
										row.number,
										followUpMessage
									)}
									target="_blank"
									rel="noopener noreferrer"
								>
									WhatsApp - Follow Up
								</a>
								<a
									href={generateSMSLink(row.name, row.number, followUpMessage)}
									target="_blank"
									rel="noopener noreferrer"
								>
									SMS - Follow Up
								</a>
							</div>
						</li>
					))}
				</ul>
			</div>
		)}

		{/* Scan QR Code from Desktop Button */}
		{isMobile && (
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
		)}

		{/* QR Code Scanner Container */}
		{isScanning && (
			<div id="reader" style={{ width: "100%", marginTop: "20px" }}></div>
		)}
	</div>
);
};

export default TextBankr;
