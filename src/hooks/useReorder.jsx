import React, { useCallback, useEffect, useRef } from 'react'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'
export default function useReorder({
    setData,
    currentPage,
    itemsPerPage,
    service
}) {
    const deboundRef = useRef(null)
    const latestPayloadRef = useRef(null)
    const handleReorder = useCallback((reorderedPageData) => {
        // 1.🧠 tính index trong toàn bộ data
        const startIndex = (currentPage - 1) * itemsPerPage;

        // 2. Cập nhật State để UI thay đổi ngay lập tức
        // setData(newData);
        setData(prev => {
            const newData = [...prev];
            newData.splice(startIndex, reorderedPageData.length, ...reorderedPageData);
            return newData
        })
        // 🔥 lưu payload mới nhất
        latestPayloadRef.current = {
            data: reorderedPageData,
            startIndex
        }

        // 4. Hủy timer cũ nếu còn đang chờ
        if (deboundRef.current) clearTimeout(deboundRef.current)
        // 5. Debound gọi API sau 2500ms khi ngừng kéo
        deboundRef.current = setTimeout(async () => {
            try {
                const { data, startIndex } = latestPayloadRef.current
                if (service.updateOrder) {
                    await service.updateOrder(data, startIndex)
                }
            } catch {
                Swal.fire({ icon: 'error', title: 'Cập nhật vị trí thất bại!' })
            }
        }, 2500)
    }, [setData, currentPage, itemsPerPage, service]);
    //6 memory leak (clean up)
    useEffect(() => {
        return () => {
            if (deboundRef.current) {
                clearTimeout(deboundRef.current)
            }
        }
    }, [])

    return {
        handleReorder
    }
}
