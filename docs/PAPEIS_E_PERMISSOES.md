# Papéis e Permissões

Os papéis de usuário vivem em `perfis_tipo.codigo` no banco. Cada usuário recebe um ou mais papéis **por evento** (tabela `papeis_usuarios` → `perfis` → `perfis_tipo`). No frontend, os papéis chegam em `useAuth().user.papeis` (array de `{ codigo, nome, descricao }`) e o padrão de verificação é:

```ts
const isAdmin = user?.papeis?.some(r => r.codigo === 'ADM');
```

## Códigos

| Código | Papel | O que faz |
|--------|-------|-----------|
| **ADM** | Administrador | Acesso total ao evento: configuração, perfis, filiais, delegações. |
| **ORG** | Organizador | Gestão geral do evento pelo dashboard `/organizador` (atletas, inscrições, estatísticas, chamadas). `ORE` é uma variante legada do mesmo papel. |
| **RDD** | Representante de Delegação | Gerencia apenas atletas das filiais da **sua** delegação, pelo dashboard `/delegacao`. Escopo resolvido pela RPC `get_user_delegacao_filiais`. |
| **ATL** | Atleta | Inscreve-se em modalidades, vê o próprio cronograma e status de pagamento. |
| **PGR** | Responsável / Guardião | Usuário que cadastra e gerencia dependentes (menores). |
| **JUZ** | Juiz | Lança pontuações nas modalidades de competição. |
| **MST** / **MSTR** | Master | Acesso total ao sistema (multi-evento). Também sinalizado por `usuarios.is_master`. |
| **FMON** / **FMO** | Filósofo Monitor | Registra chamadas/presenças das suas modalidades. |

> Nota: `useUserRoleCheck.ts` referencia `'DEL'` para representante — é um resíduo sem uso real. O código canônico do Representante de Delegação é **RDD**.

## Permissão de isenção de pagamento

Marcar um atleta como **isento** (zera o valor do pagamento) é ação exclusiva de **ADM**, **ORG** e **RDD**:

- **ADM / ORG** — podem isentar qualquer atleta do evento.
- **RDD** — só pode isentar atletas das filiais da sua delegação.
- **Atleta** — **não** pode se autoisentar.

A concessão exige **justificativa** e registra **quem concedeu** (`pagamentos.isento_por`, `isento_justificativa`, `isento_em`), com trilha em `pagamentos_audit_log`. Toda a lógica e a checagem de permissão ficam na RPC `conceder_isencao` (`SECURITY DEFINER`), que valida o papel do chamador via `auth.uid()` — o gating no frontend é apenas de UX.
