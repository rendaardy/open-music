/* eslint-disable camelcase */

/**
 * @function
 * @param {import("node-pg-migrate").MigrationBuilder} pgm
 */
exports.up = (pgm) => {
	pgm.createTable("albums", {
		id: {
			type: "varchar",
			primaryKey: true,
		},
		name: {
			type: "varchar",
			notNull: true,
		},
		year: {
			type: "integer",
			notNull: true,
		},
	});

	pgm.createTable("songs", {
		id: {
			type: "varchar",
			primaryKey: true,
		},
		title: {
			type: "varchar",
			notNull: true,
		},
		year: {
			type: "integer",
			notNull: true,
		},
		performer: {
			type: "varchar",
			notNull: true,
		},
		genre: {
			type: "varchar",
			notNull: true,
		},
		duration: {
			type: "integer",
		},
		album_id: {
			type: "varchar",
		},
	});
};

/**
 * @function
 * @param {import("node-pg-migrate").MigrationBuilder} pgm
 */
exports.down = (pgm) => {
	pgm.dropTable("songs");
	pgm.dropTable("albums");
};
