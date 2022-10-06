exports.shorthands = undefined;

/**
 * @function
 * @param {import("node-pg-migrate").MigrationBuilder} pgm
 */
exports.up = (pgm) => {
	pgm.createTable("users", {
		id: {
			type: "varchar",
			primaryKey: true,
		},
		username: {
			type: "varchar",
			notNull: true,
			unique: true,
		},
		password: {
			type: "text",
			notNull: true,
		},
		salt: {
			type: "text",
			notNull: true,
		},
		fullname: {
			type: "text",
			notNull: true,
		},
	});
};

/**
 * @function
 * @param {import("node-pg-migrate").MigrationBuilder} pgm
 */
exports.down = (pgm) => {
	pgm.dropTable("users");
};
