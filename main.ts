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
		this.addSettingTab(new BaseColumnWidthSettingTab(this.app, this));

		// Adds a button on the "file-menu" and "editor-menu"
		this.registerEvent(
			this.app.workspace.on("file-menu", (menu, file: TFile) => {
				// Only add the menu item for .base files
				if (file.extension === "base") {
					menu.addItem((item) => {
						item.setTitle("Edit Column Sizes")
							.setIcon("ruler")
							.onClick(async () => {
								// Get the file content
								const fileContent = await this.app.vault.read(
									file
								);
								let initialData;
								try {
									// Parse the file content to extract column data
									initialData = parseBaseFile(fileContent);
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
									initialData
								).open();
							});
					});
					menu.addItem((item) => {
						item.setTitle("Distribute Column Sizes")
							.setIcon("ruler")
							.onClick(async () => {
								// Get the file content
								const fileContent = await this.app.vault.read(
									file
								);
								let initialData;
								try {
									// Parse the file content to extract column data
									initialData = parseBaseFile(fileContent);
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
									initialData
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
//

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

		// Get the type and make sure that type is of "table"
		// If "table", then get the "name:"
		// Get the number of columns in the "order:" array
		// Compare the number of columns in "order" to the number of entries in "columnSize"
		// If columnSize does not exist, create it with default values as 150 from settings
		// If columnSize exists, read the values and populate the modal with them
		// If columnSize has fewer entries than order, add the missing ones with default values
		// Display the column names and their sizes in the modal

		// Iterate over the keys of the initial data object.
		// This will create a setting for each column found in the file.
		for (const key in this.initialData) {
			if (Object.prototype.hasOwnProperty.call(this.initialData, key)) {
				new Setting(contentEl).setName(key).addText((text) =>
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

// TODO: Make into a reusable function
// TODO: Make startsWith as a string parameter
/**
 * Parses a custom YAML-like file content to extract column sizes from the 'columnSize' section.
 * This function is designed to handle a specific file format where column sizes are listed
 * as key-value pairs under a 'columnSize:' heading.
 * * @param content The entire file content as a single string.
 * @returns A Record (or a map) of column names to their integer sizes.
 */
function parseBaseFile(content: string): Record<string, number> {
	// Split the entire file content into an array of individual lines.
	const lines = content.split("\n");

	// A flag to keep track of whether the parser is currently inside the 'columnSize' section.
	// TODO: Make into a neutral flag
	let inColumnSizeSection = false;

	// An object to store the extracted column name and size pairs.
	const columnSizes: Record<string, number> = {};

	// Loop through each line of the file.
	for (const line of lines) {
		// Remove leading/trailing whitespace from the current line for easier comparison.
		const trimmedLine = line.trim();

		// Check if the current line is the start of the 'columnSize' section.
		if (trimmedLine.startsWith("columnSize:")) {
			// Set the flag to true, so subsequent lines will be processed.
			inColumnSizeSection = true;
			// Move to the next line without processing this one.
			continue;
		}

		// Only run this block if the parser is currently inside the 'columnSize' section.
		if (inColumnSizeSection) {
			// Check the indentation level of the current line.
			// This is a common way to detect the end of a YAML block.
			// TODO: Make regex detect empty space orr "- type:" as the end of the block
			const leadingSpaces = line.match(/^\s*/)?.[0].length ?? 0;

			// If the indentation returns to zero (and the line isn't empty),
			// it signifies that the 'columnSize' section has ended.
			if (leadingSpaces === 0 && trimmedLine !== "") {
				// Set the flag to false to stop processing lines for this section.
				inColumnSizeSection = false;
				// Move to the next line.
				continue;
			}

			// Split the line at the colon to separate the key (column name) and the value (size).
			const parts = trimmedLine.split(":").map((part) => part.trim());

			// Ensure the line has a key and a value (e.g., "key: value").
			if (parts.length === 2) {
				const key = parts[0]; // The column name (e.g., "file.name").
				const value = parseInt(parts[1], 10); // The size, converted to an integer.

				// Check if the value is a valid number.
				if (!isNaN(value)) {
					// Add the key-value pair to our results object.
					columnSizes[key] = value;
				}
			}
		}
	}

	// Return the final object containing all the extracted column sizes.
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
				outputLines.push(`      ${key}: ${newSizes[key]}`);
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
