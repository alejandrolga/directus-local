<template>
    <v-card-actions>
        <v-card-text>
            <v-info type="info">{{ filteredResults.length }} filtered items</v-info>
        </v-card-text>

        <search-input v-model="searchQuery" collection="motion_graphic" placeholder="Search Items..." v-model:filter="filter"
            @update:filter="handleFilterUpdate" />
        <template #append>
            <v-button @click="clearFilters">{{ t('clear_filters') }}</v-button>
        </template>
    </v-card-actions>

    <v-table class="directus-container" :headers="tableHeaders" :items="filteredResults"
        :server-items-length="filteredResults.length" item-value="id" :loading="loading" @click:row="handleRowClick"
        fixed-header show-resize allow-header-reorder>
        <template #header-context-menu="{ header }">
            <v-list>
                <v-list-item clickable @click="onSortChange(header.value, false)">
                    <v-list-item-content> Sort Ascending </v-list-item-content>
                    <v-icon name="sort" class="flip" />
                </v-list-item>
                <v-list-item clickable @click="onSortChange(header.value, true)">
                    <v-list-item-content> Sort Descending </v-list-item-content>
                    <v-icon name="sort" />
                </v-list-item>
            </v-list>
        </template>
    </v-table>
</template>

<script>
import SearchInput from './search-input.vue';
import FilterApplier from './filterApplier'; // Importamos la clase FilterApplier

export default {
    props: {
        query_sql: {
            type: String,
            default: "",
        },
    },
    components: {
        SearchInput
    },
    data() {
        return {
            query: this.query_sql,
            result: [],
            searchQuery: "",
            filter: {}, // Añadido para almacenar los filtros
            infoMessage: "",
            tableHeaders: [],
            loading: false,
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
        searchQuery(newQuery) {
            localStorage.setItem('searchQuery', newQuery || "");
            this.executeQuery();
        },
        filter: {
            deep: true,
            handler() {
                this.executeQuery();
            },
        },
    },
    computed: {
        filteredResults() {
            console.log("Applying filter:", this.filter);
            if (!this.searchQuery && !Object.keys(this.filter).length) {
                return this.result;
            }
            return this.result.filter(item => {
                const matchesSearchQuery = !this.searchQuery || Object.values(item).some(value =>
                    value != null && String(value).includes(this.searchQuery)
                );
                const matchesFilter = !Object.keys(this.filter).length || FilterApplier.applyFilter(item, this.filter);
                return matchesSearchQuery && matchesFilter;
            });
        }
    },
    methods: {
        async executeQuery() {
            this.infoMessage = "";
            this.loading = true;
            try {
                const response = await fetch("/request/7kQ9dF2vX6bM3rL8wA4jZ5nH1pT0cY7", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ variable: this.query, filter: this.filter || {} }),
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
                resizable: true,
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
        handleRowClick({ item }) {
            this.$router.push(`/content/motion_graphic/${item.id}`);
        },
        clearSearch() {
            this.searchQuery = "";
        },
        handleFilterUpdate(newFilter) {
            this.filter = newFilter || {};
        },
        clearFilters() {
            this.filter = {};
            this.searchQuery = "";
        },
    },
    mounted() {
        this.executeQuery();

        const savedSearchQuery = localStorage.getItem('searchQuery');
        this.searchQuery = savedSearchQuery !== null ? savedSearchQuery : "";
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
