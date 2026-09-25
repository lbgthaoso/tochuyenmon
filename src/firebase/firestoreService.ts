/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { db } from './config';
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
  ClassTimetable,
  AppSettings
} from '../types';
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
} from '../data/initialData';

export interface FirestoreSyncCallbacks {
  onReportsUpdate?: (reports: MonthlyReport[]) => void;
  onStrugglingUpdate?: (students: StrugglingStudent[]) => void;
  onTeamDocsUpdate?: (docs: TeamPlanDocument[]) => void;
  onExamsUpdate?: (exams: ExamAndLessonPlan[]) => void;
  onLessonStudiesUpdate?: (studies: LessonStudyTopic[]) => void;
  onDirectivesUpdate?: (directives: SchoolDirective[]) => void;
  onMeetingsUpdate?: (meetings: MeetingNotice[]) => void;
  onEmulationsUpdate?: (records: EmulationRecord[]) => void;
  onEmulationDocsUpdate?: (docs: EmulationDocument[]) => void;
  onTimetablesUpdate?: (timetables: ClassTimetable[]) => void;
  onSettingsUpdate?: (settings: AppSettings) => void;
  onMembersUpdate?: (members: TeacherMember[]) => void;
  onSyncMetaUpdate?: (meta: { lastSavedTime: string; lastSavedBy: string }) => void;
}

/**
 * Seed Firestore with initial default data if the database is freshly provisioned
 */
export async function seedFirestoreIfEmpty(): Promise<void> {
  try {
    const reportsSnapshot = await getDocs(collection(db, 'reports'));
    if (reportsSnapshot.empty) {
      console.log('[Firestore] Seeding initial Khối 5 database to Firestore...');
      const batch = writeBatch(db);

      // Seed reports
      INITIAL_MONTHLY_REPORTS.forEach(rep => {
        batch.set(doc(db, 'reports', rep.id), rep);
      });

      // Seed struggling students
      INITIAL_STRUGGLING_STUDENTS.forEach(stu => {
        batch.set(doc(db, 'struggling', stu.id), stu);
      });

      // Seed team docs
      INITIAL_TEAM_DOCUMENTS.forEach(td => {
        batch.set(doc(db, 'team_docs', td.id), td);
      });

      // Seed exams and plans
      INITIAL_EXAMS_AND_PLANS.forEach(ex => {
        batch.set(doc(db, 'exams', ex.id), ex);
      });

      // Seed lesson studies
      INITIAL_LESSON_STUDIES.forEach(ls => {
        batch.set(doc(db, 'lesson_studies', ls.id), ls);
      });

      // Seed directives
      INITIAL_DIRECTIVES.forEach(dir => {
        batch.set(doc(db, 'directives', dir.id), dir);
      });

      // Seed meetings
      INITIAL_MEETINGS.forEach(mt => {
        batch.set(doc(db, 'meetings', mt.id), mt);
      });

      // Seed emulations
      INITIAL_EMULATIONS.forEach(em => {
        batch.set(doc(db, 'emulations', em.id), em);
      });

      // Seed timetables
      INITIAL_TIMETABLES.forEach(tb => {
        batch.set(doc(db, 'timetables', tb.id), tb);
      });

      // Seed settings & members
      batch.set(doc(db, 'app_metadata', 'settings'), INITIAL_APP_SETTINGS);
      INITIAL_MEMBERS.forEach(m => {
        batch.set(doc(db, 'members', m.id), m);
      });

      batch.set(doc(db, 'app_metadata', 'sync'), {
        lastSavedTime: new Date().toISOString(),
        lastSavedBy: 'Tổ trưởng Nguyễn Thị Bé Tý (lbgthaoso@gmail.com)'
      });

      await batch.commit();
      console.log('[Firestore] Initial Khối 5 database seeded successfully!');
    }
  } catch (err) {
    console.warn('[Firestore] Error while checking or seeding initial data:', err);
  }
}

/**
 * Subscribe to all real-time Firestore collections.
 * Whenever ANY teacher or leader updates data from any device or email,
 * the update arrives instantaneously across all connected screens!
 */
