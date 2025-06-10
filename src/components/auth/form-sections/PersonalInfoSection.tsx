
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FullNameField } from './personal-info/FullNameField';
import { BirthDateField } from './personal-info/BirthDateField';
import { DocumentFields } from './personal-info/DocumentFields';
import { GenderField } from './personal-info/GenderField';

interface PersonalInfoSectionProps {
  form: UseFormReturn<any>;
  hideContactInfo?: boolean;
}

export const PersonalInfoSection = ({ form, hideContactInfo }: PersonalInfoSectionProps) => {
  return (
    <div className="space-y-4">
      <FullNameField form={form} />
      <BirthDateField form={form} />
      <DocumentFields form={form} />
      <GenderField form={form} />
    </div>
  );
};
