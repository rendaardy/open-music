exports.shorthands = undefined;

/**
 * @function
 * @param {import("node-pg-migrate").MigrationBuilder} pgm
 */
exports.up = (pgm) => {
	pgm.dropConstraint("playlist_song", "unique_playlist_id_and_song_id");
};

/**
 * @function
 * @param {import("node-pg-migrate").MigrationBuilder} pgm
 */
exports.down = (pgm) => {
	pgm.addConstraint(
		"playlist_song",
		"unique_playlist_id_and_song_id",
		"UNIQUE(playlist_id, song_id)",
	);
};
