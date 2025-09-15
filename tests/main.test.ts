import * as fs from "fs";
import yaml from "js-yaml";
import * as path from "path";
import updateColumnSizesInBaseFile from "../src/functions/updateColumnSizeInBaseFile";
import updateColumnsBySingleValue from "../src/functions/updateColumnsBySingleValue";

/**
 * This function should perform the following actions:
 * - Detect if the type is table. (To prevent placing sizes in the wrong table type)
 * - If table then detect the name. (To prevent placing sizes in the wrong view.)
 * - Detect the columnSize. (To find here to place sizes if it exists.)
 * - Detect the rowHeight. (To place sizes before rowHeight if columnSize doesn't exist)
 * - Detect the next view. (To place sizes before the next view if columnSize and rowHeight does not exist and to end placing sizes.)
 * - Detect the end of the file. (To place sizes before the end of the file if columnSize and rowHeight does not exist and to end placing sizes.)
 */
let caseNum = 1;
describe("updateColumnSizeInBaseFile", () => {
	const casesAtFirst = [
		{
			title: "after columnSize",
		},
		{
			title: "before rowHeight",
		},
		{
			title: "with columnSize and rowHeight",
		},
		{
			title: "before the next view",
		},
	];
	const casesAtMiddle = [
		{
			title: "after columnSize",
		},
		{
			title: "before rowHeight",
		},
		{
			title: "with columnSize and rowHeight",
		},
		{
			title: "before the next view",
		},
	];
	const casesAtLast = [
		{
			title: "after columnSize",
		},
		{
			title: "before rowHeight",
		},
		{
			title: "with columnSize and rowHeight",
		},
		{
			title: "before the end of the file",
		},
	];

	describe("Insert sizes in multiple views", () => {
		describe("at first view (Table 1)", () => {
			for (let c = 0; c < casesAtFirst.length; c++) {
				test(`case ${caseNum++}: ${casesAtFirst[c].title}`, () => {
					const inputPath = path.join(
						__dirname,
						"..",
						"tests/files/at_first",
						`case_${c + 1}/input.base`
					);
					const input = updateColumnSizesInBaseFile(
						fs.readFileSync(inputPath, "utf-8"),
						{ column_1: 300, column_2: 300, column_3: 300 },
						"Table 1"
					);
					const outputPath = path.join(
						__dirname,
						"..",
						"tests/files/at_first",
						`case_${c + 1}/output.base`
					);
					const output = fs.readFileSync(outputPath, "utf-8");
					expect(yaml.load(input)).toEqual(yaml.load(output));
				});
			}
		});

		describe("at middle view (Table 2)", () => {
			for (let c = 0; c < casesAtMiddle.length; c++) {
				test(`case ${caseNum++}: ${casesAtMiddle[c].title}`, () => {
					const inputPath = path.join(
						__dirname,
						"..",
						"tests/files/at_middle",
						`case_${c + 1}/input.base`
					);
					const input = updateColumnSizesInBaseFile(
						fs.readFileSync(inputPath, "utf-8"),
						{ column_1: 300, column_2: 300, column_3: 300 },
						"Table 2"
					);
					const outputPath = path.join(
						__dirname,
						"..",
						"tests/files/at_middle",
						`case_${c + 1}/output.base`
					);
					const output = fs.readFileSync(outputPath, "utf-8");
					expect(yaml.load(input)).toEqual(yaml.load(output));
				});
			}
		});

		describe("at last view (Table 3)", () => {
			for (let c = 0; c < casesAtLast.length; c++) {
				test(`case ${caseNum++}: ${casesAtLast[c].title}`, () => {
					const inputPath = path.join(
						__dirname,
						"..",
						"tests/files/at_last",
						`case_${c + 1}/input.base`
					);
					const input = updateColumnSizesInBaseFile(
						fs.readFileSync(inputPath, "utf-8"),
						{ column_1: 300, column_2: 300, column_3: 300 },
						"Table 3"
					);
					const outputPath = path.join(
						__dirname,
						"..",
						"tests/files/at_last",
						`case_${c + 1}/output.base`
					);
					const output = fs.readFileSync(outputPath, "utf-8");
					expect(yaml.load(input)).toEqual(yaml.load(output));
				});
			}
		});
	});
});

describe("updateColumnsBySingleValue", () => {
	test(`case ${caseNum}: Update all column sizes using a single value`, () => {
		const input = updateColumnsBySingleValue(
			{ column_1: 0, column_2: 50, column_3: 100 },
			200
		);
		const output = { column_1: 200, column_2: 200, column_3: 200 };
		expect(input).toEqual(output);
	});
});
