/**
 * @param {import("@hapi/hapi").Request} request
 * @param {import("@hapi/hapi").ResponseToolkit} h
 * @return {Promise<import("@hapi/hapi").Lifecycle.ReturnValue>}
 */
export async function getAlbumHandler(request, h) {
	const { id } = request.params;
	const { getAlbum, getCache, setCache } = request.server.methods;

	let album = await getCache("open-music:albums");

	if (album !== null) {
		return h
			.response({
				status: "success",
				message: "Album retrieved successfully",
				data: {
					album: JSON.parse(album),
				},
			})
			.code(200)
			.header("X-Data-Source", "cache");
	}

	album = await getAlbum(id);
	await setCache("open-music:albums", JSON.stringify(album));

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
	const { addAlbum, deleteCache } = request.server.methods;
	const albumId = await addAlbum(payload);

	await deleteCache("open-music:albums");

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
	const { updateAlbum, deleteCache } = request.server.methods;

	await updateAlbum(id, payload);
	await deleteCache("open-music:albums");

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
	const { deleteAlbum, deleteCache } = request.server.methods;

	await deleteAlbum(id);
	await deleteCache("open-music:albums");

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
	const { validateHeaders, uploadAlbumCover, updateAlbumCover, deleteCache } =
		request.server.methods;

	validateHeaders(metadata.headers);

	const coverUrl = await uploadAlbumCover(cover, metadata);
	await updateAlbumCover(id, coverUrl);
	await deleteCache("open-music:albums");

	return h
		.response({
			status: "success",
			message: "Album cover uploaded",
		})
		.code(201);
}

/**
 * @param {import("@hapi/hapi").Request} request
 * @param {import("@hapi/hapi").ResponseToolkit} h
 * @return {Promise<import("@hapi/hapi").Lifecycle.ReturnValue>}
 */
export async function getAlbumLikesHandler(request, h) {
	const { id } = request.params;
	const { getAlbumLikes, setCache, getCache } = request.server.methods;

	let likes = await getCache("open-music:albums:likes");

	if (likes !== null) {
		return h
			.response({
				status: "success",
				data: {
					likes: Number.parseInt(likes, 10),
				},
			})
			.code(200)
			.header("X-Data-Source", "cache");
	}

	likes = await getAlbumLikes(id);
	await setCache("open-music:albums:likes", likes.toString());

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
	const { updateAlbumLikes, deleteCache } = request.server.methods;

	const liked = await updateAlbumLikes(albumId, userId);
	await deleteCache("open-music:albums:likes");

	return h
		.response({
			status: "success",
			message: `You ${liked === 1 ? "like" : "dislike"} this album`,
		})
		.code(201);
}
