import { useCallback, useState } from "react";
import { createLog, getByEntity } from "../services/auditLogService";
import { useSelector } from "react-redux";


export default function useAuditLog(entityType) {
    const currentUser = useSelector(state=>state.auth.currentUser)
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(false);

    // Lấy lịch sử của 1 record cụ thể
    const fetchLogs = useCallback(async (entityId) => {
        setLoading(true)
        try {
            const data = await getByEntity(entityType, entityId)
            setLogs(data)            
        } finally {
            setLoading(false)
        }
    },[entityType])

    // So sánh oldItem vs newItem → tìm field nào thay đổi
    const writeLog = useCallback(async (action, newItem, oldItem = null) => {
        let changedFields = []
        if (action === 'UPDATE' && oldItem) {
            // Chỉ lưu những field thực sự thay đổi
            changedFields = Object.keys(newItem)
                .filter(key => key !== 'id' && String(newItem[key]) !== String(oldItem[key]))
                .map(key => ({
                    field: key,
                    oldValue: oldItem[key],
                    newValue: newItem[key]
                }))
            // Không có gì thay đổi → không ghi log
            if (changedFields.length === 0) return;
        }
        await createLog({
            entityType,
            entityId: newItem.id,
            entityCode: newItem.courseCode || newItem.classCode || newItem.studentCode || String(newItem.id),
            action,  // 'CREATE' | 'UPDATE' | 'DELETE'
            changedFields,
            changedBy: currentUser ? `${currentUser.fullName} (${currentUser.role})` : 'admin',
            changedAt: new Date().toISOString(),
        })
    },[entityType,currentUser])

    return { logs, loading, fetchLogs, writeLog }
}