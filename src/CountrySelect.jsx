import React, { useState } from "react";
import { MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import { SelectFieldStyle, TextFieldStyle } from "./MUIShared";

// Hardcoded list of countries
export const countries = [
	{ name: "United Kingdom", emoji: "🇬🇧", code: "+44" }, // English (unchanged)
	{ name: "Éire/Ireland", emoji: "🇮🇪", code: "+353" }, // Irish for Ireland
	{ name: "United States", emoji: "🇺🇸", code: "+1" }, // English (unchanged)
	{ name: "Canada", emoji: "🇨🇦", code: "+1" }, // English/French (same in both)
	{ name: "España", emoji: "🇪🇸", code: "+34" }, // Spanish for Spain
	{ name: "France", emoji: "🇫🇷", code: "+33" }, // French (unchanged)
	{ name: "Italia", emoji: "🇮🇹", code: "+39" }, // Italian for Italy
	{ name: "België", emoji: "🇧🇪", code: "+32" }, // Dutch for Belgium (most spoken)
	{ name: "Ελλάδα", emoji: "🇬🇷", code: "+30" }, // Greek for Greece
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
