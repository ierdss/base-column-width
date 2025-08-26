import {
	App,
	Editor,
	MarkdownView,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
} from "obsidian";

// Remember to rename these classes and interfaces!

interface BaseColumnWidthSettings {
	minColumnWidth: number;
	maxColumnWidth: number;
	defaultColumnWidthBehavior: string;
	customColumnWidth: number;
}

const DEFAULT_SETTINGS: BaseColumnWidthSettings = {
	minColumnWidth: 100,
	maxColumnWidth: 300,
	defaultColumnWidthBehavior: "1",
	customColumnWidth: 150,
};

export default class BaseColumnWidthPlugin extends Plugin {
	settings: BaseColumnWidthSettings;

	async onload() {
		await this.loadSettings();

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

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

		// containerEl.createEl("h5", { text: "Column Width Behavior" });

		// new Setting(containerEl)
		// 	.setName("Default Column Width Behavior")
		// 	.addDropdown((dropdown) => {
		// 		dropdown
		// 			.addOption("1", "disabled")
		// 			.addOption("2", "fit-content")
		// 			.addOption("3", "custom")
		// 			.setValue(this.plugin.settings.defaultColumnWidthBehavior)
		// 			.onChange(async (value) => {
		// 				this.plugin.settings.defaultColumnWidthBehavior = value;
		// 				await this.plugin.saveSettings();
		// 			});
		// 	});

		// new Setting(containerEl)
		// 	.setName("Custom Width")
		// 	.setDesc("Set the minimum column width for all columns in pixels.")
		// 	.addText((text) => {
		// 		text.setPlaceholder("150")
		// 			.setValue(this.plugin.settings.customColumnWidth.toString())
		// 			.onChange(async (value) => {
		// 				this.plugin.settings.customColumnWidth = Number(value);
		// 				await this.plugin.saveSettings();
		// 			});
		// 	});

		containerEl.createEl("h5", { text: "Column Width Limits" });

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
