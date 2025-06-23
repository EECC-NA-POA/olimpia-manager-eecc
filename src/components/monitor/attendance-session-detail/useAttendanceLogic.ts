
import { useState, useEffect } from 'react';
import { AthleteForAttendance, SessionAttendance } from "@/hooks/useSessionAttendance";

export const useAttendanceLogic = (
  existingAttendances: SessionAttendance[] | undefined,
  athletes: AthleteForAttendance[] | undefined
) => {
  const [attendanceData, setAttendanceData] = useState<Map<string, { status: string; attendance_id?: string }>>(new Map());

  useEffect(() => {
    if (existingAttendances && athletes) {
      const newAttendanceData = new Map();
      
      // Primeiro, inicializar todos os atletas com status 'presente' (padrão)
      athletes.forEach(athlete => {
        newAttendanceData.set(athlete.id, {
          status: 'presente',
          attendance_id: undefined
        });
      });
      
      // Depois, atualizar com os dados existentes se houver
      existingAttendances.forEach(attendance => {
        newAttendanceData.set(attendance.atleta_id, {
          status: attendance.status,
          attendance_id: attendance.id
        });
      });
      
      setAttendanceData(newAttendanceData);
    } else if (athletes && !existingAttendances) {
      // Se não há dados existentes, inicializar todos como presente
      const newAttendanceData = new Map();
      athletes.forEach(athlete => {
        newAttendanceData.set(athlete.id, {
          status: 'presente',
          attendance_id: undefined
        });
      });
      setAttendanceData(newAttendanceData);
    }
  }, [existingAttendances, athletes]);

  const handleStatusChange = (athleteId: string, status: string) => {
    const current = attendanceData.get(athleteId) || { status: 'presente' };
    setAttendanceData(new Map(attendanceData.set(athleteId, { ...current, status })));
  };

  const getStatusCounts = () => {
    if (!athletes) return { presente: 0, ausente: 0, atrasado: 0, total: 0 };
    
    let presente = 0, ausente = 0, atrasado = 0;
    
    athletes.forEach(athlete => {
      const data = attendanceData.get(athlete.id);
      if (data) {
        switch (data.status) {
          case 'presente': presente++; break;
          case 'atrasado': atrasado++; break;
          case 'ausente': ausente++; break;
          default: presente++; break;
        }
      } else {
        presente++;
      }
    });
    
    return { presente, ausente, atrasado, total: athletes.length };
  };

  return {
    attendanceData,
    handleStatusChange,
    getStatusCounts
  };
};
