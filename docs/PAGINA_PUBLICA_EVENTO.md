# Página pública de divulgação do evento

Cada evento pode ter uma **página aberta, sem login**, para divulgar suas modalidades — por exemplo, as oficinas da Escola do Esporte com Coração. A página mostra:

- topo com nome, descrição, foto, local e período do evento;
- **texto de divulgação** livre (aceita **negrito**, listas e títulos);
- "Como participar" (cadastro → inscrição no evento → escolha das oficinas);
- uma lista com **cada oficina** (modalidade com status *Ativa* ou *Esgotada*), mostrando:
  - **quando acontece**: horários do cronograma ligados à modalidade (dias da semana das atividades recorrentes vigentes e próximas datas avulsas);
  - **filósofos monitores** (os representantes cadastrados na modalidade), com botão de **WhatsApp**;
  - botão de inscrição;
- **Semana de oficinas**: calendário com o que acontece em cada dia da semana.

## Como ligar

1. **Administração → Informações Básicas → Página pública de divulgação**.
2. Ligue **Página pública ativa**, confira o **endereço** (gerado pelo nome do evento, editável) e escreva o texto (há um **texto sugerido** para as oficinas).
3. **Salvar página pública**. O link aparece logo abaixo, com botões para copiar e abrir.

Para quem se cadastrar conseguir se inscrever, o evento também precisa estar com **Visibilidade Pública** ligada: é ela que faz o evento aparecer na tela de seleção de eventos. O painel avisa quando ela está desligada.

## Endereços

- **Caminho** (funciona assim que a página é ligada): `https://olimpia.nova-acropole.org.br/event/<endereco>`
- **Subdomínio**: `https://<endereco>.nova-acropole.org.br`. O app já reconhece esse formato e abre direto a página do evento, mas cada subdomínio só funciona depois de configurar **DNS** (registro apontando para a hospedagem do app) e o **domínio personalizado na hospedagem**. No subdomínio, os botões de cadastro e login levam ao app principal.

Endereços reservados (não podem ser usados): `olimpia`, `www`, `sb`, `studio-sb`, `api`, `app`, `admin`, `mail`, `email`.

## Privacidade

Com a página ligada, o **nome** e o **telefone** (via botão de WhatsApp) dos filósofos monitores das modalidades ficam públicos. Nenhum outro dado de usuário é exposto.

## Técnico

- Migração `supabase/migrations/20261028_pagina_publica_evento.sql`: colunas `eventos.pagina_publica_ativa`, `pagina_publica_slug` (único) e `pagina_publica_texto`.
- A leitura pública passa só pela RPC `get_pagina_publica_evento(p_slug)` (`SECURITY DEFINER`, `GRANT` para `anon`), que devolve uma lista fechada de campos e só para eventos com a página ligada. Nenhuma policy de RLS foi aberta.
- Front: `src/pages/PublicEventPage.tsx` (rota `/event/:slug`), `src/components/public-event/`, `src/lib/publicPages.ts`. O subdomínio é tratado em `src/App.tsx`.
