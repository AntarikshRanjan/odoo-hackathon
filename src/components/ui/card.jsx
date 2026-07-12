import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

export function Card({
  eyebrow,
  title,
  subtitle,
  action,
  children,
  className,
  interactive = false,
}) {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.16 }}
      whileHover={
        interactive
          ? {
              borderColor: "var(--border-2)",
            }
          : undefined
      }
      className={cn("panel-surface p-6", interactive && "cursor-pointer", className)}
    >
      {(title || subtitle || action) && (
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="space-y-1">
            {eyebrow && (
              <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
                {eyebrow}
              </p>
            )}
            {title && (
              <h3 className="text-[15px] font-semibold leading-none text-[var(--text)]">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-[12px] text-[var(--muted)]">{subtitle}</p>
            )}
          </div>
          {action}
        </div>
      )}
      {children}
    </motion.section>
  );
}
