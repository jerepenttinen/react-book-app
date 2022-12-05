export function formatBookProgress(
	update: { progress: number } | undefined | null,
	pageCount: number | undefined | null,
) {
	if (!update) {
		return undefined;
	}

	if (pageCount === undefined || pageCount === null) {
		return `Sivulla ${update.progress}`;
	}

	return `Sivulla ${update.progress}/${pageCount} (${(
			(update.progress / pageCount) *
			100
		).toFixed(0)
		} %)`;
}
