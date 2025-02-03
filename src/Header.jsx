import React, { useState } from "react";
import { Button, Modal, Box, Typography } from "@mui/material";
import { Link } from "react-router-dom";

const Header = () => {
	return (
		<div id="header" style={{}}>
			<Link to="../"
				style={{
					color: 'white',
					textDecoration: "none"
				}}
			>
				<h2 className="sarala-bold"
					style={{
					paddingLeft: "20px",
				}}>
					Textbankr
				</h2>
			</Link>
		</div>
	);
};

export default Header;
