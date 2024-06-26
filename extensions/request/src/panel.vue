<template>
    <v-card-actions>
      <v-card-text>
        <v-info type="info">{{ infoMessage }}</v-info>
      </v-card-text>
  
      <search-input v-if="enable_search" v-model="searchQuery" collection="motion_graphic" placeholder="Search Items..." v-model:filter="filter"
        @update:filter="handleFilterUpdate" />
      <template #append>
        <v-button @click="clearFilters">{{ t('clear_filters') }}</v-button>
      </template>
    </v-card-actions>
    <v-table class="directus-container" :headers="formattedHeaders" :items="formattedResults"
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
      <template v-slot:item="{ item }">
        <tr>
          <td>{{ format_text ? formatTitle(item.name) : item.name }}</td>
          <td>{{ format_text ? formatDate(item.date) : item.date }}</td>
          <td>{{ format_text ? formatCurrency(item.balance) : item.balance }}</td>
          <!-- Otros campos -->
        </tr>
      </template>
    </v-table>
  </template>
  
  <script>
  import SearchInput from './search-input.vue';
  import FilterApplier from './filterApplier';
  import { formatTitle } from '@directus/format-title';
  import { getUserName } from './getUserName';
  
  export default {
    props: {
      query_sql: {
        type: String,
        default: "",
      },
      format_text: {
        type: Boolean,
        default: true,
      },
      enable_search: {
        type: Boolean,
        default: true,
      }
    },
    components: {
      SearchInput
    },
    data() {
      return {
        query: this.query_sql,
        result: [],
        formattedResults: [],
        searchQuery: "",
        filter: {},
        infoMessage: "",
        tableHeaders: [],
        loading: false,
        userCache: {}
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
        this.updateInfoMessage();
        this.executeQuery();
      },
      filter: {
        deep: true,
        handler(newFilter) {
          localStorage.setItem('filter', JSON.stringify(newFilter));
          this.updateInfoMessage();
          this.executeQuery();
        },
      },
      format_text(newVal) {
        this.updateFormattedResults();
      }
    },
    computed: {
      filteredResults() {
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
      },
      formattedHeaders() {
        if (!this.format_text) {
          return this.tableHeaders;
        }
        return this.tableHeaders.map(header => ({
          ...header,
          text: formatTitle(header.value)
        }));
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
            this.tableHeaders = this.formatHeaders(Object.keys(this.result[0]));
            await this.updateFormattedResults();
          }
          this.updateInfoMessage();
        } catch (error) {
          console.error("Error executing query:", error);
          this.infoMessage = "Error executing query.";
          this.result = [];
        } finally {
          this.loading = false;
        }
      },
      async updateFormattedResults() {
        const results = await Promise.all(this.filteredResults.map(async item => {
          const newItem = { ...item };
          const userFields = Object.keys(newItem).filter(key => key.toLowerCase().includes('user'));
          for (const field of userFields) {
            if (newItem[field]) {
              const userName = await getUserName(newItem[field]);
              if (userName) {
                newItem[field] = this.format_text ? userName : newItem[field];
              }
            }
          }
          this.convertDates(newItem);
          return newItem;
        }));
        this.formattedResults = results;
      },
      convertDates(item) {
        const dateFields = Object.keys(item).filter(key => key.toLowerCase().includes('date'));
        dateFields.forEach(field => {
          if (item[field] && !isNaN(item[field])) {
            item[field] = this.format_text ? new Date(parseInt(item[field])).toISOString() : item[field];
          }
        });
      },
      onSortChange(by, desc) {
        this.result = this.result.sort((a, b) => {
          const aValue = a[by];
          const bValue = b[by];
          if (aValue < bValue) return desc ? 1 : -1;
          if (aValue > bValue) return desc ? -1 : 1;
          return 0;
        });
        this.updateFormattedResults();
      },
      handleRowClick({ item }) {
        this.$router.push(`/content/motion_graphic/${item.id}`);
      },
      clearSearch() {
        this.searchQuery = "";
        this.updateInfoMessage();
      },
      handleFilterUpdate(newFilter) {
        this.filter = newFilter || {};
        console.log(this.filter)
        this.updateInfoMessage();
      },
      clearFilters() {
        this.filter = {};
        this.searchQuery = "";
        localStorage.removeItem('filter');
        this.executeQuery();
      },
      loadStoredFilters() {
        const storedFilter = localStorage.getItem('filter');
        const storedSearchQuery = localStorage.getItem('searchQuery');
        if (storedFilter) {
          this.filter = JSON.parse(storedFilter);
        }
        if (storedSearchQuery) {
          this.searchQuery = storedSearchQuery;
        }
        this.updateInfoMessage();
      },
      formatHeaders(headers) {
        return headers.map(header => ({
          text: formatTitle(header),
          value: header,
          sortable: true,
          resizable: true,
          width: "250",
        }));
      },
      updateInfoMessage() {
        if (!this.enable_search) {
          this.infoMessage = `${this.result.length} items`;
        } else if (this.searchQuery || Object.keys(this.filter).length) {
          this.infoMessage = `${this.filteredResults.length} filtered items`;
        } else {
          this.infoMessage = `${this.result.length} items`;
        }
      }
    },
    mounted() {
      this.loadStoredFilters();
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
  