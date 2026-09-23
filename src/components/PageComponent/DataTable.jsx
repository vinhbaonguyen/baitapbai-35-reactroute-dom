import React, { memo, useMemo } from 'react'
import './PageComponent.scss'
import { useSelector } from 'react-redux';
import { Reorder } from 'framer-motion'
import { renderCell } from './../common/table/tableRender.jsx';
import { buildFieldMap } from '../../utils/field.util';

function DataTable({ keyField, columns, data = [],
  onEdit, onDelete, onHistory, onArchive,
  currentPage, itemsPerPage, onReorder,
  onView, // đối với Component nào cần show DetailModal thì truyền props này ví dụ như Lecture
  onCellAction, // đối với Component nào cần hiển thị data liên kết ví dụ như Class mỗi Class hiển thị danh sách sinh viên
  disableSelfEdit = false, // ✅ mặc định false — chỉ User page truyền true
  fields
}) {
  const currentUser = useSelector(state => state.auth.currentUser)
  // console.log(currentUser);
  const currentUserRole = currentUser?.role

  const canEdit = ['ADMIN', 'MANAGER'].includes(currentUserRole)
  const canDelete = ['ADMIN'].includes(currentUserRole)

  const fieldMap = useMemo(() => buildFieldMap(fields), [fields])

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>No</th>
            {columns?.map(col => <th key={col.field}>{col.label}</th>)}
            <th>Hành Động</th>
          </tr>
        </thead>
        <Reorder.Group as='tbody' axis='y' values={data} onReorder={onReorder}>
          {data?.length > 0
            ? data?.map((row, i) => (
              console.log("Row Data:", row),
              <Reorder.Item as='tr' key={row[keyField]} value={row} style={{ cursor: 'grab' }}>
                <td>
                  {(currentPage - 1) * itemsPerPage + i + 1}
                </td>
                {columns.map(col => (
                  <td key={col.field}>
                    {col.type === 'countModal' && onCellAction ? (
                      <button
                        type="button"
                        className="btn btn--outline btn--students"
                        onClick={() => onCellAction(col, row)}
                      >
                        👥 {row[col.relationKey]?.length || 0} SV
                      </button>
                    ) : (
                      renderCell(col, row, fieldMap)
                    )}
                  </td>
                ))}
                <td>
                  <div className="action-cell">
                    {onView && (
                      <button
                        className='btn btn--view'
                        onClick={() => onView(row)}
                      >
                        View More
                      </button>
                    )}
                    {canEdit && onEdit && (
                      <button
                        className="btn btn--outline btn--action"
                        onClick={() => onEdit(row)}
                        disabled={disableSelfEdit && row.id === currentUser?.id}
                        title={disableSelfEdit && row.id === currentUser?.id ? 'Không thể edit chính mình' : ''}
                      >
                        Edit
                      </button>)}
                    {canDelete && onDelete &&
                      (<button
                        className="btn btn--danger"
                        onClick={() => onDelete(keyField, row[keyField])}
                      >
                        Delete
                      </button>)}
                    {onArchive && (
                      <button
                        className="btn btn--archive"
                        onClick={() => onArchive(row)}
                      >
                        📦 Archive
                      </button>
                    )}
                    {onHistory &&
                      (<button
                        className="btn btn--history"
                        onClick={() => onHistory(row)}>
                        History
                      </button>
                      )}
                  </div>
                </td>
              </Reorder.Item>
            ))
            : (<tr>
              <td colSpan={columns?.length + 2} className="table__empty">
                Không có dữ liệu
              </td>
            </tr>)
          }
        </Reorder.Group>
      </table>
    </div>
  )
}
export default memo(DataTable);