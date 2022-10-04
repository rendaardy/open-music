import process from "node:process";

import { server as hapiServer } from "@hapi/hapi";
import pinoPlugin from "hapi-pino";
import * as dotenv from "dotenv";

import { albumsPlugin } from "./plugins/albums.js";
import { songsPlugin } from "./plugins/songs.js";
import { albumsServicePlugin } from "./plugins/albums-service.js";
import { songsServicePlugin } from "./plugins/songs-service.js";
import { ClientError } from "./utils/error/client-error.js";

dotenv.config();

const server = hapiServer({
	host: process.env.NODE_ENV === "production" ? process.env.HOST : "localhost",
	port: process.env.PORT ?? 5000,
	debug: false,
});

/**
 * @return {Promise<import("@hapi/hapi").Server>}
 */
export async function initializeServer() {
	await server.register({
		plugin: pinoPlugin,
		options: {
			redact: ["req.headers.authorization"],
		},
	});

	await server.register([albumsPlugin, songsPlugin, albumsServicePlugin, songsServicePlugin]);

	server.ext("onPreResponse", (request, h) => {
		const { response } = request;

		if (response instanceof Error) {
			if (response instanceof ClientError) {
				return h
					.response({
						status: "fail",
						message: response.message,
					})
					.code(response.statusCode);
			}

			if (!response.isServer) {
				return h.continue;
			}

			return h
				.response({
					status: "error",
					message: "An internal server error occurred",
				})
				.code(500);
		}

		return h.continue;
	});

	return server;
}

/**
 * @return {Promise<import("@hapi/hapi").Server>}
 */
export async function startServer() {
	await server.start();

	return server;
}

process.on("unhandledRejection", (reason, promise) => {
	console.error("unhandled rejection occurred at:", promise, "reason:", reason);
	process.exit(1);
});
