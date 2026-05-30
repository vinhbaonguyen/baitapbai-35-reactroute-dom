import { memo, useMemo } from 'react';
import './PageComponent.scss'
function Pagination({
    currentPage,
    pageCount,
    totalItem,
    itemsPerPage,
    onGoToPage,
    onChangeItemsPerPage }) {
    // Tạo danh sách số trang hiển thị — có dấu '...' nếu nhiều trang
    const pageNumbers = useMemo(() => {
        if (pageCount <= 5) {
            return [...Array(pageCount)].map((_, i) => i + 1);
        };
        const left = Math.max(2, currentPage - 1);
        const right = Math.min(pageCount - 1, currentPage + 1)
        return [
            1,
            ...(left > 2 ? ['...'] : []),
            ...Array.from({ length: right - left + 1 }, (_, i) => left + i),
            ...(right < pageCount - 1 ? ['...'] : []),
            pageCount
        ]
    }, [pageCount, currentPage])
    if (pageCount <= 0) return null;
    const from = totalItem === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const to = Math.min(currentPage * itemsPerPage, totalItem);
    return (
        <div className='pagination'>
            {/* Info + Items per page */}
            <div className='paginationMeta'>
                <span className='paginationInfo'>
                    Hiển thị <strong>{from}–{to}</strong> / <strong>{totalItem}</strong> mục
                </span>
                <div className='itemsPerPage'>
                    <label htmlFor="ipp">Mỗi trang:</label>
                    <select
                        id="ipp"
                        value={itemsPerPage}
                        onChange={e => onChangeItemsPerPage(Number(e.target.value))}
                    >
                        {[1, 2, 5, 10, 20].map(n => (
                            <option key={n} value={n}>{n}</option>
                        ))}
                    </select>
                </div>
            </div>
            <div className='paginationControls'>
                {/* Prev */}
                <button
                    className='pageBtn pageBtnNav'
                    onClick={() => onGoToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    aria-label="Trang Trước"
                >
                    ◀
                </button>
                {pageNumbers.map((p, i) =>
                    p === '...'
                        ? <span key={`dots-${i}`} className='pageDots'>…</span>
                        : <button
                            key={p}

                            className={`pageBtn${p === currentPage ? ' pageBtnActive' : ''}`}
                            onClick={() => onGoToPage(p)}
                            aria-current={p === currentPage ? 'page' : undefined}
                        >
                            {p}
                        </button>
                )}
                <button
                    className='pageBtn pageBtnNav'
                    onClick={() => onGoToPage(currentPage + 1)}
                    disabled={currentPage === pageCount}
                    aria-label='Trang Sau'
                >
                    ▶

                </button>
            </div>
        </div>
    )
}
export default memo(Pagination);