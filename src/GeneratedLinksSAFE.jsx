import React, { useState } from "react";
import SwipeCard from "./Swiper";
import { Button } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { BtnStyleSmall, LinkBtn } from "./MUIShared";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp, faSignalMessenger } from "@fortawesome/free-brands-svg-icons";
import { faPhone, faSms } from "@fortawesome/free-solid-svg-icons";
import { countries } from "./CountrySelect";

const GeneratedLinks = ({
	Translation,

	rowData,
	isMobile,
	followUpMessage,
	noAnswerMessage,
	extensionCode,
}) => {


	const enableSignal = true;
const [showSignalLinks, setShowSignalLinks] = useState(false);

// Utility function to clean and validate phone numbers
const validateAndFormatNumber = (number) => {
	// Remove all non-numeric characters except +
	const cleanedNumber = number.replace(/[^0-9+]/g, "");

	console.log("cleaned number: ", cleanedNumber);

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
		console.log("starts with 0", `+${extensionCode}${cleanedNumber.slice(1)}`);
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

const generateSignalLink = (number) => {
	const validatedNumber = validateAndFormatNumber(number);
	if (!validatedNumber) return null; // Invalid number, skip

	return `https://signal.me/#p/${validatedNumber}`;
};
	const handleSignalClick = (number, message) => {
		const signalLink = generateSignalLink(number);
		if (!signalLink) return;

		// Copy message to clipboard
		navigator.clipboard
			.writeText(message)
			.then(() => {
				console.log("Message copied to clipboard!");

				// Open Signal link
				window.open(signalLink, "_blank");
			})
			.catch((err) =>
				console.error("Failed to copy message to clipboard:", err)
			);
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




	const [signalModal, setSignalModal] = useState(false)
	const OpenSignalModal = () => {
		console.log('showing signal links')

		setSignalModal(true)
	}


	if (rowData.length > 0) {
		return (
			<div id="generatedLinks" style={{ minHeight: "80vh" }}>
				<h2 className="sarala-bold" style={{ margin: 0 }}>
					Your Links:
				</h2>
				
				<div
					style={{
						display: "flex",
						flexDirection: "row",
						justifyContent: "space-between",
						alignContent: "center",
						width: "100%",
					}}
				>
					<div>
						<Button
							style={{
								...BtnStyleSmall,
								display: enableSignal ? "block" : "none",
							}}
							className="open-button"
							onClick={() => {
								!showSignalLinks && OpenSignalModal();
								setShowSignalLinks(!showSignalLinks);
							}}
						>
							{!showSignalLinks ? "Show" : "Hide"} Signal Links
						</Button>
					</div>

					<div
						style={{
							display: isMobile ? "inline-block" : "none",
						}}
					>
						<SwipeCard
							rowData={rowData}
							extensionCode={extensionCode}
							noAnswerMessage={noAnswerMessage}
							followUpMessage={followUpMessage}
							isMobile={isMobile}
							showSignalLinks={showSignalLinks}
						/>
					</div>
				</div>
				<Grid container spacing={0}>
					{rowData
						.filter((row) => row.name.trim() !== "" || row.number.trim() !== "") // Filter rows
						.map((row, index) => (
							<Grid
								size={12}
								key={index}
								style={{
									paddingTop: "18px",
									paddingBottom: "18px",
									borderBottom: "1px solid grey",
									backgroundColor:
										index % 2 !== 0 ? "rgba(240,240,240,0.5)" : "inherit",
								}}
							>
								<Grid container spacing={1}>
									<Grid size={{ xs: 6, sm: 3, md: 2, xl: 1 }}>
										<center>
											<h2 style={{ margin: 0 }}>{row.name}</h2>
											{formatForTel(row.number) ? (
												<span style={{ fontSize: isMobile ? "12px" : "12px" }}>
													{`${formatForTel(row.number)}`}
												</span>
											) : (
												<em>No number</em>
											)}
										</center>
									</Grid>
									<Grid size={{ xs: 6, sm: 3, md: 2, xl: 1 }}>
										{isMobile && formatForTel(row.number) && (
											<center>
												<a
													href={`tel:${formatForTel(row.number)}`}
													target="_blank"
													rel="noopener noreferrer"
												>
													<Button sx={LinkBtn}>
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
									</Grid>

									<Grid size={{ xs: 6, sm: 3, md: 2, xl: 1 }}>
										{!row.number ? (
											<></>
										) : !isLandline(row.number) ? (
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
														row.name,
														row.number,
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
														row.name,
														row.number,
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

												{showSignalLinks && !isLandline(row.number) && (
													<Button
														sx={LinkBtn}
														onClick={() =>
															handleSignalClick(
																row.number,
																`Hey ${
																	row.name.split(" ")[0]
																}! ${noAnswerMessage}`
															)
														}
													>
														<FontAwesomeIcon
															icon={faSignalMessenger} // Replace this with a Signal icon if you have one
															size="2x"
															style={{ marginRight: "5px" }}
														/>
														Signal
													</Button>
												)}
											</div>
										) : (
											<center>
												<em>Not textable.</em>
											</center>
										)}
									</Grid>

									<Grid size={{ xs: 6, sm: 3, md: 2, xl: 1 }}>
										{!row.number ? (
											<></>
										) : !isLandline(row.number) && followUpMessage !== "" ? (
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
														row.name,
														row.number,
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
														row.name,
														row.number,
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
												{showSignalLinks && !isLandline(row.number) && (
													<Button
														sx={LinkBtn}
														onClick={() =>
															handleSignalClick(
																row.number,
																`Hey ${
																	row.name.split(" ")[0]
																}! ${followUpMessage}`
															)
														}
													>
														<FontAwesomeIcon
															icon={faSignalMessenger} // Replace this with a Signal icon if you have one
															size="2x"
															style={{ marginRight: "5px" }}
														/>
														Signal
													</Button>
												)}
											</div>
										) : (
											<></>
										)}
									</Grid>
								</Grid>
							</Grid>
						))}
				</Grid>

				<div
					style={{
						display: isMobile ? "block" : "none",
						marginTop: "10px",
					}}
				>
					<center>
						<SwipeCard
							rowData={rowData}
							extensionCode={extensionCode}
							noAnswerMessage={noAnswerMessage}
							followUpMessage={followUpMessage}
							isMobile={isMobile}
						/>
					</center>
				</div>

				{signalModal && (
					<div
						onClick={() => setSignalModal(false)}
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
								Using Signal
							</h2>

							<p
								style={{
									textAlign: "left",
									padding: "0 20px",
									marginTop: 0,
									zIndex: 5,
									position: "relative",
								}}
							>
								Please note that Signal doesn't allow 'pre-filled' links like
								WhatsApp or SMS does. To get around that, clicking the 'Signal'
								button on a contact will do two things:
								<ol>
									<li>
										Open the Signal app and start a conversation with your
										contact (provided they're on Signal and can be messaged!)
									</li>
									<li>Copy the relevant message to your clipboard</li>
								</ol>
								That means you just need to click the button to start the
								conversation with your contact, and then <b>paste</b> your
								message in.
							</p>

							<center>
								<Button
									style={BtnStyleSmall}
									onClick={() => setSignalModal(false)}
								>
									Got it!
								</Button>
							</center>
						</div>
					</div>
				)}
			</div>
		);
	} else {
		return <></>;
	}
};

export default GeneratedLinks;
