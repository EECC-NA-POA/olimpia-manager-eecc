
import { Athlete } from '../hooks/useAthletes';

export interface AthleteWithBranchData extends Athlete {
  branchName?: string;
  branchState?: string;
  numero_identificador: string;
}
