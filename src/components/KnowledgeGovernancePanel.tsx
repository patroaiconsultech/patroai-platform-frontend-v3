import React, { useCallback, useEffect, useRef, useState } from "react";
import KnowledgeNavigator from "./KnowledgeNavigator";
import {
  ApiError,
  deleteKnowledge,
  KnowledgeDocument,
  KnowledgeScope,
  listKnowledge,
  listKnowledgeVersions,
  publishKnowledge,
  revokeKnowledge,
  supersedeKnowledge,
  uploadKnowledge,
} from "../api";

type Props = {
  isPlatformOwner: boolean;
};

function describe(error: unknown): string {
  if (error instanceof ApiError) return error.code;
  if (error instanceof Error) return error.message;
  return "KNOWLEDGE_REQUEST_FAILED";
}

function scopeLabel(scope: KnowledgeScope): string {
  if (scope === "PLATFORM") return "Diretrizes PatroAI";
  if (scope === "INSTITUTIONAL") return "Base institucional";
  return "Minha base";
}

export default function KnowledgeGovernancePanel({ isPlatformOwner }: Props) {
  const [scope, setScope] = useState<KnowledgeScope>("INSTITUTIONAL");
  const [items, setItems] = useState<KnowledgeDocument[]>([]);
  const [busy, setBusy] = useState(false);
  const [actionBusy, setActionBusy] = useState("");
  const [error, setError] = useState("");
  const [versions, setVersions] = useState<Record<string, KnowledgeDocument[]>>({});
  const [pendingSupersede, setPendingSupersede] = useState<KnowledgeDocument | null>(null);
  const [navigatorDocument, setNavigatorDocument] = useState<KnowledgeDocument | null>(null);
  const uploadRef = useRef<HTMLInputElement | null>(null);
  const supersedeRef = useRef<HTMLInputElement | null>(null);

  const refresh = useCallback(async () => {
    setBusy(true);
    setError("");
    try {
      const response = await listKnowledge(scope);
      setItems(response.items);
    } catch (err) {
      setError(describe(err));
      setItems([]);
    } finally {
      setBusy(false);
    }
  }, [scope]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setActionBusy("upload");
    setError("");
    try {
      await uploadKnowledge(scope, file);
      await refresh();
    } catch (err) {
      setError(describe(err));
    } finally {
      setActionBusy("");
    }
  }

  async function handleSupersede(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    const current = pendingSupersede;
    setPendingSupersede(null);
    if (!file || !current) return;
    setActionBusy(current.id);
    setError("");
    try {
      await supersedeKnowledge(current.id, file);
      await refresh();
    } catch (err) {
      setError(describe(err));
    } finally {
      setActionBusy("");
    }
  }

  async function mutate(
    item: KnowledgeDocument,
    action: "publish" | "revoke" | "delete",
  ) {
    setActionBusy(item.id);
    setError("");
    try {
      if (action === "publish") await publishKnowledge(item.id);
      if (action === "revoke") await revokeKnowledge(item.id);
      if (action === "delete") await deleteKnowledge(item.id);
      await refresh();
    } catch (err) {
      setError(describe(err));
    } finally {
      setActionBusy("");
    }
  }

  async function toggleVersions(item: KnowledgeDocument) {
    if (versions[item.logical_document_id]) {
      setVersions((current) => {
        const next = { ...current };
        delete next[item.logical_document_id];
        return next;
      });
      return;
    }
    setActionBusy(`versions:${item.id}`);
    setError("");
    try {
      const response = await listKnowledgeVersions(item.logical_document_id);
      setVersions((current) => ({
        ...current,
        [item.logical_document_id]: response.items,
      }));
    } catch (err) {
      setError(describe(err));
    } finally {
      setActionBusy("");
    }
  }

  const latestByLogicalId = items.filter(
    (item, index, all) =>
      all.findIndex((candidate) => candidate.logical_document_id === item.logical_document_id) === index,
  );

  return (
    <section className="admin-section knowledge-governance">
      <div className="admin-section__heading">
        <div>
          <span>KNOWLEDGE PLANE</span>
          <h2>{scopeLabel(scope)}</h2>
          <small>
            Uploads institucionais e globais entram como DRAFT; publicação, supersede e revoke são explícitos.
          </small>
        </div>
        <div className="knowledge-governance__toolbar">
          {isPlatformOwner ? (
            <label>
              Escopo
              <select
                value={scope}
                onChange={(event) => setScope(event.target.value as KnowledgeScope)}
              >
                <option value="INSTITUTIONAL">Base institucional</option>
                <option value="PLATFORM">Diretrizes PatroAI</option>
              </select>
            </label>
          ) : null}
          <button
            type="button"
            onClick={() => uploadRef.current?.click()}
            disabled={actionBusy === "upload"}
          >
            {actionBusy === "upload" ? "Enviando…" : "Adicionar documento"}
          </button>
          <input
            ref={uploadRef}
            hidden
            type="file"
            accept=".pdf,.txt,.csv,.md,.markdown,.json,.docx,.xlsx,.pptx"
            onChange={handleUpload}
          />
          <input
            ref={supersedeRef}
            hidden
            type="file"
            accept=".pdf,.txt,.csv,.md,.markdown,.json,.docx,.xlsx,.pptx"
            onChange={handleSupersede}
          />
        </div>
      </div>

      {error ? <p className="admin-knowledge-error" role="alert">{error}</p> : null}
      {busy ? <p role="status">Carregando conhecimento governado…</p> : null}
      {!busy && !latestByLogicalId.length ? (
        <p>Nenhum documento governado neste escopo.</p>
      ) : null}

      <div className="knowledge-governance__list">
        {latestByLogicalId.map((item) => {
          const rowBusy = actionBusy === item.id;
          const itemVersions = versions[item.logical_document_id];
          return (
            <article className="knowledge-governance__item" key={item.id}>
              <div className="knowledge-governance__meta">
                <strong>{item.title}</strong>
                <span>
                  v{item.version} · {item.status} · {item.classification}
                  {item.agent_id ? ` · agente ${item.agent_id}` : ""}
                </span>
                <small title={item.sha256}>
                  {item.filename} · SHA {item.sha256.slice(0, 12)}…
                </small>
              </div>
              <div className="knowledge-governance__actions">
                {item.status === "DRAFT" ? (
                  <>
                    <button type="button" disabled={rowBusy} onClick={() => void mutate(item, "publish")}>
                      Publicar
                    </button>
                    <button type="button" disabled={rowBusy} onClick={() => void mutate(item, "delete")}>
                      Excluir draft
                    </button>
                  </>
                ) : null}
                {item.status === "ACTIVE" ? (
                  <>
                    <button
                      type="button"
                      disabled={rowBusy}
                      onClick={() => {
                        setPendingSupersede(item);
                        supersedeRef.current?.click();
                      }}
                    >
                      Substituir versão
                    </button>
                    <button type="button" disabled={rowBusy} onClick={() => void mutate(item, "revoke")}>
                      Revogar
                    </button>
                  </>
                ) : null}
                <button type="button" onClick={() => setNavigatorDocument(item)}>
                  Navegar
                </button>
                <button
                  type="button"
                  disabled={actionBusy === `versions:${item.id}`}
                  onClick={() => void toggleVersions(item)}
                >
                  {itemVersions ? "Ocultar histórico" : "Histórico"}
                </button>
              </div>
              {itemVersions ? (
                <ol className="knowledge-governance__versions">
                  {itemVersions.map((version) => (
                    <li key={version.id}>
                      v{version.version} · {version.status} · {version.filename}
                    </li>
                  ))}
                </ol>
              ) : null}
            </article>
          );
        })}
      </div>
      <p className="knowledge-governance__boundary">
        O painel não concede autoridade: o backend valida papel canônico e tenant em cada operação.
      </p>
      <KnowledgeNavigator
        open={Boolean(navigatorDocument)}
        document={navigatorDocument}
        canProcess={true}
        onClose={() => setNavigatorDocument(null)}
      />
    </section>
  );
}
