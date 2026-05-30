import React, { memo } from 'react'
import Modal from 'react-modal'
import './PageComponent.scss'
import { getModalStyle } from '../../constants/modalStyles'
import { formatDateHistory } from '../../utils/date.utils'
import { buildFieldMap, formatValue } from '../../utils/field.util.jsx'



// Map action → label + màu
const ACTION_CONFIG = {
  CREATE: { label: 'Tạo mới', color: '#16a34a', bg: '#dcfce7' },
  UPDATE: { label: 'Cập nhật', color: '#ca8a04', bg: '#fef9c3' },
  DELETE: { label: 'Đã xóa', color: '#dc2626', bg: '#fee2e2' },
}

function HistoryModal({ entityCode, logs, loading, onClose, fields = [] }) {
  const fieldMap = buildFieldMap(fields)
  return (
    <Modal
      isOpen={true}
      onRequestClose={onClose}
      style={getModalStyle('620px')}
      shouldFocusAfterRender={false}
      shouldReturnFocusAfterClose={false}
      ariaHideApp={false}              // ✅ tắt aria-hide hoàn toàn
    >
      <div className="history-modal__header">
        <h4 className="modal__title">
          📋 Lịch sử thay đổi — <span style={{ color: '#4a90d9' }}>{entityCode}</span>
        </h4>
        <button className="history-modal__close" onClick={onClose}>✕</button>
      </div>

      {loading ? (
        <div className="history-modal__loading">Đang tải lịch sử...</div>
      ) : logs?.length === 0 ? (
        <div className="history-modal__empty">Chưa có lịch sử thay đổi</div>
      ) : (
        <div className="history-timeline">
          {logs?.map((log, i) => {
            const cfg = ACTION_CONFIG[log?.action] || ACTION_CONFIG.UPDATE
            return (
              <div key={log?.id} className="history-timeline__item">

                {/* Dot + line */}
                <div className="history-timeline__left">
                  <div
                    className="history-timeline__dot"
                    style={{ background: cfg.color }}
                  />
                  {i < logs?.length - 1 && <div className="history-timeline__line" />}
                </div>

                {/* Nội dung */}
                <div className="history-timeline__content">
                  <div className="history-timeline__meta">
                    <span
                      className="history-timeline__action"
                      style={{ color: cfg.color, background: cfg.bg }}
                    >
                      {cfg.label}
                    </span>
                    <span className="history-timeline__by">
                      bởi <strong>{/* [SỬA] guard: changedBy có thể là object → lấy tên hoặc hiện 'admin' */}
                        {typeof log?.changedBy === 'object'
                          ? log?.changedBy?.fullName || 'admin'
                          : log?.changedBy}
                      </strong></span>
                    {/* <span className="history-timeline__date">{formatDateHistory(log.changedAt)}</span> */}
                    <span className="history-timeline__date">{formatDateHistory(log?.changedAt)}</span>

                  </div>

                  {/* Chi tiết field thay đổi — chỉ có khi UPDATE */}
                  {log?.changedFields?.length > 0 && (
                    <table className="history-table">
                      <thead>
                        <tr>
                          <th>Field</th>
                          <th>Giá trị cũ</th>
                          <th>Giá trị mới</th>
                        </tr>
                      </thead>
                      <tbody>
                        {log?.changedFields.map((f, j) => {
                          const fieldConfig = fieldMap[f.field]
                          return (
                            <tr key={j}>
                              <td><code>{f.field}</code></td>
                              <td className="history-table__old">
                                {formatValue(f.oldValue, fieldConfig,'history')}
                              </td>
                              <td className="history-table__new">
                                {formatValue(f.newValue, fieldConfig,'history')}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="modal__footer">
        <button className="btn btn--outline" onClick={onClose}>Đóng</button>
      </div>

    </Modal>
  )
}

export default memo(HistoryModal)