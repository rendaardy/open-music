import { ClientError } from "./client-error.js";

export class AuthorizationError extends ClientError {
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
		this.name = "AuthorizationError";
	}
}
