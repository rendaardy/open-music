import type * as pg from "pg";

export type { Playlist, PlaylistWithSongs, PlaylistActivity } from "#open-music/entities.js";

export type PlaylistActivities = {
	playlistId: string;
	activities: PlaylistActivity[];
};

export declare class PlaylistsService {
	#db: pg.Pool;

	async addPlaylist(name: string, owner: string): Promise<string>;

	async getPlaylists(owner: string): Promise<Playlist[]>;

	async deletePlaylistById(id: string): Promise<void>;

	async verifyPlaylistOwner(id: string, owner: string): Promise<void>;

	async #recordPlaylistActivity(
		client: pg.PoolClient,
		playlistId: string,
		songId: string,
		action: "add" | "delete",
	): Promise<void>;

	async getPlaylistActivities(playlistId: string): Promise<PlaylistActivities>;

	async addSongToPlaylist(songId: string, playlistId: string): Promise<void>;

	async getSongsInPlaylist(id: string): Promise<PlaylistWithSongs>;

	async deleteSongFromPlaylistById(songId: string): Promise<void>;

	async close(): Promise<void>;
}
