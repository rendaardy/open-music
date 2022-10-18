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
