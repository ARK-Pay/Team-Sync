import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';

const Calendar = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/events')
      .then(response => setEvents(response.data))
      .catch(error => console.error('Error fetching events:', error));
  }, []);

  const handleDateClick = (arg) => {
    const title = prompt('Enter Event Title');
    if (title) {
      const newEvent = { title, start: arg.dateStr };
      axios.post('http://localhost:5000/events', newEvent)
        .then(response => setEvents([...events, response.data]))
        .catch(error => console.error('Error adding event:', error));
    }
  };

  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      initialView='dayGridMonth'
      events={events}
      dateClick={handleDateClick}
      editable={true}
      selectable={true}
    />
  );
};

export default Calendar;