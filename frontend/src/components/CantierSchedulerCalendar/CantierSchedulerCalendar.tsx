import React, { SyntheticEvent, useEffect, useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { CalendarApi } from "@fullcalendar/core";
import interactionPlugin, {
  DateClickArg,
} from '@fullcalendar/interaction';
import { Stack } from '@fluentui/react';
import {
  Dropdown,
  Option,
  Persona,
} from '@fluentui/react-components';
import './CantierSchedulerCalendar.scss';
import { CalendarLtrRegular, ChevronLeftRegular, ChevronRightRegular } from '@fluentui/react-icons';
import CantierCalendarHeader from './CantierCalendarHeader';
export interface CalendarEvent {
  id?: string;
  title: string;
  start: string | Date;
  end?: string | Date;
  allDay?: boolean;
  backgroundColor?: string;
  extendedProps?: {
    [key: string]: any;
  };
}
interface IFCalendar {
  data: CalendarEvent[];
  calendarRef: React.RefObject<FullCalendar>;
}


const CantierSchedulerCalendar: React.FC<IFCalendar> = ({ data,calendarRef }) => {


  return (
    <>
      <Stack className='Calender_wrapper'>
        {/* <CantierCalendarHeader
          calendarRef={calendarRef}
          currentView={currentView}
          onViewChange={(view) => {
            setCurrentView(view);
            calendarRef.current?.getApi().changeView(view);
          }}
        /> */}
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          dayMaxEventRows={3}
          moreLinkClick="popover"
          height={800}
          headerToolbar={false}
          // headerToolbar={{
          //   right: 'title prevYear,prev,today,next,nextYear',
          //   center: 'title',
          //    left: 'dayGridMonth,timeGridWeek,timeGridDay',
          // }}
          ref={calendarRef}
          eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          }}
          events={data}
          //   dateClick={(arg: DateClickArg) => {
          //     const title = prompt('Event title?');
          //     if (title) setEvents(prev => [...prev, { title, start: arg.dateStr }]);
          //   }}
          eventClick={(arg) => {
            // if (confirm(`Delete "${arg.event.title}"?`)) arg.event.remove();
          }}
          editable
          selectable
        />
      </Stack>
    </>

  );
};

export default CantierSchedulerCalendar;
