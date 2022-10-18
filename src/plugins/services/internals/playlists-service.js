import { randomUUID } from "node:crypto";
import pg from "pg";

import { InvariantError, NotFoundError, AuthorizationError } from "#open-music/utils/error.js";

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
        LEFT JOIN collaborations AS c ON c.playlist_id = p.id 
        INNER JOIN users AS u ON u.id = p.owner
        WHERE p.owner = $1 OR c.user_id = $1
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

		if (result.rowCount <= 0) {
			throw new NotFoundError("Playlist not found");
		}

		const playlist = result.rows[0];

		if (playlist.owner !== owner) {
			throw new AuthorizationError("You're prohibited to get access of this resource");
		}
	}

	/**
	 * @param {pg.PoolClient} client
	 * @param {string} playlistId
	 * @param {string} songId
	 * @param {"add" | "delete"} action
	 * @throws {InvariantError}
	 */
	async #recordPlaylistActivity(client, playlistId, songId, action) {
		const queryResult = await client.query({
			text: "SELECT owner FROM playlists WHERE id = $1",
			values: [playlistId],
		});

		if (queryResult.rowCount <= 0) {
			throw new InvariantError(`Failed to record activity on action ${action}. Playlist not found`);
		}

		const id = `activities-${randomUUID()}`;
		const userId = queryResult.rows[0].owner;

		const result = await client.query({
			text: `
        INSERT INTO 
          playlist_song_activities(id, playlist_id, song_id, user_id, action) 
        VALUES 
          ($1, $2, $3, $4, $5)
      `,
			values: [id, playlistId, songId, userId, action],
		});

		if (result.rowCount <= 0) {
			throw new InvariantError(`Failed to record activity on action ${action}`);
		}
	}

	/**
	 * @param {string} playlistId
	 * @return {Promise<import("./playlists-service.js").PlaylistActivities>}
	 */
	async getPlaylistActivities(playlistId) {
		const result = await this.#db.query({
			text: `
        SELECT psa.playlist_id, u.username, s.title, psa.action, psa.time
        FROM playlist_song_activities AS psa
        INNER JOIN users AS u ON u.id = psa.user_id
        INNER JOIN songs AS s ON s.id = psa.song_id
        WHERE psa.playlist_id = $1
        ORDER BY psa.time ASC
      `,
			values: [playlistId],
		});

		if (result.rowCount <= 0) {
			throw new NotFoundError("Playlist not found");
		}

		// @ts-ignore
		const activityMap = result.rows.groupToMap(({ playlist_id: id }) => id);
		const activities = activityMap.get(playlistId);

		return {
			playlistId,
			activities: activities.map((activity) => ({
				username: activity.username,
				title: activity.title,
				action: activity.action,
				time: activity.time.toISOString(),
			})),
		};
	}

	/**
	 * @param {string} songId
	 * @param {string} playlistId
	 * @throws {InvariantError}
	 */
	async addSongToPlaylist(songId, playlistId) {
		const client = await this.#db.connect();

		try {
			await client.query("BEGIN");

			const id = `playlist_song-${randomUUID()}`;
			const result = await client.query({
				text: "INSERT INTO playlist_song(id, playlist_id, song_id) VALUES ($1, $2, $3)",
				values: [id, playlistId, songId],
			});

			if (result.rowCount <= 0) {
				throw new InvariantError("Failed to add a song to playlist");
			}

			await this.#recordPlaylistActivity(client, playlistId, songId, "add");

			await client.query("COMMIT");
		} catch (error) {
			await client.query("ROLLBACK");
			throw error;
		} finally {
			client.release();
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
          ps.playlist_id, 
          p.name, 
          u.username, 
          ps.song_id,
          s.title, 
          s.performer
        FROM playlist_song AS ps
        INNER JOIN playlists AS p ON p.id = ps.playlist_id
        INNER JOIN users AS u ON u.id = p.owner
        INNER JOIN songs AS s ON s.id = ps.song_id
        WHERE ps.playlist_id = $1
      `,
			values: [id],
		});

		if (result.rowCount <= 0) {
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
		const client = await this.#db.connect();

		try {
			await client.query("BEGIN");

			const result = await client.query({
				text: "DELETE FROM playlist_song WHERE song_id = $1 RETURNING playlist_id",
				values: [songId],
			});

			if (result.rowCount <= 0) {
				throw new NotFoundError("Failed to delete a song from playlist");
			}

			const playlistId = result.rows[0].playlist_id;

			await this.#recordPlaylistActivity(client, playlistId, songId, "delete");

			await client.query("COMMIT");
		} catch (error) {
			await client.query("ROLLBACK");
			throw error;
		} finally {
			client.release();
		}
	}

	async close() {
		await this.#db.end();
	}
}
