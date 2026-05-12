import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export default function DashboardCalendar({ upcomingEvents = [] }) {
  const [date, setDate] = useState(new Date());

  // Get events for a given day
  const getEventsForDate = (day) => {
    return upcomingEvents.filter(
      (event) =>
        day.toDateString() === new Date(event.start).toDateString()
    );
  };

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Calendar
        onChange={setDate}
        value={date}
        tileClassName={({ date, view }) => {
          if (view === "month" && getEventsForDate(date).length > 0) {
            return "event-day";
          }
          return null;
        }}
        tileContent={({ date, view }) => {
          if (view === "month") {
            const events = getEventsForDate(date);
            if (events.length > 0) {
              return (
                <div
                  title={events.map((e) => e.title).join(", ")} // hover tooltip
                  style={{ height: "100%", width: "100%" }}
                />
              );
            }
          }
          return null;
        }}
      />
      <style>{`
        .event-day {
          background: orange !important;
          color: white !important;
          border-radius: 6px;
        }
        .react-calendar{
          width: 100% !important;
        }
      `}</style>
    </div>
  );
}
