import Joi from "joi";

import { InvariantError } from "../../utils/error.js";
import {
	getAllSongsHandler,
	getSongHandler,
	postSongHandler,
	putSongHandler,
	deleteSongHandler,
} from "./handlers/songs.js";

const bodySchema = Joi.object({
	title: Joi.string().trim().required(),
	year: Joi.number().integer().required(),
	genre: Joi.string().trim().required(),
	performer: Joi.string().trim().required(),
	duration: Joi.number().integer().optional().allow(null),
	albumId: Joi.string().trim().optional().allow(null),
});

const responseSchema = Joi.object({
	status: Joi.string().valid("success", "fail").required(),
	message: Joi.string().optional(),
	data: Joi.object()
		.alter({
			getSongs: (schema) =>
				schema.append({
					songs: Joi.array().items(
						Joi.object({
							id: Joi.string().required(),
							title: Joi.string().required(),
							performer: Joi.string().required(),
						}),
					),
				}),
			getSong: (schema) =>
				schema.append({
					song: Joi.object({
						id: Joi.string().required(),
						title: Joi.string().required(),
						year: Joi.number().integer().required(),
						performer: Joi.string().required(),
						genre: Joi.string().required(),
						duration: Joi.number().integer().optional().allow(null),
						albumId: Joi.string().optional().allow(null),
					}),
				}),
			postSong: (schema) =>
				schema.append({
					songId: Joi.string().required(),
				}),
		})
		.optional(),
});

const getSongsResponseSchema = responseSchema.tailor("getSongs");
const getSongResponseSchema = responseSchema.tailor("getSong");
const postSongResponseSchema = responseSchema.tailor("postSong");

/** @type {import("@hapi/hapi").Plugin<undefined>} */
export const songsPlugin = {
	name: "app/songs",
	dependencies: ["app/songs-service"],
	async register(server) {
		server.route([
			{
				method: "GET",
				path: "/songs",
				handler: getAllSongsHandler,
				options: {
					validate: {
						query: Joi.object({
							title: Joi.string().trim(),
							performer: Joi.string().trim(),
						}),
						async failAction(request, h, err) {
							throw new InvariantError(/** @type {any} */ (err)?.details[0]?.message);
						},
					},
					response: {
						schema: getSongsResponseSchema,
					},
				},
			},
			{
				method: "GET",
				path: "/songs/{id}",
				handler: getSongHandler,
				options: {
					validate: {
						params: Joi.object({
							id: Joi.string(),
						}),
						async failAction(request, h, err) {
							throw new InvariantError(/** @type {any} */ (err)?.details[0]?.message);
						},
					},
					response: {
						schema: getSongResponseSchema,
					},
				},
			},
			{
				method: "POST",
				path: "/songs",
				handler: postSongHandler,
				options: {
					validate: {
						payload: bodySchema,
						async failAction(request, h, err) {
							throw new InvariantError(/** @type {any} */ (err)?.details[0]?.message);
						},
					},
					response: {
						schema: postSongResponseSchema,
					},
				},
			},
			{
				method: "PUT",
				path: "/songs/{id}",
				handler: putSongHandler,
				options: {
					validate: {
						params: Joi.object({
							id: Joi.string(),
						}),
						payload: bodySchema,
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
				method: "DELETE",
				path: "/songs/{id}",
				handler: deleteSongHandler,
				options: {
					validate: {
						params: Joi.object({
							id: Joi.string(),
						}),
						async failAction(request, h, err) {
							throw new InvariantError(/** @type {any} */ (err)?.details[0]?.message);
						},
					},
					response: {
						schema: responseSchema,
					},
				},
			},
		]);
	},
};
