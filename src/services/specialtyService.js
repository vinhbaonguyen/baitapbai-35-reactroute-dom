import { del, get, post, put } from "@/utils/requestAPI";

const PATH = 'specialties'

export const getAll = () => get(PATH);

export const getById = (id) => get(`${PATH}/${id}`);

export const create = (data) => post(PATH, data);

export const update = (id, data) => put(`${PATH}/${id}`, data);

export const remove = (id) => del(`${PATH}/${id}`);