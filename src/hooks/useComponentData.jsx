import { useCallback, useEffect, useMemo, useState } from 'react'
import useFetchData from './useFetchData'
import useSearch from './useSearch'
import useCrud from './useCrud'
import usePagination from './usePagination'
import useSort from './useSort'
import useReorder from './useReorder'
import { compareData } from '../utils/compareData'
import { alertConfirm, alertError, alertSuccess } from '@/utils/alert'

export default function useComponentData(
    service,
    searchField,
    auditLog = null,
    fields = [],
    options = {}     // ← thêm options với default = {} để không break Component cũ

) {
    // Lấy callbacks từ options — undefined nếu Component không truyền
    const { onAfterSave, onAfterDelete } = options;

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editItem, setEditItem] = useState(null)  //edit = nulll là thêm mới
    // hook fetchData
    const { data, setData, loading, error } = useFetchData(service)
    console.log("1. Raw Data from API:", data);
    // hook useSearch
    const { search, debouncedSearch, onSearchChange } = useSearch(500);
    // filter Data ⇒ sort Data ⇒ paginate
    const filteredData = useMemo(() =>
        data
            .filter(item =>
                String(item[searchField] || '')
                    .toLowerCase()
                    .includes(debouncedSearch?.toLowerCase())
            )
        , [data, searchField, debouncedSearch]);
    // console.log('2. FilteredData ', filteredData);
    // hook useSort
    const { sortedData, sortField, sortOrder, onSortField, toggleSortOrder } = useSort(filteredData);
    // console.log(`3. sortedData `, sortedData);
    // hook paginate
    const { currentPage, setCurrentPage, itemsPerPage, totalItem,
        pageCount, visibleData, onGoToPage, onChangeItemsPerPage } = usePagination(sortedData);
    // console.log(`4. Final Visible Data (Page ${currentPage}):`, visibleData);

    // hỗ trợ chuyển về trang đầu tiên khi search 
    useEffect(() => {
        setCurrentPage(1)
    }, [debouncedSearch, setCurrentPage])
    // hook CRUD
    const { create, update, remove } = useCrud(service);
    // hook Reorder co table data
    const { handleReorder } = useReorder({ data, setData, currentPage, itemsPerPage, service });

    // Thao tác liên quan CRUD
    const handleAdd = useCallback(() => { setEditItem(null); setIsModalOpen(true) }, [])
    const handleEdit = useCallback((item) => { setEditItem(item); setIsModalOpen(true) }, [])
    const handleSave = useCallback(async (formData) => {
        // console.log("🔍 EDIT ITEM :", editItem);
        // console.log("Giá trị form Data", formData);
        try {
            if (editItem) {
                // 🧠 1. compare==========================================================               
                const { isChanged, changedFields } = compareData({ formData, editItem, fields })
                console.group("🧠 DEBUG COMPARE");
                console.table(changedFields);
                console.groupEnd();
                //========================================================================
                // ❌ KHÔNG có thay đổi
                if (!isChanged) {
                    await alertConfirm({
                        title: 'Không có thay đổi',
                        text: 'Bạn chưa thay đổi dữ liệu?',
                        confirmText: 'Tiếp tục sửa',
                        cancelText: 'Không (Đóng)'
                    })
                    return null;
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
                if (!confirmEdit.isConfirmed) return null;
                //==========================================================================                
                console.log("Dữ liệu gửi API:", formData)
                // 🔧 3. gọi CRUD
                const updated = await update(editItem.id, formData)
                // Ghi log update — so sánh old vs new
                if (auditLog) await auditLog.writeLog('UPDATE', updated, editItem)
                setData(prev => prev.map(item => item.id === updated.id ? updated : item))
                alertSuccess({ title: 'Cập Nhật Thành Công' })
                setIsModalOpen(false);
                setEditItem(null);
                // ✅ Gọi callback nếu Component truyền vào
                // Truyền đủ thông tin để Component tự quyết định dispatch gì
                if (onAfterSave) await onAfterSave(updated, editItem, true); // true = isEdit
                return updated; // ✅ return item đã update
            } else {
                // CREATE                 
                const created = await create(formData)
                // Ghi log tạo mới
                if (auditLog) await auditLog.writeLog('CREATE', created)
                setData(prev => [...prev, created])
                alertSuccess({ title: editItem ? 'Cập Nhật Thành Công' : 'Tạo Mới Thành Công', })
                setIsModalOpen(false);
                setEditItem(null);
                // ✅ Gọi callback
                if (onAfterSave) await onAfterSave(created, null, false); // false = isCreate
                return created;
            }
        } catch {
            alertError({title:'Lỗi xảy ra !'})
        }
    }, [editItem, auditLog, setData, update, create, fields, onAfterSave]);
    
    const handleDelete = useCallback(async (_, id) => {
        const target = data.find(item => item.id === id);
        try {
            const deleteConfirm = await alertConfirm(
                {
                    text: 'Bạn muốn xóa dữ liệu này',
                    confirmText: 'Xóa ',
                    cancelText: 'Hủy',
                })
            if (!deleteConfirm.isConfirmed) return;
            await remove(id)
            if (auditLog && target) await auditLog.writeLog('DELETE', target)
            setData(prev => prev.filter(item => item.id !== id))
            alertSuccess({ title: 'Đã xóa!' });

            // ✅ Gọi callback — truyền target để Component biết item nào bị xóa
            if (onAfterDelete) await onAfterDelete(target)

        } catch { alertError('Xóa thất bại!') }
    }, [data, setData, auditLog, remove, onAfterDelete])

    return {
        data, setData, visibleData, loading, error,
        search, onSearchChange,
        sortField, sortOrder, onSortField, toggleSortOrder,
        isModalOpen, setIsModalOpen, editItem, setEditItem,
        handleAdd, handleEdit, handleDelete, handleSave,
        totalItem, pageCount, currentPage, itemsPerPage, onGoToPage, onChangeItemsPerPage,
        handleReorder
    }
}