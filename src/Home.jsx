import React, { useState, useEffect } from "react";
import Header from "./Header";
import { Button } from "@mui/material";
import { Link } from "react-router-dom";
import { BtnStyle, BtnStyleSmall } from "./MUIShared";
import { Navigate } from "react-router-dom";

const Home = () => {
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
								<h3 className="sarala-bold">
									Textbankr is a 100% free tool to make it easier to call and
									message contacts.
								</h3>
							</center>

							<p>
								<b>How does it work?</b>
								<ol>
									<li>
										Write a draft message - or two different versions, for
										example depending on whether or not the contact answers the
										phone.
									</li>
									<li>
										Paste your contacts in - you can copy the names and numbers
										from a spreadsheet right into the tool.
									</li>
									<li>
										Send your messages! Once you’ve got inputted your contacts
										and template messages, pre-filled links will allow you to
										send messages quickly and easily, without needing to type in
										numbers manually or save any contacts.
									</li>
									<li>
										<em>Optionally</em> - if it’s easier to send the messages
										from your phone, you can get set up on your desktop and then
										easily send all the data to your mobile to call your
										contacts and send the messages.
									</li>
								</ol>
								This tool is designed for low- to no-budget organisations -
								though it works for everyone. It is designed to not store any
								sensitive data, anywhere at all. Everything you input is only
								kept locally right on your browser, and vanishes the moment you
								close the window.
								<br />
								<br />
								<center>
									<Link to="/start">
										<Button sx={BtnStyle} variant="contained">
											Get started
										</Button>
									</Link>
									<p style={{ fontSize: "small", fontStyle: "italic" }}>
										Please note that this is still very much a work-in-progress.
										Any bugs or suggestions, email: gordonmaloney @ gmail . com
									</p>
								</center>
							</p>
						</div>
					</div>
				</div>
			) : (
				<>
					<div className="mobileCont">
						<center>
							<h4 className="sarala-bold">
								Textbankr is a 100% free tool to make it easier to call and
								message contacts.
							</h4>
						</center>
						<p style={{fontSize: "small"}}>
							<b>How does it work?</b>
							<ol>
								<li>
									Write a draft message - or two different versions, for example
									depending on whether or not the contact answers the phone.
								</li>
								<li>
									Paste your contacts in - you can copy the names and numbers
									from a spreadsheet right into the tool.
								</li>
								<li>
									Send your messages! Once you’ve got inputted your contacts and
									template messages, pre-filled links will allow you to send
									messages quickly and easily, without needing to type in
									numbers manually or save any contacts.
								</li>
								<li>
									<em>Optionally</em> - if it’s easier to send the messages from
									your phone, you can get set up on your desktop and then easily
									send all the data to your mobile to call your contacts and
									send the messages.
								</li>
							</ol>
							This tool is designed for low- to no-budget organisations - though
							it works for everyone. It is designed to not store any sensitive
							data, anywhere at all. Everything you input is only kept locally
							right on your browser, and vanishes the moment you close the
							window.
							<br />
							<br />
							<center>
								<Link to="/start">
									<Button sx={BtnStyleSmall} variant="contained">
										Get started
									</Button>
								</Link>
								<p style={{ fontSize: "small", fontStyle: "italic" }}>
									Please note that this is still very much a work-in-progress.
									Any bugs or suggestions, email: gordonmaloney @ gmail . com
								</p>
							</center>
						</p>
					</div>
				</>
			)}
		</div>
	);
};

export default Home;
