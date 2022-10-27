/* eslint-disable camelcase */

/**
 * @function
 * @param {import("node-pg-migrate").MigrationBuilder} pgm
 */
exports.up = (pgm) => {
	pgm.addColumns("albums", {
		cover_url: {
			type: "varchar",
		},
	});
};

/**
 * @function
 * @param {import("node-pg-migrate").MigrationBuilder} pgm
 */
exports.down = (pgm) => {
	pgm.dropColumns("albums", "cover_url");
};
