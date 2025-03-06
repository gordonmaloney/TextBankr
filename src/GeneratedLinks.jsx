import React, { useState } from "react";
import SwipeCard from "./Swiper";
import { Button } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { BtnStyleSmall, LinkBtn } from "./MUIShared";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp, faSignalMessenger } from "@fortawesome/free-brands-svg-icons";
import { faPhone, faSms } from "@fortawesome/free-solid-svg-icons";
import { countries } from "./CountrySelect";
import useContactLinks from "./hooks/useContactLinks";
import { BtnBlock, CallBtn } from "./CallLinks";

const GeneratedLinks = ({
	Translation,

	rowData,
	isMobile,
	followUpMessage,
	noAnswerMessage,
	extensionCode,
}) => {
	const {
		validateAndFormatNumber,
		generateWhatsAppLink,
		generateSMSLink,
		generateSignalLink,
		isLandline,
		formatForTel,
		handleSignalClick,
		showSignalLinks,
		toggleSignalLinks,
		signalModal,
		setSignalModal,
		enableSignal,
	} = useContactLinks(extensionCode);



	if (rowData.length === 0) {
		return;
		<></>;
	}

	if (rowData.length > 0) {
		return (
			<div id="generatedLinks" style={{ minHeight: "80vh" }}>
				<h2 className="sarala-bold" style={{ margin: 0 }}>
					Your Links:
				</h2>

				<div
					style={{
						display: "flex",
						flexDirection: "row",
						justifyContent: "space-between",
						alignContent: "center",
						width: "100%",
					}}
				>
					<div>
						<Button
							style={{
								...BtnStyleSmall,
								display: enableSignal ? "block" : "none",
							}}
							className="open-button"
							onClick={() => {
								toggleSignalLinks();
							}}
						>
							{!showSignalLinks ? "Show" : "Hide"} Signal/Telegram
						</Button>
					</div>

					<div
						style={{
							display: isMobile ? "inline-block" : "none",
						}}
					>
						<SwipeCard
							rowData={rowData}
							extensionCode={extensionCode}
							noAnswerMessage={noAnswerMessage}
							followUpMessage={followUpMessage}
							isMobile={isMobile}
							showSignalLinks={showSignalLinks}
						/>
					</div>
				</div>

				<Grid container spacing={0}>
					{rowData
						.filter((row) => row.name.trim() !== "" || row.number.trim() !== "") // Filter rows
						.map((row, index) => (
							<>
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
													<span
														style={{ fontSize: isMobile ? "12px" : "12px" }}
													>
														{`${formatForTel(row.number)}`}
													</span>
												) : (
													<em>No number</em>
												)}
											</center>
										</Grid>
										<Grid size={{ xs: 6, sm: 3, md: 2, xl: 1 }}>
											<CallBtn
												isMobile={isMobile}
												formatForTel={formatForTel}
												number={row.number}
												format="list"
											/>
										</Grid>

										<Grid size={{ xs: 6, sm: 3, md: 2, xl: 1 }}>
											<BtnBlock
												name={row.name}
												isLandline={isLandline}
												number={row.number}
												isMobile={isMobile}
												message={noAnswerMessage}
												extensionCode={extensionCode}
												format="list"
												template="Template 1"
												showSignalLinks={showSignalLinks}
											/>
										</Grid>

										<Grid size={{ xs: 6, sm: 3, md: 2, xl: 1 }}>
											{followUpMessage !== "" && (
												<BtnBlock
													name={row.name}
													isMobile={isMobile}
													isLandline={isLandline}
													number={row.number}
													message={followUpMessage}
													extensionCode={extensionCode}
													format="list"
													template="Template 2"
													showSignalLinks={showSignalLinks}
												/>
											)}
										</Grid>
									</Grid>
								</Grid>
							</>
						))}
				</Grid>

				<div
					style={{
						display: isMobile ? "block" : "none",
						marginTop: "10px",
					}}
				>
					<center>
						<SwipeCard
							rowData={rowData}
							extensionCode={extensionCode}
							noAnswerMessage={noAnswerMessage}
							followUpMessage={followUpMessage}
							isMobile={isMobile}
							showSignalLinks={showSignalLinks}
						/>
					</center>
				</div>

				{signalModal && (
					<div
						onClick={() => setSignalModal(false)}
						style={{
							position: "fixed",
							top: 0,
							left: 0,
							width: "100vw",
							height: "100vh",
							backgroundColor: "rgba(0, 0, 0, 0.8)",
							display: "flex",
							justifyContent: "center",
							alignItems: "center",
							zIndex: 1000,
						}}
					>
						<div
							onClick={(e) => e.stopPropagation()}
							style={{
								backgroundColor: "#fff",
								padding: "10px",
								borderRadius: "10px",
								textAlign: "center",
								width: "80%",
								maxWidth: "800px",
							}}
						>
							<h2 style={{ marginBottom: "12px", marginTop: "12px" }}>
								Using Signal
							</h2>

							<p
								style={{
									textAlign: "left",
									padding: "0 20px",
									marginTop: 0,
									zIndex: 5,
									position: "relative",
								}}
							>
								Please note that Signal doesn't allow 'pre-filled' links like
								WhatsApp or SMS does. To get around that, clicking the 'Signal'
								button on a contact will do two things:
								<ol>
									<li>
										Open the Signal app and start a conversation with your
										contact (provided they're on Signal and can be messaged!)
									</li>
									<li>Copy the relevant message to your clipboard</li>
								</ol>
								That means you just need to click the button to start the
								conversation with your contact, and then <b>paste</b> your
								message in.
							</p>

							<center>
								<Button
									style={BtnStyleSmall}
									onClick={() => setSignalModal(false)}
								>
									Got it!
								</Button>
							</center>
						</div>
					</div>
				)}
			</div>
		);
	} else {
		return <></>;
	}
};

export default GeneratedLinks;
