import React, { useCallback, useMemo, useState } from 'react'

export default function usePagination(data = [], initialPageSize = 5) {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(initialPageSize);
    const totalItem = data?.length;
    const pageCount = useMemo(() => {
        return Math.ceil(totalItem / itemsPerPage)
    }, [totalItem, itemsPerPage])
    const visibleData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage
        return data.slice(start, start + itemsPerPage)
    }, [data, currentPage, itemsPerPage]);    
    const onGoToPage = useCallback((page) => {
        if (page < 1 || page > pageCount) return;   // chặn trang không hợp lệ
        setCurrentPage(page);
    }, [pageCount])
    const onChangeItemsPerPage = useCallback((n) => {
        setItemsPerPage(n);
        setCurrentPage(1) // reset về trang 1 khi đổi số item/trang
    }, [])
    
    return {
        currentPage,
        itemsPerPage,
        totalItem,
        pageCount,
        visibleData,
        setCurrentPage,
        onGoToPage,
        onChangeItemsPerPage
    }
}
