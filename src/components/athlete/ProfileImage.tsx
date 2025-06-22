
import React from 'react';
import { User } from "lucide-react";

interface ProfileImageProps {
  gender: string;
  identificador?: string;
  isPublicUser: boolean;
}

const getProfileImage = (gender: string | undefined) => {
  switch (gender?.toLowerCase()) {
    case 'masculino':
      return "/lovable-uploads/EECC_marca_portugues_cores_RGB.png";
    case 'feminino':
      return "/lovable-uploads/EECC_marca_portugues_cores_RGB.png";
    default:
      return "/lovable-uploads/EECC_marca_portugues_cores_RGB.png";
  }
};

export default function ProfileImage({ gender, identificador, isPublicUser }: ProfileImageProps) {
  console.log('ProfileImage props:', { gender, identificador, isPublicUser });
  
  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative w-48 h-48">
        <div 
          className="absolute inset-0 bg-contain bg-center bg-no-repeat opacity-10"
          style={{ 
            backgroundImage: 'url("/lovable-uploads/LOGO_COMITE_PIERRE_COUBERTIN.png")',
            backgroundSize: '80%',
            backgroundPosition: 'center'
          }}
        />
        <img
          src={getProfileImage(gender)}
          alt="Profile"
          className="w-full h-full rounded-full object-cover border-4 border-olimpics-green-primary relative z-10"
        />
      </div>
      <div className="text-center">
        <div className="bg-olimpics-green-primary text-white px-4 py-2 rounded-lg shadow-lg">
          <p className="text-sm font-medium">
            {isPublicUser ? 'PERFIL' : 'ID DO ATLETA'}
          </p>
          <p className="text-xl font-bold">
            {isPublicUser ? 'Público Geral' : (identificador || 'N/A')}
          </p>
        </div>
      </div>
    </div>
  );
}
