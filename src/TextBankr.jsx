import React, { useState, useEffect } from "react";
import GeneratedLinks from "./GeneratedLinks";
import Grid from "./Grid";
import GenerateMobileData from "./GenerateMobileData";
import Scanning from "./Scanning";
import InputFields from "./InputFields";

const TextBankr = () => {
	const [rowData, setRowData] = useState([]);
	const [noAnswerMessage, setNoAnswerMessage] = useState("");
	const [followUpMessage, setFollowUpMessage] = useState("");

	const [isMobile, setIsMobile] = useState(false);

	// Detect mobile devices
	useEffect(() => {
		const checkMobile = () => {
			const userAgent = navigator.userAgent || navigator.vendor || window.opera;
			setIsMobile(/android|iphone|ipad|ipod|mobile/i.test(userAgent));
		};
		checkMobile();
	}, []);

	const handlePaste = (event) => {
		// Check if the paste target is an input or textarea to avoid interfering
		if (
			event.target.tagName === "TEXTAREA" ||
			event.target.tagName === "INPUT"
		) {
			return;
		}

		event.preventDefault();
		const clipboardData = event.clipboardData.getData("text/plain");
		const rows = clipboardData.split("\n").filter((row) => row.trim() !== "");
		const parsedData = rows.map((row) => row.split("\t"));

		const formattedData = parsedData.map((cells) => ({
			name: cells[0] || "",
			number: cells[1] || "",
		}));

		setRowData(formattedData);
	};

	useEffect(() => {
		const globalPasteHandler = (event) => {
			handlePaste(event);
		};

		document.addEventListener("paste", globalPasteHandler);
		return () => {
			document.removeEventListener("paste", globalPasteHandler);
		};
	}, []);


	return (
		<div style={{ padding: "20px" }}>
			<h1>TextBankr</h1>


			<InputFields
				noAnswerMessage={noAnswerMessage}
				setNoAnswerMessage={setNoAnswerMessage}
				followUpMessage={followUpMessage}
				setFollowUpMessage={setFollowUpMessage}
			/>

			<Grid rowData={rowData} />

			<GenerateMobileData
				rowData={rowData}
				isMobile={isMobile}
				followUpMessage={followUpMessage}
				noAnswerMessage={noAnswerMessage}
			/>

			<GeneratedLinks
				rowData={rowData}
				isMobile={isMobile}
				followUpMessage={followUpMessage}
				noAnswerMessage={noAnswerMessage}
			/>

			<Scanning
				isMobile={isMobile}
				setRowData={setRowData}
				setNoAnswerMessage={setNoAnswerMessage}
				setFollowUpMessage={setFollowUpMessage}
			/>
		</div>
	);
};

export default TextBankr;
