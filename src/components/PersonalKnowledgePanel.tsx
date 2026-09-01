import React, { useCallback, useEffect, useState } from "react";
import KnowledgeNavigator from "./KnowledgeNavigator";
import {
  ApiError,
  deleteKnowledge,
  KnowledgeDocument,
  listKnowledge,
} from "../api";

type Props = {
  open: boolean;
  onClose: () => void;
};

function describe(error: unknown): string {
  if (error instanceof ApiError) return error.code;
  if (error instanceof Error) return error.message;
  return "KNOWLEDGE_REQUEST_FAILED";
}

function formatBytes(value: number): string {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

export default function PersonalKnowledgePanel({ open, onClose }: Props) {
  const [items, setItems] = useState<KnowledgeDocument[]>([]);
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState("");
  const [error, setError] = useState("");
  const [navigatorDocument, setNavigatorDocument] = useState<KnowledgeDocument | null>(null);

  const refresh = useCallback(async () => {
    setBusy(true);
    setError("");
    try {
      const response = await listKnowledge("PERSONAL");
      setItems(response.items);
    } catch (err) {
      setError(describe(err));
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    if (open) void refresh();
  }, [open, refresh]);

  if (!open) return null;

  async function remove(item: KnowledgeDocument) {
    setDeleting(item.id);
    setError("");
    try {
      await deleteKnowledge(item.id);
      await refresh();
    } catch (err) {
      setError(describe(err));
    } finally {
      setDeleting("");
    }
  }

  return (
    <div className="modal" role="presentation">
      <section
        className="modal-card personal-knowledge"
        role="dialog"
        aria-modal="true"
        aria-labelledby="personal-knowledge-title"
      >
        <div className="personal-knowledge__heading">
          <div>
            <span>MINHA BASE</span>
            <h2 id="personal-knowledge-title">Conhecimento pessoal</h2>
            <p>Somente a sua identidade pode listar e usar estes documentos.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Fechar">×</button>
        </div>
        {error ? <p className="console-alert" role="alert">{error}</p> : null}
        {busy ? <p role="status">Carregando sua base…</p> : null}
        {!busy && !items.length ? (
          <p className="personal-knowledge__empty">Nenhum documento pessoal armazenado.</p>
        ) : null}
        <div className="personal-knowledge__list">
          {items.map((item) => (
            <article key={item.id} className="personal-knowledge__item">
              <div>
                <strong>{item.title}</strong>
                <span>
                  v{item.version} · {item.status} · {formatBytes(item.size_bytes)}
                </span>
                <small title={item.sha256}>
                  {item.filename} · SHA {item.sha256.slice(0, 12)}…
                </small>
              </div>
              <div className="personal-knowledge__actions">
                <button type="button" onClick={() => setNavigatorDocument(item)}>
                  Navegar
                </button>
                <button
                  type="button"
                  onClick={() => void remove(item)}
                  disabled={deleting === item.id}
                >
                  {deleting === item.id ? "Removendo…" : "Remover"}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
      <KnowledgeNavigator
        open={Boolean(navigatorDocument)}
        document={navigatorDocument}
        canProcess={true}
        onClose={() => setNavigatorDocument(null)}
      />
    </div>
  );
}
