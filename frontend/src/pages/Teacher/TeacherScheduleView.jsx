import React, { useState } from "react";
import { 
  Card, 
  Form, 
  Button, 
  Row, 
  Col, 
  Modal,
  Navbar,
  Container,
  Dropdown,
  ButtonGroup
} from "react-bootstrap";

const TeacherScheduleView = () => {
  const [view, setView] = useState("week");
  const [showModal, setShowModal] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState({
    "2023-10-17-9": { id: 1, title: "Physics Class", subject: "Advanced Physics", type: "class" },
    "2023-10-17-11": { id: 2, title: "Department Meeting", subject: "Faculty", type: "meeting" },
    "2023-10-17-14": { id: 3, title: "Exam Review", subject: "Calculus II", type: "exam" },
    "2023-10-18-10": { id: 4, title: "Office Hours", subject: "All Courses", type: "note" },
    "2023-10-18-15": { id: 5, title: "Assignment Due", subject: "Linear Algebra", type: "deadline" },
    "2023-10-19-9": { id: 6, title: "Guest Lecture", subject: "Physics Dept.", type: "class" },
  });
  const [formData, setFormData] = useState({
    id: null,
    title: "",
    subject: "",
    date: "",
    time: "",
    type: "class",
    notes: ""
  });

  const eventTypes = {
    exam: { name: "Exam", color: "#ef476f", border: "#d90429" },
    class: { name: "Class", color: "#06d6a0", border: "#049c78" },
    deadline: { name: "Deadline", color: "#ffd166", border: "#f4a261" },
    meeting: { name: "Meeting", color: "#7209b7", border: "#560bad" },
    note: { name: "Note", color: "#8ac926", border: "#6a994e" }
  };

  // Get dates for the current week
  const getWeekDates = () => {
    const dates = [];
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  };

  // Time slots from 8 AM to 8 PM
  const timeSlots = Array.from({ length: 13 }, (_, i) => i + 8);

  // Handle navigation
  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (view === "week") {
      newDate.setDate(currentDate.getDate() - 7);
    } else {
      newDate.setDate(currentDate.getDate() - 1);
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (view === "week") {
      newDate.setDate(currentDate.getDate() + 7);
    } else {
      newDate.setDate(currentDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Handle cell click to add event
  const handleCellClick = (date, time) => {
    const dateStr = formatDate(date);
    setFormData({
      id: null,
      title: "",
      subject: "",
      date: dateStr,
      time: `${time}:00`,
      type: "class",
      notes: ""
    });
    setShowModal(true);
  };

  // Handle event click to edit
  const handleEventClick = (event, e) => {
    e.stopPropagation();
    setFormData({...event});
    setShowModal(true);
  };

  // Format date to YYYY-MM-DD
  const formatDate = (date) => {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  };

  // Format time to 12-hour format
  const formatTime = (time) => {
    if (time === 12) return "12 PM";
    if (time > 12) return `${time - 12} PM`;
    return `${time} AM`;
  };

  // Check if a date is today
  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };

  // Save event
  const handleSaveEvent = () => {
    const newEvents = {...events};
    const eventId = formData.id || Date.now();
    const eventKey = `${formData.date}-${formData.time.split(':')[0]}`;
    
    newEvents[eventKey] = {...formData, id: eventId};
    setEvents(newEvents);
    setShowModal(false);
  };

  // Delete event
  const handleDeleteEvent = () => {
    if (formData.id) {
      const newEvents = {...events};
      const eventKey = `${formData.date}-${formData.time.split(':')[0]}`;
      delete newEvents[eventKey];
      setEvents(newEvents);
    }
    setShowModal(false);
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({...formData, [name]: value});
  };

  // Get events for a specific date and time
  const getEvent = (date, time) => {
    const dateStr = formatDate(date);
    return events[`${dateStr}-${time}`];
  };

  const weekDates = getWeekDates();

  return (
    <div style={{ 
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      backgroundColor: "#f5f7fa",
      color: "#333",
      minHeight: "calc(100vh -55px)",
      width: "100%",
      overflow:"hidden"
    }}>
      <div className="p-4" style={{ width: "100%", position: "relative" }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3>Schedules</h3>
          <Button 
            variant="outline-secondary" 
            onClick={() => {
              const today = new Date();
              setFormData({
                id: null,
                title: "",
                subject: "",
                date: formatDate(today),
                time: "09:00",
                type: "class",
                notes: ""
              });
              setShowModal(true);
            }}
            >New Event +</Button>
        </div>

        <Card className="p-3 shadow-sm mb-4" style={{ borderRadius: '12px' }}>
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3">
            <h2 className="mb-3 mb-md-0">
              {view === "week" ? "Week of " : ""}{currentDate.toLocaleDateString('default', { month: 'long', day: 'numeric', year: 'numeric' })}
            </h2>
            <div className="d-flex flex-wrap">
              <div className="calendar-nav me-3 mb-2 mb-md-0">
                <Button variant="light" onClick={handlePrev} style={{ borderRadius: "8px" }}>
                  <i className="bi bi-chevron-left"></i>
                </Button>
                <Button variant="light" className="mx-2" onClick={handleToday} style={{ borderRadius: "8px" }}>
                  Today
                </Button>
                <Button variant="light" onClick={handleNext} style={{ borderRadius: "8px" }}>
                  <i className="bi bi-chevron-right"></i>
                </Button>
              </div>
              <ButtonGroup className="mb-2 mb-md-0">
                <Button 
                  variant={view === 'day' ? 'primary' : 'outline-primary'} 
                  onClick={() => setView('day')}
                  style={{ borderRadius: '20px', padding: '8px 20px' }}
                >
                  Day
                </Button>
                <Button 
                  variant={view === 'week' ? 'primary' : 'outline-primary'} 
                  onClick={() => setView('week')}
                  style={{ borderRadius: '20px', padding: '8px 20px' }}
                >
                  Week
                </Button>
              </ButtonGroup>
            </div>
          </div>

          <div className="timeline-container" style={{ 
            backgroundColor: 'white', 
            borderRadius: '12px', 
            overflow: 'scroll', 
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
            height: '67vh',
            overflowY: 'auto'
          }}>
            <div className="d-flex">
              {/* Time column */}
              <div style={{ width: '80px', flexShrink: 0 }}>
                <div style={{ 
                  height: '60px', 
                  borderBottom: '1px solid #dee2e6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#f8f9fa'
                }}></div>
                {timeSlots.map(time => (
                  <div key={time} style={{ 
                    height: '60px', 
                    borderBottom: '1px solid #dee2e6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.9rem',
                    color: '#6c757d'
                  }}>
                    {formatTime(time)}
                  </div>
                ))}
              </div>

              {/* Dates columns */}
              <div className="d-flex flex-grow-1">
                {weekDates.map(date => (
                  <div key={date} className="flex-grow-1" style={{ 
                    minWidth: '120px',
                    borderLeft: '1px solid #dee2e6'
                  }}>
                    {/* Date header */}
                    <div style={{ 
                      height: '60px', 
                      borderBottom: '1px solid #dee2e6',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isToday(date) ? '#e6f7ff' : '#f8f9fa'
                    }}>
                      <div style={{ 
                        fontWeight: '500',
                        color: isToday(date) ? '#4361ee' : '#495057'
                      }}>
                        {date.toLocaleDateString('default', { weekday: 'short' })}
                      </div>
                      <div style={{
                        fontSize: '1.1rem',
                        fontWeight: isToday(date) ? '600' : '400',
                        color: isToday(date) ? '#4361ee' : '#495057'
                      }}>
                        {date.getDate()}
                      </div>
                    </div>

                    {/* Time slots */}
                    {timeSlots.map(time => {
                      const event = getEvent(date, time);
                      return (
                        <div
                          key={time}
                          style={{ 
                            height: '60px', 
                            borderBottom: '1px solid #dee2e6',
                            position: 'relative',
                            cursor: 'pointer'
                          }}
                          onClick={() => handleCellClick(date, time)}
                        >
                          {event && (
                            <div
                              className="event"
                              style={{
                                position: 'absolute',
                                top: '4px',
                                left: '4px',
                                right: '4px',
                                bottom: '4px',
                                borderRadius: '6px',
                                padding: '6px 8px',
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                                color: eventTypes[event.type].color === '#ffd166' ? '#333' : 'white',
                                overflow: 'hidden',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                backgroundColor: eventTypes[event.type].color,
                                borderLeft: `4px solid ${eventTypes[event.type].border}`
                              }}
                              onClick={(e) => handleEventClick(event, e)}
                            >
                              <div style={{ fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {event.title}
                              </div>
                              <div style={{ fontSize: '0.7rem', opacity: '0.9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {event.subject}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
          <Modal.Header closeButton style={{ 
            background: 'linear-gradient(135deg, #4361ee 0%, #4895ef 100%)', 
            color: 'white',
            borderTopLeftRadius: '12px',
            borderTopRightRadius: '12px'
          }}>
            <Modal.Title>{formData.id ? 'Edit Event' : 'Create New Event'}</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ padding: '20px' }}>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Event Title</Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter event title"
                />
              </Form.Group>
              
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Time</Form.Label>
                    <Form.Control
                      type="time"
                      name="time"
                      value={formData.time}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Form.Group className="mb-3">
                <Form.Label>Category</Form.Label>
                <Form.Select name="type" value={formData.type} onChange={handleInputChange}>
                  {Object.entries(eventTypes).map(([key, value]) => (
                    <option key={key} value={key}>
                      <span 
                        className="category-badge" 
                        style={{ 
                          display: 'inline-block', 
                          width: '12px', 
                          height: '12px', 
                          borderRadius: '50%', 
                          backgroundColor: value.color, 
                          marginRight: '8px' 
                        }}
                      ></span>
                      {value.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Subject/Course</Form.Label>
                <Form.Control
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="e.g., Physics 101"
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Add additional details..."
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            {formData.id && (
              <Button variant="outline-danger" onClick={handleDeleteEvent}>
                Delete
              </Button>
            )}
            <Button variant="light" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveEvent}>
              Save Event
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default TeacherScheduleView;