# Modelo de Pagamento

Como o sistema representa taxas, pagamentos e isenções. Serve de referência para evitar confusão sobre valores no dashboard (Total Pago / Total Pendente).

## Conceitos

- **Taxa de inscrição** (`taxas_inscricao`): o valor é **por perfil e por evento**. Cada perfil de um evento (ex.: Atleta, Público Geral) tem a sua taxa, com seu próprio `valor` e sua flag `isento` (taxa gratuita). Eventos diferentes podem ter valores diferentes — **não existe valor fixo no sistema**.
- **Pagamento** (`pagamentos`): há **exatamente 1 registro por atleta por evento** (garantido pela constraint `UNIQUE(atleta_id, evento_id)`). Guarda `valor`, `status`, `isento` e a referência `taxa_inscricao_id`.

## Ciclo de vida do `pagamentos.valor`

| Momento | O que acontece com o `valor` |
|---|---|
| **Criação** (inscrição no evento) | A trigger `create_event_registration` (em `inscricoes_eventos`) insere o pagamento com `valor = taxas_inscricao.valor` do perfil escolhido. Usa `ON CONFLICT (atleta_id, evento_id) DO NOTHING`, então nunca duplica. |
| **Override manual** | Um gestor pode ajustar o valor de um atleta específico (campo de valor no card → `updatePaymentAmount`). Esse valor personalizado é preservado pelo sistema. |
| **Isenção** | **Não zera o valor.** O atleta isento é representado por `status = 'isento'` + flag `isento = true`; o `valor` continua igual à taxa (para o dia em que a isenção for removida). |
| **Confirmação** | Ao confirmar o pagamento, se o `valor` estiver 0/nulo por algum motivo, ele é restaurado a partir da taxa do perfil (rede de segurança). Um override > 0 nunca é sobrescrito. |

## Status de pagamento

| Status | Significado | Entra no Total Pago? |
|---|---|---|
| `pendente` | Aguardando pagamento/confirmação | Não |
| `confirmado` | Pagamento confirmado | **Sim** |
| `isento` | Dispensado da taxa (ver abaixo) | Não |
| `cancelado` | Inscrição/pagamento cancelado | Não |

## Isenção

Marcar um atleta como **isento** dispensa a cobrança da taxa. Regras:

- É ação exclusiva de **ADM**, **ORG** e **RDD** (representante de delegação, apenas atletas da sua delegação). O atleta **não** pode se autoisentar. Ver [[papeis-e-permissoes]].
- Exige uma **justificativa** obrigatória e registra **quem concedeu** (`isento_por`, `isento_justificativa`, `isento_em`), com trilha em `pagamentos_audit_log`.
- Toda a lógica fica na função de banco `conceder_isencao` (`SECURITY DEFINER`), que valida o papel do solicitante no servidor.
- Isento **não zera o valor**: o registro fica com `status = 'isento'` e o valor da taxa preservado. Como o Total Pago só soma confirmados, o isento naturalmente fica de fora — sem precisar zerar nada.

## Total Pago e Total Pendente (dashboard)

Vêm da view `vw_analytics_inscricoes`:

- **Total Pago** = soma do valor dos pagamentos `confirmado`.
- **Total Pendente** = soma do valor dos pagamentos `pendente`.

Ambos usam `COALESCE(NULLIF(valor, 0), taxa_do_perfil, 0)` — ou seja, se por algum motivo um registro escapar com `valor = 0`, a view cai para a taxa do perfil, evitando subestimar o total. Taxas legitimamente gratuitas (perfil com `isento = true`, valor 0) permanecem como 0.

## Onde isso vive no código

- Trigger de criação: `create_event_registration` (banco, em `inscricoes_eventos`).
- Isenção: `conceder_isencao` (banco) ↔ `useExemptionStatus.ts` / `ExemptionCheckbox.tsx` (front).
- Confirmação/status: `atualizar_status_pagamento` (banco) ↔ `updatePaymentStatus` (`src/lib/api/payments.ts`).
- Override de valor: `updatePaymentAmount` (`src/lib/api/payments.ts`) ↔ `usePaymentHandlers.ts`.
- Totais: view `vw_analytics_inscricoes` → `StatisticsTab` / `SummaryCards`.
