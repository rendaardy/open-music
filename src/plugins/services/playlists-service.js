import { PlaylistsService } from "./internals/playlists-service.js";

/** @type {import("@hapi/hapi").Plugin<undefined>} */
export const playlistsServicePlugin = {
	name: "app/playlists-service",
	async register(server) {
		const service = new PlaylistsService();

		server.bind(service);
		server.method("addPlaylist", service.addPlaylist);
		server.method("getPlaylists", service.getPlaylists);
		server.method("deletePlaylistById", service.deletePlaylistById);
		server.method("verifyPlaylistOwner", service.verifyPlaylistOwner);
		server.method("getPlaylistActivities", service.getPlaylistActivities);
		server.method("addSongToPlaylist", service.addSongToPlaylist);
		server.method("getSongsInPlaylist", service.getSongsInPlaylist);
		server.method("deleteSongFromPlaylistById", service.deleteSongFromPlaylistById);

		server.ext("onPostStop", async () => {
			await service.close();
		});
	},
};
