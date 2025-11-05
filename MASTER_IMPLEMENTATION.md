# Implementação do Perfil Master

## Resumo
Esta implementação adiciona um novo perfil "Master" ao sistema, com uma tela dedicada para gestão avançada de usuários e perfis. Usuários que criam eventos agora recebem automaticamente os perfis de Administrador, Master e Atleta.

## Mudanças Implementadas

### 1. Nova Página Master (`src/pages/Master.tsx`)
- **Localização**: `/master`
- **Acesso**: Apenas para usuários com perfil Master (código 'MST' ou `is_master = true`)
- **Conteúdo**: 
  - Aba "Gerenciar Perfis de Usuários" (UserProfilesManagementSection)
  - Aba "Gestão de Usuários" (UserManagementSection)
- **Design**: Tema amarelo/dourado com ícone de coroa (Crown)

### 2. Hook de Acesso Master (`src/hooks/useMasterAccess.ts`)
- Verifica se o usuário possui perfil Master
- Redireciona para home se não tiver permissão
- Valida via `is_master` flag ou perfil com código 'MST'
- Similar ao `useAdminAccess.ts` existente

### 3. Atualização do Hook useNavigation (`src/hooks/useNavigation.ts`)
- Adicionado `isMaster: boolean` à interface `UserRoles`
- Detecta perfil Master via código 'MST' ou flag `is_master`
- Integrado ao sistema de roles existente

### 4. Atualização do Menu de Navegação (`src/components/navigation/hooks/useMenuItems.tsx`)
- Novo item "Master" no menu lateral
- Ícone: Crown (coroa)
- Posicionamento: Após "Administração" e antes de "Trocar Evento"
- Visível apenas para usuários com perfil Master

### 5. Remoção de Abas da Administração (`src/pages/Administration.tsx`)
- **Removidas**:
  - Aba "Gerenciar Perfis de Usuários" (administration)
  - Aba "Gestão de Usuários" (user-management)
- **Mantidas**:
  - Informações Básicas
  - Perfis e Taxas
  - Filiais Vinculadas
  - Regulamento
  - Cronograma
  - Regras de Modalidades
  - Configuração de Modelos

### 6. Nova Rota no App (`src/App.tsx`)
- Rota `/master` adicionada às rotas protegidas
- Componente Master importado e configurado

### 7. Atribuição Automática de Perfis na Criação de Eventos
**Arquivo**: `src/components/events/services/eventCreationService.ts`

Quando um evento é criado, a função `assignRolesToCreatorAndRegister` agora:
1. Busca o perfil Master (se existir no evento)
2. Atribui ao criador do evento:
   - Perfil **Administrador** (ADM)
   - Perfil **Master** (MST) - se disponível
   - Perfil **Atleta** (ATL)
3. Registra o criador no evento como atleta

**Importante**: O perfil Master só será atribuído se:
- Existir um tipo de perfil 'MST' na tabela `perfis_tipo`
- Um perfil Master tiver sido criado para aquele evento específico

## Estrutura de Dados Necessária

### Tabela `perfis_tipo`
Deve conter um registro:
```sql
INSERT INTO perfis_tipo (codigo, nome, descricao)
VALUES ('MST', 'Master', 'Perfil Master com acesso total ao sistema');
```

### Perfis por Evento
Quando um evento é criado, deve incluir um perfil Master:
```sql
INSERT INTO perfis (evento_id, nome, perfil_tipo_id)
VALUES (
  '<event_id>', 
  'Master',
  (SELECT id FROM perfis_tipo WHERE codigo = 'MST')
);
```

## Fluxo de Trabalho

### Criação de Evento
1. Usuário cria um novo evento
2. Sistema cria automaticamente perfis padrão (trigger no banco)
3. Sistema busca perfis ADM, MST e ATL do evento
4. Sistema atribui os 3 perfis ao criador do evento
5. Sistema registra o criador no evento

### Acesso à Página Master
1. Usuário loga no sistema
2. Sistema carrega perfis do usuário
3. Se usuário tiver perfil MST ou `is_master = true`:
   - Item "Master" aparece no menu
   - Usuário pode acessar `/master`
4. Ao acessar `/master`:
   - Hook `useMasterAccess` valida permissão
   - Se autorizado, página Master é renderizada
   - Se não autorizado, redireciona para home

## Hierarquia de Perfis

```
Master (MST)
  ├─ Acesso total ao sistema
  ├─ Gestão de usuários
  ├─ Gestão de perfis de usuários
  └─ Todas as permissões de Administrador

Administrador (ADM)
  ├─ Configurações do evento
  ├─ Gestão de perfis e taxas
  ├─ Gestão de filiais
  └─ Configurações de modalidades

Atleta (ATL)
  ├─ Inscrição em eventos
  ├─ Visualização de cronograma
  └─ Acesso ao próprio perfil
```

## Segurança

### Validações Implementadas
1. **Client-side**: Hook `useMasterAccess` verifica permissão antes de renderizar
2. **Navigation**: Menu Master só aparece para usuários autorizados
3. **Routing**: Rota protegida dentro de `MainNavigation`

### Validações Recomendadas (Backend)
- RLS policies para tabela `papeis_usuarios`
- Função security definer para validar atribuição de perfil Master
- Prevenir escalação de privilégios

## Testing Checklist

- [ ] Criar evento e verificar que criador recebe perfis ADM, MST e ATL
- [ ] Verificar que item "Master" aparece no menu para usuários Master
- [ ] Verificar que página `/master` é acessível apenas para Masters
- [ ] Verificar que abas removidas não aparecem mais em Administração
- [ ] Verificar que usuários sem perfil Master são redirecionados ao tentar acessar `/master`
- [ ] Verificar que perfil Master não é atribuído se não existir no evento

## Próximos Passos Recomendados

1. **Database Migration**: Criar migration para garantir perfil_tipo 'MST' existe
2. **Trigger Update**: Atualizar trigger de criação de perfis para incluir Master
3. **RLS Policies**: Adicionar políticas de segurança para perfil Master
4. **Permissions Hierarchy**: Implementar hierarquia formal de permissões
5. **Audit Log**: Adicionar log de ações realizadas por usuários Master
6. **UI Polish**: Adicionar badges/indicadores visuais para usuários Master

## Notas Importantes

- A flag `is_master` no banco permite marcar usuários Master globalmente
- O código 'MST' no perfil permite Master específico por evento
- Ambas as formas são suportadas e validadas
- A implementação é backward compatible - eventos antigos continuam funcionando
- Se perfil Master não existir em um evento, usuário ainda recebe ADM e ATL
