import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import { Button, TextField } from "@mui/material";
import { BtnStyleSmall } from "./MUIShared";
import Grid from "@mui/material/Grid2";

const GenerateMobileData = ({
	Translation,

	rowData,
	isMobile,
	followUpMessage,
	noAnswerMessage,
	extensionCode,
}) => {
	const [qrCodes, setQrCodes] = useState([]);
	const [currentQrIndex, setCurrentQrIndex] = useState(0);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [numBatches, setNumBatches] = useState(1);
	const [currentBatchIndex, setCurrentBatchIndex] = useState(0);
	const [batchQrData, setBatchQrData] = useState([]); // Stores QR codes per batch

	const [hosting, setHosting] = useState(false);

	const [rotateSpeed, setRotateSpeed] = useState(1000);

	const generateMobileData = async () => {
		if (numBatches < 1) return;

		const maxChunkSize = 800;
		const templateMessages = {
			noAnswer: noAnswerMessage,
			followUp: followUpMessage,
		};

		// Split contacts into batches
		const batchSize = Math.ceil(rowData.length / numBatches);
		const batches = Array.from({ length: numBatches }, (_, i) =>
			rowData.slice(i * batchSize, (i + 1) * batchSize)
		);

		const batchQrCodes = [];

		for (const batch of batches) {
			const dataChunks = [];
			const qrChunks = [];

			// Step 1: Add template messages to chunks
			for (const [key, message] of Object.entries(templateMessages)) {
				let partIndex = 0;
				while (partIndex * maxChunkSize < message.length) {
					const chunk = {
						key,
						partIndex: partIndex + 1,
						totalParts: 0, // Placeholder
						data: message.slice(
							partIndex * maxChunkSize,
							(partIndex + 1) * maxChunkSize
						),
						extensionCode,
					};
					dataChunks.push(chunk);
					partIndex++;
				}
			}

			// Step 2: Add contacts to chunks
			const estimatedContactSize = JSON.stringify(batch[0] || {}).length + 50;
			const contactsPerChunk = Math.floor(maxChunkSize / estimatedContactSize);

			for (let i = 0; i < batch.length; i += contactsPerChunk) {
				const chunk = {
					partIndex: dataChunks.length + 1,
					totalParts: 0, // Placeholder
					data: batch.slice(i, i + contactsPerChunk),
					extensionCode,
				};
				dataChunks.push(chunk);
			}

			// Step 3: Set totalParts for all chunks
			const totalParts = dataChunks.length;
			dataChunks.forEach((chunk, index) => {
				chunk.totalParts = totalParts;
				chunk.partIndex = index + 1;
			});

			// Step 4: Generate QR codes
			for (const chunk of dataChunks) {
				try {
					const qrCodeUrl = await QRCode.toDataURL(JSON.stringify(chunk), {
						errorCorrectionLevel: "H",
						width: 600,
					});
					qrChunks.push(qrCodeUrl);
				} catch (error) {
					console.error("Error generating QR code:", error);
					return;
				}
			}

			batchQrCodes.push(qrChunks);
		}

		setBatchQrData(batchQrCodes);
		setCurrentBatchIndex(0);
		setQrCodes(batchQrCodes[0]);
	};

	useEffect(() => {
		generateMobileData();
	}, [numBatches]);

	useEffect(() => {
		if (qrCodes.length > 0) {
			const interval = setInterval(() => {
				setCurrentQrIndex((prevIndex) => (prevIndex + 1) % qrCodes.length);
			}, rotateSpeed);
			return () => clearInterval(interval);
		}
	}, [qrCodes, rotateSpeed]);

	const nextBatch = () => {
		if (currentBatchIndex < batchQrData.length - 1) {
			setCurrentBatchIndex(currentBatchIndex + 1);
			setQrCodes(batchQrData[currentBatchIndex + 1]);
			setCurrentQrIndex(0);
		}
	};

	const prevBatch = () => {
		if (currentBatchIndex > 0) {
			setCurrentBatchIndex(currentBatchIndex - 1);
			setQrCodes(batchQrData[currentBatchIndex - 1]);
			setCurrentQrIndex(0);
		}
	};

	const baseURL = window.location.host;

	const handleHosting = () => {
		if (!hosting) {
			setHosting(true);
		} else {
			setNumBatches(1);
			setHosting(false);
		}
	};

	const openModal = () => {
		generateMobileData();
		setIsModalOpen(true);
	};

	const closeModal = () => {
		setIsModalOpen(false);
		setHosting(false);
	};

	const openHostModal = () => {
		setHosting(true);
		generateMobileData();
		setIsModalOpen(true);
	};

	return (
		<>
			{!isMobile && (
				<>
					<Button
						variant="contained"
						sx={BtnStyleSmall}
						onClick={() => openModal()}
						disabled={rowData.length === 0}
					>
						Send from mobile
					</Button>

					<Button
						variant="contained"
						sx={{ ...BtnStyleSmall, marginLeft: isMobile ? 0 : "20px" }}
						onClick={() => openHostModal()}
						disabled={rowData.length === 0}
					>
						Host a session
					</Button>
				</>
			)}

			{isModalOpen && (
				<div
					onClick={() => closeModal()}
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
						onClick={(e) => e.stopPropagation()}
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
						<p
							style={{
								textAlign: "left",
								padding: "0 20px",
								marginTop: 0,
								zIndex: 5,
								display: !hosting ? "block" : "none",
								position: "relative",
							}}
						>
							To send your messages from your phone, simply open{" "}
							<u>{baseURL}/start</u> from your mobile, hit "Scan from desktop"
							and scan the below QR code{qrCodes.length > 1 && <>s</>}.
							{qrCodes.length > 1 && !hosting && (
								<>
									<br />
									<br />
									<em>"Why are there so many?? Why are they changing??"</em>
									<br />
									QR codes can only contain a relatively small amount of data,
									so your template messages and contacts' details are split up
									into a few different ones. But when you scan from your mobile,
									it will take them all in and combine them - just hold your
									phone's camera up as they flip through and it will do the rest
									for you!
								</>
							)}
						</p>
						{hosting && (
							<>
								<p
									style={{
										textAlign: "left",
										padding: "0 20px",
										marginTop: 0,
										marginBottom: 0,
										zIndex: 5,
										display: "block",
										position: "relative",
									}}
								>
									If you are hosting a phone- or text-banking session, you can
									divvy up the contacts between attendees. Just say how many
									people you want to split it up by, and each user will get a
									set of QR codes with the template message(s) and their portion
									of the contacts.
								</p>
								<div>
									<Grid
										container
										spacing={2}
										style={{
											width: "80%",
											margin: "0 auto",
											position: "relative",
											zIndex: "2",
										}}
										justifyContent={"center"}
										alignItems={"center"}
									>
										<Grid size={{ xs: 6 }}>
											<h4 style={{ textAlign: "left" }}>
												How many people are you splitting between?
											</h4>
										</Grid>{" "}
										<Grid>
											<TextField
												type="number"
												value={numBatches}
												onChange={(e) =>
													setNumBatches(
														Math.max(1, parseInt(e.target.value, 10) || 1)
													)
												}
												sx={{
													width: "120px",
													marginRight: "10px",
													position: "relative",
													zIndex: "2",
												}}
											/>
										</Grid>
									</Grid>
									{numBatches > 1 && (
										<div>
											<p style={{ textAlign: "left", padding: "0 20px" }}>
												Once each person has scanned, you can use these buttons
												to generate the QR codes for the next user.
											</p>

											<Button
												variant="contained"
												sx={{
													...BtnStyleSmall,
													position: "relative",
													zIndex: "2",
													marginRight: "5px",
												}}
												onClick={prevBatch}
												disabled={currentBatchIndex === 0}
											>
												Previous
											</Button>

											<Button
												variant="contained"
												sx={{
													...BtnStyleSmall,
													position: "relative",
													zIndex: "2",
													marginLeft: "5px",
												}}
												onClick={nextBatch}
												disabled={currentBatchIndex === batchQrData.length - 1}
											>
												Next
											</Button>
											<br />
											<br />
										</div>
									)}
								</div>
							</>
						)}
						{hosting && numBatches > 1 && (
							<h3
								style={{
									margin: 0,
									display: "block",
									position: "relative",
									zIndex: "2",
									marginBottom: "5px",
								}}
							>
								User {currentBatchIndex + 1}
							</h3>
						)}
						<img
							src={qrCodes[currentQrIndex]}
							alt="QR Code"
							style={{
								maxWidth: "500px",
								height: "auto",
								position: "relative",
								zIndex: 1,
								margin: "-10px",
							}}
						/>
						<span
							style={{
								display: "block",
								position: "relative",
								zIndex: 5,
							}}
						>
							QR Code {currentQrIndex + 1} of {qrCodes.length}
						</span>
						<br />
						<Button
							variant="contained"
							sx={BtnStyleSmall}
							onClick={() => closeModal()}
						>
							Close
						</Button>{" "}
						<Button
							variant="contained"
							sx={BtnStyleSmall}
							onClick={() => setRotateSpeed(1500)}
						>
							Too fast?
						</Button>
						<br />
					</div>
				</div>
			)}
		</>
	);
};

export default GenerateMobileData;