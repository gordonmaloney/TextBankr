export const BtnStyle = {
	fontSize: "large",
	fontWeight: "600",
	borderRadius: "10px",
	color: "#126466",
	backgroundColor: "#D8B08B",
	border: "1px solid #126466",
	"&:hover, &:active": { backgroundColor: "#FFCB9A", color: "#126466" },
	"&:disabled": { color: "grey" },
};

export const BtnStyleSmall = {
	fontSize: "small",
	fontWeight: "600",
	borderRadius: "10px",
	color: "#126466",
	backgroundColor: "#D8B08B",
	"&:hover, &:active": { backgroundColor: "#FFCB9A", color: "#126466" },
	"&:disabled": { color: "grey" },
};

export const LinkBtn = {
	margin: '5px',
	fontSize: "small",
	fontWeight: "600",
	borderRadius: "10px",
	color: "#126466",
	backgroundColor: "#D8B08B",
	"&:hover, &:active": { backgroundColor: "#FFCB9A", color: "#126466" },
	"&:disabled": { color: "grey" },
};

export const LinkBtnLarge = {
	margin: "5px",
	padding: '10px',
	fontSize: "medium",
	fontWeight: "600",
	borderRadius: "10px",
	color: "#126466",
	backgroundColor: "#D8B08B",
	"&:hover, &:active": { backgroundColor: "#FFCB9A", color: "#126466" },
	"&:disabled": { color: "grey" },
};


export const TextFieldStyle = {
	marginBottom: "12px",

	"& .MuiInputBase-root": {
		backgroundColor: "white",
	},

	marginTop: "3px",

	"& .MuiInputLabel-root, & .MuiInputLabel-root.Mui-focused": {
		color: "darkgrey",
		backgroundColor: "white",
		borderRadius: "4px",
		padding: "0 6px",
		marginLeft: "-3.5px",
	},

	"& .MuiInput-underline:after": {
		borderBottomColor: "#D8B08B",
	},
	"& .MuiFilledInput-underline:after": {
		borderBottomColor: "#D8B08B",
	},
	"& .MuiOutlinedInput-root": {
		"&.Mui-focused fieldset": {
			borderColor: "#D8B08B",
		},
		"& .MuiSelect-root": {
			"&.Mui-focused fieldset": {
				borderColor: "#D8B08B",
			},
		},
	},
};


export const SelectFieldStyle = {
	marginBottom: "12px",
	marginTop: "3px",

	"& .MuiSelect-select": {
		backgroundColor: "white",
	},

  // Default border color (when not focused)
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "darkgrey",
    },
  },

  // Border color when focused
  "& .MuiOutlinedInput-root.Mui-focused": {
    "& fieldset": {
      borderColor: "#D8B08B !important", // Ensure it overrides default blue
    },
  },

};
