export const MOCK_USERS = [
	{
		id: "u1",
		name: "Prismagic",
		avatar: "https://i.pravatar.cc/150?u=1",
		lastMessage: "Sounds great! I'll get started.",
		time: "10:42 AM",
		unread: 3,
		online: true,
	},
	{
		id: "u2",
		name: "Almond Neko",
		avatar: "https://i.pravatar.cc/150?u=2",
		lastMessage: "Can you send the references again?",
		time: "Yesterday",
		unread: 0,
		online: false,
	},
	{
		id: "u3",
		name: "UniqueOly",
		avatar: "https://i.pravatar.cc/150?u=3",
		lastMessage: "Thanks for the update!",
		time: "Monday",
		unread: 0,
		online: true,
	},
];

export const MOCK_MESSAGES: Record<
	string,
	{
		id: string;
		from: "user" | "artist";
		text?: string;
		time: string;
		date: string;
		files?: (File | string)[];
	}[]
> = {
	u1: [
		{
			id: "m1",
			from: "artist",
			text: "Hello! Thanks for reaching out. What kind of commission are you looking for?",
			time: "10:30 AM",
			date: "May 24, 2025",
		},
		{
			id: "m2",
			from: "user",
			text: "Hi! I'd love to get a character design based on some ideas I have.",
			time: "10:32 AM",
			date: "May 24, 2025",
		},
		{
			id: "m3",
			from: "artist",
			text: "Awesome! Do you have any reference images or moodboards you can share?",
			time: "10:35 AM",
			date: "May 24, 2025",
		},
		{
			id: "m4",
			from: "user",
			text: "Yes, I'll send them over right now. Give me a sec.",
			time: "10:38 AM",
			date: "May 25, 2025",
		},
		{
			id: "m5-1",
			from: "user",
			time: "10:40 AM",
			date: "May 25, 2025",
			files: [
				"https://images.unsplash.com/photo-1557682250-33bd709cbe85?q=80&w=400&auto=format&fit=crop",
			],
		},
		{
			id: "m5-2",
			from: "user",
			time: "10:40 AM",
			date: "May 25, 2025",
			files: [
				"https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=400&auto=format&fit=crop",
			],
		},
		{
			id: "m5",
			from: "user",
			text: "Here are some color palettes I like.",
			time: "10:40 AM",
			date: "May 25, 2025",
		},
		{
			id: "m6",
			from: "artist",
			text: "Sounds great! I'll get started.",
			time: "10:42 AM",
			date: "May 25, 2025",
		},
	],
	u2: [
		{
			id: "m1",
			from: "artist",
			text: "Can you send the references again?",
			time: "Yesterday",
			date: "May 24, 2025",
		},
	],
	u3: [
		{
			id: "m1",
			from: "user",
			text: "Thanks for the update!",
			time: "Monday",
			date: "May 20, 2025",
		},
	],
};
