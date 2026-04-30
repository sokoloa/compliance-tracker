"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, FileText, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import { formatFileSize } from "@/lib/utils";

interface CompleteTaskFormProps {
  instanceId: string;
  requiresApproval: boolean;
  userId: string;
  userName: string;
}

const ACCEPTED_TYPES = [
  "application/pdf",
  "image/png", "image/jpeg", "image/gif", "image/webp",
  "text/csv",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "text/plain",
];

export default function CompleteTaskForm({
  instanceId, requiresApproval,
}: CompleteTaskFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [notes, setNotes] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [approverName, setApproverName] = useState("");
  const [approverTitle, setApproverTitle] = useState("");
  const [approverTeam, setApproverTeam] = useState("");
  const [approvedAt, setApprovedAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const hasEvidence = files.length > 0;
  const hasNotes = notes.trim().length > 0;
  const canSubmit = hasEvidence || hasNotes;

  function addFiles(incoming: FileList | File[]) {
    const valid = Array.from(incoming).filter((f) =>
      ACCEPTED_TYPES.includes(f.type) || f.name.endsWith(".docx") || f.name.endsWith(".csv")
    );
    setFiles((prev) => {
      const existing = new Set(prev.map((f) => f.name));
      return [...prev, ...valid.filter((f) => !existing.has(f.name))];
    });
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) {
      setError("Please add notes or upload at least one evidence file.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("instanceId", instanceId);
      formData.append("notes", notes);
      formData.append("approverName", approverName);
      formData.append("approverTitle", approverTitle);
      formData.append("approverTeam", approverTeam);
      formData.append("approvedAt", approvedAt);
      files.forEach((f) => formData.append("files", f));

      const res = await fetch(`/api/tasks/${instanceId}/complete`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to complete task");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Notes
          <span className="text-gray-400 font-normal ml-1">(required if no files uploaded)</span>
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={5}
          placeholder="Describe what was done, findings, actions taken, links to internal docs..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
        />
      </div>

      {/* File upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Evidence Files
          <span className="text-gray-400 font-normal ml-1">(PDF, images, CSV, Word docs)</span>
        </label>

        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            addFiles(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            dragOver
              ? "border-indigo-400 bg-indigo-50"
              : "border-gray-300 hover:border-indigo-300 hover:bg-gray-50"
          }`}
        >
          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">
            Drop files here or <span className="text-indigo-600 font-medium">browse</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">PDF, PNG, JPG, CSV, DOCX — up to 50 MB each</p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,.csv,.docx,.doc,.txt"
            className="hidden"
            onChange={(e) => e.target.files && addFiles(e.target.files)}
          />
        </div>

        {files.length > 0 && (
          <ul className="mt-3 space-y-2">
            {files.map((file, i) => (
              <li key={i} className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2.5">
                <FileText className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 truncate">{file.name}</p>
                  <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="text-gray-400 hover:text-gray-700 p-0.5"
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Approver section */}
      <div className="border border-gray-200 rounded-lg p-4 space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-700">Approver / Reviewer Information</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {requiresApproval ? "This task type requires approval tracking." : "Optional — fill in if this task was reviewed or approved by someone."}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Approver Name</label>
            <input
              type="text"
              value={approverName}
              onChange={(e) => setApproverName(e.target.value)}
              placeholder="Jane Smith"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Title / Role</label>
            <input
              type="text"
              value={approverTitle}
              onChange={(e) => setApproverTitle(e.target.value)}
              placeholder="CISO, Security Lead..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Team / Department</label>
            <input
              type="text"
              value={approverTeam}
              onChange={(e) => setApproverTeam(e.target.value)}
              placeholder="Security, Legal, IT..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Approval Date</label>
            <input
              type="date"
              value={approvedAt}
              onChange={(e) => setApprovedAt(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Validation hint */}
      {!canSubmit && (
        <p className="text-xs text-amber-600 flex items-center gap-1.5">
          <AlertCircle className="h-3.5 w-3.5" />
          You must add notes or upload at least one file before marking complete.
        </p>
      )}

      <button
        type="submit"
        disabled={loading || !canSubmit}
        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 px-6 rounded-lg text-sm transition-colors"
      >
        {loading ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
        ) : (
          <><CheckCircle2 className="h-4 w-4" /> Mark Complete</>
        )}
      </button>
    </form>
  );
}
