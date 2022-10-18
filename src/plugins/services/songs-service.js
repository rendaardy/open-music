import { SongsService } from "./internals/songs-service.js";

/** @type {import("@hapi/hapi").Plugin<undefined>} */
export const songsServicePlugin = {
	name: "app/songs-service",
	async register(server) {
		const service = new SongsService();

		server.bind(service);
		server.method("addSong", service.addSong);
		server.method("getSongs", service.getSongs);
		server.method("getSong", service.getSong);
		server.method("updateSong", service.updateSong);
		server.method("deleteSong", service.deleteSong);

		server.ext("onPostStop", async () => {
			await service.close();
		});
	},
};
