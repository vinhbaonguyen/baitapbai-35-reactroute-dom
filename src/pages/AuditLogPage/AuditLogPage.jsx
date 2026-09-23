import useSystemAuditLog from '@/hooks/useSystemAuditLog'
import React, { useEffect, useState } from 'react'
import DataTable from '@/components/PageComponent/DataTable';
import HistoryModal from '@/components/PageComponent/HistoryModal';
import PageHeader from '@/components/PageComponent/PageHeader';
import Toolbar from '@/components/PageComponent/Toolbar';
import {
    ACTION_OPTIONS,
    AUDIT_LOG_COLUMNS,
    ENTITY_TYPE_OPTIONS,
    FIELDS_CONFIG_BY_ENTITY,
    PAGE_SIZE, SORT_OPTIONS
} from '@/constants/auditLog/auditlog.master.fieldsConfig';


export default function AuditLogPage() {
    const { logs, loading, error, page, totalPages, totalElements, fetchLogs } = useSystemAuditLog();
    const [entityType, setEntityType] = useState('')
    const [action, setAction] = useState('')
    const [keyword, setKeyword] = useState('')
    const [sortField, setSortField] = useState('changedAt')
    const [sortOrder, setSortOrder] = useState('desc')
    const [selectedLog, setSelectedLog] = useState(null)

    useEffect(() => {
        fetchLogs({
            entityType, action, keyword, page: 0, size: PAGE_SIZE,
            sortField: sortField === 'default' ? 'changedAt' : sortField, // 🔥 chặn ở đây
            sortOrder
        })
    }, [entityType, action, keyword, sortField, sortOrder, fetchLogs])

    const goToPage = (newPage) => {
        if (newPage < 0 || newPage >= totalPages) return
        fetchLogs({
            entityType,
            action,
            keyword,
            page: newPage,
            size: PAGE_SIZE,
            sortField: sortField === 'default' ? 'changedAt' : sortField, // 🔥 chặn ở đây
            sortOrder
        })
    }

    const toggleSortOrder = () => setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))

    const retry = () => fetchLogs({
        entityType,
        action,
        keyword,
        page,
        size: PAGE_SIZE,
        sortField: sortField === 'default' ? 'changedAt' : sortField, // 🔥 chặn ở đây
        sortOrder
    })

    return (
        <div className='audit-log-page'>
            <PageHeader
                title="Nhật Ký Hệ Thống"
                desc="Nơi Hiển thị các tác vụ liên quan đến System"
            />

            <Toolbar
                search={keyword}
                onSearch={setKeyword}
                sortField={sortField}
                onSortField={setSortField}
                toggleSortOrder={toggleSortOrder}
                sortOptions={SORT_OPTIONS}
                filters={[
                    {
                        key: 'entityType',
                        value: entityType,
                        onChange: setEntityType,
                        options: ENTITY_TYPE_OPTIONS
                    },
                    {
                        key: 'action',
                        value: action,
                        onChange: setAction,
                        options: ACTION_OPTIONS

                    }
                ]}
            // Không truyền onAdd -> Toolbar tự ẩn nút "Thêm Mới"
            />

            {
                error ? (
                    <div className='audit-log-page__error'>
                        ⚠️ {error}
                        <button className='btn btn-warning' onClick={retry}>Thử lại</button>
                    </div>
                ) : loading ? (
                    <div className='audit-log-page__loading'>Đang tải...</div>
                ) : (
                    <DataTable
                        keyField="id"
                        columns={AUDIT_LOG_COLUMNS}
                        data={logs}
                        currentPage={page + 1}
                        itemsPerPage={PAGE_SIZE}
                        onView={(row) => setSelectedLog(row)}
                        onReorder={() => { }}
                        fields={[]}
                    />
                )
            }

            <div className="audit-log-page__pagination">
                <button
                    className='audit-log-page__pagination-btn audit-log-page__pagination-btn--prev'
                    disabled={page <= 0}
                    onClick={() => goToPage(page - 1)}
                >
                    ← Trước
                </button>
                <span
                    className='audit-log-page__pagination-info'
                >
                    Trang <strong>{page + 1}</strong> / {totalPages || 1}
                    <span className='audit-log-page__pagination-total'>(Tổng {totalElements} log)</span>
                </span>
                <button
                    className='audit-log-page__pagination-btn audit-log-page__pagination-btn--next'
                    disabled={page + 1 >= totalPages}
                    onClick={() => goToPage(page + 1)}
                >
                    Sau →
                </button>
            </div>

            {
                selectedLog && (
                    <HistoryModal
                        entityCode={selectedLog.entityCode}
                        logs={[selectedLog]}
                        loading={false}
                        onClose={() => setSelectedLog(null)}
                        fields={FIELDS_CONFIG_BY_ENTITY[selectedLog.entityType] || []}
                    />
                )
            }

        </div>
    )
}
