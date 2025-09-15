// Updates all column sizes using a single number and return the columns
export default function updateColumnsBySingleValue(
	oldSizes: Record<string, number>,
	newSize: number
): Record<string, number> {
	for (const key in oldSizes) {
		oldSizes[key] = newSize;
	}
	return oldSizes;
}
