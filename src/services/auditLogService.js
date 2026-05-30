import { get, post } from "../utils/requestAPI";

const PATH = 'auditLogs';
// Lấy lịch sử theo entityType + entityId
// vd: getByEntity('courses', 1) → GET /auditLogs?entityType=courses&entityId=1
export const getByEntity = (entityType, entityId) => 
    get(`${PATH}?entityType=${entityType}&entityId=${entityId}&_sort=changedAt&_order=desc`)


// Ghi log mới
export const createLog = (log) => post(PATH, log)