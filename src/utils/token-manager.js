import process from "node:process";
import Jwt from "@hapi/jwt";

import { InvariantError } from "./error.js";

/**
 * @param {any} payload
 * @return {string}
 * @throws {Error}
 */
export function generateAccessToken(payload) {
	const { ACCESS_TOKEN_KEY } = process.env;

	if (!ACCESS_TOKEN_KEY) {
		throw new Error("ACCESS_TOKEN_KEY must be defined");
	}

	return Jwt.token.generate(payload, ACCESS_TOKEN_KEY);
}

/**
 * @param {any} payload
 * @return {string}
 * @throws {Error}
 */
export function generateRefreshToken(payload) {
	const { REFRESH_TOKEN_KEY } = process.env;

	if (!REFRESH_TOKEN_KEY) {
		throw new Error("REFRESH_TOKEN_KEY must be defined");
	}

	return Jwt.token.generate(payload, REFRESH_TOKEN_KEY);
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
		const { REFRESH_TOKEN_KEY } = process.env;

		if (!REFRESH_TOKEN_KEY) {
			throw new Error("REFRESH_TOKEN_KEY must be defined");
		}

		Jwt.token.verifySignature(artifacts, REFRESH_TOKEN_KEY);

		const { payload } = artifacts.decoded;

		return payload;
	} catch (error) {
		if (error instanceof Error) {
			throw error;
		}

		throw new InvariantError("Refresh token is invalid");
	}
}
