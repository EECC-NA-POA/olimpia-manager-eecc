
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingState } from '@/components/dashboard/components/LoadingState';
import { useModalityRulesData } from './hooks/useModalityRulesData';
import { useModalityRulesMutations } from './hooks/useModalityRulesMutations';
import { ModalityRulesSearch } from './ModalityRulesSearch';
import { ModalityRulesTable } from './ModalityRulesTable';
import { ModalityRuleDialog } from './ModalityRuleDialog';

export function ModalityRulesSection({ eventId }: { eventId: string | null }) {
  const { modalities, setModalities, isLoading } = useModalityRulesData(eventId);
  const { isSaving, saveRule, deleteRule } = useModalityRulesMutations();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingModalityId, setEditingModalityId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const openAddRuleDialog = (modalityId: string) => {
    setEditingModalityId(modalityId);
    setIsDialogOpen(true);
  };

  const handleSaveRule = async (modalityId: string, ruleForm: any) => {
    await saveRule(modalityId, ruleForm, modalities, setModalities);
    setIsDialogOpen(false);
    setEditingModalityId(null);
  };

  const handleDeleteRule = async (modalityId: string) => {
    await deleteRule(modalityId, modalities, setModalities);
  };

  const filteredModalities = modalities.filter(modality => 
    modality.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Regras de Pontuação das Modalidades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <ModalityRulesSearch 
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
            />
            
            <ModalityRulesTable 
              modalities={filteredModalities}
              onEdit={openAddRuleDialog}
              onDelete={handleDeleteRule}
            />
          </div>
        </CardContent>
      </Card>
      
      <ModalityRuleDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSaveRule}
        editingModalityId={editingModalityId}
        modalities={modalities}
        isSaving={isSaving}
      />
    </>
  );
}
