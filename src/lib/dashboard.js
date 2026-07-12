export const DASHBOARD_ROLE_COPY = {
  "Fleet Manager": {
    eyebrow: "Fleet command",
    summary: "Watch asset availability, workshop load, and utilization across the network.",
  },
  Dispatcher: {
    eyebrow: "Dispatch command",
    summary: "Prioritize pending trips, active dispatches, and ready-to-assign capacity.",
  },
  "Safety Officer": {
    eyebrow: "Compliance watch",
    summary: "Track driver readiness, expiring licenses, and active movement risk.",
  },
  "Financial Analyst": {
    eyebrow: "Cost control",
    summary: "Review spend, trip volume, and operational efficiency from a finance lens.",
  },
};

export const DASHBOARD_CARD_ORDER = {
  "Fleet Manager": [
    "activeVehicles",
    "availableVehicles",
    "inShopVehicles",
    "fleetUtilization",
    "activeTrips",
    "pendingTrips",
  ],
  Dispatcher: [
    "activeTrips",
    "pendingTrips",
    "availableVehicles",
    "driversOnDuty",
    "dispatchReadyDrivers",
    "fleetUtilization",
  ],
  "Safety Officer": [
    "driversOnDuty",
    "dispatchReadyDrivers",
    "activeTrips",
    "pendingTrips",
    "availableVehicles",
    "inShopVehicles",
  ],
  "Financial Analyst": [
    "totalOperationalCost",
    "fleetUtilization",
    "activeTrips",
    "pendingTrips",
    "activeVehicles",
    "availableVehicles",
  ],
};

export const DASHBOARD_CARD_META = {
  activeVehicles: {
    label: "ACTIVE VEHICLES",
    note: "Non-retired vehicles currently in the network.",
    permissionKey: "fleet",
  },
  availableVehicles: {
    label: "AVAILABLE VEHICLES",
    note: "Units ready for assignment right now.",
    permissionKey: "fleet",
  },
  inShopVehicles: {
    label: "VEHICLES IN MAINTENANCE",
    note: "Vehicles currently blocked by service work.",
    permissionKey: "maintenance",
  },
  activeTrips: {
    label: "ACTIVE TRIPS",
    note: "Trips currently dispatched and in motion.",
    permissionKey: "trips",
    pulse: true,
  },
  pendingTrips: {
    label: "PENDING TRIPS",
    note: "Draft trips waiting for final dispatch.",
    permissionKey: "trips",
  },
  driversOnDuty: {
    label: "DRIVERS ON DUTY",
    note: "Drivers currently marked as on-trip.",
    permissionKey: "drivers",
  },
  dispatchReadyDrivers: {
    label: "READY DRIVERS",
    note: "Available drivers with valid licenses.",
    permissionKey: "drivers",
  },
  fleetUtilization: {
    label: "FLEET UTILIZATION",
    note: "Share of active fleet currently generating movement.",
    permissionKey: "fleet",
    suffix: "%",
  },
  totalOperationalCost: {
    label: "OPERATIONAL COST",
    note: "Fuel and expense spend in the current window.",
    permissionKey: "fuelExpenses",
    format: "currency",
  },
};
