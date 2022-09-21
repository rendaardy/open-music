import { exit } from "node:process";

import { initializeServer, startServer } from "./server.js";

try {
	await initializeServer();
	await startServer();
} catch (error) {
	console.error(error);
	exit(1);
}
