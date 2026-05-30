import React, { useCallback, useState } from 'react'
import PageHeader from '@/components/PageComponent/PageHeader'
import Toolbar from '@/components/PageComponent/Toolbar'
import { STUDENTS_FIELDS } from '@/constants/students/student.fields'
import useAuditLog from '@/hooks/useAuditLog'
import useComponentData from '@/hooks/useComponentData'
import * as studentService from '../../services/studentService'
import { STUDENT_SORT_OPTIONS, STUDENT_STATUS_OPTIONS, STUDENT_TABLE_COLUMNS } from '@/constants/students/student.constants'
import DataTable from '@/components/PageComponent/DataTable'
import StudentDetailModal from './StudentDetailModal'
import SharedModal from '@/components/PageComponent/SharedModal'
import HistoryModal from '@/components/PageComponent/HistoryModal'
import Pagination from '@/components/PageComponent/Pagination'
import * as studentCourseService from '@/services/studentCourseService'
import { alertConfirm, alertError, alertSuccess } from '@/utils/alert'
import { compareData } from '@/utils/compareData'
import { useDispatch, useSelector } from 'react-redux'
import { updateMasterEntity } from '@/actions/masterDataAction'
import { selectCourses } from '@/store/selectors/masterDataSelectors'
import useLookupMaps from '@/hooks/useLookupMap'


