import React from 'react'

export default function useCrud(service) {
    const create = (formData) => service.create(formData)
    const update = (id, formData) => service.update(id, formData)
    const remove = (id) => service.remove(id)

    return { create, update, remove }
}