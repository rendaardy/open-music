import type { Request, ResponseToolkit, Lifecycle } from "@hapi/hapi";

import type { UserWithPassword } from "../entities.js";

export type RequestPayload = Pick<UserWithPassword, "username" | "password" | "fullname">;

export async function postUserHandler(
	request: Request,
	h: ResponseToolkit,
): Promise<Lifecycle.ReturnValue>;

export async function getUserByIdHandler(
	request: Request,
	h: ResponseToolkit,
): Promise<Lifecycle.ReturnValue>;
