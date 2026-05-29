
## Plano: Correção de Erros de Build nas Edge Functions

### Problema
Os dois arquivos de Edge Functions estão com erro de TypeScript porque a variável `error` no bloco `catch` é tipada como `unknown` por padrão no TypeScript strict mode, e não podemos acessar `.message` diretamente.

### Arquivos Afetados
1. `supabase/functions/process-event-registration/index.ts` (linha 126)
2. `supabase/functions/send-payment-proof/index.ts` (linha 73)

### Solução
Adicionar verificação de tipo para acessar `error.message` de forma segura:

```typescript
// De:
catch (error) {
  JSON.stringify({ error: error.message })
}

// Para:
catch (error) {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  JSON.stringify({ error: errorMessage })
}
```

### Alterações Detalhadas

**Arquivo 1: `process-event-registration/index.ts`**
- Linha 123-131: Modificar o bloco catch para verificar o tipo do error

**Arquivo 2: `send-payment-proof/index.ts`**
- Linha 70-79: Modificar o bloco catch para verificar o tipo do error

### Resultado Esperado
- Build passa sem erros de TypeScript
- Comportamento da aplicação permanece inalterado
- Tratamento de erro mais robusto e type-safe
