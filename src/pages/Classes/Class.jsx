import useComponentData from '@/hooks/useComponentData';
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import useAuditLog from '@/hooks/useAuditLog';
import PageHeader from '@/components/PageComponent/PageHeader';
import Toolbar from '@/components/PageComponent/Toolbar';
import DataTable from '@/components/PageComponent/DataTable';
import ClassModal from './ClassModal';
import HistoryModal from '@/components/PageComponent/HistoryModal';
import Pagination from '@/components/PageComponent/Pagination';
import * as lectureService from '../../services/lectureService';
import * as classService from '@/services/classService';
import { alertConfirm, alertError } from '@/utils/alert';
import { useDispatch, useSelector } from 'react-redux';
import { selectClasses, selectCourses, selectLectures, selectStudentClass, selectStudents } from '@/store/selectors/masterDataSelectors';
import { updateMasterEntity } from '@/actions/masterDataAction';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CLASSES_FIELDS,
  CLASSES_SORT_OPTION,
  CLASSES_TABLE_COLUMNS
} from '@/constants/classes/classes.master.fieldsConfig';
import ClassStudentListModal from '@/components/CommonPickers/ClassStudentListModal';

export default function Class() {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const auditLog = useAuditLog('classes');
  const [historyItem, setHistoryItem] = useState(null);
  const [viewingStudentsClass, setViewingStudentsClass] = useState(null);
  const [initialCourseId, setInitialCourseId] = useState(null);
  const [initialLectureId, setInitialLectureId] = useState(null);

  const {
    data, setData, visibleData, loading, error,
    search, onSearchChange,
    sortField, sortOrder, onSortField, toggleSortOrder,
    isModalOpen, setIsModalOpen,
    editItem, setEditItem, handleAdd, handleEdit, handleDelete,
    totalItem, pageCount, currentPage, itemsPerPage,
    onGoToPage, onChangeItemsPerPage, handleReorder
  } = useComponentData(classService, 'classCode', auditLog, CLASSES_FIELDS);

  // tải Data từ store bằng useSelector
  const lectureData = useSelector(selectLectures);
  const courseData = useSelector(selectCourses);
  const allClasses = useSelector(selectClasses);
  const studentClassData = useSelector(selectStudentClass);
  const studentData = useSelector(selectStudents);
  // console.log("Giá trị của Lecture Data",allClasses); 

  const mappedData = useMemo(() => {
    return visibleData.map(cls => {
      // Lấy danh sách studentId thuộc lớp này từ bảng student-class (Redux)
      const studentIds = studentClassData
        .filter(sc => Number(sc.classId) === Number(cls.id))
        .map(sc => Number(sc.studentId));

      const activeStudents = studentIds
        .map(sid => studentData.find(s => Number(s.id) === Number(sid)))
        .filter(s => s && s.status !== 'Completed');
      
      const activeStudentIds = activeStudents.map(s => Number(s.id));

      const studentNames = activeStudents
        .map(s => s.studentName)
        .filter(Boolean)
        .join(', ');

      return {
        ...cls,
        lectureName: lectureData.find(l => l.id === cls.lectureId)?.lectureName || '',
        courseName: courseData.find(c => c.id === cls.courseId)?.courseName || '',
        studentList: activeStudentIds,    // giữ dạng mảng id — phòng khi chỗ khác cần
        studentNames: studentNames,  // 👈 chuỗi đã join, dùng để hiển thị ở table
        classNumber: activeStudentIds.length  // 🔥 luôn tính live từ studentClassData — không tin classNumber thô trong Redux `classes` (dễ bị stale sau sync, xem ghi chú)
      }
    });
  }, [visibleData, lectureData, courseData, studentClassData, studentData]);


  // ✅ Custom save riêng cho ClassModal không dùng handleSave của useComponentData
  // Giống handleSaveStudent trong Student.jsx
  // ClassModal tự làm compareData + confirm bên trong handleSubmit
  // handleClassSave chỉ làm nhiệm vụ: gọi API + update UI + log
  const handleClassSave = useCallback(async (formData) => {
    try {
      let savedClass;
      // ── STEP 1: Lưu class vào API ──────────────────────────────
      if (editItem) {
        savedClass = await classService.update(editItem.id, formData);
        setData(prev => prev.map(item => item.id === savedClass.id ? savedClass : item));
      } else {
        savedClass = await classService.create(formData);
        setData(prev => [...prev, savedClass]);
      }
      // ── STEP 2: Tính danh sách classes mới nhất ────────────────     
      const lastestClasses = editItem
        // UPDATE: thay item cũ bằng savedClass
        ? allClasses?.map(c => c.id === savedClass.id ? savedClass : c)
        // CREATE: thêm savedClass vào cuối
        : [...allClasses, savedClass]
      // ── STEP 3: Dispatch cập nhật Redux classes ─────────────────
      // Để lần sau dùng store là data mới nhất
      dispatch(updateMasterEntity('classes', editItem ? 'update' : 'create', savedClass));

      // ── STEP 4: Sync assignedClasses cho lecture MỚI ───────────
      if (savedClass?.lectureId) {
        // Dùng latestClasses (vừa tính ở STEP 2)        
        const myClasses = lastestClasses
          .filter(c => Number(c.lectureId) === Number(savedClass.lectureId))
          .map(c => c.classCode);

        // Cập nhật assignedClasses vào lecture
        // Gọi API update lecture
        const updatedLecture = await lectureService.update(
          savedClass.lectureId,
          { assignedClasses: myClasses }
        );
        console.log("✅ assignedClasses updated for lectureId:",
          savedClass.lectureId, "→", myClasses);

        dispatch(updateMasterEntity('lectures', 'update', updatedLecture));
        console.log("✅ Redux lectures updated:", updatedLecture);
      }
      // ── STEP 5: Sync assignedClasses cho lecture CŨ ────────────
      // ✅ Nếu editItem đổi sang lectureId khác → cập nhật cả lecture cũ
      if (editItem && editItem.lectureId &&
        Number(editItem.lectureId) !== Number(formData.lectureId)) {
        // Dùng latestClasses — class này đã được gán lectureId MỚI
        // nên filter theo lectureId CŨ sẽ tự loại nó ra
        const oldLectureClasses = lastestClasses
          .filter(c => Number(c.lectureId) === Number(editItem.lectureId))
          .map(c => c.classCode);

        // Gọi API update lecture CŨ
        const updatedOldLecture = await lectureService.update(
          editItem.lectureId,
          { assignedClasses: oldLectureClasses }
        );

        // ✅ Dispatch → sync lecture cũ
        dispatch(updateMasterEntity('lectures', 'update', updatedOldLecture));
        console.log("✅ lecture CŨ updated:", editItem.lectureId, oldLectureClasses);
      }

      return savedClass;
    } catch (err) {
      console.error("❌ handleClassSave lỗi:", err);
      alertError({ title: 'Lưu Thất Bại' });
      return null;
    }
  }, [editItem, setData, dispatch, allClasses])

  const handleHistory = useCallback((classes) => {
    setHistoryItem(classes);
    auditLog.fetchLogs(classes.id)
  }, [auditLog]);

  // ✅ Bọc handleReorder — strip extra fields trước khi truyền vào useReorder
  // Lý do: DataTable nhận mappedData (có lectureName, courseName)
  //        Khi user kéo thả, onReorder trả về mappedData items
  //        handleReorder gốc chỉ nên nhận raw data items
  const handleMappedReorder = useCallback((reorderedMapped) => {
    // Map ngược: lấy raw item từ data gốc theo id
    const reorderedRaw = reorderedMapped
      .map(mapped => data.find(d => d.id === mapped.id))
      .filter(Boolean); // bỏ qua item không tìm thấy (an toàn)
    handleReorder(reorderedRaw);
  }, [data, handleReorder]);

  const handleCellAction = useCallback((col, row) => {
    if (col.type === 'countModal' && col.relationKey === 'studentList') {
      setViewingStudentsClass(row);
    }
  }, [])

  // Logic Nhận giá trị từ navigate của trang Home chuyển qua 
  useEffect(() => {
    const { openEditClassCode, openCreateWithCourseId, openCreateWithLectureId } = location.state ?? {};
    console.log("openEditClassCode", openEditClassCode);
    console.log("openCreateWithCourseId", openCreateWithCourseId);
    console.log("openCreateWithLectureId", openCreateWithLectureId);


    // ── CASE 1: Mở Edit theo classCode ──────────────────────────
    if (openEditClassCode && data.length > 0) {
      const targetClass = data.find(cls => cls.classCode === openEditClassCode)
      if (targetClass) {
        handleEdit(targetClass); // ← mở modal Edit với item đó
      } else {
        alertConfirm({ title: `Không tìm thấy class:${openEditClassCode}` })
      }
      navigate(location.pathname, { replace: true, state: {} })
      return;
    }
    // ── CASE 2 + CASE 3: Mở Create với courseId và hoặc lectureId ──────────────
    if (openCreateWithCourseId || openCreateWithLectureId) {
      console.log("openCreateWithCourseId:", openCreateWithCourseId);

      handleAdd();
      // eslint-disable-next-line
      if (openCreateWithCourseId) setInitialCourseId(Number(openCreateWithCourseId))
      if (openCreateWithLectureId) setInitialLectureId(Number(openCreateWithLectureId));

      // Xóa state sau khi đọc
      navigate(location.pathname, { replace: true, state: {} })
      return;
    }
  }, [data, location.state, handleEdit, handleAdd, location.pathname, navigate])


  if (loading) return <div className='pageWrapper'>Đang tải...</div>

  if (error) {
    console.log("LỖi ", error);
    return (
      <div className={`pageWrapper ${error ? 'pageWrapper--error' : ''}`}>
        Lỗi: {error}
      </div>)
  }
  return (
    <div className='pageWrapper'>
      <PageHeader
        title='Danh Sách Lớp Học'
        desc='Các Lớp Học Sắp , đã đang được tổ chức tại Trung Tâm'
      />
      <Toolbar
        onAdd={handleAdd}
        search={search}
        onSearch={onSearchChange}
        sortOptions={CLASSES_SORT_OPTION}
        sortField={sortField}
        onSortField={onSortField}
        toggleSortOrder={toggleSortOrder}
        sortOrder={sortOrder}
      />
      <DataTable
        keyField='id'
        columns={CLASSES_TABLE_COLUMNS}
        fields={CLASSES_FIELDS}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onHistory={handleHistory}
        // onReorder={handleReorder}
        onReorder={handleMappedReorder}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        // data={visibleData}
        data={mappedData}      // dùng mappedData để hiển thị tên Giáo Viên , và tên khóa học
        onCellAction={handleCellAction}
      />
      {isModalOpen && (
        <ClassModal
          onSave={handleClassSave} // ✅ dùng custom, không dùng handleSave
          onClose={() => {
            setIsModalOpen(false);
            setEditItem(null);
            setInitialCourseId(null);// ✅ reset khi đóng
            setInitialLectureId(null)
          }}
          // ✅ truyền writeLog để ClassModal ghi history
          onWriteLog={auditLog.writeLog} // ✅ truyền thẳng, không wrap gì thêm
          editItem={editItem}
          allClasses={data}
          initialCourseId={initialCourseId}  // ✅ prop mới
          initialLectureId={initialLectureId}

        />
      )}
      {historyItem && (
        <HistoryModal
          entityCode={`${historyItem.classCode}`}
          logs={auditLog.logs}
          loading={loading}
          onClose={() => setHistoryItem(null)}
          fields={CLASSES_FIELDS}
        />
      )}
      {
        (viewingStudentsClass && (
          <ClassStudentListModal
            onClose={() => setViewingStudentsClass(null)}
            classCode={viewingStudentsClass.classCode}
            students={viewingStudentsClass.studentList
              .map(id => studentData.find(s => Number(s.id) === Number(id)))
              .filter(Boolean)}
          />
        ))
      }
      <Pagination
        currentPage={currentPage}
        pageCount={pageCount}
        totalItem={totalItem}
        itemsPerPage={itemsPerPage}
        onGoToPage={onGoToPage}
        onChangeItemsPerPage={onChangeItemsPerPage}
      />
    </div>

  )
}
