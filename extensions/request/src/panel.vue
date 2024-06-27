<template>
  <v-card-actions>
    <v-card-text>
      <v-info type="info">{{ infoMessage }}</v-info>
    </v-card-text>

    <search-input
      v-if="enable_search"
      v-model="searchQuery"
      collection="motion_graphic"
      placeholder="Search Items..."
      v-model:filter="filter"
      @update:filter="handleFilterUpdate"
    />
    <template #append>
      <v-button @click="clearFilters">{{ t('clear_filters') }}</v-button>
    </template>
  </v-card-actions>
  <v-table
    class="directus-container"
    :headers="formattedHeaders"
    :items="formattedResults"
    :server-items-length="formattedResults.length"
    item-value="id"
    :loading="loading"
    @click:row="handleRowClick"
    fixed-header
    show-resize
    allow-header-reorder
  >
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
      </tr>
    </template>
  </v-table>
</template>

<script>
import SearchInput from './search-input.vue';
import FilterApplier from './filterApplier';
import { formatTitle } from '@directus/format-title';
import { createDirectus, rest, readUser } from '@directus/sdk';
import debounce from 'lodash/debounce';
import { USER_FIELDS, BASE_CONTENT_URL, DIRECTUS_URL, USER_CREATED_KEY, USER_UPDATED_KEY } from './globals';

const client = createDirectus(DIRECTUS_URL).with(rest());

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
      userUUIDs: [], // Array para almacenar los UUIDs únicos de los usuarios visibles en los resultados
      userData: {} // Objeto para almacenar los datos de los usuarios
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
    searchQuery: debounce(function(newQuery) {
      this.updateInfoMessage();
      this.executeQuery();
      this.saveState();
    }, 300), // Retraso de 300 ms
    filter: {
      deep: true,
      handler(newFilter) {
        this.updateInfoMessage();
        this.executeQuery();
        this.saveState();
      },
    },
    format_text(newVal) {
      this.updateFormattedResults();
    }
  },
  computed: {
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

      // Validación de la consulta SQL
      if (!this.validateSQLQuery(this.query)) {
        this.infoMessage = "Cannot be executed for security reasons.";
        this.loading = false;
        return;
      }

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
    validateSQLQuery(query) {
      const forbiddenWords = [
        'ALTER TABLE', 'UPDATE', 'DELETE', 'INSERT INTO', 'CREATE DATABASE',
        'DROP DATABASE', 'BACKUP DATABASE', 'CREATE TABLE', 'DROP TABLE',
        'TRUNCATE', 'EXEC', 'EXECUTE', 'INSERT', 'UPDATE', 'DELETE', 'DROP',
        'TRUNCATE', 'ALTER', 'CREATE', 'EXECUTE', 'GRANT', 'REVOKE'
      ];

      const lowerCaseQuery = query.toLowerCase();
      for (const word of forbiddenWords) {
        if (lowerCaseQuery.includes(word.toLowerCase())) {
          return false;
        }
      }
      return true;
    },
    async fetchUserDetails(userUUIDs) {
      const validUUIDs = userUUIDs.filter(uuid => typeof uuid === 'string' && uuid.trim().length > 0);
      try {
        const userData = await Promise.all(
          validUUIDs.map(uuid => client.request(readUser(uuid, { fields: USER_FIELDS })))
        );
        this.userData = validUUIDs.reduce((acc, uuid, index) => {
          acc[uuid] = userData[index];
          return acc;
        }, {});
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    },
    async applyFilters() {
      if (!this.searchQuery && !Object.keys(this.filter).length) {
        return this.result;
      }

      const filtered = this.result.filter(item => {
        const matchesSearchQuery = !this.searchQuery || Object.values(item).some(value =>
          value != null && String(value).includes(this.searchQuery)
        );
        return matchesSearchQuery;
      });

      // Comprobar si los filtros requieren detalles de usuario
      const requiresUserDetails = this.doesFilterRequireUserDetails(this.filter);

      if (requiresUserDetails) {
        // Actualizar los UUIDs únicos de los usuarios en los resultados filtrados y mostrarlos en consola
        const userUUIDs = Array.from(new Set(filtered.flatMap(item => [item[USER_CREATED_KEY], item[USER_UPDATED_KEY]])));
        this.userUUIDs = userUUIDs;

        // Realizar la consulta para obtener los datos de los usuarios
        await this.fetchUserDetails(this.userUUIDs);

        // Agregar datos del usuario a cada ítem filtrado
        filtered.forEach(item => {
          item[USER_CREATED_KEY] = this.userData[item[USER_CREATED_KEY]] || { id: item[USER_CREATED_KEY] };
          item[USER_UPDATED_KEY] = this.userData[item[USER_UPDATED_KEY]] || { id: item[USER_UPDATED_KEY] };
        });
      }

      // Aplicar filtros
      const finalFiltered = filtered.filter(item => {
        return FilterApplier.applyFilter(item, this.filter);
      });

      return finalFiltered;
    },
    doesFilterRequireUserDetails(filter) {
      if (filter._and) {
        return filter._and.some(subFilter => this.doesFilterRequireUserDetails(subFilter));
      }
      if (filter._or) {
        return filter._or.some(subFilter => this.doesFilterRequireUserDetails(subFilter));
      }
      for (const key in filter) {
        if (typeof filter[key] === 'object' && filter[key] !== null) {
          if (key === USER_CREATED_KEY || key === USER_UPDATED_KEY) {
            return true;
          }
          if (this.doesFilterRequireUserDetails(filter[key])) {
            return true;
          }
        }
      }
      return false;
    },
    async updateFormattedResults() {
      const filtered = await this.applyFilters();  // Esperar a que se apliquen los filtros
      const results = filtered.map(item => {
        const newItem = { ...item };
        this.convertDates(newItem);
        return newItem;
      });
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
      this.$router.push(`${BASE_CONTENT_URL}/${item.id}`);
    },
    clearSearch() {
      this.searchQuery = "";
      this.updateInfoMessage();
      this.saveState();
    },
    handleFilterUpdate(newFilter) {
      this.filter = newFilter || {};
      this.updateFormattedResults();
      this.updateInfoMessage();
      this.saveState();
    },
    clearFilters() {
      this.filter = {};
      this.searchQuery = "";
      this.executeQuery();
      this.saveState();
    },
    loadStoredFilters() {
      const storedFilter = localStorage.getItem('filter');
      const storedSearchQuery = localStorage.getItem('searchQuery');
      if (storedFilter) {
        this.filter = JSON.parse(storedFilter);
      }
      if (storedSearchQuery) {
        this.searchQuery = storedSearchQuery !== 'null' ? storedSearchQuery : '';
      }
      this.updateInfoMessage();
    },
    saveState() {
      localStorage.setItem('filter', JSON.stringify(this.filter));
      localStorage.setItem('searchQuery', this.searchQuery || '');
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
        this.infoMessage = `${this.formattedResults.length} filtered items`;
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
