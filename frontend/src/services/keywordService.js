import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase.js';

export const KeywordService = {
  async getKeywords() {
    try {
      const snap = await getDocs(collection(db, 'keywords'));
      let list = [];
      snap.forEach((d) => {
        list.push({ _id: d.id, id: d.id, ...d.data() });
      });
      list.sort((a, b) => (a.word || '').localeCompare(b.word || ''));
      return list;
    } catch (err) {
      console.error('Failed to get master keywords from Firestore:', err);
      return [];
    }
  },

  async createKeyword(word) {
    const cleanWord = (word || '').trim();
    if (!cleanWord) throw new Error('Keyword cannot be empty');

    const docRef = await addDoc(collection(db, 'keywords'), {
      word: cleanWord,
      createdAt: new Date().toISOString(),
    });
    return { _id: docRef.id, id: docRef.id, word: cleanWord };
  },

  async updateKeyword(id, word) {
    const cleanWord = (word || '').trim();
    if (!cleanWord) throw new Error('Keyword cannot be empty');

    const docRef = doc(db, 'keywords', id);
    await updateDoc(docRef, {
      word: cleanWord,
      updatedAt: new Date().toISOString(),
    });
    return { _id: id, id, word: cleanWord };
  },

  async deleteKeyword(id) {
    const docRef = doc(db, 'keywords', id);
    await deleteDoc(docRef);
    return { success: true };
  },

  async bulkDeleteKeywords(ids = []) {
    if (!ids || ids.length === 0) return { deletedCount: 0 };
    const batch = writeBatch(db);
    ids.forEach((id) => {
      batch.delete(doc(db, 'keywords', id));
    });
    await batch.commit();
    return { deletedCount: ids.length };
  },
};
