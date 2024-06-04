import PanelComponent from './panel.vue';

export default {
	id: 'query',
	name: 'Query',
	icon: 'database',
	description: 'This is my custom panel!',
	component: PanelComponent,
	options: [
		{
			field: 'query',
			name: 'SQL Query',
			type: 'string',
			meta: {
				interface: 'input',
				width: 'full',
			},
		},

	],
	minWidth: 12,
	minHeight: 8,
};
