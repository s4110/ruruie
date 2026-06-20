/* @refresh reload */
import { render } from "solid-js/web";
import App from "./App.tsx";
import "./index.css";

// Global error handler to catch uncaught exceptions
window.addEventListener("error", (event) => {
	// Filter out SES_UNCAUGHT_EXCEPTION errors from browser extensions
	if (event.message?.includes("SES_UNCAUGHT_EXCEPTION")) {
		event.preventDefault();
		return;
	}

	// Ignore null/undefined errors (often from browser extensions)
	if (event.error === null || event.error === undefined) {
		event.preventDefault();
		return;
	}

	// Log actual errors
	console.error("Uncaught error:", event.error);
});

// Catch unhandled promise rejections
window.addEventListener("unhandledrejection", (event) => {
	// Ignore null/undefined rejections
	if (event.reason === null || event.reason === undefined) {
		event.preventDefault();
		return;
	}

	console.error("Unhandled promise rejection:", event.reason);
});

const root = document.getElementById("root");

if (!root) {
	throw new Error("Root element not found");
}

render(() => <App />, root);
