import React, { useState, useRef } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";

const SwipeCard = ({ data }) => {
	const [index, setIndex] = useState(0);
	const [isOpen, setIsOpen] = useState(false); // Overlay open state
	const x = useMotionValue(0);
	const rotate = useTransform(x, [-200, 200], [-8, 8]);
	const overlayRef = useRef(null);

	const handleDragEnd = (event, info) => {
		if (info.offset.x > 150) {
			if (index > 0) {
				setIndex((prev) => Math.max(prev - 1, 0));
			}
			x.set(0);
		} else if (info.offset.x < -150) {
			if (index < data.length) {
				setIndex((prev) => Math.min(prev + 1, data.length));
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

	return (
		<div>
			<button
				className="open-button"
				onClick={handleOpenOverlay}
			>
				Open cards
			</button>

			{isOpen && (
				<div className="overlay" onClick={handleOutsideClick}>
					<div
						className="card-container"
						ref={overlayRef}
						onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on the card
					>
						<motion.div
							className={index < data.length ? "card" : "end-card"}
							style={{
								x,
								rotate,
								zIndex: 1,
								scale: 1,
								boxShadow: "0 8px 30px rgba(0, 0, 0, 0.3)",
							}}
							drag="x"
							dragConstraints={{ left: 0, right: 0 }}
							onDragEnd={handleDragEnd}
							initial={{ opacity: 0, x: 300 }} /* SWIPE IN FROM RIGHT */
							animate={{ opacity: 1, x: 0 }} /* SWIPE IN ANIMATION */
							transition={{ duration: 0.3 }}
						>
							{index < data.length ? (
								<div className="card-content">
									<h4 className="card-header">
										Contact {index + 1} of {data.length}
									</h4>
									<h3>{data[index].name}</h3>
									<p>{data[index].phone}</p>
								</div>
							) : (
								<div className="end-card-content">
									<h3>You've reached the end of your contacts!</h3>
									<button className="close-button" onClick={handleCloseOverlay}>
										Close
									</button>
								</div>
							)}
						</motion.div>
					</div>
				</div>
			)}
		</div>
	);
};

export default SwipeCard;
