import React, { useCallback, useEffect, useState } from 'react'

export default function useFetchData(service,enrich) {
    const [data, setData] = useState([])
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(true)

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            const raw = await service.getAll();
            // 🔥 enrich nếu có
            const finalData = enrich ? raw.map(item => enrich(item)) : raw          
            setData(finalData)
            setError(null)
        } catch (err) {
            setError(err?.message || 'Có Lỗi xảy ra')
        } finally {
            setLoading(false)
        }
    }, [service,enrich]);

    useEffect(() => { fetchData() }, [fetchData])

    return {
        data,
        setData,   // 👈 vẫn cho phép mutate từ ngoài (delete/update)
        error,
        loading,
        refetch: fetchData
    }
}
