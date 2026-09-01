import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ApiError,
  getKnowledgeContent,
  getKnowledgeStructure,
  KnowledgeContentPreview,
  KnowledgeDocument,
  KnowledgeStructure,
  processKnowledgeDocument,
  saveKnowledgeSelection,
} from "../api";

type Props = {
  open: boolean;
  document: KnowledgeDocument | null;
  canProcess: boolean;
  onClose: () => void;
};

function describe(error: unknown): string {
  if (error instanceof ApiError) return error.code;
  if (error instanceof Error) return error.message;
  return "KNOWLEDGE_NAVIGATOR_FAILED";
}

function formatNumber(value?: number | null): string {
  return typeof value === "number" ? value.toLocaleString("pt-BR") : "—";
}

export default function KnowledgeNavigator({
  open,
  document,
  canProcess,
  onClose,
}: Props) {
  const [structure, setStructure] = useState<KnowledgeStructure | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [mode, setMode] = useState<"AUTO" | "MANUAL">("AUTO");
  const [busy, setBusy] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewBusy, setPreviewBusy] = useState(false);
  const [preview, setPreview] = useState<KnowledgeContentPreview | null>(null);
  const [error, setError] = useState("");
  const documentId = document?.id || "";

  const refresh = useCallback(async () => {
    if (!documentId) return;
    setBusy(true);
    setError("");
    try {
      const payload = await getKnowledgeStructure(documentId);
      setStructure(payload);
      setMode(payload.selection?.mode === "MANUAL" ? "MANUAL" : "AUTO");
      setSelected(new Set(payload.selection?.section_ids || []));
    } catch (err) {
      setError(describe(err));
    } finally {
      setBusy(false);
    }
  }, [documentId]);

  useEffect(() => {
    if (open && documentId) void refresh();
    if (!open) {
      setPreview(null);
      setError("");
    }
  }, [open, documentId, refresh]);

  const ready = ["READY", "PARTIAL"].includes(structure?.derivative?.status || "");
  const selectedCount = selected.size;
  const allSections = structure?.sections || [];
  const selectedTokenEstimate = useMemo(
    () =>
      allSections
        .filter((section) => selected.has(section.id))
        .reduce((total, section) => total + (section.estimated_tokens || 0), 0),
    [allSections, selected],
  );

  if (!open || !document) return null;

  async function process() {
    setProcessing(true);
    setError("");
    try {
      if (!documentId) return;
      await processKnowledgeDocument(documentId);
      await refresh();
    } catch (err) {
      setError(describe(err));
    } finally {
      setProcessing(false);
    }
  }

  async function save(modeToSave: "AUTO" | "MANUAL") {
    setSaving(true);
    setError("");
    try {
      const payload = await saveKnowledgeSelection(documentId, {
        mode: modeToSave,
        section_ids: modeToSave === "MANUAL" ? Array.from(selected) : [],
      });
      setMode(payload.mode);
      setSelected(new Set(payload.section_ids || []));
    } catch (err) {
      setError(describe(err));
    } finally {
      setSaving(false);
    }
  }

  async function loadPreview() {
    if (!ready) return;
    setPreviewBusy(true);
    setError("");
    try {
      const ids = mode === "MANUAL" ? Array.from(selected) : [];
      const payload = await getKnowledgeContent(documentId, ids, 40_000);
      setPreview(payload);
    } catch (err) {
      setError(describe(err));
    } finally {
      setPreviewBusy(false);
    }
  }

  function toggle(sectionId: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  }

  return (
    <div className="modal" role="presentation">
      <section
        className="modal-card knowledge-navigator"
        role="dialog"
        aria-modal="true"
        aria-labelledby="knowledge-navigator-title"
      >
        <div className="knowledge-navigator__heading">
          <div>
            <span>DOCUMENT NAVIGATOR</span>
            <h2 id="knowledge-navigator-title">{document.title}</h2>
            <p>
              O original permanece preservado. Somente as seções selecionadas ou
              recuperadas entram no contexto do modelo.
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Fechar">×</button>
        </div>

        {error ? <p className="console-alert" role="alert">{error}</p> : null}
        {busy ? <p role="status">Lendo índice documental…</p> : null}

        {!busy && structure ? (
          <>
            <div className="knowledge-navigator__status">
              <strong>{structure.derivative?.status || "NÃO PROCESSADO"}</strong>
              <span>
                {formatNumber(structure.derivative?.page_count)} páginas ·{" "}
                {formatNumber(structure.derivative?.canonical_chars)} caracteres canônicos ·{" "}
                {structure.sections.length} seções · {structure.chunk_count} chunks
              </span>
              {structure.derivative?.warnings?.length ? (
                <small>{structure.derivative.warnings.join(" · ")}</small>
              ) : null}
            </div>

            {!ready ? (
              <div className="knowledge-navigator__processing">
                <p>
                  O documento foi armazenado, mas a camada canônica ainda não está pronta.
                </p>
                {canProcess ? (
                  <button type="button" disabled={processing} onClick={() => void process()}>
                    {processing ? "Processando…" : "Processar e indexar"}
                  </button>
                ) : (
                  <small>O processamento precisa ser iniciado por um gestor autorizado.</small>
                )}
              </div>
            ) : (
              <>
                <div className="knowledge-navigator__mode">
                  <button
                    type="button"
                    className={mode === "AUTO" ? "knowledge-navigator__active" : ""}
                    onClick={() => void save("AUTO")}
                    disabled={saving}
                  >
                    Modo automático · retrieval
                  </button>
                  <button
                    type="button"
                    className={mode === "MANUAL" ? "knowledge-navigator__active" : ""}
                    onClick={() => setMode("MANUAL")}
                    disabled={saving}
                  >
                    Seleção manual
                  </button>
                </div>

                {mode === "MANUAL" ? (
                  <>
                    <div className="knowledge-navigator__selection-summary">
                      <span>{selectedCount} seções selecionadas</span>
                      <span>~{selectedTokenEstimate.toLocaleString("pt-BR")} tokens elegíveis</span>
                      <button
                        type="button"
                        onClick={() => void save("MANUAL")}
                        disabled={saving || selectedCount === 0}
                      >
                        {saving ? "Salvando…" : "Usar selecionados"}
                      </button>
                    </div>
                    <div className="knowledge-navigator__sections" role="list">
                      {structure.sections.map((section) => (
                        <label
                          className="knowledge-navigator__section"
                          key={section.id}
                          style={{ paddingLeft: `${Math.min(section.level, 5) * 12 + 10}px` }}
                        >
                          <input
                            type="checkbox"
                            checked={selected.has(section.id)}
                            onChange={() => toggle(section.id)}
                          />
                          <span>
                            <strong>{section.heading}</strong>
                            <small>
                              {section.page_start
                                ? `p. ${section.page_start}${section.page_end && section.page_end !== section.page_start ? `–${section.page_end}` : ""} · `
                                : ""}
                              {section.chunk_count} chunks · ~
                              {section.estimated_tokens.toLocaleString("pt-BR")} tokens
                            </small>
                          </span>
                        </label>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="knowledge-navigator__automatic">
                    O sistema ranqueia chunks pela pergunta atual e hidrata somente o
                    contexto dentro do budget configurado.
                  </p>
                )}

                <div className="knowledge-navigator__preview-actions">
                  <button type="button" disabled={previewBusy} onClick={() => void loadPreview()}>
                    {previewBusy ? "Carregando…" : "Pré-visualizar contexto"}
                  </button>
                </div>
                {preview ? (
                  <div className="knowledge-navigator__preview">
                    <div>
                      {preview.provided_chars.toLocaleString("pt-BR")} caracteres exibidos
                      {preview.truncated ? " · preview truncado" : ""}
                    </div>
                    {preview.sections.map((section) => (
                      <article key={section.section_id}>
                        <h3>{section.heading}</h3>
                        <pre>{section.content}</pre>
                      </article>
                    ))}
                  </div>
                ) : null}
              </>
            )}
          </>
        ) : null}

        <p className="knowledge-navigator__boundary">
          Tenant, escopo, status e identidade são revalidados pelo backend. O Navigator
          não concede acesso por si só.
        </p>
      </section>
    </div>
  );
}
