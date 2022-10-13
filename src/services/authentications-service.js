import pg from "pg";

import { InvariantError } from "../utils/error.js";

const { Pool } = pg;

export class AuthenticationsService {
	/** @type {pg.Pool} */
	#db;

	constructor() {
		this.#db = new Pool();
	}

	/**
	 * @param {string} token
	 */
	async addRefreshToken(token) {
		await this.#db.query({
			text: "INSERT INTO authentications (token) VALUES ($1)",
			values: [token],
		});
	}

	/**
	 * @param {string} token
	 * @throws {InvariantError}
	 */
	async verifyRefreshToken(token) {
		const result = await this.#db.query({
			text: "SELECT token FROM authentications WHERE token = $1",
			values: [token],
		});

		if (result.rowCount <= 0) {
			throw new InvariantError("Invalid refresh token");
		}
	}

	/**
	 * @param {string} token
	 */
	async deleteRefreshToken(token) {
		await this.#db.query({
			text: "DELETE FROM authentications WHERE token = $1",
			values: [token],
		});
	}

	async close() {
		await this.#db.end();
	}
}
