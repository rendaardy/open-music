/**
 * @param {import("@hapi/hapi").Request} request
 * @param {import("@hapi/hapi").ResponseToolkit} _h
 * @return {Promise<import("@hapi/hapi").Lifecycle.ReturnValue>}
 */
export async function getAllSongsHandler(request, _h) {
	const { getSongs } = request.server.methods;
	const songs = await getSongs(request.query);

	return {
		status: "success",
		message: "All songs retrieved successfully",
		data: {
			songs: songs.map((song) => ({
				id: song.id,
				title: song.title,
				performer: song.performer,
			})),
		},
	};
}

/**
 * @param {import("@hapi/hapi").Request} request
 * @param {import("@hapi/hapi").ResponseToolkit} _h
 * @return {Promise<import("@hapi/hapi").Lifecycle.ReturnValue>}
 */
export async function getSongHandler(request, _h) {
	const { id } = request.params;
	const { getSong } = request.server.methods;
	const song = await getSong(id);

	return {
		status: "success",
		message: "Song retrieved successfully",
		data: {
			song,
		},
	};
}

/**
 * @param {import("@hapi/hapi").Request} request
 * @param {import("@hapi/hapi").ResponseToolkit} h
 * @return {Promise<import("@hapi/hapi").Lifecycle.ReturnValue>}
 */
export async function postSongHandler(request, h) {
	const { payload } = request;
	const { addSong } = request.server.methods;
	const songId = await addSong(payload);

	return h
		.response({
			status: "success",
			message: "Song added successfully",
			data: {
				songId,
			},
		})
		.code(201);
}

/**
 * @param {import("@hapi/hapi").Request} request
 * @param {import("@hapi/hapi").ResponseToolkit} _h
 * @return {Promise<import("@hapi/hapi").Lifecycle.ReturnValue>}
 */
export async function putSongHandler(request, _h) {
	const { id } = request.params;
	const { payload } = request;
	const { updateSong } = request.server.methods;

	await updateSong(id, payload);

	return {
		status: "success",
		message: "Song updated successfully",
	};
}

/**
 * @param {import("@hapi/hapi").Request} request
 * @param {import("@hapi/hapi").ResponseToolkit} _h
 * @return {Promise<import("@hapi/hapi").Lifecycle.ReturnValue>}
 */
export async function deleteSongHandler(request, _h) {
	const { id } = request.params;
	const { deleteSong } = request.server.methods;

	await deleteSong(id);

	return {
		status: "success",
		message: "Song deleted successfully",
	};
}
