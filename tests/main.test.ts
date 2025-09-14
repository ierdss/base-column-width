describe("updateColumnSizeInBaseFile", () => {
	// test("case: Single view with columnSize", () => {
	// 	const number = addTwoNums(10, 2);
	// 	expect(number).toEqual(12);
	// });
	test("case: Add Two Numbers", () => {
		const sum = addTwoNums(10, 2);
		expect(sum).toEqual(12);
	});
	test("case: Subtract Two Numbers", () => {
		const difference = subtractTwoNums(10, 2);
		expect(difference).toEqual(8);
	});
	test("case: Multiply Two Numbers", () => {
		const product = multiplyTwoNums(10, 2);
		expect(product).toEqual(20);
	});
	test("case: Divide Two Numbers", () => {
		const quotient = divideTwoNums(10, 2);
		expect(quotient).toEqual(5);
	});
	test("case: Modulo Two Numbers", () => {
		const remainder = moduloTwoNums(10, 2);
		expect(remainder).toEqual(0);
	});
});

function addTwoNums(a: number, b: number): number {
	return a + b;
}

function subtractTwoNums(a: number, b: number): number {
	return a - b;
}

function multiplyTwoNums(a: number, b: number): number {
	return a * b;
}

function divideTwoNums(a: number, b: number): number {
	return a / b;
}

function moduloTwoNums(a: number, b: number): number {
	return a % b;
}
