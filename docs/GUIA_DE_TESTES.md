# Guia de Teste de Fluxo — Reunião de Validação

Roteiro para uma sessão de ~1h em que cada participante assume um **papel** e percorre os **fluxos reais** do sistema, de ponta a ponta. O objetivo é achar **onde o fluxo quebra** (não avaliar estética): inscrição → confirmação → pontuação → resultado, chamadas, delegação, etc.

**Evento do teste:** *Olimpíadas Estaduais - Edição Porto Alegre/RS - 2025*.

> Dica de condução: projete este guia (ou a versão em página) e conduza por **rodadas**. Alguns passos dependem de outros papéis (ex.: o juiz só pontua depois que o organizador confirma o atleta), então respeite a ordem das rodadas.

---

## 1. Papéis e estações

Distribua os papéis entre os participantes (1 ou mais pessoas por papel). Todos começam também como **atleta** (todos se inscrevem no evento).

| Papel | O que vai testar | Pré-requisito |
|---|---|---|
| **Atleta** | Inscrição no evento, modalidades, pagamento, cronograma, ver resultado | Nenhum (auto-serviço) |
| **Organizador / Admin** | Confirmar pagamentos, gerir atletas, atribuir papéis, configurar, estatísticas | Papel ADM/ORG já atribuído |
| **Juiz** | Pontuar atletas nas modalidades, calcular colocação, ranking | Papel **atribuído** por ADM/ORG |
| **Rep. de Delegação** | Escopo por filial, inscrição em lote, representantes | Papel + delegação configurada |
| **Filósofo Monitor** | Criar chamada, registrar presença, histórico | Ser **representante de modalidade** |

> ⚠️ **Importante:** os papéis **Juiz**, **Rep. de Delegação** e **Filósofo Monitor** **não são auto-serviço**. O participante não consegue "virar juiz" sozinho — um **Organizador/Admin precisa atribuir** o papel antes (ver Setup). Juiz e Monitor entram pelo **menu lateral**, não pela tela de seleção de perfil.

---

## 2. Setup (Facilitador / Admin — fazer ANTES da reunião)

Checklist do organizador antes de todos começarem:

- [ ] **Reabrir o evento para teste.** *Administração → Informações Básicas*:
  - **Status do Evento** = **Em Teste** (o evento está "Encerrado" hoje).
  - **Datas de inscrição** abertas (início no passado, fim no futuro).
  - **Visibilidade pública** ligada (para aparecer na seleção de eventos).
  - Toggles **Pontuação** e **Chamadas** **ligados** — sem eles, os menus **Juiz** e **Filósofo Monitor** não aparecem.
- [ ] **Conferir Perfis e Taxas.** *Administração → Perfis e Taxas*: existem perfis com taxa (ex.: **Atleta**, **Público Geral**) e o perfil **Juiz** cadastrado.
- [ ] **Conferir modelos de pontuação.** *Administração → Configuração de Modelos*: as modalidades que o juiz vai testar precisam ter **modelo configurado** (campos de nota). Sem modelo, a tela do juiz cai num formato legado com aviso âmbar.
- [ ] **Atribuir papéis aos voluntários.** *Administração → Perfis de usuários*: abra o usuário-voluntário e marque **Juiz** / **Rep. de Delegação** / **Filósofo Monitor** conforme a estação dele. (Salvar → o papel vale no próximo login/carregamento.)
- [ ] **(Se for testar Delegação/Monitor)**:
  - *Administração → Delegações*: crie uma delegação, vincule **filiais** e adicione o **Rep. de Delegação**.
  - *Delegação → Representantes*: cadastre o **Filósofo Monitor** como **representante de uma modalidade** (o atleta precisa estar **confirmado** naquela modalidade).

> Sugestão: escolha **2–3 modalidades** para focar o teste — uma individual com modelo (ex.: **Corrida 100m** ou **Natação - Crawl 50m**), uma subjetiva (ex.: **Poesia Declamada**) e uma coletiva (ex.: **Vôlei**, testa a aba Equipes).

---

## 3. Roteiro por rodadas

Cada passo traz **onde** acontece e **⚠️ o que observar** (onde é mais provável achar bug). Registre tudo o que divergir (ver seção 5).

### Rodada 0 — Todos se inscrevem (atleta)

