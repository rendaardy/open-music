import { ClientError } from "./client-error.js";

export class InvariantError extends ClientError {
	/**
	 * @param {string} message
	 */
	constructor(message) {
		super(message);

		/**
		 * @public
		 * @readonly
		 * @type {string}
		 */
		this.name = "InvariantError";
	}
}
