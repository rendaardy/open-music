/**
 * @typedef {object} RequestPayload
 * @property {string} playlistId
 * @property {string} userId
 */

/**
 * @param {import("@hapi/hapi").Request} request
 * @param {import("@hapi/hapi").ResponseToolkit} h
 * @return {Promise<import("@hapi/hapi").Lifecycle.ReturnValue>}
 */
export async function postCollaborationsHandler(request, h) {
	const { playlistId, userId } = /** @type {RequestPayload} */ (request.payload);
	const { userId: owner } = /** @type {{ userId: string }} */ (request.auth.credentials);
	const { addCollaboration, verifyPlaylistOwner, isUserAvailable } = request.server.methods;

	await verifyPlaylistOwner(playlistId, owner);
	await isUserAvailable(userId);

	const collaborationId = await addCollaboration(playlistId, userId);

	return h
		.response({
			status: "success",
			data: {
				collaborationId,
			},
		})
		.code(201);
}

/**
 * @param {import("@hapi/hapi").Request} request
 * @param {import("@hapi/hapi").ResponseToolkit} _h
 * @return {Promise<import("@hapi/hapi").Lifecycle.ReturnValue>}
 */
export async function deleteCollaborationsHandler(request, _h) {
	const { playlistId, userId } = /** @type {RequestPayload} */ (request.payload);
	const { userId: owner } = /** @type {{ userId: string }} */ (request.auth.credentials);
	const { deleteCollaboration, verifyPlaylistOwner } = request.server.methods;

	await verifyPlaylistOwner(playlistId, owner);
	await deleteCollaboration(playlistId, userId);

	return {
		status: "success",
		message: "Collaboration deleted successfully",
	};
}
