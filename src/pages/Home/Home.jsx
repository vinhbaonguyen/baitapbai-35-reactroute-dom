import React, { useState, useEffect, useMemo, } from 'react'
import { useNavigate } from 'react-router-dom'
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion'
import './Home.scss'
import { useSelector } from 'react-redux'
import {
  selectClasses, selectClassSchedules,
  selectCourses, selectLectures,
  selectStudents, selectStudentClass
} from '@/store/selectors/masterDataSelectors'
import { getInitials } from '@/utils/string.utils'
import { COURSE_STATUS_OPTIONS } from '@/constants/courses/course.constants'
import useLookupMaps from '@/hooks/useLookupMap'
import * as scoreService from '../../services/scoreService'
import ClassSchedule from './../ClassSchedule/ClassSchedule';

import { STUDENT_STATUS_OPTIONS } from '@/constants/students/student.constants.jsx'
import { buildScoreStats, feeDonutData, getDonutData, getGreeting, getLegendData } from '@/helpers/homeHelpers'
import WarningCards from './components/WarningCards'
import HomeFilterCard from './components/HomeFilterCard'
import HomeClassSchedule from './components/HomeClassSchedule'
import Enrollmentstatusmodal from './Enrollmentstatusmodal'
import { DonutChart } from './components/DonutChart'
import Lectureassignmentmodal from './Lectureassignmentmodal'
import StudentDetailModal from '../Student/StudentDetailModal'


// ─── MOCK DATA (giả lập API) ───────────────────────────────────────────────
// Bar chart data (17 cột)
const MONTHLY_DATA = [40, 70, 55, 90, 60, 80, 45, 95, 70, 60, 85, 75, 50, 65, 80, 55, 90]
// Kịch bản cho container bọc toàn bộ danh sách student
const studentListVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05 // Hiệu ứng lướt sóng xuất hiện tuần tự giữa các học viên
    }
  }
}

// Kịch bản cho từng dòng học viên cụ thể
const studentItemVariants = {
  hidden: { opacity: 0, x: -15 }, // Ban đầu ẩn và lệch sang trái 15px
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring', stiffness: 200, damping: 20 }
  }
}

