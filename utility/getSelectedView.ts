export default function getSelectedView(activeView: any) {
	const activeLeaf = activeView.activeLeaf.view.controller.viewName;
	return activeLeaf;
}
