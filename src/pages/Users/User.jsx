import React, { useState } from 'react'
import * as userService from '../../services/userService'
// import './User.scss'
import PageHeader from '../../components/PageComponent/PageHeader'
import Toolbar from '../../components/PageComponent/Toolbar'
import useComponentData from '../../hooks/useComponentData'
import useAuditLog from '../../hooks/useAuditLog'
import DataTable from '../../components/PageComponent/DataTable'
import SharedModal from '../../components/PageComponent/SharedModal'
import HistoryModal from '../../components/PageComponent/HistoryModal'
import Pagination from '../../components/PageComponent/Pagination'


import { USER_FIELDS } from '../../constants/users/user.fields.js'
import { USER_TABLE_COLUMNS, USER_SORT_OPTIONS, USER_STATUS_OPTIONS } from '../../constants/users/user.constants.jsx'

export default function User() {
  const auditLog = useAuditLog('users')
  const [historyItem, setHistoryItem] = useState(null)

  const {
    visibleData, loading, error,
    search, onSearchChange,
    sortField, onSortField, toggleSortOrder, sortOrder,
    isModalOpen, setIsModalOpen,
    editItem,setEditItem ,handleAdd, handleEdit, handleDelete, handleSave,
    currentPage, pageCount, totalItem, itemsPerPage,
    onGoToPage, onChangeItemsPerPage, handleReorder
  } = useComponentData(userService, 'userName', auditLog, USER_FIELDS)

  const handleHistory = (user) => {
    setHistoryItem(user)
    auditLog.fetchLogs(user.id)
  }

  if (loading) return <div>Đang tải...</div>
  if (error) return <div>Lỗi: {error}</div>

  return (
    <div>
      <PageHeader
        title='Danh Sách Ban Quản Trị Trung Tâm'
        desc="Integer molestie aliquam gravida. Nullam nec arcu finibus, imperdiet nulla vitae."
      />
      <Toolbar
        onAdd={handleAdd}
        search={search}
        onSearch={onSearchChange}
        sortOptions={USER_SORT_OPTIONS}
        sortField={sortField}
        sortOrder={sortOrder}
        onSortField={onSortField}
        toggleSortOrder={toggleSortOrder}
      />
      <DataTable
        columns={USER_TABLE_COLUMNS}
        data={visibleData}
        keyField="id"
        onEdit={handleEdit}
        onDelete={handleDelete}
        onHistory={handleHistory}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onReorder={handleReorder}
        disableSelfEdit={true} // ✅ chỉ User page cần
        fields={USER_FIELDS}
      />
      {isModalOpen && (
        <SharedModal
          key={editItem?.id ?? 'new'}
          title={editItem ? 'Thay Đổi Nội dung User' : 'Thêm mới User'}
          fields={USER_FIELDS}
          editItem={editItem}
          onSave={handleSave}
          onClose={() =>{
             setIsModalOpen(false);
             setEditItem(null);
          }}
          statusOpts={USER_STATUS_OPTIONS}
        />
      )}
      {/* Modal lịch sử */}
      {historyItem && (
        <HistoryModal
          entityCode={historyItem.fullName}
          logs={auditLog.logs}
          fields={USER_FIELDS}
          loading={auditLog.loading}
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
