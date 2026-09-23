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
    const { data, setData, loading, error } = useFetchData(service, options?.enrich)
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
    useEffect(() => { setCurrentPage(1) }, [debouncedSearch, setCurrentPage]);

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
                // console.group("🧠 DEBUG COMPARE");
                // console.table(changedFields);
                // console.groupEnd();
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
                // 🔥 ENRICH NGAY TẠI ĐÂY

                const finalItem = options?.enrich ? options.enrich(updated) : updated
                // Ghi log update — so sánh old vs new
                // if (auditLog) {
                //     try {
                //         await auditLog.writeLog('UPDATE', finalItem, editItem)

                //     } catch (logErr) {
                //         console.warn("⚠️ Ghi audit log thất bại (không ảnh hưởng đến việc cập nhật):", logErr);
                //     }
                // }
                // Cập nhật UI
                setData(prev => prev.map(item => item.id === finalItem.id ? finalItem : item))

                alertSuccess({ title: 'Cập Nhật Thành Công' })
                setIsModalOpen(false);
                setEditItem(null);
                // ✅ Gọi callback nếu Component truyền vào
                // Truyền đủ thông tin để Component tự quyết định dispatch gì
                if (onAfterSave) await onAfterSave(finalItem, editItem, true); // true = isEdit
                return finalItem; // ✅ return item đã update
            } else {
                // CREATE                 
                const created = await create(formData)
                // 🔥 ENRICH NGAY TẠI ĐÂY 

                const finalItem = options?.enrich ? options.enrich(created) : created;
                // Ghi log tạo mới — KHÔNG để lỗi audit log chặn flow chính

                // if (auditLog) {
                //     try {
                //         await auditLog.writeLog('CREATE', finalItem)
                //     } catch (logErr) {
                //         console.warn("⚠️ Ghi audit log thất bại (không ảnh hưởng đến việc tạo mới):", logErr);
                //     }
                // }

                // Cập nhật UI
                setData(prev => [...prev, finalItem])

                alertSuccess({ title: 'Tạo Mới Thành Công' })
                setIsModalOpen(false);
                setEditItem(null);
                // ✅ Gọi callback
                if (onAfterSave) await onAfterSave(finalItem, null, false); // false = isCreate
                return finalItem;
            }
        } catch (err) {
            console.error("🔴 Lỗi handleSave:", err);  // ← TẠM THỜI để debug
            alertError({ title: 'Lỗi xảy ra !' })
        }
    }, [editItem, auditLog, setData, update, create, fields, onAfterSave, options]);

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
            // if (auditLog && target) {
            //     try {
            //         await auditLog.writeLog('DELETE', target)

            //     } catch (logErr) {
            //         console.warn("⚠️ Ghi audit log thất bại (không ảnh hưởng đến việc xóa):", logErr);
            //     }
            // }

            setData(prev => prev.filter(item => item.id !== id))
            alertSuccess({ title: 'Đã xóa!' });

            // ✅ Gọi callback — truyền target để Component biết item nào bị xóa
            if (onAfterDelete) await onAfterDelete(target)

        } catch(err) {
            console.error("🔴 Lỗi handleDelete:", err);  // ← TẠM THỜI để debug
            const code = err?.code ?? "Không xác định";
            const message = err?.message ?? 'Không xác định';
            alertError({
                title:"Xóa thất bại!",
                html:`
                <div style="text-align:left">
                    <p><b>Error Code :</b> ${code}</p>
                    <p><b>Message :</b> ${message}</p>
                </div>
                `}) }
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