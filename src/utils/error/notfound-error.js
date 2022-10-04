import { ClientError } from "./client-error.js";

export class NotFoundError extends ClientError {
	/**
	 * @param {string} message
	 */
	constructor(message) {
		super(message, 404);

		/**
		 * @public
		 * @readonly
		 * @type {string}
		 */
		this.name = "NotFoundError";
	}
}
