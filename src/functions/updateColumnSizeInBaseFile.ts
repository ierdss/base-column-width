// Update column sizes
export default function updateColumnSizesInBaseFile(
	originalContent: string,
	newSizes: Record<string, number>,
	viewName: string
): string {
	// Split the file into an array
	const lines = originalContent.split("\n");
	let outputLines: string[] = [];

	// Flags
	let inTable = false;
	let inView = false;
	let inSizes = false;
	let sizesExist = false;
	let isFinished = false;

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		if (
			isFinished &&
			(line.trim().startsWith("- type:") ||
				line.trim().startsWith("rowHeight:"))
		) {
			inSizes = false;
		}
		if (!inSizes) {
			outputLines.push(line);
		}
		if (!isFinished && line.trim().startsWith("- type: table")) {
			inTable = true;
			continue;
		}
		if (inTable) {
			if (line.trim().startsWith(`name: ${viewName}`)) {
				inView = true;
			}
			inTable = false;
			continue;
		}
		if (inView && line.trim().startsWith("columnSize:")) {
			sizesExist = true;
			inSizes = true;
			inView = false;
			for (const key in newSizes) {
				outputLines.push(`      ${key}: ${newSizes[key]}`);
			}
			isFinished = true;
		}
		if (!sizesExist && inView && i + 1 === lines.length - 1) {
			const leadingSpaces = lines[i + 1].match(/^\s*/)?.[0].length ?? 0;
			if (leadingSpaces === 0) {
				sizesExist = true;
				inView = false;
				outputLines.push(`    columnSize:`);
				for (const key in newSizes) {
					outputLines.push(`      ${key}: ${newSizes[key]}`);
				}
				isFinished = true;
			}
		}
		if (!sizesExist && inView && i + 1 < lines.length) {
			if (
				lines[i + 1].trim().startsWith("- type:") ||
				lines[i + 1].trim().startsWith("rowHeight:")
			) {
				sizesExist = true;
				inView = false;
				outputLines.push(`    columnSize:`);
				for (const key in newSizes) {
					outputLines.push(`      ${key}: ${newSizes[key]}`);
				}
				isFinished = true;
			}
		}
	}
	return outputLines.join("\n");
}
