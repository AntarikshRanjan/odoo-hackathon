import { Check, X, AlertTriangle } from "lucide-react";
import { Card } from "../../../components/ui/card";
import { formatNumber } from "../../../lib/utils";

export function ValidationSummary({ validation, cargoWeightKg }) {
  const { vehicle, driver, isValid, capacityExceeded } = validation;

  const validLicense = driver ? new Date(driver.licenseExpiry) >= new Date() : false;

  return (
    <Card className="p-6 h-full flex flex-col">
      <h3 className="text-[18px] font-bold text-[var(--text)] mb-6">Validation</h3>
      
      <div className="flex-1 space-y-1 mb-6">
        <Item 
          status={!vehicle ? 'none' : (vehicle.status === 'Available' && !["In Shop", "Retired"].includes(vehicle.status) ? 'pass' : 'fail')} 
          label="Vehicle" 
          value={vehicle ? vehicle.status : "Not Selected"} 
        />
        <Item 
          status={!vehicle ? 'none' : 'pass'} 
          label="Reg #" 
          value={vehicle?.regNumber} 
        />
        <Item 
          status={!driver ? 'none' : (driver.status === 'Available' && driver.status !== "Suspended" ? 'pass' : 'fail')} 
          label="Driver" 
          value={driver ? driver.status : "Not Selected"} 
        />
        <Item 
          status={!driver ? 'none' : (validLicense ? 'pass' : 'fail')} 
          label="License" 
          value={driver ? (validLicense ? "Valid" : "Expired") : "Not Selected"} 
        />
        <Item 
          status={!vehicle ? 'none' : (capacityExceeded ? 'fail' : 'pass')} 
          label="Capacity" 
          value={vehicle ? `${formatNumber(cargoWeightKg)} / ${formatNumber(vehicle.capacityKg)} kg` : "-"} 
        />
      </div>

      <div className={`p-4 border flex items-center justify-center text-[14px] font-bold uppercase tracking-[0.08em] transition-colors ${isValid ? "bg-[var(--invert-bg)] text-[var(--invert-text)] border-[var(--text)]" : "bg-[var(--surface-2)] text-[var(--muted)] border-[var(--border)]"}`}>
        {isValid ? "Dispatch Ready" : "Action Required"}
      </div>
    </Card>
  );
}

function Item({ status, label, value }) {
  return (
    <div className="flex items-start justify-between py-3 border-b border-[var(--border)] last:border-0">
      <div className="flex items-center gap-2">
        {status === 'pass' && <Check className="w-4 h-4 text-green-500" />}
        {status === 'fail' && <X className="w-4 h-4 text-red-500" />}
        {status === 'warn' && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
        {status === 'none' && <span className="w-4 h-4 inline-block" />}
        <span className="text-[13px] uppercase tracking-[0.05em] text-[var(--muted)]">{label}</span>
      </div>
      <span className="text-[14px] font-mono text-[var(--text)] text-right">{value || "-"}</span>
    </div>
  );
}
