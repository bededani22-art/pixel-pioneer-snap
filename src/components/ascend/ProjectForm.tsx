import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  Button,
  Field,
  FormSection,
  Input,
  Modal,
  Select,
  Textarea,
} from "./ui";
import { CONTRACT_TYPES, CURRENCIES, NOTICE_PERIODS, STANDINGS } from "@/lib/ascend/domain";
import { uid } from "@/lib/ascend/store";
import type { CurrencyAllocation, Project, ProjectStatus } from "@/lib/ascend/types";

export function emptyProject(status: ProjectStatus): Project {
  return {
    id: uid("prj"),
    name: "",
    contractRef: "",
    employer: "",
    consultant: "Ascend Consulting Engineers PLC",
    contractor: "",
    contractType: "FIDIC Red Book",
    currencies: [{ code: "USD", pct: 100 }],
    status,
    standing: "Contract Administration",
    noticePeriodDays: 28,
    prelimRatePerDay: 0,
    criticalFloatThreshold: 0,
    dates: {},
    createdAt: new Date().toISOString(),
  };
}

export function ProjectForm({
  open,
  initial,
  onClose,
  onSave,
}: {
  open: boolean;
  initial: Project;
  onClose: () => void;
  onSave: (p: Project) => void;
}) {
  const [p, setP] = useState<Project>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof Project>(k: K, v: Project[K]) => setP((s) => ({ ...s, [k]: v }));
  const setDate = (k: keyof Project["dates"], v: string) =>
    setP((s) => ({ ...s, dates: { ...s.dates, [k]: v || undefined } }));

  const totalPct = p.currencies.reduce((s, c) => s + (Number(c.pct) || 0), 0);

  function updateCurrency(i: number, patch: Partial<CurrencyAllocation>) {
    setP((s) => ({
      ...s,
      currencies: s.currencies.map((c, idx) => (idx === i ? { ...c, ...patch } : c)),
    }));
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!p.name.trim()) e['name'] = "Project name is required.";
    if (!p.contractRef.trim()) e['contractRef'] = "Contract reference is required.";
    if (!p.contractType) e['contractType'] = "Contract type is required.";
    if (p.contractType === "Other" && !p.contractTypeOther?.trim())
      e['contractTypeOther'] = "Specify the contract type.";
    if (!p.currencies.length) e['currency'] = "At least one currency is required.";
    if (Math.round(totalPct) !== 100) e['currency'] = "Currency allocation must equal 100%.";
    const { commencement, originalCompletion, revisedCompletion } = p.dates;
    if (commencement && originalCompletion && originalCompletion < commencement)
      e['originalCompletion'] = "Completion date cannot be before commencement.";
    if (revisedCompletion && commencement && revisedCompletion < commencement)
      e['revisedCompletion'] = "Revised completion cannot be before commencement.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  return (
    <Modal
      open={open}
      wide
      title={initial.name ? "Edit project" : "Add project"}
      subtitle="Project, contract, currency, dates and current standing."
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            variant="primary"
            onClick={() => {
              if (validate()) onSave({ ...p, name: p.name.trim() });
            }}
          >
            Save project
          </Button>
        </>
      }
    >
      <FormSection title="Project information">
        <Field label="Project name" error={errors['name']} className="sm:col-span-2">
          <Input value={p.name} onChange={(e) => set("name", e.target.value)} />
        </Field>
        <Field label="Contract reference" error={errors['contractRef']}>
          <Input value={p.contractRef} onChange={(e) => set("contractRef", e.target.value)} />
        </Field>
        <Field label="Employer">
          <Input value={p.employer} onChange={(e) => set("employer", e.target.value)} />
        </Field>
        <Field label="Consultant">
          <Input value={p.consultant} onChange={(e) => set("consultant", e.target.value)} />
        </Field>
        <Field label="Contractor">
          <Input value={p.contractor} onChange={(e) => set("contractor", e.target.value)} />
        </Field>
      </FormSection>

      <FormSection title="Contract information">
        <Field label="Contract type" error={errors['contractType']}>
          <Select value={p.contractType} onChange={(e) => set("contractType", e.target.value)}>
            {CONTRACT_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </Select>
        </Field>
        {p.contractType === "Other" ? (
          <Field label="Specify contract type" error={errors['contractTypeOther']}>
            <Input
              value={p.contractTypeOther ?? ""}
              onChange={(e) => set("contractTypeOther", e.target.value)}
            />
          </Field>
        ) : null}
        <Field label="Default notice period (days)">
          <Select
            value={String(p.noticePeriodDays)}
            onChange={(e) => set("noticePeriodDays", Number(e.target.value))}
          >
            {NOTICE_PERIODS.map((n) => (
              <option key={n} value={n}>
                {n} days
              </option>
            ))}
            {NOTICE_PERIODS.includes(p.noticePeriodDays) ? null : (
              <option value={p.noticePeriodDays}>{p.noticePeriodDays} days (custom)</option>
            )}
          </Select>
        </Field>
        <Field label="Custom notice period (days)">
          <Input
            type="number"
            min={1}
            value={p.noticePeriodDays}
            onChange={(e) => set("noticePeriodDays", Number(e.target.value) || 0)}
          />
        </Field>
        <Field label="Preliminaries / prolongation rate per day">
          <Input
            type="number"
            min={0}
            value={p.prelimRatePerDay}
            onChange={(e) => set("prelimRatePerDay", Number(e.target.value) || 0)}
          />
        </Field>
      </FormSection>

      <fieldset className="rounded-sm border border-border p-4">
        <legend className="px-1 text-[0.7rem] font-semibold uppercase tracking-wider text-primary">
          Contract currency allocation
        </legend>
        <div className="space-y-2">
          {p.currencies.map((c, i) => (
            <div key={i} className="flex items-end gap-2">
              <Field label="Currency" className="flex-1">
                <Select value={c.code} onChange={(e) => updateCurrency(i, { code: e.target.value })}>
                  {CURRENCIES.map((code) => (
                    <option key={code}>{code}</option>
                  ))}
                  {CURRENCIES.includes(c.code) ? null : <option>{c.code}</option>}
                </Select>
              </Field>
              {c.code === "Other" ? (
                <Field label="Code" className="w-28">
                  <Input
                    placeholder="e.g. AED"
                    onChange={(e) => updateCurrency(i, { code: e.target.value.toUpperCase() })}
                  />
                </Field>
              ) : null}
              <Field label="Percentage" className="w-32">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={c.pct}
                  onChange={(e) => updateCurrency(i, { pct: Number(e.target.value) || 0 })}
                />
              </Field>
              <Button
                variant="ghost"
                onClick={() =>
                  setP((s) => ({ ...s, currencies: s.currencies.filter((_, idx) => idx !== i) }))
                }
                aria-label="Remove currency"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <Button
              size="sm"
              onClick={() =>
                setP((s) => ({ ...s, currencies: [...s.currencies, { code: "ETB", pct: 0 }] }))
              }
            >
              <Plus className="size-3.5" /> Add currency
            </Button>
            <span
              className={
                Math.round(totalPct) === 100
                  ? "text-xs text-success"
                  : "text-xs font-medium text-danger"
              }
            >
              Total allocation: {totalPct}%{" "}
              {Math.round(totalPct) === 100 ? "" : "— currency allocation must equal 100%."}
            </span>
          </div>
          {errors['currency'] ? (
            <p className="text-xs text-danger">{errors['currency']}</p>
          ) : null}
        </div>
      </fieldset>

      <FormSection title="Project dates">
        <Field label="Commencement date">
          <Input
            type="date"
            value={p.dates.commencement ?? ""}
            onChange={(e) => setDate("commencement", e.target.value)}
          />
        </Field>
        <Field label="Original completion date" error={errors['originalCompletion']}>
          <Input
            type="date"
            value={p.dates.originalCompletion ?? ""}
            onChange={(e) => setDate("originalCompletion", e.target.value)}
          />
        </Field>
        <Field label="Revised completion date" error={errors['revisedCompletion']}>
          <Input
            type="date"
            value={p.dates.revisedCompletion ?? ""}
            onChange={(e) => setDate("revisedCompletion", e.target.value)}
          />
        </Field>
        <Field label="EOT granted date">
          <Input
            type="date"
            value={p.dates.eotGranted ?? ""}
            onChange={(e) => setDate("eotGranted", e.target.value)}
          />
        </Field>
        <Field label="Taking-over date">
          <Input
            type="date"
            value={p.dates.takingOver ?? ""}
            onChange={(e) => setDate("takingOver", e.target.value)}
          />
        </Field>
        <Field label="Defects notification period end">
          <Input
            type="date"
            value={p.dates.defectsNotificationEnd ?? ""}
            onChange={(e) => setDate("defectsNotificationEnd", e.target.value)}
          />
        </Field>
        <Field label="Contract expiry date">
          <Input
            type="date"
            value={p.dates.contractExpiry ?? ""}
            onChange={(e) => setDate("contractExpiry", e.target.value)}
          />
        </Field>
      </FormSection>

      <FormSection title="Current status">
        <Field label="Project status">
          <Select
            value={p.status}
            onChange={(e) => set("status", e.target.value as ProjectStatus)}
          >
            <option value="in_progress">In progress</option>
            <option value="completed">Completed</option>
          </Select>
        </Field>
        <Field label="Current standing">
          <Select value={p.standing} onChange={(e) => set("standing", e.target.value)}>
            {STANDINGS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
        </Field>
        <Field label="Standing description" className="sm:col-span-2">
          <Textarea
            value={p.standingNote ?? ""}
            onChange={(e) => set("standingNote", e.target.value)}
            placeholder="Describe where the project currently stands."
          />
        </Field>
      </FormSection>
    </Modal>
  );
}
