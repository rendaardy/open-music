import { randomUUID } from "node:crypto";

import pg from "pg";

import "core-js/actual/array/group-to-map";

const { Pool } = pg;

export class AlbumsService {
	/** @type {pg.Pool} */
	#db;

	constructor() {
		this.#db = new Pool();
	}

	/**
	 * @return {Promise<Array<import("./albums-service.js").Album>>}
	 */
	async getAlbums() {
		const result = await this.#db.query({
			text: `
        SELECT
          albums.id AS album_id,
          albums.name,
          albums.year,
          songs.id AS song_id,
          songs.title,
          songs.performer
        FROM albums
        LEFT JOIN songs ON albums.id = songs.album_id
      `,
		});

		// @ts-ignore
		const albums = result.rows.groupToMap((album) => album.album_id);

		const groupAlbums = [];
		for (const albumId of albums.keys()) {
			const songs = albums.get(albumId);
			const album = songs.find((song) => song.album_id === albumId);

			groupAlbums.push({
				id: album.album_id,
				name: album.name,
				year: album.year,
				songs: songs.map((song) => ({
					id: song.song_id,
					title: song.title,
					performer: song.performer,
				})),
			});
		}

		return groupAlbums;
	}

	/**
	 * @param {string} id
	 * @return {Promise<import("./albums-service.js").Album | undefined>}
	 */
	async getAlbum(id) {
		const albums = await this.getAlbums();

		return albums.find((album) => album.id === id);
	}

	/**
	 * @param {import("./albums-service.js").Payload} payload
	 * @return {Promise<string>}
	 */
	async addAlbum(payload) {
		const result = await this.#db.query({
			text: "INSERT INTO albums (id, name, year) VALUES ($1, $2, $3) RETURNING id",
			values: [randomUUID(), payload.name, payload.year],
		});

		return result.rows[0].id;
	}

	/**
	 * @param {string} id
	 * @param {import("./albums-service.js").Payload} payload
	 * @return {Promise<number>}
	 */
	async updateAlbum(id, payload) {
		const result = await this.#db.query({
			text: "UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id",
			values: [payload.name, payload.year, id],
		});

		return result.rowCount;
	}

	/**
	 * @param {string} id
	 * @return {Promise<number>}
	 */
	async deleteAlbum(id) {
		const result = await this.#db.query({
			text: "DELETE FROM albums WHERE id = $1 RETURNING id",
			values: [id],
		});

		return result.rowCount;
	}

	/**
	 * @return {Promise<number>}
	 */
	async deleteAlbums() {
		const result = await this.#db.query("DELETE FROM albums RETURNING id");

		return result.rowCount;
	}

	async close() {
		await this.#db.end();
	}
}
