import React, { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { Button } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { BtnStyleSmall, LinkBtn, LinkBtnLarge } from "./MUIShared";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { faPhone, faSms } from "@fortawesome/free-solid-svg-icons";
import { countries } from "./CountrySelect";
import ReactLoading from "react-loading";

const SwipeCard = ({
	rowData,
	extensionCode,
	followUpMessage,
	noAnswerMessage,
	isMobile,
}) => {
	const [index, setIndex] = useState(0);

	const [isOpen, setIsOpen] = useState(false); // Overlay open state

	const [loading, setLoading] = useState(false);
	useEffect(() => {
		setLoading(true);
		const timer = setTimeout(() => {
			setLoading(false);
		}, 200);
	}, [index]);

	useEffect(() => {
		console.log("Loading:", loading);
	}, [loading]);

	//fading consts
	const [offset, setOffset] = useState(0); // Track absolute negative offset

	const x = useMotionValue(0);
	const rotate = useTransform(x, [-200, 200], [-8, 8]);
	const overlayRef = useRef(null);

	const handleDragEnd = (event, info) => {
		if (info.offset.x > 200) {
			if (index > 0) {
				setIndex((prev) => Math.max(prev - 1, 0));
			}
			x.set(0);
		} else if (info.offset.x < -200) {
			if (index < rowData.length) {
				setIndex((prev) => Math.min(prev + 1, rowData.length));
			}
			x.set(0);
		} else {
			x.set(0);
		}
	};

	const handleOutsideClick = (e) => {
		if (overlayRef.current && !overlayRef.current.contains(e.target)) {
			setIsOpen(false); // Close overlay if clicked outside
		}
	};

	const handleOpenOverlay = () => {
		setIndex(0); // Reset to first card
		setIsOpen(true); // Open overlay
	};

	const handleCloseOverlay = () => {
		setIsOpen(false); // Close overlay
	};

	//handle numbers
	// Utility function to clean and validate phone numbers
	const validateAndFormatNumber = (number) => {
		// Remove all non-numeric characters except +
		const cleanedNumber = number.replace(/[^0-9+]/g, "");
		// If the number starts with +, assume it's already a valid international number
		if (cleanedNumber.startsWith("+")) {
			return cleanedNumber;
		}

		for (const country of countries) {
			if (cleanedNumber.startsWith(country.code.replace("+", ""))) {
				console.log(`Starts with ${country.code} (${country.name})`);
				return `+${cleanedNumber}`;
			}
		}

		// If the number starts with 0, assume it's a UK local number
		if (cleanedNumber.startsWith("0")) {
			console.log(
				"starts with 0",
				`+${extensionCode}${cleanedNumber.slice(1)}`
			);
			return `+${extensionCode}${cleanedNumber.slice(1)}`; // Replace leading 0 with +44
		}

		// If the number is already in bare format (e.g., 7903123123), assume it's UK and add +44
		if (/^[0-9]{10}$/.test(cleanedNumber)) {
			return `${extensionCode}${cleanedNumber}`;
		}

		// If it doesn't match any valid format, return null
		return null;
	};

	const generateWhatsAppLink = (name, number, message) => {
		const validatedNumber = validateAndFormatNumber(number);
		if (!validatedNumber) return null; // Invalid number, skip generating the link

		const firstName = name.split(" ")[0]; // Extract first name
		const encodedMessage = encodeURIComponent(`Hey ${firstName}! ${message}`);
		return `https://api.whatsapp.com/send?phone=${validatedNumber.replace(
			"+",
			""
		)}&text=${encodedMessage}`;
	};

	const generateSMSLink = (name, number, message) => {
		console.log("generating sms link :", number);
		const validatedNumber = validateAndFormatNumber(number);
		if (!validatedNumber) return null; // Invalid number, skip generating the link

		const firstName = name.split(" ")[0];

		// Replace +44 with 0 for SMS formatting
		const formattedNumber = validatedNumber.startsWith("+44")
			? `0${validatedNumber.slice(3)}`
			: validatedNumber;

		const encodedMessage = encodeURIComponent(`Hey ${firstName}! ${message}`);
		return `sms:${formattedNumber}?&body=${encodedMessage}`;
	};

	const formatForTel = (number) => {
		const validatedNumber = validateAndFormatNumber(number);
		if (!validatedNumber) return null; // Invalid number, skip formatting

		return validatedNumber;
	};

	const isLandline = (number) => {
		// Remove all non-numeric characters except +
		const cleanedNumber = number.replace(/[^0-9+]/g, "");

		// Extract the first few digits for analysis
		let numberPrefix = cleanedNumber;

		// Check if number starts with a country code
		let countryCode = null;
		for (const country of countries) {
			const strippedCode = country.code.replace("+", ""); // Remove +
			if (numberPrefix.startsWith(strippedCode)) {
				countryCode = strippedCode;
				numberPrefix = numberPrefix.slice(strippedCode.length); // Remove country code
				break; // Stop checking after finding the first match
			}
		}

		// Handle numbers starting with + (international)
		if (cleanedNumber.startsWith("+")) {
			numberPrefix = cleanedNumber.slice(1); // Remove the +
		}

		// Handle UK numbers specifically
		if (numberPrefix.startsWith("44")) {
			numberPrefix = numberPrefix.slice(2); // Remove the country code
		} else if (numberPrefix.startsWith("0")) {
			numberPrefix = numberPrefix.slice(1); // Remove leading 0 for local numbers
		}

		// Check if the number is likely a landline
		const landlinePrefixes = ["01", "02", "03", "1", "2", "3"];
		const isLandline = landlinePrefixes.some((prefix) =>
			numberPrefix.startsWith(prefix)
		);

		// Return true if landline, false otherwise
		return isLandline;
	};


const [isVisible, setIsVisible] = useState(false);
const [isFading, setIsFading] = useState(false);

useEffect(() => {
	if (!isVisible && isOpen) {
		setIsVisible(true);
	}
}, [isOpen]);

useEffect(() => {
	if (isOpen) {
		// Reset fading state if reopening
		setIsFading(false);

		// Hide element after 4 seconds
		const timer = setTimeout(() => {
			setIsFading(true); // Start fade-out effect
			setTimeout(() => setIsVisible(false), 500); // Wait for fade-out to complete
		}, 4000);

		return () => clearTimeout(timer); // Cleanup timer
	}
}, [isOpen]);

return (
	<>
		<div
			className={`swipe-explainer ${isFading ? "fade-out" : ""}`}
			style={{
				zIndex: 10000,
				position: "fixed",
				top: 20,
				left: 0,
				width: "80%",
				margin: "0 10%",
				backgroundColor: "white",
				borderRadius: "10px",
				display: isVisible && isOpen ? "block" : "none",
			}}
		>
			<center>
				<h3 className="sarala-bold" style={{ margin: "5px", lineHeight: '20px' }}>
					Swipe left or right to navigate through your contacts
				</h3>
			</center>
		</div>

		<Button
			style={{
				// display: "none",
				...BtnStyleSmall,
			}}
			className="open-button"
			onClick={handleOpenOverlay}
		>
			View as cards
		</Button>

		{isOpen && (
			<div className="overlay" onClick={handleOutsideClick}>
				<div
					className="card-container"
					ref={overlayRef}
					onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on the card
				>
					<motion.div
						className={index < rowData.length ? "card" : "end-card"}
						style={{
							x,
							rotate,
							zIndex: 1,
							scale: 1,
							opacity: 1,
							boxShadow: "0 8px 30px rgba(0, 0, 0, 0.3)",
						}}
						drag="x"
						dragConstraints={{ left: 0, right: 0 }}
						onDrag={(event, info) => {
							const absOffset = Math.abs(info.offset.x) * -1; // Make offset always negative
							setOffset(absOffset); // Update offset state
						}}
						onDragEnd={handleDragEnd}
						initial={{ opacity: 1, x: 300 }} /* SWIPE IN FROM RIGHT */
						animate={{ opacity: 1, x: 0 }} /* SWIPE IN ANIMATION */
						transition={{ duration: 0.3 }}
					>
						{loading ? (
							<div style={{ textAlign: "left" }}>
								<h2 className="loading"></h2>
							</div>
						) : (
							<>
								{index < rowData.length ? (
									<div className="card-content">
										<h4 className="card-header">
											Contact {index + 1} of {rowData.length}
										</h4>

										<div className="card-body">
											<div>
												<h2 style={{ marginBottom: "0" }}>
													{rowData[index].name}
												</h2>
												<p style={{ marginTop: "0" }}>
													{rowData[index].number}
												</p>
												{isMobile && formatForTel(rowData[index].number) && (
													<center>
														<a
															href={`tel:${formatForTel(
																rowData[index].number
															)}`}
															target="_blank"
															rel="noopener noreferrer"
														>
															<Button sx={LinkBtnLarge}>
																<FontAwesomeIcon
																	icon={faPhone}
																	size="2x"
																	style={{ marginRight: "5px" }}
																/>
																Call
															</Button>
														</a>
													</center>
												)}
											</div>
											<Grid
												size={12}
												key={index}
												style={{
													paddingTop: "18px",
													paddingBottom: "18px",
													borderBottom: "1px solid grey",
												}}
											>
												<Grid container spacing={1}>
													<Grid
														size={{
															xs: followUpMessage ? 6 : 12,
															sm: 3,
															md: 2,
															xl: 1,
														}}
													>
														{!rowData[index].number ? (
															<></>
														) : !isLandline(rowData[index].number) ? (
															<div
																style={{
																	width: "100%",
																	display: "flex",
																	flexDirection: "column",
																	justifyItems: "center",
																	alignItems: "center",
																}}
															>
																<b>Template 1</b>

																<a
																	href={generateWhatsAppLink(
																		rowData[index].name,
																		rowData[index].number,
																		noAnswerMessage
																	)}
																	target="_blank"
																	rel="noopener noreferrer"
																>
																	<Button sx={LinkBtn}>
																		<FontAwesomeIcon
																			icon={faWhatsapp}
																			size="2x"
																			style={{ marginRight: "5px" }}
																		/>
																		WhatsApp
																	</Button>
																</a>
																<a
																	href={generateSMSLink(
																		rowData[index].name,
																		rowData[index].number,
																		noAnswerMessage
																	)}
																	rel="noopener noreferrer"
																>
																	<Button sx={LinkBtn}>
																		<FontAwesomeIcon
																			icon={faSms}
																			size="2x"
																			style={{ marginRight: "5px" }}
																		/>
																		SMS
																	</Button>
																</a>
															</div>
														) : (
															<center>
																<em>Not textable.</em>
															</center>
														)}
													</Grid>

													<Grid size={{ xs: 6, sm: 3, md: 2, xl: 1 }}>
														{!rowData[index].number ? (
															<></>
														) : !isLandline(rowData[index].number) &&
														  followUpMessage !== "" ? (
															<div
																style={{
																	width: "100%",
																	display: "flex",
																	flexDirection: "column",
																	justifyItems: "center",
																	alignItems: "center",
																}}
															>
																<b>Template 2</b>
																<a
																	href={generateWhatsAppLink(
																		rowData[index].name,
																		rowData[index].number,
																		followUpMessage
																	)}
																	target="_blank"
																	rel="noopener noreferrer"
																>
																	<Button sx={LinkBtn}>
																		<FontAwesomeIcon
																			icon={faWhatsapp}
																			size="2x"
																			style={{ marginRight: "5px" }}
																		/>
																		WhatsApp
																	</Button>
																</a>
																<a
																	href={generateSMSLink(
																		rowData[index].name,
																		rowData[index].number,
																		followUpMessage
																	)}
																	rel="noopener noreferrer"
																>
																	<Button sx={LinkBtn}>
																		<FontAwesomeIcon
																			icon={faSms}
																			size="2x"
																			style={{ marginRight: "5px" }}
																		/>
																		SMS
																	</Button>
																</a>
															</div>
														) : (
															<></>
														)}
													</Grid>
												</Grid>
											</Grid>
										</div>
									</div>
								) : (
									<div className="end-card-content">
										<h3>You've reached the end of your contacts!</h3>
										<br /> <br />
										<Button style={BtnStyleSmall} onClick={handleCloseOverlay}>
											Close
										</Button>
									</div>
								)}
							</>
						)}
					</motion.div>
				</div>
			</div>
		)}
	</>
);
};

export default SwipeCard;
