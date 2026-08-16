import { OutlineArrowLeft } from "@/components/icons/icons";
import {
	defineLifeline,
	type LifelineMilestones,
} from "@/lib/lifeline-data";

interface RoadmapEntry {
	id: string;
	date: string;
	title: string;
	milestone: LifelineMilestones[number];
}

const ROADMAP_ENTRIES: RoadmapEntry[] = [
	{
		id: "commission-messaging",
		date: "2026-08-15",
		title: "Commission Messaging and Progress Updates",
		milestone: {
			id: "commission-messaging",
			badges: [
				{
					icon: OutlineArrowLeft,
					label: "Messaging",
				},
			],
			events: [
				{
					text: "Commission messaging and progress updates.",
					image: {
						src: "logo192.png",
						alt: "Familiar commission messaging preview",
					},
				},
				"Keep client conversations, references, and progress previews connected to the commission request.",
			],
			photos: [
				{
					src: "logo192.png",
					alt: "Commission messaging concept",
					x: 0.78,
					y: 190,
					rotate: -3,
					width: 190,
				},
			],
		},
	},
	{
		id: "delivery-revisions",
		date: "2026-09-15",
		title: "Delivery and Revision Workflow",
		milestone: {
			id: "delivery-revisions",
			badges: [
				{
					icon: OutlineArrowLeft,
					label: "Delivery",
				},
			],
			events: [
				{
					text: "Delivery and revision workflow.",
					image: {
						src: "logo192.png",
						alt: "Familiar revision workflow preview",
					},
				},
				"Structured delivery, revision requests, approvals, and a clearer path to completion.",
			],
		},
	},
	{
		id: "discovery",
		date: "2026-10-15",
		title: "Better Artist and Commission Discovery",
		milestone: {
			id: "discovery",
			badges: [
				{
					icon: OutlineArrowLeft,
					label: "Discovery",
				},
			],
			events: [
				{
					text: "Better artist and commission discovery.",
					image: {
						src: "logo192.png",
						alt: "Familiar discovery concept",
					},
				},
				"Improved search, filtering, categories, tags, and personalized recommendations.",
			],
			photos: [
				{
					src: "logo192.png",
					alt: "Artist discovery concept",
					x: 0.82,
					y: 155,
					rotate: 4,
					width: 200,
				},
			],
		},
	},
	{
		id: "reviews-showcases",
		date: "2026-12-01",
		title: "Reviews and Completed-Work Showcases",
		milestone: {
			id: "reviews-showcases",
			events: [
				"Reviews and completed-work showcases.",
				"Help clients discover trusted artists and let artists present completed commissions.",
			],
		},
	},
	{
		id: "availability-queues",
		date: "2027-02-01",
		title: "Artist Availability and Queue Management",
		milestone: {
			id: "availability-queues",
			events: [[
				{ type: "text", value: "Artist availability and queue management. " },
				{ type: "link", value: "test", href: "https://familiar.art" },
				{ type: "text", value: "Commission slots, waitlists, estimated start dates, and clearer workload visibility." },
				{ type: "button", variant: "secondary", className: "mr-2", value: "Test", action: () => console.log("Test") },
			]],
		},
	},
	{
		id: "mobile-experience",
		date: "2027-04-01",
		title: "Mobile Experience",
		milestone: {
			id: "mobile-experience",
			badges: [
				{
					icon: OutlineArrowLeft,
					label: "Mobile",
				},
			],
			events: [
				{
					text: "A faster mobile and installable app experience. 🎉",
					image: {
						src: "logo192.png",
						alt: "Familiar mobile experience concept",
					},
					effect: "confetti",
				},
				"Click this milestone to test the confetti effect.",
			],
			photos: [
				{
					src: "logo192.png",
					alt: "Mobile roadmap concept",
					x: 0.65,
					y: 130,
					rotate: -4,
					width: 180,
				},
			],
		},
	},
];

function quarterLabel(
	dateValue: string,
	locale: string,
) {
	const date = new Date(`${dateValue}T00:00:00Z`);
	const quarter =
		Math.floor(date.getUTCMonth() / 3) + 1;
	const year = date.getUTCFullYear();

	if (locale.toLowerCase().startsWith("pl")) {
		return `${quarter}. kw. ${year}`;
	}

	return `Q${quarter} ${year}`;
}

export function createRoadmapLifeline(
	locale = "en-US",
) {
	const milestones = ROADMAP_ENTRIES.reduce<LifelineMilestones>(
		(result, entry, index) => {
			const position = index + 1;

			result[position] = {
				...entry.milestone,
				// age: quarterLabel(
				// 	entry.date,
				// 	locale,
				// ),
			};

			return result;
		},
		{},
	);

	const record = defineLifeline({
		slug: "familiar-roadmap",
		name: "Coming next to Familiar",
		birthYear: 1,
		endYear: ROADMAP_ENTRIES.length,
		description:
			"A look at what we are building, planning, and exploring next.",
		milestones,
	});

	return {
		...record,
		markers: record.markers.map((marker) => {
			const entry =
				ROADMAP_ENTRIES[marker.year - 1];

			return {
				...marker,
				label: entry
					? quarterLabel(
						entry.date,
						locale,
					)
					: "",
				age: marker.age ?? "",
			};
		}),
	};
}

export const roadmapLifeline =
	createRoadmapLifeline();