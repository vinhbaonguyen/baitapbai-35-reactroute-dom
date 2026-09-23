import { get } from "../utils/requestAPI";

// const PATH = 'auditLogs';
const PATH = 'audit-logs'; // 👈 đổi từ 'auditLogs' -> 'audit-logs' khớp đúng @GetMapping bên BE

// Lấy lịch sử theo entityType + entityId ở các trang Course hay Lecture...
// BE trả về Page<AuditLogResponseDTO>: { content: [...], totalElements, totalPages, ... }
// size=100 để lấy đủ toàn bộ lịch sử trong 1 lần gọi (HistoryModal hiện không có UI phân trang)
export const getByEntity = (entityType, entityId) =>
    get(`${PATH}?entityType=${entityType}&entityId=${entityId}&page=0&size=100&sort=changedAt,desc`);


// ===== MỚI: lấy log toàn hệ thống, filter optional -> phục vụ trang "Nhật ký hệ thống" =====
export const getAllLogs = (entityType = '', action = '', keyword = '', page = 0,
    size = 20, sortField = 'changedAt', sortOrder = 'desc') => {

    const params = new URLSearchParams();

    if (entityType) params.append('entityType', entityType);
    if (action) params.append('action', action);
    if (keyword) params.append('keyword', keyword);
    params.append('page', page);
    params.append('size', size);
    params.append('sort', `${sortField},${sortOrder}`);

    return get(`${PATH}/all?${params.toString()}`)
}


// Lấy lịch sử theo entityType + entityId
// vd: getByEntity('courses', 1) → GET /auditLogs?entityType=courses&entityId=1
// export const getByEntity = (entityType, entityId) => 
//     get(`${PATH}?entityType=${entityType}&entityId=${entityId}&_sort=changedAt&_order=desc`)

// ❌ Đã xoá createLog — BE giờ tự ghi log (CourseService gọi AuditLogService.log()),
//    FE không còn quyền tự tạo audit log nữa (tránh giả mạo changedBy/changedFields)
// Ghi log mới
// export const createLog = (log) => post(PATH, log)