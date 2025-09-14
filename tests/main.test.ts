describe("updateColumnSizeInBaseFile", () => {
	test("case: Single view with columnSize", () => {
		const number = addTwoNums(10, 2);
		expect(number).toEqual(12);
	});
});

function addTwoNums(a: number, b: number): number {
	return a + b;
}
