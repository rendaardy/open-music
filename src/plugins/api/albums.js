import Joi from "joi";

import { InvariantError } from "#open-music/utils/error.js";
import {
	getAlbumHandler,
	postAlbumHandler,
	putAlbumHandler,
	deleteAlbumHandler,
	postUploadAlbumCoverHandler,
	getAlbumLikesHandler,
	postAlbumLikesHandler,
} from "./handlers/albums.js";

const bodySchema = Joi.object({
	name: Joi.string().trim().required(),
	year: Joi.number().integer().min(1900).max(new Date().getFullYear()).required(),
});

const responseSchema = Joi.object({
	status: Joi.string().valid("success", "fail").required(),
	message: Joi.string().default(null),
	data: Joi.object()
		.alter({
			get: (schema) =>
				schema.append({
					album: Joi.object({
						id: Joi.string().required(),
						name: Joi.string().required(),
						coverUrl: Joi.string().allow(null),
						year: Joi.number().integer().required(),
						songs: Joi.array()
							.items(
								Joi.object({
									id: Joi.string().allow(null),
									title: Joi.string().allow(null),
									performer: Joi.string().allow(null),
								}),
							)
							.optional()
							.allow(null),
					}),
				}),
			post: (schema) =>
				schema.append({
					albumId: Joi.string().required(),
				}),
			likes: (schema) =>
				schema.append({
					likes: Joi.number().integer().positive().required(),
				}),
		})
		.optional(),
});

const getAlbumResponseSchema = responseSchema.tailor("get");
const postAlbumResponseSchema = responseSchema.tailor("post");

/** @type {import("@hapi/hapi").Plugin<undefined>} */
export const albumsPlugin = {
	name: "app/albums",
	dependencies: ["app/albums-service", "app/aws-s3-service"],
	async register(server) {
		server.method("validateHeaders", (headers) => {
			const HeadersSchema = Joi.object({
				"content-type": Joi.string()
					.valid("image/apng", "image/avif", "image/gif", "image/jpeg", "image/png", "image/webp")
					.required(),
			}).unknown();
			const result = HeadersSchema.validate(headers);

			if (result.error) {
				throw new InvariantError(result.error.message);
			}
		});

		server.route([
			{
				method: "GET",
				path: "/albums/{id}",
				handler: getAlbumHandler,
				options: {
					validate: {
						params: Joi.object({
							id: Joi.string(),
						}),
						async failAction(request, h, err) {
							throw new InvariantError(/** @type {any} */ (err)?.details[0].message);
						},
					},
					response: {
						schema: getAlbumResponseSchema,
					},
				},
			},
			{
				method: "POST",
				path: "/albums",
				handler: postAlbumHandler,
				options: {
					validate: {
						payload: bodySchema,
						async failAction(request, h, err) {
							throw new InvariantError(/** @type {any} */ (err)?.details[0].message);
						},
					},
					response: {
						schema: postAlbumResponseSchema,
					},
				},
			},
			{
				method: "PUT",
				path: "/albums/{id}",
				handler: putAlbumHandler,
				options: {
					validate: {
						params: Joi.object({
							id: Joi.string(),
						}),
						payload: bodySchema,
						async failAction(request, h, err) {
							throw new InvariantError(/** @type {any} */ (err)?.details[0].message);
						},
					},
					response: {
						schema: responseSchema,
					},
				},
			},
			{
				method: "DELETE",
				path: "/albums/{id}",
				handler: deleteAlbumHandler,
				options: {
					validate: {
						params: Joi.object({
							id: Joi.string(),
						}),
						async failAction(request, h, err) {
							throw new InvariantError(/** @type {any} */ (err)?.details[0].message);
						},
					},
					response: {
						schema: responseSchema,
					},
				},
			},
			{
				method: "POST",
				path: "/albums/{id}/covers",
				handler: postUploadAlbumCoverHandler,
				options: {
					validate: {
						params: Joi.object({
							id: Joi.string().required(),
						}),
						async failAction(request, h, err) {
							console.log(err);
							throw new InvariantError(/** @type {any} */ (err)?.details[0]?.message);
						},
					},
					payload: {
						allow: "multipart/form-data",
						maxBytes: 512000,
						// @ts-ignore
						multipart: true,
						output: "stream",
					},
					response: {
						schema: responseSchema,
					},
				},
			},
			{
				method: "GET",
				path: "/albums/{id}/likes",
				handler: getAlbumLikesHandler,
				options: {
					validate: {
						params: Joi.object({
							id: Joi.string().required(),
						}),
						async failAction(request, h, err) {
							throw new InvariantError(/** @type {any} */ (err)?.details[0]?.message);
						},
					},
					response: {
						schema: responseSchema.tailor("likes"),
					},
				},
			},
			{
				method: "POST",
				path: "/albums/{id}/likes",
				handler: postAlbumLikesHandler,
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
						schema: responseSchema,
					},
				},
			},
		]);
	},
};
