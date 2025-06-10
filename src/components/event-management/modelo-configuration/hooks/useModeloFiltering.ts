
import { useState, useMemo } from 'react';

export function useModeloFiltering(modelos: any[]) {
  const [searchTerm, setSearchTerm] = useState('');
  const [modalityFilter, setModalityFilter] = useState('all');
  const [useBatteryFilter, setUseBatteryFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);

  const filteredAndSortedModelos = useMemo(() => {
    let filtered = modelos.filter((modelo) => {
      // Search filter - expanded to include more parameter fields and categoria
      const searchMatch = 
        modelo.codigo_modelo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        modelo.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        modelo.modalidade?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        modelo.modalidade?.categoria?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        modelo.parametros?.regra_tipo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        modelo.parametros?.formato_resultado?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        modelo.parametros?.tipo_calculo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        modelo.parametros?.campo_referencia?.toLowerCase().includes(searchTerm.toLowerCase());

      // Modality filter
      const modalityMatch = modalityFilter === 'all' || 
        modelo.modalidade_id?.toString() === modalityFilter;

      // Battery filter
      const batteryMatch = useBatteryFilter === 'all' || 
        (useBatteryFilter === 'true' && modelo.parametros?.baterias === true) ||
        (useBatteryFilter === 'false' && modelo.parametros?.baterias !== true);

      return searchMatch && modalityMatch && batteryMatch;
    });

    // Apply sorting
    if (sortConfig) {
      filtered.sort((a, b) => {
        let aValue, bValue;

        switch (sortConfig.key) {
          case 'modalidade':
            aValue = a.modalidade?.nome || '';
            bValue = b.modalidade?.nome || '';
            break;
          case 'categoria':
            aValue = a.modalidade?.categoria || '';
            bValue = b.modalidade?.categoria || '';
            break;
          case 'modelo':
            aValue = a.codigo_modelo || '';
            bValue = b.codigo_modelo || '';
            break;
          case 'baterias':
            aValue = a.parametros?.baterias ? 'Sim' : 'Não';
            bValue = b.parametros?.baterias ? 'Sim' : 'Não';
            break;
          default:
            return 0;
        }

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'asc' 
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        return 0;
      });
    }

    return filtered;
  }, [modelos, searchTerm, modalityFilter, useBatteryFilter, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig(current => {
      if (current?.key === key) {
        return current.direction === 'asc' 
          ? { key, direction: 'desc' }
          : null;
      }
      return { key, direction: 'asc' };
    });
  };

  return {
    searchTerm,
    setSearchTerm,
    modalityFilter,
    setModalityFilter,
    useBatteryFilter,
    setUseBatteryFilter,
    sortConfig,
    filteredAndSortedModelos,
    handleSort
  };
}
