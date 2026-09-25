/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  TeacherMember, 
  MonthlyReport, 
  StrugglingStudent, 
  TeamPlanDocument, 
  ExamAndLessonPlan, 
  LessonStudyTopic, 
  SchoolDirective, 
  MeetingNotice,
  EmulationRecord, 
  EmulationDocument,
  ClassTimetable 
} from '../types';

export const INITIAL_MEMBERS: TeacherMember[] = [
  {
    id: 'gv-1',
    stt: 1,
    name: 'Phan Thị Mỹ Linh',
    birthDate: '16/12/1995',
    isPartyMember: true,
    campus: 'Trường chính',
    assignedClass: '5A1(ĐC)',
    totalStudents: 35,
    femaleStudents: 20,
    yearJoined: 2020,
    isLeader: false,
    phone: '0912 345 601',
    email: 'mylinh.thtanthanh@gmail.com'
  },
  {
    id: 'gv-2',
    stt: 2,
    name: 'Nguyễn Thị Hồng Nguyệt',
    birthDate: '13/07/1971',
    isPartyMember: false,
    campus: 'Trường chính',
    assignedClass: '5A2(ĐC)',
    totalStudents: 36,
    femaleStudents: 13,
    yearJoined: 1996,
    isLeader: false,
    phone: '0912 345 602',
    email: 'hongnguyet.thtanthanh@gmail.com'
  },
  {
    id: 'gv-3',
    stt: 3,
    name: 'Phạm Thị Hồng Nhiên',
    birthDate: '23/03/1996',
    isPartyMember: false,
    campus: 'Trường chính',
    assignedClass: '5A3(ĐC)',
    totalStudents: 35,
    femaleStudents: 16,
    yearJoined: 2024,
    isLeader: false,
    phone: '0912 345 603',
    email: 'hongnhien.thtanthanh@gmail.com'
  },
  {
    id: 'gv-4',
    stt: 4,
    name: 'Phạm Thị Việt Trinh',
    birthDate: '25/07/2000',
    isPartyMember: false,
    campus: 'Trường chính',
    assignedClass: '5A4(ĐC)',
    totalStudents: 36,
    femaleStudents: 19,
    yearJoined: 2026,
    isLeader: false,
    phone: '0912 345 604',
    email: 'viettrinh.thtanthanh@gmail.com'
  },
  {
    id: 'gv-5',
    stt: 5,
    name: 'Đặng Ngọc Kim Ngân',
    birthDate: '10/11/1999',
    isPartyMember: true,
    campus: 'Trường chính',
    assignedClass: 'GV Chuyên trách Khối 5',
    totalStudents: 0,
    femaleStudents: 0,
    yearJoined: 2024,
    isLeader: false,
    phone: '0912 345 605',
    email: 'kimngan.thtanthanh@gmail.com'
  },
  {
    id: 'gv-6',
    stt: 6,
    name: 'Nguyễn Thị Bé Tý',
    birthDate: '17/10/1980',
    isPartyMember: true,
    campus: 'Kiến Bình',
    assignedClass: 'Tổ trưởng Chuyên môn Khối 5',
    totalStudents: 0,
    femaleStudents: 0,
    yearJoined: 2000,
    isLeader: true,
    phone: '0912 345 606',
    email: 'bety.thtanthanh@gmail.com'
  },
  {
    id: 'gv-7',
    stt: 7,
    name: 'Hồ Mộng Tuyết',
    birthDate: '17/10/1973',
    isPartyMember: false,
    campus: 'Kiến Bình',
    assignedClass: '5A(KB)',
    totalStudents: 35,
    femaleStudents: 19,
    yearJoined: 1996,
    isLeader: false,
    phone: '0912 345 607',
    email: 'mongtuyet.thtanthanh@gmail.com'
  },
  {
    id: 'gv-8',
    stt: 8,
    name: 'Lê Thị Mai',
    birthDate: '14/04/1980',
    isPartyMember: true,
    campus: 'Kiến Bình',
    assignedClass: '5B(KB)',
    totalStudents: 11,
    femaleStudents: 5,
    yearJoined: 2000,
    isLeader: false,
    phone: '0912 345 608',
    email: 'thimai.thtanthanh@gmail.com'
  },
  {
    id: 'gv-9',
    stt: 9,
    name: 'Trần Công Minh',
    birthDate: '09/01/1979',
    isPartyMember: true,
    campus: 'Kiến Bình',
    assignedClass: '5C(KB)',
    totalStudents: 31,
    femaleStudents: 14,
    yearJoined: 2000,
    isLeader: false,
    phone: '0912 345 609',
    email: 'congminh.thtanthanh@gmail.com'
  },
  {
    id: 'gv-10',
    stt: 10,
    name: 'Nguyễn Hoàng Tuấn',
    birthDate: '21/05/1965',
    isPartyMember: false,
    campus: 'Tân Bình',
    assignedClass: '5A(TB)',
    totalStudents: 31,
    femaleStudents: 15,
    yearJoined: 1985,
    isLeader: false,
    phone: '0912 345 610',
    email: 'hoangtuan.thtanthanh@gmail.com'
  },
  {
    id: 'gv-11',
    stt: 11,
    name: 'Nguyễn Thị Huế',
    birthDate: '31/01/1979',
    isPartyMember: true,
    campus: 'Tân Bình',
    assignedClass: '5B(TB)',
    totalStudents: 16,
    femaleStudents: 8,
    yearJoined: 2002,
    isLeader: false,
    phone: '0912 345 611',
    email: 'thihue.thtanthanh@gmail.com'
  },
  {
    id: 'gv-12',
    stt: 12,
    name: 'Pho Thị Bích Ngân',
    birthDate: '18/06/1999',
    isPartyMember: true,
    campus: 'Tân Hòa',
    assignedClass: '5A1',
    totalStudents: 26,
    femaleStudents: 12,
    yearJoined: 2024,
    isLeader: false,
    phone: '0912 345 612',
    email: 'bichngan.thtanthanh@gmail.com'
  },
  {
    id: 'gv-13',
    stt: 13,
    name: 'Lê Văn Hồng',
    birthDate: '18/09/1972',
    isPartyMember: true,
    campus: 'Tân Hòa',
    assignedClass: '5A2',
    totalStudents: 28,
    femaleStudents: 11,
    yearJoined: 1995,
    isLeader: false,
    phone: '0912 345 613',
    email: 'vanhong.thtanthanh@gmail.com'
  },
  {
    id: 'gv-14',
    stt: 14,
    name: 'Trương Thị Loan',
    birthDate: '05/12/1970',
    isPartyMember: true,
    campus: 'Tân Hòa',
    assignedClass: '5B(TH)',
    totalStudents: 22,
    femaleStudents: 10,
    yearJoined: 1991,
    isLeader: false,
    phone: '0912 345 614',
    email: 'thiloan.thtanthanh@gmail.com'
  },
  {
    id: 'gv-15',
    stt: 15,
    name: 'Trần Thị Phương Giang',
    birthDate: '05/06/1982',
    isPartyMember: true,
    campus: 'Đinh Văn Phu',
    assignedClass: 'Lớp 5',
    totalStudents: 32,
    femaleStudents: 18,
    yearJoined: 2004,
    isLeader: false,
    phone: '0912 345 615',
    email: 'phuonggiang.thtanthanh@gmail.com'
  }
];

