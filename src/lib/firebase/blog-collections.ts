import { collection } from 'firebase/firestore';
import { db } from './app';

// Blog collections
export const blogCollection = db ? collection(db, 'blogs') : null;

// Guestbook collection (existing)  
export const guestbookCollection = db ? collection(db, 'guestbook') : null;
