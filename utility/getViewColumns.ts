export default function getViewColumns(activeView: any) {
	const columnsArr =
		activeView.activeLeaf.view.controller.view.data.config.order;
	return columnsArr;
}
