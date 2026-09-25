/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  TeacherMember, 
  MonthlyReport, 
  StrugglingStudent, 
  TeamPlanDocument, 
  ExamAndLessonPlan, 
  LessonStudyTopic, 
  LessonStudyFeedback,
  SchoolDirective, 
  MeetingNotice,
  EmulationRecord,
  EmulationDocument,
  ClassTimetable
} from './types';
import { 
  INITIAL_MEMBERS, 
  INITIAL_MONTHLY_REPORTS, 
  INITIAL_STRUGGLING_STUDENTS, 
  INITIAL_TEAM_DOCUMENTS, 
  INITIAL_EXAMS_AND_PLANS, 
  INITIAL_LESSON_STUDIES, 
  INITIAL_DIRECTIVES, 
  INITIAL_MEETINGS,
  INITIAL_EMULATIONS, 
  INITIAL_TIMETABLES,
  INITIAL_APP_SETTINGS 
} from './data/initialData';

import { 
  loadPersistentData, 
  savePersistentData, 
  clearAllPersistentData,
  downloadBackupFile
} from './utils/persistentStorage';

import {
  getActiveUserEmail,
  setActiveUserEmail,
  pushDataToOnlineServer,
  pullDataFromOnlineServer,
  checkServerSyncStatus,
  subscribeToOnlineUpdates,
  sendBeaconSync,
  getLastKnownRevision
} from './utils/onlineSync';

import {
  subscribeToAllFirestoreData,
  saveReportToFirestore,
  deleteReportFromFirestore,
  saveStudentToFirestore,
  deleteStudentFromFirestore,
  saveTeamDocToFirestore,
  deleteTeamDocFromFirestore,
  saveExamToFirestore,
  deleteExamFromFirestore,
  saveLessonStudyToFirestore,
  deleteLessonStudyFromFirestore,
  saveDirectiveToFirestore,
  deleteDirectiveFromFirestore,
  saveMeetingToFirestore,
  deleteMeetingFromFirestore,
  saveEmulationToFirestore,
  deleteEmulationFromFirestore,
  saveTimetableToFirestore,
  deleteTimetableFromFirestore,
  saveFullStateToFirestore
} from './firebase/firestoreService';

import { Header } from './components/Header';
import { SyncMemorizeBar } from './components/SyncMemorizeBar';
import { Navigation, TabType } from './components/Navigation';
import { Home, Sparkles } from 'lucide-react';
import { MonthlyReportView } from './components/MonthlyReportView';
import { StrugglingStudentsView } from './components/StrugglingStudentsView';
import { TeamDocumentsView } from './components/TeamDocumentsView';
import { ExamAndLessonPlansView } from './components/ExamAndLessonPlansView';
import { LessonStudyView } from './components/LessonStudyView';
import { DirectivesView } from './components/DirectivesView';
import { MeetingNoticesView } from './components/MeetingNoticesView';
import { EmulationEvaluationView } from './components/EmulationEvaluationView';
import { ClassTimetableView } from './components/ClassTimetableView';
import { MemberManagementModal } from './components/MemberManagementModal';
import { PromptModal } from './components/PromptModal';
import { BackupRestoreModal } from './components/BackupRestoreModal';

// Sanitizer to guarantee absolute separation between Tổ trưởng Nguyễn Thị Bé Tý and GVCN Phan Thị Mỹ Linh (5A1(ĐC))
export const sanitizeMonthlyReport = (
  r: MonthlyReport, 
  allMembers: TeacherMember[]
): MonthlyReport => {
  const leader = allMembers.find(m => m.isLeader || m.name === 'Nguyễn Thị Bé Tý');
  const leaderName = leader?.name || 'Nguyễn Thị Bé Tý';
  const myLinh = allMembers.find(m => m.name === 'Phan Thị Mỹ Linh' || m.id === 'gv-1');

  // Case 1: Any report for Class 5A1(ĐC) or with gv-1 MUST have GVCN Phan Thị Mỹ Linh
  if (
    r.className === '5A1(ĐC)' || 
    r.classId === 'gv-1' || 
    r.teacherId === 'gv-1' ||
    (r.className && r.className.includes('5A1'))
  ) {
    return {
      ...r,
      classId: myLinh?.id || 'gv-1',
      className: '5A1(ĐC)',
      teacherId: myLinh?.id || 'gv-1',
      teacherName: 'Phan Thị Mỹ Linh',
      campus: myLinh?.campus || 'Trường chính',
      reviewedBy: r.status === 'Đã duyệt' ? (r.reviewedBy || `Tổ trưởng ${leaderName}`) : r.reviewedBy
    };
  }

  // Case 2: If a report was mistakenly marked with teacherName: 'Nguyễn Thị Bé Tý' or teacherId: 'gv-6' or className: 'Tổ trưởng Chuyên môn Khối 5'
  // (Since Cô Nguyễn Thị Bé Tý is the Tổ trưởng, not a classroom teacher, any report under her name was submitted by confusion for 5A1 or another class)
  if (
    r.teacherName === 'Nguyễn Thị Bé Tý' || 
    r.teacherId === 'gv-6' || 
    (r.className && r.className.includes('Tổ trưởng'))
  ) {
    const matchedHomeroom = allMembers.find(
      m => !m.isLeader && (m.id === r.classId || m.assignedClass === r.className)
    );
    if (matchedHomeroom) {
      return {
        ...r,
        classId: matchedHomeroom.id,
        className: matchedHomeroom.assignedClass,
        teacherId: matchedHomeroom.id,
        teacherName: matchedHomeroom.name,
        campus: matchedHomeroom.campus,
        reviewedBy: `Tổ trưởng ${leaderName}`
      };
    }

    return {
      ...r,
      classId: myLinh?.id || 'gv-1',
      className: '5A1(ĐC)',
      teacherId: myLinh?.id || 'gv-1',
      teacherName: 'Phan Thị Mỹ Linh',
      campus: myLinh?.campus || 'Trường chính',
      reviewedBy: `Tổ trưởng ${leaderName}`
    };
  }

  // Case 3: Ensure other reports match their teacher by teacherId or className
  const targetTeacher = allMembers.find(m => m.id === r.teacherId || m.assignedClass === r.className);
  if (targetTeacher && !targetTeacher.isLeader) {
    return {
      ...r,
      classId: targetTeacher.id,
      className: targetTeacher.assignedClass,
      teacherId: targetTeacher.id,
      teacherName: targetTeacher.name,
      campus: targetTeacher.campus
    };
  }

  return r;
};

