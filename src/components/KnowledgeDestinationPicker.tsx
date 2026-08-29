import React from "react";
import type { KnowledgeScope } from "../api";

export type KnowledgeDestination = "THREAD" | KnowledgeScope;

type Props = {
  open: boolean;
  hasThread: boolean;
  isTenantAdmin: boolean;
  isPlatformOwner: boolean;
  onSelect: (destination: KnowledgeDestination) => void;
  onClose: () => void;
};

const destinations: Array<{
  id: KnowledgeDestination;
  title: string;
  description: string;
}> = [
  {
    id: "THREAD",
    title: "Nesta conversa",
    description: "Usa o documento somente no contexto desta conversa.",
  },
  {
    id: "PERSONAL",
    title: "Minha base",
    description: "Disponível para você em outras conversas.",
  },
  {
    id: "INSTITUTIONAL",
    title: "Base institucional",
    description: "Rascunho governado para esta organização.",
  },
  {
    id: "PLATFORM",
    title: "Diretrizes PatroAI",
    description: "Rascunho global da PatroAI Platform; publicação exige platform_owner.",
  },
];

export default function KnowledgeDestinationPicker({
  open,
  hasThread,
  isTenantAdmin,
  isPlatformOwner,
  onSelect,
  onClose,
}: Props) {
  if (!open) return null;

  const visible = destinations.filter((item) => {
    if (item.id === "INSTITUTIONAL") return isTenantAdmin;
    if (item.id === "PLATFORM") return isPlatformOwner;
    return true;
  });

  return (
    <div className="modal" role="presentation">
      <section
        className="modal-card knowledge-destination"
        role="dialog"
        aria-modal="true"
        aria-labelledby="knowledge-destination-title"
      >
        <div className="knowledge-destination__heading">
          <div>
            <span>CONHECIMENTO · DESTINO</span>
            <h2 id="knowledge-destination-title">Onde este documento deve viver?</h2>
            <p>O destino define isolamento, reutilização e governança.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Fechar">×</button>
        </div>
        <div className="knowledge-destination__grid">
          {visible.map((item) => {
            const disabled = item.id === "THREAD" && !hasThread;
            return (
              <button
                key={item.id}
                type="button"
                className="knowledge-destination__option"
                disabled={disabled}
                onClick={() => onSelect(item.id)}
              >
                <strong>{item.title}</strong>
                <span>{disabled ? "Selecione ou crie uma conversa primeiro." : item.description}</span>
              </button>
            );
          })}
        </div>
        <p className="knowledge-destination__security">
          Opções visíveis são apenas conveniência de interface. O backend revalida tenant e papel em toda operação.
        </p>
      </section>
    </div>
  );
}
