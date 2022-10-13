exports.shorthands = undefined;

/**
 * @function
 * @param {import("node-pg-migrate").MigrationBuilder} pgm
 */
exports.up = (pgm) => {
	pgm.addConstraint(
		"collaborations",
		"unique_playlist_id_and_user_id",
		"UNIQUE(playlist_id, user_id)",
	);
};

/**
 * @function
 * @param {import("node-pg-migrate").MigrationBuilder} pgm
 */
exports.down = (pgm) => {
	pgm.dropConstraint("collaborations", "unique_playlist_id_and_user_id");
};
