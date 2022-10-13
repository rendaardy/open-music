import { CollaborationsService } from "../services/collaborations-service.js";

/** @type {import("@hapi/hapi").Plugin<undefined>} */
export const collabServicePlugin = {
	name: "app/collaborations-service",
	async register(server) {
		const service = new CollaborationsService();

		server.bind(service);
		server.method("addCollaboration", service.addCollaboration);
		server.method("deleteCollaboration", service.deleteCollaboration);
		server.method("verifyCollaborator", service.verifyCollaborator);

		server.ext("onPostStop", async () => {
			await service.close();
		});
	},
};