| # | Ação | Onde | Resultado esperado | ⚠️ Observar |
|---|---|---|---|---|
| 0.1 | Criar conta / login | Tela de login/cadastro | Entra no sistema | Nome completo exige 2+ palavras; validação de e-mail |
| 0.2 | Selecionar o evento | Seleção de eventos (cards) | Abre o evento das Olimpíadas Estaduais | Se o evento **não aparece**: status não está "Em Teste" ou visibilidade off |
| 0.3 | Inscrever-se escolhendo o **perfil** | Fluxo de inscrição no evento | Inscrição criada com a **taxa do perfil** (Atleta/Público Geral) | Cada perfil tem taxa diferente; confira o valor mostrado |
| 0.4 | (Se tiver múltiplos perfis) Escolher "entrar como atleta" | Tela "Selecione como deseja entrar" | Vai para o painel do atleta | Juiz/Monitor **não** aparecem aqui — é pelo menu |

### Rodada 1 — Organizador prepara o terreno

| # | Ação | Onde | Resultado esperado | ⚠️ Observar |
|---|---|---|---|---|
| 1.1 | Confirmar pagamento dos atletas de teste | Dashboard → **Atletas** → abrir atleta → **Confirmado** | Status vira Confirmado; entra no "Total Pago" | Só 1 pagamento por atleta; valor = taxa do perfil |
| 1.2 | Confirmar inscrições em modalidades | Dashboard → **Inscrições** | Inscrições ficam **confirmadas** | **Crítico:** o juiz só vê atletas com inscrição **confirmado** |
| 1.3 | Atribuir papéis que faltarem | *Administração → Perfis de usuários* | Voluntário recebe Juiz/RDD/FMON | Papel só vale após recarregar a sessão |
| 1.4 | (Opcional) Isentar um atleta | Card do atleta → **Marcar como isento** | Pede **justificativa**; registra quem concedeu | Só ADM/ORG/RDD; isento não zera o valor da taxa |

### Rodada 2 — Atleta completa o cadastro

| # | Ação | Onde | Resultado esperado | ⚠️ Observar |
|---|---|---|---|---|
| 2.1 | Inscrever-se em modalidades | Painel do atleta | Modalidades adicionadas | Modalidade coletiva (Vôlei) vs individual |
| 2.2 | Enviar comprovante de pagamento | Painel do atleta / Pagamento | Comprovante anexado; status pendente até confirmação | Reenviar comprovante não muda o valor |
| 2.3 | Ver o cronograma | Menu **Cronograma** | Mostra a programação do evento | Datas/horários coerentes |

### Rodada 3 — Juiz pontua

| # | Ação | Onde | Resultado esperado | ⚠️ Observar |
|---|---|---|---|---|
| 3.1 | Entrar como juiz | **Menu lateral → Juiz** (não é pela seleção de perfil) | Abre "Painel do Juiz" (abas Pontuações / Equipes) | Se o menu **Juiz não aparece**: papel não atribuído **ou** Pontuação desligada no evento |
| 3.2 | Selecionar uma modalidade **com modelo** | Aba Pontuações → "Selecionar Modalidade" | Mostra "Modelo: N campos" | Se **aviso âmbar "nenhum modelo"**: escolha outra modalidade (ou configure o modelo) |
| 3.3 | Ver a lista de atletas | Tabela de pontuação | Lista atletas **confirmados** | Vazio? Quase sempre é inscrição **não confirmada** (Rodada 1.2) |
| 3.4 | (Se usar baterias) Criar bateria | Botão "Nova Bateria" | Bateria criada e selecionada | Bateria só "existe" após a 1ª nota salva nela |
| 3.5 | Editar (lápis) e digitar as notas | Linha do atleta | Inputs habilitados; máscara conforme o campo (tempo/distância/pontos) | Formato errado gera valor 0 |
| 3.6 | Salvar | Botão salvar da linha | Toast "Pontuação salva" | Pontuação é **por juiz** (2 juízes = 2 registros) |
| 3.7 | **Calcular colocação** | Célula de campo calculado → "Calcular colocação" | Preenche posição/medalha | **Salvar nota ≠ gerar ranking** — sem este passo, o ranking fica sem colocação/medalha |
| 3.8 | Conferir o ranking | Classificação da modalidade | Top 10 ordenado com medalhas | Ordena por valor de pontuação; medalha só se calculada |

