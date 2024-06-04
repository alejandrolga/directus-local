<template>
	<div class="text" :class="{ 'has-header': showHeader }">
		<div class="search-bar">
			<input type="text" v-model="tempSearchQuery" placeholder="Search items..." class="search-input" @keyup.enter="triggerSearch" />
			<select v-model="searchOption" class="search-select">
				<option value="sku">SKU</option>
				<option value="title">Title</option>
				<option value="collection">Collection</option>
			</select>
			<button @click="triggerSearch" class="search-button">Search</button>
			<button v-if="selectedCollection || searchQuery !== ''" class="search-button" @click="showCollections">←</button>
		</div>
		<div v-if="!selectedCollection && searchQuery === ''">
			<div class="table-container">
				<table class="collection-table">
					<thead>
						<tr>
							<th>All Collections</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="collection in all" :key="Object.keys(collection)[0]" @click="showItems(Object.keys(collection)[0])">
							<td>{{ Object.keys(collection)[0] }}</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
		<div v-else-if="selectedCollection">
			<div class="header">
				<h2>{{ selectedCollection }} ({{ filteredItemCount }} items)</h2>
			</div>
			<div class="table-container">
				<table class="items-table" v-if="filteredItemCount">
					<thead>
						<tr>
							<th v-for="attr in itemAttributes" :key="attr">{{ attr }}</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="item in filteredItems" :key="item.id">
							<td v-for="attr in itemAttributes" :key="attr">
								<span v-if="attr.includes('.')">{{ getNestedValue(item, attr) }}</span>
								<span v-else>{{ item[attr] }}</span>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
		<div v-else-if="searchQuery !== ''">
			<h2>Search Results ({{ filteredItemCount }} items found)</h2>
			<div class="table-container">
				<table class="search-results-table" v-if="filteredItems.length">
					<thead>
						<tr>
							<th>SKU</th>
							<th>Title</th>
							<th>Collection</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="item in filteredItems" :key="item.id">
							<td>{{ item.sku }}</td>
							<td>{{ item.title }}</td>
							<td>{{ item.collection }}</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	</div>
</template>

<script>
import { ref, watch, onMounted, computed } from 'vue';
import { createDirectus, rest, readCollections, readItems } from '@directus/sdk';

