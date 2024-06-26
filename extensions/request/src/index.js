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
    {
      field: "format_text",
      name: "Format Text",
      type: "boolean",
      meta: {
        interface: "boolean",
        options: {
          label: "Format each label",
        },
        width: "half",
      },
    },
    {
      field: "enable_search",
      name: "Enable Search",
      type: "boolean",
      meta: {
        interface: "boolean",
        options: {
          label: "Enable search input",
        },
        width: "half",
      },
    },
  ],
  defaults: {
    format_text: true,
    enable_search: true,
  },
};
