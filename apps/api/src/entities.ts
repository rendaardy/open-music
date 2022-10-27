export type Album = {
	id: string;
	name: string;
	// eslint-disable-next-line @typescript-eslint/ban-types
	coverUrl: string | null;
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

export type Playlist = {
	id: string;
	name: string;
	username: string;
};

export type PlaylistWithSongs = Playlist & {
	songs: Array<Pick<Song, "id" | "title" | "performer">>;
};

export type PlaylistActivity = {
	username: string;
	title: string;
	action: string;
	time: string;
};
