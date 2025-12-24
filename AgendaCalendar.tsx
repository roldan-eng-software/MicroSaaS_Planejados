import { useState, useCallback } from 'react';
import { Calendar, dateFnsLocalizer, View, Views } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import ptBR from 'date-fns/locale/pt-BR';
import { startOfMonth, endOfMonth } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import { useCompromissosPorPeriodo } from '../../hooks/useCompromissos';

const locales = {
  'pt-BR': ptBR,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export function AgendaCalendar() {
  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState(new Date());

  // Define o intervalo de busca baseado no mês atual da visualização
  // (Pode ser refinado para buscar apenas a semana se a view for WEEK, etc.)
  const rangeStart = startOfMonth(date);
  const rangeEnd = endOfMonth(date);

  const { data: compromissos, isLoading } = useCompromissosPorPeriodo(
    rangeStart.toISOString(),
    rangeEnd.toISOString()
  );

  // Mapeia os dados do backend para o formato do react-big-calendar
  const events = compromissos?.map((c) => ({
    id: c.id,
    title: `${c.titulo} (${c.status})`,
    start: new Date(c.data_hora_inicio),
    end: new Date(c.data_hora_fim),
    resource: c,
  })) || [];

  const onNavigate = useCallback((newDate: Date) => {
    setDate(newDate);
  }, []);

  const onView = useCallback((newView: View) => {
    setView(newView);
  }, []);

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Carregando agenda...</div>;
  }

  return (
    <div className="h-[600px] bg-white p-4 rounded-lg shadow border border-gray-200">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        culture="pt-BR"
        messages={{
          next: 'Próximo',
          previous: 'Anterior',
          today: 'Hoje',
          month: 'Mês',
          week: 'Semana',
          day: 'Dia',
          agenda: 'Agenda',
          date: 'Data',
          time: 'Hora',
          event: 'Evento',
          noEventsInRange: 'Sem compromissos neste período.',
        }}
        view={view}
        date={date}
        onNavigate={onNavigate}
        onView={onView}
        onSelectEvent={(event) => {
            console.log('Compromisso selecionado:', event.resource);
            // Futuro: Abrir modal de edição
        }}
      />
    </div>
  );
}