export default function App() {
  // App Settings
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('tanthanh_k5_settings');
    return saved ? JSON.parse(saved) : INITIAL_APP_SETTINGS;
  });

  // Leader Secret Password (Default: Tt112233 - exclusive to Cô Nguyễn Thị Bé Tý)
  const [secretPasswordLeader, setSecretPasswordLeader] = useState<string>(() => {
    return localStorage.getItem('tanthanh_k5_leader_pass') || 'Tt112233';
  });

  // Members list (ensure Nguyễn Thị Bé Tý is Tổ trưởng, Phan Thị Mỹ Linh is 5A1(ĐC))
  const [members, setMembers] = useState<TeacherMember[]>(() => {
    const saved = localStorage.getItem('tanthanh_k5_members');
    if (!saved) return INITIAL_MEMBERS;
    try {
      const parsed: TeacherMember[] = JSON.parse(saved);
      return parsed.map(m => {
        if (m.id === 'gv-6' || m.name === 'Nguyễn Thị Bé Tý') {
          return { ...m, isLeader: true, assignedClass: 'Tổ trưởng Chuyên môn Khối 5' };
        }
        if (m.id === 'gv-1' || m.name === 'Phan Thị Mỹ Linh') {
          return { 
            ...m, 
            isLeader: false, 
            assignedClass: '5A1(ĐC)' 
          };
        }
        return m;
      });
    } catch {
      return INITIAL_MEMBERS;
    }
  });

  // Current active user (defaults to leader Cô Nguyễn Thị Bé Tý)
  const [currentUser, setCurrentUser] = useState<TeacherMember>(() => {
    return members.find(m => m.name === 'Nguyễn Thị Bé Tý' || m.isLeader) || members[0];
  });

  // Navigation tab
  const [activeTab, setActiveTab] = useState<TabType>('reports');

  // Module data states (healed with sanitizeMonthlyReport)
  const [reports, setReports] = useState<MonthlyReport[]>(() => {
    const saved = localStorage.getItem('tanthanh_k5_reports');
    if (!saved) return INITIAL_MONTHLY_REPORTS;
    try {
      const parsed: MonthlyReport[] = JSON.parse(saved);
      return parsed.map(r => sanitizeMonthlyReport(r, INITIAL_MEMBERS));
    } catch {
      return INITIAL_MONTHLY_REPORTS;
    }
  });

  const [strugglingStudents, setStrugglingStudents] = useState<StrugglingStudent[]>(() => {
    const saved = localStorage.getItem('tanthanh_k5_struggling');
    return saved ? JSON.parse(saved) : INITIAL_STRUGGLING_STUDENTS;
  });

  const [teamDocuments, setTeamDocuments] = useState<TeamPlanDocument[]>(() => {
    const saved = localStorage.getItem('tanthanh_k5_team_docs');
    return saved ? JSON.parse(saved) : INITIAL_TEAM_DOCUMENTS;
  });

  const [examsAndPlans, setExamsAndPlans] = useState<ExamAndLessonPlan[]>(() => {
    const saved = localStorage.getItem('tanthanh_k5_exams');
    return saved ? JSON.parse(saved) : INITIAL_EXAMS_AND_PLANS;
  });

  const [lessonStudies, setLessonStudies] = useState<LessonStudyTopic[]>(() => {
    const saved = localStorage.getItem('tanthanh_k5_lesson_studies');
    return saved ? JSON.parse(saved) : INITIAL_LESSON_STUDIES;
  });

  // Separated: Directives (Công văn chỉ đạo)
  const [directives, setDirectives] = useState<SchoolDirective[]>(() => {
    const saved = localStorage.getItem('tanthanh_k5_directives');
    return saved ? JSON.parse(saved) : INITIAL_DIRECTIVES;
  });

  // Separated: Meetings (Thông báo họp Zoom)
  const [meetings, setMeetings] = useState<MeetingNotice[]>(() => {
    const saved = localStorage.getItem('tanthanh_k5_meetings');
    return saved ? JSON.parse(saved) : INITIAL_MEETINGS;
  });

  // Emulation records & uploaded documents
  const [emulations, setEmulations] = useState<EmulationRecord[]>(() => {
    const saved = localStorage.getItem('tanthanh_k5_emulations');
    return saved ? JSON.parse(saved) : INITIAL_EMULATIONS;
  });

  const [emulationDocuments, setEmulationDocuments] = useState<EmulationDocument[]>(() => {
    const saved = localStorage.getItem('tanthanh_k5_emulation_docs');
    return saved ? JSON.parse(saved) : [];
  });

  // Timetables (Thời khóa biểu - only shows when teachers upload)
  const [timetables, setTimetables] = useState<ClassTimetable[]>(() => {
    const saved = localStorage.getItem('tanthanh_k5_timetables');
    return saved ? JSON.parse(saved) : INITIAL_TIMETABLES;
  });

  // Modals state
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showPromptModal, setShowPromptModal] = useState<boolean>(false);
  const [showBackupModal, setShowBackupModal] = useState<boolean>(false);

  // Online Sync & Multi-Account Sharing states
  const [userEmail, setUserEmail] = useState<string>(() => {
    return getActiveUserEmail('lbgthaoso@gmail.com');
  });
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [activePeers, setActivePeers] = useState<number>(1);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [lastSavedBy, setLastSavedBy] = useState<string | null>(null);

  // Asynchronously hydrate from IndexedDB on startup (long-term persistent storage)
  const reloadAllDataFromStorage = useCallback(async () => {
    try {
      const [
        savedSettings,
        savedPass,
        savedMembers,
        savedReports,
        savedStruggling,
        savedTeamDocs,
        savedExams,
        savedLessons,
        savedDirectives,
        savedMeetings,
        savedEmulations,
        savedEmuDocs,
        savedTimetables
      ] = await Promise.all([
        loadPersistentData('settings', INITIAL_APP_SETTINGS),
        loadPersistentData('leader_pass', 'Tt112233'),
        loadPersistentData('members', INITIAL_MEMBERS),
        loadPersistentData('reports', INITIAL_MONTHLY_REPORTS),
        loadPersistentData('struggling', INITIAL_STRUGGLING_STUDENTS),
        loadPersistentData('team_docs', INITIAL_TEAM_DOCUMENTS),
        loadPersistentData('exams', INITIAL_EXAMS_AND_PLANS),
        loadPersistentData('lesson_studies', INITIAL_LESSON_STUDIES),
        loadPersistentData('directives', INITIAL_DIRECTIVES),
        loadPersistentData('meetings', INITIAL_MEETINGS),
        loadPersistentData('emulations', INITIAL_EMULATIONS),
        loadPersistentData('emulation_docs', [] as EmulationDocument[]),
        loadPersistentData('timetables', INITIAL_TIMETABLES)
      ]);

      if (savedSettings) setSettings(savedSettings);
      if (savedPass) setSecretPasswordLeader(savedPass);
      let currentMembersList = members;
      if (savedMembers && savedMembers.length > 0) {
        currentMembersList = savedMembers.map(m => {
          if (m.id === 'gv-6' || m.name === 'Nguyễn Thị Bé Tý') {
            return { ...m, isLeader: true, assignedClass: 'Tổ trưởng Chuyên môn Khối 5' };
          }
          if (m.id === 'gv-1' || m.name === 'Phan Thị Mỹ Linh') {
            return { ...m, isLeader: false, assignedClass: '5A1(ĐC)' };
          }
          return m;
        });
        setMembers(currentMembersList);
        const currentFound = currentMembersList.find(m => m.name === 'Nguyễn Thị Bé Tý' || m.isLeader) || currentMembersList[0];
        setCurrentUser(currentFound);
      }
      if (savedReports && savedReports.length > 0) {
        setReports(savedReports.map(r => sanitizeMonthlyReport(r, currentMembersList)));
      } else if (savedReports) {
        setReports(savedReports);
      }
      if (savedStruggling) setStrugglingStudents(savedStruggling);
      if (savedTeamDocs) setTeamDocuments(savedTeamDocs);
      if (savedExams) setExamsAndPlans(savedExams);
      if (savedLessons) setLessonStudies(savedLessons);
      if (savedDirectives) setDirectives(savedDirectives);
      if (savedMeetings) setMeetings(savedMeetings);
      if (savedEmulations) setEmulations(savedEmulations);
      if (savedEmuDocs) setEmulationDocuments(savedEmuDocs);
      if (savedTimetables) setTimetables(savedTimetables);
    } catch (err) {
      console.warn('Error loading from persistent storage, using current memory state', err);
    }
  }, []);

  useEffect(() => {
    reloadAllDataFromStorage();
  }, [reloadAllDataFromStorage]);

  // Self-healing migration for reports: ensure 5A1 is mapped to Phan Thị Mỹ Linh, not Nguyễn Thị Bé Tý
  useEffect(() => {
    setReports(prev => {
      let changed = false;
      const healed = prev.map(r => {
        const fixed = sanitizeMonthlyReport(r, members);
        if (
          fixed.teacherName !== r.teacherName || 
          fixed.className !== r.className || 
          fixed.teacherId !== r.teacherId
        ) {
          changed = true;
          return fixed;
        }
        return r;
      });
      if (changed) {
        localStorage.setItem('tanthanh_k5_reports', JSON.stringify(healed));
        savePersistentData('reports', healed);
        return healed;
      }
      return prev;
    });
  }, [members]);

  // Sync to IndexedDB persistent storage whenever state changes
  useEffect(() => {
    savePersistentData('settings', settings);
  }, [settings]);

  useEffect(() => {
    savePersistentData('leader_pass', secretPasswordLeader);
  }, [secretPasswordLeader]);

  useEffect(() => {
    savePersistentData('members', members);
    const found = members.find(m => m.id === currentUser.id);
    if (found) setCurrentUser(found);
  }, [members]);

  useEffect(() => {
    savePersistentData('reports', reports);
  }, [reports]);

  useEffect(() => {
    savePersistentData('struggling', strugglingStudents);
  }, [strugglingStudents]);

  useEffect(() => {
    savePersistentData('team_docs', teamDocuments);
  }, [teamDocuments]);

  useEffect(() => {
    savePersistentData('exams', examsAndPlans);
  }, [examsAndPlans]);

  useEffect(() => {
    savePersistentData('lesson_studies', lessonStudies);
  }, [lessonStudies]);

  useEffect(() => {
    savePersistentData('directives', directives);
  }, [directives]);

  useEffect(() => {
    savePersistentData('meetings', meetings);
  }, [meetings]);

  useEffect(() => {
    savePersistentData('emulations', emulations);
  }, [emulations]);

  useEffect(() => {
    savePersistentData('emulation_docs', emulationDocuments);
  }, [emulationDocuments]);

  // Construct current full payload for saving & online sharing
  const getCurrentFullDataPayload = useCallback(() => {
    return {
      settings,
      leader_pass: secretPasswordLeader,
      members,
      reports,
      struggling: strugglingStudents,
      team_docs: teamDocuments,
      exams: examsAndPlans,
      lesson_studies: lessonStudies,
      directives,
      meetings,
      emulations,
      emulation_docs: emulationDocuments,
      timetables
    };
  }, [
    settings,
    secretPasswordLeader,
    members,
    reports,
    strugglingStudents,
    teamDocuments,
    examsAndPlans,
    lessonStudies,
    directives,
    meetings,
    emulations,
    emulationDocuments,
    timetables
  ]);

  const isApplyingRemoteUpdateRef = useRef(false);
  const isInitialLoadedRef = useRef(false);

  // Apply server data received via real-time SSE stream or pull
  const applyIncomingServerData = useCallback((sData: any, authorName?: string, authorEmail?: string) => {
    if (!sData || typeof sData !== 'object') return;
    isApplyingRemoteUpdateRef.current = true;

    if (sData.settings) setSettings(sData.settings);
    if (sData.leader_pass) setSecretPasswordLeader(sData.leader_pass);

    let activeMembers = members;
    if (sData.members && sData.members.length > 0) {
      activeMembers = sData.members.map((m: TeacherMember) => {
        if (m.id === 'gv-6' || m.name === 'Nguyễn Thị Bé Tý') {
          return { ...m, isLeader: true, assignedClass: 'Tổ trưởng Chuyên môn Khối 5' };
        }
        if (m.id === 'gv-1' || m.name === 'Phan Thị Mỹ Linh') {
          return { ...m, isLeader: false, assignedClass: '5A1(ĐC)' };
        }
        return m;
      });
      setMembers(activeMembers);
    }

    if (sData.reports && Array.isArray(sData.reports) && sData.reports.length > 0) {
      setReports(sData.reports.map((r: MonthlyReport) => sanitizeMonthlyReport(r, activeMembers)));
    }
    if (sData.struggling && Array.isArray(sData.struggling)) {
      setStrugglingStudents(sData.struggling);
    }
    if (sData.team_docs && Array.isArray(sData.team_docs)) {
      setTeamDocuments(sData.team_docs);
    }
    if (sData.exams && Array.isArray(sData.exams)) {
      setExamsAndPlans(sData.exams);
    }
    if (sData.lesson_studies && Array.isArray(sData.lesson_studies)) {
      setLessonStudies(sData.lesson_studies);
    }
    if (sData.directives && Array.isArray(sData.directives)) {
      setDirectives(sData.directives);
    }
    if (sData.meetings && Array.isArray(sData.meetings)) {
      setMeetings(sData.meetings);
    }
    if (sData.emulations && Array.isArray(sData.emulations)) {
      setEmulations(sData.emulations);
    }
    if (sData.emulation_docs && Array.isArray(sData.emulation_docs)) {
      setEmulationDocuments(sData.emulation_docs);
    }
    if (sData.timetables && Array.isArray(sData.timetables)) {
      setTimetables(sData.timetables);
    }

    const nowStr = new Date().toLocaleTimeString('vi-VN');
    setLastSavedTime(nowStr);
    if (authorName) {
      setLastSavedBy(`${authorName}${authorEmail ? ` (${authorEmail})` : ''}`);
    }

    setTimeout(() => {
      isApplyingRemoteUpdateRef.current = false;
    }, 400);
  }, [members]);

  // Pull latest updates from online server (shared across email accounts)
  const handlePullOnlineUpdates = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsSyncing(true);
    try {
      const res = await pullDataFromOnlineServer(userEmail, currentUser.name);
      setIsOnline(true);
      if (res.data && Object.keys(res.data).length > 0) {
        applyIncomingServerData(
          res.data,
          res.metadata?.lastUpdatedByName,
          res.metadata?.lastUpdatedByEmail
        );
      }
    } catch (err) {
      console.warn('[OnlineSync] Failed to pull online updates:', err);
    } finally {
      if (!isSilent) setIsSyncing(false);
    }
  }, [userEmail, currentUser.name, applyIncomingServerData]);

  // Command: Ghi nhớ & Lưu tất cả ngay (trước khi thoát)
  const handleManualSaveAndMemorize = async () => {
    setIsSyncing(true);
    try {
      const payload = getCurrentFullDataPayload();
      // 1. Force flush to persistent local storage (IndexedDB)
      await Promise.all([
        savePersistentData('settings', payload.settings),
        savePersistentData('leader_pass', payload.leader_pass),
        savePersistentData('members', payload.members),
        savePersistentData('reports', payload.reports),
        savePersistentData('struggling', payload.struggling),
        savePersistentData('team_docs', payload.team_docs),
        savePersistentData('exams', payload.exams),
        savePersistentData('lesson_studies', payload.lesson_studies),
        savePersistentData('directives', payload.directives),
        savePersistentData('meetings', payload.meetings),
        savePersistentData('emulations', payload.emulations),
        savePersistentData('emulation_docs', payload.emulation_docs),
        savePersistentData('timetables', payload.timetables)
      ]);

      // 2. Push to Online Server for all shared email accounts
      await pushDataToOnlineServer(payload, userEmail, currentUser.name);
      setIsOnline(true);
      const nowStr = new Date().toLocaleTimeString('vi-VN');
      setLastSavedTime(nowStr);
      setLastSavedBy(`${currentUser.name} (${userEmail})`);
    } catch (err) {
      console.warn('[OnlineSync] Push fallback to local storage:', err);
      const nowStr = new Date().toLocaleTimeString('vi-VN');
      setLastSavedTime(nowStr);
      setLastSavedBy(`${currentUser.name} (Bộ nhớ máy)`);
    } finally {
      setIsSyncing(false);
    }
  };

  // Switch active email
  const handleUserEmailChange = (newEmail: string) => {
    const cleaned = newEmail.trim();
    if (cleaned) {
      setUserEmail(cleaned);
      setActiveUserEmail(cleaned);
    }
  };

  // Exit protection: Auto-save before browser unload or visibility hidden
  useEffect(() => {
    const handleBeforeUnload = () => {
      const payload = getCurrentFullDataPayload();
      sendBeaconSync(payload, userEmail, currentUser.name);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        const payload = getCurrentFullDataPayload();
        sendBeaconSync(payload, userEmail, currentUser.name);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [getCurrentFullDataPayload, userEmail, currentUser.name]);

  // Google Cloud Firestore Real-time multi-device synchronization
  useEffect(() => {
    const unsubscribeFirestore = subscribeToAllFirestoreData({
      onReportsUpdate: (firestoreReports) => {
        if (firestoreReports && firestoreReports.length > 0) {
          setReports(firestoreReports.map(r => sanitizeMonthlyReport(r, members)));
          setIsOnline(true);
        }
      },
      onStrugglingUpdate: (firestoreStudents) => {
        if (firestoreStudents && firestoreStudents.length > 0) {
          setStrugglingStudents(firestoreStudents);
          setIsOnline(true);
        }
      },
      onTeamDocsUpdate: (firestoreDocs) => {
        if (firestoreDocs && firestoreDocs.length > 0) {
          setTeamDocuments(firestoreDocs);
        }
      },
      onExamsUpdate: (firestoreExams) => {
        if (firestoreExams && firestoreExams.length > 0) {
          setExamsAndPlans(firestoreExams);
        }
      },
      onLessonStudiesUpdate: (firestoreStudies) => {
        if (firestoreStudies && firestoreStudies.length > 0) {
          setLessonStudies(firestoreStudies);
        }
      },
      onDirectivesUpdate: (firestoreDirectives) => {
        if (firestoreDirectives && firestoreDirectives.length > 0) {
          setDirectives(firestoreDirectives);
        }
      },
      onMeetingsUpdate: (firestoreMeetings) => {
        if (firestoreMeetings && firestoreMeetings.length > 0) {
          setMeetings(firestoreMeetings);
        }
      },
      onEmulationsUpdate: (firestoreEmus) => {
        if (firestoreEmus && firestoreEmus.length > 0) {
          setEmulations(firestoreEmus);
        }
      },
      onEmulationDocsUpdate: (firestoreEmuDocs) => {
        if (firestoreEmuDocs && firestoreEmuDocs.length > 0) {
          setEmulationDocuments(firestoreEmuDocs);
        }
      },
      onTimetablesUpdate: (firestoreTimetables) => {
        if (firestoreTimetables && firestoreTimetables.length > 0) {
          setTimetables(firestoreTimetables);
        }
      },
      onSettingsUpdate: (firestoreSettings) => {
        if (firestoreSettings) setSettings(firestoreSettings);
      },
      onMembersUpdate: (firestoreMembers) => {
        if (firestoreMembers && firestoreMembers.length > 0) {
          const activeMembers = firestoreMembers.map(m => {
            if (m.id === 'gv-6' || m.name === 'Nguyễn Thị Bé Tý') {
              return { ...m, isLeader: true, assignedClass: 'Tổ trưởng Chuyên môn Khối 5' };
            }
            if (m.id === 'gv-1' || m.name === 'Phan Thị Mỹ Linh') {
              return { ...m, isLeader: false, assignedClass: '5A1(ĐC)' };
            }
            return m;
          });
          setMembers(activeMembers);
        }
      },
      onSyncMetaUpdate: (meta) => {
        setLastSavedTime(meta.lastSavedTime);
        setLastSavedBy(meta.lastSavedBy);
      }
    });

    return () => {
      unsubscribeFirestore();
    };
  }, [members]);

  // Real-time instant SSE multi-device synchronization
  useEffect(() => {
    // 1. Initial pull
    handlePullOnlineUpdates(true);

    // 2. Real-time instant SSE stream: When another teacher inputs data, it arrives here in <100ms
    const unsubscribe = subscribeToOnlineUpdates(
      (incomingData, _rev, authorName, authorEmail) => {
        setIsOnline(true);
        applyIncomingServerData(incomingData, authorName, authorEmail);
      },
      (onlineStatus, peers) => {
        setIsOnline(onlineStatus);
        if (peers !== undefined && peers > 0) {
          setActivePeers(peers);
        }
      },
      userEmail,
      currentUser.name
    );

    // 3. Fallback fast poll every 4 seconds in case SSE drops
    const pollInterval = setInterval(async () => {
      try {
        const status = await checkServerSyncStatus();
        if (status.success) {
          setIsOnline(true);
          if (status.activeConnectedPeers > 0) {
            setActivePeers(status.activeConnectedPeers);
          }
          const localRev = getLastKnownRevision();
          if (status.revision > localRev) {
            handlePullOnlineUpdates(true);
          }
        }
      } catch {
        setIsOnline(false);
      }
    }, 4000);

    return () => {
      unsubscribe();
      clearInterval(pollInterval);
    };
  }, [userEmail, currentUser.name, handlePullOnlineUpdates, applyIncomingServerData]);

  // Debounced auto-push to server whenever any data changes locally
  useEffect(() => {
    if (!isInitialLoadedRef.current) {
      const t = setTimeout(() => {
        isInitialLoadedRef.current = true;
      }, 1500);
      return () => clearTimeout(t);
    }

    if (isApplyingRemoteUpdateRef.current) {
      return;
    }

    const timer = setTimeout(() => {
      const payload = getCurrentFullDataPayload();
      pushDataToOnlineServer(payload, userEmail, currentUser.name)
        .then(() => {
          setIsOnline(true);
          setLastSavedTime(new Date().toLocaleTimeString('vi-VN'));
          setLastSavedBy(`${currentUser.name} (${userEmail})`);
        })
        .catch((err) => {
          console.warn('[AutoSync] Cloud push error:', err);
        });
    }, 500);

    return () => clearTimeout(timer);
  }, [
    getCurrentFullDataPayload,
    userEmail,
    currentUser.name,
    settings,
    secretPasswordLeader,
    members,
    reports,
    strugglingStudents,
    teamDocuments,
    examsAndPlans,
    lessonStudies,
    directives,
    meetings,
    emulations,
    emulationDocuments,
    timetables
  ]);

  // Handler functions for Thanh lệnh 1: Reports
  const handleSaveReport = (report: MonthlyReport) => {
    const sanitized = sanitizeMonthlyReport(report, members);
    setReports(prev => {
      const exists = prev.some(r => r.id === sanitized.id);
      if (exists) {
        return prev.map(r => r.id === sanitized.id ? sanitized : r);
      }
      return [sanitized, ...prev];
    });
  };

  const handleDeleteReport = (id: string) => {
    setReports(prev => prev.filter(r => r.id !== id));
  };

  // Handler functions for Thanh lệnh 2: Struggling Students
  const handleAddStudent = (student: StrugglingStudent) => {
    setStrugglingStudents(prev => [student, ...prev]);
  };

  const handleUpdateStudent = (student: StrugglingStudent) => {
    setStrugglingStudents(prev => prev.map(s => s.id === student.id ? student : s));
  };

  const handleRemoveStudent = (id: string) => {
    setStrugglingStudents(prev => prev.filter(s => s.id !== id));
  };

  // Handler functions for Thanh lệnh 3: Team Documents
  const handleUploadDocument = (doc: TeamPlanDocument) => {
    setTeamDocuments(prev => [doc, ...prev]);
  };

  const handleDeleteDocument = (id: string) => {
    setTeamDocuments(prev => prev.filter(d => d.id !== id));
  };

  // Handler functions for Thanh lệnh 4: Exams & Plans
  const handleSaveExamItem = (item: ExamAndLessonPlan) => {
    setExamsAndPlans(prev => {
      const exists = prev.some(it => it.id === item.id);
      if (exists) {
        return prev.map(it => it.id === item.id ? item : it);
      }
      return [item, ...prev];
    });
  };

  const handleApproveExamItem = (id: string, status: 'Đã duyệt' | 'Yêu cầu chỉnh sửa', reviewNote: string) => {
    const leaderName = members.find(m => m.isLeader)?.name || 'Nguyễn Thị Bé Tý';
    setExamsAndPlans(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          status,
          reviewNote,
          reviewedBy: `Tổ trưởng ${leaderName}`,
          reviewedAt: new Date().toLocaleDateString('vi-VN')
        };
      }
      return item;
    }));
  };

  const handleDeleteExamItem = (id: string) => {
    setExamsAndPlans(prev => prev.filter(item => item.id !== id));
  };

  // Handler functions for Thanh lệnh 5: Lesson Studies
  const handleSaveTopic = (topic: LessonStudyTopic) => {
    setLessonStudies(prev => [topic, ...prev]);
  };

  const handleAddFeedback = (topicId: string, feedback: LessonStudyFeedback) => {
    setLessonStudies(prev => prev.map(t => {
      if (t.id === topicId) {
        return {
          ...t,
          feedbacks: [...(t.feedbacks || []), feedback]
        };
      }
      return t;
    }));
  };

  const handleDeleteTopic = (id: string) => {
    setLessonStudies(prev => prev.filter(t => t.id !== id));
  };

  const handleDeleteFeedback = (topicId: string, feedbackId: string) => {
    setLessonStudies(prev => prev.map(t => {
      if (t.id === topicId) {
        return {
          ...t,
          feedbacks: (t.feedbacks || []).filter(f => f.id !== feedbackId)
        };
      }
      return t;
    }));
  };

  // Handler functions for Thanh lệnh 6: Directives (Công văn chỉ đạo)
  const handleSaveDirective = (directive: SchoolDirective) => {
    setDirectives(prev => [directive, ...prev]);
  };

  const handleDeleteDirective = (id: string) => {
    setDirectives(prev => prev.filter(d => d.id !== id));
  };

  // Handler functions for Thanh lệnh 7: Meetings (Thông báo họp Zoom)
  const handleSaveMeeting = (meeting: MeetingNotice) => {
    setMeetings(prev => [meeting, ...prev]);
  };

  const handleDeleteMeeting = (id: string) => {
    setMeetings(prev => prev.filter(m => m.id !== id));
  };

  // Handler functions for Thanh lệnh 8: Class Timetables (TKB)
  const handleSaveTimetable = (timetable: ClassTimetable) => {
    setTimetables(prev => {
      const exists = prev.some(t => t.id === timetable.id);
      if (exists) {
        return prev.map(t => t.id === timetable.id ? timetable : t);
      }
      return [timetable, ...prev];
    });
  };

  const handleDeleteTimetable = (id: string) => {
    setTimetables(prev => prev.filter(t => t.id !== id));
  };

  const handleApproveTimetable = (id: string, status: 'Đã duyệt' | 'Áp dụng chính thức' | 'Chờ duyệt', feedback?: string) => {
    const leaderName = members.find(m => m.isLeader)?.name || 'Nguyễn Thị Bé Tý';
    setTimetables(prev => prev.map(t => {
      if (t.id === id) {
        return {
          ...t,
          status,
          reviewedBy: `Tổ trưởng ${leaderName}`,
          leaderFeedback: feedback || 'Tổ trưởng đã thẩm định và phê duyệt áp dụng chính thức.',
          updatedAt: new Date().toLocaleDateString('vi-VN')
        };
      }
      return t;
    }));
  };

  // Handler functions for Thanh lệnh 9: Emulations (Xét thi đua)
  const handleSaveEmulation = (record: EmulationRecord) => {
    setEmulations(prev => {
      const exists = prev.some(r => r.id === record.id);
      if (exists) {
        return prev.map(r => r.id === record.id ? record : r);
      }
      return [record, ...prev];
    });
  };

  const handleDeleteEmulation = (id: string) => {
    setEmulations(prev => prev.filter(e => e.id !== id));
  };

  const handleSaveEmulationDoc = (doc: EmulationDocument) => {
    setEmulationDocuments(prev => [doc, ...prev]);
  };

  const handleDeleteEmulationDoc = (id: string) => {
    setEmulationDocuments(prev => prev.filter(d => d.id !== id));
  };

  const handleResetToDefault = async () => {
    await clearAllPersistentData();
    setMembers(INITIAL_MEMBERS);
    setCurrentUser(INITIAL_MEMBERS.find(m => m.name === 'Nguyễn Thị Bé Tý' || m.isLeader) || INITIAL_MEMBERS[0]);
    setReports(INITIAL_MONTHLY_REPORTS);
    setStrugglingStudents(INITIAL_STRUGGLING_STUDENTS);
    setTeamDocuments(INITIAL_TEAM_DOCUMENTS);
    setExamsAndPlans(INITIAL_EXAMS_AND_PLANS);
    setLessonStudies(INITIAL_LESSON_STUDIES);
    setDirectives(INITIAL_DIRECTIVES);
    setMeetings(INITIAL_MEETINGS);
    setEmulations(INITIAL_EMULATIONS);
    setEmulationDocuments([]);
    setTimetables(INITIAL_TIMETABLES);
    setSettings(INITIAL_APP_SETTINGS);
    setSecretPasswordLeader('Tt112233');

    // clear localStorage keys
    const keys = [
      'tanthanh_k5_members',
      'tanthanh_k5_reports',
      'tanthanh_k5_timetables',
      'tanthanh_k5_directives',
      'tanthanh_k5_meetings',
      'tanthanh_k5_team_docs',
      'tanthanh_k5_exams',
      'tanthanh_k5_emulations',
      'tanthanh_k5_emulation_docs'
    ];
    keys.forEach(k => localStorage.removeItem(k));

    // Clear shared server storage as well
    try {
      await fetch('/api/sync/reset', { method: 'POST' });
    } catch (e) {
      console.warn('Failed to reset shared server storage', e);
    }

    alert('Đã thiết lập lại trạng thái ban đầu của ứng dụng (Cô Nguyễn Thị Bé Tý - Tổ trưởng Chuyên môn Khối 5 & Cô Phan Thị Mỹ Linh - GVCN Lớp 5A1)!');
  };

  const totalDocumentsCount = 
    reports.length + 
    strugglingStudents.length + 
    teamDocuments.length + 
    examsAndPlans.length + 
    lessonStudies.length + 
    directives.length + 
    meetings.length + 
    timetables.length + 
    emulations.length + 
    emulationDocuments.length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        settings={settings}
        currentUser={currentUser}
        members={members}
        onSelectUser={setCurrentUser}
        onOpenSettings={() => setShowSettingsModal(true)}
        onOpenPromptModal={() => setShowPromptModal(true)}
        onResetData={handleResetToDefault}
        onOpenBackupModal={() => setShowBackupModal(true)}
      />

      {/* Thanh Lệnh Ghi Nhớ & Đồng Bộ Trực Tuyến Trước Khi Thoát App */}
      <SyncMemorizeBar
        currentUser={currentUser}
        userEmail={userEmail}
        onChangeUserEmail={handleUserEmailChange}
        members={members}
        isOnline={isOnline}
        isSyncing={isSyncing}
        activePeers={activePeers}
        lastSavedTime={lastSavedTime}
        lastSavedBy={lastSavedBy}
        onManualSaveAndMemorize={handleManualSaveAndMemorize}
        onPullOnlineUpdates={() => handlePullOnlineUpdates(false)}
        onExportBackup={downloadBackupFile}
        totalDocumentsCount={totalDocumentsCount}
        activeTab={activeTab}
        onGoToHome={() => setActiveTab('reports')}
      />

      {/* Navigation Command Bar */}
      <Navigation
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        counts={{
          reportsCount: reports.length,
          strugglingCount: strugglingStudents.filter(s => s.progressStatus !== 'Đã hoàn thành mục tiêu').length,
          teamPlansCount: teamDocuments.length,
          examsCount: examsAndPlans.filter(e => e.status === 'Chờ duyệt').length,
          lessonStudiesCount: lessonStudies.length,
          directivesCount: directives.length,
          meetingsCount: meetings.length,
          timetableCount: timetables.length,
          emulationCount: emulations.length + emulationDocuments.length
        }}
      />

      {/* Main Workspace Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {/* Thanh lệnh điều hướng bổ sung: Nút trở lại trang chính khi đang ở bất kỳ tab chức năng nào khác */}
        {activeTab !== 'reports' && (
          <div className="mb-5 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-xl p-3.5 sm:p-4 shadow-md border border-blue-400/40 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-700/80 rounded-lg border border-blue-300/30 text-amber-300 shadow-inner">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-blue-200 font-bold">
                  Thanh lệnh bổ sung đang mở
                </div>
                <div className="text-sm sm:text-base font-extrabold text-white">
                  {activeTab === 'struggling' && 'Theo dõi HS Chậm tiến bộ & Kế hoạch phụ đạo'}
                  {activeTab === 'team-plans' && 'Kế hoạch Tổ Chuyên môn & PPCT'}
                  {activeTab === 'exams-plans' && 'Kế hoạch Dạy học & Ngân hàng Đề thi Bảo mật'}
                  {activeTab === 'lesson-study' && 'KHBD & Sinh hoạt Chuyên môn Nghiên cứu Bài học'}
                  {activeTab === 'directives' && 'Công văn & Văn bản Chỉ đạo Chuyên môn'}
                  {activeTab === 'meetings' && 'Thông báo Họp & Phòng Họp trực tuyến Zoom'}
                  {activeTab === 'timetable' && 'Thời khóa biểu các Lớp Khối 5'}
                  {activeTab === 'emulation' && 'Hồ sơ & Đánh giá Thi đua Tổ Khối 5'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => setActiveTab('reports')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 text-xs sm:text-sm font-extrabold rounded-lg shadow-md hover:shadow-lg transition-all active:scale-95 border border-amber-200 ring-2 ring-amber-300/50"
                title="Bấm vào đây để trở lại Trang chính của app (Báo cáo HS Hàng tháng)"
              >
                <Home className="w-4 h-4 text-slate-950 shrink-0" />
                <span>Trở lại Trang chính của App</span>
              </button>
            </div>
          </div>
        )}
        {activeTab === 'reports' && (
          <MonthlyReportView
            reports={reports}
            members={members}
            currentUser={currentUser}
            onSaveReport={handleSaveReport}
            onDeleteReport={handleDeleteReport}
          />
        )}

        {activeTab === 'struggling' && (
          <StrugglingStudentsView
            students={strugglingStudents}
            members={members}
            currentUser={currentUser}
            onAddStudent={handleAddStudent}
            onUpdateStudent={handleUpdateStudent}
            onRemoveStudent={handleRemoveStudent}
          />
        )}

        {activeTab === 'team-plans' && (
          <TeamDocumentsView
            documents={teamDocuments}
            currentUser={currentUser}
            onUploadDocument={handleUploadDocument}
            onDeleteDocument={handleDeleteDocument}
          />
        )}

        {activeTab === 'exams-plans' && (
          <ExamAndLessonPlansView
            items={examsAndPlans}
            members={members}
            currentUser={currentUser}
            secretPasswordLeader={secretPasswordLeader}
            onSaveItem={handleSaveExamItem}
            onApproveItem={handleApproveExamItem}
            onDeleteItem={handleDeleteExamItem}
            onUpdatePassword={setSecretPasswordLeader}
          />
        )}

        {activeTab === 'lesson-study' && (
          <LessonStudyView
            topics={lessonStudies}
            members={members}
            currentUser={currentUser}
            onSaveTopic={handleSaveTopic}
            onAddFeedback={handleAddFeedback}
            onDeleteTopic={handleDeleteTopic}
            onDeleteFeedback={handleDeleteFeedback}
          />
        )}

        {/* Separated: Công văn chỉ đạo */}
        {activeTab === 'directives' && (
          <DirectivesView
            directives={directives}
            members={members}
            currentUser={currentUser}
            onSaveDirective={handleSaveDirective}
            onDeleteDirective={handleDeleteDirective}
          />
        )}

        {/* Separated: Thông báo họp trực tuyến Zoom */}
        {activeTab === 'meetings' && (
          <MeetingNoticesView
            meetings={meetings}
            members={members}
            currentUser={currentUser}
            onSaveMeeting={handleSaveMeeting}
            onDeleteMeeting={handleDeleteMeeting}
          />
        )}

        {/* Thời khóa biểu (TKB) - chỉ hiện khi GV tải lên */}
        {activeTab === 'timetable' && (
          <ClassTimetableView
            timetables={timetables}
            members={members}
            currentUser={currentUser}
            onSaveTimetable={handleSaveTimetable}
            onDeleteTimetable={handleDeleteTimetable}
            onApproveTimetable={handleApproveTimetable}
          />
        )}

        {/* Xét thi đua - hỗ trợ Excel & Word */}
        {activeTab === 'emulation' && (
          <EmulationEvaluationView
            records={emulations}
            emulationDocuments={emulationDocuments}
            members={members}
            currentUser={currentUser}
            onSaveRecord={handleSaveEmulation}
            onDeleteRecord={handleDeleteEmulation}
            onSaveEmulationDoc={handleSaveEmulationDoc}
            onDeleteEmulationDoc={handleDeleteEmulationDoc}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-xs text-slate-500 mt-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div>
            <strong>{settings.schoolName}</strong> — {settings.teamName} ({settings.academicYear})
          </div>
          <div className="text-slate-500">
            Hệ thống quản lý chuyên môn Khối 5 • Thư mục KHBD &amp; Ngân hàng đề thi được bảo mật bởi <strong>Tổ trưởng Nguyễn Thị Bé Tý</strong>
            {(currentUser.isLeader || currentUser.name.includes('Bé Tý')) && (
              <span className="ml-2 text-amber-700 font-semibold font-mono bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                MK TT: {secretPasswordLeader}
              </span>
            )}
          </div>
        </div>
      </footer>

      {/* Modals */}
      <MemberManagementModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        members={members}
        onUpdateMembers={setMembers}
        settings={settings}
        onUpdateSettings={setSettings}
        onResetToDefault={handleResetToDefault}
      />

      <PromptModal
        isOpen={showPromptModal}
        onClose={() => setShowPromptModal(false)}
      />

      <BackupRestoreModal
        isOpen={showBackupModal}
        onClose={() => setShowBackupModal(false)}
        onDataRestored={reloadAllDataFromStorage}
        onGoToHome={() => setActiveTab('reports')}
      />
    </div>
  );
}
