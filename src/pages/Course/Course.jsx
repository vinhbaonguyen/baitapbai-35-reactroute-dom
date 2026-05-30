import React, { useCallback, useState } from 'react'
import * as courseService from '../../services/courseService'
import useComponentData from '../../hooks/useComponentData'
import PageHeader from '../../components/PageComponent/PageHeader'
import Toolbar from '../../components/PageComponent/Toolbar'
import DataTable from '../../components/PageComponent/DataTable'
import SharedModal from '../../components/PageComponent/SharedModal'
import Pagination from '../../components/PageComponent/Pagination'
import useAuditLog from '../../hooks/useAuditLog'
import HistoryModal from '../../components/PageComponent/HistoryModal'
import { COURSE_SORT_OPTIONS, COURSE_STATUS_OPTIONS, COURSE_TABLE_COLUMNS } from '../../constants/courses/course.constants'
import { COURSE_FIELDS } from '../../constants/courses/course.fields'
import { useDispatch } from 'react-redux'
import { updateMasterEntity } from '@/actions/masterDataAction'


export default function Course() {
  const auditLog = useAuditLog('courses');
  const [historyItem, setHistoryItem] = useState(null);
  const dispatch = useDispatch()

  const {
    data, visibleData, loading, error,
    search, onSearchChange,
    sortField, onSortField,
    toggleSortOrder, sortOrder,
    isModalOpen, setIsModalOpen, editItem,
    handleAdd, handleDelete, handleSave, handleEdit,
    currentPage, pageCount, totalItem, itemsPerPage,
    onGoToPage, onChangeItemsPerPage, handleReorder
  } = useComponentData(
    courseService,
    'courseName',
    auditLog,
    COURSE_FIELDS,
    {
      onAfterSave: (saved, oldItem, isEdit) => {
        dispatch(updateMasterEntity('courses', isEdit ? 'update' : 'create', saved))
      },
      onAfterDelete: (deleted) => {
        dispatch(updateMasterEntity('courses', 'delete', deleted))
      }
    }
  );

  const generateCourseCode = useCallback((data) => {
    if (!data || data?.length == 0) return 'RA001';
    const courseCodeList = data.map(d => d.courseCode);
    let maxCourseCode = courseCodeList.reduce((max, courseCode) => {
      let num = parseInt(courseCode.replace('RA', ''))
      return max > num ? max : num
    }, 0)

    return `RA${String(maxCourseCode + 1).padStart(3, '0')}`
  }, [])
  const handleHistory = useCallback((course) => {
    setHistoryItem(course)
    auditLog.fetchLogs(course.id)
  }, [auditLog])

  if (loading) return <div className='pageWrapper'>Đang tải...</div>

  if (error) {
    // console.log("LỖi ", error);
    return (
      <div className={`pageWrapper ${error ? 'pageWrapper--error' : ''}`}>
        Lỗi: {error}
      </div>)
  }

  return (
    <div className='pageWrapper'>
      <PageHeader
        title="Các Khóa Học Tại Trung Tâm"
        desc="Integer molestie aliquam gravida.Imperdiet nulla vitae."
      />
      <Toolbar
        onAdd={handleAdd}
        search={search}
        onSearch={onSearchChange}
        sortOptions={COURSE_SORT_OPTIONS}
        sortField={sortField}
        sortOrder={sortOrder}
        onSortField={onSortField}
        toggleSortOrder={toggleSortOrder}
      />
      <DataTable
        keyField="id"
        columns={COURSE_TABLE_COLUMNS}
        data={visibleData}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onHistory={handleHistory}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onReorder={handleReorder}
        fields={COURSE_FIELDS}
      />

      {isModalOpen && (
        <SharedModal
          // key thay đổi → React tạo lại modal → form reset đúng
          key={editItem?.courseCode ?? 'new'}
          title={editItem ? 'Sửa Khóa Học' : 'Thêm Mới Khóa Học'}
          fields={COURSE_FIELDS}
          // khi thêm mới → truyền mã tự động vào editItem giả
          editItem={editItem ?? { courseCode: generateCourseCode(data) }}
          onSave={handleSave}
          onClose={() => setIsModalOpen(false)}
          statusOpts={COURSE_STATUS_OPTIONS}
        />
      )}
      {/* Modal lịch sử */}
      {historyItem && (
        <HistoryModal
          entityCode={`${historyItem.courseCode}-${historyItem.courseName}`}
          logs={auditLog.logs}
          loading={auditLog.loading}
          fields={COURSE_FIELDS}
          onClose={() => setHistoryItem(null)}
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