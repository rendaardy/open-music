/**
 * @param {import("@hapi/hapi").Request} request
 * @param {import("@hapi/hapi").ResponseToolkit} h
 * @return {Promise<import("@hapi/hapi").Lifecycle.ReturnValue>}
 */
export async function postPlaylistHandler(request, h) {
	const { name } = /** @type {{ name: string }} */ (request.payload);
	const { userId: owner } = /** @type {{ userId: string }} */ (request.auth.credentials);
	const { addPlaylist } = request.server.methods;

	const playlistId = await addPlaylist(name, owner);

	return h
		.response({
			status: "success",
			data: {
				playlistId,
			},
		})
		.code(201);
}

/**
 * @param {import("@hapi/hapi").Request} request
 * @param {import("@hapi/hapi").ResponseToolkit} _h
 * @return {Promise<import("@hapi/hapi").Lifecycle.ReturnValue>}
 */
export async function getPlaylistsHandler(request, _h) {
	const { userId: owner } = /** @type {{ userId: string }} */ (request.auth.credentials);
	const { getPlaylists } = request.server.methods;
	const playlists = await getPlaylists(owner);

	return {
		status: "success",
		data: {
			playlists,
		},
	};
}

/**
 * @param {import("@hapi/hapi").Request} request
 * @param {import("@hapi/hapi").ResponseToolkit} _h
 * @return {Promise<import("@hapi/hapi").Lifecycle.ReturnValue>}
 */
export async function deletePlaylistByIdHandler(request, _h) {
	const { id } = request.params;
	const { userId: owner } = /** @type {{ userId: string }} */ (request.auth.credentials);
	const { verifyPlaylistOwner, deletePlaylistById } = request.server.methods;

	await verifyPlaylistOwner(id, owner);
	await deletePlaylistById(id);

	return {
		status: "success",
		message: "Playlist deleted successfully",
	};
}

/**
 * @param {import("@hapi/hapi").Request} request
 * @param {import("@hapi/hapi").ResponseToolkit} h
 * @return {Promise<import("@hapi/hapi").Lifecycle.ReturnValue>}
 */
export async function postSongToPlaylistHandler(request, h) {
	const { id } = request.params;
	const { songId } = /** @type {{ songId: string }} */ (request.payload);
	const { userId: owner } = /** @type {{ userId: string }} */ (request.auth.credentials);
	const { verifyPlaylistOwner, addSongToPlaylist } = request.server.methods;

	await verifyPlaylistOwner(id, owner);
	await addSongToPlaylist(songId, id);

	return h
		.response({
			status: "success",
			message: "Song added to the playlist successfully",
		})
		.code(201);
}

/**
 * @param {import("@hapi/hapi").Request} request
 * @param {import("@hapi/hapi").ResponseToolkit} _h
 * @return {Promise<import("@hapi/hapi").Lifecycle.ReturnValue>}
 */
export async function getSongsInPlaylistHandler(request, _h) {
	const { id } = request.params;
	const { userId: owner } = /** @type {{ userId: string }} */ (request.auth.credentials);
	const { verifyPlaylistOwner, getSongsInPlaylist } = request.server.methods;

	await verifyPlaylistOwner(id, owner);

	const playlists = await getSongsInPlaylist(id);

	return {
		status: "success",
		data: {
			playlists,
		},
	};
}

/**
 * @param {import("@hapi/hapi").Request} request
 * @param {import("@hapi/hapi").ResponseToolkit} _h
 * @return {Promise<import("@hapi/hapi").Lifecycle.ReturnValue>}
 */
export async function deleteSongFromPlaylistByIdHandler(request, _h) {
	const { id } = request.params;
	const { songId } = /** @type {{ songId: string }} */ (request.payload);
	const { userId: owner } = /** @type {{ userId: string }} */ (request.auth.credentials);
	const { verifyPlaylistOwner, deleteSongFromPlaylistById } = request.server.methods;

	await verifyPlaylistOwner(id, owner);
	await deleteSongFromPlaylistById(songId);

	return {
		status: "success",
		message: "Song deleted from the playlist successfully",
	};
}
