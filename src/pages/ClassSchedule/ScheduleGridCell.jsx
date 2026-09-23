import React, { memo } from 'react'
import {
  SLOTS_PER_HOUR, TIME_SLOTS, DAYS, CLASS_COLORS
} from '@/constants/classRoom/classroom.constants'

const getColor = (classId) => CLASS_COLORS[Number(classId) % CLASS_COLORS.length]

function ScheduleGridCell({
  day, time, tIdx,
  occupiedCells,
  enriched,
  allClasses,
  courses,
  highlightedScheduleIds,
  dragOverCell,
  draggedClassId,
  isCellConflict,
  formDays,
  formStartTime,
  formClassId,
  expandedCell,
  onSetExpandedCell,
  onEdit,
  onDelete,
  onDragOver,
  onDragLeave,
  onDrop,
}) {
  const cellKey = `${day.key}-${time}`

  // ── Câu hỏi 1: bị che bởi rowSpan → bỏ qua ───────────────────────────
  if (occupiedCells.has(cellKey)) return null

  // ── Tính drag state — cần cho cả branch 2 lẫn 3 ──────────────────────
  const isOver = dragOverCell?.day === day.key && dragOverCell?.time === time

  // ── Câu hỏi 2: có schedule bắt đầu tại đây ────────────────────────────
  const scheds = enriched.filter(s =>
    s.days.includes(day.key) && s.startTime === time
  )

  if (scheds.length > 0) {
    const maxDuration = Math.max(...scheds.map(s => s.duration))
    const totalSlots = maxDuration * SLOTS_PER_HOUR
    const span = Math.min(totalSlots, TIME_SLOTS.length - tIdx)
    const isExpanded = expandedCell?.day === day.key && expandedCell?.time === time
    // isConflict khi drag qua cell đã có lịch
    const isConflict = isOver && draggedClassId
      && isCellConflict(draggedClassId, day.key, time)

    // ✅ Helper: đang search mà sched này KHÔNG khớp → làm mờ; sched này khớp → highlight nổi bật
    const isSearching = highlightedScheduleIds !== null
    const isDimmed = (sched) => isSearching && !highlightedScheduleIds.has(sched.id)
    const isMatched = (sched) => isSearching && highlightedScheduleIds.has(sched.id)

    return (
      <td
        key={day.key}
        rowSpan={span}
        className={`sg__cell sg__cell--block ${isConflict ? 'sg__cell--conflict-block' : ''}`}
        // ✅ Cell có lịch CŨNG cần drag events để hiện conflict overlay
        onDragOver={e => onDragOver(e, day.key, time)}
        onDragLeave={onDragLeave}
        onDrop={e => onDrop(e, day.key, time)}
      >
        {/* ── Conflict overlay khi đang kéo qua cell có sẵn lịch ───────── */}
        {isConflict && (
          <div className="sg-conflict-overlay">
            <span>⚠️ Trùng lịch!</span>
            <small>Đã có {scheds.length} lớp tại khung giờ này</small>
          </div>
        )}

        {/* ── Stack mode: nhiều lớp cùng slot ──────────────────────────── */}
        {scheds.length > 1 && !isExpanded
          ? (
            <div
              className="sg-stack"
              onClick={() => onSetExpandedCell({ day: day.key, time })}
              title={`${scheds.length} lớp cùng khung giờ — click để xem`}
            >
              {/* Render từ sau ra trước để lớp đầu nằm trên cùng */}
              {[...scheds].reverse().map((sched, i, arr) => {
                const isTop = i === arr.length - 1
                return (
                  <div
                    key={sched.id}
                    className={`sg-stack__card ${isTop ? 'sg-stack__card--top' : ''}`}
                    style={{
                      background: getColor(sched.classId),
                      // Mỗi card bên dưới dịch xuống + thu nhỏ dần
                      transform: `translateY(${(arr.length - 1 - i) * 5}px) scale(${1 - (arr.length - 1 - i) * 0.03})`,
                      zIndex: i + 1,
                      // opacity: isTop ? 1 : 0.75,
                      opacity: isDimmed(sched) ? 0.2 : (isTop ? 1 : 0.75),
                      outline: isMatched(sched) ? '3px solid #fbbf24' : 'none',
                      outlineOffset: isMatched(sched) ? '-2px' : 0,
                    }}
                  >
                    {isTop && (
                      <>
                        <button className="sg-block__del"
                          onClick={e => { e.stopPropagation(); onDelete(sched.id) }}
                        >✕</button>
                        <span className="sg-block__code">{sched.classCode}</span>
                        <span className="sg-block__time">{sched.startTime}–{sched.endTime}</span>
                        <span className="sg-block__room">📍 {sched.room}</span>
                        {/* Badge hiện số lớp bên dưới */}
                        <span className="sg-stack__badge">+{scheds.length - 1}</span>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          )
          : scheds.length === 1
            ? (
              // ── Single block bình thường ────────────────────────────────
              <div
                // className="sg-block"
                className={`sg-block ${isMatched(scheds[0]) ? 'sg-block--match' : ''}`}
                // style={{ background: getColor(scheds[0].classId) }}
                style={{
                  background: getColor(scheds[0].classId),
                  opacity: isDimmed(scheds[0]) ? 0.25 : 1,
                  outline: isMatched(scheds[0]) ? '3px solid #fbbf24' : 'none',
                  outlineOffset: isMatched(scheds[0]) ? '-2px' : 0,
                }}

                onClick={() => onEdit(scheds[0])}
                title={`${scheds[0].classCode} | ${scheds[0].startTime}–${scheds[0].endTime} | ${scheds[0].room}`}
              >
                <button className="sg-block__del"
                  onClick={e => { e.stopPropagation(); onDelete(scheds[0].id) }}
                >✕</button>
                <span className="sg-block__code">{scheds[0].classCode}</span>
                <span className="sg-block__time">{scheds[0].startTime}–{scheds[0].endTime}</span>
                <span className="sg-block__room">📍 {scheds[0].room}</span>
              </div>
            )
            : (
              // ── Expanded: list tất cả ───────────────────────────────────
              <div className="sg-expanded">
                <button
                  className="sg-expanded__close"
                  onClick={() => onSetExpandedCell(null)}
                >▲ Thu gọn</button>
                {scheds.map(sched => (
                  <div
                    key={sched.id}
                    className="sg-block sg-block--mini"
                    // style={{ background: getColor(sched.classId) }}
                    style={{
                      background: getColor(sched.classId),
                      opacity: isDimmed(sched) ? 0.25 : 1,
                      outline: isMatched(sched) ? '3px solid #fbbf24' : 'none',
                      outlineOffset: isMatched(sched) ? '-2px' : 0,
                    }}

                    onClick={() => onEdit(sched)}
                  >
                    <button className="sg-block__del"
                      onClick={e => { e.stopPropagation(); onDelete(sched.id) }}
                    >✕</button>
                    <span className="sg-block__code">{sched.classCode}</span>
                    <span className="sg-block__time">{sched.startTime}–{sched.endTime}</span>
                    <span className="sg-block__room">📍 {sched.room}</span>
                  </div>
                ))}
              </div>
            )
        }
      </td>
    )
  }

  // ── Câu hỏi 3: cell trống → droppable ─────────────────────────────────
  const isConflict = isOver && draggedClassId
    && isCellConflict(draggedClassId, day.key, time)
  const isInForm = formDays.includes(day.key)
    && formStartTime === time
    && formClassId

  let cellClass = 'sg__cell'
  if (isConflict) cellClass += ' sg__cell--conflict'
  else if (isOver) cellClass += ' sg__cell--over'
  else if (isInForm) cellClass += ' sg__cell--selected'

  return (
    <td
      key={day.key}
      className={cellClass}
      onDragOver={e => onDragOver(e, day.key, time)}
      onDragLeave={onDragLeave}
      onDrop={e => onDrop(e, day.key, time)}
    >
      {/* Ghost preview */}
      {isOver && draggedClassId && !isConflict && (() => {
        const cls = allClasses?.find(c => Number(c.id) === draggedClassId)
        const course = courses?.find(c => Number(c.id) === Number(cls?.courseId))
        return (
          <div className="sg-block sg-block--ghost"
            style={{ background: getColor(draggedClassId) }}>
            <span className="sg-block__code">{cls?.classCode || '...'}</span>
            <span className="sg-block__time">{time}</span>
            <span className="sg-block__room">{course?.courseName || ''}</span>
          </div>
        )
      })()}

      {/* Conflict warning */}
      {isConflict && (
        <div className="sg-block sg-block--conflict">
          <span>⚠️ Trùng lịch!</span>
        </div>
      )}
    </td>
  )
}

export default memo(ScheduleGridCell)