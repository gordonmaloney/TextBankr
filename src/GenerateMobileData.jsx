import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import { Button } from "@mui/material";

const GenerateMobileData = ({
	rowData,
	isMobile,
	followUpMessage,
	noAnswerMessage,
}) => {
	const [qrCodes, setQrCodes] = useState([]);
	const [currentQrIndex, setCurrentQrIndex] = useState(0); // Tracks the displayed QR code index
	const [isModalOpen, setIsModalOpen] = useState(false); // Tracks if modal is open

	const QRcodeWith = 800;

	const generateMobileData = async () => {
		const maxChunkSize = 1000; // Maximum size per QR code in characters
		const qrChunks = []; // Store QR code URLs
		const dataChunks = []; // Combined list of chunks

		// Prepare data
		const templateMessages = {
			noAnswer: noAnswerMessage,
			followUp: followUpMessage,
		};
		const contacts = rowData.map((row) => ({
			name: row.name,
			number: row.number,
		}));

		// Step 1: Add template messages to chunks
		for (const [key, message] of Object.entries(templateMessages)) {
			let partIndex = 0;
			while (partIndex * maxChunkSize < message.length) {
				const chunk = {
					key, // Identifies whether this is "noAnswer" or "followUp"
					partIndex: partIndex + 1,
					data: message.slice(
						partIndex * maxChunkSize,
						(partIndex + 1) * maxChunkSize
					),
				};
				dataChunks.push(chunk);
				partIndex++;
			}
		}

		// Step 2: Add contacts to chunks
		const estimatedContactSize = JSON.stringify(contacts[0]).length + 50;
		const contactsPerChunk = Math.floor(maxChunkSize / estimatedContactSize);

		for (let i = 0; i < contacts.length; i += contactsPerChunk) {
			const chunk = {
				partIndex: dataChunks.length + 1,
				data: contacts.slice(i, i + contactsPerChunk),
			};
			dataChunks.push(chunk);
		}

		// Step 3: Add totalParts to all chunks
		const totalParts = dataChunks.length;
		dataChunks.forEach((chunk, index) => {
			chunk.totalParts = totalParts; // Add total chunk count to each chunk
			chunk.partIndex = index + 1; // Ensure correct partIndex
		});

		// Step 4: Generate QR codes
		for (let i = 0; i < dataChunks.length; i++) {
			try {
				const qrCodeUrl = await QRCode.toDataURL(
					JSON.stringify(dataChunks[i]),
					{
						errorCorrectionLevel: "H",
						width: 600, // Set uniform width
					}
				);
				qrChunks.push(qrCodeUrl);
			} catch (error) {
				console.error(`Error generating QR code for chunk ${i + 1}:`, error);
				return;
			}
		}

		setQrCodes(qrChunks); // Save QR code URLs
		setIsModalOpen(true); // Open the modal
	};


	useEffect(() => {
		if (qrCodes.length > 0) {
			const interval = setInterval(() => {
				setCurrentQrIndex((prevIndex) => (prevIndex + 1) % qrCodes.length);
			}, 1000); // Change QR code every second

			return () => clearInterval(interval); // Cleanup interval on unmount
		}
	}, [qrCodes]); // Restart the interval if the QR codes list changes

	return (
		<div>
			{!isMobile && (
				<span style={{ float: "right" }}>
					<Button
						variant="contained"
						onClick={generateMobileData}
						disabled={rowData.length == 0}
					>
						Generate Mobile Data
					</Button>
				</span>
			)}

			{/* Modal for QR Codes */}
			{isModalOpen && (
				<div
					style={{
						position: "fixed",
						top: 0,
						left: 0,
						width: "100vw",
						height: "100vh",
						backgroundColor: "rgba(0, 0, 0, 0.8)",
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						zIndex: 1000,
					}}
				>
					<div
						style={{
							backgroundColor: "#fff",
							padding: "20px",
							borderRadius: "10px",
							textAlign: "center",
							width: "80%",
							maxWidth: "500px",
						}}
					>
						<h2>Scan these QR Codes</h2>
						<div key={currentQrIndex} style={{ marginBottom: "10px" }}>
							<h3>
								QR Code {currentQrIndex + 1} of {qrCodes.length}
							</h3>
							<img
								src={qrCodes[currentQrIndex]}
								alt={`QR Code ${currentQrIndex + 1}`}
								style={{ maxWidth: "100%", height: "auto" }}
							/>
						</div>
						<Button
							variant="contained"
							onClick={() => setIsModalOpen(false)}
							style={{
								backgroundColor: "#ff4d4d",
							}}
						>
							Close
						</Button>
					</div>
				</div>
			)}
		</div>
	);
};

export default GenerateMobileData;
