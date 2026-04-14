export function calculateReviewStats(reviews: { rating: number }[] | undefined) {
	if (!reviews) return { count: 0, average: "0.0", formatted: "0.0 (0)" };
	const count = reviews.length;
	const total = reviews.reduce((acc, r) => acc + r.rating, 0);
	const average = count > 0 ? (total / count).toFixed(1) : "0.0";
	return { count, average, formatted: `${average} (${count})` };
}

export function calculateCommissionPricing(
	price: number,
	discountRate: number = 0,
) {
	const originalPrice = price;
	const basePrice = price * (1 - discountRate);
	return {
		basePrice,
		originalPrice,
		discountRate,
	};
}
