import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "./firebase";
import { NewsletterResult, ScheduledNewsletter } from "../types";

export async function saveNewsletterToFirestore(
  userId: string,
  newsletter: NewsletterResult
): Promise<string> {
  const docId =
    newsletter.id && /^[a-zA-Z0-9_-]+$/.test(newsletter.id)
      ? newsletter.id
      : `edition_${Date.now()}`;

  const path = `users/${userId}/newsletters/${docId}`;

  const payload = {
    userId,
    subject: newsletter.subject || "Newsletter Sans Titre",
    preheader: newsletter.preheader || "",
    editorialIntro: newsletter.editorialIntro || "",
    takeaway: newsletter.takeaway || "",
    dateStr: newsletter.dateStr || new Date().toLocaleDateString("fr-FR"),
    html: newsletter.html || "",
    targetAudience: "CTO & Ingénieurs Seniors",
    styleTemplate: "editorial",
    totalItemsAnalyzed: Number(newsletter.filteringReport?.totalItemsAnalyzed || 0),
    rejectedItemsCount: Number(newsletter.filteringReport?.rejectedItemsCount || 0),
    innovationsCount: Number(newsletter.innovations?.length || 0),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, "users", userId, "newsletters", docId), payload);
    return docId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function fetchNewslettersFromFirestore(
  userId: string
): Promise<NewsletterResult[]> {
  const collectionPath = `users/${userId}/newsletters`;
  try {
    const q = query(
      collection(db, "users", userId, "newsletters"),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        subject: data.subject || "",
        preheader: data.preheader || "",
        editorialIntro: data.editorialIntro || "",
        takeaway: data.takeaway || "",
        dateStr: data.dateStr || "",
        html: data.html || "",
        filteringReport: {
          totalItemsAnalyzed: data.totalItemsAnalyzed || 0,
          rejectedItemsCount: data.rejectedItemsCount || 0,
          rejectionReasons: [],
        },
        innovations: [],
        timestamp: data.createdAt ? new Date(data.createdAt).getTime() : Date.now(),
      } as NewsletterResult;
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, collectionPath);
  }
}

