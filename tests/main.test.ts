import * as fs from "fs";
import * as path from "path";

describe("updateColumnSizeInBaseFile", () => {
	const testCases = [
		{
			title: "Insert sizes in empty file",
		},
		{
			title: "Insert sizes in fresh single view",
		},
	];

	for (let c = 0; c < testCases.length; c++) {
		test(`case ${c}: ${testCases[c].title}`, () => {
			const inputPath = path.join(
				__dirname,
				"..",
				"bases",
				`case_${c + 1}/input.base`
			);
			const input = fs.readFileSync(inputPath);
			const outputPath = path.join(
				__dirname,
				"..",
				"bases",
				`case_${c + 1}/output.base`
			);
			const output = fs.readFileSync(outputPath);
			expect(input).toEqual(output);
		});
	}
});
