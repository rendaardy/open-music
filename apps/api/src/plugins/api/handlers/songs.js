/**
 * @param {import("@hapi/hapi").Request} request
 * @param {import("@hapi/hapi").ResponseToolkit} h
 * @return {Promise<import("@hapi/hapi").Lifecycle.ReturnValue>}
 */
export async function getAllSongsHandler(request, h) {
	const { getSongs, getCache, setCache } = request.server.methods;

	if (!request.query) {
		const songs = await getCache("open-music:songs");

		return h
			.response({
				status: "success",
				message: "All songs retrieved successfully",
				data: {
					songs: JSON.parse(songs).map((song) => ({
						id: song.id,
						title: song.title,
						performer: song.performer,
					})),
				},
			})
			.code(200)
			.header("X-Data-Source", "cache");
	}

	const songs = await getSongs(request.query);
	if (!request.query) {
		await setCache("open-music:songs", JSON.stringify(songs));
	}

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
 * @param {import("@hapi/hapi").ResponseToolkit} h
 * @return {Promise<import("@hapi/hapi").Lifecycle.ReturnValue>}
 */
export async function getSongHandler(request, h) {
	const { id } = request.params;
	const { getSong, getCache, setCache } = request.server.methods;

	let song = await getCache(`open-music:song:${id}`);

	if (song !== null) {
		return h.response({
			status: "success",
			message: "Song retrieved successfully",
			data: {
				song: JSON.parse(song),
			},
		});
	}

	song = await getSong(id);
	await setCache(`open-music:song:${id}`, JSON.stringify(song));

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
	const { addSong, deleteCache } = request.server.methods;
	const songId = await addSong(payload);

	await deleteCache("open-music:songs");

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
	const { updateSong, deleteCache } = request.server.methods;

	await updateSong(id, payload);
	await deleteCache("open-music:songs");
	await deleteCache(`open-music:song:${id}`);

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
	const { deleteSong, deleteCache } = request.server.methods;

	await deleteSong(id);
	await deleteCache("open-music:songs");
	await deleteCache(`open-music:song:${id}`);

	return {
		status: "success",
		message: "Song deleted successfully",
	};
}
