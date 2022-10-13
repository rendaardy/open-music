/* eslint-disable camelcase */

/**
 * @function
 * @param {import("node-pg-migrate").MigrationBuilder} pgm
 */
exports.up = (pgm) => {
	pgm.createTable("collaborations", {
		id: {
			type: "varchar",
			primaryKey: true,
		},
		playlist_id: {
			type: "varchar",
			notNull: true,
		},
		user_id: {
			type: "varchar",
			notNull: true,
		},
	});
	pgm.addConstraint(
		"collaborations",
		"collaborations.playlist_id.fkey",
		"FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE",
	);
	pgm.addConstraint(
		"collaborations",
		"collaborations.user_id.fkey",
		"FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE",
	);
};

/**
 * @function
 * @param {import("node-pg-migrate").MigrationBuilder} pgm
 */
exports.down = (pgm) => {
	pgm.dropTable("collaborations");
};
