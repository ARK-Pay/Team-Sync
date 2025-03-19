const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/fullcalendar', { useNewUrlParser: true, useUnifiedTopology: true });

const eventSchema = new mongoose.Schema({ title: String, start: String });
const Event = mongoose.model('Event', eventSchema);

app.get('/events', async (req, res) => {
  const events = await Event.find();
  res.json(events);
});

app.post('/events', async (req, res) => {
  const newEvent = new Event(req.body);
  await newEvent.save();
  res.json(newEvent);
});

app.listen(5000, () => console.log('Server running on port 5000')); 