/**
 * @param {import("@hapi/hapi").Request} request
 * @param {import("@hapi/hapi").ResponseToolkit} h
 * @return {Promise<import("@hapi/hapi").Lifecycle.ReturnValue>}
 */
export async function postPlaylistHandler(request, h) {
	const { name } = /** @type {{ name: string }} */ (request.payload);
	const { userId: owner } = /** @type {{ userId: string }} */ (request.auth.credentials);
	const { addPlaylist, deleteCache } = request.server.methods;

	const playlistId = await addPlaylist(name, owner);
	await deleteCache(`open-music:playlists:${owner}`);

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
 * @param {import("@hapi/hapi").ResponseToolkit} h
 * @return {Promise<import("@hapi/hapi").Lifecycle.ReturnValue>}
 */
export async function getPlaylistsHandler(request, h) {
	const { userId: owner } = /** @type {{ userId: string }} */ (request.auth.credentials);
	const { getPlaylists, getCache, setCache } = request.server.methods;

	let playlists = await getCache(`open-music:playlists:${owner}`);

	if (playlists !== null) {
		return h
			.response({
				status: "success",
				data: {
					playlists: JSON.parse(playlists),
				},
			})
			.code(200)
			.header("X-Data-Source", "cache");
	}

	playlists = await getPlaylists(owner);
	await setCache(`open-music:playlists:${owner}`, JSON.stringify(playlists));

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
	const { verifyPlaylistOwner, deletePlaylistById, deleteCache } = request.server.methods;

	await verifyPlaylistOwner(id, owner);
	await deletePlaylistById(id);
	await deleteCache(`open-music:playlists:${owner}`);

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
	const { verifyPlaylistAccess, addSongToPlaylist, isSongAvailable } = request.server.methods;

	await verifyPlaylistAccess(id, owner);
	await isSongAvailable(songId);
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
	const { verifyPlaylistAccess, getSongsInPlaylist } = request.server.methods;

	await verifyPlaylistAccess(id, owner);

	const playlist = await getSongsInPlaylist(id);

	return {
		status: "success",
		data: {
			playlist,
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
	const { verifyPlaylistAccess, deleteSongFromPlaylistById } = request.server.methods;

	await verifyPlaylistAccess(id, owner);
	await deleteSongFromPlaylistById(songId);

	return {
		status: "success",
		message: "Song deleted from the playlist successfully",
	};
}

/**
 * @param {import("@hapi/hapi").Request} request
 * @param {import("@hapi/hapi").ResponseToolkit} _h
 * @return {Promise<import("@hapi/hapi").Lifecycle.ReturnValue>}
 */
export async function getPlaylistActivitiesHandler(request, _h) {
	const { id } = request.params;
	const { userId: owner } = /** @type {{ userId: string }} */ (request.auth.credentials);
	const { verifyPlaylistAccess, getPlaylistActivities } = request.server.methods;

	await verifyPlaylistAccess(id, owner);

	const playlistActivities = await getPlaylistActivities(id);

	return {
		status: "success",
		data: {
			...playlistActivities,
		},
	};
}
