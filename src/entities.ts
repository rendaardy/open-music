export type Album = {
	id: string;
	name: string;
	year: number;
	songs?: Array<Pick<Song, "id" | "title" | "performer">>;
};

export type Song = {
	id: string;
	title: string;
	year: number;
	performer: string;
	genre: string;
	duration?: number;
	albumId?: string;
};

export type User = {
	id: string;
	username: string;
	fullname: string;
};

export type UserWithPassword = User & {
	password: string;
	salt: string;
};
