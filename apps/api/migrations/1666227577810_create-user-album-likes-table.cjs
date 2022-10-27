/* eslint-disable camelcase */

/**
 * @function
 * @param {import("node-pg-migrate").MigrationBuilder} pgm
 */
exports.up = (pgm) => {
	pgm.createTable("user_album_likes", {
		id: {
			type: "varchar",
			primaryKey: true,
		},
		user_id: {
			type: "varchar",
			notNull: true,
		},
		album_id: {
			type: "varchar",
			notNull: true,
		},
	});
	pgm.addConstraint(
		"user_album_likes",
		"user_album_likes.user_id.fkey",
		"FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE",
	);
	pgm.addConstraint(
		"user_album_likes",
		"user_album_likes.album_id.fkey",
		"FOREIGN KEY(album_id) REFERENCES albums(id) ON DELETE CASCADE",
	);
};

/**
 * @function
 * @param {import("node-pg-migrate").MigrationBuilder} pgm
 */
exports.down = (pgm) => {
	pgm.dropTable("user_album_likes");
};
