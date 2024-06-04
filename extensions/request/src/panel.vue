
<template>
	<v-card-title>
		<h4>Results ({{ result.length }} items)</h4>
	</v-card-title>
	<v-table class="elevation-1 table directus-container"
	:headers="tableHeaders"
	:items="result"
	:server-items-length="result.length"
	item-value="id"
	:loading="loading"
	@click:row="handleRowClick"
	show-resize
	fixed-header
	>
		<template #header-context-menu="{ header }">
			<v-list>
				<v-list-item clickable @click="onSortChange(header.value, false)">
					<v-list-item-content> Sort Ascending </v-list-item-content>
					<v-icon name="sort" class="flip"/>
				</v-list-item>
				<v-list-item clickable @click="onSortChange(header.value, true)">
					<v-list-item-content> Sort Descending </v-list-item-content>
					<v-icon name="sort" />
				</v-list-item>
			</v-list>
		</template>
		<template #v-slot:no-data>
			<v-alert :value="true" color="error" icon="mdi-alert">
				No results found.
			</v-alert>
		</template>
	</v-table>
</template>

<script>
//show-resize
export default {
	props: {
		query_sql: {
			type: String,
			default: "",
		},
	},
	data() {
		return {
			query: this.query_sql,
			result: [],
			infoMessage: "",
			tableHeaders: [],
			loading: false,
			tableSort: null,
		};
	},
	watch: {
		query_sql: {
			immediate: true,
			handler(newQuery) {
				this.query = newQuery;
				this.executeQuery();
			},
		},
	},
	methods: {
		async executeQuery() {
			this.infoMessage = "";
			this.loading = true;
			try {
				const response = await fetch("/my-extension/post", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ variable: this.query }),
				});
				if (!response.ok) {
					throw new Error("Invalid SQL request");
				}
				const data = await response.json();
				this.result = Array.isArray(data) ? data : [];
				if (this.result.length === 0) {
					this.infoMessage = "No results found.";
				} else {
					this.tableHeaders = this.getHeaders(this.result);
				}
			} catch (error) {
				console.error("Error executing query:", error);
				this.infoMessage = "Error executing query.";
				this.result = [];
			} finally {
				this.loading = false;
			}
		},
		getHeaders(data) {
			if (data.length === 0) return [];
			const keys = Object.keys(data[0]);
			return keys.map((key) => ({
				text: key,
				value: key,
				sortable: true,
				width: "250",
			}));
		},
		onSortChange(by, desc) {
			this.result.sort((a, b) => {
				const aValue = a[by];
				const bValue = b[by];
				if (aValue < bValue) return desc ? 1 : -1;
				if (aValue > bValue) return desc ? -1 : 1;
				return 0;
			});
		},
		handleRowClick(item) {
			//console.log("item:", item);
		},
	},
	mounted() {
		this.executeQuery();
	},
};
</script>

<style scoped>
.directus-container {
	max-width: 100%;
	max-height: 100%;
	overflow-x: auto;
	overflow-y: auto;
}

.flip {
	transform: scaleY(-1);
}
</style>