export function subscribeToAllFirestoreData(callbacks: FirestoreSyncCallbacks): () => void {
  const unsubscribers: Array<() => void> = [];

  // Seed on startup if empty
  seedFirestoreIfEmpty().catch(() => {});

  // 1. Reports
  unsubscribers.push(
    onSnapshot(collection(db, 'reports'), snapshot => {
      if (callbacks.onReportsUpdate) {
        const items = snapshot.docs.map(d => d.data() as MonthlyReport);
        callbacks.onReportsUpdate(items);
      }
    }, err => console.warn('[Firestore] Reports listen error:', err))
  );

  // 2. Struggling students
  unsubscribers.push(
    onSnapshot(collection(db, 'struggling'), snapshot => {
      if (callbacks.onStrugglingUpdate) {
        const items = snapshot.docs.map(d => d.data() as StrugglingStudent);
        callbacks.onStrugglingUpdate(items);
      }
    }, err => console.warn('[Firestore] Struggling listen error:', err))
  );

  // 3. Team Documents
  unsubscribers.push(
    onSnapshot(collection(db, 'team_docs'), snapshot => {
      if (callbacks.onTeamDocsUpdate) {
        const items = snapshot.docs.map(d => d.data() as TeamPlanDocument);
        callbacks.onTeamDocsUpdate(items);
      }
    }, err => console.warn('[Firestore] TeamDocs listen error:', err))
  );

  // 4. Exams & Lesson Plans
  unsubscribers.push(
    onSnapshot(collection(db, 'exams'), snapshot => {
      if (callbacks.onExamsUpdate) {
        const items = snapshot.docs.map(d => d.data() as ExamAndLessonPlan);
        callbacks.onExamsUpdate(items);
      }
    }, err => console.warn('[Firestore] Exams listen error:', err))
  );

  // 5. Lesson Studies
  unsubscribers.push(
    onSnapshot(collection(db, 'lesson_studies'), snapshot => {
      if (callbacks.onLessonStudiesUpdate) {
        const items = snapshot.docs.map(d => d.data() as LessonStudyTopic);
        callbacks.onLessonStudiesUpdate(items);
      }
    }, err => console.warn('[Firestore] LessonStudies listen error:', err))
  );

  // 6. Directives
  unsubscribers.push(
    onSnapshot(collection(db, 'directives'), snapshot => {
      if (callbacks.onDirectivesUpdate) {
        const items = snapshot.docs.map(d => d.data() as SchoolDirective);
        callbacks.onDirectivesUpdate(items);
      }
    }, err => console.warn('[Firestore] Directives listen error:', err))
  );

  // 7. Meetings
  unsubscribers.push(
    onSnapshot(collection(db, 'meetings'), snapshot => {
      if (callbacks.onMeetingsUpdate) {
        const items = snapshot.docs.map(d => d.data() as MeetingNotice);
        callbacks.onMeetingsUpdate(items);
      }
    }, err => console.warn('[Firestore] Meetings listen error:', err))
  );

  // 8. Emulations
  unsubscribers.push(
    onSnapshot(collection(db, 'emulations'), snapshot => {
      if (callbacks.onEmulationsUpdate) {
        const items = snapshot.docs.map(d => d.data() as EmulationRecord);
        callbacks.onEmulationsUpdate(items);
      }
    }, err => console.warn('[Firestore] Emulations listen error:', err))
  );

  // 9. Emulation Docs
  unsubscribers.push(
    onSnapshot(collection(db, 'emulation_docs'), snapshot => {
      if (callbacks.onEmulationDocsUpdate) {
        const items = snapshot.docs.map(d => d.data() as EmulationDocument);
        callbacks.onEmulationDocsUpdate(items);
      }
    }, err => console.warn('[Firestore] EmulationDocs listen error:', err))
  );

  // 10. Timetables
  unsubscribers.push(
    onSnapshot(collection(db, 'timetables'), snapshot => {
      if (callbacks.onTimetablesUpdate) {
        const items = snapshot.docs.map(d => d.data() as ClassTimetable);
        callbacks.onTimetablesUpdate(items);
      }
    }, err => console.warn('[Firestore] Timetables listen error:', err))
  );

  // 11. Members
  unsubscribers.push(
    onSnapshot(collection(db, 'members'), snapshot => {
      if (callbacks.onMembersUpdate) {
        const items = snapshot.docs.map(d => d.data() as TeacherMember);
        callbacks.onMembersUpdate(items);
      }
    }, err => console.warn('[Firestore] Members listen error:', err))
  );

  // 12. Settings
  unsubscribers.push(
    onSnapshot(doc(db, 'app_metadata', 'settings'), snapshot => {
      if (callbacks.onSettingsUpdate && snapshot.exists()) {
        callbacks.onSettingsUpdate(snapshot.data() as AppSettings);
      }
    }, err => console.warn('[Firestore] Settings listen error:', err))
  );

  // 13. Sync Metadata
  unsubscribers.push(
    onSnapshot(doc(db, 'app_metadata', 'sync'), snapshot => {
      if (callbacks.onSyncMetaUpdate && snapshot.exists()) {
        const data = snapshot.data();
        callbacks.onSyncMetaUpdate({
          lastSavedTime: data.lastSavedTime || new Date().toLocaleTimeString('vi-VN'),
          lastSavedBy: data.lastSavedBy || 'Đồng nghiệp'
        });
      }
    }, err => console.warn('[Firestore] Sync meta listen error:', err))
  );

  return () => {
    unsubscribers.forEach(u => u());
  };
}

