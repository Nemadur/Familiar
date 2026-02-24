export interface Order {
	id: string;
	postId: string;
	status: "pending" | "completed" | "cancelled";
	review?: {
		rating: number;
		comment: string;
		createdAt: Date;
	};
}

export const getAllOrders = async (): Promise<Order[]> => {
	// Mock implementation
	return [
		{
			id: "order-1",
			postId: "post-1",
			status: "completed",
			review: {
				rating: 5,
				comment: "Great work!",
				createdAt: new Date(),
			},
		},
	];
};
