import { AlbumsService } from "./internals/albums-service.js";

/** @type {import("@hapi/hapi").Plugin<undefined>} */
export const albumsServicePlugin = {
	name: "app/albums-service",
	async register(server) {
		const service = new AlbumsService();

		server.bind(service);
		server.method("addAlbum", service.addAlbum);
		server.method("updateAlbumLikes", service.updateAlbumLikes);
		server.method("getAlbums", service.getAlbums);
		server.method("getAlbum", service.getAlbum);
		server.method("getAlbumLikes", service.getAlbumLikes);
		server.method("updateAlbum", service.updateAlbum);
		server.method("updateAlbumCover", service.updateAlbumCover);
		server.method("deleteAlbum", service.deleteAlbum);

		server.ext("onPostStop", async () => {
			await service.close();
		});
	},
};
