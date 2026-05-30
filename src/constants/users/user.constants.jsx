import React from "react";

// Config riêng của Course — phần 20% khác nhau
export const USER_TABLE_COLUMNS = [
  { label: 'Họ và Tên', field: 'fullName' },
  { label: 'Tên Đăng Nhập', field: 'userName' },
  { label: 'Trạng Thái', field: 'status', },
  { label: 'Vai Trò', field: 'role' },
  { label: 'Ngày Tham Gia', field: 'createdAt' }
]

//SORT_OPTIONS
export const USER_SORT_OPTIONS = [
  { value: 'fullName', label: 'Theo Họ và Tên' },
  { value: 'userName', label: 'Theo Tên User' },
  { value: 'status', label: 'Theo Trạng Thái' },
  { value: 'role', label: 'Theo Vai Trò' },
  { value: 'createdAt', label: 'Ngày Tham Gia' },
]
//2. Tùy chọn Trạng thái (Dùng cho DataTable badge và StatusPicker)
export const USER_STATUS_OPTIONS = [
    { value: 'Active', label: 'Active', color: 'green', icon: '🟢' },
    { value: 'Inactive', label: 'Inactive', color: 'red', icon: '🔴' },
    
];