/**
 * Record sync activity metadata in Firestore
 */
export async function recordFirestoreActivity(userEmail: string, userName: string): Promise<void> {
  try {
    await setDoc(doc(db, 'app_metadata', 'sync'), {
      lastSavedTime: new Date().toLocaleTimeString('vi-VN'),
      lastSavedBy: `${userName} (${userEmail})`,
      timestamp: Date.now()
    }, { merge: true });
  } catch (err) {
    console.warn('[Firestore] Failed to record activity:', err);
  }
}

// Single-item Firestore write helpers with instant cloud propagation
export async function saveReportToFirestore(report: MonthlyReport, userEmail: string, userName: string): Promise<void> {
  await setDoc(doc(db, 'reports', report.id), report, { merge: true });
  await recordFirestoreActivity(userEmail, userName);
}

export async function deleteReportFromFirestore(reportId: string, userEmail: string, userName: string): Promise<void> {
  await deleteDoc(doc(db, 'reports', reportId));
  await recordFirestoreActivity(userEmail, userName);
}

export async function saveStudentToFirestore(student: StrugglingStudent, userEmail: string, userName: string): Promise<void> {
  await setDoc(doc(db, 'struggling', student.id), student, { merge: true });
  await recordFirestoreActivity(userEmail, userName);
}

export async function deleteStudentFromFirestore(studentId: string, userEmail: string, userName: string): Promise<void> {
  await deleteDoc(doc(db, 'struggling', studentId));
  await recordFirestoreActivity(userEmail, userName);
}

export async function saveTeamDocToFirestore(docItem: TeamPlanDocument, userEmail: string, userName: string): Promise<void> {
  await setDoc(doc(db, 'team_docs', docItem.id), docItem, { merge: true });
  await recordFirestoreActivity(userEmail, userName);
}

export async function deleteTeamDocFromFirestore(docId: string, userEmail: string, userName: string): Promise<void> {
  await deleteDoc(doc(db, 'team_docs', docId));
  await recordFirestoreActivity(userEmail, userName);
}

export async function saveExamToFirestore(exam: ExamAndLessonPlan, userEmail: string, userName: string): Promise<void> {
  await setDoc(doc(db, 'exams', exam.id), exam, { merge: true });
  await recordFirestoreActivity(userEmail, userName);
}

export async function deleteExamFromFirestore(examId: string, userEmail: string, userName: string): Promise<void> {
  await deleteDoc(doc(db, 'exams', examId));
  await recordFirestoreActivity(userEmail, userName);
}

export async function saveLessonStudyToFirestore(topic: LessonStudyTopic, userEmail: string, userName: string): Promise<void> {
  await setDoc(doc(db, 'lesson_studies', topic.id), topic, { merge: true });
  await recordFirestoreActivity(userEmail, userName);
}

export async function deleteLessonStudyFromFirestore(topicId: string, userEmail: string, userName: string): Promise<void> {
  await deleteDoc(doc(db, 'lesson_studies', topicId));
  await recordFirestoreActivity(userEmail, userName);
}

