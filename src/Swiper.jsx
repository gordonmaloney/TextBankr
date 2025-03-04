import React, { useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";

const SwipeCard = ({ data }) => {
	const [index, setIndex] = useState(0);
	const x = useMotionValue(0);
	const rotate = useTransform(x, [-200, 200], [-8, 8]); // Subtle rotation between -8 and +8 degrees

	const handleDragEnd = (event, info) => {
		if (info.offset.x > 150) {
			// SWIPE RIGHT: Move back to previous card
			if (index > 0) {
				setIndex((prev) => Math.max(prev - 1, 0));
			}
			x.set(0); // Reset swipe position
		} else if (info.offset.x < -150) {
			// SWIPE LEFT: Move forward to next card
			if (index < data.length) {
				setIndex((prev) => Math.min(prev + 1, data.length)); // Move to next card or end card
			}
			x.set(0); // Reset swipe position
		} else {
			x.set(0); // Snap back if not swiped enough
		}
	};

	return (
		<div className="card-container">
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
				initial={{ opacity: 0, y: 50 }}
				animate={{ opacity: 1, y: 0 }}
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
					</div>
				)}
			</motion.div>
		</div>
	);
};

export default SwipeCard;
