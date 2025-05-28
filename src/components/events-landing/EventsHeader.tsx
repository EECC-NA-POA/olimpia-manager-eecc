
import React from 'react';
import { Calendar, Users, Trophy, Globe } from 'lucide-react';

export function EventsHeader() {
  return (
    <div className="text-center mb-16">
      <div className="flex justify-center items-center gap-3 mb-6">
        <Trophy className="h-12 w-12 text-olimpics-green-primary" />
        <h1 className="text-4xl md:text-6xl font-bold text-olimpics-green-primary">
          Olímpia Manager
        </h1>
      </div>
      <p className="text-xl md:text-2xl text-gray-700 max-w-4xl mx-auto mb-8">
        Sistema de gestão de eventos e atividades da Escola do Esporte com Coração
      </p>
      
      {/* About EECC Section */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 max-w-6xl mx-auto shadow-lg">
        <div className="flex justify-center items-center gap-3 mb-6">
          <Globe className="h-8 w-8 text-olimpics-orange-primary" />
          <h2 className="text-2xl md:text-3xl font-bold text-olimpics-orange-primary">
            Escola do Esporte com Coração
          </h2>
        </div>
        
        <div className="text-gray-700 text-lg leading-relaxed space-y-4">
          <p>
            A Escola do Esporte com o Coração de Nova Acrópole é uma <strong>entidade internacional sem fins lucrativos</strong>, 
            presente em mais de <strong>20 países há 14 anos</strong>, com o objetivo de promover o desenvolvimento humano 
            através do desenvolvimento de valores morais no esporte.
          </p>
          
          <p>
            No Brasil, há <strong>10 anos</strong>, tem oferecido a oportunidade de praticar atividades esportivas em mais de 
            <strong> 30 unidades da Nova Acrópole</strong> pelas principais cidades do país, pois acreditamos que o Esporte, 
            através de uma abordagem pedagógica e filosófica, é capaz de construir um mundo melhor.
          </p>
          
          <p className="text-olimpics-green-primary font-medium">
            O esporte fortalece os praticantes por meio das virtudes e valores, ensinando-os a se conhecerem e 
            superarem a si mesmos, conviverem melhor com os demais e a vivenciarem o verdadeiro espírito da vitória.
          </p>
        </div>
        
        {/* Key Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="text-center p-4 bg-olimpics-green-primary/10 rounded-lg">
            <Users className="h-8 w-8 text-olimpics-green-primary mx-auto mb-3" />
            <h3 className="font-bold text-olimpics-green-primary mb-2">20+ Países</h3>
            <p className="text-sm text-gray-600">Presença internacional consolidada</p>
          </div>
          
          <div className="text-center p-4 bg-olimpics-orange-primary/10 rounded-lg">
            <Calendar className="h-8 w-8 text-olimpics-orange-primary mx-auto mb-3" />
            <h3 className="font-bold text-olimpics-orange-primary mb-2">14 Anos</h3>
            <p className="text-sm text-gray-600">De experiência mundial</p>
          </div>
          
          <div className="text-center p-4 bg-olimpics-green-primary/10 rounded-lg">
            <Trophy className="h-8 w-8 text-olimpics-green-primary mx-auto mb-3" />
            <h3 className="font-bold text-olimpics-green-primary mb-2">30+ Unidades</h3>
            <p className="text-sm text-gray-600">No Brasil</p>
          </div>
        </div>
      </div>
    </div>
  );
}
