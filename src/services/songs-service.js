import { randomUUID } from "node:crypto";

import pg from "pg";

const { Pool } = pg;

/**
 * @param {any} song
 * @return {import("./songs-service.js").Song}
 */
function mapToSongObj(song) {
	return {
		id: song.id,
		title: song.title,
		year: song.year,
		performer: song.performer,
		genre: song.genre,
		duration: song.duration,
		albumId: song.album_id,
	};
}

export class SongsService {
	/** @type {pg.Pool} */
	#db;

	constructor() {
		this.#db = new Pool();
	}

	/**
	 * @param {{ title?: string, performer?: string }} [query]
	 * @return {Promise<Array<import("./songs-service.js").Song>>}
	 */
	async getSongs(query) {
		let sqlQuery;

		if (query) {
			const { title, performer } = query;

			if (title && performer) {
				sqlQuery = {
					text: "SELECT * FROM songs WHERE title ILIKE $1 AND performer ILIKE $2",
					values: [title + "%", performer + "%"],
				};
			} else if (title) {
				sqlQuery = {
					text: "SELECT * FROM songs WHERE title ILIKE $1",
					values: [title + "%"],
				};
			} else if (performer) {
				sqlQuery = {
					text: "SELECT * FROM songs WHERE performer ILIKE $1",
					values: [performer + "%"],
				};
			} else {
				sqlQuery = {
					text: "SELECT * FROM songs",
				};
			}
		} else {
			sqlQuery = {
				text: "SELECT * FROM songs",
			};
		}

		const result = await this.#db.query(sqlQuery);

		return result.rows.map(mapToSongObj);
	}

	/**
	 * @param {string} id
	 * @return {Promise<import("./songs-service.js").Song>}
	 */
	async getSong(id) {
		const result = await this.#db.query({
			text: "SELECT * FROM songs WHERE id = $1",
			values: [id],
		});

		return result.rows.map(mapToSongObj)[0] ?? undefined;
	}

	/**
	 * @param {import("./songs-service.js").Payload} payload
	 * @return {Promise<string>}
	 */
	async addSong(payload) {
		const result = await this.#db.query({
			text: `
        INSERT INTO songs (id, title, year, performer, genre, duration, album_id) 
        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id
      `,
			values: [
				randomUUID(),
				payload.title,
				payload.year,
				payload.performer,
				payload.genre,
				payload?.duration,
				payload?.albumId,
			],
		});

		return result.rows[0].id;
	}

	/**
	 * @param {string} id
	 * @param {import("./songs-service.js").Payload} payload
	 * @return {Promise<number>}
	 */
	async updateSong(id, payload) {
		const result = await this.#db.query({
			text: `
        UPDATE songs
        SET
          title = $1,
          year = $2,
          performer = $3,
          genre = $4,
          duration = $5,
          album_id = $6
        WHERE
          id = $7
        RETURNING id
      `,
			values: [
				payload.title,
				payload.year,
				payload.performer,
				payload.genre,
				payload?.duration,
				payload?.albumId,
				id,
			],
		});

		return result.rowCount;
	}

	/**
	 * @param {string} id
	 * @return {Promise<number>}
	 */
	async deleteSong(id) {
		const result = await this.#db.query({
			text: "DELETE FROM songs WHERE id = $1 RETURNING id",
			values: [id],
		});

		return result.rowCount;
	}

	/**
	 * @return {Promise<number>}
	 */
	async deleteSongs() {
		const result = await this.#db.query("DELETE FROM songs RETURNING id");

		return result.rowCount;
	}

	async close() {
		await this.#db.end();
	}
}
