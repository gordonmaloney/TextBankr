import React from "react";
import { Button } from "@mui/material";
import Grid from "@mui/material/Grid2";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhone, faSms } from "@fortawesome/free-solid-svg-icons";
import {
	faWhatsapp,
	faSignalMessenger,
	faTelegram,
} from "@fortawesome/free-brands-svg-icons";

import { LinkBtn, LinkBtnLarge } from "./MUIShared";
import useContactLinks from "./hooks/useContactLinks";

export const CallBtn = ({ isMobile, formatForTel, number, format }) => {
	return (
		<>
			{isMobile && formatForTel(number) && (
				<center>
					<a
						href={`tel:${formatForTel(number)}`}
						target="_blank"
						rel="noopener noreferrer"
					>
						<Button sx={format == "list" ? LinkBtn : LinkBtnLarge}>
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
		</>
	);
};

export const BtnBlock = ({
	name,
	number,
	message,
	template,
	format,
	extensionCode,
    showSignalLinks,
    isMobile
}) => {
	const {
		validateAndFormatNumber,
		generateWhatsAppLink,
		generateSMSLink,
		generateSignalLink,
		isLandline,
		formatForTel,
		handleSignalClick,
        generateTelegramLink,
		toggleSignalLinks,
		signalModal,
		setSignalModal,
		enableSignal,
	} = useContactLinks(extensionCode);

	console.log("show signal? " + showSignalLinks);
	return (
		<>
			{!number ? (
				<></>
			) : !isLandline(number) ? (
				<div
					style={{
						width: "100%",
						display: "flex",
						flexDirection: "column",
						justifyItems: "center",
						alignItems: "center",
					}}
				>
					<b>{template}</b>

					<a
						href={generateWhatsAppLink(name, number, message)}
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
						href={generateSMSLink(name, number, message)}
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

					{showSignalLinks && !isLandline(number) && (
						<Button
							sx={LinkBtn}
							onClick={() =>
								handleSignalClick(
									number,
									`Hey ${name.split(" ")[0]}! ${message}`
								)
							}
						>
							<FontAwesomeIcon
								icon={faSignalMessenger}
								size="2x"
								style={{ marginRight: "5px" }}
							/>
							Signal
						</Button>
					)}

					{showSignalLinks && !isLandline(number) && (
						<a
							href={generateTelegramLink(name, number, message, isMobile)}
							rel="noopener noreferrer"
							target="_blank"
						>
							<Button sx={LinkBtn}>
								<FontAwesomeIcon
									icon={faTelegram}
									size="2x"
									style={{ marginRight: "5px" }}
								/>
								Telegram
							</Button>
						</a>
					)}
				</div>
			) : (
				<center>
					<em>Not textable.</em>
				</center>
			)}
		</>
	);
};
