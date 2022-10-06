import {
	generateAccessToken,
	generateRefreshToken,
	verifyRefreshToken,
} from "../utils/token-manager.js";

/**
 * @param {import("@hapi/hapi").Request} request
 * @param {import("@hapi/hapi").ResponseToolkit} h
 * @return {Promise<import("@hapi/hapi").Lifecycle.ReturnValue>}
 */
export async function postAuthenticationHandler(request, h) {
	const { username, password } =
		/** @type {import("./authentications.js").UserCredentialPayload} */ (request.payload);
	const { verifyUserCredential, addRefreshToken } = request.server.methods;
	const userId = await verifyUserCredential(username, password);
	const accessToken = generateAccessToken({ userId });
	const refreshToken = generateRefreshToken({ userId });

	await addRefreshToken(refreshToken);

	return h
		.response({
			status: "success",
			data: {
				accessToken,
				refreshToken,
			},
		})
		.code(201);
}

/**
 * @param {import("@hapi/hapi").Request} request
 * @param {import("@hapi/hapi").ResponseToolkit} _h
 * @return {Promise<import("@hapi/hapi").Lifecycle.ReturnValue>}
 */
export async function putAuthenticationHandler(request, _h) {
	const { refreshToken } = /** @type {import("./authentications.js").TokenPayload} */ (
		request.payload
	);

	await request.server.methods.verifyRefreshToken(refreshToken);

	const { userId } = verifyRefreshToken(refreshToken);
	const accessToken = generateAccessToken({ userId });

	return {
		status: "success",
		data: {
			accessToken,
		},
	};
}

/**
 * @param {import("@hapi/hapi").Request} request
 * @param {import("@hapi/hapi").ResponseToolkit} _h
 * @return {Promise<import("@hapi/hapi").Lifecycle.ReturnValue>}
 */
export async function deleteAuthenticationHandler(request, _h) {
	const { refreshToken } = /** @type {import("./authentications.js").TokenPayload} */ (
		request.payload
	);

	await request.server.methods.verifyRefreshToken(refreshToken);
	await request.server.methods.deleteRefreshToken(refreshToken);

	return {
		status: "success",
		message: "Successfully signed out",
	};
}
