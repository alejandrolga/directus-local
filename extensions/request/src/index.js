// src/extensions/panel/index.js
import PanelComponent from './panel.vue';

export default {
  id: 'custom-sql-panel',
  name: 'Custom SQL Panel',
  icon: 'box', // Puedes elegir cualquier icono que quieras
  component: PanelComponent,
  options: [
    {
			field: 'query_sql',
			name: 'Query',
			type: 'string',
			meta: {
				interface: 'input-multiline',
				width: 'full',
			},
		},
	],
};
/*
	options: [
		{
			field: 'start_date',
			name: 'Start Date',
			type: 'dateTime',
			meta: {
				interface: 'textArea',
				width: 'half',
			},
		},
    {
			field: 'end_date',
			name: 'End Date',
			type: 'dateTime',
			meta: {
				interface: 'textArea',
				width: 'half',
			},
		},
    {
			field: 'query_sql',
			name: 'Query',
			type: 'string',
			meta: {
				interface: 'input-multiline',
				width: 'full',
			},
		},
	],
};
*/