import {
	App,
	FileView,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
	TFile,
} from "obsidian";

interface BaseColumnWidthSettings {
	minColumnWidth: number;
	maxColumnWidth: number;
	defaultColumnWidthBehavior: string;
	customColumnWidth: number;
	defaultLineWrapBehavior: string;
}

const DEFAULT_SETTINGS: BaseColumnWidthSettings = {
	minColumnWidth: 100,
	maxColumnWidth: 300,
	defaultColumnWidthBehavior: "1",
	customColumnWidth: 150,
	defaultLineWrapBehavior: "1",
};

export default class BaseColumnWidthPlugin extends Plugin {
	settings: BaseColumnWidthSettings;

	async onload() {
		await this.loadSettings();

		// Adds a settings tab under "Community Plugins"
		// this.addSettingTab(new BaseColumnWidthSettingTab(this.app, this));

		this.registerEvent(
			this.app.workspace.on("file-menu", (menu, file: TFile) => {
				// Only add the menu item for .base files
				if (file.extension === "base") {
					menu.addItem((item) => {
						item.setTitle("Edit individual sizes")
							.setIcon("ruler")
							.onClick(async () => {
								// Get the file content
								const fileContent = await this.app.vault.read(
									file
								);
								let initialData;
								try {
									// Parse the file content to extract column data
									initialData = getViewColumnSizes(
										getViewName(this.app.workspace),
										fileContent
									);
								} catch (e) {
									console.error(
										"Failed to parse base file content:",
										e
									);
									new Notice(
										"Error: Could not read file data. Check file format."
									);
									return;
								}
								// Open the modal with the initial data
								new BaseColumnWidthModal(
									this.app,
									file,
									initialData,
									getViewColumns(this.app.workspace)
								).open();
							});
					});
					menu.addItem((item) => {
						item.setTitle("Distribute evenly to window size")
							.setIcon("ruler")
							.onClick(async () => {
								const fileContent = await this.app.vault.read(
									file
								);
								let initialData;
								try {
									// Parse the file content to extract column data
									initialData = getViewColumnSizes(
										getViewName(this.app.workspace),
										fileContent
									);
									const originalContent =
										await this.app.vault.read(file);
									const updatedContent =
										distributeColumnsToWindow(
											originalContent,
											initialData,
											getViewName(this.app.workspace),
											getViewColumns(this.app.workspace),
											getWindowWidth(this.app.workspace)
										);
									await this.app.vault.process(
										file,
										() => updatedContent
									);
									new Notice(
										"Distributed evenly to window size!"
									);
								} catch (e) {
									console.error(
										"Failed to parse base file content:",
										e
									);
									new Notice(
										"Error: Could not read file data. Check file format."
									);
									return;
								}
							});
					});
					menu.addItem((item) => {
						item.setTitle("Distribute evenly by custom size")
							.setIcon("ruler")
							.onClick(async () => {
								// Get the file content
								const fileContent = await this.app.vault.read(
									file
								);
								let initialData;
								try {
									// Parse the file content to extract column data
									initialData = getViewColumnSizes(
										getViewName(this.app.workspace),
										fileContent
									);
								} catch (e) {
									console.error(
										"Failed to parse base file content:",
										e
									);
									new Notice(
										"Error: Could not read file data. Check file format."
									);
									return;
								}
								// Open the modal with the initial data
								new BaseCustomColumnWidthModal(
									this.app,
									file,
									initialData,
									getViewColumns(this.app.workspace),
									150
								).open();
							});
					});
				}
			})
		);
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class BaseColumnWidthSettingTab extends PluginSettingTab {
	plugin: BaseColumnWidthPlugin;

	constructor(app: App, plugin: BaseColumnWidthPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl("h5", { text: "Line Wrap Behavior" });

		new Setting(containerEl)
			.setName("Line Wrap Behavior")
			.addDropdown((dropdown) => {
				dropdown
					.addOption("0", "disabled")
					.addOption("1", "wrap")
					.setValue(this.plugin.settings.defaultLineWrapBehavior)
					.onChange(async (value) => {
						this.plugin.settings.defaultColumnWidthBehavior = value;
						await this.plugin.saveSettings();
					});
			});

		containerEl.createEl("h5", { text: "Column Width Behavior" });

		new Setting(containerEl)
			.setName("Default Column Width Behavior")
			.addDropdown((dropdown) => {
				dropdown
					.addOption("0", "disabled")
					.addOption("1", "min-width")
					.addOption("2", "max-width")
					.addOption("3", "fit-content")
					.addOption("4", "custom")
					.setValue(this.plugin.settings.defaultColumnWidthBehavior)
					.onChange(async (value) => {
						this.plugin.settings.defaultColumnWidthBehavior = value;
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName("Custom Width")
			.setDesc("Set the minimum column width for all columns in pixels.")
			.addText((text) => {
				text.setPlaceholder("150")
					.setValue(this.plugin.settings.customColumnWidth.toString())
					.onChange(async (value) => {
						this.plugin.settings.customColumnWidth = Number(value);
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName("Maximum Column Width")
			.setDesc("Set the maximum column width for all columns.")
			.addText((text) => {
				text.setPlaceholder("300")
					.setValue(this.plugin.settings.maxColumnWidth.toString())
					.onChange(async (value) => {
						this.plugin.settings.maxColumnWidth = Number(value);
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName("Minimum Column Width")
			.setDesc("Set the minimum column width for all columns.")
			.addText((text) => {
				text.setPlaceholder("100")
					.setValue(this.plugin.settings.minColumnWidth.toString())
					.onChange(async (value) => {
						this.plugin.settings.minColumnWidth = Number(value);
						await this.plugin.saveSettings();
					});
			});
	}
}

// Plugin functions

export class BaseColumnWidthModal extends Modal {
	file: TFile;
	initialData: Record<string, number>;
	allColumns: Record<string, number>;

	constructor(
		app: App,
		file: TFile,
		initialData: Record<string, number>,
		allColumns: Record<string, number>
	) {
		super(app);
		this.file = file;
		this.initialData = initialData;
		this.allColumns = allColumns;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.createEl("h2", {
			text: `Edit column sizes`,
		});

		// Compare the number of columns in "order" to the number of entries in "columnSize"
		if (
			Object.keys(this.allColumns).length >
			Object.keys(this.initialData).length
		) {
			const missingColumns = Object.keys(this.allColumns).filter(
				(item) => !Object.keys(this.initialData).includes(item)
			);
			missingColumns.forEach((item: string) => {
				this.initialData[item] = 0;
			});
		}
		if (
			Object.keys(this.allColumns).length <
			Object.keys(this.initialData).length
		) {
			const remainingColumns = Object.keys(this.initialData).filter(
				(item) => !Object.keys(this.allColumns).includes(item)
			);
			for (const prop of remainingColumns) {
				delete this.initialData[prop];
			}
		}

		// Iterate over the keys of the initial data object.
		// This will create a setting for each column found in the file.
		for (const key in this.initialData) {
			if (Object.prototype.hasOwnProperty.call(this.initialData, key)) {
				new Setting(contentEl).setName(key).addText((text) =>
					text
						.setValue(this.initialData[key].toString())
						.onChange((value) => {
							// Update the result object with the new value
							this.initialData[key] = parseInt(value) || 0;
						})
				);
			}
		}

		// Add a button to save changes
		new Setting(contentEl).addButton((button) =>
			button
				.setCta()
				.setButtonText("Save changes")
				.onClick(() => {
					this.onSave();
					this.close();
				})
		);
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}

	async onSave() {
		const originalContent = await this.app.vault.read(this.file);

		// 2. Use the serialization function to get the updated content
		const updatedContent = updateColumnSizesInFile(
			originalContent,
			this.initialData,
			getViewName(this.app.workspace)
		);

		// 3. Write the complete, modified content back to the file
		await this.app.vault.process(this.file, () => updatedContent);

		new Notice("Edited individual sizes!");
	}
}
export class BaseCustomColumnWidthModal extends Modal {
	file: TFile;
	initialData: Record<string, number>;
	allColumns: Record<string, number>;
	customWidth: number;

	constructor(
		app: App,
		file: TFile,
		initialData: Record<string, number>,
		allColumns: Record<string, number>,
		customWidth: number
	) {
		super(app);
		this.file = file;
		this.initialData = initialData;
		this.allColumns = allColumns;
		this.customWidth = customWidth;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.createEl("h2", {
			text: `Enter custom width`,
		});

		// Compare the number of columns in "order" to the number of entries in "columnSize"
		if (
			Object.keys(this.allColumns).length >
			Object.keys(this.initialData).length
		) {
			const missingColumns = Object.keys(this.allColumns).filter(
				(item) => !Object.keys(this.initialData).includes(item)
			);
			missingColumns.forEach((item: string) => {
				this.initialData[item] = 0;
			});
		}
		if (
			Object.keys(this.allColumns).length <
			Object.keys(this.initialData).length
		) {
			const remainingColumns = Object.keys(this.initialData).filter(
				(item) => !Object.keys(this.allColumns).includes(item)
			);
			for (const prop of remainingColumns) {
				delete this.initialData[prop];
			}
		}

		// Iterate over the keys of the initial data object.
		// This will create a setting for each column found in the file.
		new Setting(contentEl).setName("Custom width").addText((text) =>
			text.setValue("0").onChange((value) => {
				// Update the result object with the new value
				this.customWidth = parseInt(value) || 0;
			})
		);

		// Add a button to save changes
		new Setting(contentEl).addButton((button) =>
			button
				.setCta()
				.setButtonText("Save changes")
				.onClick(() => {
					this.onSave();
					this.close();
				})
		);
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}

	async onSave() {
		const originalContent = await this.app.vault.read(this.file);

		const updatedContent = distributeColumnsByValue(
			originalContent,
			this.initialData,
			getViewName(this.app.workspace),
			this.customWidth
		);

		await this.app.vault.process(this.file, () => updatedContent);

		new Notice("Distributed evenly by custom size!");
	}
}

// Core functions
function updateColumnSizesInFile(
	originalContent: string,
	newSizes: Record<string, number>,
	viewName: string
): string {
	const lines = originalContent.split("\n");
	let outputLines: string[] = [];
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

function distributeColumnsToWindow(
	originalContent: string,
	newSizes: Record<string, number>,
	viewName: string,
	columns: Record<string, number>,
	windowWidth: number
): string {
	const lines = originalContent.split("\n");
	let outputLines: string[] = [];
	const distributedWidth: number = Math.floor(
		windowWidth / Object.keys(columns).length
	);

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
			for (const key in columns) {
				outputLines.push(`      ${key}: ${distributedWidth}`);
			}
			isFinished = true;
		}
		if (!sizesExist && inView && i + 1 === lines.length - 1) {
			const leadingSpaces = lines[i + 1].match(/^\s*/)?.[0].length ?? 0;
			if (leadingSpaces === 0) {
				sizesExist = true;
				inView = false;
				outputLines.push(`    columnSize:`);
				for (const key in columns) {
					outputLines.push(`      ${key}: ${distributedWidth}`);
				}
				isFinished = true;
			}
		}
		if (!sizesExist && inView && i + 1 < lines.length) {
			if (
				lines[i + 1].trim().startsWith("- type:") ||
				lines[i + 1].trim().startsWith("rowHeight")
			) {
				sizesExist = true;
				inView = false;
				outputLines.push(`    columnSize:`);
				for (const key in columns) {
					outputLines.push(`      ${key}: ${distributedWidth}`);
				}
				isFinished = true;
			}
		}
	}

	return outputLines.join("\n");
}

function distributeColumnsByValue(
	originalContent: string,
	newSizes: Record<string, number>,
	viewName: string,
	customWidth: number
): string {
	const lines = originalContent.split("\n");
	let outputLines: string[] = [];
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
				line.trim().startsWith("rowHeight"))
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
				outputLines.push(`      ${key}: ${customWidth}`);
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
					outputLines.push(`      ${key}: ${customWidth}`);
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
					outputLines.push(`      ${key}: ${customWidth}`);
				}
				isFinished = true;
			}
		}
	}

	return outputLines.join("\n");
}

// Utitlities
export function getViewName(activeView: any) {
	const view = activeView.getActiveViewOfType(FileView);
	const viewName = view.controller.viewName;
	return viewName;
}

export function getWindowWidth(activeView: any) {
	const view = activeView.getActiveViewOfType(FileView);
	const windowWidth = view.headerEl.clientWidth;
	return windowWidth;
}

// Gets the column sizes in alphabetical from the base file with all values at 0
export function getViewColumns(activeView: any) {
	const view = activeView.getActiveViewOfType(FileView);
	const columnsArr = view.controller.view.data.config.order;
	const allColumns: Record<string, number> = {};
	columnsArr.forEach((item: string) => {
		allColumns[item] = 0;
	});
	return allColumns;
}

// Gets the column sizes in alphabetical from the base file with existing values
function getViewColumnSizes(
	start: string,
	content: string
): Record<string, number> {
	const lines = content.split("\n");

	let isTable = false;
	let inStart = false;
	let inColumnSizeSection = false;

	const columnSizes: Record<string, number> = {};

	for (const line of lines) {
		const trimmedLine = line.trim();
		if (
			inColumnSizeSection &&
			(line.trim().startsWith("- type:") ||
				line.trim().startsWith("rowHeight:"))
		) {
			break;
		}
		if (inStart && trimmedLine.startsWith("columnSize:")) {
			inColumnSizeSection = true;
			continue;
		}

		if (inColumnSizeSection) {
			const leadingSpaces = line.match(/^\s*/)?.[0].length ?? 0;
			if (
				(leadingSpaces === 0 && trimmedLine !== "") ||
				trimmedLine.startsWith("- type:") ||
				trimmedLine.startsWith("rowHeight:")
			) {
				inColumnSizeSection = false;
				continue;
			}

			const parts = trimmedLine.split(":").map((part) => part.trim());
			if (parts.length === 2) {
				const key = parts[0];
				const value = parseInt(parts[1], 10);
				if (!isNaN(value)) {
					columnSizes[key] = value;
				}
			}
		}
		if (isTable && trimmedLine.startsWith(`name: ${start}`)) {
			inStart = true;
		} else {
			isTable = false;
		}
		if (trimmedLine.startsWith("- type: table")) {
			isTable = true;
			continue;
		}
	}

	return columnSizes;
}
