import { del, get, patch, post } from "@/utils/requestAPI"

const PATH = 'students'

export const getAll = () => get(`${PATH}?_sort=sortOrder&_order=asc`)
export const create = (student) => post(PATH, student)
export const update = (id, data) => patch(`${PATH}/${id}`, data)
export const remove = (id) => del(`${PATH}/${id}`)

export const updateOrder = async (reorderedPageData, startIndex) => {
    const promises = reorderedPageData.map((item, index) => {
        return patch(`${PATH}/${item.id}`, { sortOrder: startIndex + index })
    })
    return Promise.all(promises)
}