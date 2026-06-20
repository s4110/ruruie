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
	console.error("Uncaught error:", event.error);
});

// Catch unhandled promise rejections
window.addEventListener("unhandledrejection", (event) => {
	console.error("Unhandled promise rejection:", event.reason);
});

const root = document.getElementById("root");

if (!root) {
	throw new Error("Root element not found");
}

render(() => <App />, root);
