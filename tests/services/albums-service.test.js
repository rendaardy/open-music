import { describe, beforeAll, afterAll, it, expect } from "vitest";
import * as dotenv from "dotenv";

import { AlbumsService } from "../../src/services/albums-service.js";

dotenv.config();

describe("AlbumsService", () => {
	/** @type {?AlbumsService} */
	let service;

	/** @type {?string} */
	let id1;

	/** @type {?string} */
	let id2;

	beforeAll(() => {
		service = new AlbumsService();
	});

	afterAll(async () => {
		if (service) {
			await service.deleteAlbums();
			await service.close();
		}
	});

	it("adds an album", async () => {
		const result1 = await service.addAlbum({
			name: "The Marshall Mathers LP",
			year: 2000,
		});
		const result2 = await service.addAlbum({
			name: "Encore",
			year: 2004,
		});

		id1 = result1;
		id2 = result2;

		expect(result1).toBeTypeOf("string");
		expect(result2).toBeTypeOf("string");
	});

	it("gets all albums", async () => {
		const result = await service.getAlbums();

		console.log(result);

		expect(result).toBeTypeOf("object");
		expect(result[0].name).toEqual("The Marshall Mathers LP");
		expect(result[1].name).toEqual("Encore");
	});

	it("gets an album", async () => {
		const result = await service.getAlbum(id1);

		console.log(result);

		expect(result).not.toBeNull();
		expect(result.name).toEqual("The Marshall Mathers LP");
		expect(result.year).toEqual(2000);
	});

	it("updates an album", async () => {
		const rowCount = await service.updateAlbum(id1, {
			name: "The Marshall Mathers LP2",
			year: 2013,
		});

		expect(rowCount).toEqual(1);

		const result = await service.getAlbum(id1);

		expect(result).not.toBeNull();
		expect(result.name).toEqual("The Marshall Mathers LP2");
		expect(result.year).toEqual(2013);
	});

	it("deletes all albums", async () => {
		let rowCount = await service.deleteAlbum(id1);
		expect(rowCount).toEqual(1);
		let albums = await service.getAlbums();
		expect(albums.length).toEqual(1);

		rowCount = await service.deleteAlbum(id2);
		expect(rowCount).toEqual(1);
		albums = await service.getAlbums();
		expect(albums.length).toEqual(0);
	});
});
