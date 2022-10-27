export class ClientError extends Error {
	/**
	 * @param {string} message
	 * @param {number} [statusCode]
	 */
	constructor(message, statusCode = 400) {
		super(message);

		/**
		 * @public
		 * @readonly
		 * @type {number}
		 */
		this.statusCode = statusCode;

		/**
		 * @public
		 * @readonly
		 * @type {string}
		 */
		this.name = "ClientError";
	}
}
