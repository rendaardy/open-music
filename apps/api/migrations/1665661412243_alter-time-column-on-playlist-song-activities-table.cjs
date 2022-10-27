/**
 * @function
 * @param {import("node-pg-migrate").MigrationBuilder} pgm
 */
exports.up = (pgm) => {
	pgm.alterColumn("playlist_song_activities", "time", {
		type: "timestamptz",
		notNull: true,
		default: pgm.func("current_timestamp"),
	});
};

/**
 * @function
 * @param {import("node-pg-migrate").MigrationBuilder} pgm
 */
exports.down = (pgm) => {
	pgm.alterColumn("playlist_song_activities", "time", {
		type: "timestamptz",
		notNull: true,
	});
};
