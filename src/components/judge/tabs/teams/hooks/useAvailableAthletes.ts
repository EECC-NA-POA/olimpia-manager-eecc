
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AvailableAthlete, Team } from '../types';

export function useAvailableAthletes(
  eventId: string | null,
  selectedModalityId: number | null,
  isOrganizer = false,
  filialId?: string,
  existingTeams: Team[] = []
) {
  // Fetch available athletes
  const { data: availableAthletes } = useQuery({
    queryKey: ['athletes', eventId, selectedModalityId, isOrganizer, filialId, existingTeams],
    queryFn: async () => {
      if (!eventId || !selectedModalityId) return [] as AvailableAthlete[];
      
      try {
        // Construct a safe query for confirmed athletes
        const { data, error } = await supabase
          .from('vw_modalidades_atletas_confirmados')
          .select(`
            atleta_id,
            atleta_nome,
            atleta_telefone,
            atleta_email,
            tipo_documento,
            numero_documento,
            filial_id
          `)
          .eq('evento_id', eventId)
          .eq('modalidade_id', selectedModalityId);
        
        if (error) {
          console.error('Error fetching athletes:', error);
          // Return an empty array if there's an error
          return [] as AvailableAthlete[];
        }
        
        // Ensure we have data before proceeding
        if (!data || !Array.isArray(data)) {
          return [] as AvailableAthlete[];
        }
        
        // Filter by branch if not an organizer
        let filteredAthletes = data;
        if (!isOrganizer && filialId) {
          // Safe filtering to handle potential type issues
          filteredAthletes = data.filter(athlete => {
            return athlete && typeof athlete === 'object' && athlete !== null && 
                   'filial_id' in athlete && athlete.filial_id === filialId;
          });
        }
        
        // Create a Set of athlete IDs already in teams
        const athletesInTeams = new Set<string>();
        
        if (existingTeams && existingTeams.length > 0) {
          existingTeams.forEach(team => {
            team.athletes.forEach(athlete => {
              if (athlete && athlete.atleta_id) {
                athletesInTeams.add(athlete.atleta_id);
              }
            });
          });
        }
        
        // Filter and map athletes safely
        const availableAthletesArray: AvailableAthlete[] = [];
        
        for (const athlete of filteredAthletes) {
          // Skip if athlete is null or not an object
          if (!athlete || typeof athlete !== 'object') continue;
          
          // Type guard to ensure athlete has required properties
          if (!('atleta_id' in athlete) || !athlete.atleta_id) continue;
          
          const athleteId = athlete.atleta_id as string;
          
          // Only include athletes that aren't already in a team
          if (!athletesInTeams.has(athleteId)) {
            availableAthletesArray.push({
              atleta_id: athleteId,
              atleta_nome: (athlete.atleta_nome as string) || '',
              atleta_telefone: (athlete.atleta_telefone as string) || '',
              atleta_email: (athlete.atleta_email as string) || '',
              tipo_documento: (athlete.tipo_documento as string) || '',
              numero_documento: (athlete.numero_documento as string) || '',
              filial_id: (athlete.filial_id as string) || ''
            });
          }
        }
        
        return availableAthletesArray;
      } catch (err) {
        console.error("Error in useAvailableAthletes:", err);
        return [] as AvailableAthlete[];
      }
    },
    enabled: !!eventId && !!selectedModalityId && !!existingTeams,
  });

  return { availableAthletes };
}
