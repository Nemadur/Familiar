import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import { getQueryClient } from "@/providers/query-client";

function QueryDevtoolsPanel() {
	const client = getQueryClient();
	return <ReactQueryDevtoolsPanel client={client} />;
}

export default {
	name: "Tanstack Query",
	render: <QueryDevtoolsPanel />,
};
