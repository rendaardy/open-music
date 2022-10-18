import type * as pg from "pg";

export type { Song } from "../../../entities.ts";

export type Payload = Omit<Song, "id">;

export declare class SongsService {
	#db: pg.Pool;

	async getSongs(query: { title: string; performer: string }): Promise<Song[]>;

	async getSong(id: string): Promise<Song>;

	async addSong(payload: Payload): Promise<string>;

	async updateSong(id: string, payload: Payload): Promise<void>;

	async deleteSong(id: string): Promise<void>;

	async close(): Promise<void>;
}
