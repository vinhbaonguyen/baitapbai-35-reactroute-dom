import React, { useMemo, useState } from 'react'

export default function useSort(data = []) {
    const [sortField, setSortField] = useState('default');
    const [sortOrder, setSortOrder] = useState('asc');

    const sortedData = useMemo(() => {
        if (!sortField || sortField === 'default') return data;

        return [...data].sort((a, b) => {
            const valA = a[sortField] ?? ''
            const valB = b[sortField] ?? ''
            // number
            if (typeof valA === 'number' && typeof valB === 'number') {
                return sortOrder === 'asc' ? valA - valB : valB - valA
            }
            // date
            if (typeof valA === 'string' && valA.includes('-')) {
                const timeA = new Date(valA).getTime()
                const timeB = new Date(valB).getTime()

                if (!isNaN(timeA) && !isNaN(timeB)) {
                    return sortOrder === 'asc'
                        ? timeA - timeB
                        : timeB - timeA
                }
            }
            // string fallback
            return sortOrder === 'asc'
                ? String(valA).localeCompare(String(valB))
                : String(valB).localeCompare(String(valA))
        })
    }, [data, sortField, sortOrder]);
   
    const onSortField = (field) => {
        if (!field || field === 'default') {
            setSortField('default')
            return
        }
        setSortField(field)
        setSortOrder('asc')
    }

    const toggleSortOrder = () => {
        if (!sortField || sortField === 'default') return;
        setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
    }

    return {
        sortedData,        
        sortField,
        sortOrder,     
        onSortField,
        toggleSortOrder
    }
}
