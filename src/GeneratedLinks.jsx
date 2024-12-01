import React from "react";
import { Button } from "@mui/material";
import Grid from "@mui/material/Grid2";

const GeneratedLinks = ({
	rowData,
	isMobile,
	followUpMessage,
	noAnswerMessage,
}) => {
	// Utility function to clean and validate phone numbers
	const validateAndFormatNumber = (number) => {
		// Remove all non-numeric characters except +
		const cleanedNumber = number.replace(/[^0-9+]/g, "");

		// If the number starts with +, assume it's already a valid international number
		if (cleanedNumber.startsWith("+")) {
			return cleanedNumber;
		}

		// If the number starts with 0, assume it's a UK local number
		if (cleanedNumber.startsWith("0")) {
			return `+44${cleanedNumber.slice(1)}`; // Replace leading 0 with +44
		}

		// If the number is already in bare format (e.g., 7903123123), assume it's UK and add +44
		if (/^[0-9]{10}$/.test(cleanedNumber)) {
			return `+44${cleanedNumber}`;
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
		const validatedNumber = validateAndFormatNumber(number);
		if (!validatedNumber) return null; // Invalid number, skip generating the link

		const firstName = name.split(" ")[0];

		// Replace +44 with 0 for SMS formatting
		const formattedNumber = validatedNumber.startsWith("+44")
			? `0${validatedNumber.slice(3)}`
			: validatedNumber;

		const encodedMessage = encodeURIComponent(`Hey ${firstName}! ${message}`);
		return `sms://${formattedNumber}?&body=${encodedMessage}`;
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
			<div id="generatedLinks">
				<h2>Generated Links</h2>

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

				<Grid container spacing={4}>
					{rowData.map((row, index) => (
						<Grid size={12} key={index}>
							<Grid container spacing={5}>
								<Grid>
									<strong>{row.name}</strong>
									<br />({row.number})
								</Grid>

								{isMobile && (
									<Grid>
										<center>
											<a
												href={`tel:${formatForTel(row.number)}`}
												target="_blank"
												rel="noopener noreferrer"
											>
												Call
											</a>
										</center>
									</Grid>
								)}

								<Grid>
									{!isLandline(row.number) ? (
										<>
											No answer message
											<div
												style={{
													width: "100%",
													display: "flex",
													justifyContent: "space-around",
												}}
											>
												<a
													href={generateWhatsAppLink(
														row.name,
														row.number,
														noAnswerMessage
													)}
													target="_blank"
													rel="noopener noreferrer"
												>
													WhatsApp
												</a>

												<a
													href={generateSMSLink(
														row.name,
														row.number,
														noAnswerMessage
													)}
													target="_blank"
													rel="noopener noreferrer"
												>
													SMS
												</a>
											</div>
										</>
									) : (
										<em>
											Landline!
											<br />
											Not textable.
										</em>
									)}
								</Grid>

								<Grid>
									{!isLandline(row.number) ? (
										<>
											Follow up message
											<div
												style={{
													width: "100%",
													display: "flex",
													justifyContent: "space-around",
												}}
											>
												<a
													href={generateWhatsAppLink(
														row.name,
														row.number,
														followUpMessage
													)}
													target="_blank"
													rel="noopener noreferrer"
												>
													WhatsApp
												</a>

												<a
													href={generateSMSLink(
														row.name,
														row.number,
														followUpMessage
													)}
													target="_blank"
													rel="noopener noreferrer"
												>
													SMS
												</a>
											</div>
										</>
									) : (
										<></>
									)}
								</Grid>
							</Grid>
						</Grid>
					))}
				</Grid>
			</div>
		);
	} else {
		return <></>;
	}
};

export default GeneratedLinks;
