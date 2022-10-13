import { randomUUID } from "node:crypto";
import pg from "pg";

import { InvariantError } from "../utils/error/invariant-error.js";
import { NotFoundError } from "../utils/error/notfound-error.js";
import { AuthorizationError } from "../utils/error/authorization-error.js";

import "core-js/actual/array/group-to-map.js";

const { Pool } = pg;

export class PlaylistsService {
	/** @type {pg.Pool} */
	#db;

	constructor() {
		this.#db = new Pool();
	}

	/**
	 * @param {string} name
	 * @param {string} owner
	 * @return {Promise<string>}
	 * @throws {InvariantError}
	 */
	async addPlaylist(name, owner) {
		const id = `playlist-${randomUUID()}`;
		const result = await this.#db.query({
			text: "INSERT INTO playlists(id, name, owner) VALUES ($1, $2, $3) RETURNING id",
			values: [id, name, owner],
		});

		if (result.rowCount <= 0) {
			throw new InvariantError("Failed to add a playlist");
		}

		return result.rows[0].id;
	}

	/**
	 * @param {string} owner
	 * @return {Promise<Array<import("./playlists-service.js").Playlist>>}
	 */
	async getPlaylists(owner) {
		const result = await this.#db.query({
			text: `
        SELECT p.id, p.name, u.username 
        FROM playlists AS p
        INNER JOIN users AS u ON u.id = p.owner
        WHERE p.owner = $1
      `,
			values: [owner],
		});

		return result.rows;
	}

	/**
	 * @param {string} id
	 * @throws {NotFoundError}
	 */
	async deletePlaylistById(id) {
		const result = await this.#db.query({
			text: "DELETE FROM playlists WHERE id = $1",
			values: [id],
		});

		if (result.rowCount <= 0) {
			throw new NotFoundError("Failed to delete a playlist");
		}
	}

	/**
	 * @param {string} id
	 * @param {string} owner
	 * @throws {NotFoundError}
	 * @throws {AuthorizationError}
	 */
	async verifyPlaylistOwner(id, owner) {
		const result = await this.#db.query({
			text: "SELECT owner FROM playlists WHERE id = $1",
			values: [id],
		});

		if (result.rows.length <= 0) {
			throw new NotFoundError("Playlist not found");
		}

		const playlist = result.rows[0];

		if (playlist.owner !== owner) {
			throw new AuthorizationError("You're prohibited to get access of this resource");
		}
	}

	/**
	 * @param {string} songId
	 * @param {string} playlistId
	 * @throws {InvariantError}
	 */
	async addSongToPlaylist(songId, playlistId) {
		const id = `playlist_song-${randomUUID()}`;
		const result = await this.#db.query({
			text: "INSERT INTO playlist_song(id, playlist_id, song_id) VALUES ($1, $2, $3)",
			values: [id, playlistId, songId],
		});

		if (result.rowCount <= 0) {
			throw new InvariantError("Failed to add a song to playlist");
		}
	}

	/**
	 * @param {string} id
	 * @return {Promise<import("./playlists-service.js").PlaylistWithSongs>}
	 * @throws {NotFoundError}
	 */
	async getSongsInPlaylist(id) {
		const result = await this.#db.query({
			text: `
        SELECT 
          p.id AS playlist_id, 
          p.name, 
          u.username, 
          s.id AS song_id,
          s.title, 
          s.performer
        FROM playlists AS p
        INNER JOIN users AS u ON u.id = p.owner
        INNER JOIN playlist_song AS ps ON ps.playlist_id = p.id
        INNER JOIN songs AS s ON s.id = ps.song_id
        WHERE p.id = $1
        GROUP BY p.id, s.id, u.username
      `,
			values: [id],
		});

		if (result.rows.length <= 0) {
			throw new NotFoundError("Playlist not found");
		}

		// @ts-ignore
		const playlistMap = result.rows.groupToMap(({ playlist_id: playlistId }) => playlistId);

		let playlist = /** @type {import("./playlists-service.js").PlaylistWithSongs} */ ({});

		for (const playlistId of playlistMap.keys()) {
			const songs = playlistMap.get(playlistId);
			const playlistDetail = songs.find((song) => song.playlist_id === playlistId);

			playlist = {
				id: playlistDetail.playlist_id,
				name: playlistDetail.name,
				username: playlistDetail.username,
				songs: songs.map((song) => ({
					id: song.song_id,
					title: song.title,
					performer: song.performer,
				})),
			};
		}

		return playlist;
	}

	/**
	 * @param {string} songId
	 * @throws {NotFoundError}
	 */
	async deleteSongFromPlaylistById(songId) {
		const result = await this.#db.query({
			text: "DELETE FROM playlist_song WHERE song_id = $1",
			values: [songId],
		});

		if (result.rowCount <= 0) {
			throw new NotFoundError("Failed to delete a song from playlist");
		}
	}

	async close() {
		await this.#db.end();
	}
}
