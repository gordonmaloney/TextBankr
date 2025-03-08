import React from "react";
import Grid from "@mui/material/Grid2";
import useContactLinks from "../hooks/useContactLinks";
import { CallBtn, BtnBlock } from "../CallLinks";

const CardContentCustom = ({
	isMobile,
	rowData,
	index,
	extensionCode,
	followUpMessage,
	noAnswerMessage,
	showSignalLinks,
}) => {
	const {
		validateAndFormatNumber,
		generateWhatsAppLink,
		generateSMSLink,
		generateSignalLink,
		isLandline,
		formatForTel,
		handleSignalClick,
		toggleSignalLinks,
		signalModal,
		setSignalModal,
		enableSignal,
	} = useContactLinks(extensionCode);

	return (
		<div className="card-content">
			<h4 className="card-header">
				Contact {index + 1} of {rowData.length}
			</h4>

			<div className="card-body">
				<div>
					<h2 style={{ marginBottom: "0" }}>{rowData[index].name}</h2>
					<p style={{ marginTop: "0" }}>{rowData[index].number}</p>

					<CallBtn
						isMobile={isMobile}
						formatForTel={formatForTel}
						number={rowData[index].number}
						format="card"
					/>
				</div>
				<Grid
					xs={12}
					key={index}
					style={{
						paddingTop: "18px",
						paddingBottom: "18px",
						borderBottom: "1px solid grey",
					}}
				>
					<Grid container spacing={1}>
						<Grid xs={followUpMessage ? 6 : 12} sm={3} md={2} xl={1}>
							<BtnBlock
								name={rowData[index].name}
								isLandline={isLandline}
								number={rowData[index].number}
								message={noAnswerMessage}
								isMobile={isMobile}
								extensionCode={extensionCode}
								format="list"
								template="Template 1"
								showSignalLinks={showSignalLinks}
							/>
						</Grid>

						<Grid size={{ xs: 6, sm: 3, md: 2, xl: 1 }}>
							{followUpMessage !== "" && (
								<BtnBlock
									name={rowData[index].name}
									isLandline={isLandline}
									number={rowData[index].number}
									message={followUpMessage}
									isMobile={isMobile}
									extensionCode={extensionCode}
									format="list"
									template="Template 2"
									showSignalLinks={showSignalLinks}
								/>
							)}
						</Grid>
					</Grid>
				</Grid>
			</div>
		</div>
	);
};

export default CardContentCustom;
