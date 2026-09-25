import React from 'react';
import { 
  Users, 
  TrendingDown, 
  BookOpen, 
  Lock, 
  Presentation, 
  FileText, 
  Video,
  Award,
  CalendarRange
} from 'lucide-react';

export type TabType = 
  | 'reports' 
  | 'struggling' 
  | 'team-plans' 
  | 'exams-plans' 
  | 'lesson-study' 
  | 'directives' 
  | 'meetings'
  | 'timetable'
  | 'emulation';

interface NavigationProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  counts: {
    reportsCount: number;
    strugglingCount: number;
    teamPlansCount: number;
    examsCount: number;
    lessonStudiesCount: number;
    directivesCount: number;
    meetingsCount: number;
    emulationCount: number;
    timetableCount: number;
  };
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onChangeTab,
  counts
}) => {
  const tabs = [
    {
      id: 'reports' as TabType,
      label: 'Trang chính: Báo cáo HS',
      sublabel: 'Sĩ số & HS khuyết tật',
      icon: Users,
      badge: counts.reportsCount,
      color: 'blue'
    },
    {
      id: 'struggling' as TabType,
      label: 'Theo dõi HS Chậm tiến bộ',
      sublabel: 'Kế hoạch phụ đạo từng môn',
      icon: TrendingDown,
      badge: counts.strugglingCount,
      color: 'rose'
    },
    {
      id: 'team-plans' as TabType,
      label: 'Kế hoạch Tổ & PPCT',
      sublabel: 'Tích hợp QPAN, STEM, ĐP',
      icon: BookOpen,
      badge: counts.teamPlansCount,
      color: 'emerald'
    },
    {
      id: 'exams-plans' as TabType,
      label: 'KHDH & Ngân hàng Đề thi',
      sublabel: 'Bảo mật MK Tổ trưởng',
      icon: Lock,
      badge: counts.examsCount,
      color: 'amber',
      isSecret: true
    },
    {
      id: 'lesson-study' as TabType,
      label: 'KHBD & Thảo luận Chuyên đề',
      sublabel: 'Nghiên cứu bài học minh họa',
      icon: Presentation,
      badge: counts.lessonStudiesCount,
      color: 'purple'
    },
    {
      id: 'directives' as TabType,
      label: 'Công văn chỉ đạo',
      sublabel: 'Văn bản chỉ đạo các cấp',
      icon: FileText,
      badge: counts.directivesCount,
      color: 'indigo'
    },
    {
      id: 'meetings' as TabType,
      label: 'Thông báo họp (Zoom)',
      sublabel: 'Địa chỉ phòng Zoom trực tuyến',
      icon: Video,
      badge: counts.meetingsCount,
      color: 'cyan'
    },
    {
      id: 'timetable' as TabType,
      label: 'Thời khóa biểu (TKB)',
      sublabel: 'GV tải lên TKB của lớp',
      icon: CalendarRange,
      badge: counts.timetableCount,
      color: 'teal'
    },
    {
      id: 'emulation' as TabType,
      label: 'Xét thi đua (Excel & Word)',
      sublabel: 'Đính kèm kết quả thi đua',
      icon: Award,
      badge: counts.emulationCount,
      color: 'yellow'
    }
  ];

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 overflow-x-auto no-scrollbar">
        <div className="flex space-x-1 sm:space-x-2 py-2 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onChangeTab(tab.id)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all ${
                  isActive
                    ? 'bg-red-50 text-red-800 border-2 border-red-600 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-2 border-transparent'
                }`}
              >
                <div
                  className={`p-1.5 rounded-lg shrink-0 ${
                    isActive
                      ? 'bg-red-600 text-white'
                      : tab.isSecret
                      ? 'bg-amber-100 text-amber-700'
                      : tab.id === 'meetings'
                      ? 'bg-cyan-100 text-cyan-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="leading-tight">
                  <div className="text-xs font-bold flex items-center gap-1.5">
                    <span>{tab.label}</span>
                    {tab.badge > 0 && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                          isActive
                            ? 'bg-red-600 text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                    {tab.sublabel}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