export default {
	props: {
		showHeader: {
			type: Boolean,
			default: false,
		},
		query: {
			type: String,
			default: '',
		},
		primaryKey: {
			type: [String, Number],
			default: '',
		},
		collection: {
			type: [String],
			default: '',
		},
		items: {
			type: [String],
			default: '',
		}
	},
	setup(props) {
		const query = ref('');
		const collections = ref([]);
		const items = ref([]);
		const all = ref([]);
		const selectedCollection = ref(null);
		const collectionItems = ref([]);
		const itemAttributes = ref([]);
		const searchQuery = ref('');
		const tempSearchQuery = ref(''); // Temporary storage for the search input
		const searchOption = ref('sku'); // default search option
		const filteredItems = ref([]);

		const fetchData = async () => {
			const client = createDirectus('http://0.0.0.0:8055/').with(rest());
			const resultCollections = await client.request(readCollections());

			for (let i = 0; i < resultCollections.length; i++) {
				if (resultCollections[i].meta.system === undefined) {
					collections.value.push(resultCollections[i].collection);
				}
			}

			const fetchAllItemsFromCollection = async (collectionName) => {
				const limit = 100; // Límite de elementos por petición, ajusta según sea necesario
				let allItems = [];
				let offset = 0;
				let hasMore = true;

				while (hasMore) {
					const response = await client.request(readItems(collectionName, {
						limit,
						offset,
						fields: ['*', 'related_collection.field1', 'related_collection.field2'] // Ajusta según las relaciones
					}));
					if (response.length > 0) {
						allItems = allItems.concat(response);
						offset += limit;
					} else {
						hasMore = false;
					}
				}
				return allItems;
			};

			for (let collectionName of collections.value) {
				const collectionItems = await fetchAllItemsFromCollection(collectionName);
				const collectionObject = {
					[collectionName]: []
				};

				for (let item of collectionItems) {
					item.collection = collectionName; // Add collection name to each item
					collectionObject[collectionName].push(item);
				}

				all.value.push(collectionObject);
				items.value.push(...collectionItems);
			}

		};

		const showItems = (collectionName) => {
			selectedCollection.value = collectionName;
			const collection = all.value.find(col => Object.keys(col)[0] === collectionName);
			collectionItems.value = collection[collectionName];
			itemAttributes.value = Object.keys(collectionItems.value[0] || {});
			filterItems();
		};

		const showCollections = () => {
			selectedCollection.value = null;
			collectionItems.value = [];
			itemAttributes.value = [];
			filteredItems.value = [];
			searchQuery.value = ''; // Clear search query when returning to collections
			tempSearchQuery.value = ''; // Clear temporary search input
		};

		const filterItems = () => {
			if (searchQuery.value) {
				const itemsToFilter = selectedCollection.value ? collectionItems.value : items.value;
				filteredItems.value = itemsToFilter.filter(item =>
					getNestedValue(item, searchOption.value) && getNestedValue(item, searchOption.value).toString().toLowerCase().includes(searchQuery.value.toLowerCase())
				);
			} else {
				filteredItems.value = selectedCollection.value ? collectionItems.value : [];
			}
		};

		const triggerSearch = () => {
			searchQuery.value = tempSearchQuery.value;
			filterItems();
		};

		const resetSearch = () => {
			showCollections();
			tempSearchQuery.value = ''; // Reset the search input
		};

		const filteredItemCount = computed(() => {
			return filteredItems.value.length;
		});

		const getNestedValue = (item, path) => {
			return path.split('.').reduce((acc, part) => acc && acc[part], item);
		};

		onMounted(() => { fetchData(); });
		watch(() => props.primaryKey, fetchData);
		watch(() => props.collection, fetchData);
		watch([searchQuery, selectedCollection], filterItems);

		return {
			query,
			collections,
			items,
			all,
			selectedCollection,
			collectionItems,
			itemAttributes,
			showItems,
			showCollections,
			searchQuery,
			tempSearchQuery,
			searchOption,
			filteredItems,
			triggerSearch,
			filterItems,
			resetSearch,
			filteredItemCount,
			getNestedValue
		};
	},
};
</script>

<style scoped>
.text {
	padding: 12px;
	font-family: 'Arial', sans-serif;
}

.search-bar,
.header {
	display: flex;
	align-items: center;
	margin-bottom: 20px;
}

.search-input,
.search-select,
.search-button,
.reset-button,
.back-button {
	padding: 10px;
	border-radius: 5px;
	font-size: 16px;
	border: 1px solid #ddd;
	margin-left: 10px;
}

.search-input {
	flex-grow: 1;
}

.search-select,
.search-button,
.reset-button,
.back-button {
	background-color: #336aea;
	color: white;
	cursor: pointer;
	border: none;
}

.search-button:hover,
.reset-button:hover,
.back-button:hover {
	background-color: #2a58c4;
}

.collection-table,
.items-table,
.search-results-table {
	width: 100%;
	border-collapse: collapse;
}

.collection-table th,
.collection-table td,
.items-table th,
	items-table td,
.search-results-table th,
	search-results-table td {
	padding: 8px;
	text-align: left;
	cursor: pointer;
	border: none; /* Eliminar borde */
	padding: 15px;
}

.collection-table th,
.items-table th,
.search-results-table th {
	background-color: #f2f2f2;
	color: #333;
}

.collection-table tbody tr:hover,
.items-table tbody tr:hover,
.search-results-table tbody tr:hover {
    background-color: #191d23;
}

.items-table tbody tr,
.search-results-table tbody tr {
	background-color: #0d1117;
}

.table-container {
	max-height: 700px;
	overflow-y: auto;
	border: 1px solid #ccc;
}

.header h2 {
	margin: 0 0 0 10px;
}

lookhere ::after {
	content: "";
	position: absolute;
	left: 0;
	right: 0;
	bottom: 0;
	height: 3px;
	background-color: red; /* Color gris oscuro */
}
</style>
