import { del, get, patch, post } from "../utils/requestAPI"

const PATH = 'lectures'

export const getAll = () => get(`${PATH}?_sort=sortOrder&_order=asc`)

export const create = (lecture) => post(PATH, lecture)

export const update = (id, data) => patch(`${PATH}/${id}`, data)

export const updateOrder = async (reorderedPageData, startIndex) => {
    const promises = reorderedPageData.map((item, index) => {
        return patch(`${PATH}/${item.id}`, { sortOrder: startIndex + index })
    })
    return Promise.all(promises)
}

export const remove = (id) => del(`${PATH}/${id}`)