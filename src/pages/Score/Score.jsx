import React, { useCallback, useEffect, useState } from 'react'
import Toolbar from '@/components/PageComponent/Toolbar'
import * as scoreServive from '@/services/scoreService'
import useComponentData from '@/hooks/useComponentData';
import useAuditLog from '@/hooks/useAuditLog';
import PageHeader from '@/components/PageComponent/PageHeader';
import DataTable from '@/components/PageComponent/DataTable';
import ScoreDetailModal from './ScoreDetailModal';
import HistoryModal from '@/components/PageComponent/HistoryModal';
import Pagination from '@/components/PageComponent/Pagination';
import ScoreModal from './ScoreModal';

import {
    SCORE_FIELDS,
    SCORE_SORT_OPTIONS,
    SCORE_TABLE_COLUMNS
} from '@/constants/score/score.master.fieldsConfig';


export default function Score() {
    const auditLog = useAuditLog('scores');
    const [historyItem, setHistoryItem] = useState(null);
    const [detailItem, setDetaiItem] = useState(null);
    const [scoreData, setScoreData] = useState([]);  

    // Lấy toàn bộ data từ scores từ json-serer
    const fetchScores = useCallback(() => {
        scoreServive.getAll().then(data => setScoreData(data))
    }, []);  

    useEffect(() => { fetchScores() }, [fetchScores]);  

    const {
        visibleData,
        search, onSearchChange,
        sortField, sortOrder, onSortField, toggleSortOrder,
        isModalOpen, setIsModalOpen, editItem,
        handleAdd, handleEdit, handleDelete, handleSave,
        totalItem, pageCount, currentPage, itemsPerPage, onGoToPage, onChangeItemsPerPage,
        handleReorder       
    } = useComponentData(scoreServive, 'studentName', auditLog, SCORE_FIELDS, {});


    const handleHistory = useCallback((scores) => {
        setHistoryItem(scores);
        auditLog.fetchLogs(scores.id)  // tất cả các score của 1 student sẽ có cùng id recordHistory
    }, [auditLog]);


    const handleView = useCallback((score) => { setDetaiItem(score); }, []);

    return (
        <div className="pageWrapper">
            <PageHeader
                title='Quản Lý Điểm Cuối Khóa'
                desc='Quản lý điểm cuối khóa của học viên, bao gồm kết quả và trạng thái chứng chỉ'
            />
            <Toolbar
                onAdd={handleAdd}
                search={search}
                onSearch={onSearchChange}
                sortOptions={SCORE_SORT_OPTIONS}
                sortField={sortField}
                onSortField={onSortField}
                toggleSortOrder={toggleSortOrder}
                sortOrder={sortOrder}
            />
            <DataTable
                keyField='id'
                columns={SCORE_TABLE_COLUMNS}
                data={visibleData}
                fields={SCORE_FIELDS}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onHistory={handleHistory}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                onReorder={handleReorder}
                onView={handleView}
            />
            {
                detailItem && (
                    <ScoreDetailModal
                        score={detailItem}
                        onClose={() => setDetaiItem(null)}
                    />
                )
            }
            {
                isModalOpen && (
                    <ScoreModal
                        editItem={editItem}
                        // onSave={handleSave}
                        onSave={async (submitData) => {
                            // Gọi hàm save gốc của useComponentData (handleSave)
                            await handleSave(submitData);
                            // Sau khi lưu thành công, kéo lại danh sách điểm mới nhất để ép lọc lại sinh viên
                            fetchScores()
                        }}
                        onClose={() => { setIsModalOpen(null) }}
                        existingScores={scoreData}
                    />
                )
            }
            {
                historyItem && (
                    <HistoryModal
                        entityCode={`${historyItem?.studentName} - ${historyItem?.classCode}`}
                        logs={auditLog.logs}
                        onClose={() => setHistoryItem(null)}
                        fields={SCORE_FIELDS}
                        loading={auditLog.loading}
                    />)
            }
            <Pagination
                currentPage={currentPage}
                pageCount={pageCount}
                onGoToPage={onGoToPage}
                onChangeItemsPerPage={onChangeItemsPerPage}
                itemsPerPage={itemsPerPage}
                totalItem={totalItem}
            />
        </div>
    )
}
