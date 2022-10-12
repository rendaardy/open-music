import type * as pg from "pg";

export type { Playlist, PlaylistWithSongs } from "../entities.js";

export declare class PlaylistsService {
	#db: pg.Pool;

	async addPlaylist(name: string, owner: string): Promise<string>;

	async getPlaylists(owner: string): Promise<Playlist[]>;

	async deletePlaylistById(id: string): Promise<void>;

	async verifyPlaylistOwner(id: string, owner: string): Promise<void>;

	async verifyPlaylistAccess(id: string, owner: string): Promise<void>;

	async addSongToPlaylist(songId: string, playlistId: string): Promise<void>;

	async getSongsInPlaylist(id: string): Promise<PlaylistWithSongs>;

	async deleteSongFromPlaylistById(songId: string): Promise<void>;

	async close(): Promise<void>;
}
