import { del, get, patch, post, put } from "../utils/requestAPI"

const PATH = 'lectures'

// export const getAll = () => get(`${PATH}?_sort=sortOrder&_order=asc`)
export const getAll = () => get(PATH);

export const create = (lecture) => post(PATH, lecture)

export const update = (id, data) => put(`${PATH}/${id}`, data)

// export const updateOrder = async (reorderedPageData, startIndex) => {
//     const promises = reorderedPageData.map((item, index) => {
//         return patch(`${PATH}/${item.id}`, { sortOrder: startIndex + index })
//     })
//     return Promise.all(promises)
// }
export const updateOrder = (items) => put(`${PATH}/reorder`, items);

export const remove = (id) => del(`${PATH}/${id}`)