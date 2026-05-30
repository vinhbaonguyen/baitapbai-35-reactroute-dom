import { useEffect, useRef, useState } from 'react'

export default function useSearch(delay = 500) {
    const [search, setSearch] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const timeoutRef = useRef(null)
    const onSearchChange = (value) => {
        setSearch(value)
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            setDebouncedSearch(value)
        }, delay)
    }
    useEffect(()=>{
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    },[])
    return {
        search,
        debouncedSearch,
        onSearchChange
    }
}
