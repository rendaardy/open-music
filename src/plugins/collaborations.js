import Joi from "joi";

import {
	postCollaborationsHandler,
	deleteCollaborationsHandler,
} from "../handlers/collaborations.js";
import { InvariantError } from "../utils/error/invariant-error.js";

const bodySchema = Joi.object({
	playlistId: Joi.string().trim().required(),
	userId: Joi.string().trim().required(),
});

const responseSchema = Joi.object({
	status: Joi.string().valid("success", "fail").required(),
	message: Joi.string().optional(),
	data: Joi.object()
		.alter({
			postCollaborations: (schema) =>
				schema.append({
					collaborationId: Joi.string().required(),
				}),
		})
		.optional(),
});

/** @type {import("@hapi/hapi").Plugin<undefined>} */
export const collabPlugin = {
	name: "app/collaborations",
	dependencies: ["app/collaborations-service", "app/playlists-service", "app/users-service"],
	async register(server) {
		server.method("isUserAvailable", async (userId) => {
			await server.methods.getUserById(userId);
		});

		server.route([
			{
				method: "POST",
				path: "/collaborations",
				handler: postCollaborationsHandler,
				options: {
					auth: "open-music_jwt",
					validate: {
						payload: bodySchema,
						async failAction(request, h, err) {
							throw new InvariantError(/** @type {any} */ (err)?.details[0]?.message);
						},
					},
					response: {
						schema: responseSchema.tailor("postCollaborations"),
					},
				},
			},
			{
				method: "DELETE",
				path: "/collaborations",
				handler: deleteCollaborationsHandler,
				options: {
					auth: "open-music_jwt",
					validate: {
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
		]);
	},
};
