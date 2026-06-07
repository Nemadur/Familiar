export type TRoadmapStatus = "Planned" | "InProgress" | "Exploring";

export type TRoadmapInput = {
	id: string;
	date: string;
	status: TRoadmapStatus;
};

export type TRoadmapItem = TRoadmapInput;
