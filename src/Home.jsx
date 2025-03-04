import React, { useState, useEffect } from "react";
import Header from "./Header";
import { Button } from "@mui/material";
import { Link } from "react-router-dom";
import { BtnStyle, BtnStyleSmall } from "./MUIShared";
import { Navigate } from "react-router-dom";


const Home = ({ Translation }) => {
	const [isMobile, setIsMobile] = useState(false);

	// Detect mobile devices
	useEffect(() => {
		const checkMobile = () => {
			const userAgent = navigator.userAgent || navigator.vendor || window.opera;
			setIsMobile(/android|iphone|ipad|ipod|mobile/i.test(userAgent));
		};
		checkMobile();
	}, []);

	return (
		<div>
			<Header />

			{!isMobile ? (
				<div className="home-outer">
					<div className="home-cont">
						<div className="sarala-regular home-cont-inner">
							<center>
								<h3 className="sarala-bold">{Translation.homeHeader}</h3>
							</center>
							<p>{Translation.homeBody}</p>
							<center>
								<Link to="./start">
									<Button sx={BtnStyle} variant="contained">
										{Translation.homeBtn}{" "}
									</Button>
								</Link>
								<p style={{ fontSize: "small", fontStyle: "italic" }}>
									{Translation.homeDisclaimer}
								</p>
							</center>
						</div>
					</div>
				</div>
			) : (
				<>
					<div className="mobileCont">
						<center>
							<h4 className="sarala-bold">{Translation.homeHeader}</h4>
						</center>
						<p style={{ fontSize: "small" }}>{Translation.homeBody}</p>
						<center>
							<Link to="./start">
								<Button sx={BtnStyleSmall} variant="contained">
									{Translation.homeBtn}
								</Button>
							</Link>
							<p style={{ fontSize: "small", fontStyle: "italic" }}>
								{Translation.homeDisclaimer}
							</p>
						</center>
					</div>
				</>
			)}
		</div>
	);
};

export default Home;
