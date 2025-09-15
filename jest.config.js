const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
	testEnvironment: "jsdom",
	moduleDirectories: ["node_modules", "src", "tests"],
	transform: {
		...tsJestTransformCfg,
	},
};