export async function saveDirectiveToFirestore(directive: SchoolDirective, userEmail: string, userName: string): Promise<void> {
  await setDoc(doc(db, 'directives', directive.id), directive, { merge: true });
  await recordFirestoreActivity(userEmail, userName);
}

export async function deleteDirectiveFromFirestore(directiveId: string, userEmail: string, userName: string): Promise<void> {
  await deleteDoc(doc(db, 'directives', directiveId));
  await recordFirestoreActivity(userEmail, userName);
}

export async function saveMeetingToFirestore(meeting: MeetingNotice, userEmail: string, userName: string): Promise<void> {
  await setDoc(doc(db, 'meetings', meeting.id), meeting, { merge: true });
  await recordFirestoreActivity(userEmail, userName);
}

export async function deleteMeetingFromFirestore(meetingId: string, userEmail: string, userName: string): Promise<void> {
  await deleteDoc(doc(db, 'meetings', meetingId));
  await recordFirestoreActivity(userEmail, userName);
}

export async function saveEmulationToFirestore(emulation: EmulationRecord, userEmail: string, userName: string): Promise<void> {
  await setDoc(doc(db, 'emulations', emulation.id), emulation, { merge: true });
  await recordFirestoreActivity(userEmail, userName);
}

export async function deleteEmulationFromFirestore(emulationId: string, userEmail: string, userName: string): Promise<void> {
  await deleteDoc(doc(db, 'emulations', emulationId));
  await recordFirestoreActivity(userEmail, userName);
}

export async function saveTimetableToFirestore(timetable: ClassTimetable, userEmail: string, userName: string): Promise<void> {
  await setDoc(doc(db, 'timetables', timetable.id), timetable, { merge: true });
  await recordFirestoreActivity(userEmail, userName);
}

export async function deleteTimetableFromFirestore(timetableId: string, userEmail: string, userName: string): Promise<void> {
  await deleteDoc(doc(db, 'timetables', timetableId));
  await recordFirestoreActivity(userEmail, userName);
}

export async function saveFullStateToFirestore(payload: Record<string, any>, userEmail: string, userName: string): Promise<void> {
  try {
    const batch = writeBatch(db);

    if (Array.isArray(payload.reports)) {
      payload.reports.forEach(r => batch.set(doc(db, 'reports', r.id), r, { merge: true }));
    }
    if (Array.isArray(payload.struggling)) {
      payload.struggling.forEach(s => batch.set(doc(db, 'struggling', s.id), s, { merge: true }));
    }
    if (Array.isArray(payload.team_docs)) {
      payload.team_docs.forEach(d => batch.set(doc(db, 'team_docs', d.id), d, { merge: true }));
    }
    if (Array.isArray(payload.exams)) {
      payload.exams.forEach(e => batch.set(doc(db, 'exams', e.id), e, { merge: true }));
    }
    if (Array.isArray(payload.lesson_studies)) {
      payload.lesson_studies.forEach(l => batch.set(doc(db, 'lesson_studies', l.id), l, { merge: true }));
    }
    if (Array.isArray(payload.directives)) {
      payload.directives.forEach(di => batch.set(doc(db, 'directives', di.id), di, { merge: true }));
    }
    if (Array.isArray(payload.meetings)) {
      payload.meetings.forEach(m => batch.set(doc(db, 'meetings', m.id), m, { merge: true }));
    }
    if (Array.isArray(payload.emulations)) {
      payload.emulations.forEach(em => batch.set(doc(db, 'emulations', em.id), em, { merge: true }));
    }
    if (Array.isArray(payload.timetables)) {
      payload.timetables.forEach(t => batch.set(doc(db, 'timetables', t.id), t, { merge: true }));
    }
    if (payload.settings) {
      batch.set(doc(db, 'app_metadata', 'settings'), payload.settings, { merge: true });
    }

    batch.set(doc(db, 'app_metadata', 'sync'), {
      lastSavedTime: new Date().toLocaleTimeString('vi-VN'),
      lastSavedBy: `${userName} (${userEmail})`,
      timestamp: Date.now()
    }, { merge: true });

    await batch.commit();
  } catch (err) {
    console.warn('[Firestore] saveFullStateToFirestore error:', err);
  }
}
