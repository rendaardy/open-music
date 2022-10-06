import { randomUUID, randomBytes } from "node:crypto";
import pg from "pg";

import { createPasswordHash, compare } from "../utils/hash.js";
import { NotFoundError } from "../utils/error/notfound-error.js";
import { InvariantError } from "../utils/error/invariant-error.js";
import { AuthenticationError } from "../utils/error/authentication-error.js";

const { Pool } = pg;

export class UsersService {
	/** @type {pg.Pool} */
	#db;

	constructor() {
		this.#db = new Pool();
	}

	/**
	 * @param {import("./users-service.js").Payload} payload
	 * @return {Promise<string>}
	 * @throws {InvariantError}
	 */
	async addUser({ username, password, fullname }) {
		await this.#verifyNewUsername(username);

		const id = `user-${randomUUID()}`;
		const salt = randomBytes(16).toString("hex");
		const hashedPassword = await createPasswordHash(password, salt);
		const result = await this.#db.query({
			text: `
        INSERT INTO users (id, username, password, salt, fullname) 
        VALUES ($1, $2, $3, $4, $5) 
        RETURNING id
      `,
			values: [id, username, hashedPassword, salt, fullname],
		});

		if (!result.rows.length) {
			throw new InvariantError("Fail to adding a user");
		}

		return result.rows[0].id;
	}

	/**
	 * @param {string} userId
	 * @return {Promise<import("./users-service.js").User>}
	 * @throws {NotFoundError}
	 */
	async getUserById(userId) {
		const result = await this.#db.query({
			text: "SELECT id, username, fullname FROM users WHERE id = $1",
			values: [userId],
		});

		if (!result.rows.length) {
			throw new NotFoundError("User not found");
		}

		return result.rows[0];
	}

	/**
	 * @param {string} username
	 * @param {string} password
	 * @return {Promise<string>}
	 * @throws {AuthenticationError}
	 */
	async verifyUserCredential(username, password) {
		const result = await this.#db.query({
			text: "SELECT id, password, salt FROM users WHERE username = $1",
			values: [username],
		});

		if (!result.rows.length) {
			throw new AuthenticationError("Username or password is incorrect");
		}

		const { id, salt, password: hashedPassword } = result.rows[0];
		const match = await compare(password, hashedPassword, salt);

		if (!match) {
			throw new AuthenticationError("Username or password is incorrect");
		}

		return id;
	}

	/**
	 * @param {string} username
	 * @throws {InvariantError}
	 */
	async #verifyNewUsername(username) {
		const result = await this.#db.query({
			text: "SELECT username FROM users WHERE username = $1",
			values: [username],
		});

		if (result.rows.length > 0) {
			throw new InvariantError("Username already exists");
		}
	}

	async close() {
		await this.#db.end();
	}
}
