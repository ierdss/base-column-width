import {
	App,
	Editor,
	MarkdownView,
	Menu,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
	TFile,
} from "obsidian";

// Remember to rename these classes and interfaces!

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

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		this.registerEvent(
			this.app.workspace.on("file-menu", (menu, file) => {
				addFileMenu(file, menu);
			})
		);

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.

		this.registerDomEvent(document, "click", (evt: MouseEvent) => {
			console.log("click", evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(
			window.setInterval(() => console.log("setInterval"), 5 * 60 * 1000)
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

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.setText("Woah!");
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
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

// Helper functions
export function addFileMenu(file: TFile, menu: Menu) {
	if (file.extension === "base") {
		menu.addItem((item) => {
			item.setTitle("Edit Column Sizes")
				.setIcon("ruler")
				.onClick(async () => {
					const fileContent = await this.app.vault.read(file);
					let initialData;
					try {
						initialData = parseBaseFileContent(fileContent);
					} catch (e) {
						console.error("Failed to parse base file content:", e);
						new Notice(
							"Error: Could not read file data. Check file format."
						);
						return;
					}
					new BaseColumnWidthModal(
						this.app,
						file,
						initialData
					).open();
				});
		});
	}
}

export class BaseColumnWidthModal extends Modal {
	file: TFile;
	initialData: Record<string, number>; // Use a dynamic type for the column data
	result: Record<string, number>;

	constructor(app: App, file: TFile, initialData: Record<string, number>) {
		super(app);
		this.file = file;
		this.initialData = initialData;
		this.result = { ...initialData }; // Create a copy to edit
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.createEl("h2", {
			text: `Edit Column Sizes for ${this.file.name}`,
		});

		// Iterate over the keys of the initial data object.
		// This will create a setting for each column found in the file.
		for (const key in this.initialData) {
			if (Object.prototype.hasOwnProperty.call(this.initialData, key)) {
				new Setting(contentEl)
					.setName(key) // Set the setting name to the column's key (e.g., "column1")
					.setDesc(`Enter the size for the column "${key}".`)
					.addText((text) =>
						text
							.setValue(this.initialData[key].toString())
							.onChange((value) => {
								// Update the result object with the new value
								this.result[key] = parseInt(value) || 0;
							})
					);
			}
		}

		// Add a button to save changes
		new Setting(contentEl).addButton((button) =>
			button
				.setCta()
				.setButtonText("Save Changes")
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
			this.result
		);

		// 3. Write the complete, modified content back to the file
		await this.app.vault.modify(this.file, updatedContent);

		console.log("File saved successfully!");
		new Notice("Column sizes updated successfully!");
	}
}

function parseBaseFileContent(content: string): Record<string, number> {
	const lines = content.split("\n");
	let inColumnSizeSection = false;
	const columnSizes: Record<string, number> = {};

	for (const line of lines) {
		const trimmedLine = line.trim();

		if (trimmedLine.startsWith("columnSize:")) {
			inColumnSizeSection = true;
			continue;
		}

		if (inColumnSizeSection) {
			// Check if the indentation level changes, which might signal the end of the section
			const leadingSpaces = line.match(/^\s*/)?.[0].length ?? 0;
			if (leadingSpaces === 0 && trimmedLine !== "") {
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
	}
	return columnSizes;
}

// Assuming this is in a utility file or within the same plugin file
function updateColumnSizesInFile(
	originalContent: string,
	newSizes: Record<string, number>
): string {
	const lines = originalContent.split("\n");
	let outputLines: string[] = [];
	let inColumnSizeSection = false;

	for (const line of lines) {
		if (line.trim().startsWith("columnSize:")) {
			// Found the start of the columnSize section
			inColumnSizeSection = true;
			outputLines.push(line); // Keep the 'columnSize:' line

			// Now, add the new column sizes, each with an indentation.
			for (const key in newSizes) {
				// Use two spaces for indentation to match the original format
				outputLines.push(`  ${key}: ${newSizes[key]}`);
			}
		} else if (inColumnSizeSection && line.trim() === "") {
			// An empty line signals the end of the section
			inColumnSizeSection = false;
			outputLines.push(line);
		} else if (inColumnSizeSection) {
			// Skip the old lines in the columnSize section
			continue;
		} else {
			// For all other lines, add them to the output
			outputLines.push(line);
		}
	}
	return outputLines.join("\n");
}
