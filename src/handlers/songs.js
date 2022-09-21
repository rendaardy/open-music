import Boom from "@hapi/boom";

/**
 * @param {import("@hapi/hapi").Request} request
 * @param {import("@hapi/hapi").ResponseToolkit} h
 * @return {Promise<import("@hapi/hapi").Lifecycle.ReturnValue>}
 */
export async function getAllSongsHandler(request, h) {
	try {
		const songs = await request.server.methods.getSongs(request.query);

		return h
			.response({
				status: "success",
				message: "All songs retrieved successfully",
				data: {
					songs: songs.map((song) => ({
						id: song.id,
						title: song.title,
						performer: song.performer,
					})),
				},
			})
			.code(200);
	} catch (error) {
		const boom = Boom.badImplementation(error.message);
		boom.reformat();
		boom.output.payload.status = "fail";
		return boom;
	}
}

/**
 * @param {import("@hapi/hapi").Request} request
 * @param {import("@hapi/hapi").ResponseToolkit} h
 * @return {Promise<import("@hapi/hapi").Lifecycle.ReturnValue>}
 */
export async function getSongHandler(request, h) {
	const { id } = request.params;

	try {
		const song = await request.server.methods.getSong(id);

		if (!song) {
			const boom = Boom.notFound("Song not found");
			boom.reformat();
			boom.output.payload.status = "fail";
			return boom;
		}

		return h
			.response({
				status: "success",
				message: "Song retrieved successfully",
				data: {
					song,
				},
			})
			.code(200);
	} catch (error) {
		const boom = Boom.badImplementation(error.message);
		boom.reformat();
		boom.output.payload.status = "fail";
		return boom;
	}
}

/**
 * @param {import("@hapi/hapi").Request} request
 * @param {import("@hapi/hapi").ResponseToolkit} h
 * @return {Promise<import("@hapi/hapi").Lifecycle.ReturnValue>}
 */
export async function postSongHandler(request, h) {
	const { payload } = request;

	try {
		const songId = await request.server.methods.addSong(payload);

		return h
			.response({
				status: "success",
				message: "Song added successfully",
				data: {
					songId,
				},
			})
			.code(201);
	} catch (error) {
		const boom = Boom.badImplementation(error.message);
		boom.reformat();
		boom.output.payload.status = "fail";
		return boom;
	}
}

/**
 * @param {import("@hapi/hapi").Request} request
 * @param {import("@hapi/hapi").ResponseToolkit} h
 * @return {Promise<import("@hapi/hapi").Lifecycle.ReturnValue>}
 */
export async function putSongHandler(request, h) {
	const { id } = request.params;
	const { payload } = request;

	try {
		const rowCount = await request.server.methods.updateSong(id, payload);

		if (rowCount <= 0) {
			const boom = Boom.notFound("Song not found");
			boom.reformat();
			boom.output.payload.status = "fail";
			return boom;
		}

		return h
			.response({
				status: "success",
				message: "Song updated successfully",
			})
			.code(200);
	} catch (error) {
		const boom = Boom.badImplementation(error.message);
		boom.reformat();
		boom.output.payload.status = "fail";
		return boom;
	}
}

/**
 * @param {import("@hapi/hapi").Request} request
 * @param {import("@hapi/hapi").ResponseToolkit} h
 * @return {Promise<import("@hapi/hapi").Lifecycle.ReturnValue>}
 */
export async function deleteSongHandler(request, h) {
	const { id } = request.params;

	try {
		const rowCount = await request.server.methods.deleteSong(id);

		if (rowCount <= 0) {
			const boom = Boom.notFound("Song not found");
			boom.reformat();
			boom.output.payload.status = "fail";
			return boom;
		}

		return h
			.response({
				status: "success",
				message: "Song deleted successfully",
			})
			.code(200);
	} catch (error) {
		const boom = Boom.badImplementation(error.message);
		boom.reformat();
		boom.output.payload.status = "fail";
		return boom;
	}
}

/**
 * @return {Promise<import("@hapi/hapi").Lifecycle.ReturnValue>}
 */
export async function notFoundHandler() {
	const boom = Boom.notFound("Not found");
	boom.reformat();
	boom.output.payload.status = "fail";

	return boom;
}
