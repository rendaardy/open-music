import Joi from "joi";

import {
	postAuthenticationHandler,
	putAuthenticationHandler,
	deleteAuthenticationHandler,
} from "./handlers/authentications.js";
import { InvariantError } from "../../utils/error.js";

const userCredentialSchema = Joi.object({
	username: Joi.string().trim().required(),
	password: Joi.string().required(),
});

const refreshTokenSchema = Joi.object({
	refreshToken: Joi.string().required(),
});

const responseSchema = Joi.object({
	status: Joi.string().valid("success", "fail").required(),
	message: Joi.string().optional(),
	data: Joi.object()
		.alter({
			postAuth: (schema) =>
				schema.append({
					accessToken: Joi.string().required(),
					refreshToken: Joi.string().required(),
				}),
			putAuth: (schema) =>
				schema.append({
					accessToken: Joi.string().required(),
				}),
		})
		.optional(),
});

const postAuthResponseSchema = responseSchema.tailor("postAuth");
const putAuthResponseSchema = responseSchema.tailor("putAuth");

/** @type {import("@hapi/hapi").Plugin<undefined>} */
export const authPlugin = {
	name: "app/authentications",
	dependencies: ["app/auth-service", "app/users-service"],
	async register(server) {
		server.route([
			{
				method: "POST",
				path: "/authentications",
				handler: postAuthenticationHandler,
				options: {
					validate: {
						payload: userCredentialSchema,
						async failAction(request, h, err) {
							throw new InvariantError(/** @type {any} */ (err)?.details[0]?.message);
						},
					},
					response: {
						schema: postAuthResponseSchema,
					},
				},
			},
			{
				method: "PUT",
				path: "/authentications",
				handler: putAuthenticationHandler,
				options: {
					validate: {
						payload: refreshTokenSchema,
						async failAction(request, h, err) {
							throw new InvariantError(/** @type {any} */ (err)?.details[0]?.message);
						},
					},
					response: {
						schema: putAuthResponseSchema,
					},
				},
			},
			{
				method: "DELETE",
				path: "/authentications",
				handler: deleteAuthenticationHandler,
				options: {
					validate: {
						payload: refreshTokenSchema,
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
