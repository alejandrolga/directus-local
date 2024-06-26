// src/extensions/panel/index.js
import PanelComponent from "./panel.vue";

async function fetchUserRole() {
  try {
    const response = await fetch("/users/me", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch current user");
    }
    const user = await response.json();
    return user.data.role;
  } catch (error) {
    console.error("Error fetching current user role:", error);
    return null;
  }
}

const role = await fetchUserRole();
const isAdmin = role && role.id !== "8c7d4496-e59a-4736-9c20-b3d416a449c6";


function getReadOnlyStatus(isAdmin) {
  return !isAdmin;
}
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
        readonly: getReadOnlyStatus(isAdmin),
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
        readonly: getReadOnlyStatus(isAdmin),
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
        readonly: getReadOnlyStatus(isAdmin),
      },
    },
  ],
  defaults: {
    format_text: true,
    enable_search: true,
  },
};