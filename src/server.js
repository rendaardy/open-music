import process from "node:process";

import { server as hapiServer } from "@hapi/hapi";
import Boom from "@hapi/boom";
import pinoPlugin from "hapi-pino";
import * as dotenv from "dotenv";

import { albumsPlugin } from "./plugins/albums.js";
import { songsPlugin } from "./plugins/songs.js";
import { albumsServicePlugin } from "./plugins/albums-service.js";
import { songsServicePlugin } from "./plugins/songs-service.js";

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

	server.route({
		method: "*",
		path: "/{any*}",
		handler() {
			const error = Boom.notFound("Not found");
			error.reformat();
			error.output.payload.status = "fail";

			return error;
		},
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
