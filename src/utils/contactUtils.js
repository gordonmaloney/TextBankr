import { countries } from "../CountrySelect";

export const validateAndFormatNumber = (number, extensionCode) => {
	// Log to debug if extensionCode is passed correctly

	const cleanedNumber = number.replace(/[^0-9+]/g, "");

	if (cleanedNumber.startsWith("+")) return cleanedNumber;

	for (const country of countries) {
		if (cleanedNumber.startsWith(country.code.replace("+", ""))) {
			return `+${cleanedNumber}`;
		}
	}

	if (cleanedNumber.startsWith("0")) {
		return `${
			extensionCode && extensionCode.startsWith("+")
				? extensionCode
				: `+${extensionCode}`
		}${cleanedNumber.slice(1)}`;
	}

	if (/^[0-9]{10}$/.test(cleanedNumber)) {
		return `${
			extensionCode && extensionCode.startsWith("+")
				? extensionCode
				: `+${extensionCode}`
		}${cleanedNumber}`;
	}

	return null;
};

export const generateWhatsAppLink = (name, number, message, extensionCode) => {
	const validatedNumber = validateAndFormatNumber(number, extensionCode);
	if (!validatedNumber) return null;

	const firstName = name.split(" ")[0];
	const encodedMessage = encodeURIComponent(`Hey ${firstName}! ${message}`);
	return `https://api.whatsapp.com/send?phone=${validatedNumber.replace(
		"+",
		""
	)}&text=${encodedMessage}`;
};

export const generateSMSLink = (name, number, message, extensionCode) => {
	const validatedNumber = validateAndFormatNumber(number, extensionCode);
	if (!validatedNumber) return null;

	const firstName = name.split(" ")[0];
	const formattedNumber = validatedNumber.startsWith("+44")
		? `0${validatedNumber.slice(3)}`
		: validatedNumber;

	const encodedMessage = encodeURIComponent(`Hey ${firstName}! ${message}`);
	return `sms:${formattedNumber}?&body=${encodedMessage}`;
};

export const generateSignalLink = (number, extensionCode) => {
	const validatedNumber = validateAndFormatNumber(number, extensionCode);
	if (!validatedNumber) return null;

	return `https://signal.me/#p/${validatedNumber}`;
};

export const generateTelegramLink = (
	name,
	number,
	message,
	extensionCode,
	isMobile
) => {
	console.log("logging isMobile? " + isMobile)
	const validatedNumber = validateAndFormatNumber(number, extensionCode);
	if (!validatedNumber) return null;

	const firstName = name.split(" ")[0];
	const encodedMessage = encodeURIComponent(`Hey ${firstName}! ${message}`);

	// ✅ Keep the "+" for Telegram Web
	const telegramNumber = validatedNumber; 

	// ✅ Conditionally return different URLs based on isMobile
	if (isMobile) {
		// Use tg://msg_url for mobile to open the Telegram app directly
		return `tg://resolve?phone=${telegramNumber}&text=${encodedMessage}`;
	} else {
		// Use the web link for desktop
		return `https://web.t.me/${telegramNumber}?text=${encodedMessage}`;
	}
};


export const isLandline = (number, extensionCode) => {
	const cleanedNumber = number.replace(/[^0-9+]/g, "");
	let numberPrefix = cleanedNumber;

	for (const country of countries) {
		const strippedCode = country.code.replace("+", "");
		if (numberPrefix.startsWith(strippedCode)) {
			numberPrefix = numberPrefix.slice(strippedCode.length);
			break;
		}
	}

	if (cleanedNumber.startsWith("+")) numberPrefix = cleanedNumber.slice(1);
	if (numberPrefix.startsWith("44")) numberPrefix = numberPrefix.slice(2);
	else if (numberPrefix.startsWith("0")) numberPrefix = numberPrefix.slice(1);

	const landlinePrefixes = ["01", "02", "03", "1", "2", "3"];
	return landlinePrefixes.some((prefix) => numberPrefix.startsWith(prefix));
};

export const formatForTel = (number, extensionCode) =>
	validateAndFormatNumber(number, extensionCode);
