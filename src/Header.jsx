import React, { useState } from "react";
import { Button, Modal, Box, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { BtnStyle, BtnStyleSmall } from "./MUIShared";

const Header = () => {
	const [isModalOpen, setIsModalOpen] = useState(false);

	const emailUser = "gordonmaloney";
	const emailDomain = "gmail.com";
	const subject = "Textbankr";
	const phone = "+447903700751";

	return (
		<>
			<div id="header" style={{}}>
				<Link
					to="../"
					style={{
						color: "white",
						textDecoration: "none",
					}}
				>
					<h2
						className="sarala-bold"
						style={{
							paddingLeft: "20px",
						}}
					>
						Textbankr
					</h2>
				</Link>
				<Button
					className="sarala-bold"
					onClick={() => setIsModalOpen(true)}
					style={{
						...BtnStyleSmall,
						marginLeft: "auto",
						marginRight: "20px",
					}}
				>
					Help me!
				</Button>{" "}
			</div>

			{isModalOpen && (
				<div
					onClick={() => setIsModalOpen(false)}
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
							Help me make this tool useful
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
							Are you using this tool for something awesome? Do you have ideas
							for new features? Have you spotted bugs? Is any of the text
							confusing? Are you a dab hand with coding?
							<br />
							<br />I am an amateur developer making this in my spare time. If
							you would like to help out - either with feedback, suggestions, or
							by helping with translations into other languages or the coding itself, <i>please</i> reach
							out! Send me an email at{" "}
							<a
								href={`mailto:${emailUser}@${emailDomain}?subject=${encodeURIComponent(
									subject
								)}`}
								className="text-blue-600 underline"
								target="_blank"
							>
								{emailUser}@{emailDomain}
							</a>{" "}
							or{" "}
							<a
								href={`https://wa.me/${phone.replace("+", "")}`}
								className="text-green-600 underline"
								target="_blank"
								rel="noopener noreferrer"
							>
								get me on WhatsApp.
							</a>
							<br />
							<br />
							This has also ended up going far beyond my own network, so I'd
							really love to hear about how you're using it - what cool things
							you're organising for and what groups you're a part of. Drop me a
							message and let me know!
						</p>

						<center>
							<Button style={BtnStyleSmall}
							onClick={() => setIsModalOpen(false)}
							>Close</Button>
						</center>
					</div>
				</div>
			)}
		</>
	);
};

export default Header;
