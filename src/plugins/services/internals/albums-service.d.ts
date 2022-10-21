import type * as pg from "pg";

import "core-js/actual/array/group-to-map.js";

export type { Album } from "#open-music/entities.js";

export type Payload = Pick<Album, "name" | "year">;

export declare class AlbumsService {
	#db: pg.Pool;

	async getAlbums(): Promise<Album[]>;

	async getAlbum(id: string): Promise<Album>;

	async getAlbumLikes(albumId: string): Promise<number>;

	async addAlbum(payload: Payload): Promise<string>;

	async updateAlbumLikes(albumId: string, userId: string): Promise<number>;

	async updateAlbum(id: string, payload: Payload): Promise<void>;

	async updateAlbumCover(id: string, coverUrl: string): Promise<void>;

	async deleteAlbum(id: string): Promise<void>;

	async close(): Promise<void>;
}
