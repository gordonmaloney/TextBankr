import React from "react";
import {
	BrowserRouter as Router,
	Routes,
	Route,
	useParams,
	Navigate,
} from "react-router-dom";
import Home from "./Home";
import TextBankr from "./TextBankr";
import { Translations } from "./Translations";

// Supported languages (excluding default English)
const supportedLanguages = ["fr"]; // English doesn't need a prefix

// Component to handle language-based translations
const LanguageWrapper = ({ Component }) => {
	const { lang } = useParams(); // Extract language from URL

	console.log("Detected lang:", lang); // Debugging output

	// If the language is not supported, redirect to English home
	if (!supportedLanguages.includes(lang)) {
		return <Navigate to="/" replace />;
	}

	const Translation = Translations[lang];

	return <Component Translation={Translation} />;
};

const App = () => {
	return (
		<Router>
			<Routes>
				{/* Default English routes (no language prefix) */}
				<Route path="/" element={<Home Translation={Translations["en"]} />} />
				<Route
					path="/start"
					element={<TextBankr Translation={Translations["en"]} />}
				/>

				{/* Parent Route for Language Handling */}
				<Route path="/:lang/*" element={<LanguageRoutes />} />

				{/* Redirect unknown languages to English */}
				<Route path="*" element={<Navigate to="/" replace />} />
			</Routes>
		</Router>
	);
};

// Separate Component for Handling Language-Based Routing
const LanguageRoutes = () => {
	const { lang } = useParams();

	// Redirect if language is not in supportedLanguages
	if (!supportedLanguages.includes(lang)) {
		return <Navigate to="/" replace />;
	}

	return (
		<Routes>
			<Route path="/" element={<Home Translation={Translations[lang]} />} />
			<Route
				path="/start"
				element={<TextBankr Translation={Translations[lang]} />}
			/>
		</Routes>
	);
};

export default App;
