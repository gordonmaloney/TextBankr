import React from "react";

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
			<div>
				<h2>Generated Links</h2>
				<ul>
					{rowData.map((row, index) => (
						<li key={index}>
							<p>
								<strong>{row.name}</strong> ({row.number})
							</p>
							<div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
								{isMobile && (
									<a
										href={`tel:${formatForTel(row.number)}`}
										target="_blank"
										rel="noopener noreferrer"
									>
										Call
									</a>
								)}

								<a
									href={generateWhatsAppLink(
										row.name,
										row.number,
										noAnswerMessage
									)}
									target="_blank"
									rel="noopener noreferrer"
								>
									WhatsApp - No Answer
								</a>
								<a
									href={generateSMSLink(row.name, row.number, noAnswerMessage)}
									target="_blank"
									rel="noopener noreferrer"
								>
									SMS - No Answer
								</a>

								{followUpMessage && <>
									<a
										href={generateWhatsAppLink(
											row.name,
											row.number,
											followUpMessage
										)}
										target="_blank"
										rel="noopener noreferrer"
									>
										WhatsApp - Follow Up
									</a>
									<a
										href={generateSMSLink(row.name, row.number, followUpMessage)}
										target="_blank"
										rel="noopener noreferrer"
									>
										SMS - Follow Up
									</a>
								</>}
							</div>
						</li>
					))}
				</ul>
			</div>
		);
	} else {
		return <></>;
	}
};

export default GeneratedLinks;
