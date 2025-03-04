import React from "react";
import SwipeCard from "./Swiper";
import { Button } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { LinkBtn } from "./MUIShared";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
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

	if (rowData.length > 0) {
		return (
			<div id="generatedLinks" style={{ minHeight: "80vh" }}>
				<h2 className="sarala-bold" style={{ marginBottom: "-18px" }}>
					Your Links:
				</h2>
				<Button
					variant="contained"
					size="small"
					style={{ display: "none" }}
					disabled={rowData.length == 0}
					onClick={() =>
						document
							.getElementById("header")
							.scrollIntoView({ behavior: "smooth" })
					}
				>
					Edit template messages and data
				</Button>

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
											</div>
										) : (
											<></>
										)}
									</Grid>
								</Grid>
							</Grid>
						))}
				</Grid>

				<div style={{
					display: isMobile ? "block" : "none",
					marginTop: '10px'
				}}>
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
			</div>
		);
	} else {
		return <></>;
	}
};

export default GeneratedLinks;