export default function Student() {
  const auditLog = useAuditLog('students');
  const [historyItem, setHistoryItem] = useState(null);
  const [detailItem, setDetailItem] = useState(null);
  const dispatch = useDispatch();
  const {
    data, setData, visibleData, loading, error,
    search, onSearchChange,
    sortField, sortOrder, onSortField, toggleSortOrder,
    isModalOpen, setIsModalOpen,
    editItem, setEditItem, handleAdd, handleEdit, handleDelete,
    totalItem, pageCount, currentPage, itemsPerPage,
    onGoToPage, onChangeItemsPerPage, handleReorder
  } = useComponentData(studentService, 'studentName', auditLog, STUDENTS_FIELDS)

  const generateStudentCode = (existingStudents = []) => {
    // 1. Lấy năm và tháng hiện tại
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0')
    // 2. Prefix: SV202505
    const prefix = `SV${year}${month}`;
    // 3. Nếu không có dữ liệu → trả về SV202505001
    if (!Array.isArray(existingStudents) || existingStudents?.length === 0) return `${prefix}001`;
    // 4. Lọc các mã cùng tháng
    const studentsThisMonth = existingStudents.filter(stu =>
      stu.studentCode && stu.studentCode.startsWith(prefix));
    // 6. Tìm số lớn nhất
    const maxNum = studentsThisMonth
      .map(stu => parseInt(stu.studentCode.slice(-3), 10))
      .filter(n => !isNaN(n))
      .reduce((max, n) => Math.max(max, n), 0)
    // 7. Tạo số mới
    const newNum = String(maxNum + 1).padStart(3, '0')

    return `${prefix}${newNum}`;
  }

  const handleHistory = useCallback((student) => {
    setHistoryItem(student);
    auditLog.fetchLogs(student.id)
  }, [auditLog])

  const handleSaveStudent = async (formData) => {
    try {
      let student;
      if (!editItem) {
        // 1) Tạo student trước
        student = await studentService.create(formData)
        // 2) Tạo student_course
        await studentCourseService.create(student.id, formData.courseId)

        // 3) Ghi log
        if (auditLog) await auditLog.writeLog("CREATE", student);

        // 4) Update UI
        setData(prev => [...prev, student]);

        alertSuccess({ title: "Tạo mới thành công" });
        // 🔥 CẬP NHẬT REDUX MASTER DATA
        dispatch(updateMasterEntity('students', 'create', student));

      } else {
        // So sánh dữ liệu 
        const { isChanged, changedFields } = compareData({
          formData,
          editItem,
          fields: STUDENTS_FIELDS
        });
        if (!isChanged) {
          await alertConfirm({
            title: 'Không có thay đổi',
            text: 'Bạn chưa thay đổi dữ liệu?',
            confirmText: 'Tiếp tục sửa',
            cancelText: 'Không (Đóng)'
          })
          return;
        }
        // ✅ Có thay đổi → confirm               
        const confirmEdit = await alertConfirm({
          title: 'Xác nhận cập nhật',
          html: `
                <div style="text-align:left">
                    ${changedFields.map(f => `
                        <p><b>${f.field}</b>:
                            <span style="color:red">${f.originalValue ?? '-'}</span> ⇒
                            <span style="color:green">${f.formValue ?? ''}</span>                            
                        </p>
                        `).join('')}                    
                </div>                    
                `,
          confirmText: 'Xác nhận Lưu',
          cancelText: 'Quay lại chỉnh sửa'
        })
        if (!confirmEdit.isConfirmed) return;
        // 1) Update student
        student = await studentService.update(editItem.id, formData);
        // 2) Update student_course
        const existing = await studentCourseService.getByStudent(editItem.id);
        if (existing.length > 0) {
          await studentCourseService.update(existing[0].id, formData.courseId)
        } else {
          await studentCourseService.create(editItem.id, formData.courseId)
        }

        // 3) Ghi log
        if (auditLog) await auditLog.writeLog("UPDATE", student, editItem);

        // 4) Update UI
        setData(prev => prev.map(s => s.id === student.id ? student : s));

        alertSuccess({ title: "Cập nhật thành công" });
        // 🔥 CẬP NHẬT REDUX MASTER DATA
        dispatch(updateMasterEntity('students', 'update', student));
      }
      setIsModalOpen(false);
      setEditItem(null);

    } catch (err) {
      console.error(err);
      alertError({ title: "Lưu thất bại!" });
    }
  };

  // Lấy giá trị courses từ Store và map courseId thành courseName
  //  để hiển thị trong SharedModal thông qua component FormRenderer
  const courseData = useSelector(selectCourses);
  const courseMap = useLookupMaps(courseData, 'id', 'courseName')
  const lookUpMaps = { courseId: courseMap }
  // console.log(courseData);

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
        title='Danh Sách Sinh Viên'
        desc='Học Viên đang , đã , sắp sửa sẽ theo học tại Trung Tâm'
      />
      <Toolbar
        onAdd={handleAdd}
        search={search}
        onSearch={onSearchChange}
        sortOptions={STUDENT_SORT_OPTIONS}
        sortField={sortField}
        onSortField={onSortField}
        toggleSortOrder={toggleSortOrder}
        sortOrder={sortOrder}
      />
      <DataTable
        keyField='id'
        columns={STUDENT_TABLE_COLUMNS}
        data={visibleData}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onHistory={handleHistory}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onReorder={handleReorder}
        fields={STUDENTS_FIELDS}
        onView={setDetailItem}
      />
      {detailItem && (
        <StudentDetailModal
          student={detailItem}
          onClose={() => setDetailItem(null)}
          courseData={courseData}
        />
      )}
      {isModalOpen && (
        <SharedModal
          title={editItem ? 'Sửa Thông Tin Sinh Viên' : 'Thêm Mới Sinh Viên'}
          fields={STUDENTS_FIELDS}
          editItem={editItem}
          newCode={generateStudentCode(data)}
          // onSave={handleSave}
          onSave={handleSaveStudent}
          onClose={() => {
            setIsModalOpen(false);
            setEditItem(null)
          }}
          statusOpts={STUDENT_STATUS_OPTIONS}
          courseData={courseData}

          displayMaps={lookUpMaps}

        />
      )}
      {historyItem && (
        <HistoryModal
          entityCode={`${historyItem.studentCode}-${historyItem.studentName}`}
          logs={auditLog.logs}
          loading={auditLog.loading}
          onClose={() => setHistoryItem(null)}
          fields={STUDENTS_FIELDS}
        />
      )}
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
