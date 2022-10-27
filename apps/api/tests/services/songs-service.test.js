import { describe, beforeAll, afterAll, it, expect } from "vitest";
import * as dotenv from "dotenv";

import { SongsService } from "../../src/services/songs-service.js";

dotenv.config();

describe("SongsService", async () => {
	/** @type {?SongsService} */
	let service;

	/** @type {?string} */
	let songId1;

	/** @type {?string} */
	let songId2;

	beforeAll(() => {
		service = new SongsService();
	});

	afterAll(async () => {
		if (service) {
			await service.deleteSongs();
			await service.close();
		}
	});

	it("adds songs", async () => {
		const result1 = await service.addSong({
			title: "The Real Slim Shady",
			year: 2000,
			performer: "Eminem",
			genre: "Hip hop",
			duration: 269,
		});

		const result2 = await service.addSong({
			title: "Mockingbird",
			year: 2004,
			performer: "Eminem",
			genre: "Hip hop",
			duration: 258,
		});

		songId1 = result1;
		songId2 = result2;

		expect(result1).toBeTypeOf("string");
		expect(result2).toBeTypeOf("string");
	});

	it("gets all songs", async () => {
		const songs = await service.getSongs();

		expect(songs).toBeTypeOf("object");
		expect(songs.length).toEqual(2);
		expect(songs[0].title).toEqual("The Real Slim Shady");
		expect(songs[1].title).toEqual("Mockingbird");
	});

	it("gets a song", async () => {
		const song = await service.getSong(songId1);

		expect(song).not.toBeNull();
		expect(song.title).toEqual("The Real Slim Shady");
	});

	it("updates a song", async () => {
		const rowCount = await service.updateSong(songId1, {
			title: "Stan (Short Version)",
			year: 2000,
			performer: "Eminem",
			genre: "Hip hop",
			duration: 365,
		});

		expect(rowCount).toEqual(1);

		const song = await service.getSong(songId1);

		expect(song.title).toEqual("Stan (Short Version)");
		expect(song.year).toEqual(2000);
		expect(song.performer).toEqual("Eminem");
		expect(song.genre).toEqual("Hip hop");
		expect(song.duration).toEqual(365);
	});

	it("deletes all songs", async () => {
		let rowCount = await service.deleteSong(songId1);
		expect(rowCount).toEqual(1);
		let songs = await service.getSongs();
		expect(songs.length).toEqual(1);

		rowCount = await service.deleteSong(songId2);
		expect(rowCount).toEqual(1);
		songs = await service.getSongs();
		expect(songs.length).toEqual(0);
	});
});
