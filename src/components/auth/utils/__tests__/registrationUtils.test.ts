
import { describe, it, expect, vi } from 'vitest';
import { 
  formatBirthDate, 
  checkExistingUser, 
  prepareUserMetadata 
} from '../registrationUtils';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: null })
        })
      })
    })
  }
}));

describe('formatBirthDate', () => {
  it('should format Date object correctly', () => {
    const date = new Date('1990-12-25');
    const result = formatBirthDate(date);
    expect(result).toBe('1990-12-25');
  });

  it('should return null for undefined date', () => {
    const result = formatBirthDate(undefined);
    expect(result).toBeNull();
  });

  it('should return null for invalid Date object', () => {
    const result = formatBirthDate(new Date('invalid'));
    expect(result).toBeNull();
  });
});

describe('checkExistingUser', () => {
  it('should call Supabase with correct parameters', async () => {
    const email = 'test@example.com';
    await checkExistingUser(email);

    expect(supabase.from).toHaveBeenCalledWith('usuarios');
    expect(supabase.from('usuarios').select).toHaveBeenCalledWith('id');
    expect(supabase.from('usuarios').select().eq).toHaveBeenCalledWith('email', email);
  });
});

describe('prepareUserMetadata', () => {
  it('should prepare metadata correctly', () => {
    const values = {
      nome: 'John Doe',
      telefone: '11999887766',
      ddi: '+55',
      branchId: 'branch-123',
      tipo_documento: 'CPF' as const,
      numero_documento: '123.456.789-00',
      genero: 'Masculino' as const,
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      data_nascimento: new Date('1990-01-01'),
      acceptPrivacyPolicy: true,
      state: 'SP'
    };

    const formattedBirthDate = '1990-01-01';

    const result = prepareUserMetadata(values, formattedBirthDate);

    expect(result).toEqual({
      nome: 'John Doe',
      telefone: '11999887766',
      ddi: '+55',
      tipo_documento: 'CPF',
      numero_documento: '123.456.789-00',
      genero: 'Masculino',
      data_nascimento: '1990-01-01',
      estado: 'SP',
      filial_id: 'branch-123'
    });
  });

  it('should handle missing optional fields', () => {
    const values = {
      nome: 'John Doe',
      telefone: '11999887766',
      ddi: '+55',
      branchId: null,
      tipo_documento: 'CPF' as const,
      numero_documento: undefined,
      genero: 'Masculino' as const,
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      data_nascimento: new Date('1990-01-01'),
      acceptPrivacyPolicy: true,
      state: 'SP'
    };

    const formattedBirthDate = '1990-01-01';

    const result = prepareUserMetadata(values, formattedBirthDate);

    expect(result).toEqual({
      nome: 'John Doe',
      telefone: '11999887766',
      ddi: '+55',
      filial_id: null,
      tipo_documento: 'CPF',
      numero_documento: undefined,
      genero: 'Masculino',
      data_nascimento: '1990-01-01',
      estado: 'SP'
    });
  });
});
