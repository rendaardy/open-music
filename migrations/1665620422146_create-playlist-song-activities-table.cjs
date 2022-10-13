/* eslint-disable camelcase */

exports.shorthands = undefined;

/**
 * @function
 * @param {import("node-pg-migrate").MigrationBuilder} pgm
 */
exports.up = (pgm) => {
	pgm.createTable("playlist_song_activities", {
		id: {
			type: "varchar",
			primaryKey: true,
		},
		playlist_id: {
			type: "varchar",
			notNull: true,
		},
		song_id: {
			type: "varchar",
			notNull: true,
		},
		user_id: {
			type: "varchar",
			notNull: true,
		},
		action: {
			type: "varchar(10)",
			notNull: true,
		},
		time: {
			type: "timestamptz",
			notNull: true,
		},
	});
	pgm.addConstraint(
		"playlist_song_activities",
		"playlist_song_activities.playlist_id.fkey",
		"FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE",
	);
};

/**
 * @function
 * @param {import("node-pg-migrate").MigrationBuilder} pgm
 */
exports.down = (pgm) => {
	pgm.dropTable("playlist_song_activities");
};
