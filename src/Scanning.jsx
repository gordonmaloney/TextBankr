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



	//if redirected from camera scan, set is scanning to true right away
	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const dataParam = urlParams.get("data");

		if (dataParam) {
			console.log("Data parameter found in URL.");
			setIsScanning(true);
		}
	}, []);


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
					// CHANGED SCANNING BIT
					// Check if scanned data is a URL
					let chunk; // Declare chunk at the start

					if (decodedText.startsWith("http")) {
						const url = new URL(decodedText);
						const dataParam = url.searchParams.get("data");

						if (dataParam) {
							try {
								const decodedData = JSON.parse(decodeURIComponent(dataParam));

								chunk = decodedData; // Assign decoded data to chunk
							} catch (err) {
								console.error("Failed to decode data:", err);
								setScanProgress(Translation.scanInvalid);
								return;
							}
						} else {
							console.warn("No data parameter found in URL.");
							setScanProgress(Translation.scanInvalid);
							return;
						}
					} else {
						try {
							chunk = JSON.parse(decodedText); // Assign decodedText directly if not a URL
						} catch (err) {
							console.error("Failed to parse JSON:", err);
							setScanProgress(Translation.scanInvalid);
							return;
						}
					}

					/*UNCHANGED SCANNING BIT
					const chunk = JSON.parse(decodedText); */

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
