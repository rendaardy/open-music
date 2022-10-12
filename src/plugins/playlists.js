import Joi from "joi";

import {
	postPlaylistHandler,
	getPlaylistsHandler,
	deletePlaylistByIdHandler,
	postSongToPlaylistHandler,
	getSongsInPlaylistHandler,
	deleteSongFromPlaylistByIdHandler,
} from "../handlers/playlists.js";
import { InvariantError } from "../utils/error/invariant-error.js";

const playlistBodySchema = Joi.object({
	name: Joi.string().trim().required(),
});

const songPlaylistBodySchema = Joi.object({
	songId: Joi.string().trim().required(),
});

const responseSchema = Joi.object({
	status: Joi.string().valid("success", "fail").required(),
	message: Joi.string().optional(),
	data: Joi.object()
		.alter({
			postPlaylist: (schema) =>
				schema.append({
					playlistId: Joi.string().required(),
				}),
			getPlaylists: (schema) =>
				schema.append({
					playlists: Joi.array()
						.items(
							Joi.object({
								id: Joi.string().required(),
								name: Joi.string().required(),
								username: Joi.string().required(),
							}),
						)
						.required(),
				}),
			getPlaylistWithSongs: (schema) =>
				schema.append({
					playlist: Joi.object({
						id: Joi.string().required(),
						name: Joi.string().required(),
						username: Joi.string().required(),
						songs: Joi.array()
							.items(
								Joi.object({
									id: Joi.string().required(),
									title: Joi.string().required(),
									performer: Joi.string().required(),
								}),
							)
							.required(),
					}).required(),
				}),
		})
		.optional(),
});

/** @type {import("@hapi/hapi").Plugin<undefined>} */
export const playlistsPlugin = {
	name: "app/playlists",
	dependencies: ["app/playlists-service"],
	async register(server) {
		server.route([
			{
				method: "POST",
				path: "/playlists/{id}/songs",
				handler: postSongToPlaylistHandler,
				options: {
					auth: "open-music_jwt",
					validate: {
						params: Joi.object({
							id: Joi.string().required(),
						}),
						payload: songPlaylistBodySchema,
						async failAction(request, h, err) {
							throw new InvariantError(/** @type {any} */ (err)?.details[0]?.message);
						},
					},
					response: {
						schema: responseSchema,
					},
				},
			},
			{
				method: "GET",
				path: "/playlists/{id}/songs",
				handler: getSongsInPlaylistHandler,
				options: {
					auth: "open-music_jwt",
					validate: {
						params: Joi.object({
							id: Joi.string().required(),
						}),
						async failAction(request, h, err) {
							throw new InvariantError(/** @type {any} */ (err)?.details[0]?.message);
						},
					},
					response: {
						schema: responseSchema.tailor("getPlaylistWithSongs"),
					},
				},
			},
			{
				method: "DELETE",
				path: "/playlists/{id}/songs",
				handler: deleteSongFromPlaylistByIdHandler,
				options: {
					auth: "open-music_jwt",
					validate: {
						params: Joi.object({
							id: Joi.string().required(),
						}),
						payload: songPlaylistBodySchema,
						async failAction(request, h, err) {
							throw new InvariantError(/** @type {any} */ (err)?.details[0]?.message);
						},
					},
					response: {
						schema: responseSchema,
					},
				},
			},
			{
				method: "POST",
				path: "/playlists",
				handler: postPlaylistHandler,
				options: {
					auth: "open-music_jwt",
					validate: {
						payload: playlistBodySchema,
						async failAction(request, h, err) {
							throw new InvariantError(/** @type {any} */ (err)?.details[0]?.message);
						},
					},
					response: {
						schema: responseSchema.tailor("postPlaylist"),
					},
				},
			},
			{
				method: "GET",
				path: "/playlists",
				handler: getPlaylistsHandler,
				options: {
					auth: "open-music_jwt",
					response: {
						schema: responseSchema.tailor("getPlaylists"),
					},
				},
			},
			{
				method: "DELETE",
				path: "/playlists",
				handler: deletePlaylistByIdHandler,
				options: {
					auth: "open-music_jwt",
					response: {
						schema: responseSchema,
					},
				},
			},
		]);
	},
};
