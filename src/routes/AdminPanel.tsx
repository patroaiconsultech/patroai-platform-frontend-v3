import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AdminGovernance,
  AdminOverview,
  AdminSecurityStatus,
  AdminVoiceCatalogEntry,
  AdminAgentVoiceAssignment,
  AdminUser,
  AgentDefinition,
  getAdminAgents,
  getAdminGovernance,
  getAdminOverview,
  getAdminSecurityStatus,
  getAdminVoiceCatalog,
  getAdminAgentVoiceAssignments,
  getAdminTeams,
  getAdminUsers,
  getMe,
  HyperCocreatorMe,
  TeamDefinition,
} from "../api";
import KnowledgeGovernancePanel from "../components/KnowledgeGovernancePanel";
import "../admin.css";

type AdminView =
  | "command"
  | "users"
  | "usage"
  | "agents"
  | "teams"
  | "knowledge"
  | "voices"
  | "security";

type DomainState = "loading" | "ok" | "unavailable";

const NAV: Array<{ id: AdminView; label: string; kicker: string }> = [
  { id: "command", label: "Command Center", kicker: "Operação" },
  { id: "users", label: "Usuários", kicker: "Acesso" },
  { id: "usage", label: "Usage & Cost", kicker: "Economia" },
  { id: "agents", label: "Agentes", kicker: "Inteligência" },
  { id: "teams", label: "Teams", kicker: "Orquestração" },
  { id: "knowledge", label: "Knowledge", kicker: "Governança" },
  { id: "voices", label: "Vozes", kicker: "Catálogo" },
  { id: "security", label: "Security", kicker: "Controles" },
];

function stateLabel(value?: string | null) {
  const state = String(value || "unknown").toLowerCase();
  if (["ready", "available", "active", "ok", "enabled"].includes(state)) return "Disponível";
  if (["degraded", "limited", "partial"].includes(state)) return "Limitado";
  if (["offline", "disabled", "unavailable", "error"].includes(state)) return "Indisponível";
  return value || "Não informado";
}

function yesNo(value?: boolean | null) {
  if (value === true) return "Ativo";
  if (value === false) return "Inativo";
  return "—";
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(date);
}

function DomainBadge({ state }: { state: DomainState }) {
  const label = state === "ok" ? "OK" : state === "unavailable" ? "Indisponível" : "Carregando";
  return <span className={`admin-domain-badge is-${state}`}>{label}</span>;
}

