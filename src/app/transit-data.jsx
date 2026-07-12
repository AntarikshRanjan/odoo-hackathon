import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  initialDrivers,
  initialExpenses,
  initialFuelLogs,
  initialMaintenance,
  initialTrips,
  initialVehicles,
} from "../lib/mock-fallback-data";
import {
  DEFAULT_RBAC_MATRIX,
  DEMO_PASSWORD,
  ROLE_PROFILES,
  canAccessPermission,
  canManagePermission,
  findProfileForCredentials,
  getPermissionLevel,
  isLiveTripStatus,
} from "../lib/rbac";
import { buildExpenseTrend, buildTransitStats } from "../lib/transit-selectors";
import { formatCurrency } from "../lib/utils";

const TransitDataContext = createContext(null);
const API_BASE = "http://localhost:8000/api";

function createId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

async function safeJsonFetch(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}

async function tryBackendWrite(url, payload, options = {}) {
  try {
    await fetch(url, {
      method: options.method || "POST",
      headers: { "Content-Type": "application/json" },
      body: payload === undefined ? undefined : JSON.stringify(payload),
    });
  } catch (error) {
    console.error("Backend write failed:", error);
  }
}

export function TransitDataProvider({ children }) {
  const [session, setSession] = useState(() => {
    const raw = window.localStorage.getItem("transitops-session");
    return raw ? JSON.parse(raw) : null;
  });
  const [theme, setTheme] = useState(
    () => window.localStorage.getItem("transitops-theme") || "dark",
  );
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [vehicles, setVehicles] = useState(() => {
    const raw = window.localStorage.getItem("transitops-vehicles");
    return raw ? JSON.parse(raw) : initialVehicles;
  });
  const [drivers, setDrivers] = useState(() => {
    const raw = window.localStorage.getItem("transitops-drivers");
    return raw ? JSON.parse(raw) : initialDrivers;
  });
  const [trips, setTrips] = useState(() => {
    const raw = window.localStorage.getItem("transitops-trips");
    return raw ? JSON.parse(raw) : initialTrips;
  });
  const [maintenance, setMaintenance] = useState(() => {
    const raw = window.localStorage.getItem("transitops-maintenance");
    return raw ? JSON.parse(raw) : initialMaintenance;
  });
  const [fuelLogs, setFuelLogs] = useState(() => {
    const raw = window.localStorage.getItem("transitops-fuel-logs");
    return raw ? JSON.parse(raw) : initialFuelLogs;
  });
  const [expenses, setExpenses] = useState(() => {
    const raw = window.localStorage.getItem("transitops-expenses");
    return raw ? JSON.parse(raw) : initialExpenses;
  });
  const [toasts, setToasts] = useState([]);
  const [settings, setSettingsState] = useState(() => {
    const raw = window.localStorage.getItem("transitops-settings");
    return raw
      ? JSON.parse(raw)
      : {
          depotName: "Central Depot Mumbai",
          currency: "₹",
          distanceUnit: "km",
        };
  });
  const [rbacMatrix, setRbacMatrixState] = useState(() => {
    const raw = window.localStorage.getItem("transitops-rbac");
    return raw ? JSON.parse(raw) : DEFAULT_RBAC_MATRIX;
  });

  useEffect(() => {
    async function loadBackendData() {
      try {
        const [
          nextVehicles,
          nextDrivers,
          nextTrips,
          nextMaintenance,
          nextFuelLogs,
          nextExpenses,
          nextSettings,
          nextRbac,
        ] = await Promise.all([
          safeJsonFetch(`${API_BASE}/vehicles`),
          safeJsonFetch(`${API_BASE}/drivers`),
          safeJsonFetch(`${API_BASE}/trips`),
          safeJsonFetch(`${API_BASE}/maintenance`),
          safeJsonFetch(`${API_BASE}/fuel-logs`),
          safeJsonFetch(`${API_BASE}/expenses`),
          safeJsonFetch(`${API_BASE}/settings`),
          safeJsonFetch(`${API_BASE}/rbac`),
        ]);

        setVehicles(nextVehicles);
        setDrivers(nextDrivers);
        setTrips(nextTrips);
        setMaintenance(nextMaintenance);
        setFuelLogs(nextFuelLogs);
        setExpenses(nextExpenses);
        setSettingsState((current) => ({ ...current, ...nextSettings }));
        setRbacMatrixState(nextRbac);
      } catch (error) {
        console.warn(
          "Backend not running or failed; continuing with fallback data.",
          error,
        );
      }
    }

    loadBackendData();
  }, []);

  useEffect(() => {
    window.localStorage.setItem("transitops-settings", JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    window.localStorage.setItem("transitops-rbac", JSON.stringify(rbacMatrix));
  }, [rbacMatrix]);

  useEffect(() => {
    if (session) {
      window.localStorage.setItem("transitops-session", JSON.stringify(session));
    } else {
      window.localStorage.removeItem("transitops-session");
    }
  }, [session]);

  useEffect(() => {
    window.localStorage.setItem("transitops-vehicles", JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    window.localStorage.setItem("transitops-drivers", JSON.stringify(drivers));
  }, [drivers]);

  useEffect(() => {
    window.localStorage.setItem("transitops-trips", JSON.stringify(trips));
  }, [trips]);

  useEffect(() => {
    window.localStorage.setItem("transitops-maintenance", JSON.stringify(maintenance));
  }, [maintenance]);

  useEffect(() => {
    window.localStorage.setItem("transitops-fuel-logs", JSON.stringify(fuelLogs));
  }, [fuelLogs]);

  useEffect(() => {
    window.localStorage.setItem("transitops-expenses", JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    window.localStorage.setItem("transitops-theme", theme);
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  function pushToast({
    title,
    description,
    variant = "default",
  }) {
    const id = createId("toast");
    setToasts((current) => [...current, { id, title, description, variant }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 4200);
  }

  function dismissToast(id) {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }

  async function login({ email, password, remember, role }) {
    if (!email || !password || !role) {
      return {
        ok: false,
        message: "Choose a role, then enter your email and password to continue.",
      };
    }

    const profile = findProfileForCredentials(email, role);

    if (!profile || password !== DEMO_PASSWORD) {
      return {
        ok: false,
        message: "Invalid credentials for the selected role. Use the demo account assigned to that role.",
      };
    }

    setSession({
      name: profile.name,
      role: profile.role,
      email: profile.email,
      remember,
    });

    return { ok: true };
  }

  function logout() {
    setSession(null);
    setVehicles([]);
    setDrivers([]);
    setTrips([]);
    setMaintenance([]);
    setFuelLogs([]);
    setExpenses([]);
    pushToast({
      title: "Signed out.",
      description: "Your control tower session is closed.",
    });
  }

  async function addVehicle(payload) {
    const nextVehicle = {
      id: createId("VH"),
      status: "Available",
      lastService: new Date().toISOString().split("T")[0],
      acqCost: Number(payload.acqCost || 0),
      ...payload,
    };

    await tryBackendWrite(`${API_BASE}/vehicles`, nextVehicle);
    setVehicles((current) => [nextVehicle, ...current]);
    pushToast({
      title: "Vehicle added.",
      description: `${nextVehicle.regNumber} is ready for dispatch.`,
    });
  }

  async function addDriver(payload) {
    const nextDriver = {
      id: createId("DR"),
      status: "Available",
      licenseCategory: payload.licenseCategory || "Transport",
      contactNumber: payload.contactNumber || "",
      ...payload,
    };

    await tryBackendWrite(`${API_BASE}/drivers`, nextDriver);
    setDrivers((current) => [nextDriver, ...current]);
    pushToast({
      title: "Driver added.",
      description: `${nextDriver.name} is now part of the dispatch pool.`,
    });
  }

  async function createTrip(payload) {
    const vehicle = vehicles.find((item) => item.id === payload.vehicleId);
    const driver = drivers.find((item) => item.id === payload.driverId);
    const nextStatus = payload.status || "Draft";

    if (!vehicle || !driver) {
      return { ok: false, message: "Choose an available vehicle and driver." };
    }

    if (payload.cargoWeightKg > vehicle.capacityKg) {
      return {
        ok: false,
        message: `Cargo exceeds vehicle capacity (${vehicle.capacityKg} kg max).`,
      };
    }

    if (nextStatus === "Dispatched") {
      if (vehicle.status !== "Available") {
        return { ok: false, message: "Vehicle is not available for dispatch." };
      }

      if (driver.status !== "Available") {
        return { ok: false, message: "Driver is not available for dispatch." };
      }

      if (new Date(driver.licenseExpiry) < new Date()) {
        return {
          ok: false,
          message: "License has expired — update it before assigning this driver.",
        };
      }
    }

    const nextTrip = {
      id: `TR-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`,
      status: nextStatus,
      departureDate:
        nextStatus === "Dispatched"
          ? new Date().toISOString()
          : payload.departureDate || null,
      createdAt: new Date().toISOString(),
      ...payload,
    };

    await tryBackendWrite(`${API_BASE}/trips`, nextTrip);
    setTrips((current) => [nextTrip, ...current]);

    if (nextStatus === "Dispatched") {
      setVehicles((current) =>
        current.map((item) =>
          item.id === payload.vehicleId ? { ...item, status: "On Trip" } : item,
        ),
      );
      setDrivers((current) =>
        current.map((item) =>
          item.id === payload.driverId ? { ...item, status: "On Trip" } : item,
        ),
      );
      pushToast({
        title: "Trip dispatched.",
        description: `${vehicle.regNumber} and ${driver.name} are now live.`,
      });
    } else {
      pushToast({
        title: "Trip saved as draft.",
        description: `${vehicle.regNumber} is planned, but not dispatched yet.`,
      });
    }

    return { ok: true };
  }

  async function updateTripStatus(tripId, status) {
    const trip = trips.find((item) => item.id === tripId);
    if (!trip) return { ok: false, message: "Trip not found." };

    if (status === "Dispatched") {
      const vehicle = vehicles.find((item) => item.id === trip.vehicleId);
      const driver = drivers.find((item) => item.id === trip.driverId);

      if (!vehicle || !driver) {
        pushToast({
          title: "Dispatch blocked.",
          description: "The selected vehicle or driver is missing from the live registry.",
          variant: "danger",
        });
        return { ok: false, message: "Vehicle or driver record is missing." };
      }

      if (vehicle.status !== "Available") {
        pushToast({
          title: "Dispatch blocked.",
          description: `${vehicle.regNumber} is no longer available.`,
          variant: "danger",
        });
        return { ok: false, message: "Vehicle is not available for dispatch." };
      }

      if (driver.status !== "Available" || new Date(driver.licenseExpiry) < new Date()) {
        pushToast({
          title: "Dispatch blocked.",
          description: `${driver.name} is no longer dispatch-ready.`,
          variant: "danger",
        });
        return { ok: false, message: "Driver is not available for dispatch." };
      }
    }

    await tryBackendWrite(
      `${API_BASE}/trips/${tripId}/status`,
      { status },
      { method: "PUT" },
    );

    setTrips((current) =>
      current.map((item) =>
        item.id === tripId
          ? {
              ...item,
              status,
              departureDate:
                status === "Dispatched"
                  ? new Date().toISOString()
                  : item.departureDate,
            }
          : item,
      ),
    );

    if (isLiveTripStatus(status)) {
      setVehicles((current) =>
        current.map((item) =>
          item.id === trip.vehicleId ? { ...item, status: "On Trip" } : item,
        ),
      );
      setDrivers((current) =>
        current.map((item) =>
          item.id === trip.driverId ? { ...item, status: "On Trip" } : item,
        ),
      );
    }

    if (status === "Completed" || status === "Cancelled") {
      setVehicles((current) =>
        current.map((item) =>
          item.id === trip.vehicleId && item.status === "On Trip"
            ? { ...item, status: "Available" }
            : item,
        ),
      );
      setDrivers((current) =>
        current.map((item) =>
          item.id === trip.driverId && item.status === "On Trip"
            ? { ...item, status: "Available" }
            : item,
        ),
      );
    }

    pushToast({
      title:
        status === "Dispatched"
          ? "Trip dispatched."
          : status === "Completed"
            ? "Trip completed."
            : "Trip cancelled.",
      description: `${trip.id} updated to ${status}.`,
    });

    return { ok: true };
  }

  async function dispatchTrip(payload) {
    return createTrip({ ...payload, status: "Dispatched" });
  }

  async function completeTrip(tripId, data) {
    const trip = trips.find((item) => item.id === tripId);
    if (!trip) return;

    setTrips((current) =>
      current.map((item) =>
        item.id === tripId
          ? {
              ...item,
              actualDistance: Number(data.actualDistance) || 0,
              actualDistanceKm: Number(data.actualDistance) || 0,
              finalOdometer: Number(data.finalOdometer) || 0,
              finalOdometerKm: Number(data.finalOdometer) || 0,
              fuelConsumed: Number(data.fuelUsed) || 0,
              fuelUsedLiters: Number(data.fuelUsed) || 0,
              arrivalTime: data.arrivalTime || null,
              completionNotes: data.notes || "",
            }
          : item,
      ),
    );

    if (data.fuelUsed) {
      const fuelCost = Number(data.fuelUsed) * 1.5; // Mock fuel cost
      await addFuelLog({
        date: new Date().toISOString().split("T")[0],
        vehicleId: trip.vehicleId,
        liters: Number(data.fuelUsed),
        amount: fuelCost,
        odometer: Number(data.finalOdometer) || 0,
      });

      await addExpense({
        category: "Fuel",
        amount: fuelCost,
        vehicleId: trip.vehicleId,
        tripId: tripId,
      });
    }

    await updateTripStatus(tripId, "Completed");
  }

  async function cancelTrip(tripId) {
    return updateTripStatus(tripId, "Cancelled");
  }

  function getAvailableVehicles() {
    return vehicles.filter(
      (v) => v.status === "Available" && !["In Shop", "Retired"].includes(v.status),
    );
  }

  function getAvailableDrivers() {
    return drivers.filter((d) => {
      const validLicense = new Date(d.licenseExpiry) >= new Date();
      return d.status === "Available" && validLicense && d.status !== "Suspended";
    });
  }

  function validateTrip(form) {
    const vehicle = vehicles.find((v) => v.id === form.vehicleId);
    const driver = drivers.find((d) => d.id === form.driverId);

    const isVehicleValid =
      vehicle?.status === "Available" && !["In Shop", "Retired"].includes(vehicle.status);
    const validLicense = driver ? new Date(driver.licenseExpiry) >= new Date() : false;
    const isDriverValid =
      driver?.status === "Available" && validLicense && driver?.status !== "Suspended";
    const capacityExceeded = vehicle && Number(form.cargoWeightKg) > vehicle.capacityKg;

    return {
      isValid:
        Boolean(form.vehicleId) &&
        Boolean(form.driverId) &&
        isVehicleValid &&
        isDriverValid &&
        !capacityExceeded,
      vehicle,
      driver,
      capacityExceeded,
    };
  }

  function calculateFuelEfficiency() {
    const completedTrips = trips.filter(
      (trip) => trip.status === "Completed" && Number(trip.fuelUsedLiters) > 0,
    );

    if (completedTrips.length === 0) {
      return "0 km/L";
    }

    const totalDistance = completedTrips.reduce(
      (sum, trip) => sum + Number(trip.actualDistanceKm || trip.plannedDistance || 0),
      0,
    );
    const totalFuel = completedTrips.reduce(
      (sum, trip) => sum + Number(trip.fuelUsedLiters || 0),
      0,
    );

    if (totalFuel === 0) {
      return "0 km/L";
    }

    return `${(totalDistance / totalFuel).toFixed(1)} km/L`;
  }

  function calculateOperationalCost(tripId) {
    const tripExpenses = expenses.filter(e => e.tripId === tripId);
    return tripExpenses.reduce((sum, item) => sum + item.amount, 0);
  }

  async function logMaintenance(payload) {
    const vehicle = vehicles.find((item) => item.id === payload.vehicleId);
    if (!vehicle) {
      return { ok: false, message: "Choose a vehicle to log maintenance." };
    }

    const nextRecord = {
      id: createId("MT"),
      openedAt: new Date().toISOString(),
      status: "Open",
      ...payload,
    };

    await tryBackendWrite(`${API_BASE}/maintenance`, nextRecord);
    setMaintenance((current) => [nextRecord, ...current]);
    setVehicles((current) =>
      current.map((item) =>
        item.id === payload.vehicleId ? { ...item, status: "In Shop" } : item,
      ),
    );
    setExpenses((current) => [
      {
        id: "EX-" + nextRecord.id.substring(3),
        date: new Date().toISOString().split("T")[0],
        category: "Maintenance",
        amount: payload.cost,
        vehicleId: payload.vehicleId,
      },
      ...current,
    ]);
    pushToast({
      title: "Maintenance opened.",
      description: `${vehicle.model} moved to In Shop.`,
    });

    return { ok: true };
  }

  async function closeMaintenance(recordId) {
    const record = maintenance.find((item) => item.id === recordId);
    if (!record) return;

    const vehicle = vehicles.find((item) => item.id === record.vehicleId);

    await tryBackendWrite(
      `${API_BASE}/maintenance/${recordId}/resolve`,
      undefined,
      { method: "PUT" },
    );

    setMaintenance((current) =>
      current.map((item) =>
        item.id === recordId ? { ...item, status: "Closed" } : item,
      ),
    );
    setVehicles((current) =>
      current.map((item) =>
        item.id === record.vehicleId && item.status === "In Shop"
          ? { ...item, status: "Available" }
          : item,
      ),
    );
    pushToast({
      title: "Maintenance closed.",
      description: `${vehicle?.regNumber || "Vehicle"} is back in service.`,
    });
  }

  async function addFuelLog(payload) {
    const nextLog = { id: createId("FL"), ...payload };
    await tryBackendWrite(`${API_BASE}/fuel-logs`, nextLog);

    setFuelLogs((current) => [nextLog, ...current]);

    if (payload.odometer && payload.vehicleId) {
      setVehicles((current) =>
        current.map((item) =>
          item.id === payload.vehicleId && Number(payload.odometer) > item.odometerKm
            ? { ...item, odometerKm: Number(payload.odometer) }
            : item,
        ),
      );
    }

    pushToast({
      title: "Fuel logged.",
      description: `Added fuel record of ${payload.liters}L (${formatCurrency(payload.amount)}).`,
    });
  }

  async function addExpense(payload) {
    const nextExpense = {
      id: createId("EX"),
      date: new Date().toISOString().split("T")[0],
      ...payload,
    };

    await tryBackendWrite(`${API_BASE}/expenses`, nextExpense);
    setExpenses((current) => [nextExpense, ...current]);
    pushToast({
      title: "Expense logged.",
      description: `Logged ${payload.category} expense of ${formatCurrency(payload.amount)}.`,
    });
  }

  async function updateSettings(payload) {
    await tryBackendWrite(`${API_BASE}/settings`, payload);
    setSettingsState((current) => ({ ...current, ...payload }));
    pushToast({
      title: "Settings updated.",
      description: "Depot settings saved successfully.",
    });
  }

  async function updateRBACMatrix(role, page, value) {
    const nextMatrix = {
      ...rbacMatrix,
      [role]: { ...rbacMatrix[role], [page]: value },
    };

    await tryBackendWrite(`${API_BASE}/rbac`, nextMatrix);
    setRbacMatrixState(nextMatrix);
    pushToast({
      title: "RBAC Matrix updated.",
      description: `Permissions for ${role} changed.`,
    });
  }

  function setSessionRole(role) {
    setSession((current) => {
      if (!current) return current;
      return { ...current, role };
    });
    pushToast({
      title: "Simulated role switched.",
      description: `Active context is now ${role}.`,
    });
  }

  function getAccessLevel(permissionKey, role = session?.role) {
    return getPermissionLevel(rbacMatrix, role, permissionKey);
  }

  function canAccess(permissionKey, role = session?.role) {
    return canAccessPermission(rbacMatrix, role, permissionKey);
  }

  function canManage(permissionKey, role = session?.role) {
    return canManagePermission(rbacMatrix, role, permissionKey);
  }

  const expenseTrend = buildExpenseTrend(expenses, fuelLogs);
  const stats = buildTransitStats({
    vehicles,
    drivers,
    trips,
    maintenance,
    expenses,
    fuelLogs,
  });

  const value = {
    session,
    theme,
    setTheme,
    sidebarCollapsed,
    setSidebarCollapsed,
    vehicles,
    drivers,
    trips,
    maintenance,
    fuelLogs,
    expenses,
    expenseTrend,
    toasts,
    dismissToast,
    login,
    logout,
    addVehicle,
    addDriver,
    createTrip,
    updateTripStatus,
    logMaintenance,
    closeMaintenance,
    addFuelLog,
    addExpense,
    settings,
    rbacMatrix,
    roleProfiles: ROLE_PROFILES,
    updateSettings,
    updateRBACMatrix,
    setSessionRole,
    getAccessLevel,
    canAccess,
    canManage,
    pushToast,
    stats,
    dispatchTrip,
    completeTrip,
    cancelTrip,
    getAvailableVehicles,
    getAvailableDrivers,
    validateTrip,
    calculateFuelEfficiency,
    calculateOperationalCost,
  };

  return (
    <TransitDataContext.Provider value={value}>
      {children}
    </TransitDataContext.Provider>
  );
}

export function useTransitData() {
  const context = useContext(TransitDataContext);
  if (!context) {
    throw new Error("useTransitData must be used within TransitDataProvider");
  }
  return context;
}
