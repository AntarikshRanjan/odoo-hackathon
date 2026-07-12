import { useMemo } from "react";
import { useTransitData } from "../../app/transit-data";

const REVENUE_PER_TRIP = 1200;
const COMPLIANCE_WARN_DAYS = 30;

function daysBetween(a, b) {
  return Math.round((new Date(b) - new Date(a)) / (1000 * 60 * 60 * 24));
}

function safeDiv(num, den) {
  return den > 0 ? num / den : 0;
}

export function useAnalytics(filters = {}) {
  const { vehicles, drivers, trips, maintenance, fuelLogs, expenses } = useTransitData();

  const {
    dateFrom,
    dateTo,
    vehicleType,
    vehicleStatus,
    driverStatus,
    tripStatus,
    region,
  } = filters;

  const filtered = useMemo(() => {
    let fv = [...vehicles];
    let fd = [...drivers];
    let ft = [...trips];
    let fm = [...maintenance];
    let ffl = [...fuelLogs];
    let fe = [...expenses];

    if (vehicleType && vehicleType !== "all") {
      fv = fv.filter((v) => v.type === vehicleType);
      const vids = new Set(fv.map((v) => v.id));
      ft = ft.filter((t) => vids.has(t.vehicleId));
      fm = fm.filter((m) => vids.has(m.vehicleId));
      ffl = ffl.filter((f) => vids.has(f.vehicleId));
      fe = fe.filter((e) => vids.has(e.vehicleId));
    }

    if (vehicleStatus && vehicleStatus !== "all") {
      fv = fv.filter((v) => v.status === vehicleStatus);
      const vids = new Set(fv.map((v) => v.id));
      ft = ft.filter((t) => vids.has(t.vehicleId));
      fm = fm.filter((m) => vids.has(m.vehicleId));
      ffl = ffl.filter((f) => vids.has(f.vehicleId));
      fe = fe.filter((e) => vids.has(e.vehicleId));
    }

    if (region && region !== "all") {
      fv = fv.filter((v) => v.region === region);
      fd = fd.filter((d) => d.region === region);
      const vids = new Set(fv.map((v) => v.id));
      const dids = new Set(fd.map((d) => d.id));
      ft = ft.filter((t) => vids.has(t.vehicleId) || dids.has(t.driverId));
      fm = fm.filter((m) => vids.has(m.vehicleId));
      ffl = ffl.filter((f) => vids.has(f.vehicleId));
      fe = fe.filter((e) => vids.has(e.vehicleId));
    }

    if (driverStatus && driverStatus !== "all") {
      fd = fd.filter((d) => d.status === driverStatus);
      const dids = new Set(fd.map((d) => d.id));
      ft = ft.filter((t) => dids.has(t.driverId));
    }

    if (tripStatus && tripStatus !== "all") {
      ft = ft.filter((t) => t.status === tripStatus);
    }

    if (dateFrom) {
      const from = new Date(dateFrom);
      ft = ft.filter((t) => new Date(t.departureDate) >= from);
      ffl = ffl.filter((f) => new Date(f.date) >= from);
      fe = fe.filter((e) => new Date(e.date) >= from);
      fm = fm.filter((m) => new Date(m.openedAt) >= from);
    }

    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      ft = ft.filter((t) => new Date(t.departureDate) <= to);
      ffl = ffl.filter((f) => new Date(f.date) <= to);
      fe = fe.filter((e) => new Date(e.date) <= to);
      fm = fm.filter((m) => new Date(m.openedAt) <= to);
    }

    return { fv, fd, ft, fm, ffl, fe };
  }, [vehicles, drivers, trips, maintenance, fuelLogs, expenses, dateFrom, dateTo, vehicleType, vehicleStatus, driverStatus, tripStatus, region]);

  const { fv, fd, ft, fm, ffl, fe } = filtered;

  const kpis = useMemo(() => {
    const activeVehicles = fv.filter((v) => v.status === "On Trip").length;
    const availableVehicles = fv.filter((v) => v.status === "Available").length;
    const vehiclesInMaintenance = fv.filter((v) => v.status === "In Shop").length;
    const totalActiveFleet = fv.filter((v) => v.status !== "Retired").length;
    const activeTrips = ft.filter((t) => t.status === "Dispatched").length;
    const pendingTrips = ft.filter((t) => t.status === "Draft").length;
    const driversOnDuty = fd.filter((d) => d.status === "On Trip").length;
    const fleetUtilization = totalActiveFleet > 0 ? Math.round((activeVehicles / totalActiveFleet) * 100) : 0;
    const fuelCost = ffl.reduce((s, f) => s + (f.amount || 0), 0);
    const maintenanceCost = fm.reduce((s, m) => s + (m.cost || 0), 0);
    const otherExpenses = fe.reduce((s, e) => s + (e.amount || 0), 0);
    const operationalCost = fuelCost + maintenanceCost + otherExpenses;

    const completedTrips = ft.filter((t) => t.status === "Completed");
    const totalRevenue = completedTrips.length * REVENUE_PER_TRIP;
    const vehicleROI = operationalCost > 0 ? ((totalRevenue - operationalCost) / operationalCost).toFixed(2) : "0.00";

    return {
      activeVehicles,
      availableVehicles,
      vehiclesInMaintenance,
      totalActiveFleet,
      activeTrips,
      pendingTrips,
      driversOnDuty,
      fleetUtilization,
      fuelCost,
      maintenanceCost,
      operationalCost,
      vehicleROI,
      totalRevenue,
    };
  }, [fv, fd, ft, fm, ffl, fe]);

  const sparklines = useMemo(() => {
    const dateMap = {};
    ft.forEach((t) => {
      const d = t.departureDate?.split("T")[0] || t.departureDate?.split(" ")[0];
      if (!d) return;
      if (!dateMap[d]) dateMap[d] = { trips: 0, completed: 0, fuel: 0, cost: 0 };
      dateMap[d].trips++;
      if (t.status === "Completed") dateMap[d].completed++;
    });
    ffl.forEach((f) => {
      const d = f.date?.split("T")[0] || f.date;
      if (!d) return;
      if (!dateMap[d]) dateMap[d] = { trips: 0, completed: 0, fuel: 0, cost: 0 };
      dateMap[d].fuel += f.amount || 0;
    });
    fe.forEach((e) => {
      const d = e.date?.split("T")[0] || e.date;
      if (!d) return;
      if (!dateMap[d]) dateMap[d] = { trips: 0, completed: 0, fuel: 0, cost: 0 };
      dateMap[d].cost += e.amount || 0;
    });

    const dates = Object.keys(dateMap).sort();
    const base = fv.filter((v) => v.status !== "Retired").length || 1;

    const fuelEffTrend = dates.map((d) => ({
      name: d.slice(5),
      value: dateMap[d].trips > 0 ? +(dateMap[d].completed / Math.max(1, dateMap[d].trips) * 15).toFixed(1) : 0,
    }));

    const utilTrend = dates.map((d, i) => {
      const cumulative = dates.slice(0, i + 1).reduce((s, dd) => s + dateMap[dd].trips, 0);
      return { name: d.slice(5), value: Math.min(100, Math.round((cumulative / Math.max(1, base)) * 25)) };
    });

    const costTrend = dates.map((d) => ({
      name: d.slice(5),
      value: +(dateMap[d].fuel + dateMap[d].cost).toFixed(0),
    }));

    let runningROI = 1;
    const roiTrend = dates.map((d) => {
      const rev = dateMap[d].completed * REVENUE_PER_TRIP;
      const cost = dateMap[d].fuel + dateMap[d].cost;
      if (cost > 0) runningROI = +((rev + runningROI * cost) / cost).toFixed(2);
      return { name: d.slice(5), value: runningROI };
    });

    return {
      fuelEfficiency: fuelEffTrend.length ? fuelEffTrend : [{ name: "Now", value: 0 }],
      fleetUtilization: utilTrend.length ? utilTrend : [{ name: "Now", value: kpis.fleetUtilization }],
      operationalCost: costTrend.length ? costTrend : [{ name: "Now", value: kpis.operationalCost }],
      vehicleROI: roiTrend.length ? roiTrend : [{ name: "Now", value: Number(kpis.vehicleROI) || 0 }],
    };
  }, [ft, ffl, fe, fv, kpis.fleetUtilization, kpis.operationalCost, kpis.vehicleROI]);

  const vehicleStatusDistribution = useMemo(() => {
    const counts = {};
    fv.forEach((v) => { counts[v.status] = (counts[v.status] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [fv]);

  const fuelEfficiencyByVehicle = useMemo(() => {
    return fv
      .filter((v) => v.status !== "Retired")
      .map((v) => {
        const vLogs = ffl.filter((f) => f.vehicleId === v.id);
        const totalLiters = vLogs.reduce((s, f) => s + (f.liters || 0), 0);
        const vTrips = ft.filter((t) => t.vehicleId === v.id && t.status === "Completed");
        let totalDistance = 0;
        vTrips.forEach((t) => {
          if (t.finalOdometer) {
            const startOdo = vLogs.length > 0 ? Math.min(...vLogs.map((l) => l.odometer || 0)) : v.odometerKm;
            totalDistance += Math.max(0, t.finalOdometer - startOdo);
          }
        });
        if (totalDistance === 0 && vLogs.length >= 2) {
          const odometers = vLogs.map((l) => l.odometer || 0).filter(Boolean).sort((a, b) => a - b);
          if (odometers.length >= 2) totalDistance = odometers[odometers.length - 1] - odometers[0];
        }
        const efficiency = totalLiters > 0 ? +(totalDistance / totalLiters).toFixed(1) : 0;
        return { id: v.id, name: v.regNumber, model: v.model, efficiency, totalLiters, totalDistance };
      })
      .sort((a, b) => b.efficiency - a.efficiency);
  }, [fv, ffl, ft]);

  const operationalCostBreakdown = useMemo(() => {
    const cats = {};
    fe.forEach((e) => { cats[e.category] = (cats[e.category] || 0) + (e.amount || 0); });
    if (kpis.fuelCost > 0) cats["Fuel"] = (cats["Fuel"] || 0) + kpis.fuelCost;
    return Object.entries(cats)
      .map(([name, value]) => ({ name, value: +value.toFixed(0) }))
      .sort((a, b) => b.value - a.value);
  }, [fe, kpis.fuelCost]);

  const vehicleROIRanking = useMemo(() => {
    return fv
      .filter((v) => v.status !== "Retired")
      .map((v) => {
        const vTrips = ft.filter((t) => t.vehicleId === v.id && t.status === "Completed");
        const revenue = vTrips.length * REVENUE_PER_TRIP;
        const vFuel = ffl.filter((f) => f.vehicleId === v.id).reduce((s, f) => s + (f.amount || 0), 0);
        const vMaint = fm.filter((m) => m.vehicleId === v.id).reduce((s, m) => s + (m.cost || 0), 0);
        const vExp = fe.filter((e) => e.vehicleId === v.id).reduce((s, e) => s + (e.amount || 0), 0);
        const costs = vFuel + vMaint + vExp;
        const roi = costs > 0 ? +((revenue - costs) / costs).toFixed(2) : 0;
        return { id: v.id, name: v.regNumber, model: v.model, revenue, costs, roi };
      })
      .sort((a, b) => b.roi - a.roi);
  }, [fv, ft, ffl, fm, fe]);

  const tripStatusOverview = useMemo(() => {
    const counts = {};
    ft.forEach((t) => { counts[t.status] = (counts[t.status] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [ft]);

  const maintenanceImpact = useMemo(() => {
    return fv
      .filter((v) => v.status !== "Retired")
      .map((v) => {
        const vMaint = fm.filter((m) => m.vehicleId === v.id);
        const openCount = vMaint.filter((m) => m.status === "Open").length;
        let totalDowntimeHrs = 0;
        vMaint.forEach((m) => {
          if (m.closedAt && m.openedAt) {
            totalDowntimeHrs += daysBetween(m.openedAt, m.closedAt) * 24;
          } else if (m.status === "Open") {
            totalDowntimeHrs += daysBetween(m.openedAt, new Date()) * 24;
          }
        });
        const totalCost = vMaint.reduce((s, m) => s + (m.cost || 0), 0);
        return {
          id: v.id,
          name: v.regNumber,
          model: v.model,
          openCount,
          totalCount: vMaint.length,
          downtimeHrs: Math.round(totalDowntimeHrs),
          totalCost,
        };
      })
      .filter((v) => v.totalCount > 0)
      .sort((a, b) => b.downtimeHrs - a.downtimeHrs);
  }, [fv, fm]);

  const driverComplianceRisk = useMemo(() => {
    const today = new Date();
    return fd
      .map((d) => {
        const daysToExpiry = daysBetween(today, d.licenseExpiry);
        const expired = daysToExpiry < 0;
        const warning = daysToExpiry >= 0 && daysToExpiry <= COMPLIANCE_WARN_DAYS;
        const lowSafety = d.safetyScore < 80;
        const suspended = d.status === "Suspended";

        let riskScore = 0;
        if (expired) riskScore += 50;
        else if (warning) riskScore += 30;
        if (lowSafety) riskScore += 30;
        if (suspended) riskScore += 20;
        riskScore = Math.min(100, riskScore);

        let riskLevel = "Low";
        if (riskScore >= 50) riskLevel = "High";
        else if (riskScore >= 20) riskLevel = "Medium";

        return {
          id: d.id,
          name: d.name,
          licenseNumber: d.licenseNumber,
          licenseCategory: d.licenseCategory,
          licenseExpiry: d.licenseExpiry,
          daysToExpiry,
          safetyScore: d.safetyScore,
          status: d.status,
          region: d.region,
          riskScore,
          riskLevel,
          expired,
          warning,
        };
      })
      .sort((a, b) => b.riskScore - a.riskScore);
  }, [fd]);

  const odometerGrowth = useMemo(() => {
    return fv
      .filter((v) => v.status !== "Retired")
      .map((v) => ({ id: v.id, name: v.regNumber, odometer: v.odometerKm }))
      .sort((a, b) => b.odometer - a.odometer);
  }, [fv]);

  const fuelSpendTrend = useMemo(() => {
    const byDate = {};
    ffl.forEach((f) => {
      const d = f.date?.split("T")[0] || f.date;
      if (!d) return;
      byDate[d] = (byDate[d] || 0) + (f.amount || 0);
    });
    return Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, amount]) => ({ name: date.slice(5), value: +amount.toFixed(0) }));
  }, [ffl]);

  const tripsCompletedVsCancelled = useMemo(() => {
    const byDate = {};
    ft.forEach((t) => {
      const d = t.departureDate?.split("T")[0] || t.departureDate?.split(" ")[0];
      if (!d) return;
      if (!byDate[d]) byDate[d] = { name: d.slice(5), completed: 0, cancelled: 0 };
      if (t.status === "Completed") byDate[d].completed++;
      if (t.status === "Cancelled") byDate[d].cancelled++;
    });
    return Object.values(byDate).sort((a, b) => a.name.localeCompare(b.name));
  }, [ft]);

  const maintenanceCostTrend = useMemo(() => {
    const byDate = {};
    fm.forEach((m) => {
      const d = m.openedAt?.split("T")[0] || m.openedAt?.split(" ")[0];
      if (!d) return;
      byDate[d] = (byDate[d] || 0) + (m.cost || 0);
    });
    return Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, cost]) => ({ name: date.slice(5), value: +cost.toFixed(0) }));
  }, [fm]);

  const revenueVsCost = useMemo(() => {
    const byDate = {};
    ft.forEach((t) => {
      const d = t.departureDate?.split("T")[0] || t.departureDate?.split(" ")[0];
      if (!d) return;
      if (!byDate[d]) byDate[d] = { name: d.slice(5), revenue: 0, cost: 0 };
      if (t.status === "Completed") byDate[d].revenue += REVENUE_PER_TRIP;
    });
    ffl.forEach((f) => {
      const d = f.date?.split("T")[0] || f.date;
      if (!d || !byDate[d]) return;
      byDate[d].cost += f.amount || 0;
    });
    fe.forEach((e) => {
      const d = e.date?.split("T")[0] || e.date;
      if (!d || !byDate[d]) return;
      byDate[d].cost += e.amount || 0;
    });
    fm.forEach((m) => {
      const d = m.openedAt?.split("T")[0] || m.openedAt?.split(" ")[0];
      if (!d || !byDate[d]) return;
      byDate[d].cost += m.cost || 0;
    });
    return Object.values(byDate).sort((a, b) => a.name.localeCompare(b.name));
  }, [ft, ffl, fe, fm]);

  const upcomingLicenseExpiries = useMemo(() => {
    const today = new Date();
    return fd
      .filter((d) => {
        const days = daysBetween(today, d.licenseExpiry);
        return days >= 0 && days <= 90;
      })
      .sort((a, b) => new Date(a.licenseExpiry) - new Date(b.licenseExpiry));
  }, [fd]);

  const vehiclesRequiringAttention = useMemo(() => {
    const today = new Date();
    return fv
      .filter((v) => {
        if (v.status === "Retired") return false;
        const daysSinceService = daysBetween(v.lastService, today);
        if (daysSinceService > 30) return true;
        if (v.status === "In Shop") return true;
        const vMaint = fm.filter((m) => m.vehicleId === v.id && m.status === "Open");
        if (vMaint.length > 0) return true;
        return false;
      })
      .map((v) => {
        const daysSinceService = daysBetween(v.lastService, today);
        const flags = [];
        if (daysSinceService > 30) flags.push(`${daysSinceService}d since service`);
        if (v.status === "In Shop") flags.push("In maintenance");
        const openMaint = fm.filter((m) => m.vehicleId === v.id && m.status === "Open");
        if (openMaint.length > 0) flags.push(`${openMaint.length} open work order(s)`);
        return { ...v, flags, daysSinceService };
      })
      .sort((a, b) => b.daysSinceService - a.daysSinceService);
  }, [fv, fm]);

  const vehiclesAtRisk = useMemo(() => {
    return fv
      .filter((v) => v.status !== "Retired")
      .map((v) => {
        const vTrips = ft.filter((t) => t.vehicleId === v.id);
        const completedTrips = vTrips.filter((t) => t.status === "Completed");
        const vExpenses = fe.filter((e) => e.vehicleId === v.id).reduce((s, e) => s + (e.amount || 0), 0);
        const vFuel = ffl.filter((f) => f.vehicleId === v.id);
        const fuelCost = vFuel.reduce((s, f) => s + (f.amount || 0), 0);
        const totalLiters = vFuel.reduce((s, f) => s + (f.liters || 0), 0);
        const vMaint = fm.filter((m) => m.vehicleId === v.id);
        const maintCost = vMaint.reduce((s, m) => s + (m.cost || 0), 0);
        const totalCost = fuelCost + maintCost + vExpenses;
        const revenue = completedTrips.length * REVENUE_PER_TRIP;
        const roi = totalCost > 0 ? +((revenue - totalCost) / totalCost).toFixed(2) : 0;
        const efficiency = totalLiters > 0 ? +(v.odometerKm / totalLiters).toFixed(1) : 0;

        const today = new Date();
        const daysSinceService = daysBetween(v.lastService, today);
        const flags = [];
        if (daysSinceService > 30) flags.push("Service overdue");
        if (v.status === "In Shop") flags.push("In Shop");
        if (roi < 0) flags.push("Negative ROI");
        const openMaint = vMaint.filter((m) => m.status === "Open");
        if (openMaint.length > 0) flags.push("Open maintenance");

        return {
          id: v.id,
          regNumber: v.regNumber,
          model: v.model,
          type: v.type,
          status: v.status,
          odometerKm: v.odometerKm,
          lastService: v.lastService,
          fuelEfficiency: efficiency,
          totalCost,
          roi,
          flags,
          attentionNeeded: flags.length > 0,
        };
      })
      .sort((a, b) => b.flags.length - a.flags.length || a.roi - b.roi);
  }, [fv, ft, ffl, fm, fe]);

  const driverReadiness = useMemo(() => {
    const today = new Date();
    return fd.map((d) => {
      const daysToExpiry = daysBetween(today, d.licenseExpiry);
      const expired = daysToExpiry < 0;
      const warning = daysToExpiry >= 0 && daysToExpiry <= COMPLIANCE_WARN_DAYS;
      const lowSafety = d.safetyScore < 80;
      const suspended = d.status === "Suspended";
      const eligible = !expired && !suspended && d.status !== "On Trip";

      const riskFlags = [];
      if (expired) riskFlags.push("License expired");
      else if (warning) riskFlags.push(`Expires in ${daysToExpiry}d`);
      if (lowSafety) riskFlags.push("Low safety score");
      if (suspended) riskFlags.push("Suspended");

      return {
        id: d.id,
        name: d.name,
        licenseNumber: d.licenseNumber,
        licenseCategory: d.licenseCategory,
        licenseExpiry: d.licenseExpiry,
        daysToExpiry,
        safetyScore: d.safetyScore,
        status: d.status,
        eligible,
        riskFlags,
      };
    }).sort((a, b) => a.daysToExpiry - b.daysToExpiry);
  }, [fd]);

  const tripPerformance = useMemo(() => {
    return ft.map((t) => {
      const vehicle = vehicles.find((v) => v.id === t.vehicleId);
      const driver = drivers.find((d) => d.id === t.driverId);
      const vFuel = ffl.filter((f) => f.vehicleId === t.vehicleId);
      const fuelUsed = t.fuelConsumed || vFuel.reduce((s, f) => s + (f.liters || 0), 0);
      const vExpenses = fe.filter((e) => e.tripId === t.id).reduce((s, e) => s + (e.amount || 0), 0);
      const plannedDistance = t.finalOdometer ? Math.abs(t.finalOdometer - (vehicle?.odometerKm || 0)) : null;
      const actualDistance = t.finalOdometer && t.departureDate ? Math.abs(t.finalOdometer - (vFuel[0]?.odometer || vehicle?.odometerKm || 0)) : null;

      return {
        id: t.id,
        origin: t.origin,
        destination: t.destination,
        vehicleReg: vehicle?.regNumber || t.vehicleId,
        driverName: driver?.name || t.driverId,
        plannedDistance: plannedDistance || "—",
        actualDistance: actualDistance || "—",
        fuelUsed: fuelUsed || "—",
        status: t.status,
        operationalCost: vExpenses || 0,
        departureDate: t.departureDate,
      };
    });
  }, [ft, vehicles, drivers, ffl, fe]);

  const maintenanceSummary = useMemo(() => {
    return fm.map((m) => {
      const vehicle = vehicles.find((v) => v.id === m.vehicleId);
      let downtime = "—";
      if (m.closedAt && m.openedAt) {
        const days = daysBetween(m.openedAt, m.closedAt);
        downtime = days === 0 ? "<1 day" : `${days} day(s)`;
      } else if (m.status === "Open") {
        const days = daysBetween(m.openedAt, new Date());
        downtime = days === 0 ? "Ongoing" : `${days} day(s)`;
      }
      return {
        id: m.id,
        vehicleReg: vehicle?.regNumber || m.vehicleId,
        vehicleModel: vehicle?.model || "",
        type: m.type,
        openedAt: m.openedAt,
        closedAt: m.closedAt,
        downtime,
        cost: m.cost,
        status: m.status,
        notes: m.notes,
      };
    });
  }, [fm, vehicles]);

  const expenseSummary = useMemo(() => {
    return fe.map((e) => {
      const vehicle = vehicles.find((v) => v.id === e.vehicleId);
      const trip = ft.find((t) => t.id === e.tripId);
      return {
        id: e.id,
        category: e.category,
        vehicleReg: vehicle?.regNumber || e.vehicleId,
        tripId: e.tripId || "—",
        tripRoute: trip ? `${trip.origin} → ${trip.destination}` : "—",
        amount: e.amount,
        date: e.date,
        notes: e.notes || "",
      };
    });
  }, [fe, vehicles, ft]);

  const filterOptions = useMemo(() => {
    const types = [...new Set(vehicles.map((v) => v.type))].sort();
    const statuses = [...new Set(vehicles.map((v) => v.status))].sort();
    const dStatuses = [...new Set(drivers.map((d) => d.status))].sort();
    const tStatuses = [...new Set(trips.map((t) => t.status))].sort();
    const regions = [...new Set(vehicles.map((v) => v.region))].sort();
    return { types, statuses, dStatuses, tStatuses, regions };
  }, [vehicles, drivers, trips]);

  return {
    kpis,
    sparklines,
    vehicleStatusDistribution,
    fuelEfficiencyByVehicle,
    operationalCostBreakdown,
    vehicleROIRanking,
    tripStatusOverview,
    maintenanceImpact,
    driverComplianceRisk,
    odometerGrowth,
    fuelSpendTrend,
    tripsCompletedVsCancelled,
    maintenanceCostTrend,
    revenueVsCost,
    upcomingLicenseExpiries,
    vehiclesRequiringAttention,
    vehiclesAtRisk,
    driverReadiness,
    tripPerformance,
    maintenanceSummary,
    expenseSummary,
    filterOptions,
  };
}
