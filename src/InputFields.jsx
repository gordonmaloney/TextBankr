import React, { useState, useEffect} from "react";
import { TextField, Button } from "@mui/material";

const InputFields = ({
	followUpMessage,
	setFollowUpMessage,
	noAnswerMessage,
	setNoAnswerMessage,
}) => {
	const [secondField, setSecondField] = useState(false);

	useEffect(() => {
		followUpMessage && setSecondField(true);
	}, [followUpMessage]);

	return (
		<div style={{ marginBottom: "20px" }}>
			<TextField
				label="No Answer Message:"
				multiline
				fullWidth
				rows={4}
				value={noAnswerMessage}
				onChange={(e) => setNoAnswerMessage(e.target.value)}
				placeholder="Type your 'No Answer' message here"
			/>
			<br />
			<br />
			{!secondField ? (
				<Button
					variant="contained"
					size="small"
					onClick={() => setSecondField(true)}
				>
					Add second template
				</Button>
			) : (
				<TextField
					label="Follow up message"
					value={followUpMessage}
					onChange={(e) => setFollowUpMessage(e.target.value)}
					placeholder="Type your 'Follow Up' message here"
					multiline
					fullWidth
					rows={4}
				/>
			)}
		</div>
	);
};

export default InputFields;
