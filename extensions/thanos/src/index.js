import { defineInterface } from '@directus/extensions-sdk';
import InterfaceComponent from './interface.vue';

export default defineInterface({
	id: 'thanos',
	name: 'Thanos',
	icon: 'hive',
	description: 'This Interface calculates data to send to Thanos',
	component: InterfaceComponent,
	group: 'other',
	options: [
		{
			field: 'route',
			name: 'Route',
			type: 'string',
			meta: {
				width: 'full',
				interface: 'input',
			},
		},
	],
	types: ['string'],
});
