import { randomUUID } from "node:crypto";
import pg from "pg";

import { InvariantError } from "../utils/error/invariant-error.js";
import { AuthorizationError } from "../utils/error/authorization-error.js";

const { Pool } = pg;

export class CollaborationsService {
	/** @type {pg.Pool} */
	#db;

	constructor() {
		this.#db = new Pool();
	}

	/**
	 * @param {string} playlistId
	 * @param {string} userId
	 * @return {Promise<string>}
	 * @throws {InvariantError}
	 */
	async addCollaboration(playlistId, userId) {
		const id = `collaboration-${randomUUID()}`;
		const result = await this.#db.query({
			text: "INSERT INTO collaborations(id, playlist_id, user_id) VALUES ($1, $2, $3) RETURNING id",
			values: [id, playlistId, userId],
		});

		if (result.rowCount <= 0) {
			throw new InvariantError("Failed to add collaboration");
		}

		return result.rows[0].id;
	}

	/**
	 * @param {string} playlistId
	 * @param {string} userId
	 * @throws {InvariantError}
	 */
	async deleteCollaboration(playlistId, userId) {
		const result = await this.#db.query({
			text: "DELETE FROM collaborations WHERE playlist_id = $1 AND user_id = $2",
			values: [playlistId, userId],
		});

		if (result.rowCount <= 0) {
			throw new InvariantError("Failed to delete collaboration");
		}
	}

	/**
	 * @param {string} playlistId
	 * @param {string} userId
	 * @throws {AuthorizationError}
	 */
	async verifyCollaborator(playlistId, userId) {
		const result = await this.#db.query({
			text: "SELECT * FROM collaborations WHERE playlist_id = $1 AND user_id = $2",
			values: [playlistId, userId],
		});

		if (result.rows.length <= 0) {
			throw new AuthorizationError("You're prohibited to get access of this resource");
		}
	}

	async close() {
		await this.#db.end();
	}
}
