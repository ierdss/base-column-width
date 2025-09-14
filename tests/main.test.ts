import * as fs from "fs";
import * as path from "path";

describe("updateColumnSizeInBaseFile", () => {
	test("case: Single view with columnSize", () => {
		const inputPath = path.join(
			__dirname,
			"..",
			"bases",
			"test_1_input.base"
		);
		const input = fs.readFileSync(inputPath);
		const outputPath = path.join(
			__dirname,
			"..",
			"bases",
			"test_1_output.base"
		);
		const output = fs.readFileSync(outputPath);
		expect(input).toEqual(output);
	});
});
