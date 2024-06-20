// src/extensions/panel/index.js
import PanelComponent from "./panel.vue";

export default {
	id: "custom-sql-panel",
	name: "KPI's Monitoring",
	icon: "content_paste_search",
	component: PanelComponent,
	options: [
		{
			field: "query_sql",
			name: "SQL Request",
			type: "string",
			meta: {
				interface: "input-code",
				options: {
					language: "sql",
				},
			},
		},
	],
};