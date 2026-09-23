import { getAllLogs } from '@/services/auditLogService';
import { useCallback, useState } from 'react'

export default function useSystemAuditLog() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [error, setError] = useState(null);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const fetchLogs = useCallback(async (params = {}) => {
        const {
            entityType = '', action = '', keyword = '',
            page: pageNumber = 0, size = 20,
            sortField = 'changedAt', sortOrder = 'desc'
        } = params;

        setLoading(true);
        setError(null);

        try {
            const data = await getAllLogs(entityType, action, keyword,
                pageNumber, size, sortField, sortOrder);

            console.log("Dữ liệu AuditLog :",data);            

            setLogs(data?.content ?? []);
            setTotalPages(data?.totalPages ?? 0)
            setTotalElements(data?.totalElements ?? 0)
            setPage(data?.number ?? pageNumber);

        } catch (err) {
            console.log("Nội dung của Error", err);
            
            // requestAPI.js đã tự bóc tách + tạo Error(message) sẵn rồi -> lấy thẳng err.message
            setError(err.message || 'Không tải được nhật ký hệ thống, vui lòng thử lại.')
            setLogs([]);

        } finally {
            setLoading(false)
        }
    }, []);

    return { logs, loading, error, page, totalPages, totalElements, fetchLogs };

}





