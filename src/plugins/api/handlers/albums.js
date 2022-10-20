/**
 * @param {import("@hapi/hapi").Request} request
 * @param {import("@hapi/hapi").ResponseToolkit} _h
 * @return {Promise<import("@hapi/hapi").Lifecycle.ReturnValue>}
 */
export async function getAlbumHandler(request, _h) {
	const { id } = request.params;
	const { getAlbum } = request.server.methods;
	const album = await getAlbum(id);

	return {
		status: "success",
		message: "Album retrieved successfully",
		data: {
			album,
		},
	};
}

/**
 * @param {import("@hapi/hapi").Request} request
 * @param {import("@hapi/hapi").ResponseToolkit} h
 * @return {Promise<import("@hapi/hapi").Lifecycle.ReturnValue>}
 */
export async function postAlbumHandler(request, h) {
	const { payload } = request;
	const { addAlbum } = request.server.methods;
	const albumId = await addAlbum(payload);

	return h
		.response({
			status: "success",
			message: "Album added successfully",
			data: {
				albumId,
			},
		})
		.code(201);
}

/**
 * @param {import("@hapi/hapi").Request} request
 * @param {import("@hapi/hapi").ResponseToolkit} _h
 * @return {Promise<import("@hapi/hapi").Lifecycle.ReturnValue>}
 */
export async function putAlbumHandler(request, _h) {
	const { id } = request.params;
	const { payload } = request;
	const { updateAlbum } = request.server.methods;

	await updateAlbum(id, payload);

	return {
		status: "success",
		message: "Album updated successfully",
	};
}

/**
 * @param {import("@hapi/hapi").Request} request
 * @param {import("@hapi/hapi").ResponseToolkit} _h
 * @return {Promise<import("@hapi/hapi").Lifecycle.ReturnValue>}
 */
export async function deleteAlbumHandler(request, _h) {
	const { id } = request.params;
	const { deleteAlbum } = request.server.methods;

	await deleteAlbum(id);

	return {
		status: "success",
		message: "Album deleted successfully",
	};
}

/**
 * @param {import("@hapi/hapi").Request} request
 * @param {import("@hapi/hapi").ResponseToolkit} h
 * @return {Promise<import("@hapi/hapi").Lifecycle.ReturnValue>}
 */
export async function postUploadAlbumCoverHandler(request, h) {
	const { id } = request.params;
	const { cover } = /** @type {{ cover: import("node:stream").Readable }} */ (request.payload);
	const metadata = /** @type {any} */ (cover).hapi;
	const { validateHeaders, uploadAlbumCover, updateAlbumCover } = request.server.methods;

	validateHeaders(metadata.headers);

	const coverUrl = await uploadAlbumCover(cover, metadata);
	await updateAlbumCover(id, coverUrl);

	return h
		.response({
			status: "success",
			message: "Album cover uploaded",
		})
		.code(201);
}

/**
 * @param {import("@hapi/hapi").Request} request
 * @param {import("@hapi/hapi").ResponseToolkit} _h
 * @return {Promise<import("@hapi/hapi").Lifecycle.ReturnValue>}
 */
export async function getAlbumLikesHandler(request, _h) {
	const { id } = request.params;
	const { getAlbumLikes } = request.server.methods;

	const likes = await getAlbumLikes(id);

	return {
		status: "success",
		data: {
			likes,
		},
	};
}

/**
 * @param {import("@hapi/hapi").Request} request
 * @param {import("@hapi/hapi").ResponseToolkit} h
 * @return {Promise<import("@hapi/hapi").Lifecycle.ReturnValue>}
 */
export async function postAlbumLikesHandler(request, h) {
	const { id: albumId } = request.params;
	const { userId } = request.auth.credentials;
	const { updateAlbumLikes } = request.server.methods;

	const liked = await updateAlbumLikes(albumId, userId);

	return h
		.response({
			status: "success",
			message: `You ${liked === 1 ? "like" : "dislike"} this album`,
		})
		.code(201);
}
