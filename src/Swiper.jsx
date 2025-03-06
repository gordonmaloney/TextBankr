import React, { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { Button } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { BtnStyle, BtnStyleSmall, LinkBtn, LinkBtnLarge } from "./MUIShared";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faWhatsapp,
	faSignalMessenger,
} from "@fortawesome/free-brands-svg-icons";
import { faPhone, faSms } from "@fortawesome/free-solid-svg-icons";
import { countries } from "./CountrySelect";
import useContactLinks from "./hooks/useContactLinks";
import {CallBtn, BtnBlock} from "./CallLinks";

const SwipeCard = ({
	rowData,
	extensionCode,
	followUpMessage,
	noAnswerMessage,
	isMobile,
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

	const [index, setIndex] = useState(0);

	const [isOpen, setIsOpen] = useState(false); // Overlay open state

	const [loading, setLoading] = useState(false);
	useEffect(() => {
		setLoading(true);
		const timer = setTimeout(() => {
			setLoading(false);
		}, 200);
	}, [index]);

	useEffect(() => {
		console.log("Loading:", loading);
	}, [loading]);

	//fading consts
	const [offset, setOffset] = useState(0); // Track absolute negative offset

	const x = useMotionValue(0);
	const rotate = useTransform(x, [-200, 200], [-8, 8]);
	const overlayRef = useRef(null);

	const handleDragEnd = (event, info) => {
		if (info.offset.x > 180) {
			if (index > 0) {
				setIndex((prev) => Math.max(prev - 1, 0));
			}
			x.set(0);
		} else if (info.offset.x < -180) {
			if (index < rowData.length) {
				setIndex((prev) => Math.min(prev + 1, rowData.length));
			}
			x.set(0);
		} else {
			x.set(0);
		}
	};

	const handleOutsideClick = (e) => {
		if (overlayRef.current && !overlayRef.current.contains(e.target)) {
			setIsOpen(false); // Close overlay if clicked outside
		}
	};

	const handleOpenOverlay = () => {
		setIndex(0); // Reset to first card
		setIsOpen(true); // Open overlay
	};

	const handleCloseOverlay = () => {
		setIsOpen(false); // Close overlay
	};

	const [isVisible, setIsVisible] = useState(false);
	const [isFading, setIsFading] = useState(false);

	useEffect(() => {
		if (!isVisible && isOpen) {
			setIsVisible(true);
		}
	}, [isOpen]);

	useEffect(() => {
		if (isOpen) {
			// Reset fading state if reopening
			setIsFading(false);

			// Hide element after 4 seconds
			const timer = setTimeout(() => {
				setIsFading(true); // Start fade-out effect
				setTimeout(() => setIsVisible(false), 500); // Wait for fade-out to complete
			}, 4000);

			return () => clearTimeout(timer); // Cleanup timer
		}
	}, [isOpen]);

	return (
		<>
			<div
				className={`swipe-explainer ${isFading ? "fade-out" : ""}`}
				style={{
					zIndex: 10000,
					position: "fixed",
					top: 20,
					left: 0,
					width: "80%",
					margin: "0 10%",
					backgroundColor: "white",
					borderRadius: "10px",
					display: isVisible && isOpen ? "block" : "none",
				}}
			>
				<center>
					<h3
						className="sarala-bold"
						style={{ margin: "5px", lineHeight: "20px" }}
					>
						Swipe left or right to navigate through your contacts
					</h3>
				</center>
			</div>

			<Button
				style={{
					// display: "none",
					...BtnStyleSmall,
				}}
				className="open-button"
				onClick={handleOpenOverlay}
			>
				View as cards
			</Button>

			{isOpen && (
				<div className="overlay" onClick={handleOutsideClick}>
					<div
						className="card-container"
						ref={overlayRef}
						onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on the card
					>
						<motion.div
							className={index < rowData.length ? "card" : "end-card"}
							style={{
								x,
								rotate,
								zIndex: 1,
								scale: 1,
								opacity: 1,
								boxShadow: "0 8px 30px rgba(0, 0, 0, 0.3)",
							}}
							drag="x"
							dragConstraints={{ left: 0, right: 0 }}
							onDrag={(event, info) => {
								const absOffset = Math.abs(info.offset.x) * -1; // Make offset always negative
								setOffset(absOffset); // Update offset state
							}}
							onDragEnd={handleDragEnd}
							initial={{ opacity: 1, x: 300 }} /* SWIPE IN FROM RIGHT */
							animate={{ opacity: 1, x: 0 }} /* SWIPE IN ANIMATION */
							transition={{ duration: 0.3 }}
						>
							{loading ? (
								<div style={{ textAlign: "left" }}>
									<h2 className="loading"></h2>
								</div>
							) : (
								<>
									{index < rowData.length ? (
										<>
											<div className="card-content">
												<h4 className="card-header">
													Contact {index + 1} of {rowData.length}
												</h4>

												<div className="card-body">
													<div>
														<h2 style={{ marginBottom: "0" }}>
															{rowData[index].name}
														</h2>
														<p style={{ marginTop: "0" }}>
															{rowData[index].number}
														</p>

														<CallBtn
															isMobile={isMobile}
															formatForTel={formatForTel}
															number={rowData[index].number}
															format="card"
														/>
													</div>
													<Grid
														size={12}
														key={index}
														style={{
															paddingTop: "18px",
															paddingBottom: "18px",
															borderBottom: "1px solid grey",
														}}
													>
														<Grid container spacing={1}>
															<Grid
																size={{
																	xs: followUpMessage ? 6 : 12,
																	sm: 3,
																	md: 2,
																	xl: 1,
																}}
															>
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
										</>
									) : (
										<div className="end-card-content">
											<h3>You've reached the end of your contacts!</h3>
											<br /> <br />
											<Button
												style={BtnStyleSmall}
												onClick={handleCloseOverlay}
											>
												Close
											</Button>
										</div>
									)}
								</>
							)}
						</motion.div>
					</div>
				</div>
			)}
		</>
	);
};

export default SwipeCard;
