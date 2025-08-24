import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Plus, Edit, Trash2, Clock, BookOpen } from 'lucide-react';
import { calendarAPI, courseAPI } from '../../services/api';
import { Modal, Button, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  event_time: string;
  type: 'assignment' | 'quiz' | 'meeting' | 'deadline' | 'event';
  course_id?: string;
  course_name?: string;
  user_id?: string;
  is_all_day: boolean;
}

interface Course {
  id: string;
  title: string;
}

const CalendarPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    event_time: '',
    type: 'assignment' as Event['type'],
    course_id: '',
    is_all_day: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch events and courses from backend
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [eventsData, coursesData] = await Promise.all([
          calendarAPI.getEvents(),
          courseAPI.getCourses(),
        ]);

        let mappedCourses: Course[] = [];
        if (Array.isArray(coursesData)) {
          mappedCourses = coursesData.map((course: any) => ({
            id: course.id.toString(),
            title: course.title || '',
          }));
        } else if (coursesData && typeof coursesData === 'object' && 'data' in coursesData && Array.isArray((coursesData as any).data)) {
          mappedCourses = (coursesData as any).data.map((course: any) => ({
            id: course.id.toString(),
            title: course.title || '',
          }));
        } else {
          console.warn('Courses data is not an array:', coursesData);
          mappedCourses = [];
        }

        const mappedEvents: Event[] = eventsData.map((event: any) => {
          let normalizedDate = '';
          if (event.event_date) {
            const dateObj = new Date(event.event_date);
            normalizedDate = dateObj.toISOString().split('T')[0];
          }
          return {
            id: event.id.toString(),
            title: event.title || '',
            description: event.description || '',
            event_date: normalizedDate,
            event_time: event.event_time || '',
            type: event.type || 'event',
            course_id: event.course_id?.toString(),
            course_name: event.course_name || mappedCourses.find((c) => c.id === event.course_id?.toString())?.title || '',
            user_id: event.user_id?.toString(),
            is_all_day: !!event.is_all_day,
          };
        });

        setEvents(mappedEvents);
        setCourses(mappedCourses);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setError('Failed to load calendar data. Using sample data.');
        const sampleEvents: Event[] = [
          {
            id: '1',
            title: 'Math Assignment Due',
            description: 'Complete Chapter 5 exercises',
            event_date: '2025-08-15',
            event_time: '23:59:00',
            type: 'assignment',
            course_id: '1',
            course_name: 'Advanced Mathematics',
            is_all_day: false,
          },
          {
            id: '6',
            title: 'Physics Quiz',
            description: 'Quantum Mechanics',
            event_date: '2025-08-28',
            event_time: '05:05:00',
            type: 'quiz',
            course_id: '4',
            course_name: 'Physics 101',
            is_all_day: false,
          },
        ];
        const sampleCourses: Course[] = [
          { id: '1', title: 'Advanced Mathematics' },
          { id: '4', title: 'Physics 101' },
        ];
        setEvents(sampleEvents);
        setCourses(sampleCourses);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const getDaysInMonth = (date: Date): (Date | null)[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay(); // 0 (Sun) to 6 (Sat)

    const days: (Date | null)[] = [];
    // Add padding for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    // Add actual days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    // Fill the remaining cells to complete a 6x7 grid (42 cells)
    while (days.length < 42) {
      days.push(null);
    }
    return days;
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter((event) => event.event_date === dateStr && (event.title.toLowerCase().includes(searchQuery.toLowerCase()) || event.description.toLowerCase().includes(searchQuery.toLowerCase())));
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'assignment': return 'bg-primary';
      case 'quiz': return 'bg-danger';
      case 'meeting': return 'bg-success';
      case 'deadline': return 'bg-warning';
      case 'event': return 'bg-info';
      default: return 'bg-secondary';
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'assignment': return <BookOpen size={14} />;
      case 'quiz': return <Clock size={14} />;
      case 'meeting': return <CalendarIcon size={14} />;
      case 'deadline': return <Clock size={14} />;
      case 'event': return <CalendarIcon size={14} />;
      default: return <CalendarIcon size={14} />;
    }
  };

  const handleAddOrUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const eventData = {
        ...formData,
        course_id: formData.course_id || null,
        event_time: formData.is_all_day ? '' : formData.event_time || '00:00:00',
      };
      await (editingEvent ? calendarAPI.updateEvent(editingEvent.id, eventData) : calendarAPI.createEvent(eventData));
      const [eventsData, coursesData] = await Promise.all([
        calendarAPI.getEvents(),
        courseAPI.getCourses(),
      ]);

      let mappedCourses: Course[] = [];
      if (Array.isArray(coursesData)) {
        mappedCourses = coursesData.map((course: any) => ({
          id: course.id.toString(),
          title: course.title || '',
        }));
      } else if (coursesData && typeof coursesData === 'object' && 'data' in coursesData && Array.isArray((coursesData as any).data)) {
        mappedCourses = (coursesData as any).data.map((course: any) => ({
          id: course.id.toString(),
          title: course.title || '',
        }));
      }

      const mappedEvents: Event[] = eventsData.map((event: any) => {
        let normalizedDate = '';
        if (event.event_date) {
          const dateObj = new Date(event.event_date);
          normalizedDate = dateObj.toISOString().split('T')[0];
        }
        return {
          id: event.id.toString(),
          title: event.title || '',
          description: event.description || '',
          event_date: normalizedDate,
          event_time: event.event_time || '',
          type: event.type || 'event',
          course_id: event.course_id?.toString(),
          course_name: event.course_name || mappedCourses.find((c) => c.id === event.course_id?.toString())?.title || '',
          user_id: event.user_id?.toString(),
          is_all_day: !!event.is_all_day,
        };
      });

      setEvents(mappedEvents);
      setCourses(mappedCourses);
      setShowEventModal(false);
      resetForm();
    } catch (error) {
      console.error('Failed to save event:', error);
      setError('Failed to save event. Please try again.');
    }
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      event_date: event.event_date,
      event_time: event.event_time,
      type: event.type,
      course_id: event.course_id || '',
      is_all_day: event.is_all_day,
    });
    setShowEventModal(true);
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await calendarAPI.deleteEvent(eventId);
        const [eventsData, coursesData] = await Promise.all([
          calendarAPI.getEvents(),
          courseAPI.getCourses(),
        ]);

        let mappedCourses: Course[] = [];
        if (Array.isArray(coursesData)) {
          mappedCourses = coursesData.map((course: any) => ({
            id: course.id.toString(),
            title: course.title || '',
          }));
        } else if (coursesData && typeof coursesData === 'object' && 'data' in coursesData && Array.isArray((coursesData as any).data)) {
          mappedCourses = (coursesData as any).data.map((course: any) => ({
            id: course.id.toString(),
            title: course.title || '',
          }));
        }

        const mappedEvents: Event[] = eventsData.map((event: any) => {
          let normalizedDate = '';
          if (event.event_date) {
            const dateObj = new Date(event.event_date);
            normalizedDate = dateObj.toISOString().split('T')[0];
          }
          return {
            id: event.id.toString(),
            title: event.title || '',
            description: event.description || '',
            event_date: normalizedDate,
            event_time: event.event_time || '',
            type: event.type || 'event',
            course_id: event.course_id?.toString(),
            course_name: event.course_name || mappedCourses.find((c) => c.id === event.course_id?.toString())?.title || '',
            user_id: event.user_id?.toString(),
            is_all_day: !!event.is_all_day,
          };
        });

        setEvents(mappedEvents);
        setCourses(mappedCourses);
        if (selectedDate && getEventsForDate(selectedDate).length === 1) {
          setSelectedDate(null);
        }
      } catch (error) {
        console.error('Failed to delete event:', error);
        setError('Failed to delete event. Please try again.');
      }
    }
  };

  const resetForm = () => {
    setEditingEvent(null);
    setFormData({
      title: '',
      description: '',
      event_date: selectedDate ? selectedDate.toISOString().split('T')[0] : '',
      event_time: '',
      type: 'assignment',
      course_id: '',
      is_all_day: false,
    });
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const days = getDaysInMonth(currentDate);

  return (
    <div className="container-fluid py-4">
      <style>{`.calendar-day:hover { background-color: #f8f9fa !important; }`}</style>
      {isLoading ? (
        <div className="text-center text-muted">Loading calendar...</div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <div className="row">
          {/* Left Side: Calendar */}
          <div className="col-12 col-md-7">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1 className="h3 mb-0 text-dark">Calendar</h1>
              <button
                onClick={() => {
                  resetForm();
                  setShowEventModal(true);
                }}
                className="btn btn-primary btn-sm d-flex align-items-center"
              >
                <Plus size={16} className="me-2" />
                Add Event
              </button>
            </div>
            <Form.Control
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-4"
            />

            {/* Calendar Navigation */}
            <div className="card border-0 shadow-sm mb-4" style={{ width: '100%' }}>
              <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
                <button
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                  className="btn btn-outline-secondary btn-sm"
                >
                  Previous
                </button>
                <h5 className="mb-0 text-dark">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h5>
                <button
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                  className="btn btn-outline-secondary btn-sm"
                >
                  Next
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="card-body p-0">
                <div className="d-grid" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="text-center py-3 bg-light border-bottom border-end fw-bold text-muted">
                      {day}
                    </div>
                  ))}
                </div>
                {Array.from({ length: 6 }, (_, weekIndex) => (
                  <div key={weekIndex} className="d-grid" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
                    {days.slice(weekIndex * 7, (weekIndex + 1) * 7).map((day, dayIndex) => (
                      <div
                        key={`${weekIndex}-${dayIndex}`}
                        className={`border-end border-bottom p-2 ${day ? 'calendar-day' : ''} ${
                          day && day.toDateString() === new Date().toDateString() ? 'bg-primary-subtle' : ''
                        } ${
                          selectedDate && day && day.toDateString() === selectedDate.toDateString() ? 'bg-info-subtle' : ''
                        } ${day ? 'bg-white' : 'bg-light'}`}
                        style={{ minHeight: '120px', cursor: day ? 'pointer' : 'default' }}
                        onClick={() => day && setSelectedDate(day)}
                      >
                        {day && (
                          <>
                            <div className="text-sm font-medium text-dark mb-2">
                              {day.getDate()}
                            </div>
                            <div className="d-flex flex-column gap-1">
                              {getEventsForDate(day).slice(0, 3).map((event) => (
                                <div
                                  key={event.id}
                                  className={`small p-1 rounded text-white ${getEventTypeColor(event.type)} d-flex align-items-center gap-1`}
                                  style={{ fontSize: '0.75rem', overflow: 'hidden' }}
                                  title={event.title}
                                >
                                  {getEventTypeIcon(event.type)}
                                  <span className="text-truncate" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                                    {event.title.substring(0, 3)}
                                  </span>
                                </div>
                              ))}
                              {getEventsForDate(day).length > 3 && (
                                <div className="text-muted small">
                                  +{getEventsForDate(day).length - 3} more
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side: Selected Date Events and Upcoming Events */}
          <div className="col-12 col-md-5">
            {/* Selected Date Events */}
            {selectedDate && (
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                  <h5 className="mb-0 text-dark">Events for {selectedDate.toLocaleDateString()}</h5>
                  <button
                    onClick={() => {
                      resetForm();
                      setShowEventModal(true);
                    }}
                    className="btn btn-primary btn-sm d-flex align-items-center"
                  >
                    <Plus size={16} className="me-2" />
                    Add Event
                  </button>
                </div>
                <div className="card-body">
                  {getEventsForDate(selectedDate).length > 0 ? (
                    getEventsForDate(selectedDate).map((event) => (
                      <div key={event.id} className="border-start border-primary border-4 ps-3 py-2 mb-3">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h6 className="mb-1 text-dark">{event.title}</h6>
                            <p className="text-muted small mb-1">{event.description}</p>
                            {event.course_name && (
                              <p className="text-primary small">{event.course_name}</p>
                            )}
                            <p className="text-muted small">{event.is_all_day ? 'All Day' : event.event_time}</p>
                          </div>
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-outline-secondary btn-sm p-1"
                              onClick={() => handleEditEvent(event)}
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              className="btn btn-outline-danger btn-sm p-1"
                              onClick={() => handleDeleteEvent(event.id)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted">No events for this date.</p>
                  )}
                  <button
                    onClick={() => setSelectedDate(null)}
                    className="btn btn-link text-muted"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            {/* Upcoming Events */}
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white py-3">
                <h5 className="mb-0 text-dark">Upcoming Events</h5>
              </div>
              <div className="card-body">
                <div className="d-flex flex-column gap-3">
                  {events
                    .filter((event) => {
                      const eventDateTime = new Date(event.event_date + 'T' + (event.event_time || '00:00:00'));
                      return eventDateTime >= new Date() && (event.title.toLowerCase().includes(searchQuery.toLowerCase()) || event.description.toLowerCase().includes(searchQuery.toLowerCase()));
                    })
                    .sort((a, b) => {
                      const dateA = new Date(a.event_date + 'T' + (a.event_time || '00:00:00'));
                      const dateB = new Date(b.event_date + 'T' + (b.event_time || '00:00:00'));
                      return dateA.getTime() - dateB.getTime();
                    })
                    .slice(0, 5)
                    .map((event) => (
                      <div
                        key={event.id}
                        className="d-flex align-items-center p-3 border-bottom"
                      >
                        <div className={`d-flex align-items-center rounded-circle ${getEventTypeColor(event.type)} p-2 me-3`}>
                          {getEventTypeIcon(event.type)}
                        </div>
                        <div className="flex-grow-1">
                          <h6 className="mb-1 text-dark">{event.title}</h6>
                          <p className="text-muted small mb-0">{event.description}</p>
                          {event.course_name && (
                            <p className="text-primary small mb-0">{event.course_name}</p>
                          )}
                        </div>
                        <div className="text-end">
                          <p className="mb-1 small text-dark">{new Date(event.event_date).toLocaleDateString()}</p>
                          <p className="text-muted small">{event.is_all_day ? 'All Day' : event.event_time}</p>
                        </div>
                      </div>
                    ))}
                  {events.filter((event) => {
                    const eventDateTime = new Date(event.event_date + 'T' + (event.event_time || '00:00:00'));
                    return eventDateTime >= new Date() && (event.title.toLowerCase().includes(searchQuery.toLowerCase()) || event.description.toLowerCase().includes(searchQuery.toLowerCase()));
                  }).length === 0 && (
                    <p className="text-muted">No upcoming events.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Event Modal */}
          <Modal show={showEventModal} onHide={() => setShowEventModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>{editingEvent ? 'Edit Event' : 'Add Event'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleAddOrUpdateEvent}>
                <Form.Group className="mb-3">
                  <Form.Label>Title</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.event_date}
                    onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="All Day"
                    checked={formData.is_all_day}
                    onChange={(e) => setFormData({ ...formData, is_all_day: e.target.checked, event_time: e.target.checked ? '' : formData.event_time })}
                  />
                </Form.Group>
                {!formData.is_all_day && (
                  <Form.Group className="mb-3">
                    <Form.Label>Time</Form.Label>
                    <Form.Control
                      type="time"
                      value={formData.event_time}
                      onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
                      required={!formData.is_all_day}
                    />
                  </Form.Group>
                )}
                <Form.Group className="mb-3">
                  <Form.Label>Type</Form.Label>
                  <Form.Select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as Event['type'] })}
                  >
                    <option value="assignment">Assignment</option>
                    <option value="quiz">Quiz</option>
                    <option value="meeting">Meeting</option>
                    <option value="deadline">Deadline</option>
                    <option value="event">Event</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Course</Form.Label>
                  <Form.Select
                    value={formData.course_id}
                    onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                  >
                    <option value="">None</option>
                    {Array.isArray(courses) ? (
                      courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.title}
                        </option>
                      ))
                    ) : (
                      <option disabled>No courses available</option>
                    )}
                  </Form.Select>
                </Form.Group>
                <Button variant="primary" type="submit" className="w-100">
                  {editingEvent ? 'Update Event' : 'Add Event'}
                </Button>
              </Form>
            </Modal.Body>
          </Modal>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;