
export function handleDatabaseError(error: any): never {
  console.error('=== SCORE SAVE OPERATION FAILED ===');
  console.error('Error details:', error);
  console.error('Error message:', error.message);
  console.error('Error code:', error.code);
  
  // Handle specific database error codes
  if (error.code === '23505') {
    throw new Error('Já existe uma pontuação para este atleta nesta modalidade');
  }
  
  if (error.code === '42P01') {
    throw new Error('Erro crítico de configuração da base de dados. Problema com triggers ou funções SQL. Contacte o administrador.');
  }
  
  if (error.code === '23503') {
    throw new Error('Dados inválidos: verifique se o evento, modalidade e atleta existem');
  }
  
  // Handle the specific FROM-clause error
  if (error.message?.includes('missing FROM-clause entry for table "p"')) {
    throw new Error('Erro no trigger de banco de dados (FROM-clause). Esta é uma questão de configuração do servidor que requer atenção do administrador.');
  }
  
  // Handle ON CONFLICT constraint error
  if (error.message?.includes('there is no unique or exclusion constraint matching the ON CONFLICT specification')) {
    throw new Error('Erro de configuração de banco de dados. A tabela não possui as constraints necessárias para atualização.');
  }
  
  throw error;
}
