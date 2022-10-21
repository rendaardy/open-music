import process from "node:process";

import { server as hapiServer } from "@hapi/hapi";
import pinoPlugin from "hapi-pino";
import Jwt from "@hapi/jwt";

import { albumsPlugin } from "./plugins/api/albums.js";
import { songsPlugin } from "./plugins/api/songs.js";
import { authPlugin } from "./plugins/api/authentications.js";
import { usersPlugin } from "./plugins/api/users.js";
import { playlistsPlugin } from "./plugins/api/playlists.js";
import { collabPlugin } from "./plugins/api/collaborations.js";
import { exportsPlugin } from "./plugins/api/exports.js";

import { albumsServicePlugin } from "./plugins/services/albums-service.js";
import { songsServicePlugin } from "./plugins/services/songs-service.js";
import { usersServicePlugin } from "./plugins/services/users-service.js";
import { authServicePlugin } from "./plugins/services/authentications-service.js";
import { playlistsServicePlugin } from "./plugins/services/playlists-service.js";
import { collabServicePlugin } from "./plugins/services/collaborations-service.js";
import { messageServicePlugin } from "./plugins/services/message-service.js";
import { s3Plugin } from "./plugins/services/aws-s3-service.js";
import { redisPlugin } from "./plugins/services/redis-service.js";

import { ClientError } from "./utils/error.js";
import { cfg } from "./utils/config.js";

const server = hapiServer({
	host: cfg.app.environment === "production" ? cfg.app.host : "localhost",
	port: cfg.app.port ?? 5000,
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
			logQueryParams: true,
			logPathParams: true,
			logRouteTags: true,
		},
	});
	await server.register([Jwt]);

	server.auth.strategy("open-music_jwt", "jwt", {
		keys: cfg.jwt.accessTokenKey,
		verify: {
			aud: false,
			iss: false,
			sub: false,
			maxAgeSec: cfg.jwt.tokenAge,
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
		exportsPlugin,
		albumsServicePlugin,
		songsServicePlugin,
		usersServicePlugin,
		authServicePlugin,
		playlistsServicePlugin,
		collabServicePlugin,
		messageServicePlugin,
	]);
	await server.register([
		{
			plugin: s3Plugin,
			options: {
				region: cfg.aws.region ?? "",
				bucketName: cfg.aws.s3.bucketName ?? "",
			},
		},
		{
			plugin: redisPlugin,
			options: {
				host: cfg.redis.server ?? "",
			},
		},
	]);

	server.ext("onPreResponse", (request, h) => {
		const { response } = request;

		if (response instanceof Error) {
			if (response instanceof ClientError) {
				request.logger.error("Client Error: %s", response.message);

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

			request.logger.error("Server Error: %s", response.message);

			return h
				.response({
					status: "error",
					message:
						cfg.app.environment === "production"
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
