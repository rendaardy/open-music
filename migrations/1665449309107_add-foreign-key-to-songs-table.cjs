exports.shorthands = undefined;

/**
 * @function
 * @param {import("node-pg-migrate").MigrationBuilder} pgm
 */
exports.up = (pgm) => {
	pgm.addConstraint(
		"songs",
		"songs.album_id.fkey",
		"FOREIGN KEY(album_id) REFERENCES albums(id) ON DELETE CASCADE",
	);
};

/**
 * @function
 * @param {import("node-pg-migrate").MigrationBuilder} pgm
 */
exports.down = (pgm) => {
	pgm.dropConstraint("songs", "songs.album_id.fkey");
};
