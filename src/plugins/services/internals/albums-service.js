import { randomUUID } from "node:crypto";

import pg from "pg";

import { NotFoundError } from "#open-music/utils/error.js";

import "core-js/actual/array/group-to-map.js";

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
          albums.cover_url,
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
				coverUrl: album.cover_url,
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
	 * @return {Promise<import("./albums-service.js").Album>}
	 * @throw {NotFoundError}
	 */
	async getAlbum(id) {
		const result = await this.#db.query({
			text: `
        SELECT
          albums.id AS album_id,
          albums.name,
          albums.year,
          albums.cover_url,
          songs.id AS song_id,
          songs.title,
          songs.performer
        FROM albums
        LEFT JOIN songs ON albums.id = songs.album_id
        WHERE
          albums.id = $1
      `,
			values: [id],
		});

		if (result.rowCount <= 0) {
			throw new NotFoundError("Album not found");
		}

		// @ts-ignore
		const albumMap = result.rows.groupToMap((album) => album.album_id);

		let album = /** @type {import("./albums-service.js").Album} */ ({});

		for (const albumId of albumMap.keys()) {
			const songs = albumMap.get(albumId);
			const songsAlbum = songs.find((song) => song.album_id === albumId);

			album = {
				id: songsAlbum.album_id,
				name: songsAlbum.name,
				coverUrl: songsAlbum.cover_url,
				year: songsAlbum.year,
				songs: songs.map((song) => ({
					id: song.song_id,
					title: song.title,
					performer: song.performer,
				})),
			};
		}

		return album;
	}

	/**
	 * @param {string} albumId
	 * @return {Promise<number>}
	 */
	async getAlbumLikes(albumId) {
		const client = await this.#db.connect();

		try {
			await client.query("BEGIN");

			let result = await client.query({
				text: "SELECT id FROM albums WHERE id = $1",
				values: [albumId],
			});

			if (result.rowCount <= 0) {
				throw new NotFoundError("Album not found");
			}

			result = await client.query({
				text: `
          SELECT
            album_id,
            COUNT(album_id) AS likes
          FROM
            user_album_likes
          WHERE
            album_id = $1
          GROUP BY
            album_id
        `,
				values: [albumId],
			});

			const { likes } = result.rows[0];

			await client.query("COMMIT");

			return Number.parseInt(likes ?? "0", 10);
		} catch (error) {
			await client.query("ROLLBACK");
			throw error;
		} finally {
			client.release();
		}
	}

	/**
	 * @param {import("./albums-service.js").Payload} payload
	 * @return {Promise<string>}
	 */
	async addAlbum({ name, year }) {
		const result = await this.#db.query({
			text: "INSERT INTO albums (id, name, year) VALUES ($1, $2, $3) RETURNING id",
			values: [randomUUID(), name, year],
		});

		return result.rows[0].id;
	}

	/**
	 * @param {string} albumId
	 * @param {string} userId
	 * @return {Promise<number>}
	 */
	async updateAlbumLikes(albumId, userId) {
		const client = await this.#db.connect();

		try {
			await client.query("BEGIN");

			let result = await client.query({
				text: "SELECT id FROM albums WHERE id = $1",
				values: [albumId],
			});

			if (result.rowCount <= 0) {
				throw new NotFoundError("Album not found");
			}

			result = await client.query({
				text: `
          SELECT
            user_id,
            album_id
          FROM
            user_album_likes
          WHERE
            user_id = $1 AND album_id = $2
        `,
				values: [userId, albumId],
			});

			let likeQuery;
			if (result.rowCount <= 0) {
				likeQuery = {
					text: "INSERT INTO user_album_likes(id, user_id, album_id) VALUES ($1, $2, $3) RETURNING 1 AS liked",
					values: [`likes-${randomUUID()}`, userId, albumId],
				};
			} else {
				likeQuery = {
					text: "DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING 0 AS liked",
					values: [userId, albumId],
				};
			}

			result = await client.query(likeQuery);

			await client.query("COMMIT");

			return result.rows[0].liked;
		} catch (error) {
			await client.query("ROLLBACK");
			throw error;
		} finally {
			client.release();
		}
	}

	/**
	 * @param {string} id
	 * @param {import("./albums-service.js").Payload} payload
	 * @return {Promise<number>}
	 * @throw {NotFoundError}
	 */
	async updateAlbum(id, payload) {
		const result = await this.#db.query({
			text: "UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id",
			values: [payload.name, payload.year, id],
		});

		if (result.rowCount <= 0) {
			throw new NotFoundError("Fail to update an album");
		}

		return result.rowCount;
	}

	/**
	 * @param {string} id
	 * @param {string} coverUrl
	 */
	async updateAlbumCover(id, coverUrl) {
		const result = await this.#db.query({
			text: "SELECT cover_url FROM albums WHERE id = $1",
			values: [id],
		});

		if (result.rowCount <= 0) {
			throw new NotFoundError("Album not found");
		}

		await this.#db.query({
			text: "UPDATE albums SET cover_url = $1 WHERE id = $2",
			values: [coverUrl, id],
		});
	}

	/**
	 * @param {string} id
	 * @return {Promise<number>}
	 * @throw {NotFoundError}
	 */
	async deleteAlbum(id) {
		const result = await this.#db.query({
			text: "DELETE FROM albums WHERE id = $1 RETURNING id",
			values: [id],
		});

		if (result.rowCount <= 0) {
			throw new NotFoundError("Fail to delete an album");
		}

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
