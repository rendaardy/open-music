import { Buffer } from "node:buffer";

import amqp from "amqplib";

import { cfg } from "#open-music/utils/config.js";

/** @type {import("@hapi/hapi").Plugin<undefined>} */
export const messageServicePlugin = {
	name: "app/message-service",
	async register(server) {
		if (!cfg.rabbitMq.server) {
			throw new Error("RABBITMQ_SERVER must be defined");
		}

		const connection = await amqp.connect(cfg.rabbitMq.server);
		const channel = await connection.createChannel();

		server.method("sendMessage", async (queue, message) => {
			await channel.assertQueue(queue, { durable: true });
			await channel.sendToQueue(queue, Buffer.from(message));
		});

		server.ext("onPostStop", () => {
			connection.close();
		});
	},
};
