import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
const expenseTrend = [
  { name: "Jan", cost: 12000 },
  { name: "Feb", cost: 14500 },
  { name: "Mar", cost: 13200 },
  { name: "Apr", cost: 16800 },
  { name: "May", cost: 15400 },
  { name: "Jun", cost: 17100 },
];

const TransitDataContext = createContext(null);

function createId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
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
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [fuelLogs, setFuelLogs] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [settings, setSettingsState] = useState(() => {
    const raw = window.localStorage.getItem("transitops-settings");
    return raw ? JSON.parse(raw) : {
      depotName: 'Central Depot Mumbai',
      currency: '₹',
      distanceUnit: 'km'
    };
  });

  const [rbacMatrix, setRbacMatrixState] = useState(() => {
    const raw = window.localStorage.getItem("transitops-rbac");
    const defaultMatrix = {
      'Operations Lead': { fleet: 'full', drivers: 'full', trips: 'full', fuelExpenses: 'full', analytics: 'full', maintenance: 'full' },
      'Fleet Manager': { fleet: 'full', drivers: 'full', trips: 'none', fuelExpenses: 'none', analytics: 'view', maintenance: 'full' },
      'Dispatcher': { fleet: 'view', drivers: 'none', trips: 'full', fuelExpenses: 'none', analytics: 'none', maintenance: 'none' },
      'Safety Officer': { fleet: 'none', drivers: 'full', trips: 'view', fuelExpenses: 'none', analytics: 'none', maintenance: 'none' },
      'Financial Analyst': { fleet: 'view', drivers: 'none', trips: 'none', fuelExpenses: 'full', analytics: 'full', maintenance: 'none' }
    };
    return raw ? JSON.parse(raw) : defaultMatrix;
  });

  const API_BASE = "http://localhost:8000/api";

  // Fetch initial data from PostgreSQL backend on mount
  useEffect(() => {
    async function loadBackendData() {
      try {
        const [vehiclesRes, driversRes, tripsRes, maintRes, fuelRes, expRes, settingsRes, rbacRes] = await Promise.all([
          fetch(`${API_BASE}/vehicles`).then((r) => r.ok ? r.json() : Promise.reject()),
          fetch(`${API_BASE}/drivers`).then((r) => r.ok ? r.json() : Promise.reject()),
          fetch(`${API_BASE}/trips`).then((r) => r.ok ? r.json() : Promise.reject()),
          fetch(`${API_BASE}/maintenance`).then((r) => r.ok ? r.json() : Promise.reject()),
          fetch(`${API_BASE}/fuel-logs`).then((r) => r.ok ? r.json() : Promise.reject()),
          fetch(`${API_BASE}/expenses`).then((r) => r.ok ? r.json() : Promise.reject()),
          fetch(`${API_BASE}/settings`).then((r) => r.ok ? r.json() : Promise.reject()),
          fetch(`${API_BASE}/rbac`).then((r) => r.ok ? r.json() : Promise.reject())
        ]);
        setVehicles(vehiclesRes);
        setDrivers(driversRes);
        setTrips(tripsRes);
        setMaintenance(maintRes);
        setFuelLogs(fuelRes);
        setExpenses(expRes);
        setSettingsState(settingsRes);
        setRbacMatrixState(rbacRes);
      } catch (err) {
        console.warn("Backend not running or failed; falling back to mock data.", err);
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

  function login({ email, password, remember }) {
    if (!email || !password) {
      return { ok: false, message: "Enter your email and password to continue." };
    }

    setSession({
      name: "Ava Singh",
      role: "Operations Lead",
      email,
      remember,
    });

    return { ok: true };
  }

  function logout() {
    setSession(null);
    pushToast({
      title: "Signed out.",
      description: "Your control tower session is closed.",
    });
  }

  async function addVehicle(payload) {
    const nextVehicle = {
      id: createId("VH"),
      status: "Available",
      lastService: new Date().toISOString().split('T')[0],
      ...payload,
    };
    try {
      await fetch(`${API_BASE}/vehicles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextVehicle),
      });
    } catch (err) {
      console.error("Backend write failed:", err);
    }
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
      ...payload,
    };
    try {
      await fetch(`${API_BASE}/drivers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextDriver),
      });
    } catch (err) {
      console.error("Backend write failed:", err);
    }
    setDrivers((current) => [nextDriver, ...current]);
    pushToast({
      title: "Driver added.",
      description: `${nextDriver.name} is now part of the dispatch pool.`,
    });
  }

  async function createTrip(payload) {
    const vehicle = vehicles.find((item) => item.id === payload.vehicleId);
    const driver = drivers.find((item) => item.id === payload.driverId);

    if (!vehicle || !driver) {
      return { ok: false, message: "Choose an available vehicle and driver." };
    }

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

    if (payload.cargoWeightKg > vehicle.capacityKg) {
      return {
        ok: false,
        message: `Cargo exceeds vehicle capacity (${vehicle.capacityKg} kg max).`,
      };
    }

    const nextTrip = {
      id: `TR-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`,
      status: "Dispatched",
      departureDate: new Date().toISOString(),
      ...payload,
    };

    try {
      await fetch(`${API_BASE}/trips`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextTrip),
      });
    } catch (err) {
      console.error("Backend write failed:", err);
    }

    setTrips((current) => [nextTrip, ...current]);
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

    return { ok: true };
  }

  async function updateTripStatus(tripId, status) {
    const trip = trips.find((item) => item.id === tripId);
    if (!trip) return;

    try {
      await fetch(`${API_BASE}/trips/${tripId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
    } catch (err) {
      console.error("Backend update failed:", err);
    }

    setTrips((current) =>
      current.map((item) => (item.id === tripId ? { ...item, status } : item)),
    );

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
      title: status === "Completed" ? "Trip completed." : "Trip cancelled.",
      description: `${trip.id} updated across the dispatch board.`,
    });
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

    try {
      await fetch(`${API_BASE}/maintenance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextRecord),
      });
    } catch (err) {
      console.error("Backend write failed:", err);
    }

    setMaintenance((current) => [nextRecord, ...current]);
    setVehicles((current) =>
      current.map((item) =>
        item.id === payload.vehicleId ? { ...item, status: "In Shop" } : item,
      ),
    );
    setExpenses((current) => [
      {
        id: "EX-" + nextRecord.id.substring(3),
        date: new Date().toISOString().split('T')[0],
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

    try {
      await fetch(`${API_BASE}/maintenance/${recordId}/resolve`, {
        method: "PUT",
      });
    } catch (err) {
      console.error("Backend resolve failed:", err);
    }

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
    try {
      await fetch(`${API_BASE}/fuel-logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextLog),
      });
    } catch (err) {
      console.error("Backend write failed:", err);
    }

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
      date: new Date().toISOString().split('T')[0],
      ...payload,
    };
    try {
      await fetch(`${API_BASE}/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextExpense),
      });
    } catch (err) {
      console.error("Backend write failed:", err);
    }

    setExpenses((current) => [nextExpense, ...current]);
    pushToast({
      title: "Expense logged.",
      description: `Logged ${payload.category} expense of ${formatCurrency(payload.amount)}.`,
    });
  }

  async function updateSettings(payload) {
    try {
      await fetch(`${API_BASE}/settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error("Backend settings write failed:", err);
    }
    setSettingsState((current) => ({ ...current, ...payload }));
    pushToast({
      title: "Settings updated.",
      description: "Depot settings saved successfully.",
    });
  }

  async function updateRBACMatrix(role, page, value) {
    const nextMatrix = { ...rbacMatrix };
    nextMatrix[role] = { ...nextMatrix[role], [page]: value };
    try {
      await fetch(`${API_BASE}/rbac`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextMatrix),
      });
    } catch (err) {
      console.error("Backend RBAC write failed:", err);
    }
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

  const stats = {
    activeTrips: trips.filter((item) => item.status === "Dispatched").length,
    availableVehicles: vehicles.filter((item) => item.status === "Available").length,
    inShopVehicles: vehicles.filter((item) => item.status === "In Shop").length,
    availableDrivers: drivers.filter((item) => item.status === "Available").length,
    dispatchReadyDrivers: drivers.filter(
      (item) =>
        item.status === "Available" && new Date(item.licenseExpiry) >= new Date(),
    ).length,
    totalOperationalCost:
      expenses.reduce((sum, item) => sum + item.amount, 0) +
      fuelLogs.reduce((sum, item) => sum + item.amount, 0),
  };

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
    updateSettings,
    updateRBACMatrix,
    setSessionRole,
    pushToast,
    stats,
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
