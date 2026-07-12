import { isLiveTripStatus } from "./rbac";

const DAY_MS = 1000 * 60 * 60 * 24;

function normalizeDate(value) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function dateKey(value) {
  return normalizeDate(value).toISOString().split("T")[0];
}

function getTrendAnchor(expenses, fuelLogs) {
  const dates = [...expenses, ...fuelLogs]
    .map((item) => item.date || item.openedAt)
    .filter(Boolean)
    .map((value) => normalizeDate(value));

  if (dates.length === 0) {
    return normalizeDate(new Date());
  }

  return dates.sort((left, right) => right - left)[0];
}

export function buildExpenseTrend(expenses, fuelLogs, windowSize = 7) {
  const totals = new Map();

  for (const item of expenses) {
    const key = dateKey(item.date);
    totals.set(key, (totals.get(key) || 0) + Number(item.amount || 0));
  }

  for (const item of fuelLogs) {
    const key = dateKey(item.date);
    totals.set(key, (totals.get(key) || 0) + Number(item.amount || 0));
  }

  const anchor = getTrendAnchor(expenses, fuelLogs);

  return Array.from({ length: windowSize }, (_, index) => {
    const date = new Date(anchor);
    date.setDate(anchor.getDate() - (windowSize - index - 1));

    return {
      name: date.toLocaleDateString("en-US", { weekday: "short" }),
      amount: totals.get(dateKey(date)) || 0,
    };
  });
}

export function buildTransitStats({
  vehicles,
  drivers,
  trips,
  maintenance,
  expenses,
  fuelLogs,
}) {
  const activeVehicles = vehicles.filter((item) => item.status !== "Retired").length;
  const availableVehicles = vehicles.filter((item) => item.status === "Available").length;
  const inShopVehicles = vehicles.filter((item) => item.status === "In Shop").length;
  const activeTrips = trips.filter((item) => isLiveTripStatus(item.status)).length;
  const pendingTrips = trips.filter((item) => item.status === "Draft").length;
  const driversOnDuty = drivers.filter((item) => item.status === "On Trip").length;
  const dispatchReadyDrivers = drivers.filter(
    (item) =>
      item.status === "Available" && new Date(item.licenseExpiry) >= new Date(),
  ).length;
  const totalOperationalCost =
    expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0) +
    fuelLogs.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const fleetUtilization = Math.round(
    (vehicles.filter((item) => item.status === "On Trip").length /
      Math.max(
        1,
        vehicles.filter((item) => item.status !== "Retired").length,
      )) *
      100,
  );

  return {
    activeVehicles,
    availableVehicles,
    inShopVehicles,
    activeTrips,
    pendingTrips,
    driversOnDuty,
    dispatchReadyDrivers,
    totalOperationalCost,
    fleetUtilization,
    openMaintenance: maintenance.filter((item) => item.status === "Open").length,
  };
}

export function buildRecentTrips(trips, vehicles, drivers, limit = 5) {
  return trips.slice(0, limit).map((trip) => ({
    ...trip,
    vehicle: vehicles.find((item) => item.id === trip.vehicleId),
    driver: drivers.find((item) => item.id === trip.driverId),
  }));
}

export function buildVehicleStatusData(vehicles) {
  return Object.entries(
    vehicles.reduce((accumulator, vehicle) => {
      accumulator[vehicle.status] = (accumulator[vehicle.status] || 0) + 1;
      return accumulator;
    }, {}),
  ).map(([name, value]) => ({ name, value }));
}

export function buildMaintenanceStatusData(maintenance, vehicles) {
  return [
    {
      name: "OPEN",
      value: maintenance.filter((item) => item.status === "Open").length,
    },
    {
      name: "CLOSED",
      value: maintenance.filter((item) => item.status === "Closed").length,
    },
    {
      name: "DUE SOON",
      value: vehicles.filter((item) => {
        const diff =
          (new Date() - new Date(item.lastService)) / DAY_MS;
        return diff > 25 && diff < 40;
      }).length,
    },
  ];
}

export function buildLicenseWatchlist(drivers, limit = 5) {
  return drivers
    .map((driver) => {
      const daysUntilExpiry = Math.ceil(
        (normalizeDate(driver.licenseExpiry) - normalizeDate(new Date())) / DAY_MS,
      );

      return {
        ...driver,
        daysUntilExpiry,
      };
    })
    .filter((driver) => driver.daysUntilExpiry <= 30)
    .sort((left, right) => left.daysUntilExpiry - right.daysUntilExpiry)
    .slice(0, limit);
}
