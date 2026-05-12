import { useEffect, useState } from "react";
import './TimeClock.css'

const TimeClock = ({ initialHours = 1, initialMinutes = 30, initialSeconds = 0, onTimeUp }) => {
  const [timeLeft, setTimeLeft] = useState({
    hours: initialHours,
    minutes: initialMinutes,
    seconds: initialSeconds
  });
  
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  // Update current date/time every second
  useEffect(() => {
    const dateTimer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    
    return () => clearInterval(dateTimer);
  }, []);

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        
        if (seconds > 0) {
          seconds--;
        } else {
          if (minutes > 0) {
            minutes--;
            seconds = 59;
          } else {
            if (hours > 0) {
              hours--;
              minutes = 59;
              seconds = 59;
            } else {
              clearInterval(timer);
              if (onTimeUp) onTimeUp();
              return { hours: 0, minutes: 0, seconds: 0 };
            }
          }
        }
        
        // Change color when time is running low
        if (hours === 0 && minutes < 5) {
          document.querySelectorAll('.time-values').forEach(el => {
            el.classList.add('time-low');
          });
        }
        
        return { hours, minutes, seconds };
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [onTimeUp]);

  const formatTime = (value) => value < 10 ? `0${value}` : value;
  
  const isTimeLow = timeLeft.hours === 0 && timeLeft.minutes < 5;

  return (
    <div className="time-clock-container border-bottom p-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="current-datetime">
          <div className="current-date text-muted small">
            {currentDateTime.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
          <div className="current-time text-muted small">
            {currentDateTime.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })}
          </div>
        </div>
        
        <div className="exam-timer-label">
          <div className="fs-6 fw-semibold text-center">Time Remaining</div>
          <div className="text-center text-muted small">Your exam will auto-submit when time expires</div>
        </div>
      </div>
      
      <div className={`time-display d-flex justify-content-center gap-4 ${isTimeLow ? 'time-low' : ''}`}>
        <div className="time-unit text-center">
          <div className="time-values fs-2 fw-bold">{formatTime(timeLeft.hours)}</div>
          <div className="time-label text-muted small text-uppercase">Hours</div>
        </div>
        <div className="time-separator fs-2 fw-bold align-self-center">:</div>
        <div className="time-unit text-center">
          <div className="time-values fs-2 fw-bold">{formatTime(timeLeft.minutes)}</div>
          <div className="time-label text-muted small text-uppercase">Minutes</div>
        </div>
        <div className="time-separator fs-2 fw-bold align-self-center">:</div>
        <div className="time-unit text-center">
          <div className="time-values fs-2 fw-bold">{formatTime(timeLeft.seconds)}</div>
          <div className="time-label text-muted small text-uppercase">Seconds</div>
        </div>
      </div>
      
      {/* Progress bar showing time elapsed */}
      <div className="time-progress mt-3">
        <div className="progress" style={{ height: '6px' }}>
          <div 
            className={`progress-bar ${isTimeLow ? 'bg-danger' : 'bg-primary'}`} 
            role="progressbar" 
            style={{ 
              width: `${calculateProgress(initialHours, initialMinutes, timeLeft)}%` 
            }}
            aria-valuenow={calculateProgress(initialHours, initialMinutes, timeLeft)}
            aria-valuemin="0" 
            aria-valuemax="100"
          ></div>
        </div>
        <div className="d-flex justify-content-between mt-1">
          <small className="text-muted">Started</small>
          <small className="text-muted">{Math.round(calculateProgress(initialHours, initialMinutes, timeLeft))}% Complete</small>
        </div>
      </div>
    </div>
  );
};

// Helper function to calculate time progress
const calculateProgress = (initialHours, initialMinutes, timeLeft) => {
  const totalInitialSeconds = (initialHours * 3600) + (initialMinutes * 60);
  const remainingSeconds = (timeLeft.hours * 3600) + (timeLeft.minutes * 60) + timeLeft.seconds;
  const elapsedSeconds = totalInitialSeconds - remainingSeconds;
  
  return (elapsedSeconds / totalInitialSeconds) * 100;
};

export default TimeClock;