import React from "react";
import { Button } from "@mui/material";
import Grid from "@mui/material/Grid2";

const GeneratedLinks = ({
	rowData,
	isMobile,
	followUpMessage,
	noAnswerMessage,
}) => {
	const generateWhatsAppLink = (name, number, message) => {
		const firstName = name.split(" ")[0]; // Extract first name
		const formattedNumber = `44${number}`; // Add country code
		const encodedMessage = encodeURIComponent(`Hey ${firstName}! ${message}`);
		return `https://api.whatsapp.com/send?phone=${formattedNumber}&text=${encodedMessage}`;
	};

	const generateSMSLink = (name, number, message) => {
		const firstName = name.split(" ")[0];
		const formattedNumber = `0${number}`; // Format for SMS
		const encodedMessage = encodeURIComponent(`Hey ${firstName}! ${message}`);
		return `sms://${formattedNumber}?&body=${encodedMessage}`;
	};

	const formatForTel = (number) => `+44${number}`;

	if (rowData.length > 0) {
		return (
			<div id="generatedLinks">
				<h2>Generated Links</h2>

				<Button
					variant="contained"
					size="small"
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
								<Grid size={3}>
									<strong>{row.name}</strong>
									<br />({row.number})
								</Grid>

								{isMobile && (
									<Grid size={3}>
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

								<Grid size={3}>
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
								</Grid>

								<Grid size={3}>
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
