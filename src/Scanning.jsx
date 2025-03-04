import React, { useState, useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Button } from "@mui/material";

const Scanning = ({
	Translation,
	isMobile,
	rowData,
	setRowData,
	setNoAnswerMessage,
	setFollowUpMessage,
	setExtensionCode, // Ensure this prop is functional
}) => {
	const [isScanning, setIsScanning] = useState(false);
	const [scanProgress, setScanProgress] = useState(""); // Progress message

	const scrollToLinks = () => {
		document
			.getElementById("generatedLinks")
			.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(() => {
		if (scanProgress === Translation.scanSuccess) {
			scrollToLinks();
		}
	}, [scanProgress]);

	useEffect(() => {
		if (!isScanning) return;

		const scannedChunks = [];
		let totalChunks = 0;

		const scanner = new Html5QrcodeScanner("reader", {
			fps: 25,
			qrbox: 800,
		});

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
							`${Translation.scanXofY} ${scannedChunks.length} / ${totalChunks}.`
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
						setExtensionCode(scannedChunks[0].extensionCode);

						setScanProgress(Translation.scanSuccess);
					}
				} catch {
					setScanProgress(Translation.scanInvalid);
				}
			},
			(error) => {
				console.error(Translation.scanError, error);
			}
		);

		// Cleanup the scanner on unmount or when scanning stops
		return () => {
			scanner.clear().catch((err) => console.error(Translation.scanError, err));
		};
	}, [
		isScanning,
		setRowData,
		setNoAnswerMessage,
		setFollowUpMessage,
		setExtensionCode,
	]);

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
						onClick={() => setIsScanning(true)}
						variant="contained"
						style={{
							backgroundColor: "#28a745",
							marginBottom: "14px",
						}}
					>
						{Translation.scanBtn}{" "}
					</Button>
				</center>
			)}
		</div>
	);
};

export default Scanning;
