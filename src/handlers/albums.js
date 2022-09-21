import Boom from "@hapi/boom";

/**
 * @param {import("@hapi/hapi").Request} request
 * @param {import("@hapi/hapi").ResponseToolkit} h
 * @return {Promise<import("@hapi/hapi").Lifecycle.ReturnValue>}
 */
export async function getAlbumHandler(request, h) {
	const { id } = request.params;

	try {
		const album = await request.server.methods.getAlbum(id);

		if (!album) {
			const boom = Boom.notFound("Album not found");
			boom.reformat();
			boom.output.payload.status = "fail";
			return boom;
		}

		return h
			.response({
				status: "success",
				message: "Album retrieved successfully",
				data: {
					album,
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
export async function postAlbumHandler(request, h) {
	const { payload } = request;

	try {
		const albumId = await request.server.methods.addAlbum(payload);

		return h
			.response({
				status: "success",
				message: "Album added successfully",
				data: {
					albumId,
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
export async function putAlbumHandler(request, h) {
	const { id } = request.params;
	const { payload } = request;

	try {
		const rowCount = await request.server.methods.updateAlbum(id, payload);

		if (rowCount <= 0) {
			const boom = Boom.notFound("Album not found");
			boom.reformat();
			boom.output.payload.status = "fail";
			return boom;
		}

		return h
			.response({
				status: "success",
				message: "Album updated successfully",
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
export async function deleteAlbumHandler(request, h) {
	const { id } = request.params;

	try {
		const rowCount = await request.server.methods.deleteAlbum(id);

		if (rowCount <= 0) {
			const boom = Boom.notFound("Album not found");
			boom.reformat();
			boom.output.payload.status = "fail";
			return boom;
		}

		return h
			.response({
				status: "success",
				message: "Album deleted successfully",
			})
			.code(200);
	} catch (error) {
		const boom = Boom.badImplementation(error.message);
		boom.reformat();
		boom.output.payload.status = "fail";
		return boom;
	}
}
