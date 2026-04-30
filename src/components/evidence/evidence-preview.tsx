"use client";

import { useState } from "react";
import {
  FileText, Download, Eye, EyeOff, File,
  Image as ImageIcon, Sheet, ChevronDown, ChevronUp,
} from "lucide-react";
import { formatFileSize, formatDateTime } from "@/lib/utils";

type EvidenceItem = {
  id: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  uploadedAt: string | Date;
};

interface EvidencePreviewProps {
  evidence: EvidenceItem;
}

export default function EvidencePreview({ evidence }: EvidencePreviewProps) {
  const [expanded, setExpanded] = useState(false);
  const [csvData, setCsvData] = useState<string[][] | null>(null);
  const [wordHtml, setWordHtml] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  const serveUrl = `/api/evidence/${evidence.id}`;
  const previewUrl = `/api/evidence/${evidence.id}/preview`;

  const isImage = evidence.mimeType.startsWith("image/");
  const isPdf = evidence.mimeType === "application/pdf";
  const isCsv = evidence.mimeType === "text/csv" || evidence.originalName.endsWith(".csv");
  const isWord =
    evidence.mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    evidence.originalName.endsWith(".docx");
  const isPreviewable = isImage || isPdf || isCsv || isWord;

  async function handleToggle() {
    if (expanded) {
      setExpanded(false);
      return;
    }

    if (isCsv && !csvData) {
      setLoadingPreview(true);
      try {
        const res = await fetch(previewUrl);
        const json = await res.json();
        setCsvData(json.rows);
      } catch {
        // show download fallback
      } finally {
        setLoadingPreview(false);
      }
    }

    if (isWord && !wordHtml) {
      setLoadingPreview(true);
      try {
        const res = await fetch(previewUrl);
        const json = await res.json();
        setWordHtml(json.html);
      } catch {
        // show download fallback
      } finally {
        setLoadingPreview(false);
      }
    }

    setExpanded(true);
  }

  function FileIcon() {
    if (isImage) return <ImageIcon className="h-4 w-4 text-blue-500" />;
    if (isPdf) return <FileText className="h-4 w-4 text-red-500" />;
    if (isCsv) return <Sheet className="h-4 w-4 text-green-500" />;
    if (isWord) return <FileText className="h-4 w-4 text-blue-600" />;
    return <File className="h-4 w-4 text-gray-400" />;
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* File header row */}
      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50">
        <FileIcon />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">{evidence.originalName}</p>
          <p className="text-xs text-gray-400">
            {formatFileSize(evidence.fileSize)} · Uploaded {formatDateTime(evidence.uploadedAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isPreviewable && (
            <button
              onClick={handleToggle}
              className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
            >
              {expanded ? (
                <><EyeOff className="h-3.5 w-3.5" /> Hide</>
              ) : (
                <><Eye className="h-3.5 w-3.5" /> Preview</>
              )}
            </button>
          )}
          <a
            href={`${serveUrl}?download=1`}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 font-medium"
          >
            <Download className="h-3.5 w-3.5" /> Download
          </a>
        </div>
      </div>

      {/* Preview area */}
      {expanded && (
        <div className="border-t border-gray-200">
          {loadingPreview && (
            <div className="flex items-center justify-center py-8 text-sm text-gray-400">
              Loading preview...
            </div>
          )}

          {!loadingPreview && isImage && (
            <div className="p-4 bg-gray-100 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={serveUrl}
                alt={evidence.originalName}
                className="max-w-full max-h-[600px] object-contain rounded"
              />
            </div>
          )}

          {!loadingPreview && isPdf && (
            <iframe
              src={serveUrl}
              className="w-full h-[700px] border-0"
              title={evidence.originalName}
            />
          )}

          {!loadingPreview && isCsv && csvData && (
            <div className="overflow-auto max-h-[500px] p-4">
              <table className="min-w-full text-xs border-collapse">
                <thead>
                  <tr>
                    {csvData[0]?.map((cell, i) => (
                      <th
                        key={i}
                        className="text-left px-3 py-2 bg-gray-100 border border-gray-200 font-semibold text-gray-700 whitespace-nowrap"
                      >
                        {cell}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {csvData.slice(1, 200).map((row, ri) => (
                    <tr key={ri} className={ri % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      {row.map((cell, ci) => (
                        <td key={ci} className="px-3 py-1.5 border border-gray-200 text-gray-700">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {csvData.length > 201 && (
                    <tr>
                      <td
                        colSpan={csvData[0]?.length ?? 1}
                        className="px-3 py-2 text-center text-gray-400 text-xs"
                      >
                        Showing 200 of {csvData.length - 1} rows
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {!loadingPreview && isWord && wordHtml && (
            <div
              className="prose prose-sm max-w-none p-6 overflow-auto max-h-[700px]"
              dangerouslySetInnerHTML={{ __html: wordHtml }}
            />
          )}

          {!loadingPreview && isWord && !wordHtml && (
            <div className="py-6 text-center text-sm text-gray-400">
              Could not render preview.{" "}
              <a href={`${serveUrl}?download=1`} className="text-indigo-600 hover:underline">
                Download the file
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
