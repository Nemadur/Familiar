import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";

function QueryDevtoolsPanel() {
	return <ReactQueryDevtoolsPanel />;
}

export default {
	name: "Tanstack Query",
	render: <QueryDevtoolsPanel />,
};
