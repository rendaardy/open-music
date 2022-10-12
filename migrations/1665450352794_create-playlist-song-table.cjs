/* eslint-disable camelcase */

exports.shorthands = undefined;

/**
 * @function
 * @param {import("node-pg-migrate").MigrationBuilder} pgm
 */
exports.up = (pgm) => {
	pgm.createTable("playlist_song", {
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
	});
	pgm.addConstraint(
		"playlist_song",
		"unique_playlist_id_and_song_id",
		"UNIQUE(playlist_id, song_id)",
	);
	pgm.addConstraint(
		"playlist_song",
		"playlist_song.playlist_id.fkey",
		"FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE",
	);
	pgm.addConstraint(
		"playlist_song",
		"playlist_song.song_id.fkey",
		"FOREIGN KEY(song_id) REFERENCES songs(id) ON DELETE CASCADE",
	);
};

/**
 * @function
 * @param {import("node-pg-migrate").MigrationBuilder} pgm
 */
exports.down = (pgm) => {
	pgm.dropTable("playlist_song");
};
