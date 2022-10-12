exports.shorthands = undefined;

/**
 * @function
 * @param {import("node-pg-migrate").MigrationBuilder} pgm
 */
exports.up = (pgm) => {
	pgm.createTable("playlists", {
		id: {
			type: "varchar",
			primaryKey: true,
		},
		name: {
			type: "varchar",
			notNull: true,
		},
		owner: {
			type: "varchar",
			notNull: true,
		},
	});
	pgm.addConstraint(
		"playlists",
		"playlists_id_fkey",
		"FOREIGN KEY(owner) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE",
	);
};

/**
 * @function
 * @param {import("node-pg-migrate").MigrationBuilder} pgm
 */
exports.down = (pgm) => {
	pgm.dropTable("playlists");
};
