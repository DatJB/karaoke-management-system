export const mockRooms = [
  { id: 1, name: 'Phòng 101', size: 10, category: 'STANDARD', status: 'AVAILABLE' },
  { id: 2, name: 'Phòng 102', size: 15, category: 'VIP', status: 'OCCUPIED' },
  { id: 3, name: 'Phòng 103', size: 20, category: 'VIP', status: 'RESERVED' },
  { id: 4, name: 'Phòng 104', size: 10, category: 'STANDARD', status: 'MAINTENANCE' },
  { id: 5, name: 'Phòng 201', size: 30, category: 'VIP', status: 'AVAILABLE' },
  { id: 6, name: 'Phòng 202', size: 12, category: 'STANDARD', status: 'OCCUPIED' },
  { id: 7, name: 'Phòng 203', size: 10, category: 'STANDARD', status: 'AVAILABLE' },
  { id: 8, name: 'Phòng 204', size: 25, category: 'VIP', status: 'AVAILABLE' },
];

export const mockProducts = [
  { id: 1, code: 'DR01', name: 'Heineken', category: 'DRINK', price: 45000, stock: 100 },
  { id: 2, code: 'DR02', name: 'Tiger', category: 'DRINK', price: 40000, stock: 150 },
  { id: 3, code: 'FD01', name: 'Mực khô nướng', category: 'FOOD', price: 150000, stock: 30 },
  { id: 4, code: 'FD02', name: 'Trái cây dĩa', category: 'FOOD', price: 200000, stock: 20 },
  { id: 5, code: 'DR03', name: 'Nước suối', category: 'DRINK', price: 20000, stock: 500 },
];

export const mockBookings = [
  { id: 1001, customer_name: 'Nguyễn Văn A', room_name: 'Phòng 102', status: 'CHECKED_IN', checkin_time: '2023-10-27T19:00:00', assigned_staff: ['Lê Văn Phục', 'Phạm Văn Vụ'] },
  { id: 1002, customer_name: 'Trần Thị B', room_name: 'Phòng 202', status: 'CHECKED_OUT', checkin_time: '2023-10-27T20:15:00', checkout_time: '2023-10-27T22:30:00', assigned_staff: ['Phạm Văn Vụ'] },
  { id: 1004, customer_name: 'Trần Thị B', room_name: 'Phòng 204', status: 'CHECKED_IN', checkin_time: '2023-10-27T20:15:00', assigned_staff: [] },
  { id: 1003, customer_name: 'Lê Văn C', room_name: 'Phòng 103', status: 'BOOKED', checkin_time: null, booking_time: '2023-10-28T18:00:00', assigned_staff: [] },
];

export const mockEmployees = [
  { id: 1, name: 'Nguyễn Văn Quản',   role: 'MANAGER',      phone: '0901234567', status: 'AVAILABLE', salary_per_hour: 50000, base_salary: 8000000, cccd: '001090112233' },
  { id: 2, name: 'Trần Thị Tiếp',     role: 'RECEPTIONIST', phone: '0912345678', status: 'AVAILABLE', salary_per_hour: 30000, base_salary: 5000000, cccd: '002090654321' },
  { id: 3, name: 'Lê Văn Phục',       role: 'STAFF',        phone: '0923456789', status: 'BUSY',      salary_per_hour: 25000, base_salary: 4000000, cccd: '033090987654' },
  { id: 4, name: 'Phạm Văn Vụ',       role: 'STAFF',        phone: '0934567890', status: 'OFF',       salary_per_hour: 25000, base_salary: 4000000, cccd: '079090445566' },
];

export const mockInvoices = [
  { id: 5001, room_name: 'Phòng 102', customer_name: 'Nguyễn Văn A', identity: '001090123456', total: 750000, status: 'UNPAID', time: '2023-10-27T19:00:00', duration: '1h 30m' },
  { id: 5002, room_name: 'Phòng 202', customer_name: 'Trần Thị B', identity: '002090654321', total: 1200000, status: 'UNPAID', time: '2023-10-27T20:15:00', duration: '2h 15m' },
  { id: 5003, room_name: 'Phòng 101', customer_name: 'Lý Doãn D', identity: '008088991200', total: 450000, status: 'PAID', time: '2023-10-27T14:00:00', duration: '2h 00m' },
];

export const mockCustomers = [
  { id: 1, name: 'Lê Thanh Bình', phone: '0987654321', tier: 'SILVER', visits: 5 },
  { id: 2, name: 'Nguyễn Thị Hoa', phone: '0912345678', tier: 'GOLD', visits: 12 },
  { id: 3, name: 'Trần Văn Mạnh', phone: '0909123456', tier: 'DIAMOND', visits: 40 },
  { id: 4, name: 'Phạm Đức Anh', phone: '0933456789', tier: 'NORMAL', visits: 1 },
];
