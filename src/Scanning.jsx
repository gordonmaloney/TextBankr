import React, { useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

const Scanning = ({
	isMobile,
	setRowData,
	setNoAnswerMessage,
	setFollowUpMessage,
}) => {
	const [isScanning, setIsScanning] = useState(false);
	const [scanProgress, setScanProgress] = useState(""); // Progress message
	const [scannedTemplates, setScannedTemplates] = useState([]); // Track scanned template chunks
	const [scannedContacts, setScannedContacts] = useState([]); // Track scanned contact chunks

	const startScanning = () => {
		setIsScanning(true);
		const scannedChunks = { templates: [], contacts: [] };

		const scanner = new Html5QrcodeScanner("reader", {
			fps: 25,
			qrbox: 800,
		});

		const config = {
			experimentalFeatures: {
				useBarCodeDetectorIfSupported: true,
			},
			facingMode: "environment",
		};

		scanner.render(
			(decodedText) => {
				try {
					const chunk = JSON.parse(decodedText);

					if (chunk.type === "template") {
						if (
							!scannedChunks.templates.some(
								(c) => c.partIndex === chunk.partIndex && c.key === chunk.key
							)
						) {
							scannedChunks.templates.push(chunk);
							setScannedTemplates([...scannedChunks.templates]); // Update state
						}
					} else if (chunk.type === "contacts") {
						if (
							!scannedChunks.contacts.some(
								(c) => c.chunkIndex === chunk.chunkIndex
							)
						) {
							scannedChunks.contacts.push(chunk);
							setScannedContacts([...scannedChunks.contacts]); // Update state
						}
					}

					// Check if scanning is complete
					const templatesComplete =
						scannedChunks.templates.length &&
						scannedChunks.templates.filter((chunk) => chunk.key === "noAnswer")
							.length ===
							scannedChunks.templates.find((chunk) => chunk.key === "noAnswer")
								?.totalParts &&
						scannedChunks.templates.filter((chunk) => chunk.key === "followUp")
							.length ===
							scannedChunks.templates.find((chunk) => chunk.key === "followUp")
								?.totalParts;

					const contactsComplete =
						scannedChunks.contacts.length &&
						scannedChunks.contacts.length ===
							scannedChunks.contacts[0]?.totalChunks;

					if (templatesComplete && contactsComplete) {
						scanner.clear();
						setIsScanning(false);

						// Reconstruct Template Messages
						const reconstructedTemplates = scannedChunks.templates
							.sort((a, b) => a.partIndex - b.partIndex)
							.reduce(
								(acc, chunk) => ({
									...acc,
									[chunk.key]: (acc[chunk.key] || "") + chunk.message,
								}),
								{}
							);

						// Reconstruct Contacts
						const reconstructedContacts = scannedChunks.contacts
							.sort((a, b) => a.chunkIndex - b.chunkIndex)
							.flatMap((chunk) => chunk.contacts);

						setRowData(reconstructedContacts);
						setNoAnswerMessage(reconstructedTemplates.noAnswer || "");
						setFollowUpMessage(reconstructedTemplates.followUp || "");

						setScanProgress("All QR codes scanned and data reconstructed!");
					} else {
						setScanProgress(
							`Scanned ${scannedChunks.templates.length} template parts and ${scannedChunks.contacts.length} contact chunks.`
						);
					}
				} catch (error) {
					setScanProgress("Invalid QR Code data. Please try again.");
				}
			},
			(error) => {
				console.error("QR Code scan error:", error);
			},
			config
		);
	};

	return (
		<div>
			{isScanning && (
				<div>
					<div id="reader" style={{ width: "100%", marginTop: "20px" }}></div>
					<p>{scanProgress}</p> {/* Show progress message */}
					<ul>
						<li>Templates scanned: {scannedTemplates.length}</li>
						<li>Contacts scanned: {scannedContacts.length}</li>
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

export default Scanning;
