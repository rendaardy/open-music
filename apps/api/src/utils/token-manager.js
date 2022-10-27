import Jwt from "@hapi/jwt";

import { InvariantError } from "./error.js";
import { cfg } from "./config.js";

/**
 * @param {any} payload
 * @return {string}
 * @throws {Error}
 */
export function generateAccessToken(payload) {
	if (!cfg.jwt.accessTokenKey) {
		throw new Error("ACCESS_TOKEN_KEY must be defined");
	}

	return Jwt.token.generate(payload, cfg.jwt.accessTokenKey);
}

/**
 * @param {any} payload
 * @return {string}
 * @throws {Error}
 */
export function generateRefreshToken(payload) {
	if (!cfg.jwt.refreshTokenKey) {
		throw new Error("REFRESH_TOKEN_KEY must be defined");
	}

	return Jwt.token.generate(payload, cfg.jwt.refreshTokenKey);
}

/**
 * @param {string} refreshToken
 * @return {any}
 * @throws {Error}
 * @throws {InvariantError}
 */
export function verifyRefreshToken(refreshToken) {
	try {
		const artifacts = Jwt.token.decode(refreshToken);

		if (!cfg.jwt.refreshTokenKey) {
			throw new Error("REFRESH_TOKEN_KEY must be defined");
		}

		Jwt.token.verifySignature(artifacts, cfg.jwt.refreshTokenKey);

		const { payload } = artifacts.decoded;

		return payload;
	} catch (error) {
		if (error instanceof Error) {
			throw error;
		}

		throw new InvariantError("Refresh token is invalid");
	}
}
