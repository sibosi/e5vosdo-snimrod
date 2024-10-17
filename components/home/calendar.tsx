"use client";
import React, { useState } from "react";
import { title } from "../primitives";

const days = ["Csütörtök", "Péntek", "Összes"];

interface Event {
  title: string;
  time: string;
  description: string;
}

interface EventCalendarProps {
  events: Event[][];
}

const EventCalendar: React.FC<EventCalendarProps> = ({ events }) => {
  const [selectedDay, setSelectedDay] = useState(0);

  const handleDayClick = (dayIndex: React.SetStateAction<number>) => {
    setSelectedDay(dayIndex);
  };

  const renderDayTabs = () => {
    return days.map((day, index) => (
      <button
        key={index}
        onClick={() => handleDayClick(index)}
        className={`mx-auto w-24 rounded-lg p-1 px-2 ${selectedDay === index ? "active bg-selfprimary-200" : "bg-selfprimary-100"}`}
      >
        {day}
      </button>
    ));
  };

  const renderEventsForDay = (day?: number) => {
    const eventsForDay = events[day ?? selectedDay] || [];

    if (eventsForDay.length === 0) {
      return <div>No events for this day</div>;
    }

    return eventsForDay.map((event, idx) => (
      <p key={idx} className="">
        <span className="font-mono">{event.time}</span>

        <span className="font-extrabold text-primary-500">
          &nbsp;&bull;&nbsp;
        </span>

        <span>{event.title}</span>
      </p>
    ));
  };

  return (
    <div className="my-4 font-semibold text-foreground">
      <h1 className="mb-2 text-center text-2xl font-bold">E5N Események</h1>
      <div className="grid grid-cols-3">{renderDayTabs()}</div>
      <div className="events-container">
        {selectedDay === 2 ? ( // If selected day is "Összes"
          <>
            {events.map((dayEvents, dayIndex) => (
              <div key={dayIndex} className="mt-2">
                <p className="w-1/3 border-b-2 border-selfprimary-400">
                  {days[dayIndex]}
                </p>
                {renderEventsForDay(dayIndex)}
              </div>
            ))}
          </>
        ) : (
          <>
            <p className="w-1/3 border-b-2 border-selfprimary-400">
              {days[selectedDay]}
            </p>
            {renderEventsForDay()}
          </>
        )}
      </div>
    </div>
  );
};

// Example usage
const sampleEvents = [
  // Day 1 (Today)
  [
    {
      title: "1. előadássáv",
      time: "09:00",
      description: "Discuss the project.",
    },
    {
      title: "2. előadássáv",
      time: "10:00",
      description: "Lunch with the team.",
    },
    {
      title: "Kötélhúzás",
      time: "11:00",
      description: "Kötélhúzás a kollégákkal.",
    },
    {
      title: "Ebédszünet",
      time: "12:30",
      description: "Ebédszünet a kollégákkal.",
    },
    {
      title: "Röplabda bajnokság",
      time: "13:00",
      description: "Röplabda bajnokság a kollégákkal.",
    },

    {
      title: "Programsáv",
      time: "13:30",
      description: "Programsáv a kollégákkal.",
    },

    {
      title: "Focibajnokság",
      time: "15:00",
      description: "Focibajnokság a kollégákkal.",
    },

    {
      title: "KMT",
      time: "18:00",
      description: "Ki mit tud a kollégákkal.",
    },
  ],
  // Day 2 (Tomorrow)
  [
    {
      title: "Szakmai előadások",
      time: "09:00",
      description: "Szakmai előadások a kollégákkal.",
    },
    {
      title: "1. előadássáv",
      time: "10:15",
      description: "Discuss the project.",
    },
    {
      title: "2. előadássáv",
      time: "11:15",
      description: "Lunch with the team.",
    },
    {
      title: "Ebédszünet",
      time: "12:00",
      description: "Ebédszünet a kollégákkal.",
    },
    {
      title: "Programsáv",
      time: "13:30",
      description: "Programsáv a kollégákkal.",
    },
    {
      title: "Brawl Stars bajnokság",
      time: "13:30",
      description: "Brawl Stars bajnokság a kollégákkal.",
    },
    {
      title: "Pingpongbajnokság",
      time: "15:00",
      description: "Pingpongbajnokság a kollégákkal.",
    },
    {
      title: "Ninja Warrior",
      time: "15:00",
      description: "Ninja Warrior a kollégákkal.",
    },
    {
      title: "Spikeball",
      time: "15:00",
      description: "Spikeball a kollégákkal.",
    },
    {
      title: "Gólyabál",
      time: "18:00",
      description: "Ki mit tud a kollégákkal.",
    },
  ],
];

const App = () => (
  <div>
    <EventCalendar events={sampleEvents} />
  </div>
);

export default App;
