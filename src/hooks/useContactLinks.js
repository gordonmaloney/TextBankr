import { useState, useMemo } from "react";
import { countries } from "../CountrySelect";
import { SignalTelegramEnabled } from "../Settings";


// Utility functions
import {
	validateAndFormatNumber,
	generateWhatsAppLink,
	generateSMSLink,
	generateSignalLink,
	generateTelegramLink,
	isLandline,
	formatForTel,
} from "../utils/contactUtils";

const useContactLinks = (
	extensionCode,
	enableSignal = SignalTelegramEnabled
) => {
	const [showSignalLinks, setShowSignalLinks] = useState(false);
	const [signalModal, setSignalModal] = useState(false);

	const toggleSignalLinks = () => {
		if (!showSignalLinks) setSignalModal(true);
		setShowSignalLinks(!showSignalLinks);
	};

	const handleSignalClick = (number, message) => {
		const signalLink = generateSignalLink(number, extensionCode); // ✅ Pass extensionCode here
		if (!signalLink) return;

		navigator.clipboard
			.writeText(message)
			.then(() => window.open(signalLink, "_blank"))
			.catch((err) =>
				console.error("Failed to copy message to clipboard:", err)
			);
	};

	const validateAndFormat = (number) =>
		validateAndFormatNumber(number, extensionCode);

	// ✅ Keep the useMemo approach for generating links
	const context = useMemo(
		() => ({
			validateAndFormatNumber: (number) =>
				validateAndFormatNumber(number, extensionCode),
			generateWhatsAppLink: (name, number, message) =>
				generateWhatsAppLink(name, number, message, extensionCode), // ✅ Pass extensionCode
			generateTelegramLink: (name, number, message, isMobile) =>
				generateTelegramLink(name, number, message, extensionCode, isMobile), // ✅ Pass extensionCode
			generateSMSLink: (name, number, message) =>
				generateSMSLink(name, number, message, extensionCode), // ✅ Pass extensionCode
			generateSignalLink: (number) => generateSignalLink(number, extensionCode), // ✅ Pass extensionCode
			isLandline: (number) => isLandline(number, extensionCode), // ✅ Pass extensionCode
			formatForTel: (number) => formatForTel(number, extensionCode), // ✅ Pass extensionCode
			handleSignalClick,
			showSignalLinks,
			toggleSignalLinks,
			signalModal,
			setSignalModal,
			enableSignal,
		}),
		[extensionCode, showSignalLinks, signalModal, enableSignal] // ✅ Ensure extensionCode is a dependency
	);

	return context;
};

export default useContactLinks;
