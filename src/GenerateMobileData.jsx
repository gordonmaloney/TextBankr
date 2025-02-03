import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import { Button } from "@mui/material";
import { BtnStyleSmall } from "./MUIShared";

const GenerateMobileData = ({
	rowData,
	isMobile,
	followUpMessage,
	noAnswerMessage,
	extensionCode,
}) => {
	const [qrCodes, setQrCodes] = useState([]);
	const [currentQrIndex, setCurrentQrIndex] = useState(0); // Tracks the displayed QR code index
	const [isModalOpen, setIsModalOpen] = useState(false); // Tracks if modal is open

	const generateMobileData = async () => {
		const maxChunkSize = 800; // Maximum size per QR code in characters
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
					totalParts: 0, // Placeholder, updated later
					data: message.slice(
						partIndex * maxChunkSize,
						(partIndex + 1) * maxChunkSize
					),
					extensionCode, // Include the extension code
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
				totalParts: 0, // Placeholder, updated later
				data: contacts.slice(i, i + contactsPerChunk),
				extensionCode, // Include the extension code
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
		for (const chunk of dataChunks) {
			try {
				const qrCodeUrl = await QRCode.toDataURL(JSON.stringify(chunk), {
					errorCorrectionLevel: "H",
					width: 600, // Set uniform width
				});
				qrChunks.push(qrCodeUrl);
			} catch (error) {
				console.error(`Error generating QR code:`, error);
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


	const baseURL =
		window.location.host

	return (
		<>
			{!isMobile && (
				<Button
					variant="contained"
					sx={BtnStyleSmall}
					onClick={generateMobileData}
					disabled={rowData.length === 0}
				>
					Send from mobile{" "}
				</Button>
			)}

			{/* Modal for QR Codes */}
			{isModalOpen && (
				<div
					onClick={() => setIsModalOpen(false)} // Close modal on click outside
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
						onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
						style={{
							backgroundColor: "#fff",
							padding: "10px",
							borderRadius: "10px",
							textAlign: "center",
							width: "80%",
							maxWidth: "800px",
						}}
					>
						<h2 style={{ marginBottom: "12px", marginTop: "12px" }}>
							Scan from your mobile
						</h2>
						<p style={{ textAlign: "left", padding: "0 20px", marginTop: 0 }}>
							To send your messages from your phone, simply open{" "}
							<u>{baseURL}/start</u> from your mobile, hit "Scan from desktop" and
							scan the below QR code{qrCodes.length > 1 && <>s</>}.
							{qrCodes.length > 1 && (
								<>
									<br />
									<br />
									<em>"Why are there so many?? Why are they changing??"</em><br/>QR codes can only contain a
									relatively small amount of data, so your template messages and contacts'
									details are split up into a few different ones. But when you scan
									from your mobile, it will take them all in and combine them -
									just hold your phone's camera up as they flip through and it
									will do the rest for you!
								</>
							)}
						</p>
						<div key={currentQrIndex} style={{ marginBottom: "10px" }}>
							<img
								src={qrCodes[currentQrIndex]}
								alt={`QR Code ${currentQrIndex + 1}`}
								style={{
									maxWidth: "500px",
									height: "auto",
								}}
							/>
							<br />
							QR Code {currentQrIndex + 1} of {qrCodes.length}
						</div>
						<Button
							variant="contained"
							sx={BtnStyleSmall}
							onClick={() => setIsModalOpen(false)}
						>
							Close
						</Button>
					</div>
				</div>
			)}
		</>
	);
};

export default GenerateMobileData;
