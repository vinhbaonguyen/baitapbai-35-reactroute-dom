import { del, get, post, put } from "@/utils/requestAPI";


const PATH = 'class-schedules'

export const getAll = () => get(PATH);
export const getByClassId = (classId) => get(`${PATH}?classId=${classId}`);
export const create = (data) => post(PATH, data);
export const update = (id, data) => put(`${PATH}/${id}`, data);
export const remove = (id) => del(`${PATH}/${id}`)