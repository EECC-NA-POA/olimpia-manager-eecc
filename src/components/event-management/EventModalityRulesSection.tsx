
import React from 'react';
import { ModalityRulesSection } from './modality-rules/ModalityRulesSection';

export function EventModalityRulesSection({ eventId }: { eventId: string | null }) {
  return <ModalityRulesSection eventId={eventId} />;
}