// Khởi tạo các mảng dữ liệu trống - Không dùng dữ liệu mẫu giả định
// Tất cả tài liệu, TKB, KHDH, đề thi, công văn, thi đua chỉ hiển thị khi giáo viên tải lên và được lưu trữ lâu dài
export const INITIAL_MONTHLY_REPORTS: MonthlyReport[] = [];
export const INITIAL_STRUGGLING_STUDENTS: StrugglingStudent[] = [];
export const INITIAL_TEAM_DOCUMENTS: TeamPlanDocument[] = [];
export const INITIAL_EXAMS_AND_PLANS: ExamAndLessonPlan[] = [];
export const INITIAL_LESSON_STUDIES: LessonStudyTopic[] = [];
export const INITIAL_DIRECTIVES: SchoolDirective[] = [];
export const INITIAL_MEETINGS: MeetingNotice[] = [];
export const INITIAL_EMULATIONS: EmulationRecord[] = [];
export const INITIAL_EMULATION_DOCUMENTS: EmulationDocument[] = [];
export const INITIAL_TIMETABLES: ClassTimetable[] = [];

// Khung Thời Khóa Biểu tiêu chuẩn (Tham khảo khi giáo viên lập TKB mới)
export const STANDARD_TIMETABLE_GRID: Record<string, string> = {
  'Sang_Thứ Hai_1': 'Sinh hoạt dưới cờ',
  'Sang_Thứ Hai_2': 'Tiếng Việt (Đọc)',
  'Sang_Thứ Hai_3': 'Toán',
  'Sang_Thứ Hai_4': 'Đạo đức',
  'Chieu_Thứ Hai_1': 'Tiếng Anh',
  'Chieu_Thứ Hai_2': 'Tin học & Công nghệ',
  'Chieu_Thứ Hai_3': 'Hoạt động trải nghiệm',

  'Sang_Thứ Ba_1': 'Toán',
  'Sang_Thứ Ba_2': 'Tiếng Việt (Viết)',
  'Sang_Thứ Ba_3': 'Lịch sử & Địa lý',
  'Sang_Thứ Ba_4': 'Khoa học',
  'Chieu_Thứ Ba_1': 'Giáo dục thể chất',
  'Chieu_Thứ Ba_2': 'Mĩ thuật',
  'Chieu_Thứ Ba_3': 'Tự học có hướng dẫn',

  'Sang_Thứ Tư_1': 'Tiếng Việt (Luyện từ & câu)',
  'Sang_Thứ Tư_2': 'Toán',
  'Sang_Thứ Tư_3': 'Tiếng Anh',
  'Sang_Thứ Tư_4': 'Âm nhạc',
  'Chieu_Thứ Tư_1': 'Tích hợp GDQP-AN / STEM',
  'Chieu_Thứ Tư_2': 'Khoa học',
  'Chieu_Thứ Tư_3': 'Phụ đạo Toán & Tiếng Việt',

  'Sang_Thứ Năm_1': 'Toán',
  'Sang_Thứ Năm_2': 'Tiếng Việt (Đọc)',
  'Sang_Thứ Năm_3': 'Lịch sử & Địa lý',
  'Sang_Thứ Năm_4': 'Giáo dục địa phương',
  'Chieu_Thứ Năm_1': 'Tiếng Anh',
  'Chieu_Thứ Năm_2': 'Giáo dục thể chất',
  'Chieu_Thứ Năm_3': 'Hoạt động trải nghiệm',

  'Sang_Thứ Sáu_1': 'Tiếng Việt (Viết)',
  'Sang_Thứ Sáu_2': 'Toán',
  'Sang_Thứ Sáu_3': 'Tiếng Anh',
  'Sang_Thứ Sáu_4': 'Tin học & Công nghệ',
  'Chieu_Thứ Sáu_1': 'Kỹ năng sống / STEM',
  'Chieu_Thứ Sáu_2': 'Ôn tập củng cố tuần',
  'Chieu_Thứ Sáu_3': 'Sinh hoạt lớp (Tổng kết tuần)'
};

export const INITIAL_APP_SETTINGS = {
  headerTitle: 'UBND Xã Tân Thạnh – Trường Tiểu Học Tân Thạnh – Tổ Khối 5',
  schoolName: 'TRƯỜNG TIỂU HỌC TÂN THẠNH',
  teamName: 'TỔ CHUYÊN MÔN KHỐI 5',
  academicYear: 'NĂM HỌC 2026-2027',
  communeName: 'UBND XÃ TÂN THẠNH',
  secretPasswordLeader: 'Tt112233'
};