### Rodada 4 — Delegação e Monitor

| # | Ação | Onde | Resultado esperado | ⚠️ Observar |
|---|---|---|---|---|
| 4.1 | Entrar como Rep. de Delegação | **Menu → Delegação** | Dashboard da Delegação (dados só das filiais do escopo) | Se "Delegação" não aparece: papel RDD não atribuído |
| 4.2 | Inscrição em lote | Aba **Inscrição em Lote** → escolher modalidade → marcar atletas → Inscrever | Atletas inscritos na modalidade | O seletor lista **todas** as modalidades; a lista de atletas é só do escopo |
| 4.3 | Tornar atleta representante de modalidade | Aba **Representantes** | Cria representante (habilita o monitor) | Atleta precisa estar **confirmado** na modalidade |
| 4.4 | Entrar como Filósofo Monitor | **Menu → Filósofo Monitor** | Abas Chamadas/Modalidades/... | "Nenhuma modalidade atribuída"? Falta ser representante (4.3) |
| 4.5 | Criar uma chamada | Chamadas → **Nova Chamada** → marcar presença/atraso/ausência → Criar | Chamada criada; presenças registradas | Todos começam "ausente"; precisa data + 1 atleta |
| 4.6 | Editar presenças de uma chamada | Abrir a chamada → P/A/F → Salvar Presenças | Contadores atualizam | Upsert por atleta; só grava mudança real |
| 4.7 | Ver histórico/auditoria | Detalhe da chamada → "Histórico de alterações" | Lista quem criou/alterou, quando | Aparece só se houver entradas |

### Rodada 5 — Fechamento (todos conferem)

| # | Ação | Onde | Resultado esperado | ⚠️ Observar |
|---|---|---|---|---|
| 5.1 | Atleta vê a própria pontuação | Menu **/scores** ("Minhas Pontuações") | Desempenho por modalidade | Atleta vê **agregado** (via view), não campo a campo |
| 5.2 | Organizador confere estatísticas | Dashboard → **Estatísticas** | Total Pago/Pendente, status, inscrições por modalidade | Números batem com a lista de atletas |
| 5.3 | Clicar nos cards de status | Estatísticas → card Confirmado/Pendente | Vai para Atletas já filtrado | Contagem do card = lista filtrada |

---

## 4. Pontos de atenção (onde costuma quebrar)

- **Menu do papel some sem aviso:** Juiz depende do toggle **Pontuação**; Filósofo Monitor depende de **Chamadas**. Se o módulo estiver off no evento, o menu não aparece mesmo com o papel certo.
- **Atleta não confirmado não aparece pro juiz nem vira representante.** O filtro `confirmado` é silencioso — a tela só mostra "nenhum atleta".
- **Salvar nota não gera ranking/medalha.** É preciso rodar **Calcular colocação**.
- **Pontuação é por juiz.** Dois juízes no mesmo atleta geram dois registros.
- **Acesso direto por URL** (`/delegacao`, `/monitor`) abre a tela mesmo sem escopo (dados vêm vazios) — vale testar.
- **Papel só vale após recarregar** a sessão do usuário após ser atribuído.

---

## 5. Como registrar bugs, dúvidas e sugestões

Durante o teste, **todo mundo registra** — não basta falar em voz alta.

1. **Planilha oficial** (registro estruturado, para o que ficar de acompanhamento): [Planilha de Testes](https://docs.google.com/spreadsheets/d/1lmrVRody8M9XqbQxAm_2GzXfndDOK3pRqOrrmHVxISU/edit). Use para bugs maiores, ideias de tela e sugestões de melhoria.
2. **Grupo de bugs rápidos** (facilitador + 2): coisas que quebram na hora → mandar no grupo para correção imediata.
3. **Gravar o áudio** da reunião: captura bruta de tudo que for falado, para não se perder relato nenhum.

### Modelo de registro (caso precise de um rápido)

| Papel | Fluxo / Tela | O que fez | O que esperava | O que aconteceu | Tipo | Severidade | Print |
|---|---|---|---|---|---|---|---|
| Juiz | Pontuações → Corrida 100m | Salvei a nota | Ver no ranking | Ranking sem posição | Bug | Média | link |

*Tipo:* bug · melhoria · dúvida. *Severidade:* baixa · média · alta · bloqueia.
