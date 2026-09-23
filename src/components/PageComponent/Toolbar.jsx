import React, { memo } from 'react'
import './PageComponent.scss'

function Toolbar({
  onAdd,
  search,
  onSearch,
  sortField,
  onSortField,
  toggleSortOrder,
  sortOptions,
  sortOrder,
  filters = []

}) {
  return (
    <div className="toolbar">
      {
        onAdd && (
          <button className='btn btn--primary' onClick={onAdd}>
            Thêm Mới
          </button>
        )}

      {/* Render động các dropdown filter -> trang nào không cần thì không truyền, tự ẩn */}
      {
        filters.map(f => (
          <>
            <label className='toolbar__label'>Bộ Lọc theo</label>
            <select
              key={f.key}
              className='toolbar__select'
              value={f.value}
              onChange={e => f.onChange(e.target.value)}
            >
              {f.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </>
        ))
      }
      <input
        className='toolbar__search'
        type='text'
        placeholder='Nhập từ khóa tìm kiếm...'
        value={search}
        onChange={e => onSearch(e.target.value)}
      />
      <div className="toolbar__sort">
        <label className='toolbar__label'>Sắp Xếp</label>
        <select
          className='toolbar__select'
          value={sortField}
          onChange={e => onSortField(e.target.value)}
        >
          <option value='default'>
            Lựa Chọn
          </option>
          {sortOptions?.map(opt =>
            <option
              key={opt.value}
              value={opt.value}
            >
              {opt.label}
            </option>
          )}
        </select>
        <button
          onClick={() => toggleSortOrder(sortField)}
          disabled={!sortField || sortField === 'default'}
        >
          {sortOrder === 'asc' ? '↑' : '↓'}

        </button>
      </div>
    </div>
  )
}

export default memo(Toolbar)