import { useEffect, useState } from "react";
import { AlertTriangle, ClipboardList, Clock3, GraduationCap, History, RefreshCcw, Save, Trash2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import {
  deleteSkillAssessment,
  deleteTrainingSession,
  fetchTrainingWorkspaceSnapshot,
  getTrainingWorkspacePreview,
  saveSkillAssessment,
  saveTrainingSession,
  type SkillAssessmentRecord,
  type SkillAssessmentStatus,
  type TrainingSessionRecord,
  type TrainingSessionStatus,
  type TrainingWorkspaceSnapshot,
} from "@/lib/training";

type TrainingSessionFormState = {
  trainingCode: string;
  operatorId: string;
  skillId: string;
  trainerName: string;
  scheduledAt: string;
  completedAt: string;
  status: TrainingSessionStatus;
  location: string;
  notes: string;
};

type AssessmentFormState = {
  trainingSessionId: string;
  operatorId: string;
  skillId: string;
  previousLevel: string;
  assessedLevel: string;
  status: SkillAssessmentStatus;
  assessedBy: string;
  assessedAt: string;
  evidenceUrl: string;
  notes: string;
};

const trainingStatuses: TrainingSessionStatus[] = ["planned", "scheduled", "ongoing", "completed", "cancelled"];
const assessmentStatuses: SkillAssessmentStatus[] = ["draft", "passed", "failed", "needs_retest"];

function toDateTimeLocalValue(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  return date.toISOString().slice(0, 16);
}

function toIsoFromDateTimeLocal(value: string) {
  return new Date(value).toISOString();
}

function formatDateTime(value?: string | null) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function emptyTrainingForm(): TrainingSessionFormState {
  return {
    trainingCode: "TRN-",
    operatorId: "",
    skillId: "",
    trainerName: "",
    scheduledAt: toDateTimeLocalValue(new Date()),
    completedAt: "",
    status: "planned",
    location: "",
    notes: "",
  };
}

function emptyAssessmentForm(): AssessmentFormState {
  return {
    trainingSessionId: "",
    operatorId: "",
    skillId: "",
    previousLevel: "",
    assessedLevel: "2",
    status: "draft",
    assessedBy: "",
    assessedAt: toDateTimeLocalValue(new Date()),
    evidenceUrl: "",
    notes: "",
  };
}

function statusBadgeClass(status: string) {
  if (status === "completed" || status === "passed") {
    return "bg-green-500/10 text-green-700 border-green-200";
  }

  if (status === "ongoing" || status === "scheduled" || status === "needs_retest") {
    return "bg-yellow-500/10 text-yellow-700 border-yellow-200";
  }

  if (status === "cancelled" || status === "failed") {
    return "bg-red-500/10 text-red-700 border-red-200";
  }

  return "bg-muted text-muted-foreground border-border";
}

function SectionHeader({ title, description, icon: Icon }: { title: string; description: string; icon: typeof ClipboardList }) {
  return (
    <div className="flex items-start gap-3">
      <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

export function TrainingAssessmentPage() {
  const [snapshot, setSnapshot] = useState<TrainingWorkspaceSnapshot>(getTrainingWorkspacePreview());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"training" | "assessment">("training");
  const [editingTrainingId, setEditingTrainingId] = useState<string | null>(null);
  const [editingAssessmentId, setEditingAssessmentId] = useState<string | null>(null);
  const [sessionSearch, setSessionSearch] = useState("");
  const [sessionStatusFilter, setSessionStatusFilter] = useState<"all" | TrainingSessionStatus>("all");
  const [sessionOperatorFilter, setSessionOperatorFilter] = useState("all");
  const [sessionSkillFilter, setSessionSkillFilter] = useState("all");
  const [assessmentSearch, setAssessmentSearch] = useState("");
  const [assessmentStatusFilter, setAssessmentStatusFilter] = useState<"all" | SkillAssessmentStatus>("all");
  const [assessmentOperatorFilter, setAssessmentOperatorFilter] = useState("all");
  const [assessmentSkillFilter, setAssessmentSkillFilter] = useState("all");
  const [trainingForm, setTrainingForm] = useState<TrainingSessionFormState>(emptyTrainingForm());
  const [assessmentForm, setAssessmentForm] = useState<AssessmentFormState>(emptyAssessmentForm());

  const loadWorkspace = async () => {
    setLoading(true);
    setError("");

    try {
      const nextSnapshot = await fetchTrainingWorkspaceSnapshot();
      setSnapshot(nextSnapshot);
    } catch (loadError) {
      setSnapshot(getTrainingWorkspacePreview());
      setError(loadError instanceof Error ? loadError.message : "Gagal memuat data training.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadWorkspace();
  }, []);

  const resetTrainingForm = () => {
    setEditingTrainingId(null);
    setTrainingForm(emptyTrainingForm());
  };

  const resetAssessmentForm = () => {
    setEditingAssessmentId(null);
    setAssessmentForm(emptyAssessmentForm());
  };

  const populateAssessmentFromSession = (trainingSessionId: string) => {
    const session = snapshot.sessions.find((item) => item.id === trainingSessionId);

    setAssessmentForm((current) => ({
      ...current,
      trainingSessionId,
      operatorId: session?.operatorId ?? current.operatorId,
      skillId: session?.skillId ?? current.skillId,
    }));
  };

  const beginTrainingEdit = (session: TrainingSessionRecord) => {
    setActiveTab("training");
    setEditingTrainingId(session.id);
    setTrainingForm({
      trainingCode: session.trainingCode,
      operatorId: session.operatorId,
      skillId: session.skillId,
      trainerName: session.trainerName,
      scheduledAt: toDateTimeLocalValue(session.scheduledAt),
      completedAt: session.completedAt ? toDateTimeLocalValue(session.completedAt) : "",
      status: session.status,
      location: session.location ?? "",
      notes: session.notes ?? "",
    });
  };

  const beginAssessmentEdit = (assessment: SkillAssessmentRecord) => {
    setActiveTab("assessment");
    setEditingAssessmentId(assessment.id);
    setAssessmentForm({
      trainingSessionId: assessment.trainingSessionId ?? "",
      operatorId: assessment.operatorId,
      skillId: assessment.skillId,
      previousLevel: assessment.previousLevel?.toString() ?? "",
      assessedLevel: assessment.assessedLevel.toString(),
      status: assessment.status,
      assessedBy: assessment.assessedBy,
      assessedAt: toDateTimeLocalValue(assessment.assessedAt),
      evidenceUrl: assessment.evidenceUrl ?? "",
      notes: assessment.notes ?? "",
    });
  };

  const handleTrainingSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      await saveTrainingSession(editingTrainingId, {
        trainingCode: trainingForm.trainingCode.trim(),
        operatorId: trainingForm.operatorId,
        skillId: trainingForm.skillId,
        trainerName: trainingForm.trainerName.trim(),
        scheduledAt: toIsoFromDateTimeLocal(trainingForm.scheduledAt),
        completedAt: trainingForm.completedAt ? toIsoFromDateTimeLocal(trainingForm.completedAt) : null,
        status: trainingForm.status,
        location: trainingForm.location.trim() || null,
        notes: trainingForm.notes.trim() || null,
      });

      setMessage(editingTrainingId ? "Training session diperbarui." : "Training session ditambahkan.");
      resetTrainingForm();
      await loadWorkspace();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Gagal menyimpan training session.");
    } finally {
      setSaving(false);
    }
  };

  const handleAssessmentSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      await saveSkillAssessment(editingAssessmentId, {
        trainingSessionId: assessmentForm.trainingSessionId || null,
        operatorId: assessmentForm.operatorId,
        skillId: assessmentForm.skillId,
        previousLevel: assessmentForm.previousLevel ? Number(assessmentForm.previousLevel) : null,
        assessedLevel: Number(assessmentForm.assessedLevel),
        status: assessmentForm.status,
        assessedBy: assessmentForm.assessedBy.trim(),
        assessedAt: toIsoFromDateTimeLocal(assessmentForm.assessedAt),
        evidenceUrl: assessmentForm.evidenceUrl.trim() || null,
        notes: assessmentForm.notes.trim() || null,
      });

      setMessage(editingAssessmentId ? "Assessment diperbarui." : "Assessment ditambahkan.");
      resetAssessmentForm();
      await loadWorkspace();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Gagal menyimpan assessment.");
    } finally {
      setSaving(false);
    }
  };

  const handleTrainingDelete = async (session: TrainingSessionRecord) => {
    if (!window.confirm(`Hapus training session ${session.trainingCode}?`)) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      await deleteTrainingSession(session.id);
      if (editingTrainingId === session.id) {
        resetTrainingForm();
      }
      setMessage("Training session dihapus.");
      await loadWorkspace();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Gagal menghapus training session.");
    } finally {
      setSaving(false);
    }
  };

  const handleAssessmentDelete = async (assessment: SkillAssessmentRecord) => {
    if (!window.confirm(`Hapus assessment untuk ${assessment.operatorName}?`)) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      await deleteSkillAssessment(assessment.id);
      if (editingAssessmentId === assessment.id) {
        resetAssessmentForm();
      }
      setMessage("Assessment dihapus.");
      await loadWorkspace();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Gagal menghapus assessment.");
    } finally {
      setSaving(false);
    }
  };

  const trainingSummary = {
    totalSessions: snapshot.sessions.length,
    completedSessions: snapshot.sessions.filter((session) => session.status === "completed").length,
    assessmentsPassed: snapshot.assessments.filter((assessment) => assessment.status === "passed").length,
    auditEntries: snapshot.changes.length,
  };

  const sessionSearchValue = sessionSearch.trim().toLowerCase();
  const assessmentSearchValue = assessmentSearch.trim().toLowerCase();

  const filteredSessions = snapshot.sessions.filter((session) => {
    const matchesSearch =
      sessionSearchValue.length === 0 ||
      [session.trainingCode, session.operatorNik, session.operatorName, session.skillCode, session.skillName, session.trainerName, session.location ?? "", session.notes ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(sessionSearchValue);
    const matchesStatus = sessionStatusFilter === "all" || session.status === sessionStatusFilter;
    const matchesOperator = sessionOperatorFilter === "all" || session.operatorId === sessionOperatorFilter;
    const matchesSkill = sessionSkillFilter === "all" || session.skillId === sessionSkillFilter;

    return matchesSearch && matchesStatus && matchesOperator && matchesSkill;
  });

  const filteredAssessments = snapshot.assessments.filter((assessment) => {
    const matchesSearch =
      assessmentSearchValue.length === 0 ||
      [
        assessment.operatorNik,
        assessment.operatorName,
        assessment.skillCode,
        assessment.skillName,
        assessment.assessedBy,
        assessment.notes ?? "",
        assessment.evidenceUrl ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(assessmentSearchValue);
    const matchesStatus = assessmentStatusFilter === "all" || assessment.status === assessmentStatusFilter;
    const matchesOperator = assessmentOperatorFilter === "all" || assessment.operatorId === assessmentOperatorFilter;
    const matchesSkill = assessmentSkillFilter === "all" || assessment.skillId === assessmentSkillFilter;

    return matchesSearch && matchesStatus && matchesOperator && matchesSkill;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Training & Assessment CRUD</h2>
              <p className="text-sm text-muted-foreground">Kelola sesi training, hasil assessment, dan audit log skill matrix dari data Supabase real.</p>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Source data: {snapshot.source === "supabase" ? "Supabase real data" : "Fallback preview"}</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/dashboard/operator-history"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors"
          >
            Riwayat Operator
          </Link>
          <button
            type="button"
            onClick={() => void loadWorkspace()}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors"
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="modern-card p-5">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Training Sessions</p>
          <p className="mt-2 text-2xl font-bold text-foreground">{trainingSummary.totalSessions}</p>
        </div>
        <div className="modern-card p-5">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Completed Training</p>
          <p className="mt-2 text-2xl font-bold text-foreground">{trainingSummary.completedSessions}</p>
        </div>
        <div className="modern-card p-5">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Assessment Passed</p>
          <p className="mt-2 text-2xl font-bold text-foreground">{trainingSummary.assessmentsPassed}</p>
        </div>
        <div className="modern-card p-5">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Audit Entries</p>
          <p className="mt-2 text-2xl font-bold text-foreground">{trainingSummary.auditEntries}</p>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-500/10 px-4 py-3 text-sm text-red-700 flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      {message ? (
        <div className="rounded-xl border border-green-200 bg-green-500/10 px-4 py-3 text-sm text-green-700">{message}</div>
      ) : null}

      <div className="flex flex-wrap gap-2 rounded-2xl border border-border bg-card p-2">
        <button
          type="button"
          onClick={() => setActiveTab("training")}
          className={cn(
            "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors",
            activeTab === "training" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent",
          )}
        >
          <ClipboardList className="h-4 w-4" />
          Training Sessions
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("assessment")}
          className={cn(
            "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors",
            activeTab === "assessment" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent",
          )}
        >
          <History className="h-4 w-4" />
          Assessments & Audit
        </button>
      </div>

      {activeTab === "training" ? (
        <div className="grid gap-6 xl:grid-cols-[380px,1fr]">
          <form onSubmit={handleTrainingSubmit} className="modern-card space-y-4 p-6">
            <SectionHeader
              title={editingTrainingId ? "Edit Training Session" : "Create Training Session"}
              description="Buat sesi training per operator dan skill sebelum assessment dijalankan."
              icon={ClipboardList}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Training Code</label>
              <input
                value={trainingForm.trainingCode}
                onChange={(event) => setTrainingForm((current) => ({ ...current, trainingCode: event.target.value }))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Operator</label>
              <select
                value={trainingForm.operatorId}
                onChange={(event) => setTrainingForm((current) => ({ ...current, operatorId: event.target.value }))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                required
              >
                <option value="">Pilih operator</option>
                {snapshot.operators.map((operator) => (
                  <option key={operator.id} value={operator.id}>
                    {operator.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Skill</label>
              <select
                value={trainingForm.skillId}
                onChange={(event) => setTrainingForm((current) => ({ ...current, skillId: event.target.value }))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                required
              >
                <option value="">Pilih skill</option>
                {snapshot.skills.map((skill) => (
                  <option key={skill.id} value={skill.id}>
                    {skill.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Trainer</label>
              <input
                value={trainingForm.trainerName}
                onChange={(event) => setTrainingForm((current) => ({ ...current, trainerName: event.target.value }))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                placeholder="Nama trainer"
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Scheduled At</label>
                <input
                  type="datetime-local"
                  value={trainingForm.scheduledAt}
                  onChange={(event) => setTrainingForm((current) => ({ ...current, scheduledAt: event.target.value }))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Completed At</label>
                <input
                  type="datetime-local"
                  value={trainingForm.completedAt}
                  onChange={(event) => setTrainingForm((current) => ({ ...current, completedAt: event.target.value }))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Status</label>
              <select
                value={trainingForm.status}
                onChange={(event) => setTrainingForm((current) => ({ ...current, status: event.target.value as TrainingSessionStatus }))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              >
                {trainingStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Location</label>
              <input
                value={trainingForm.location}
                onChange={(event) => setTrainingForm((current) => ({ ...current, location: event.target.value }))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                placeholder="Training room / line"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Notes</label>
              <textarea
                value={trainingForm.notes}
                onChange={(event) => setTrainingForm((current) => ({ ...current, notes: event.target.value }))}
                className="min-h-[96px] w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
              >
                <Save className="h-4 w-4" />
                {editingTrainingId ? "Update" : "Create"}
              </button>
              <button
                type="button"
                onClick={resetTrainingForm}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
              >
                Reset
              </button>
            </div>
          </form>

          <div className="modern-card overflow-hidden">
            <div className="border-b border-border p-6">
              <SectionHeader
                title="Training Sessions"
                description="Kelola sesi training yang akan dipakai sebagai dasar assessment skill."
                icon={Clock3}
              />
            </div>
            <div className="border-b border-border bg-background/50 p-4">
              <div className="grid gap-3 md:grid-cols-4">
                <input
                  value={sessionSearch}
                  onChange={(event) => setSessionSearch(event.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                  placeholder="Cari code / operator / skill / trainer"
                />
                <select
                  value={sessionStatusFilter}
                  onChange={(event) => setSessionStatusFilter(event.target.value as TrainingSessionStatus | "all")}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                >
                  <option value="all">Semua status</option>
                  {trainingStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <select
                  value={sessionOperatorFilter}
                  onChange={(event) => setSessionOperatorFilter(event.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                >
                  <option value="all">Semua operator</option>
                  {snapshot.operators.map((operator) => (
                    <option key={operator.id} value={operator.id}>
                      {operator.label}
                    </option>
                  ))}
                </select>
                <select
                  value={sessionSkillFilter}
                  onChange={(event) => setSessionSkillFilter(event.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                >
                  <option value="all">Semua skill</option>
                  {snapshot.skills.map((skill) => (
                    <option key={skill.id} value={skill.id}>
                      {skill.label}
                    </option>
                  ))}
                </select>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Menampilkan {filteredSessions.length} dari {snapshot.sessions.length} training session.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    <th className="p-4 text-left font-semibold text-muted-foreground">Code</th>
                    <th className="p-4 text-left font-semibold text-muted-foreground">Operator</th>
                    <th className="p-4 text-left font-semibold text-muted-foreground">Skill</th>
                    <th className="p-4 text-left font-semibold text-muted-foreground">Status</th>
                    <th className="p-4 text-left font-semibold text-muted-foreground">Schedule</th>
                    <th className="p-4 text-left font-semibold text-muted-foreground">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td className="p-4 text-muted-foreground" colSpan={6}>
                        Loading training sessions...
                      </td>
                    </tr>
                  ) : filteredSessions.length === 0 ? (
                    <tr>
                      <td className="p-4 text-muted-foreground" colSpan={6}>
                        Tidak ada training session yang cocok dengan filter.
                      </td>
                    </tr>
                  ) : (
                    filteredSessions.map((session) => (
                      <tr key={session.id} className="border-b border-border hover:bg-accent/50 transition-colors">
                        <td className="p-4 font-medium text-foreground">{session.trainingCode}</td>
                        <td className="p-4 text-muted-foreground">
                          {session.operatorNik} - {session.operatorName}
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {session.skillCode} - {session.skillName}
                        </td>
                        <td className="p-4">
                          <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-xs font-medium", statusBadgeClass(session.status))}>
                            {session.status}
                          </span>
                        </td>
                        <td className="p-4 text-muted-foreground">{formatDateTime(session.scheduledAt)}</td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => beginTrainingEdit(session)}
                              className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleTrainingDelete(session)}
                              className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-500/20"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-[380px,1fr]">
            <form onSubmit={handleAssessmentSubmit} className="modern-card space-y-4 p-6">
              <SectionHeader
                title={editingAssessmentId ? "Edit Assessment" : "Create Assessment"}
                description="Simpan hasil assessment dan biarkan trigger database memperbarui skill matrix serta audit log."
                icon={History}
              />

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Training Session</label>
                <select
                  value={assessmentForm.trainingSessionId}
                  onChange={(event) => populateAssessmentFromSession(event.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                >
                  <option value="">Manual / belum dikaitkan</option>
                  {snapshot.sessions.map((session) => (
                    <option key={session.id} value={session.id}>
                      {session.trainingCode} - {session.operatorName} / {session.skillCode}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Operator</label>
                <select
                  value={assessmentForm.operatorId}
                  onChange={(event) => setAssessmentForm((current) => ({ ...current, operatorId: event.target.value }))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                  required
                >
                  <option value="">Pilih operator</option>
                  {snapshot.operators.map((operator) => (
                    <option key={operator.id} value={operator.id}>
                      {operator.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Skill</label>
                <select
                  value={assessmentForm.skillId}
                  onChange={(event) => setAssessmentForm((current) => ({ ...current, skillId: event.target.value }))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                  required
                >
                  <option value="">Pilih skill</option>
                  {snapshot.skills.map((skill) => (
                    <option key={skill.id} value={skill.id}>
                      {skill.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Previous Level</label>
                  <select
                    value={assessmentForm.previousLevel}
                    onChange={(event) => setAssessmentForm((current) => ({ ...current, previousLevel: event.target.value }))}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                  >
                    <option value="">-</option>
                    {Array.from({ length: 4 }, (_, index) => index + 1).map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Assessed Level</label>
                  <select
                    value={assessmentForm.assessedLevel}
                    onChange={(event) => setAssessmentForm((current) => ({ ...current, assessedLevel: event.target.value }))}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                    required
                  >
                    {Array.from({ length: 4 }, (_, index) => index + 1).map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Status</label>
                <select
                  value={assessmentForm.status}
                  onChange={(event) => setAssessmentForm((current) => ({ ...current, status: event.target.value as SkillAssessmentStatus }))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                >
                  {assessmentStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Assessed By</label>
                <input
                  value={assessmentForm.assessedBy}
                  onChange={(event) => setAssessmentForm((current) => ({ ...current, assessedBy: event.target.value }))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                  placeholder="Nama assessor"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Assessed At</label>
                <input
                  type="datetime-local"
                  value={assessmentForm.assessedAt}
                  onChange={(event) => setAssessmentForm((current) => ({ ...current, assessedAt: event.target.value }))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Evidence URL</label>
                <input
                  value={assessmentForm.evidenceUrl}
                  onChange={(event) => setAssessmentForm((current) => ({ ...current, evidenceUrl: event.target.value }))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Notes</label>
                <textarea
                  value={assessmentForm.notes}
                  onChange={(event) => setAssessmentForm((current) => ({ ...current, notes: event.target.value }))}
                  className="min-h-[96px] w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                >
                  <Save className="h-4 w-4" />
                  {editingAssessmentId ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={resetAssessmentForm}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
                >
                  Reset
                </button>
              </div>
            </form>

            <div className="space-y-6">
              <div className="modern-card overflow-hidden">
                <div className="border-b border-border p-6">
                  <SectionHeader
                    title="Assessments"
                    description="Hasil assessment akan memicu audit log dan sinkronisasi skill matrix melalui trigger database."
                    icon={History}
                  />
                </div>
                <div className="border-b border-border bg-background/50 p-4">
                  <div className="grid gap-3 md:grid-cols-4">
                    <input
                      value={assessmentSearch}
                      onChange={(event) => setAssessmentSearch(event.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                      placeholder="Cari operator / skill / assessor"
                    />
                    <select
                      value={assessmentStatusFilter}
                      onChange={(event) => setAssessmentStatusFilter(event.target.value as SkillAssessmentStatus | "all")}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                    >
                      <option value="all">Semua status</option>
                      {assessmentStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    <select
                      value={assessmentOperatorFilter}
                      onChange={(event) => setAssessmentOperatorFilter(event.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                    >
                      <option value="all">Semua operator</option>
                      {snapshot.operators.map((operator) => (
                        <option key={operator.id} value={operator.id}>
                          {operator.label}
                        </option>
                      ))}
                    </select>
                    <select
                      value={assessmentSkillFilter}
                      onChange={(event) => setAssessmentSkillFilter(event.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                    >
                      <option value="all">Semua skill</option>
                      {snapshot.skills.map((skill) => (
                        <option key={skill.id} value={skill.id}>
                          {skill.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Menampilkan {filteredAssessments.length} dari {snapshot.assessments.length} assessment.
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted border-b border-border">
                      <tr>
                        <th className="p-4 text-left font-semibold text-muted-foreground">Operator</th>
                        <th className="p-4 text-left font-semibold text-muted-foreground">Skill</th>
                        <th className="p-4 text-left font-semibold text-muted-foreground">Level</th>
                        <th className="p-4 text-left font-semibold text-muted-foreground">Status</th>
                        <th className="p-4 text-left font-semibold text-muted-foreground">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td className="p-4 text-muted-foreground" colSpan={5}>
                            Loading assessments...
                          </td>
                        </tr>
                      ) : filteredAssessments.length === 0 ? (
                        <tr>
                          <td className="p-4 text-muted-foreground" colSpan={5}>
                            Tidak ada assessment yang cocok dengan filter.
                          </td>
                        </tr>
                      ) : (
                        filteredAssessments.map((assessment) => (
                          <tr key={assessment.id} className="border-b border-border hover:bg-accent/50 transition-colors">
                            <td className="p-4 text-foreground">
                              {assessment.operatorNik} - {assessment.operatorName}
                            </td>
                            <td className="p-4 text-muted-foreground">
                              {assessment.skillCode} - {assessment.skillName}
                            </td>
                            <td className="p-4 text-muted-foreground">{assessment.assessedLevel}</td>
                            <td className="p-4">
                              <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-xs font-medium", statusBadgeClass(assessment.status))}>
                                {assessment.status}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() => beginAssessmentEdit(assessment)}
                                  className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => void handleAssessmentDelete(assessment)}
                                  className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-500/20"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="modern-card overflow-hidden">
                <div className="border-b border-border p-6">
                  <SectionHeader
                    title="Audit Log"
                    description="Catatan perubahan assessment yang dihasilkan otomatis oleh database trigger."
                    icon={History}
                  />
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted border-b border-border">
                      <tr>
                        <th className="p-4 text-left font-semibold text-muted-foreground">Operator</th>
                        <th className="p-4 text-left font-semibold text-muted-foreground">Skill</th>
                        <th className="p-4 text-left font-semibold text-muted-foreground">Change</th>
                        <th className="p-4 text-left font-semibold text-muted-foreground">Changed By</th>
                        <th className="p-4 text-left font-semibold text-muted-foreground">Changed At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td className="p-4 text-muted-foreground" colSpan={5}>
                            Loading audit log...
                          </td>
                        </tr>
                      ) : snapshot.changes.length === 0 ? (
                        <tr>
                          <td className="p-4 text-muted-foreground" colSpan={5}>
                            Belum ada audit log.
                          </td>
                        </tr>
                      ) : (
                        snapshot.changes.map((change) => (
                          <tr key={change.id} className="border-b border-border hover:bg-accent/50 transition-colors">
                            <td className="p-4 text-foreground">
                              {change.operatorNik} - {change.operatorName}
                            </td>
                            <td className="p-4 text-muted-foreground">
                              {change.skillCode} - {change.skillName}
                            </td>
                            <td className="p-4 text-muted-foreground">
                              {change.changeType} {change.oldLevel ?? "-"} → {change.newLevel ?? "-"}
                              {change.oldStatus || change.newStatus ? ` (${change.oldStatus ?? "-"} → ${change.newStatus ?? "-"})` : ""}
                            </td>
                            <td className="p-4 text-muted-foreground">{change.changedBy}</td>
                            <td className="p-4 text-muted-foreground">{formatDateTime(change.changedAt)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}