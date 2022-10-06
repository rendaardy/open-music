import { AuthenticationsService } from "../services/authentications-service.js";

/** @type {import("@hapi/hapi").Plugin<undefined>} */
export const authServicePlugin = {
	name: "app/auth-service",
	async register(server) {
		const service = new AuthenticationsService();

		server.bind(service);
		server.method("addRefreshToken", service.addRefreshToken);
		server.method("verifyRefreshToken", service.verifyRefreshToken);
		server.method("deleteRefreshToken", service.deleteRefreshToken);

		server.ext("onPostStop", async () => {
			await service.close();
		});
	},
};
