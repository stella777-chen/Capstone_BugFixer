import React, { useEffect } from 'react';
import './CantierListView.scss'; // Import the SCSS file

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

interface IFListData {
  data: CalendarEvent[];
  calendarRef: React.RefObject<any>;
}

function groupByDate(events: CalendarEvent[]): Record<string, CalendarEvent[]> {
  return events.reduce((acc: Record<string, CalendarEvent[]>, event) => {
    const date = new Date(event.start);
    const dateKey = date.toISOString().split("T")[0];
    acc[dateKey] = acc[dateKey] || [];
    acc[dateKey].push(event);
    return acc;
  }, {});
}

function formatDateHeader(dateStr: string | number | Date) {
  const date = new Date(dateStr);
  const dayName = date.toLocaleDateString(undefined, { weekday: "long" });
  const dateLabel = date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return { dayName, dateLabel };
}

function formatTimeRange(startStr: string | number | Date, endStr: string | number | Date | undefined) {
  if (!startStr || !endStr) return "-";
  const start = new Date(startStr);
  const end = new Date(endStr);
  return `${start.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} - ${end.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
}

const CantierListView: React.FC<IFListData> = ({ data, calendarRef }) => {
 
  const grouped = groupByDate(data);

  return (
    <div>
      {Object.entries(grouped).map(([dateKey, dayEvents]) => {
        const { dayName, dateLabel } = formatDateHeader(dateKey);
        return (
          <div key={dateKey} className="scheduler-section">
            <div className="scheduler-header">
              <span>{dayName}</span>
              <span>{dateLabel}</span>
            </div>

            {dayEvents.map((event) => (
              <div key={event.id} className="scheduler-event">
                <div className="event-time">
                  {event.allDay ? "All Day" : formatTimeRange(event.start, event.end)}
                </div>
                <div className="event-dot">
                  <span style={{ backgroundColor: event.backgroundColor || "#ccc" }} />
                </div>
                <div className="event-title">{event.title}</div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
};

export default CantierListView;
