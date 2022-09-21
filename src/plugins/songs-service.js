import { SongsService } from "../services/songs-service.js";

/** @type {import("@hapi/hapi").Plugin<undefined>} */
export const songsServicePlugin = {
	name: "app/songs-service",
	async register(server) {
		const service = new SongsService();

		server.method("addSong", service.addSong, { bind: service });
		server.method("getSongs", service.getSongs, { bind: service });
		server.method("getSong", service.getSong, { bind: service });
		server.method("updateSong", service.updateSong, { bind: service });
		server.method("deleteSong", service.deleteSong, { bind: service });

		server.ext("onPostStop", async () => {
			await service.close();
		});
	},
};
