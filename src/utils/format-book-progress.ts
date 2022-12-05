import type { Update } from "@prisma/client";

export function formatBookProgress(
	update: Update | undefined | null,
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
