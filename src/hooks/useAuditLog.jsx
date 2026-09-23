import { useCallback, useState } from "react";
import { getByEntity } from "../services/auditLogService";
// import { useSelector } from "react-redux";
export default function useAuditLog(entityType) {
    // const currentUser = useSelector(state => state.auth.currentUser)
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(false);

    // Lấy lịch sử của 1 record cụ thể
    const fetchLogs = useCallback(async (entityId) => {
        setLoading(true)
        try {
            const data = await getByEntity(entityType, entityId)
            // setLogs(data)
            // BE trả Page<T> -> lấy mảng thật nằm trong field "content"
            setLogs(data?.content ?? [])
        } finally {
            setLoading(false)
        }
    }, [entityType])
    // So sánh oldItem vs newItem → tìm field nào thay đổi
    // const writeLog = useCallback(async (action, newItem, oldItem = null, extraChangedFields = []) => {
    //     let changedFields = [...extraChangedFields]
    //     if (action === 'UPDATE' && oldItem) {
    //         if (extraChangedFields.length === 0) {
    //             // Chỉ lưu những field thực sự thay đổi
    //             const autoFields = Object.keys(newItem)
    //                 .filter(key => key !== 'id' && String(newItem[key]) !== String(oldItem[key]))
    //                 .map(key => ({
    //                     field: key,
    //                     oldValue: oldItem[key],
    //                     newValue: newItem[key]
    //                 }))
    //             // Không có gì thay đổi → không ghi log
    //             changedFields = [...autoFields];
    //         }
    //         if (changedFields.length === 0) return;
    //     }

    //     await createLog({
    //         entityType,
    //         entityId: newItem.id,
    //         entityCode: newItem.courseCode || newItem.classCode || newItem.studentCode || String(newItem.id),
    //         action,  // 'CREATE' | 'UPDATE' | 'DELETE'
    //         changedFields,
    //         changedBy: currentUser ? `${currentUser.fullName} (${currentUser.role})` : 'admin',
    //         changedAt: new Date().toISOString(),
    //     })
    // }, [entityType, currentUser])
    return { logs, loading, fetchLogs}
}