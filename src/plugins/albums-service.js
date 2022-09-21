import { AlbumsService } from "../services/albums-service.js";

/** @type {import("@hapi/hapi").Plugin<undefined>} */
export const albumsServicePlugin = {
	name: "app/albums-service",
	async register(server) {
		const service = new AlbumsService();

		server.method("addAlbum", service.addAlbum, { bind: service });
		server.method("getAlbums", service.getAlbums, { bind: service });
		server.method("getAlbum", service.getAlbum, { bind: service });
		server.method("updateAlbum", service.updateAlbum, { bind: service });
		server.method("deleteAlbum", service.deleteAlbum, { bind: service });

		server.ext("onPostStop", async () => {
			await service.close();
		});
	},
};
