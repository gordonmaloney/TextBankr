import React, { useState, useEffect } from "react";

const SwipeExplainer = ({ isOpen }) => {
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
					Swipe or scroll to navigate through your contacts
				</h3>
			</center>
		</div>
	);
};

export default SwipeExplainer;
