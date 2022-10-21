/**
 * @param {import("@hapi/hapi").Request} request
 * @param {import("@hapi/hapi").ResponseToolkit} h
 * @return {Promise<import("@hapi/hapi").Lifecycle.ReturnValue>}
 */
export async function postExportPlaylistHandler(request, h) {
	const { playlistId } = request.params;
	const { userId } = request.auth.credentials;
	const { targetEmail } = /** @type {{ targetEmail: string }} */ (request.payload);
	const { verifyPlaylistOwner, sendMessage } = request.server.methods;

	await verifyPlaylistOwner(playlistId, userId);
	await sendMessage(
		"export:playlist",
		JSON.stringify({
			playlistId,
			targetEmail,
		}),
	);

	return h
		.response({
			status: "success",
			message: "Your request is being processed",
		})
		.code(201);
}
