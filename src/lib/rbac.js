export const ROLE_PROFILES = [
  {
    role: "Fleet Manager",
    name: "Fleet Manager User",
    email: "manager@transitops.io",
  },
  {
    role: "Dispatcher",
    name: "Dispatcher User",
    email: "dispatch@transitops.io",
  },
  {
    role: "Safety Officer",
    name: "Safety Officer User",
    email: "safety@transitops.io",
  },
  {
    role: "Financial Analyst",
    name: "Financial Analyst User",
    email: "finance@transitops.io",
  },
];

export const DEMO_PASSWORD = "demo123";

export const DEFAULT_RBAC_MATRIX = {
  "Fleet Manager": {
    fleet: "full",
    drivers: "view",
    trips: "view",
    fuelExpenses: "view",
    analytics: "view",
    maintenance: "full",
  },
  Dispatcher: {
    fleet: "view",
    drivers: "view",
    trips: "full",
    fuelExpenses: "none",
    analytics: "none",
    maintenance: "none",
  },
  "Safety Officer": {
    fleet: "view",
    drivers: "full",
    trips: "view",
    fuelExpenses: "none",
    analytics: "none",
    maintenance: "none",
  },
  "Financial Analyst": {
    fleet: "view",
    drivers: "none",
    trips: "view",
    fuelExpenses: "full",
    analytics: "full",
    maintenance: "view",
  },
};

export const ROUTE_TITLES = {
  "/dashboard": "Dashboard",
  "/fleet": "Fleet",
  "/drivers": "Drivers",
  "/trips": "Trips",
  "/maintenance": "Maintenance",
  "/expenses": "Fuel & Expenses",
  "/analytics": "Analytics & Reports",
  "/settings": "Settings",
};

export const ROUTE_PERMISSION_KEYS = {
  "/dashboard": null,
  "/fleet": "fleet",
  "/drivers": "drivers",
  "/trips": "trips",
  "/maintenance": "maintenance",
  "/expenses": "fuelExpenses",
  "/analytics": "analytics",
  "/settings": null,
};

export const LIVE_TRIP_STATUSES = ["Dispatched"];

export const TRIP_LIFECYCLE = ["Draft", "Dispatched", "Completed", "Cancelled"];

export const TRIP_STATUS_TRANSITIONS = {
  Draft: ["Dispatched", "Cancelled"],
  Dispatched: ["Completed", "Cancelled"],
  Completed: [],
  Cancelled: [],
};

export function getRoleNames() {
  return ROLE_PROFILES.map((profile) => profile.role);
}

export function getPermissionLevel(matrix, role, permissionKey) {
  if (!permissionKey) {
    return "full";
  }

  return matrix?.[role]?.[permissionKey] || "none";
}

export function canAccessPermission(matrix, role, permissionKey) {
  return getPermissionLevel(matrix, role, permissionKey) !== "none";
}

export function canManagePermission(matrix, role, permissionKey) {
  return getPermissionLevel(matrix, role, permissionKey) === "full";
}

export function canAccessRoute(matrix, role, pathname) {
  return canAccessPermission(matrix, role, ROUTE_PERMISSION_KEYS[pathname]);
}

export function getDefaultRouteForRole(matrix, role) {
  return (
    Object.keys(ROUTE_PERMISSION_KEYS).find((pathname) =>
      canAccessRoute(matrix, role, pathname),
    ) || "/dashboard"
  );
}

export function findProfileByRole(role) {
  return ROLE_PROFILES.find((profile) => profile.role === role) || null;
}

export function findProfileForCredentials(email, role) {
  return (
    ROLE_PROFILES.find(
      (profile) =>
        profile.role === role &&
        profile.email.toLowerCase() === email.trim().toLowerCase(),
    ) || null
  );
}

export function isLiveTripStatus(status) {
  return LIVE_TRIP_STATUSES.includes(status);
}
