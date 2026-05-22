import { useEffect, useState } from "react";
import { AlertTriangle, Clock3, History, RefreshCcw, Search, UserRound, ArrowLeftRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import {
  fetchOperatorSkillHistorySnapshot,
  getTrainingWorkspacePreview,
  type OperatorSkillHistorySnapshot,
  type SkillChangeRecord,
  type SkillChangeType,
} from "@/lib/training";

const changeTypeOptions: Array<{ value: "all" | SkillChangeType; label: string }> = [
  { value: "all", label: "Semua tipe" },
  { value: "created", label: "Created" },
  { value: "updated", label: "Updated" },
  { value: "deleted", label: "Deleted" },
];

function formatDateTime(value?: string | null) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function statusPillClass(changeType: SkillChangeType) {
  if (changeType === "created") {
    return "bg-green-500/10 text-green-700 border-green-200";
  }

  if (changeType === "updated") {
    return "bg-yellow-500/10 text-yellow-700 border-yellow-200";
  }

  return "bg-red-500/10 text-red-700 border-red-200";
}

function summaryCardClass(index: number) {
  return ["modern-card p-5", index % 2 === 0 ? "border-primary/20" : "border-border"];
}

export function OperatorSkillHistoryPage() {
  const preview = getTrainingWorkspacePreview();
  const [snapshot, setSnapshot] = useState<OperatorSkillHistorySnapshot>({
    source: "preview",
    operators: preview.operators,
    skills: preview.skills,
    selectedOperatorId: preview.operators[0]?.id ?? "",
    selectedOperatorLabel: preview.operators[0]?.label ?? "-",
    changes: preview.changes,
    summary: {
      totalChanges: preview.changes.length,
      createdCount: preview.changes.filter((change) => change.changeType === "created").length,
      updatedCount: preview.changes.filter((change) => change.changeType === "updated").length,
      deletedCount: preview.changes.filter((change) => change.changeType === "deleted").length,
    },
  });
  const [selectedOperatorId, setSelectedOperatorId] = useState(snapshot.selectedOperatorId);
  const [changeTypeFilter, setChangeTypeFilter] = useState<"all" | SkillChangeType>("all");
  const [skillFilter, setSkillFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSnapshot = async (operatorId?: string) => {
    setLoading(true);
    setError("");

    try {
      const nextSnapshot = await fetchOperatorSkillHistorySnapshot(operatorId);
      setSnapshot(nextSnapshot);
      setSelectedOperatorId(nextSnapshot.selectedOperatorId || operatorId || nextSnapshot.operators[0]?.id || "");
    } catch (loadError) {
      const fallback = getTrainingWorkspacePreview();
      const fallbackOperator = fallback.operators[0];
      setSnapshot({
        source: "preview",
        operators: fallback.operators,
        skills: fallback.skills,
        selectedOperatorId: fallbackOperator?.id ?? "",
        selectedOperatorLabel: fallbackOperator?.label ?? "-",
        changes: fallback.changes.filter((change) => change.operatorId === (operatorId || fallbackOperator?.id)),
        summary: {
          totalChanges: fallback.changes.length,
          createdCount: fallback.changes.filter((change) => change.changeType === "created").length,
          updatedCount: fallback.changes.filter((change) => change.changeType === "updated").length,
          deletedCount: fallback.changes.filter((change) => change.changeType === "deleted").length,
        },
      });
      setError(loadError instanceof Error ? loadError.message : "Gagal memuat riwayat operator.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSnapshot(selectedOperatorId);
  }, []);

  const filteredChanges = snapshot.changes.filter((change) => {
    const matchesType = changeTypeFilter === "all" || change.changeType === changeTypeFilter;
    const matchesSkill = skillFilter === "all" || change.skillId === skillFilter;
    const normalizedSearch = search.trim().toLowerCase();
    const matchesSearch =
      normalizedSearch.length === 0 ||
      [change.skillCode, change.skillName, change.changedBy, change.reason ?? "", change.oldStatus ?? "", change.newStatus ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch);

    return matchesType && matchesSkill && matchesSearch;
  });

  const selectedOperatorLabel = snapshot.selectedOperatorLabel || snapshot.operators.find((operator) => operator.id === selectedOperatorId)?.label || "-";

  const summaryCards = [
    { label: "Total Changes", value: snapshot.summary.totalChanges },
    { label: "Created", value: snapshot.summary.createdCount },
    { label: "Updated", value: snapshot.summary.updatedCount },
    { label: "Deleted", value: snapshot.summary.deletedCount },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
              <History className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Operator Skill History</h2>
              <p className="text-sm text-muted-foreground">Detail perubahan skill operator dari tabel `operator_skill_changes`.</p>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Source data: {snapshot.source === "supabase" ? "Supabase real data" : "Fallback preview"}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/dashboard/training"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors"
          >
            Kembali ke Training
          </Link>
          <button
            type="button"
            onClick={() => void loadSnapshot(selectedOperatorId)}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors"
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {summaryCards.map((card, index) => (
          <div key={card.label} className={summaryCardClass(index).join(" ")}>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{card.label}</p>
            <p className="mt-2 text-2xl font-bold text-foreground">{card.value}</p>
          </div>
        ))}
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-500/10 px-4 py-3 text-sm text-red-700 flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      <div className="modern-card p-6 space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <UserRound className="h-5 w-5 text-primary" />
              Operator Detail
            </h3>
            <p className="text-sm text-muted-foreground">{selectedOperatorLabel}</p>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4 w-full lg:max-w-5xl">
            <select
              value={selectedOperatorId}
              onChange={(event) => {
                const nextOperatorId = event.target.value;
                setSelectedOperatorId(nextOperatorId);
                void loadSnapshot(nextOperatorId);
              }}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
            >
              {snapshot.operators.map((operator) => (
                <option key={operator.id} value={operator.id}>
                  {operator.label}
                </option>
              ))}
            </select>
            <select
              value={changeTypeFilter}
              onChange={(event) => setChangeTypeFilter(event.target.value as "all" | SkillChangeType)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
            >
              {changeTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              value={skillFilter}
              onChange={(event) => setSkillFilter(event.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
            >
              <option value="all">Semua skill</option>
              {snapshot.skills.map((skill) => (
                <option key={skill.id} value={skill.id}>
                  {skill.label}
                </option>
              ))}
            </select>
            <div className="relative w-full">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-sm text-foreground"
                placeholder="Cari skill / assessor / alasan"
              />
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">Menampilkan {filteredChanges.length} dari {snapshot.changes.length} perubahan untuk operator ini.</p>
      </div>

      <div className="modern-card overflow-hidden">
        <div className="border-b border-border p-6">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <ArrowLeftRight className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">History Timeline</h3>
              <p className="text-sm text-muted-foreground">Riwayat perubahan skill level, status assessment, dan audit trail perubahan.</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="p-4 text-left font-semibold text-muted-foreground">Skill</th>
                <th className="p-4 text-left font-semibold text-muted-foreground">Change</th>
                <th className="p-4 text-left font-semibold text-muted-foreground">Changed By</th>
                <th className="p-4 text-left font-semibold text-muted-foreground">Reason</th>
                <th className="p-4 text-left font-semibold text-muted-foreground">Changed At</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="p-4 text-muted-foreground" colSpan={5}>
                    Loading operator history...
                  </td>
                </tr>
              ) : filteredChanges.length === 0 ? (
                <tr>
                  <td className="p-4 text-muted-foreground" colSpan={5}>
                    Tidak ada riwayat yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filteredChanges.map((change: SkillChangeRecord) => (
                  <tr key={change.id} className="border-b border-border hover:bg-accent/50 transition-colors">
                    <td className="p-4 text-foreground">
                      {change.skillCode} - {change.skillName}
                    </td>
                    <td className="p-4 text-muted-foreground">
                      <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-xs font-medium", statusPillClass(change.changeType))}>
                        {change.changeType}
                      </span>
                      <span className="ml-2">
                        {change.oldLevel ?? "-"} → {change.newLevel ?? "-"}
                        {change.oldStatus || change.newStatus ? ` (${change.oldStatus ?? "-"} → ${change.newStatus ?? "-"})` : ""}
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground">{change.changedBy}</td>
                    <td className="p-4 text-muted-foreground">{change.reason ?? "-"}</td>
                    <td className="p-4 text-muted-foreground">{formatDateTime(change.changedAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="modern-card p-6">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
            <Clock3 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Implementation Notes</h3>
            <p className="text-sm text-muted-foreground">
              Halaman ini membaca langsung `operator_skill_changes`, jadi cocok untuk audit review dan investigasi perubahan kompetensi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}