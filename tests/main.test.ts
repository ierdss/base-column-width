import * as fs from "fs";
import * as path from "path";
import { updateColumnsBySingleValue } from "../main";

/**
 * This function should perform the following actions:
 * - Detect if the type is table. (To prevent placing sizes in the wrong table type)
 * - If table then detect the name. (To prevent placing sizes in the wrong view.)
 * - Detect the columnSize. (To find here to place sizes if it exists.)
 * - Detect the rowHeight. (To place sizes before rowHeight if columnSize doesn't exist)
 * - Detect the next view. (To place sizes before the next view if columnSize and rowHeight does not exist and to end placing sizes.)
 * - Detect the end of the file. (To place sizes before the end of the file if columnSize and rowHeight does not exist and to end placing sizes.)
 */
describe("updateColumnSizeInBaseFile", () => {
	const testCases = [
		{
			title: "after columnSize",
		},
		{
			title: "before rowHeight",
		},
		{
			title: "before next view",
		},
		{
			title: "before end of file",
		},
	];

	describe("Insert sizes in single view", () => {
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

	describe("Insert sizes in multiple views", () => {
		describe("at first view", () => {
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

		describe("at middle view", () => {
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

		describe("at last view", () => {
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
	});
});

// describe("updateColumnsBySingleValue", () => {
// 	test("case: 1: Update all column sizes using a single value", () => {
// 		const input = updateColumnsBySingleValue(
// 			{ column_1: 0, column_2: 50, column_3: 100 },
// 			200
// 		);
// 		const output = { column_1: 200, column_2: 200, column_3: 200 };
// 		expect(input).toEqual(output);
// 	});
// });
