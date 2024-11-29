import React, { useState, useEffect } from "react";
import QRCode from "qrcode";

const GenerateMobileData = ({
	rowData,
	isMobile,
	followUpMessage,
	noAnswerMessage,
}) => {
	const [qrCodes, setQrCodes] = useState([]);
	const [currentQrIndex, setCurrentQrIndex] = useState(0); // Tracks the displayed QR code index

	const generateMobileData = async () => {
		const maxChunkSize = 1000; // Maximum size per QR code in characters
		const qrChunks = []; // Store QR code URLs

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
			let partIndex = 0;
			while (partIndex * maxChunkSize < message.length) {
				const chunk = {
					type: "template",
					key, // Identifies whether this is "noAnswer" or "followUp"
					partIndex: partIndex + 1,
					totalParts: Math.ceil(message.length / maxChunkSize),
					message: message.slice(
						partIndex * maxChunkSize,
						(partIndex + 1) * maxChunkSize
					),
				};
				templateChunks.push(chunk);
				partIndex++;
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
		const estimatedContactSize = JSON.stringify(contacts[0]).length + 50;
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

		setQrCodes(qrChunks); // Save QR code URLs
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
					<h2>Scan this QR Code</h2>
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
				</div>
			)}
		</div>
	);
};

export default GenerateMobileData;
