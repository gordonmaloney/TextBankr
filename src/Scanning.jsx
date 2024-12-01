import React, { useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Button } from "@mui/material";

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
	const [totalTemplates, setTotalTemplates] = useState(0); // Total template QR codes
	const [totalContacts, setTotalContacts] = useState(0); // Total contact QR codes

	const startScanning = () => {
		setIsScanning(true);
		const scannedChunks = [];
		let totalChunks = 0; // Total expected chunks, initially unknown

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

					// Add unique chunks only
					if (!scannedChunks.some((c) => c.partIndex === chunk.partIndex)) {
						scannedChunks.push(chunk);

						// Set total chunks once it's known
						if (!totalChunks) {
							totalChunks = chunk.totalParts;
						}

						setScanProgress(
							`Scanned ${scannedChunks.length} of ${totalChunks} QR codes.`
						);
					}

					// If all chunks are scanned
					if (scannedChunks.length === totalChunks) {
						scanner.clear();
						setIsScanning(false);

						// Reconstruct Data
						const reconstructedTemplates = {};
						const reconstructedContacts = [];

						scannedChunks
							.sort((a, b) => a.partIndex - b.partIndex)
							.forEach((chunk) => {
								if (chunk.key) {
									// If chunk has a "key", it's a template message
									reconstructedTemplates[chunk.key] =
										(reconstructedTemplates[chunk.key] || "") + chunk.data;
								} else if (Array.isArray(chunk.data)) {
									// If chunk.data is an array, it's part of the contacts
									reconstructedContacts.push(...chunk.data);
								}
							});

						// Update State
						setRowData(reconstructedContacts);
						setNoAnswerMessage(reconstructedTemplates.noAnswer || "");
						setFollowUpMessage(reconstructedTemplates.followUp || "");

						setScanProgress("All QR codes scanned and data reconstructed!");
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
				</div>
			)}

			{/* Scan QR Code from Desktop Button */}
			{isMobile && (
				<center>
					<Button
						onClick={startScanning}
						variant="contained"
						style={{
							backgroundColor: "#28a745",
							marginY: "14px",
						}}
					>
						Scan Data from Desktop
					</Button>
				</center>
			)}
		</div>
	);
};

export default Scanning;
