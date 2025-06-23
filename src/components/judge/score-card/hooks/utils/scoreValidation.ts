
interface AthleteData {
  atleta_id: string;
  equipe_id?: number;
}

export function validateScoreSubmission(
  eventId: string | null,
  judgeId: string,
  athlete: AthleteData
) {
  if (!eventId) throw new Error('Event ID is missing');
  if (!judgeId) throw new Error('Judge ID is missing');
  if (!athlete.atleta_id) throw new Error('Athlete ID is missing');
}
