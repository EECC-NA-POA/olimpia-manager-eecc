
export const ConcordiaMap = () => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400">
      <div className="rounded-lg overflow-hidden shadow-lg border border-gray-200">
        <iframe 
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3452.9352782266233!2d-51.2266751235831!3d-30.067389632342383!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x951979dfc51a8533%3A0x38b7ece85b2cee58!2sBosque%20950%20Esporte%20e%20Lazer!5e0!3m2!1spt-BR!2sbr!4v1762231732496!5m2!1spt-BR!2sbr"
          width="100%" 
          height="450" 
          style={{ border: 0 }} 
          allowFullScreen
          loading="lazy" 
          referrerPolicy="no-referrer-when-downgrade"
          title="Localização do Torneio Concórdia - Bosque 950"
        />
      </div>
    </div>
  );
};
