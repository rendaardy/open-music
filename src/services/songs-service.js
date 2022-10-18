import { randomUUID } from "node:crypto";

import pg from "pg";

import { NotFoundError } from "../utils/error.js";

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
	 * @param {{ title: string, performer: string }} query
	 * @return {Promise<Array<import("./songs-service.js").Song>>}
	 */
	async getSongs({ title = "", performer = "" }) {
		const sqlQuery = {
			text: `
        SELECT 
          id, title, year, performer, genre, duration, album_id 
        FROM 
          songs 
        WHERE 
          title ILIKE $1 AND performer ILIKE $2
      `,
			values: [`${title}%`, `${performer}%`],
		};
		const result = await this.#db.query(sqlQuery);

		return result.rows.map(mapToSongObj);
	}

	/**
	 * @param {string} id
	 * @return {Promise<import("./songs-service.js").Song>}
	 * @throw {NotFoundError}
	 */
	async getSong(id) {
		const result = await this.#db.query({
			text: `
        SELECT 
          id, title, year, performer, genre, duration, album_id 
        FROM 
          songs 
        WHERE 
          id = $1
      `,
			values: [id],
		});

		if (result.rowCount <= 0) {
			throw new NotFoundError("Song not found");
		}

		return result.rows.map(mapToSongObj)[0];
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
	 * @throw {NotFoundError}
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

		if (result.rowCount <= 0) {
			throw new NotFoundError("Fail to update a song");
		}

		return result.rowCount;
	}

	/**
	 * @param {string} id
	 * @return {Promise<number>}
	 * @throw {NotFoundError}
	 */
	async deleteSong(id) {
		const result = await this.#db.query({
			text: "DELETE FROM songs WHERE id = $1 RETURNING id",
			values: [id],
		});

		if (result.rowCount <= 0) {
			throw new NotFoundError("Fail to delete a song");
		}

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
