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
  sortOrder }) {
  return (
    <div className="toolbar">
      <button className='btn btn--primary' onClick={onAdd}>
        Thêm Mới
      </button>
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
          <option value='default'>Lựa Chọn</option>
          {sortOptions?.map(opt =>
            <option key={opt.value} value={opt.value}>{opt.label}</option>
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