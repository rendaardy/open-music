import Joi from "joi";

import { postUserHandler, getUserByIdHandler } from "./handlers/users.js";
import { InvariantError } from "#open-music/utils/error.js";

const bodySchema = Joi.object({
	username: Joi.string().trim().required(),
	password: Joi.string().required(),
	fullname: Joi.string().trim().required(),
});

const responseSchema = Joi.object({
	status: Joi.string().valid("success", "fail").required(),
	message: Joi.string().optional(),
	data: Joi.object()
		.alter({
			postUser: (schema) =>
				schema.append({
					userId: Joi.string().required(),
				}),
			getUser: (schema) =>
				schema.append({
					user: Joi.object({
						id: Joi.string().required(),
						username: Joi.string().required(),
						fullname: Joi.string().required(),
					}),
				}),
		})
		.optional(),
});

const postUserResponseSchema = responseSchema.tailor("postUser");
const getUserResponseSchema = responseSchema.tailor("getUser");

export const usersPlugin = {
	name: "app/users",
	dependencies: ["app/users-service"],
	async register(server) {
		server.route([
			{
				method: "POST",
				path: "/users",
				handler: postUserHandler,
				options: {
					validate: {
						payload: bodySchema,
						async failAction(request, h, err) {
							throw new InvariantError(/** @type {any} */ (err)?.details[0]?.message);
						},
					},
					response: {
						schema: postUserResponseSchema,
					},
				},
			},
			{
				method: "GET",
				path: "/users/{id}",
				handler: getUserByIdHandler,
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
						schema: getUserResponseSchema,
					},
				},
			},
		]);
	},
};
