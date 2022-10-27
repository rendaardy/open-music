import { ClientError } from "./client-error.js";

export class AuthenticationError extends ClientError {
	/**
	 * @param {string} message
	 */
	constructor(message) {
		super(message, 401);

		/**
		 * @public
		 * @readonly
		 * @type {string}
		 */
		this.name = "AuthenticationError";
	}
}
