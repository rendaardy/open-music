import process from "node:process";

import { server as hapiServer } from "@hapi/hapi";
import pinoPlugin from "hapi-pino";
import Jwt from "@hapi/jwt";
import * as dotenv from "dotenv";

import { albumsPlugin } from "./plugins/api/albums.js";
import { songsPlugin } from "./plugins/api/songs.js";
import { authPlugin } from "./plugins/api/authentications.js";
import { usersPlugin } from "./plugins/api/users.js";
import { playlistsPlugin } from "./plugins/api/playlists.js";
import { collabPlugin } from "./plugins/api/collaborations.js";

import { albumsServicePlugin } from "./plugins/services/albums-service.js";
import { songsServicePlugin } from "./plugins/services/songs-service.js";
import { usersServicePlugin } from "./plugins/services/users-service.js";
import { authServicePlugin } from "./plugins/services/authentications-service.js";
import { playlistsServicePlugin } from "./plugins/services/playlists-service.js";
import { collabServicePlugin } from "./plugins/services/collaborations-service.js";

import { ClientError } from "./utils/error.js";

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
			logPayload: process.env.NODE_ENV !== "production",
			logQueryParams: true,
			logPathParams: true,
			logRouteTags: true,
		},
	});
	await server.register([Jwt]);

	server.auth.strategy("open-music_jwt", "jwt", {
		keys: process.env.ACCESS_TOKEN_KEY,
		verify: {
			aud: false,
			iss: false,
			sub: false,
			maxAgeSec: process.env.ACCESS_TOKEN_AGE,
		},
		validate(artifacts, _request, _h) {
			return {
				isValid: true,
				credentials: {
					userId: artifacts.decoded.payload.userId,
				},
			};
		},
	});

	await server.register([
		albumsPlugin,
		songsPlugin,
		usersPlugin,
		authPlugin,
		playlistsPlugin,
		collabPlugin,
		albumsServicePlugin,
		songsServicePlugin,
		usersServicePlugin,
		authServicePlugin,
		playlistsServicePlugin,
		collabServicePlugin,
	]);

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
					message:
						process.env.NODE_ENV === "production"
							? "An internal server error occurred"
							: response.message,
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
