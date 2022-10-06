import { UsersService } from "../services/users-service.js";

/** @type {import("@hapi/hapi").Plugin<undefined>} */
export const usersServicePlugin = {
	name: "app/users-service",
	async register(server) {
		const service = new UsersService();

		server.bind(service);
		server.method("addUser", service.addUser);
		server.method("getUserById", service.getUserById);
		server.method("verifyUserCredential", service.verifyUserCredential);

		server.ext("onPostStop", async () => {
			await service.close();
		});
	},
};
