import * as fs from "fs";
import * as path from "path";
import { updateColumnsBySingleValue } from "../main";

describe("updateColumnSizeInBaseFile", () => {
	const testCases = [
		{
			title: "with columnSize",
		},
		{
			title: "without columnSize",
		},
		// {
		// 	title: "with rowHeight",
		// },
		// {
		// 	title: "without rowHeight",
		// },
		// {
		// 	title: "with columnSize and rowHeight",
		// },
		// {
		// 	title: "without columnSize and rowHeight",
		// },
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

	describe("Multiple Views ", () => {
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
});

describe("updateColumnsBySingleValue", () => {
	test("case: 1: Update all column sizes using a single value", () => {
		const input = updateColumnsBySingleValue(
			{ column_1: 0, column_2: 50, column_3: 100 },
			200
		);
		const output = { column_1: 200, column_2: 200, column_3: 200 };
		expect(input).toEqual(output);
	});
});
