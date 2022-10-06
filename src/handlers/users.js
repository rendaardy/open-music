/**
 * @param {import("@hapi/hapi").Request} request
 * @param {import("@hapi/hapi").ResponseToolkit} h
 * @return {Promise<import("@hapi/hapi").Lifecycle.ReturnValue>}
 */
export async function postUserHandler(request, h) {
	const { username, password, fullname } = /** @type {import("./users.js").RequestPayload} */ (
		request.payload
	);
	const { addUser } = request.server.methods;
	const userId = await addUser({ username, password, fullname });

	return h
		.response({
			status: "success",
			data: {
				userId,
			},
		})
		.code(201);
}

/**
 * @param {import("@hapi/hapi").Request} request
 * @param {import("@hapi/hapi").ResponseToolkit} _h
 * @return {Promise<import("@hapi/hapi").Lifecycle.ReturnValue>}
 */
export async function getUserByIdHandler(request, _h) {
	const { id } = request.params;
	const { getUserById } = request.server.methods;
	const user = await getUserById(id);

	return {
		status: "success",
		data: {
			user,
		},
	};
}
