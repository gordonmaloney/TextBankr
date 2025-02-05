import React, { useState } from "react";
import { MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import { SelectFieldStyle, TextFieldStyle } from "./MUIShared";

// Hardcoded list of countries
export const countries = [
	{ name: "United Kingdom", emoji: "🇬🇧", code: "+44" },
	{ name: "Ireland", emoji: "🇮🇪", code: "+353" },
	{ name: "United States", emoji: "🇺🇸", code: "+1" },
	{ name: "Canada", emoji: "🇨🇦", code: "+1" },
	{ name: "Spain", emoji: "🇪🇸", code: "+34" },
	{ name: "France", emoji: "🇫🇷", code: "+33" },
	{ name: "Italy", emoji: "🇮🇹", code: "+39" },
];

const CountrySelect = ({extensionCode, setExtensionCode}) => {

	const handleChange = (event) => {
		setExtensionCode(event.target.value);
	};

	return (
		<FormControl fullWidth>
	
			<Select
				size="small"
				sx={SelectFieldStyle}
				labelId="country-select-label"
				value={extensionCode}
				onChange={handleChange}
			>
				{countries.map((country, index) => (
					<MenuItem key={index} value={country.code}>
						{`${country.emoji} ${country.name} (${country.code})`}
					</MenuItem>
				))}
			</Select>
		</FormControl>
	);
};

export default CountrySelect;
