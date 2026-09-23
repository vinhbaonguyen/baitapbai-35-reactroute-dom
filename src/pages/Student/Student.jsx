import React, { useCallback, useState } from 'react'
import PageHeader from '@/components/PageComponent/PageHeader'
import Toolbar from '@/components/PageComponent/Toolbar'
import useAuditLog from '@/hooks/useAuditLog'
import useComponentData from '@/hooks/useComponentData'
import * as studentService from '../../services/studentService'
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
import { selectCourses, selectStudentCourse } from '@/store/selectors/masterDataSelectors'
import useLookupMaps from '@/hooks/useLookupMap'
import {
  STUDENT_SORT_OPTIONS,
  STUDENT_STATUS_OPTIONS,
  STUDENT_TABLE_COLUMNS,
  STUDENTS_FIELDS
} from '@/constants/students/student.master.fieldsConfig';

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
  } = useComponentData(studentService, 'studentName', auditLog, STUDENTS_FIELDS);  

  const handleHistory = useCallback((student) => {
    setHistoryItem(student);
    auditLog.fetchLogs(student.id)
  }, [auditLog])

  const handleSaveStudent = async (formData) => {
    console.log("👉 formData khi submit:", formData)
    try {
      let student;
      if (!editItem) {
        // Khi create: bỏ courseUd và courseName ra khỏi formData trước khi gửi lên BE       
        const { courseName, courseUd, ...studentData } = formData;
        console.log("Student Data khi Create New", formData);        

        // 1) Tạo student (có courseId trong formData)       
        student = await studentService.create(studentData)

        // Logic bên dưới dùng để fetch student_course của student mới vừa tạo để
        // cập nhật Redux studentCourse Mục Đích hiển thị học phí trong StudentDetailModal 
        // và SharedModal (FormRenderer) khi edit student
        // 🔥 Fetch student_course của student mới vừa tạo ở trên
        const studentCourses = await studentCourseService.getByStudent(student.id);

        // 🔥 Cập nhật Redux studentCourse
        studentCourses.forEach(sc => {
          dispatch(updateMasterEntity('studentCourse', 'create', sc))
        });
      
        // 2) CẬP NHẬT REDUX MASTER DATA
        dispatch(updateMasterEntity('students', 'create', student));
        // 3) Update UI
        setData(prev => [...prev, student]);
        alertSuccess({ title: "Tạo mới thành công" });
        setIsModalOpen(false);
        setEditItem(null);

      } else {
        // So sánh dữ liệu editItem chính là editFullItem
        const { isChanged, changedFields } = compareData({ formData, editItem, fields: STUDENTS_FIELDS });
        // ⭐ THÊM LOGIC SO SÁNH HỌC PHÍ
        let feeChanged = false;
        if (formData.paidFeeMap && editItem.paidFeeMap) {
          const oldFee = editItem.paidFeeMap || {};
          const newFee = formData.paidFeeMap || {};

          feeChanged = JSON.stringify(oldFee) !== JSON.stringify(newFee);
          if (feeChanged) {
            changedFields.push({
              field: 'Học phí',
              originalValue: Object.entries(oldFee)
                .map(([cid, paidFeeMap]) => `${courseMap[cid]}: ${paidFeeMap ? 'Đã đóng' : 'Chưa đóng'}`)
                .join('<br>'),
              formValue: Object.entries(newFee)
                .map(([cid, paidFeeMap]) => `${courseMap[cid]}: ${paidFeeMap ? 'Đã đóng' : 'Chưa đóng'}`)
                .join('<br>')
            });
          }
        }
        if (!isChanged && !feeChanged) {
          await alertConfirm({
            title: 'Không có thay đổi',
            text: 'Bạn chưa thay đổi dữ liệu?',
            confirmText: 'Tiếp tục sửa',
            cancelText: 'Không (Đóng)'
          })
          return;
        }
        // ───────────────── Confirm trước khi lưu ─────────────────          
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
        // ───────────────── 1) Đẩy học phí xuống BE đúng API ───────
        // Lấy danh sách student_course hiện tại của học viên này từ Redux
        const existingStudentCourses = studentCourse.filter(
          sc => Number(sc.studentId) === Number(editItem.id)
        );

        // Với mỗi course, nếu trạng thái học phí thay đổi → gọi BE updatePaidFee
        for (const sc of existingStudentCourses) {
          const newPaid = !!formData.paidFeeMap?.[Number(sc.courseId)];
          const oldPaid = !!sc.hasPaidFee;

          if (newPaid !== oldPaid) {
            // 🔥 Gọi đúng API để:
            // - cập nhật hasPaidFee
            // - BE tự gọi recomputerCompletionStatus(studentId)
            await studentCourseService.updatePaidFee(sc.id, newPaid);
          }
        }
        // ───────────────── 2) Cập nhật các field khác của student ─────────────────
        const { courseName, courseUd } = formData;
        const updateData = { ...formData };
        delete updateData.courseName;
        delete updateData.courseUd;

        student = await studentService.update(editItem.id, updateData);

        Object.keys(updateData).forEach(key => {
          if (String(updateData[key]) !== String(editItem[key])) {
            changedFields.push({
              field: key,
              oldValue: editItem[key],
              newValue: updateData[key]
            });
          }
        });
        // 🔄 Đồng bộ lại Redux studentCourse — vì giờ FE không tự gọi API riêng cho course nữa,
        // cần fetch lại đúng 1 lần để Redux khớp DB (phục vụ handleMappedEdit, StudentDetailModal)
        const updatedStudentCourses = await studentCourseService.getByStudent(editItem.id);
        const beforeUpdateStudentCourses = studentCourse?.filter(sc => Number(sc.studentId) === Number(editItem.id));

        beforeUpdateStudentCourses.forEach(sc => {
          dispatch(updateMasterEntity('studentCourse', 'delete', { id: sc.id }))
        });

        updatedStudentCourses.forEach(sc => {
          dispatch(updateMasterEntity('studentCourse', 'create', sc))
        });

        // ───────────────── 4) Cập nhật Redux + UI cho students ─────────────────
        dispatch(updateMasterEntity('students', 'update', student));
        // 4) Update UI
        // setData(prev => prev.map(s => s.id === student.id ? student : s));
        setData(prev => {
          // 🔥 Nếu BE đã set status = COMPLETED → loại khỏi DataTable ngay
          if (student.status === 'COMPLETED') {
            return prev.filter(s => s.id !== student.id);
          }
          // Ngược lại: chỉ cập nhật dòng
          return prev.map(s => s.id === student.id ? student : s);
        });

        alertSuccess({ title: "Cập nhật thành công" });
        setIsModalOpen(false);
        setEditItem(null);
      }
    }
    catch (err) {
      console.error(err);
      alertError({ title: "Lưu thất bại!" });
    }
  }
    ;

  // Lấy giá trị courses từ Store và map courseId thành courseName
  //  để hiển thị trong SharedModal thông qua component FormRenderer
  const studentCourse = useSelector(selectStudentCourse)
  const courseData = useSelector(selectCourses);

  // Look up data 
  const courseMap = useLookupMaps(courseData, 'id', 'courseName')
  const lookUpMaps = { courseIds: courseMap }


  // ✅ Bọc handleEdit — đảm bảo luôn edit dữ liệu RAW, không phải mappedData
  // Lý do: mappedData.courseId đã bị biến thành chuỗi tên course để hiển thị,
  // nếu để DataTable gọi thẳng handleEdit gốc sẽ ghi nhầm courseId là string vào editItem
  const mappedData = visibleData;

  const handleMappedEdit = useCallback((mappedItem) => {
    const rawItem = data.find(s => s.id === mappedItem.id)
    if (rawItem) {
      // 🔥 Build courseIds + paidFeeMap từ student_course
      const studentCourses = studentCourse.filter(
        sc => Number(sc.studentId) === Number(rawItem.id));

      const courseIds = studentCourses.map(sc => Number(sc.courseId))

      const paidFeeMap = {}
      studentCourses.forEach(sc => {
        paidFeeMap[Number(sc.courseId)] = !!sc.hasPaidFee
      });
      // 🔥 Tạo object đầy đủ để SharedModal dùng
      const editFullItem = {
        ...rawItem,
        courseIds,
        paidFeeMap
      }
      handleEdit(editFullItem)
    } else {
      handleEdit(mappedItem)
    }

  }, [data, handleEdit, studentCourse])

  const handleArchive = useCallback(async (student) => {
    const confirmArchive = await alertConfirm({
      title: `Xác nhận lưu trữ sinh viên ${student.studentName}?`,
      text: `Lưu trữ sinh viên "${student.studentName}"? Sinh viên sẽ được ẩn khỏi danh sách chính (đã hoàn thành tất cả khóa học).`,
      confirmText: 'Xác nhận lưu trữ',
      cancelText: 'Hủy'
    })
    if (!confirmArchive.isConfirmed) return;
    try {
      const archived = await studentService.archive(student.id);
      // Đã archive -> KHÔNG còn thỏa điều kiện hiển thị mặc định -> xóa khỏi danh sách đang hiển thị
      setData(prev => prev.filter(s => s.id !== archived.id));
      dispatch(updateMasterEntity('students', 'delete', { id: archived.id }));
      alertSuccess({ title: "Lưu trữ thành công" })
    } catch (err) {
      alertError({ title: "Lưu trữ thất bại", text: err.message || err.toString() })
    }
  }, [setData, dispatch]);

  const handleMappedReorder = useCallback((reorderedMapped) => {
    const reorderedRaw = reorderedMapped
      .map(mapped => data.find(student => student.id === mapped.id))
      .filter(Boolean)

    handleReorder(reorderedRaw)
  }, [data, handleReorder])

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
        desc='Học Viên đang , đã , sắp sửa theo học tại Trung Tâm'
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
        // data={visibleData}
        data={mappedData}
        onEdit={handleMappedEdit}
        onDelete={handleDelete}
        onHistory={handleHistory}
        onArchive={handleArchive}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        // onReorder={handleReorder}
        onReorder={handleMappedReorder}
        fields={STUDENTS_FIELDS}
        onView={setDetailItem}
      />
      {detailItem && (
        <StudentDetailModal
          student={detailItem}
          onClose={() => setDetailItem(null)}
          courseData={courseData}
          studentCourses={studentCourse.filter(
            sc => Number(sc.studentId) === Number(detailItem.id))}
        />
      )}
      {isModalOpen && (
        <SharedModal
          title={editItem ? 'Sửa Thông Tin Sinh Viên' : 'Thêm Mới Sinh Viên'}
          fields={STUDENTS_FIELDS}
          editItem={editItem}
          // newCode={generateStudentCode(data)}
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
