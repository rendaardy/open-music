import { env } from "node:process";

import * as dotenv from "dotenv";

dotenv.config();

export const cfg = {
	app: {
		host: env.HOST,
		port: env.PORT,
		environment: env.NODE_ENV,
	},
	jwt: {
		tokenAge: env.ACCESS_TOKEN_AGE,
		accessTokenKey: env.ACCESS_TOKEN_KEY,
		refreshTokenKey: env.REFRESH_TOKEN_KEY,
	},
	aws: {
		region: env.AWS_REGION,
		s3: {
			bucketName: env.AWS_BUCKET_NAME,
		},
	},
	mail: {
		host: env.MAIL_HOST,
		port: env.MAIL_PORT,
		address: env.MAIL_ADDRESS,
		password: env.MAIL_PASSWORD,
	},
	rabbitMq: {
		server: env.RABBITMQ_SERVER,
	},
	redis: {
		server: env.REDIS_SERVER,
	},
};
