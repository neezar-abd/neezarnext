import {
  addDoc,
  Timestamp,
  serverTimestamp,
  type WithFieldValue
} from 'firebase/firestore';
import { getGuestbook } from '@lib/api';
import { guestbookCollection } from '@lib/firebase/collections';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { APIResponse } from '@lib/types/helper';
import type { Guestbook } from '@lib/types/guestbook';

type GuestbookFormData = {
  username: string;
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIResponse<Guestbook | Guestbook[]>>
): Promise<void> {
  try {
    if (req.method === 'GET') {
      const guestbook = await getGuestbook();

      return res.status(200).json(guestbook);
    }

    if (req.method === 'POST') {
      const { username, message } = req.body as GuestbookFormData;

      if (!username?.trim() || !message?.trim()) {
        return res.status(422).json({ message: 'Username and message are required' });
      }

      // Simple validation
      if (username.length > 50) {
        return res.status(422).json({ message: 'Username too long (max 50 characters)' });
      }

      if (message.length > 500) {
        return res.status(422).json({ message: 'Message too long (max 500 characters)' });
      }

      const data: WithFieldValue<Omit<Guestbook, 'id'>> = {
        name: username.trim(),
        username: username.trim(),
        text: message.trim(),
        email: '', // No email for simple guestbook
        image: '', // Will use generated avatar
        createdBy: '', // No user tracking
        createdAt: serverTimestamp()
      };

      const { id } = await addDoc(guestbookCollection, data);

      const newestGuestbook = {
        ...data,
        id,
        createdAt: Timestamp.now()
      } as Guestbook;

      return res.status(201).json(newestGuestbook);
    }
  } catch (error) {
    if (error instanceof Error)
      return res.status(500).json({ message: error.message });

    return res.status(500).json({ message: 'Internal server error' });
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
