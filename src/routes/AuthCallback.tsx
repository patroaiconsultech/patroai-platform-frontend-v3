import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { beginLogin, completeLogin, OidcError } from "../auth/oidc";

type CallbackState = "working" | "failed";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [state, setState] = useState<CallbackState>("working");
  const [detail, setDetail] = useState("");

  useEffect(() => {
    let active = true;
    completeLogin()
      .then((returnTo) => {
        if (active) navigate(returnTo, { replace: true });
      })
      .catch((error: unknown) => {
        if (!active) return;
        const code = error instanceof OidcError ? error.code : "OIDC_CALLBACK_FAILED";
        const detailByCode: Record<string, string> = {
          OIDC_TRANSACTION_MISSING:
            "A sessão de autenticação não foi encontrada. Isso pode acontecer se a confirmação foi aberta em outra aba ou se a sessão expirou. Inicie o login novamente nesta mesma janela.",
          OIDC_TRANSACTION_EXPIRED:
            "A sessão de autenticação expirou. Inicie o login novamente.",
          OIDC_STATE_MISMATCH:
            "A confirmação não corresponde à sessão de login iniciada. Inicie o login novamente nesta mesma janela.",
        };
        setDetail(
          detailByCode[code] ||
            `Não foi possível concluir a autenticação (${code}).`,
        );
        setState("failed");
      });
    return () => {
      active = false;
    };
  }, [navigate]);

  return (
    <main id="main-content" className="invite-shell">
      <h1>Autenticação da Plataforma</h1>
      {state === "working" ? (
        <p role="status">Validando sua identidade.</p>
      ) : (
        <p role="alert">{detail}</p>
      )}
      {state === "failed" ? (
        <button
          type="button"
          className="ghost-link"
          onClick={() => void beginLogin("/app")}
        >
          Tentar autenticação novamente
        </button>
      ) : null}
      <Link className="ghost-link" to="/">
        Voltar ao início
      </Link>
    </main>
  );
}