export async function deleteNewsletterFromFirestore(
  userId: string,
  docId: string
): Promise<void> {
  const path = `users/${userId}/newsletters/${docId}`;
  try {
    await deleteDoc(doc(db, "users", userId, "newsletters", docId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeUserNewsletters(
  userId: string,
  onData: (items: NewsletterResult[]) => void,
  onError?: (error: unknown) => void
) {
  const collectionPath = `users/${userId}/newsletters`;
  const q = query(
    collection(db, "users", userId, "newsletters"),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const results: NewsletterResult[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          subject: data.subject || "",
          preheader: data.preheader || "",
          editorialIntro: data.editorialIntro || "",
          takeaway: data.takeaway || "",
          dateStr: data.dateStr || "",
          html: data.html || "",
          filteringReport: {
            totalItemsAnalyzed: data.totalItemsAnalyzed || 0,
            rejectedItemsCount: data.rejectedItemsCount || 0,
            rejectionReasons: [],
          },
          innovations: [],
          timestamp: data.createdAt ? new Date(data.createdAt).getTime() : Date.now(),
        };
      });
      onData(results);
    },
    (error) => {
      if (onError) {
        onError(error);
      }
      handleFirestoreError(error, OperationType.LIST, collectionPath);
    }
  );
}

// Scheduled Newsletters Management (Queue)
export async function saveScheduledNewsletterToFirestore(
  userId: string,
  scheduled: ScheduledNewsletter
): Promise<string> {
  const docId =
    scheduled.id && /^[a-zA-Z0-9_-]+$/.test(scheduled.id)
      ? scheduled.id
      : `sched_${Date.now()}`;

  const path = `users/${userId}/scheduledNewsletters/${docId}`;

  const payload = {
    userId,
    subject: scheduled.newsletter.subject || "Newsletter Planifiée",
    scheduledFor: scheduled.scheduledFor,
    targetRecipientsGroup: scheduled.targetRecipientsGroup || "Équipe R&D & Ingénierie",
    status: scheduled.status || "PENDING",
    googleCalendarEventId: scheduled.googleCalendarEventId || "",
    googleCalendarEventLink: scheduled.googleCalendarEventLink || "",
    notes: scheduled.notes || "",
    html: scheduled.newsletter.html || "",
    createdAt: new Date(scheduled.createdAt || Date.now()).toISOString(),
  };

  try {
    await setDoc(doc(db, "users", userId, "scheduledNewsletters", docId), payload);
    return docId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function fetchScheduledNewslettersFromFirestore(
  userId: string
): Promise<ScheduledNewsletter[]> {
  const collectionPath = `users/${userId}/scheduledNewsletters`;
  try {
    const q = query(
      collection(db, "users", userId, "scheduledNewsletters"),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        scheduledFor: data.scheduledFor || new Date().toISOString(),
        targetRecipientsGroup: data.targetRecipientsGroup || "Équipe R&D & Ingénierie",
        status: data.status || "PENDING",
        googleCalendarEventId: data.googleCalendarEventId || "",
        googleCalendarEventLink: data.googleCalendarEventLink || "",
        notes: data.notes || "",
        createdAt: data.createdAt ? new Date(data.createdAt).getTime() : Date.now(),
        newsletter: {
          id: docSnap.id,
          subject: data.subject || "Newsletter Planifiée",
          preheader: "",
          editorialIntro: "",
          takeaway: "",
          dateStr: new Date(data.scheduledFor || Date.now()).toLocaleDateString("fr-FR"),
          html: data.html || "",
          filteringReport: {
            totalItemsAnalyzed: 0,
            rejectedItemsCount: 0,
            rejectionReasons: [],
          },
          innovations: [],
          timestamp: data.createdAt ? new Date(data.createdAt).getTime() : Date.now(),
        },
      } as ScheduledNewsletter;
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, collectionPath);
  }
}

export async function deleteScheduledNewsletterFromFirestore(
  userId: string,
  docId: string
): Promise<void> {
  const path = `users/${userId}/scheduledNewsletters/${docId}`;
  try {
    await deleteDoc(doc(db, "users", userId, "scheduledNewsletters", docId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeUserScheduledNewsletters(
  userId: string,
  onData: (items: ScheduledNewsletter[]) => void,
  onError?: (error: unknown) => void
) {
  const collectionPath = `users/${userId}/scheduledNewsletters`;
  const q = query(
    collection(db, "users", userId, "scheduledNewsletters"),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const results: ScheduledNewsletter[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          scheduledFor: data.scheduledFor || new Date().toISOString(),
          targetRecipientsGroup: data.targetRecipientsGroup || "Équipe R&D & Ingénierie",
          status: data.status || "PENDING",
          googleCalendarEventId: data.googleCalendarEventId || "",
          googleCalendarEventLink: data.googleCalendarEventLink || "",
          notes: data.notes || "",
          createdAt: data.createdAt ? new Date(data.createdAt).getTime() : Date.now(),
          newsletter: {
            id: docSnap.id,
            subject: data.subject || "Newsletter Planifiée",
            preheader: "",
            editorialIntro: "",
            takeaway: "",
            dateStr: new Date(data.scheduledFor || Date.now()).toLocaleDateString("fr-FR"),
            html: data.html || "",
            filteringReport: {
              totalItemsAnalyzed: 0,
              rejectedItemsCount: 0,
              rejectionReasons: [],
            },
            innovations: [],
            timestamp: data.createdAt ? new Date(data.createdAt).getTime() : Date.now(),
          },
        };
      });
      onData(results);
    },
    (error) => {
      if (onError) {
        onError(error);
      }
      handleFirestoreError(error, OperationType.LIST, collectionPath);
    }
  );
}

