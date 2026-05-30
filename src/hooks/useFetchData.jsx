import React, { useCallback, useEffect, useState } from 'react'

export default function useFetchData(service) {
    const [data, setData] = useState([])
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(true)

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            const res = await service.getAll();            
            setData(res)
            setError(null)
        } catch (err) {
            setError(err?.message || 'Có Lỗi xảy ra')
        } finally {
            setLoading(false)
        }
    }, [service]);

    useEffect(() => {
        fetchData()
    }, [fetchData])

    return {
        data,
        setData,   // 👈 vẫn cho phép mutate từ ngoài (delete/update)
        error,
        loading,
        refetch: fetchData
    }
}
