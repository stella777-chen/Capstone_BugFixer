import { Stack } from "@fluentui/react";
import { CalendarLtrRegular, ChevronDoubleLeftFilled, ChevronDoubleRightRegular, ChevronLeftRegular, ChevronRightRegular } from "@fluentui/react-icons";
import FullCalendar from "@fullcalendar/react";
import { useEffect, useState } from "react";
import {
  Dropdown,
  Option,
  Persona,
} from '@fluentui/react-components';
import './CantierCalendarHeader.scss';
const CantierCalendarHeader: React.FC<{
  calendarRef: React.RefObject<FullCalendar>;
  //   currentView: string;
  //   onViewChange: (view: string) => void;
  currentType: string;
  onTypeChange: (view: string) => void;
}> = ({ calendarRef,
  onTypeChange,
  // currentView, onViewChange
}) => {
    const [currentTitle, setCurrentTitle] = useState("");
    const [currentView, setCurrentView] = useState("");
    useEffect(() => {
      const calendarApi = calendarRef.current?.getApi();
      if (calendarApi) {
        setCurrentTitle(calendarApi.view.title);
      }
    }, [calendarRef, currentView]);

    function onActiveCalendarOption(_: any, data: any): void {
      setCurrentView(data.nextOption.value);
      calendarRef.current?.getApi().changeView(data.nextOption.value);
    }

    function onActiveTypeOption(_: any, data: any): void {
      // Placeholder for second dropdown
      onTypeChange(data.nextOption.value)
    }

    const navigate = (action: "prev" | "next" | "today" | "prevYear" | "nextYear") => {
      const api = calendarRef.current?.getApi();
      if (!api) return;
      switch (action) {
        case "prev": api.prev(); break;
        case "next": api.next(); break;
        case "today": api.today(); break;
        case "prevYear": api.prevYear(); break;
        case "nextYear": api.nextYear(); break;
      }
      setCurrentTitle(api.view.title);
    };

    return (
      <Stack className='calender_custom_header' horizontal verticalAlign="center" horizontalAlign="space-between">
        {/* Title & Nav */}
        <div className="calendar-header-left">
          <CalendarLtrRegular className="headerCalendarIcon" />
          <span className="calendar-title">{currentTitle}</span>
          <button onClick={() => navigate("prevYear")}><ChevronDoubleLeftFilled /></button>
          <button onClick={() => navigate("prev")}><ChevronLeftRegular /></button>
          <button onClick={() => navigate("today")}>Today</button>
          <button onClick={() => navigate("next")}><ChevronRightRegular /></button>
          <button onClick={() => navigate("nextYear")}><ChevronDoubleRightRegular /></button>
        </div>

        {/* Dropdowns */}
        <div className='calender_custom_header_dropdown_wrapper'>
          <div className='header_dropdown_wrapper'>
            <CalendarLtrRegular className="dropDownCalendarIcon" />
            <Dropdown
              defaultValue="Calendar"
              onActiveOptionChange={onActiveTypeOption}
              className="dropdown_content"
            >
              <Option text="Calendar" value="calendar">
                <CalendarLtrRegular />
                Calendar
              </Option>
              <Option text="List" value="list">
                <CalendarLtrRegular />
                List
              </Option>
              <Option text="Card" value="card">
                <CalendarLtrRegular />
                Card
              </Option>
            </Dropdown>
          </div>
          <div className='header_dropdown_wrapper'>
            <CalendarLtrRegular className="dropDownCalendarIcon" />
            <Dropdown
              defaultValue="Month"
              onActiveOptionChange={onActiveCalendarOption}
              className="dropdown_content"
            >
              <Option text="Month" value="dayGridMonth">
                <CalendarLtrRegular />
                Month
              </Option>
              <Option text="Week" value="timeGridWeek">
                <CalendarLtrRegular />
                Week
              </Option>
              <Option text="Day" value="timeGridDay">
                <CalendarLtrRegular />
                Day
              </Option>
            </Dropdown>
          </div>
        </div>
      </Stack>
    );
  };
export default CantierCalendarHeader;