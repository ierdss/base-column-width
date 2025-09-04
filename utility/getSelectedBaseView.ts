export default function getSelectedBaseView() {
	const activeLeaf = this.app.workspace.activeLeaf;
	const activeView = activeLeaf?.view;
	if (activeView && activeView.type === "markdown") {
		// The current view is a Markdown editor
		// You can now access properties like activeView.file
		const currentFile = activeView.file;
	}
	return null;
}
