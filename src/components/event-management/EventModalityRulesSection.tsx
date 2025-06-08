
import React from 'react';
import { DynamicModalityRulesSection } from './modality-rules/DynamicModalityRulesSection';

export function EventModalityRulesSection({ eventId }: { eventId: string | null }) {
  return <DynamicModalityRulesSection eventId={eventId} />;
}
