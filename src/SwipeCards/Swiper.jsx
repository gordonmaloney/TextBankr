import React, { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Button } from "@mui/material";
import { BtnStyleSmall } from "../MUIShared";
import SwipeExplainer from "./SwipeExplainer";
import CardContentCustom from "./CardContentCustom";

// 🛠️ Define swipe speed and tilt angles
const SwipeSpeed = 0.1; // Speed of swipe in seconds
const SwipeOffAngle = 8; // Angle for swiping off the screen and while dragging
const SwipeOnAngle = 20; // Angle for new card sliding on to the screen

// Extended off-screen distances
const offScreenX = 600; // Horizontal off-screen distance
const offScreenY = 800; // Vertical off-screen distance

const SwipeCard = ({
	rowData,
	extensionCode,
	followUpMessage,
	noAnswerMessage,
	isMobile,
	showSignalLinks,
}) => {
	const [index, setIndex] = useState(0);
	const [isOpen, setIsOpen] = useState(false); // Overlay open state
	const [loading, setLoading] = useState(false);
	const [swiping, setSwiping] = useState(false); // Prevent double swipes
	const [isSwipingOff, setIsSwipingOff] = useState(false); // Track horizontal swipe off
	const [isSlidingOn, setIsSlidingOn] = useState(false); // Track if new card is sliding on

	useEffect(() => {
		setLoading(true);
		const timer = setTimeout(() => {
			setLoading(false);
		}, 200);
		return () => clearTimeout(timer);
	}, [index]);

	// Horizontal and vertical motion values
	const x = useMotionValue(0);
	const y = useMotionValue(0);

	// Compute tilt based on horizontal movement only
	const dragAndOffRotate = useTransform(
		x,
		[-200, 200],
		[-SwipeOffAngle, SwipeOffAngle]
	);
	const onScreenRotate = useTransform(
		x,
		[-200, 200],
		[-SwipeOnAngle, SwipeOnAngle]
	);
	// When swiping vertically, x stays near 0 so tilt is 0.
	const rotate = isSlidingOn ? onScreenRotate : dragAndOffRotate;

	const overlayRef = useRef(null);

	const handleDragEnd = (event, info) => {
		if (swiping) return; // Prevent new swipes during animation
		const threshold = 150; // Adjust swipe sensitivity

		// Determine if the swipe is primarily vertical or horizontal
		if (Math.abs(info.offset.y) > Math.abs(info.offset.x)) {
			// Vertical swipe
			if (Math.abs(info.offset.y) > threshold) {
				if (info.offset.y > 0) {
					// Dragging down
					if (index > 0) {
						// Allowed swipe: animate off-screen downwards
						setSwiping(true);
						animate(y, offScreenY, { duration: SwipeSpeed }).then(() => {
							setIndex((prev) => Math.max(prev - 1, 0));
							y.set(-offScreenY); // New card comes from the top
							animate(y, 0, { duration: SwipeSpeed }).then(() => {
								setSwiping(false);
							});
						});
					} else {
						// Not allowed: snap back vertically
						animate(y, 0, { duration: SwipeSpeed });
					}
				} else {
					// Dragging up
					if (index < rowData.length) {
						// Allow swipe if there is a card or the end-card is available
						setSwiping(true);
						animate(y, -offScreenY, { duration: SwipeSpeed }).then(() => {
							setIndex((prev) => Math.min(prev + 1, rowData.length)); // Now can reach rowData.length
							y.set(offScreenY); // New card comes from the bottom
							animate(y, 0, { duration: SwipeSpeed }).then(() => {
								setSwiping(false);
							});
						});
					} else {
						// Not allowed: snap back vertically
						animate(y, 0, { duration: SwipeSpeed });
					}
				}
			} else {
				// Not enough vertical movement: snap back
				animate(y, 0, { duration: SwipeSpeed });
			}
			// Always snap horizontal value back to 0 when vertical swipe
			animate(x, 0, { duration: SwipeSpeed });
		} else {
			// Horizontal swipe
			if (Math.abs(info.offset.x) > threshold) {
				if (info.offset.x > 0) {
					// Dragging right
					if (index > 0) {
						// Allowed swipe: animate off-screen to the right
						setSwiping(true);
						setIsSwipingOff(true);
						animate(x, offScreenX, { duration: SwipeSpeed }).then(() => {
							setIndex((prev) => Math.max(prev - 1, 0));
							x.set(-offScreenX); // New card comes from the left
							setIsSwipingOff(false);
							setIsSlidingOn(true);
							animate(x, 0, { duration: SwipeSpeed }).then(() => {
								setSwiping(false);
								setIsSlidingOn(false);
							});
						});
					} else {
						// Not allowed: snap back horizontally
						animate(x, 0, { duration: SwipeSpeed });
					}
				} else {
					// Dragging left
					if (index < rowData.length) {
						// Allow swipe if a card is available or to reach the end-card
						setSwiping(true);
						setIsSwipingOff(true);
						animate(x, -offScreenX, { duration: SwipeSpeed }).then(() => {
							setIndex((prev) => Math.min(prev + 1, rowData.length)); // Now can reach rowData.length
							x.set(offScreenX); // New card comes from the right
							setIsSwipingOff(false);
							setIsSlidingOn(true);
							animate(x, 0, { duration: SwipeSpeed }).then(() => {
								setSwiping(false);
								setIsSlidingOn(false);
							});
						});
					} else {
						// Not allowed: snap back horizontally
						animate(x, 0, { duration: SwipeSpeed });
					}
				}
			} else {
				// Not enough horizontal movement: snap back
				animate(x, 0, { duration: SwipeSpeed });
			}
			// Always snap vertical value back to 0 when horizontal swipe
			animate(y, 0, { duration: SwipeSpeed });
		}
	};

	const handleOutsideClick = (e) => {
		if (overlayRef.current && !overlayRef.current.contains(e.target)) {
			setIsOpen(false); // Close overlay if clicked outside
		}
	};

	const handleOpenOverlay = () => {
		setIndex(0); // Reset to first card
		x.set(0); // Reset horizontal motion value
		y.set(0); // Reset vertical motion value
		setIsOpen(true); // Open overlay
	};

	const handleCloseOverlay = () => {
		setIsOpen(false); // Close overlay
	};

	return (
		<>
			<SwipeExplainer isOpen={isOpen} />

			<Button
				style={{
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
								y,
								rotate,
								zIndex: 1,
								scale: 1,
								opacity: 1,
								boxShadow: "0 8px 30px rgba(0, 0, 0, 0.3)",
							}}
							drag
							dragDirectionLock
							onDragStart={() => {
								console.log("Drag start:", x.get(), y.get());
							}}
							onDragEnd={handleDragEnd}
						>
							{loading ? (
								<div style={{ textAlign: "left" }}>
									<h2 className="loading"></h2>
								</div>
							) : (
								<>
									{index < rowData.length ? (
										<CardContentCustom
											isMobile={isMobile}
											rowData={rowData}
											index={index}
											extensionCode={extensionCode}
											followUpMessage={followUpMessage}
											noAnswerMessage={noAnswerMessage}
											showSignalLinks={showSignalLinks}
										/>
									) : (
										<div className="end-card-content">
											<h3>You've reached the end of your contacts!</h3>
											<br />
											<br />
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
