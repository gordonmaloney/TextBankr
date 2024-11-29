import React, { useState, useEffect} from "react";

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
			<label>
				No Answer Message:
				<textarea
					value={noAnswerMessage}
					onChange={(e) => setNoAnswerMessage(e.target.value)}
					placeholder="Type your 'No Answer' message here"
					style={{
						width: "100%",
						padding: "8px",
						marginTop: "8px",
						boxSizing: "border-box",
						height: "60px", // Space for ~3 lines
					}}
				/>
			</label>
			<br />
			{!secondField ? (
				<button
					style={{
						padding: "10px 20px",
						backgroundColor: "#28a745",
						color: "#fff",
						border: "none",
						borderRadius: "5px",
						cursor: "pointer",
					}}
					onClick={() => setSecondField(true)}
				>
					Add second template
				</button>
			) : (
				<label>
					Follow Up Message:
					<textarea
						value={followUpMessage}
						onChange={(e) => setFollowUpMessage(e.target.value)}
						placeholder="Type your 'Follow Up' message here"
						style={{
							width: "100%",
							padding: "8px",
							marginTop: "8px",
							boxSizing: "border-box",
							height: "60px", // Space for ~3 lines
						}}
					/>
				</label>
			)}
		</div>
	);
};

export default InputFields;
