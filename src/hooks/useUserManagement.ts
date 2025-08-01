
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { userManagementService, CreateUserData, UserDeletionOptions } from '@/services/userManagementService';

export function useUserManagement() {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const createUserMutation = useMutation({
    mutationFn: async (userData: CreateUserData) => {
      setIsCreating(true);
      return await userManagementService.createUser(userData);
    },
    onSuccess: () => {
      toast.success('Usuário criado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['user-profiles'] });
      queryClient.invalidateQueries({ predicate: (query) => 
        query.queryKey[0] === 'branch-users'
      });
    },
    onError: (error: Error) => {
      toast.error('Erro ao criar usuário: ' + error.message);
    },
    onSettled: () => {
      setIsCreating(false);
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: async ({ userId, options }: { userId: string; options: UserDeletionOptions }) => {
      setIsDeleting(true);
      return await userManagementService.deleteUser(userId, options);
    },
    onSuccess: (_, { options }) => {
      const message = options.deleteFromBoth 
        ? 'Usuário excluído completamente do sistema!'
        : 'Usuário excluído do sistema de autenticação (histórico mantido)!';
      toast.success(message);
      queryClient.invalidateQueries({ queryKey: ['user-profiles'] });
      queryClient.invalidateQueries({ predicate: (query) => 
        query.queryKey[0] === 'branch-users'
      });
    },
    onError: (error: Error) => {
      toast.error('Erro ao excluir usuário: ' + error.message);
    },
    onSettled: () => {
      setIsDeleting(false);
    }
  });

  const checkUserExists = async (email: string, documento?: string) => {
    try {
      return await userManagementService.checkUserExists(email, documento);
    } catch (error) {
      console.error('Error checking user existence:', error);
      throw error;
    }
  };

  return {
    createUser: createUserMutation.mutate,
    deleteUser: deleteUserMutation.mutate,
    checkUserExists,
    isCreating,
    isDeleting
  };
}
