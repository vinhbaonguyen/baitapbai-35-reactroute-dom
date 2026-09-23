import React from "react";
import { DAY_MAP } from '@/constants/home/enrollmentstatusmodal.constants';

export default function HomeClassSchedule({
  scheduleRows,
  navigate
}) {
  return (
    <div className="card card--schedule">
      <div className="card__head">
        <h3>Class Schedule</h3>
        <button className="card__more" onClick={() => navigate('/app/schedule')}>
          Xem tất cả →
        </button>
      </div>

      {scheduleRows.length === 0 ? (
        <p className="schedule-warning">Chưa có lớp Active</p>
      ) : (
        <div className="schedule">
          {scheduleRows.map((cls, i) => (
            <div key={cls.id} className="schedule__item">
              <div className="schedule__time">
                {cls.startTime ? `${cls.startTime}-${cls.endTime}` : 'Chưa có lịch'}
              </div>

              <div className="schedule__timeline">
                <div className="schedule__dot">
                  {i < scheduleRows.length && <div className="schedule__line"></div>}
                </div>
              </div>

              <div className="schedule__info">
                <div className="schedule__info-head">
                  <strong>{cls.courseName}</strong>
                  <span className={`badge badge--${cls.status?.toLowerCase()}`} style={{ fontSize: '.7rem' }}>
                    {cls.status}
                  </span>
                </div>

                <p className="schedule__info-lecturename">👨‍🏫 {cls.lectureName}</p>

                {cls.startTime ? (
                  <div className="schedule__meta">
                    <span>🕐 {cls.startTime} - {cls.endTime}</span>
                    {cls.room && <span>📍 {cls.room}</span>}

                    {cls.days?.length > 0 && (
                      <div className="schedule__days">
                        {cls.days.map(d => (
                          <span key={d} className="schedule__day-tag">
                            {DAY_MAP[d] || d}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="schedule__info-noschedule">⚠️ Chưa có lịch học</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="schedule__footer">
        <div>
          <span className="schedule__footer-label">Total Payment</span>
          <strong className="schedule__footer-amount">$8,440</strong>
        </div>

        <button
          className="schedule__pay-btn"
          onClick={() => alert('Payment feature coming soon!')}
        >
          Pay
        </button>
      </div>
    </div>
  );
}
