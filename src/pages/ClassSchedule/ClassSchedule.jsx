import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectClasses, selectClassSchedules, selectCourses, selectLectures } from '@/store/selectors/masterDataSelectors'
import * as classScheduleService from '@/services/classScheduleService'
import { updateMasterEntity } from '@/actions/masterDataAction'
import { ROOMS, TIME_SLOTS, DAYS, DURATION_OPTIONS, CLASS_COLORS, SCHEDULE_FIELDS, SLOTS_PER_HOUR } from '@/constants/classRoom/classroom.constants'
import { alertConfirm, alertError, alertSuccess } from '@/utils/alert'
import { compareData } from '@/utils/compareData'
import PageHeader from '@/components/PageComponent/PageHeader'
import ScheduleGridCell from './ScheduleGridCell'   // ✅ import component mới
import './ClassSchedule.scss'
import { useLocation, useNavigate } from 'react-router-dom'

const getColor = (classId) => CLASS_COLORS[Number(classId) % CLASS_COLORS.length]

const addHours = (time, h) => {
    if (!time) return ''
    const [hh, mm] = time.split(':').map(Number)
    const total = hh * 60 + mm + h * 60
    return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

const toMinutes = (time) => {
    if (!time) return 0
    const [hh, mm] = time.split(':').map(Number)
    return hh * 60 + mm
}

const EMPTY_FORM = {
    classId: null,
    days: [],
    startTime: null,
    duration: 1,
    room: null,
    startDate: '',   // Ngày khai giảng
    endDate: '',   // Ngày bế giảng
}

export default function ClassSchedule() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const location = useLocation()
    const allClasses = useSelector(selectClasses)
    const courses = useSelector(selectCourses)
    const lectures = useSelector(selectLectures)
    const schedules = useSelector(selectClassSchedules)

    const [form, setForm] = useState(EMPTY_FORM)
    const [formErrors, setFormErrors] = useState({})
    const [editItem, setEditItem] = useState(null)
    const [dragOverCell, setDragOverCell] = useState(null)
    const [draggedClassId, setDraggedClassId] = useState(null)
    const [searchClass, setSearchClass] = useState('')
    const [expandedCell, setExpandedCell] = useState(null)
    const [searchSchedule, setSearchSchedule] = useState('')

    // ── Enrich ────────────────────────────────────────────────────────────
    const enriched = useMemo(() =>
        schedules?.map(s => {
            const cls = allClasses?.find(c => Number(c.id) === Number(s.classId))
            const course = courses?.find(c => Number(c.id) === Number(cls?.courseId))
            const lecture = lectures?.find(l => Number(l.id) === Number(cls?.lectureId))
            return {
                ...s,
                classCode: cls?.classCode || '?',
                courseName: course?.courseName || '?',
                lectureName: lecture?.lectureName || '?',
            }
        }) ?? []
        , [schedules, allClasses, courses, lectures])

    // ── Filter class list ──────────────────────────────────────────────────
    // ✅ Set chứa các classId ĐÃ có ít nhất 1 lịch học (dùng .has() cho nhanh O(1))
    const scheduledClassIds = useMemo(() => {
        return new Set(enriched.map(s => Number(s.classId)))
    }, [enriched]);
    // Lọc Class với từ tìm kiếm và điều kiện (đã sắp lớp và lớp đang edit)
    const filteredClasses = useMemo(() => {
        const s = searchClass.toLowerCase()
        console.log("Các data của AllClass", allClasses);

        return allClasses?.filter(cls => {
            // ✅ Lớp đã có lịch (nằm trong scheduledClassIds) → loại khỏi sidebar
            //  Ngoại lệ: nếu đang Edit đúng lớp đó thì vẫn cho hiện lại (tránh mất lớp khỏi list khi sửa)
            const isScheduled = scheduledClassIds.has(Number(cls.id));
            const isCurrentEditting = editItem && Number(editItem.classId) === Number(cls.id)
            if (isScheduled && !isCurrentEditting) return false;
            // 🔥 Chỉ hiện lớp PLANNED (sẵn sàng xếp lịch) — trừ khi đang Edit đúng lớp đó
            // (lớp đang sửa có thể đã tự chuyển ACTIVE sau khi có lịch, vẫn cần hiện để sửa tiếp)
            if (cls.status !== "Planned" && !isCurrentEditting) return false;
            // 🔥 COMPLETED không hiện dù đang edit hay không — giống nguyên tắc ẩn Student COMPLETED
            if (cls.status === "Completed") return false;

            const course = courses?.find(c => Number(c.id) === Number(cls.courseId))
            return (
                cls.classCode?.toLowerCase().includes(s) ||
                course?.courseName?.toLowerCase().includes(s)
            )
        })
    }, [allClasses, courses, searchClass, scheduledClassIds, editItem]);

    // ── Nhận classId từ navigate (vd: từ Home ⇒ LectureassignmentModal) ───
    // → set form y hệt như khi kéo thả lớp vào sidebar, nhưng chưa chọn ô lưới
    useEffect(() => {
        const { openCreateScheduleForClassId } = location.state ?? {}
        if (!openCreateScheduleForClassId || !allClasses.length) return;

        const targetClass = allClasses.find(
            cls => Number(cls.id) === Number(openCreateScheduleForClassId))

        if (!targetClass) {
            alertError({ title: `Không tìm thấy lớp cần xếp lịch` })
            navigate(location.pathname, { replace: true, state: {} })
            return
        }
        // ✅ Nếu lớp đã có lịch rồi → không cho tạo lại (giống logic ẩn khỏi sidebar)
        const alreadyScheduled = schedules.some(
            s => Number(s.classId) === Number(targetClass.id)
        )

        if (alreadyScheduled) {
            alertConfirm({
                title: 'Lớp này đã có lịch học',
                text: `Lớp ${targetClass.classCode} đã được xếp lịch trước đó.`,
                confirmText: 'Đã hiểu'
            })
            navigate(location.pathname, { replace: true, state: {} })
            return
        }
        // ── Set form giống hệt handleCellDrop nhưng chưa chọn ngày/giờ/phòng ──
        // Vì navigate không có "ô lưới" cụ thể, ta chỉ chọn TRƯỚC classId,
        // user vẫn cần chọn ngày + giờ + phòng (giống bước 2 sau khi kéo thả)
        // eslint-disable-next-line
        setForm({
            classId: targetClass.id,
            days: [],
            startTime: null,
            duration: 1,
            room: null,
            startDate: '',
            endDate: '',
        })
        setFormErrors({})
        setEditItem(null)

        // Xóa state sau khi đọc — tránh lặp lại khi re-render
        navigate(location.pathname, { replace: true, state: {} })

    }, [location.state, allClasses, schedules, location.pathname, navigate])

    // ── occupiedCells ──────────────────────────────────────────────────────   
    const occupiedCells = useMemo(() => {
        const set = new Set()
        // Sort theo startTime: schedule sớm hơn có ưu tiên hơn
        const sorted = [...enriched].sort((a, b) =>
            TIME_SLOTS.indexOf(a.startTime) - TIME_SLOTS.indexOf(b.startTime)
        )
        sorted.forEach(s => {
            const startIdx = TIME_SLOTS.indexOf(s.startTime)
            if (startIdx < 0) return // startTime không có trong TIME_SLOTS → skip
            const totalSlots = s.duration * SLOTS_PER_HOUR

            s.days.forEach(day => {
                // ✅ Nếu start cell đã bị occupied bởi schedule trước → skip
                // Tránh thêm "phantom tail cells" vào Set
                const startKey = `${day}-${s.startTime}`
                if (set.has(startKey)) return
                for (let i = 1; i < totalSlots; i++) {
                    if (startIdx + i < TIME_SLOTS.length)
                        set.add(`${day}-${TIME_SLOTS[startIdx + i]}`)
                }
            })
        })
        return set
    }, [enriched])

    // ── ✅ Search lớp ĐÃ sắp lịch (highlight trên lưới) ────────────────────
    const highlightedScheduleIds = useMemo(() => {
        const s = searchSchedule.trim().toLowerCase();
        if (!s) return null;
        return new Set(
            enriched
                .filter(sch =>
                    sch.classCode?.toLowerCase().includes(s))
                .map(sch => sch.id)
        )
    }, [enriched, searchSchedule])

    // ── Conflict cùng phòng + cùng ngày + overlap → dùng khi Save ──────────
    const checkRoomConflict = (formData, excludeId = null) => {
        const { days, startTime, duration, room } = formData
        if (!startTime || !room) return []
        const newStart = toMinutes(startTime)
        const newEnd = newStart + duration * 60
        return enriched
            .filter(s => s.id !== excludeId)
            .reduce((acc, s) => {
                const sStart = toMinutes(s.startTime)
                const sEnd = sStart + s.duration * 60
                const timeOverlap = newStart < sEnd && newEnd > sStart
                const dayOverlap = days.some(d => s.days.includes(d))
                const sameRoom = s.room?.trim() === room?.trim()
                if (timeOverlap && dayOverlap && sameRoom) {
                    const d2 = days.filter(d => s.days.includes(d))
                        .map(d => DAYS.find(x => x.key === d)?.label).join(', ')
                    acc.push(`Phòng <b>${room}</b> đã có lớp <b>${s.classCode}</b> vào ${d2} lúc ${s.startTime}–${s.endTime}`)
                }
                return acc
            }, [])
    }

    // ── Conflict: trùng giờ bất kỳ lớp nào → dùng khi Drag ─────────────
    const isCellConflict = (classId, dayKey, time) => {
        if (!classId || !time) return false
        const newStart = toMinutes(time)
        const newEnd = newStart + form.duration * 60
        return enriched.some(s => {
            if (Number(s.classId) === classId) return false
            const sStart = toMinutes(s.startTime)
            const sEnd = sStart + s.duration * 60
            return newStart < sEnd && newEnd > sStart && s.days.includes(dayKey)
        })
    }

    // ── Drag handlers ──────────────────────────────────────────────────────
    const handleDragStart = (e, classId) => {
        e.dataTransfer.setData('classId', String(classId))
        e.dataTransfer.effectAllowed = 'copy'
        setDraggedClassId(classId)
    }
    const handleDragEnd = () => setDraggedClassId(null);

    const handleCellDrop = (e, day, time) => {
        e.preventDefault()
        setDragOverCell(null)
        setDraggedClassId(null)
        const classId = parseInt(e.dataTransfer.getData('classId'))
        if (!classId) return
        setForm(prev => {
            const same = Number(prev.classId) === classId
            return {
                classId,
                days: same ? (prev.days.includes(day) ? prev.days : [...prev.days, day]) : [day],
                startTime: same ? (prev.startTime || time) : time,
                duration: same ? prev.duration : 1,
                room: same ? prev.room : null,
                startDate: same ? prev.startDate : '', // Reset nếu là lớp mới
                endDate: same ? prev.endDate : '',   // Reset nếu là lớp mới
            }
        })
        setFormErrors({})
        setEditItem(null) // Đảm bảo thoát trạng thái Edit để chuyển sang Tạo mới
    }

    // ── Form ───────────────────────────────────────────────────────────────
    const toggleDay = (day) =>
        setForm(prev => ({
            ...prev,
            days: prev.days.includes(day)
                ? prev.days.filter(d => d !== day)
                : [...prev.days, day]
        }))

    const setField = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

    const validate = () => {
        const errs = {}
        if (!form.classId) errs.classId = 'Vui lòng chọn lớp học (kéo từ danh sách)'
        if (!form.days.length) errs.days = 'Vui lòng chọn ít nhất 1 ngày học'
        if (!form.startTime) errs.startTime = 'Vui lòng chọn giờ bắt đầu'
        if (!form.room) errs.room = 'Vui lòng chọn phòng học'
        if (form.endDate && !form.startDate) errs.startDate = 'Vui lòng chọn ngày khai giảng'
        if (form.startDate && !form.endDate) errs.endDate = 'Vui lòng chọn ngày bế giảng'
        if (form.startDate && !form.endDate && form.endDate <= form.startDate)
            errs.endDate = 'Ngày bế giảng phải sau ngày khai giảng'
        setFormErrors(errs)
        if (Object.keys(errs).length) {
            alertError({ title: Object.values(errs)[0] })
            return false
        }
        return true
    }

    // ── Save ───────────────────────────────────────────────────────────────
    const handleSave = async () => {
        if (!validate()) return
        const conflicts = checkRoomConflict(form, editItem?.id)
        if (conflicts.length) {
            alertError({
                title: '⚠️ Xung đột lịch học!',
                html: `<div style="text-align:left">
                        ${conflicts.map(c => `<p style="margin:4px 0">🔴 ${c}</p>`).join('')}
                      </div>`,
            })
            return
        }
        const submitData = {
            classId: Number(form.classId),
            days: form.days,
            startTime: form.startTime,
            endTime: addHours(form.startTime, form.duration),
            duration: form.duration,
            room: form.room,
            startDate: form.startDate || null,
            endDate: form.endDate || null,
        }
        try {
            if (editItem) {
                const { isChanged, changedFields } = compareData({
                    formData: submitData, editItem, fields: SCHEDULE_FIELDS
                })
                if (!isChanged) {
                    await alertConfirm({
                        title: 'Không có thay đổi',
                        confirmText: 'Tiếp tục sửa',
                        cancelText: 'Đóng'
                    })
                    return
                }
                const ok = await alertConfirm({
                    title: 'Xác nhận cập nhật',
                    html: `<div style="text-align:left">
                                ${changedFields.map(f => `
                                    <p><b>${f.field}</b>:
                                    <span style="color:red">
                                        ${Array.isArray(f.originalValue) ? f.originalValue.join(', ') : (f.originalValue ?? '-')}
                                    </span>
                                    ⇒
                                    <span style="color:green">
                                        ${Array.isArray(f.formValue) ? f.formValue.join(', ') : (f.formValue ?? '')}
                                    </span>
                                    </p>`).join('')
                        }
                            </div>`,
                    confirmText: 'Lưu',
                    cancelText: 'Quay lại'
                })
                if (!ok.isConfirmed) return
                const updated = await classScheduleService.update(editItem.id, submitData)
                dispatch(updateMasterEntity('classSchedules', 'update', updated))
                alertSuccess({ title: 'Cập nhật lịch học thành công!' })
            } else {
                const created = await classScheduleService.create(submitData)
                dispatch(updateMasterEntity('classSchedules', 'create', created))
                alertSuccess({ title: 'Tạo lịch học thành công!' })
            }
            resetForm()
        } catch (err) {
            alertError({
                title: 'Lưu thất bại!',
                text: err.message || 'Vui lòng thử lại !'
            })
        }
    }

    const handleDelete = async (id) => {
        const ok = await alertConfirm({ text: 'Xóa lịch học này?', confirmText: 'Xóa', cancelText: 'Hủy' })
        if (!ok.isConfirmed) return
        try {
            await classScheduleService.remove(id)
            dispatch(updateMasterEntity('classSchedules', 'delete', { id }))
            if (editItem?.id === id) resetForm()
            alertSuccess({ title: 'Đã xóa lịch học' })
        } catch (err) {
            alertError({
                title: 'Xóa Lịch Học Thất bại',
                text: err.message || 'Vui lòng thử lại.'
            })
        }
    }

    const handleEdit = (sched) => {
        setEditItem(sched)
        setForm({
            classId: sched.classId,
            days: [...(sched.days || [])],
            startTime: sched.startTime,
            duration: sched.duration,
            room: sched.room?.trim() ?? null,
            startDate: sched.startDate || '',
            endDate: sched.endDate || '',
        })
        setFormErrors({})
    }

    const resetForm = () => { setForm(EMPTY_FORM); setFormErrors({}); setEditItem(null) }

    const selectedCls = allClasses?.find(c => Number(c.id) === Number(form.classId))
    const selectedCourse = courses?.find(c => Number(c.id) === Number(selectedCls?.courseId))
    const endTimePreview = form.startTime ? addHours(form.startTime, form.duration) : null

    // Tính độ dài lớp học (tuần)
    const classDuration = form.startDate && form.endDate
        ? Math.ceil((new Date(form.endDate) - new Date(form.startDate)) / (1000 * 60 * 60 * 24 * 7))
        : null

    // ── Render ─────────────────────────────────────────────────────────────
    return (
        <div className="cs-page">
            <PageHeader
                title="Quản Lý Lịch Học"
                desc="Kéo lớp từ danh sách vào ô lịch để xếp thời khóa biểu"
            />
            <div className="cs-layout">
                {/* LEFT */}
                <aside className="cs-sidebar">
                    <p className="cs-sidebar__title">📋 Danh Sách Lớp</p>
                    <input
                        className="cs-sidebar__search"
                        placeholder="🔍 Tìm lớp..."
                        value={searchClass}
                        onChange={e => setSearchClass(e.target.value)}
                    />
                    <p className="cs-sidebar__hint">← Kéo vào lưới</p>
                    <div className="cs-class-list">
                        {filteredClasses?.map(cls => {
                            const course = courses?.find(c => Number(c.id) === Number(cls.courseId))
                            const isSelected = Number(form.classId) === Number(cls.id)
                            return (
                                <div key={cls.id}
                                    className={`cs-class-card ${isSelected ? 'cs-class-card--selected' : ''}`}
                                    style={{ borderLeftColor: getColor(cls.id) }}
                                    draggable
                                    onDragStart={e => handleDragStart(e, cls.id)}
                                    onDragEnd={handleDragEnd}
                                >
                                    <span className="cs-class-card__code">{cls.classCode}</span>
                                    <span className="cs-class-card__course">{course?.courseName || '-'}</span>
                                    <span className={`badge badge--${cls.status?.toLowerCase()}`}>{cls.status}</span>
                                </div>
                            )
                        })}
                        {filteredClasses?.length === 0 && (
                            <p className='cs-class-list__filter' >
                                Không tìm thấy lớp
                            </p>
                        )}
                    </div>
                </aside>

                {/* CENTER: Grid — dùng ScheduleGridCell */}
                <div className="cs-grid-wrap">
                    {/* ✅ Ô search lớp ĐÃ sắp lịch trên lưới */}
                    <input
                        className='cs-sidebar__search'
                        style={{ marginBottom: 8 }}
                        placeholder='🔍 Tìm lớp đã sắp lịch trên lưới...'
                        value={searchSchedule}
                        onChange={e => setSearchSchedule(e.target.value)}
                    />
                    <table className="sg">
                        <thead>
                            <tr>
                                <th className="sg__time-col">Giờ</th>
                                {DAYS.map(d => <th key={d.key} className="sg__day-col">{d.label}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {TIME_SLOTS.map((time, tIdx) => (
                                <tr key={time}>
                                    <td className="sg__time">{time}</td>
                                    {DAYS.map(day => (
                                        <ScheduleGridCell
                                            key={day.key}
                                            day={day}
                                            time={time}
                                            tIdx={tIdx}
                                            occupiedCells={occupiedCells}
                                            enriched={enriched}
                                            highlightedScheduleIds={highlightedScheduleIds}
                                            allClasses={allClasses}
                                            courses={courses}
                                            dragOverCell={dragOverCell}
                                            draggedClassId={draggedClassId}
                                            isCellConflict={isCellConflict}
                                            formDays={form.days}
                                            formStartTime={form.startTime}
                                            formClassId={form.classId}
                                            expandedCell={expandedCell}
                                            onSetExpandedCell={setExpandedCell}
                                            onEdit={handleEdit}
                                            onDelete={handleDelete}
                                            onDragOver={(e) => { e.preventDefault(); setDragOverCell({ day: day.key, time }) }}
                                            onDragLeave={() => setDragOverCell(null)}
                                            onDrop={(e) => handleCellDrop(e, day.key, time)}
                                        />
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* RIGHT: Form panel */}
                <aside className={`cs-form ${editItem ? 'cs-form--edit' : ''}`}>
                    <p className="cs-form__title">
                        {editItem ? '✏️ Chỉnh Sửa Lịch' : '➕ Tạo Lịch Học'}
                    </p>
                    {/* Lớp học */}
                    <div className={`cs-field ${formErrors.classId ? 'cs-field--error' : ''}`}>
                        <label className="cs-label">Lớp học <span className="cs-req">*</span></label>
                        {selectedCls
                            ? <div className="cs-selected-cls" style={{ borderLeftColor: getColor(form.classId) }}>
                                <div>
                                    <strong>{selectedCls.classCode}</strong>
                                    <span>{selectedCourse?.courseName}</span>
                                </div>
                                <button className="cs-clear-btn" onClick={() => setField('classId', null)}>✕</button>
                            </div>
                            : <p className="cs-hint-text">← Kéo lớp vào lưới để chọn</p>
                        }
                        {formErrors.classId && <small className="cs-err">{formErrors.classId}</small>}
                    </div>
                    {/* Ngày học */}
                    <div className={`cs-field ${formErrors.days ? 'cs-field--error' : ''}`}>
                        <label className="cs-label">Ngày học <span className="cs-req">*</span></label>
                        <div className="cs-day-grid">
                            {DAYS.map(d => (
                                <button key={d.key}
                                    className={`cs-day-btn ${form.days.includes(d.key) ? 'cs-day-btn--on' : ''}`}
                                    onClick={() => toggleDay(d.key)}>{d.label}</button>
                            ))}
                        </div>
                        {formErrors.days && <small className="cs-err">{formErrors.days}</small>}
                    </div>
                    {/* Giờ bắt đầu */}
                    <div className={`cs-field ${formErrors.startTime ? 'cs-field--error' : ''}`}>
                        <label className="cs-label">Giờ bắt đầu <span className="cs-req">*</span></label>
                        <div className="cs-time-grid">
                            {TIME_SLOTS.slice(0, -1).map(t => (
                                <button key={t}
                                    className={`cs-time-btn ${form.startTime === t ? 'cs-time-btn--on' : ''}`}
                                    onClick={() => setField('startTime', t)}>{t}</button>
                            ))}
                        </div>
                        {formErrors.startTime && <small className="cs-err">{formErrors.startTime}</small>}
                    </div>
                    {/* Số tiếng */}
                    <div className="cs-field">
                        <label className="cs-label">Số tiếng học</label>
                        <div className="cs-duration-row">
                            {DURATION_OPTIONS.map(opt => (
                                <button key={opt.value}
                                    className={`cs-duration-btn ${form.duration === opt.value ? 'cs-duration-btn--on' : ''}`}
                                    onClick={() => setField('duration', opt.value)}>{opt.label}</button>
                            ))}
                        </div>
                        {endTimePreview && (
                            <p className="cs-preview-time">🕐 {form.startTime} → {endTimePreview}</p>
                        )}
                    </div>
                    {/* Phòng học */}
                    <div className={`cs-field ${formErrors.room ? 'cs-field--error' : ''}`}>
                        <label className="cs-label">Phòng học <span className="cs-req">*</span></label>
                        <div className="cs-room-list">
                            {ROOMS.map(r => (
                                <button key={r.value}
                                    className={`cs-room-btn ${form.room?.trim() === r.value ? 'cs-room-btn--on' : ''}`}
                                    onClick={() => setField('room', r.value)}>
                                    {r.icon} {r.label}
                                </button>
                            ))}
                        </div>
                        {formErrors.room && <small className="cs-err">{formErrors.room}</small>}
                    </div>
                    {/* ✅ Ngày khai giảng + bế giảng */}
                    <div className="cs-field-group">
                        <div className={`cs-field ${formErrors.startDate ? 'cs-field--error' : ''}`}>
                            <label className="cs-label">
                                📅 Ngày khai giảng <span className="cs-req">*</span>
                            </label>
                            <input
                                type="date"
                                className="cs-date-input"
                                value={form.startDate}
                                onChange={e => setField('startDate', e.target.value)}
                            />
                            {formErrors.startDate && <small className="cs-err">{formErrors.startDate}</small>}
                        </div>

                        <div className={`cs-field ${formErrors.endDate ? 'cs-field--error' : ''}`}>
                            <label className="cs-label">
                                🏁 Ngày bế giảng <span className="cs-req">*</span>
                            </label>
                            <input
                                type="date"
                                className="cs-date-input"
                                value={form.endDate}
                                min={form.startDate || ''}
                                onChange={e => setField('endDate', e.target.value)}
                            />
                            {formErrors.endDate && <small className="cs-err">{formErrors.endDate}</small>}
                        </div>
                    </div>

                    {/* Hiện độ dài khóa học */}
                    {classDuration !== null && (
                        <p className="cs-duration-info">
                            ⏱️ Thời gian: <strong>{classDuration} tuần</strong>
                            {' '}({form.startDate} → {form.endDate})
                        </p>
                    )}

                    {/* Summary */}
                    {form.classId && form.days.length > 0 && form.startTime && form.room && (
                        <div className="cs-summary" style={{ borderLeftColor: getColor(form.classId) }}>
                            <p className="cs-summary__title">📋 Xem trước</p>
                            <p><strong>{selectedCls?.classCode}</strong> — {selectedCourse?.courseName}</p>
                            <p>📅 {form.days.map(d => DAYS.find(x => x.key === d)?.label).join(', ')}</p>
                            <p>🕐 {form.startTime} → {endTimePreview}</p>
                            <p>📍 {form.room}</p>
                        </div>
                    )}

                    <div className="cs-form__footer">
                        <button className="btn btn--outline" onClick={resetForm}>
                            {editItem ? 'Hủy sửa' : 'Reset'}
                        </button>
                        <button className="btn btn--primary" onClick={handleSave}>
                            {editItem ? 'Cập Nhật' : 'Tạo Lịch'}
                        </button>
                    </div>
                </aside>
            </div>
        </div>
    )
}