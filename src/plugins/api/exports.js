import Joi from "joi";

import { InvariantError } from "#open-music/utils/error.js";
import { postExportPlaylistHandler } from "./handlers/exports.js";

const bodySchema = Joi.object({
	targetEmail: Joi.string().trim().email().required(),
});

const responseSchema = Joi.object({
	status: Joi.string().valid("success", "fail").required(),
	message: Joi.string().required(),
});

/** @type {import("@hapi/hapi").Plugin<undefined>} */
export const exportsPlugin = {
	name: "app/exports",
	dependencies: ["app/message-service", "app/playlists-service"],
	async register(server) {
		server.route([
			{
				method: "POST",
				path: "/export/playlists/{playlistId}",
				handler: postExportPlaylistHandler,
				options: {
					auth: "open-music_jwt",
					validate: {
						params: Joi.object({
							playlistId: Joi.string().required(),
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
		]);
	},
};
