export const BASE_MODAL_STYLE = {
    overlay: {
        backgroundColor: 'rgba(0,0,0,0.45)',
        zIndex: 1100,
    },
    content: {
        // ✅ Cách chuẩn của react-modal để center
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        transform: 'translate(-50%, -50%)',
        // ─────────────────────────────────
        maxWidth: '95vw',
        height: 'fit-content',
        maxHeight: '90vh',
        borderRadius: '12px',
        padding: '14px 16px',
        border: 'none',
        boxShadow: '0 8px 32px rgba(0,0,0,.2)',
        overflowY: 'auto'
    }
}
// Hàm tạo style với width tùy chỉnh
export const getModalStyle = (width) => ({
    ...BASE_MODAL_STYLE,
    content: { ...BASE_MODAL_STYLE.content, width: width }
});