export default function Home() {
  // Phần Logic liên quan Redux ----------------------------------------------
  const navigate = useNavigate();
  // Redux liên quan User    
  const currentUser = useSelector(state => state.auth.currentUser)
  // Redux liên quan đến Master Data
  const students = useSelector(selectStudents);
  const courses = useSelector(selectCourses);
  const lectures = useSelector(selectLectures);
  const classes = useSelector(selectClasses);
  const classSchedules = useSelector(selectClassSchedules)
  const studentClass = useSelector(selectStudentClass)
  const studentCourse = useSelector(state => state.masterData.studentCourse)

  // Tải data xem ở console log-----------------------------------------------
  useEffect(() => {
    // console.log("current User", currentUser);
    // console.log("Data Students", students);
    // console.log("Data Courses", courses);
    // console.log("Data Lectures", lectures);
    // console.log("Data Classes", classes);
    // console.log("Data classSchedule", classSchedules);
    // console.log("Data studentClass", studentClass);
    console.log("Data StudentCourse", studentCourse);

    // students, currentUser, courses, lectures, classes, classSchedules, studentClass

  }, [studentCourse])
  // ── State ──────────────────────────────────────────────────────────────
  const [clock, setClock] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [searchStd, setSearchStd] = useState('');
  const [searchCourse, setSearchCourse] = useState('');
  const [activeTabStudent, setActiveTabStudent] = useState('all');
  const [activeTabCourse, setActiveTabCourse] = useState('all');
  const [scores, setScores] = useState([]);
  // state quản lý đóng mở modal xem từng học viên ⇒khóa học⇒Lớp học⇒Lịch học
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [showLectureModal, setShowLectureModal] = useState(false);
  // state quản lý đóng mở Student Detail trong Home 
  const [detailStudent, setDetailStudent] = useState(null);
  // Hàm hỗ trợ chuyển đổi id ⇒ name cho Master Data
  const courseMap = useLookupMaps(courses, 'id', 'courseName');
  const lectureMap = useLookupMaps(lectures, 'id', 'lectureName');
  // courseNameMap sẽ là: { 1: 'HTML Basic', 2: 'CSS Basic', 7: 'Python Basic', ... }
  // 2. Đồng hồ realtime — cleanup khi unmount
  useEffect(() => {
    const id = setInterval(() => setClock(new Date()), 1000)
    return () => clearInterval(id)   // cleanup function
  }, []);

  // 3. Giả lập fetch dữ liệu (setTimeout thay cho API call)
  useEffect(() => {
    const id = setTimeout(() => {
      setLoading(false)
    }, 800)
    return () => clearTimeout(id)
  }, [])
  // ── Stats từ real data ───────────────────────────────────────────
  const stats = useMemo(() => [
    {
      id: 1,
      label: 'Tổng Học Viên',
      value: students.length,
      icon: '🎓',
      change: `${students.filter(s => s.status !== 'Completed').length} học viên đang học`,
      color: 'orange',
      path: '/app/student'
    },
    {
      id: 2,
      label: 'Tổng Khóa Học',
      value: courses.length,
      icon: '📚',
      change: `${courses.filter(course => course.status !== 'Inactive').length} khóa đang mở`,
      color: 'pink',
      path: '/app/course'
    },
    {
      id: 3,
      label: 'Tổng lớp học ',
      value: classes?.length,
      icon: '🏫',
      change: `${classes?.filter(cls => cls.status !== 'Completed').length} lớp đang mở`,
      color: 'purple',
      path: '/app/class'
    },
    {
      id: 4,
      label: 'Giảng Viên',
      value: lectures.length,
      icon: '👨‍🏫',
      change: `${lectures.map(l => l.status !== 'Finished').length} đang công tác`,
      color: 'blue',
      path: '/app/lecture'
    }

  ], [students, courses, classes, lectures])

  // ── Derived state (tính toán từ state) ─────────────────────────── 
  // filter theo search + tab
  // 1. Students
  const recentStudents = useMemo(() => {
    return [...students].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [students]);

  const visibleStudents = useMemo(() => {
    return recentStudents
      .filter(s => s.studentName.toLowerCase().includes(searchStd.toLowerCase()))
      .filter(s => activeTabStudent === 'all' || s.status.toLowerCase() === activeTabStudent)
  }, [recentStudents, searchStd, activeTabStudent]);
  //2. Course
  const courseWithNextClass = useMemo(() => {
    return courses.map(course => {
      const related = classes.filter(cls => Number(cls.courseId) === Number(course.id));

      const active = related.filter(r => r.status === 'Active');
      const planned = related.filter(r => r.status === 'Planned');
      let next = null;
      if (active.length > 0) {
        next = active.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
      } else if (planned.length > 0) {
        next = planned.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
      }
      // 🔥 Lấy lectureName từ bảng lectures
      // const lecture = next ? lectures.find(l => Number(l.id) === Number(next.lectureId)) : null;
      const lectureName = lectureMap[Number(next?.lectureId)] || '--'
      return {
        ...course,
        classCode: next ? next.classCode : null,
        nextClass: next ? `${next.classCode} (${next.status})` : '--Chưa có lớp--',
        // 🔥 Thêm dữ liệu cho tooltip
        // nextClassLectureName: lecture?.lectureName || null,
        nextClassLectureName: lectureName,
        nextClassBranch: next?.brand || null,
      }
    })
  }, [courses, classes, lectureMap])

  const recentCourses = useMemo(() => {
    return [...courseWithNextClass]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [courseWithNextClass])

  const visibleCoures = useMemo(() => {
    return recentCourses
      .filter(c => c.courseName.toLowerCase().includes(searchCourse.toLowerCase()))
      .filter(c => activeTabCourse === 'all' || c.status.toLowerCase() === activeTabCourse)
  }, [searchCourse, recentCourses, activeTabCourse])

  // useEffect(() => {
  //   console.log('Visible Course:', visibleCoures);
  // }, [visibleCoures])

  const STUDENT_STATUS = STUDENT_STATUS_OPTIONS.map(s => s.value.toLowerCase());
  const COURSE_STATUS = COURSE_STATUS_OPTIONS.map(c => c.value.toLowerCase());

  // 3) Class và Classschedule (join với classSchedules) ───────────────────────────
  const scheduleRows = useMemo(() => {
    return classes
      ?.filter(c => c.status === 'Active')
      .map(cls => {
        const sch = classSchedules?.find(s => Number(s.classId) === Number(cls.id))
        const course = courses.find(c => Number(c.id) === Number(cls.courseId))
        const lecture = lectures.find(l => Number(l.id) === Number(cls.lectureId))
        return {
          ...cls,
          courseName: course?.courseName || '-',
          lectureName: lecture?.lectureName || '-',
          days: sch?.days || [],
          startTime: sch?.startTime || null,
          endTime: sch?.endTime || null,
          room: sch?.room || null
        }
      })
  }, [classes, classSchedules, courses, lectures])

  // ── Tính tình trạng đóng học phí theo từng Class ──────────────────
  const classFeeStats = useMemo(() => {
    return classes.map(cls => {
      const courseId = Number(cls.courseId);
      // Lấy studentId đã xếp vào lớp này từ student_class
      const studentIdsInClass = studentClass
        ?.filter(sc => Number(sc.classId) === Number(cls.id))
        .map(sc => Number(sc.studentId))

      const feeRecords = studentCourse?.filter(
        sc => studentIdsInClass.includes(Number(sc.studentId)) &&
          Number(sc.courseId) === courseId
      )

      const paid = feeRecords.filter(fr => fr.hasPaidFee).length;
      const unpaid = feeRecords.length - paid;

      // const course = courses.find(c => Number(c.id) === Number(cls.courseId))
      const courseName = courseMap[Number(cls.courseId)] || '--'

      return {
        classId: cls.id,
        classCode: cls.classCode,
        // courseName: course?.courseName || '--',
        courseName: courseName,
        total: feeRecords.length,
        paid,
        unpaid
      }
    }).filter(c => c.total > 0)

  }, [classes, studentClass, courseMap, studentCourse]);

  // ── Tổng quan toàn hệ thống (donut) ─────────────────────────────
  const feeOverview = useMemo(() => {
    const paid = studentCourse?.filter(s => s.hasPaidFee === true).length
    const unpaid = studentCourse?.length - paid
    const total = studentCourse?.length || 1;
    return {
      paid,
      unpaid,
      percentPaid: Math.round((paid / total) * 100),
      percentUnpaid: Math.round((unpaid / total) * 100)
    }
  }, [studentCourse])

  //Hàm điều hướng khi click vào 1 dòng Class:
  const goToEditClass = (classId) => {
    const cls = classes.find(c => Number(c.id) === Number(classId))
    if (!cls) return;
    navigate('/app/class', { state: { openEditClassCode: cls.classCode } })
  }

  //Hàm điều hướng khi click vào 1 dòng trên Course Data Summary 
  const handleCourseRowClick = (course) => {
    const hasClass = course.classCode !== null;
    if (hasClass) {
      navigate('/app/class', { state: { openEditClassCode: course.classCode } })

    } else {
      navigate('/app/class', { state: { openCreateWithCourseId: Number(course.id) } })
    }
  }  

  const studentCourseClassStatus = useMemo(() => {
    return students
      .map(s => {
        // 🔥 Lấy courseIds từ bảng student_course
        const registeredCourseIds = studentCourse
          ?.filter(sc => Number(sc.studentId) === Number(s.id))
          ?.map(sc => Number(sc.courseId));

        if (registeredCourseIds?.length === 0) return null;

        // classId student đang tham gia
        const classRecords = studentClass?.filter(
          sc => Number(sc.studentId) === Number(s.id)) ?? []

        // courseId của các lớp đã tham gia 
        const courseIdsInClass = classRecords
          ?.map(sc => {
            const cls = classes.find(c => Number(c.id) === Number(sc.classId))
            return cls ? Number(cls.courseId) : null
          })
          .filter(Boolean)

        // Chi tiết từng course: đã xếp lớp chưa
        const courseDetails = registeredCourseIds?.map(cid => {
          const assignedClass = classes.find(
            c => Number(c.courseId) === cid &&
              classRecords.some(sc => Number(sc.classId) === Number(c.id))
          )
          return {
            courseId: cid,
            courseName: courseMap[cid] ?? `ID:${cid}`,
            assigned: courseIdsInClass.includes(cid),
            classCode: assignedClass?.classCode ?? null
          }
        })
        return {
          studentId: s.id,
          studentName: s.studentName,
          courseDetails,
          hasUnassigned: courseDetails?.some(c => !c.assigned),
          unassignedCount: courseDetails?.filter(c => !c.assigned).length
        }
      })
      .filter(Boolean)
  }, [students, studentCourse, studentClass, classes, courseMap]);

  // ── Tính nhu cầu mở lớp: nhóm các course chưa có lớp theo courseId ──
  const courseDemands = useMemo(() => {
    console.log('studentCourseClassStatus', studentCourseClassStatus);

    const map = {}

    studentCourseClassStatus.forEach(s => {
      // courseDetails đã tính sẵn: assigned = true/false
      s.courseDetails
        ?.filter(cd => !cd.assigned)   // chỉ lấy course CHƯA có lớp
        ?.forEach(cd => {
          if (!map[cd.courseId]) {
            map[cd.courseId] = {
              courseId: cd.courseId,
              courseName: cd.courseName,
              studentCount: 0,
              studentNames: [],
            }
          }
          map[cd.courseId].studentCount++
          map[cd.courseId].studentNames.push(s.studentName)
        })
    })

    return Object.values(map)
      .sort((a, b) => b.studentCount - a.studentCount) // nhiều HV nhất lên đầu
  }, [studentCourseClassStatus])

  // useEffect(() => {
  //   console.log("Danh Sách Sinh Viên chưa sắp lớp", studentCourseClassStatus)
  //   console.log("Danh sách Course chưa có lớp", courseDemands);
  //   ;
  // }, [])
  // Chỉ lấy student có ít nhất 1 course chưa xếp lớp
  const studentsWithUnassigned = useMemo(() => {
    return studentCourseClassStatus.filter(s => s.hasUnassigned)
  }, [studentCourseClassStatus])

  // -- Function lọc ra các lớp chưa có lịch
  const classesNoSchedule = useMemo(() => {
    if (!classes.length) return [];
    return classes
      .filter(c => c.status !== 'Completed' && !classSchedules.find(cs => Number(cs.classId) === Number(c.id)))
      .map(c => ({
        ...c,
        courseName: courseMap[Number(c.courseId)] || '--'
      }))
  }, [classes, classSchedules, courseMap])
  // Log data để tìm bug -----------------------------------------------------
  // useEffect(() => {
  //   console.log('1. studentCourseClassStatus:', studentCourseClassStatus);
  //   console.log('2. studentsWithUnassigned:', studentsWithUnassigned);
  //   console.log('3. studentClass từ Redux:', studentClass);
  //   console.log('4. classesNoSchedule:', classesNoSchedule);

  // }, [studentCourseClassStatus, studentsWithUnassigned, studentClass, classesNoSchedule]);
  //---------------------------------------------------------------------------
  // Hàm xuất ra danh sách Giáo viên chưa được phân công giảng dạy
  const lecturesWithoutClass = useMemo(() => {
    return lectures
      .filter(lec =>
        !classes.some(cls => lec.id === cls.lectureId && cls.status !== 'Cancel'))
      .map(lec => ({
        lectureId: lec.id,
        lectureName: lec.lectureName,
        specialty: lec.specialty || '--',
        status: lec.status,

      }))

  }, [lectures, classes])

  //Lấy giá trị từ entity scores
  useEffect(() => {
    scoreService.getAll().then(data => setScores(data));
  }, []);

  // Hàm liên quan đến biểu đồ Score Distrubution
  const stats_score = buildScoreStats(scores);
  const donutData = getDonutData(stats_score);
  const legendData = getLegendData(stats_score)

  // ── Render ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="home__loading">
        <div className="home__spinner" />
        <p>Loading dashboard…</p>
      </div>
    )
  }

  return (
    <div className="home">
      {/* ── Greeting bar ── */}
      <div className="home__topbar">
        <div>
          <h1 className="home__greeting">{getGreeting()} {currentUser.userName} 🎓</h1>
          <p className="home__sub">Here's today's overview for your students &amp; courses</p>
        </div>
        <div className="home__clock">
          <span>{clock.toLocaleDateString('vi-VN')}</span>
          <strong>{clock.toLocaleTimeString('vi-VN')}</strong>
        </div>
      </div>

      {/* ── Stats cards 4-column grid ── */}
      <div className="home__stats">
        {stats.map(stat => (
          <div key={stat.id} className={`stat stat--${stat.color}`}>
            <div className="stat__icon">{stat.icon}</div>
            <div className="stat__body" onClick={() => navigate(`${stat.path}`)}>
              <p className="stat__label">{stat.label}</p>
              <h2 className="stat__value">{stat.value}</h2>
              <span className="stat__change">↑ {stat.change} vs last week</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Warning: Học viên có khóa học chưa xếp lớp ── */}
      {/* Luôn render container để giữ khung grid */}
      <WarningCards
        studentsWithUnassigned={studentsWithUnassigned}
        classesNoSchedule={classesNoSchedule}
        lecturesWithoutClass={lecturesWithoutClass}
        onGoEnroll={() => setShowEnrollModal(true)}
        onGoSchedule={() => navigate('/app/schedule')}
        // onGoLecture={() => navigate('/app/lecture')}
        onGoLecture={() => setShowLectureModal(true)}
      />

      {/* ── Main 3-column grid ── */}
      <div className="home__grid">
        {/* ── COL 1: Recent Students + Score Distribution + Tuition Fee Overview── */}
        <div className="home__col">
          {/* Recent Students */}
          <HomeFilterCard
            title="Recent Student"
            viewAllLink='/app/students'
            searchValue={searchStd}
            onSearchChange={setSearchStd}
            tabs={['all', ...STUDENT_STATUS]}
            activeTab={activeTabStudent}
            onTabChange={setActiveTabStudent}
          >
            <motion.ul
              className='student-list'
              variants={studentListVariants}
              initial='hidden'
              animate='visible'
            >
              {visibleStudents.length > 0
                ? (
                  visibleStudents.map(s => (
                    <motion.li
                      key={s.id}
                      className="student-list__item"
                      onClick={() => setDetailStudent(s)}
                      variants={studentItemVariants}
                      whileHover={{
                        scale: 1.015,
                        x: 5,
                        backgroundColor: "rgba(249, 246, 242, 0.6)",
                        paddingLeft: "8px",
                        paddingRight: "8px",
                        borderRadius: "8px"
                      }}
                      whileTap={{ scale: 0.99 }}
                      title={`Click để xem chi tiết học viên: ${s.studentName}`}

                    >
                      <div className="student-list__avatar">{getInitials(s.studentName)}</div>
                      <div className="student-list__info">
                        <strong>{s.studentName}</strong>
                        <small>{s.email}</small>
                      </div>
                      <span className={`badge badge--${s.status?.toLowerCase()}`}>
                        {s.status}
                      </span>
                    </motion.li>
                  ))
                )
                : (
                  <li className="student-list__empty">No students found 😕</li>
                )
              }
            </motion.ul>
          </HomeFilterCard>

          {/* Score Distribution */}
          <div className="card">
            <h3>Score Distribution</h3>
            <div className="score">
              {scores.length > 0
                ? <DonutChart
                  key={scores.length}
                  data={donutData}
                />
                : <div className='card-warning'>Không có Data </div>
              }
              {scores.length > 0
                ? <div className="score__legend">
                  {legendData.map((d, i) => (
                    <div key={i} className="score__item">
                      <span className="score__dot" style={{ background: d.color }} />
                      <span>{d.label} {Math.round(d.count / scores.length * 100)}%</span>
                    </div>
                  ))}
                </div>
                : '-'
              }
            </div>
          </div>

          {/* Tuition Fee Overview */}
          <div className="card">
            <div className="card__head">
              <h3>Tuition Fee Overview</h3>
            </div>
            <div className="score">
              {feeOverview ? (
                <DonutChart
                  key={`fee-${studentCourse.length}`}
                  data={feeDonutData(feeOverview)}
                />
              ) : (
                <div>Loading ...</div>
              )}

              <div className="score__legend">
                <div className="score__item">
                  <span className="score__dot" style={{ background: '#22c55e' }} />
                  <span>Đã Đóng {feeOverview.percentPaid}% ({feeOverview.paid} SV) </span>
                </div>
                <div className="score__item">
                  <span className="score__dot" style={{ background: '#ca8a04' }} />
                  <span>Chưa Đóng {feeOverview.percentUnpaid}% ({feeOverview.unpaid} SV) </span>
                </div>
              </div>
            </div>

            {/* Danh sách theo Class */}
            <div className="fee-by-class">
              {classFeeStats.length === 0
                ? <p className="schedule-warning">Chưa có lớp nào có học viên</p>
                : classFeeStats.map(c => (
                  <div
                    key={c.classId}
                    className='fee-by-class__row'
                    onClick={() => goToEditClass(c.classId)}
                    title='Click để Nhắc học viên đóng học phí'

                  >
                    <div className='fee-by-class__info'>
                      <strong>{c.classCode}</strong>
                      <small>{c.courseName}</small>
                    </div>
                    <div className='fee-by-class__bar'>
                      <div
                        className='fee-by-class__bar-paid'
                        style={{ width: `${(c.paid / c.total) * 100}%` }}
                      />
                    </div>
                    <div className='fee-by-class__count'>
                      <span style={{ color: '#22c55e' }}>{c.paid}</span>
                      /
                      <span style={{ color: '#ca8a04' }}>{c.unpaid}</span>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>

        {/* ── COL 2: Course Data Summary + Monthly Enrollment ── */}
        <div className="home__col">
          {/* Course Data Summary */}
          <HomeFilterCard
            title='Course Data Summary'
            viewAllLink='/app/course'
            searchValue={searchCourse}
            onSearchChange={setSearchCourse}
            tabs={['all', ...COURSE_STATUS]}
            activeTab={activeTabCourse}
            onTabChange={setActiveTabCourse}
            navigate={navigate}
          >
            <div
              key={`${activeTabCourse}-${searchCourse}-${visibleCoures.length}`}
              className="table-wrap"
            >
              <table className="data-table" >
                <thead>
                  <tr>
                    <th className="course-table__th">Name</th>
                    <th className="course-table__th">Category</th>
                    <th className="course-table__th">Status</th>
                    <th className="course-table__th">Next Class</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleCoures.map(c => (
                    <tr
                      key={c.id}
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleCourseRowClick(c)}
                      title={`Click vào để Edit nội dung của lớp học ${c.classCode || c.courseName || 'Chưa có lớp'}`}
                    >
                      <td><strong>{c.courseName}</strong></td>
                      <td>{c.category}</td>
                      <td>
                        <span className={`badge badge--${c.status?.toLowerCase()}`}>
                          {c.status}
                        </span>
                      </td>
                      <td>
                        <div className="next-class">
                          {(() => {
                            const raw = c.nextClass || '--Chưa có lớp--'
                            const match = raw.match(/^(.*?)\s*\((.*?)\)$/)
                            const code = match ? match[1] : raw
                            const status = match ? match[2] : null

                            return (
                              <>
                                <span className="next-class__code">{code}</span>

                                {status && (
                                  <span className={`badge badge--${status.toLowerCase()}`}>
                                    {status}
                                  </span>
                                )}

                                {status && (
                                  <div className="next-class__tooltip">
                                    <p>Course: {c.courseName}</p>
                                    <p>Lecture: {c.nextClassLectureName}</p>
                                    <p>Branch: {c.nextClassBranch}</p>
                                  </div>
                                )}
                              </>
                            )
                          })()}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </HomeFilterCard>

          {/* Monthly Enrollment (Bar chart thuần CSS) */}
          <div className="card">
            <h3>Monthly Enrollment</h3>
            <div className="bar-chart">
              <div className="bar-chart__y">
                {[300, 250, 200, 150, 100, 50, 0].map(v => (
                  <span key={v}>${v}</span>
                ))}
              </div>
              <div className="bar-chart__bars">
                {MONTHLY_DATA.map((v, i) => (
                  <div key={i} className="bar-chart__col">
                    <div
                      className="bar-chart__bar"
                      style={{ height: `${v}%` }}
                      title={`Month ${i + 1}: ${v}`}
                    />
                    <span className="bar-chart__lbl">{i + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* ── COL 3: Class Schedule ── */}
        <div className="home__col">
          <HomeClassSchedule
            scheduleRows={scheduleRows}
            navigate={navigate}
          >

          </HomeClassSchedule>
        </div>
      </div>

      {/* Modal EnrollstatusManagement */}
      <Enrollmentstatusmodal
        isOpen={showEnrollModal}
        students={students}
        courses={courses}
        classes={classes}
        classSchedules={classSchedules}
        studentCourse={studentCourse}
        studentClass={studentClass}
        courseMap={courseMap}
        onClose={() => setShowEnrollModal(false)}
        onGoToClass={(courseId) => {
          console.log("courseId ở Home", courseId);

          setShowEnrollModal(false);
          navigate('/app/class', {
            state: { openCreateWithCourseId: courseId || null }
          })
        }}
        onGoToSchedule={(classId) => {
          setShowEnrollModal(false);
          navigate('/app/schedule', {
            state: { openCreateScheduleForClassId: classId || null }
          })
        }}
      />
      <Lectureassignmentmodal
        isOpen={showLectureModal}
        lectures={lectures}
        classes={classes}
        classSchedules={classSchedules}
        courseMap={courseMap}
        onClose={() => setShowLectureModal(false)}
        courseDemands={courseDemands}
        onGoToClass={(lectureId, courseId) => {
          // console.log('➡️ goToClass courseId, lectureId:', courseId, lectureId);
          setShowLectureModal(false);
          navigate('/app/class', {
            state: {
              openCreateWithLectureId: lectureId ?? null,
              openCreateWithCourseId: courseId ?? null
            }
          })
        }}

        onGoToSchedule={(classId) => {
          console.log('➡️ Goto Schedule , classId : ', classId);
          setShowLectureModal(false);
          navigate('/app/schedule', {
            state: { openCreateScheduleForClassId: classId }
          })
        }}
      />

      {/* Mở Modal Detail Student  */}
      {detailStudent && (
        <StudentDetailModal
          isOpen={!!detailStudent}
          student={detailStudent}
          onClose={() => setDetailStudent(null)}

        />
      )}
    </div >
  )
}