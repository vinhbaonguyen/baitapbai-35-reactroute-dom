import { del, get, patch, post } from "@/utils/requestAPI";


const PATH = 'classSchedules'

export const getAll = () => get(PATH);
export const getByClassId = (classId) => get(`${PATH}?classId=${classId}`);
export const create = (data) => post(PATH, data);
export const update = (id, data) => patch(`${PATH}/${id}`, data);
export const remove = (id) => del(`${PATH}/${id}`)