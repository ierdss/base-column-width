export default function getViewColumns(activeView: any) {
	const columnsArr =
		activeView.activeLeaf.view.controller.view.data.config.order;
	const allColumns: Record<string, number> = {};
	columnsArr.forEach((item: string) => {
		allColumns[item] = 0;
	});
	return allColumns;
}
