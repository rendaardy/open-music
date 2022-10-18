import type * as pg from "pg";

export type { User, UserWithPassword } from "../../../entities.js";

export type Payload = Omit<UserWithPassword, "id", "salt">;

export declare class UsersService {
	#db: pg.Pool;

	async addUser(payload: Payload): Promise<string>;

	async getUserById(userId: string): Promise<User>;

	async verifyUserCredential(username: string, password: string): Promise<string>;

	async #verifyNewUsername(username: string): Promise<void>;

	async close(): Promise<void>;
}
