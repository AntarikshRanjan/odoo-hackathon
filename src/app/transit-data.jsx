import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  expenseTrend,
  initialDrivers,
  initialExpenses,
  initialFuelLogs,
  initialMaintenance,
  initialTrips,
  initialVehicles,
} from "../data/mock-data";
import {
  onAuthChange,
  logOut as firebaseLogOut,
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  signInWithGithub,
  resetPassword,
  updateUserProfile,
} from "../lib/auth";
import { saveUserProfile, getUserProfile } from "../lib/firestore";

const TransitDataContext = createContext(null);

function createId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export function TransitDataProvider({ children }) {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthChange(async (user) => {
      if (user) {
        // Save user profile to Firestore if new
        await saveUserProfile(user);
        // Fetch full profile from Firestore
        const profile = await getUserProfile(user.uid);
        setSession({
          uid: user.uid,
          name: profile?.displayName || user.displayName || "",
          email: user.email,
          role: profile?.role || "Operations Lead",
          photoURL: user.photoURL || "",
        });
      } else {
        setSession(null);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);
  const [theme, setTheme] = useState(
    () => window.localStorage.getItem("transitops-theme") || "dark",
  );
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [drivers, setDrivers] = useState(initialDrivers);
  const [trips, setTrips] = useState(initialTrips);
  const [maintenance, setMaintenance] = useState(initialMaintenance);
  const [fuelLogs, setFuelLogs] = useState(initialFuelLogs);
  const [expenses, setExpenses] = useState(initialExpenses);
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

  useEffect(() => {
    window.localStorage.setItem("transitops-settings", JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    window.localStorage.setItem("transitops-rbac", JSON.stringify(rbacMatrix));
  }, [rbacMatrix]);

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

  async function login({ email, password, method }) {
    try {
      if (method === "google") {
        await signInWithGoogle();
      } else if (method === "github") {
        await signInWithGithub();
      } else {
        if (!email || !password) {
          return { ok: false, message: "Enter your email and password to continue." };
        }
        await signInWithEmail(email, password);
      }
      return { ok: true };
    } catch (error) {
      const message = error.message.includes("auth/")
        ? "Authentication failed. Check your credentials and try again."
        : error.message;
      return { ok: false, message };
    }
  }

  async function signup({ email, password, displayName }) {
    try {
      if (!email || !password) {
        return { ok: false, message: "Enter your email and password to continue." };
      }
      await signUpWithEmail(email, password, displayName);
      return { ok: true };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  }

  async function forgotPassword(email) {
    try {
      if (!email) return { ok: false, message: "Enter your email address." };
      await resetPassword(email);
      return { ok: true };
    } catch (error) {
      return { ok: false, message: "Failed to send reset email." };
    }
  }

  async function logout() {
    await firebaseLogOut();
    pushToast({
      title: "Signed out.",
      description: "Your control tower session is closed.",
    });
  }

  function addVehicle(payload) {
    const nextVehicle = {
      id: createId("VH"),
      status: "Available",
      lastService: new Date().toISOString(),
      ...payload,
    };
    setVehicles((current) => [nextVehicle, ...current]);
    pushToast({
      title: "Vehicle added.",
      description: `${nextVehicle.regNumber} is ready for dispatch.`,
    });
  }

  function addDriver(payload) {
    const nextDriver = {
      id: createId("DR"),
      status: "Available",
      ...payload,
    };
    setDrivers((current) => [nextDriver, ...current]);
    pushToast({
      title: "Driver added.",
      description: `${nextDriver.name} is now part of the dispatch pool.`,
    });
  }

  function createTrip(payload) {
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

  function updateTripStatus(tripId, status) {
    const trip = trips.find((item) => item.id === tripId);
    if (!trip) return;

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

  function logMaintenance(payload) {
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

    setMaintenance((current) => [nextRecord, ...current]);
    setVehicles((current) =>
      current.map((item) =>
        item.id === payload.vehicleId ? { ...item, status: "In Shop" } : item,
      ),
    );
    setExpenses((current) => [
      {
        id: createId("EX"),
        date: new Date().toISOString(),
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

  function closeMaintenance(recordId) {
    const record = maintenance.find((item) => item.id === recordId);
    if (!record) return;

    const vehicle = vehicles.find((item) => item.id === record.vehicleId);

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

  function addFuelLog(payload) {
    const nextLog = { id: createId("FL"), ...payload };
    setFuelLogs((current) => [nextLog, ...current]);

    // Update vehicle odometer if provided and higher
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

  function addExpense(payload) {
    const nextExpense = {
      id: createId("EX"),
      date: new Date().toISOString().split('T')[0],
      ...payload,
    };
    setExpenses((current) => [nextExpense, ...current]);
    pushToast({
      title: "Expense logged.",
      description: `Logged ${payload.category} expense of ${formatCurrency(payload.amount)}.`,
    });
  }

  function updateSettings(payload) {
    setSettingsState((current) => ({ ...current, ...payload }));
    pushToast({
      title: "Settings updated.",
      description: "Depot settings saved successfully.",
    });
  }

  function updateRBACMatrix(role, page, value) {
    setRbacMatrixState((current) => {
      const next = { ...current };
      next[role] = { ...next[role], [page]: value };
      return next;
    });
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
    authLoading,
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
    signup,
    forgotPassword,
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
