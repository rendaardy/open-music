import { Buffer } from "node:buffer";

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

/**
 * @typedef {object} S3Options
 * @property {string} region
 * @property {string} bucketName
 */

/** @type {import("@hapi/hapi").Plugin<S3Options>} */
export const s3Plugin = {
	name: "app/aws-s3-service",
	async register(server, opts) {
		const s3Client = new S3Client({ region: opts.region });

		server.method("uploadAlbumCover", async (content, metadata) => {
			let fileBuffer = Buffer.from([]);

			for await (const chunk of content) {
				fileBuffer = Buffer.concat([fileBuffer, chunk]);
			}

			const command = new PutObjectCommand({
				Bucket: opts.bucketName,
				Key: metadata.filename,
				ContentType: metadata.headers["content-type"],
				Body: fileBuffer,
			});
			const results = await s3Client.send(command);
			console.log(results);

			return `https://${opts.bucketName}.s3.${opts.region}.amazonaws.com/${metadata.filename}`;
		});

		server.ext("onPostStop", () => {
			s3Client.destroy();
		});
	},
};
