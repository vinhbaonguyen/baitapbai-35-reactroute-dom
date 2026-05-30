import React, { useCallback, useMemo, useState } from 'react'
import PageHeader from './../../components/PageComponent/PageHeader';
import Toolbar from '../../components/PageComponent/Toolbar';
import useComponentData from '../../hooks/useComponentData';
import useAuditLog from '../../hooks/useAuditLog';
import * as lectureService from '../../services/lectureService'
import DataTable from '../../components/PageComponent/DataTable';
import LectureDetailModal from './LectureDetailModal';
import Pagination from '../../components/PageComponent/Pagination';
import HistoryModal from '../../components/PageComponent/HistoryModal';
import LectureModal from './LectureModal';
import { SORT_OPTION, LECTURE_TABLE_COLUMNS } from '../../constants/lecturer/lecturer.constants';
import { LECTURE_FIELDS } from '../../constants/lecturer/lecture.fields';
import { useDispatch, useSelector } from 'react-redux';
import { updateMasterEntity } from '@/actions/masterDataAction';
import { selectClasses } from '@/store/selectors/masterDataSelectors';

export default function Lecture() {
    const auditLog = useAuditLog('lectures');
    const [historyItem, setHistoryItem] = useState(null);
    const [detailItem, setDetaiItem] = useState(null);
    const dispatch = useDispatch();
    const allClasses = useSelector(selectClasses)

    const {
        data, visibleData, loading, error,
        search, onSearchChange,
        sortField, onSortField, toggleSortOrder, sortOrder,
        isModalOpen, setIsModalOpen,
        editItem, setEditItem,
        handleAdd, handleEdit,
        handleDelete, handleSave,
        totalItem, currentPage, pageCount, itemsPerPage,
        onGoToPage, onChangeItemsPerPage, handleReorder,
    } = useComponentData(lectureService, 'lectureName', auditLog, LECTURE_FIELDS, {
        onAfterSave: (saved, oldItem, isEdit) => {
            dispatch(updateMasterEntity('lectures', isEdit ? 'update' : 'create', saved));
        },
        onAfterDelete: (deleted) => {
            dispatch(updateMasterEntity('lectures', 'delete', deleted))
        }
    })

    const handleHistory = (lecture) => {
        setHistoryItem(lecture)
        auditLog.fetchLogs(lecture.id)
        console.log("Nội Dung của History", lecture);
    }
    // Map tự cập nhật mỗi khi allClasses thay đổi trong Redux
    // VD: { 4: ['HCM-W-2605-01', 'ĐN-W-2605-02'], 6: ['ĐN-C-2605-01'] }
    const classesByLecture = useMemo(() => {
        const map = {};
        allClasses?.forEach(cls => {
            const lid = Number(cls.lectureId);
            if (!map[lid]) map[lid] = [];
            map[lid].push(cls.classCode)
        });
        return map;
    }, [allClasses]) // ← tự cập nhật khi allClasses Redux thay đổi;

    // handleView giờ đồng bộ, không cần async, không cần try/catch
    const handleView = useCallback((lecture) => {
        setDetaiItem({
            ...lecture,
            assignedClasses: classesByLecture[lecture.id] || []
        })
    }, [classesByLecture]);

    if (loading) return <div className='pageWrapper'>Đang tải...</div>
    if (error) return (
        <div className={`pageWrapper ${error ? 'pageWrapper--error' : ''}`}>
            Lỗi: {error}
        </div>)

    return (
        <div>
            <PageHeader
                title="Danh Sách Giảng Viên Tại Trung Tâm"
                desc="Lực Lượng Giảng Viên Hùng Hậu với Nhiều Kinh Nghiệm và Kiến thức"
            />
            <Toolbar
                onAdd={handleAdd}
                search={search}
                onSearch={onSearchChange}
                sortOptions={SORT_OPTION}
                sortField={sortField}
                sortOrder={sortOrder}
                toggleSortOrder={toggleSortOrder}
                onSortField={onSortField}
            />
            <DataTable
                columns={LECTURE_TABLE_COLUMNS}
                data={visibleData}
                keyField="id"
                onEdit={handleEdit}
                onDelete={handleDelete}
                onHistory={handleHistory}                
                onView={handleView}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                onReorder={handleReorder}
                fields={LECTURE_FIELDS}
            />
            {detailItem && (
                <LectureDetailModal
                    lecture={detailItem}
                    onClose={() => setDetaiItem(null)}
                />
            )}
            {isModalOpen && (
                <LectureModal
                    editItem={editItem}
                    allLectures={data}
                    onSave={handleSave}
                    onClose={() => { setIsModalOpen(false); setEditItem(null) }}
                />
            )}
            {historyItem && (
                <HistoryModal
                    entityCode={`${historyItem.lectureCode}-${historyItem.lectureName}`}
                    logs={auditLog.logs}
                    fields={LECTURE_FIELDS}
                    loading={auditLog.loading}
                    onClose={() => setHistoryItem(false)}
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
