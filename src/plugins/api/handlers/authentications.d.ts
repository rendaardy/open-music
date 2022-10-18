import type { Request, ResponseToolkit, Lifecycle } from "@hapi/hapi";

type UserCredentialPayload = {
	username: string;
	password: string;
};

type TokenPayload = {
	refreshToken: string;
};

export async function postAuthenticationHandler(
	request: Request,
	h: ResponseToolkit,
): Promise<Lifecycle.ReturnValue>;

export async function putAuthenticationHandler(
	request: Request,
	h: ResponseToolkit,
): Promise<Lifecycle.ReturnValue>;

export async function deleteAuthenticationHandler(
	request: Request,
	h: ResponseToolkit,
): Promise<Lifecycle.ReturnValue>;
