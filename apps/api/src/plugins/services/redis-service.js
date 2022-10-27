import { createClient } from "redis";

/**
 * @typedef {object} RedisPluginOptions
 * @property {string} host
 */

/** @type {import("@hapi/hapi").Plugin<RedisPluginOptions>} */
export const redisPlugin = {
	name: "app/redis-service",
	async register(server, opts) {
		const client = createClient({
			socket: {
				host: opts.host,
			},
		});

		client.on("error", (error) => {
			server.logger.error("Redis Client Error: %s", error.message);
		});

		await client.connect();

		server.method("setCache", async (key, value, expInSec = 1800) => {
			await client.set(key, value, { EX: expInSec });
		});
		server.method("getCache", async (key) => {
			const value = await client.get(key);

			if (value === null) {
				return null;
			}

			return value;
		});
		server.method("deleteCache", async (key) => {
			await client.del(key);
		});

		server.ext("onPostStop", async () => {
			await client.quit();
		});
	},
};