export default function AdminPanel() {
  const [view, setView] = useState<AdminView>("command");
  const [me, setMe] = useState<HyperCocreatorMe | null>(null);
  const [data, setData] = useState<AdminOverview | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [agents, setAgents] = useState<AgentDefinition[]>([]);
  const [teams, setTeams] = useState<TeamDefinition[]>([]);
  const [voiceCatalog, setVoiceCatalog] = useState<AdminVoiceCatalogEntry[]>([]);
  const [voiceAssignments, setVoiceAssignments] = useState<AdminAgentVoiceAssignment[]>([]);
  const [security, setSecurity] = useState<AdminSecurityStatus | null>(null);
  const [governance, setGovernance] = useState<AdminGovernance | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<AgentDefinition | null>(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [domainState, setDomainState] = useState<Record<
    "overview" | "users" | "agents" | "teams" | "voices" | "security" | "governance",
    DomainState
  >>({
    overview: "loading",
    users: "loading",
    agents: "loading",
    teams: "loading",
    voices: "loading",
    security: "loading",
    governance: "loading",
  });

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const profile = await getMe();
        if (!active) return;
        setMe(profile);
        if (!profile.admin_access) {
          setError("Acesso administrativo não autorizado.");
          return;
        }
        const [overview, userRows, catalog, teamCatalog, voiceRows, assignmentRows, securityStatus, governanceStatus] =
          await Promise.allSettled([
            getAdminOverview(),
            getAdminUsers(),
            getAdminAgents(),
            getAdminTeams(),
            getAdminVoiceCatalog(),
            getAdminAgentVoiceAssignments(),
            getAdminSecurityStatus(),
            getAdminGovernance(),
          ]);
        if (!active) return;

        setDomainState({
          overview: overview.status === "fulfilled" ? "ok" : "unavailable",
          users: userRows.status === "fulfilled" ? "ok" : "unavailable",
          agents: catalog.status === "fulfilled" ? "ok" : "unavailable",
          teams: teamCatalog.status === "fulfilled" ? "ok" : "unavailable",
          voices: voiceRows.status === "fulfilled" && assignmentRows.status === "fulfilled" ? "ok" : "unavailable",
          security: securityStatus.status === "fulfilled" ? "ok" : "unavailable",
          governance: governanceStatus.status === "fulfilled" ? "ok" : "unavailable",
        });

        if (overview.status === "fulfilled") setData(overview.value);
        if (userRows.status === "fulfilled") setUsers(userRows.value);
        if (catalog.status === "fulfilled") setAgents(catalog.value);
        if (teamCatalog.status === "fulfilled") setTeams(teamCatalog.value);
        if (voiceRows.status === "fulfilled") setVoiceCatalog(voiceRows.value);
        if (assignmentRows.status === "fulfilled") setVoiceAssignments(assignmentRows.value);
        if (securityStatus.status === "fulfilled") setSecurity(securityStatus.value);
        if (governanceStatus.status === "fulfilled") setGovernance(governanceStatus.value);
      } catch {
        if (active) setError("Não foi possível carregar o centro de operações.");
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, []);

  const filteredUsers = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return users;
    return users.filter((user) =>
      [user.email, user.display_name, user.role, user.user_id]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle)),
    );
  }, [query, users]);

  const activeAgents = agents.filter((agent) =>
    ["ready", "available", "active"].includes(
      String(agent.availability?.state || agent.availability?.chat?.status || "").toLowerCase(),
    ),
  ).length;
  const verifiedUsers = users.filter((user) => user.email_verified).length;

  if (error) {
    return (
      <main className="admin-shell admin-shell--centered" id="main-content">
        <section className="admin-denied">
          <span>PLATAFORMA · ACESSO RESTRITO</span>
          <h1>Operação indisponível</h1>
          <p>{error}</p>
          <Link to="/app">Voltar à Plataforma</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="admin-ops" id="main-content">
      <aside className="admin-ops__rail" aria-label="Navegação administrativa">
        <div className="admin-ops__brand">
          <span className="admin-ops__signal" aria-hidden="true" />
          <div>
            <strong>PatroAI</strong>
            <small>Operations</small>
          </div>
        </div>

        <nav>
          {NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              className={view === item.id ? "is-active" : ""}
              onClick={() => setView(item.id)}
              aria-current={view === item.id ? "page" : undefined}
            >
              <small>{item.kicker}</small>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="admin-ops__rail-footer">
          <span>{data?.environment || "—"}</span>
          <small title={data?.release_sha || ""}>
            release {data?.release_sha ? data.release_sha.slice(0, 9) : "—"}
          </small>
          <Link to="/app">Voltar à Plataforma</Link>
        </div>
      </aside>

      <section className="admin-ops__workspace">
        <header className="admin-ops__header">
          <div>
            <span className="admin-eyebrow">PAINEL DIGITAL DE OPERAÇÕES</span>
            <h1>{NAV.find((item) => item.id === view)?.label}</h1>
            <p>
              {view === "command" && "Sinais executivos, disponibilidade e governança em uma única superfície."}
              {view === "users" && "Acesso, identidade e contexto operacional dos usuários deste tenant."}
              {view === "usage" && "Base preparada para telemetria de tokens, custo e eficiência por usuário."}
              {view === "agents" && "Catálogo canônico, disponibilidade e preparação para edição governada."}
              {view === "teams" && "Visão dos times orquestrados e das políticas de participação."}
              {view === "knowledge" && "Ciclo de vida e governança do conhecimento autorizado."}
              {view === "security" && "Postura de segurança e flags operacionais expostas pelo backend."}
            </p>
          </div>
          <div className="admin-ops__identity">
            <span>Operador</span>
            <strong>{me?.email || "Carregando…"}</strong>
            <small>{me?.tenant_id ? `tenant · ${me.tenant_id}` : ""}</small>
          </div>
        </header>

        {loading ? (
          <section className="admin-loading" aria-live="polite">
            <span />
            <div>
              <strong>Sincronizando operação</strong>
              <p>Carregando contratos administrativos canônicos…</p>
            </div>
          </section>
        ) : (
          <>
            {view === "command" && (
              <div className="admin-view">
                <section className="admin-kpis" aria-label="Indicadores operacionais">
                  <article>
                    <span>Usuários ativos</span>
                    <strong>{domainState.overview === "ok" ? data?.users ?? "—" : "—"}</strong>
                    <small>{domainState.overview === "ok" ? `${verifiedUsers} com e-mail verificado` : "Overview indisponível"}</small>
                  </article>
                  <article>
                    <span>Conversas</span>
                    <strong>{domainState.overview === "ok" ? data?.threads ?? "—" : "—"}</strong>
                    <small>{domainState.overview === "ok" ? `${data?.messages ?? 0} mensagens persistidas` : "Overview indisponível"}</small>
                  </article>
                  <article>
                    <span>Agentes</span>
                    <strong>{domainState.agents === "ok" ? agents.length : "—"}</strong>
                    <small>{domainState.agents === "ok" ? `${activeAgents} reportados como disponíveis` : "Catálogo indisponível"}</small>
                  </article>
                  <article>
                    <span>Teams</span>
                    <strong>{domainState.teams === "ok" ? teams.length : "—"}</strong>
                    <small>{domainState.teams === "ok" ? "orquestrações cadastradas" : "Teams indisponíveis"}</small>
                  </article>
                </section>

                <section className="admin-command-grid">
                  <article className="admin-panel admin-panel--wide">
                    <div className="admin-panel__heading">
                      <div>
                        <span>SISTEMA</span>
                        <h2>Estado operacional</h2>
                      </div>
                      <div className="admin-domain-summary" aria-label="Estado dos contratos operacionais">
                        <span>Governança <DomainBadge state={domainState.governance} /></span>
                        <span>Security <DomainBadge state={domainState.security} /></span>
                      </div>
                    </div>
                    <div className="admin-status-grid">
                      <div><span>Ambiente</span><strong>{governance?.environment || "—"}</strong></div>
                      <div><span>Provider primário</span><strong>{governance?.llm_primary_provider || "—"}</strong></div>
                      <div><span>Artifacts</span><strong>{yesNo(governance?.artifacts_enabled)}</strong></div>
                      <div><span>Voice</span><strong>{yesNo(governance?.voice_enabled)}</strong></div>
                      <div><span>Realtime streaming</span><strong>{yesNo(governance?.realtime_streaming_enabled)}</strong></div>
                      <div><span>Access gate</span><strong>{yesNo(governance?.access_gate_enabled)}</strong></div>
                    </div>
                  </article>

                  <article className="admin-panel">
                    <div className="admin-panel__heading">
                      <div>
                        <span>ECONOMIA</span>
                        <h2>Usage & Cost</h2>
                      </div>
                    </div>
                    <div className="admin-empty-metric">
                      <strong>Telemetria financeira não persistida</strong>
                      <p>
                        O runtime expõe token usage, mas este baseline ainda não comprova um ledger
                        histórico agregável por usuário. Nenhum custo estimado é inventado nesta tela.
                      </p>
                      <button type="button" onClick={() => setView("usage")}>Ver arquitetura preparada</button>
                    </div>
                  </article>

                  <article className="admin-panel">
                    <div className="admin-panel__heading">
                      <div>
                        <span>GOVERNANÇA</span>
                        <h2>Controles críticos</h2>
                      </div>
                    </div>
                    <div className="admin-control-list">
                      <div><span>GitHub</span><strong>{security?.github_read_only ? "Somente leitura" : "Não confirmado"}</strong></div>
                      <div><span>Evolução automática</span><strong>{security?.evolution_execution_allowed ? "Permitida" : "Bloqueada"}</strong></div>
                      <div><span>Demo headers</span><strong>{security?.demo_headers_enabled ? "Ativos" : "Inativos"}</strong></div>
                      <div><span>Auth</span><strong>{security?.auth_mode || "—"}</strong></div>
                    </div>
                  </article>
                </section>
              </div>
            )}

            {view === "users" && (
              <div className="admin-view">
                <section className="admin-toolbar">
                  <div>
                    <span>{domainState.users === "ok" ? `${users.length} usuários no tenant` : "Usuários indisponíveis"}</span>
                    <small>Visualização somente leitura neste baseline. <DomainBadge state={domainState.users} /></small>
                  </div>
                  <label>
                    <span className="sr-only">Buscar usuário</span>
                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Buscar por nome, e-mail ou função…"
                    />
                  </label>
                </section>

                <section className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Usuário</th>
                        <th>Função</th>
                        <th>Status</th>
                        <th>Verificação</th>
                        <th>Desde</th>
                        <th><span className="sr-only">Ações</span></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.user_id}>
                          <td>
                            <strong>{user.display_name || user.email}</strong>
                            <small>{user.email}</small>
                          </td>
                          <td>{user.role}</td>
                          <td><span className={`admin-dot ${user.active ? "is-good" : ""}`} />{user.active ? "Ativo" : "Inativo"}</td>
                          <td>{user.email_verified ? "Verificado" : "Pendente"}</td>
                          <td>{formatDate(user.created_at)}</td>
                          <td><button type="button" onClick={() => setSelectedUser(user)}>Abrir</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>

                {selectedUser && (
                  <aside className="admin-drawer" aria-label="Detalhes do usuário">
                    <button className="admin-drawer__close" type="button" onClick={() => setSelectedUser(null)} aria-label="Fechar">×</button>
                    <span className="admin-eyebrow">USUÁRIO</span>
                    <h2>{selectedUser.display_name || selectedUser.email}</h2>
                    <p>{selectedUser.email}</p>
                    <dl>
                      <div><dt>Função</dt><dd>{selectedUser.role}</dd></div>
                      <div><dt>Status</dt><dd>{selectedUser.active ? "Ativo" : "Inativo"}</dd></div>
                      <div><dt>E-mail</dt><dd>{selectedUser.email_verified ? "Verificado" : "Pendente"}</dd></div>
                      <div><dt>Criação</dt><dd>{formatDate(selectedUser.created_at)}</dd></div>
                      <div><dt>Tokens / custo</dt><dd>Não disponível no ledger atual</dd></div>
                    </dl>
                    <div className="admin-drawer__note">
                      O drill-down financeiro será habilitado somente quando houver telemetria persistente,
                      tenant-safe e versionada por preço.
                    </div>
                  </aside>
                )}
              </div>
            )}

            {view === "usage" && (
              <div className="admin-view">
                <section className="admin-panel admin-usage-roadmap">
                  <span className="admin-eyebrow">USAGE & COST · CONTRATO FUTURO</span>
                  <h2>Economia operacional sem números fictícios</h2>
                  <p>
                    O painel está preparado para custo estimado, input/output/cache tokens, custo por
                    usuário, agente, modelo e provider. O backend atual ainda não comprova persistência
                    histórica agregável; por isso a superfície permanece explicitamente sem valores.
                  </p>
                  <div className="admin-roadmap-grid">
                    <article><span>01</span><strong>Execution ledger</strong><p>Persistir tenant, user, execution, agent, provider, model, tokens e latência.</p></article>
                    <article><span>02</span><strong>Pricing ledger</strong><p>Preço versionado por provider/modelo para não recalcular história com tarifa atual.</p></article>
                    <article><span>03</span><strong>Aggregation API</strong><p>Período, usuário, agente e tenant com autorização fail-closed.</p></article>
                    <article><span>04</span><strong>Drill-down</strong><p>Do KPI executivo à execução auditável, sem expor conteúdo sensível por padrão.</p></article>
                  </div>
                </section>
              </div>
            )}

            {view === "agents" && (
              <div className="admin-view">
                <section className="admin-agent-list">
                  {domainState.agents !== "ok" && (
                    <div className="admin-domain-empty">
                      <DomainBadge state={domainState.agents} />
                      <strong>Catálogo de agentes indisponível</strong>
                      <p>Os demais domínios administrativos permanecem utilizáveis.</p>
                    </div>
                  )}
                  {agents.map((agent) => (
                    <article key={agent.slug} className="admin-agent-row">
                      <div className="admin-agent-row__identity">
                        <span className="admin-agent-node" aria-hidden="true" />
                        <div>
                          <strong>{agent.display_name}</strong>
                          <small>{agent.role_label || agent.canonical_name || agent.slug}</small>
                        </div>
                      </div>
                      <div><span>Departamento</span><strong>{agent.department || "—"}</strong></div>
                      <div><span>Estado</span><strong>{stateLabel(agent.availability?.state || agent.availability?.chat?.status)}</strong></div>
                      <div><span>ID canônico</span><strong>{agent.slug}</strong></div>
                      <button type="button" onClick={() => setSelectedAgent(agent)}>Inspecionar</button>
                    </article>
                  ))}
                </section>

                {selectedAgent && (
                  <aside className="admin-drawer" aria-label="Detalhes do agente">
                    <button className="admin-drawer__close" type="button" onClick={() => setSelectedAgent(null)} aria-label="Fechar">×</button>
                    <span className="admin-eyebrow">AGENT STUDIO · READ ONLY</span>
                    <h2>{selectedAgent.display_name}</h2>
                    <p>{selectedAgent.role_label || selectedAgent.canonical_name}</p>
                    <dl>
                      <div><dt>Slug canônico</dt><dd>{selectedAgent.slug}</dd></div>
                      <div><dt>Department</dt><dd>{selectedAgent.department || "—"}</dd></div>
                      <div><dt>Target kind</dt><dd>{selectedAgent.target_kind}</dd></div>
                      <div><dt>Disponibilidade</dt><dd>{stateLabel(selectedAgent.availability?.state || selectedAgent.availability?.chat?.status)}</dd></div>
                    </dl>
                    <button className="admin-primary-action" type="button" disabled>
                      Edição governada — aguardando contrato backend
                    </button>
                    <div className="admin-drawer__note">
                      Nenhum PATCH administrativo de agentes existe no contrato comprovado. Identidade,
                      ownership e slug permanecem protegidos até existir versionamento, diff e aprovação.
                    </div>
                  </aside>
                )}
              </div>
            )}

            {view === "teams" && (
              <div className="admin-view">
                <section className="admin-team-grid">
                  {domainState.teams !== "ok" && (
                    <div className="admin-domain-empty">
                      <DomainBadge state={domainState.teams} />
                      <strong>Teams indisponíveis</strong>
                      <p>Falha restrita ao domínio de orquestração.</p>
                    </div>
                  )}
                  {teams.map((team) => (
                    <article className="admin-panel" key={team.team_id}>
                      <span className="admin-eyebrow">TEAM · {team.team_id}</span>
                      <h2>{team.display_name}</h2>
                      <p>{team.description || "Orquestração governada de especialistas."}</p>
                      <dl className="admin-team-stats">
                        <div><dt>Orchestrator</dt><dd>{team.orchestrator_agent_id}</dd></div>
                        <div><dt>Especialistas</dt><dd>{team.candidate_contributor_agent_ids.length}</dd></div>
                        <div><dt>Por turno</dt><dd>{team.participant_policy.min_contributors}–{team.participant_policy.max_contributors}</dd></div>
                        <div><dt>Status</dt><dd>{team.enabled ? "Ativo" : "Inativo"}</dd></div>
                      </dl>
                    </article>
                  ))}
                </section>
              </div>
            )}

            {view === "knowledge" && (
              <div className="admin-view">
                <KnowledgeGovernancePanel
                  isPlatformOwner={Boolean(me?.roles?.includes("platform_owner"))}
                />
              </div>
            )}

            {view === "voices" && (
              <div className="admin-view">
                <section className="admin-panel">
                  <span className="admin-eyebrow">VOICE CATALOG · GOVERNED</span>
                  <h2>Vozes disponíveis</h2>
                  <p>Associações manuais permanecem em rascunho até validação independente do provider.</p>
                  {domainState.voices !== "ok" ? (
                    <div className="admin-domain-empty"><DomainBadge state={domainState.voices} /><strong>Catálogo indisponível</strong><p>Falha restrita ao domínio de voz.</p></div>
                  ) : (
                    <div className="admin-team-grid">
                      {voiceCatalog.map((voice) => (
                        <article className="admin-panel" key={voice.id}>
                          <span className="admin-eyebrow">{voice.provider_key} · {voice.curation_status}</span>
                          <h3>{voice.display_name}</h3>
                          <p>{voice.supported_locales.join(", ") || "Locale a validar"}</p>
                          <small>{voice.cost_class} · {voice.active ? "Catalogada" : "Indisponível"}</small>
                        </article>
                      ))}
                    </div>
                  )}
                </section>
                <section className="admin-panel">
                  <span className="admin-eyebrow">ASSOCIATIONS · DRAFT FIRST</span>
                  <h2>Vínculos por agente</h2>
                  {voiceAssignments.length === 0 ? <p>Nenhuma associação criada. Selecione uma voz elegível no fluxo governado de associação.</p> : (
                    <div className="admin-team-grid">{voiceAssignments.map((assignment) => (
                      <article className="admin-panel" key={assignment.id}>
                        <span className="admin-eyebrow">{assignment.assignment_state} · {assignment.validation_status}</span>
                        <h3>{assignment.agent_slug}</h3>
                        <p>{assignment.voice_display_name} · {assignment.presentation_label}</p>
                      </article>
                    ))}</div>
                  )}
                </section>
              </div>
            )}

            {view === "security" && (
              <div className="admin-view">
                {domainState.security !== "ok" && (
                  <div className="admin-domain-empty">
                    <DomainBadge state={domainState.security} />
                    <strong>Security status indisponível</strong>
                    <p>Usuários, agentes, Teams e demais domínios preservam seus próprios estados.</p>
                  </div>
                )}
                <section className="admin-kpis admin-kpis--security">
                  <article><span>Auth mode</span><strong className="admin-kpi-text">{security?.auth_mode || "—"}</strong></article>
                  <article><span>GitHub readonly</span><strong className="admin-kpi-text">{yesNo(security?.github_read_only)}</strong></article>
                  <article><span>Evolution execution</span><strong className="admin-kpi-text">{yesNo(security?.evolution_execution_allowed)}</strong></article>
                  <article><span>Demo headers</span><strong className="admin-kpi-text">{yesNo(security?.demo_headers_enabled)}</strong></article>
                </section>
                <section className="admin-panel">
                  <div className="admin-panel__heading">
                    <div><span>ACCESS GATE</span><h2>Postura operacional</h2></div>
                  </div>
                  <div className="admin-status-grid">
                    <div><span>Gate</span><strong>{yesNo(security?.access_gate_enabled)}</strong></div>
                    <div><span>Hashes configurados</span><strong>{security?.access_gate_code_hash_count ?? "—"}</strong></div>
                    <div><span>Tenant configurado</span><strong>{yesNo(security?.access_gate_tenant_configured)}</strong></div>
                    <div><span>Signing secret</span><strong>{yesNo(security?.access_gate_signing_secret_configured)}</strong></div>
                  </div>
                </section>
                <section className="admin-panel admin-governance-note">
                  <span className="admin-eyebrow">GOVERNANÇA</span>
                  <h2>Evolução da Plataforma permanece separada da experiência do usuário.</h2>
                  <p>
                    Merge, deploy, migration, autoevolução e mudanças críticas continuam sujeitos a
                    autorização humana e não são expostos como ações desta interface.
                  </p>
                </section>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
