import React, { useState, useEffect} from "react";
import { TextField, Button } from "@mui/material";
import { BtnStyleSmall, TextFieldStyle } from "./MUIShared";

const InputFields = ({
	Translation,

	followUpMessage,
	setFollowUpMessage,
	noAnswerMessage,
	setNoAnswerMessage,
}) => {
	const [secondField, setSecondField] = useState(false);

	useEffect(() => {
		followUpMessage !== "Hey {FIRSTNAME}! " && setSecondField(true);
	}, [followUpMessage]);

	return (
		<div>
			<h3 style={{ marginTop: 0 }}>{Translation.inputHeader}</h3>

			<div className="field-cont">
				<p style={{ marginTop: 0, fontSize: "small" }}>
					You can draft up to two different template messages to send to your
					contacts. For example if you are phonebanking, you could have two
					different messages depending on whether they pick up.
					<br />
					<br />
					Note: the tool automatically adds {"`Hey {FIRSTNAME}!`"} to the
					start of the message, but you can change that if you'd like.{" "}
					<br />
					<br />
					For WhatsApp, you can format parts of your message by wrapping them
					with an asterix <b>*for bold*</b> or "_" <u>_to underline_</u>. But
					note that these don't work on SMS!
				</p>
				<TextField
					label="Template message:"
					multiline
					fullWidth
					sx={TextFieldStyle}
					rows={4}
					value={noAnswerMessage}
					onChange={(e) => setNoAnswerMessage(e.target.value)}
					placeholder="Type your template message here"
				/>

				{!secondField ? (
					<div style={{ display: "flex", justifyContent: "end" }}>
						<Button
							style={{ marginTop: "5px" }}
							variant="contained"
							sx={BtnStyleSmall}
							size="small"
							onClick={() => setSecondField(true)}
						>
							Add second template
						</Button>
					</div>
				) : (
					<TextField
						label="Template 2:"
						value={followUpMessage}
						sx={TextFieldStyle}
						onChange={(e) => setFollowUpMessage(e.target.value)}
						placeholder="Type your alternative template message here"
						multiline
						fullWidth
						style={{ marginTop: "14px" }}
						rows={4}
					/>
				)}
			</div>
		</div>
	);
};

export default InputFields;
