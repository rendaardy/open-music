import util from "node:util";
import crypto from "node:crypto";

/**
 * @param {string} password
 * @param {string} salt
 * @param {number} length
 * @return {Promise<string>}
 */
async function createHash(password, salt, length) {
	const pbkdf2 = util.promisify(crypto.pbkdf2);
	const derivedKey = await pbkdf2(
		password.normalize(),
		salt.normalize(),
		100_000,
		length,
		"sha512",
	);

	return derivedKey.toString("hex");
}

/**
 * @param {string} password
 * @param {string} salt
 * @return {Promise<string>}
 */
export async function createPasswordHash(password, salt) {
	return createHash(password, salt, 64);
}

/**
 * @param {string} password
 * @param {string} hashedPassword
 * @param {string} salt
 * @return {Promise<boolean>}
 */
export async function compare(password, hashedPassword, salt) {
	const hash = await createPasswordHash(password, salt);

	return hashedPassword === hash;
}
