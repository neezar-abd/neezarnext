import useSWR from 'swr';
import { fetcher } from '@lib/fetcher';
import type { ValidApiEndpoints } from '@lib/types/api';
import type { Guestbook } from '@lib/types/guestbook';

type GuestbookFormData = {
  username: string;
  message: string;
};

type UseGuestbook = {
  guestbook?: Guestbook[];
  isLoading: boolean;
  registerGuestbook: (data: GuestbookFormData) => Promise<void>;
  unRegisterGuestbook: (id: string) => Promise<void>;
};

/**
 * Returns the guestbook data and a function to register guestbook.
 */
export function useGuestbook(fallbackData: Guestbook[]): UseGuestbook {
  const {
    data: guestbook,
    isLoading,
    mutate
  } = useSWR<Guestbook[], unknown, ValidApiEndpoints>(
    '/api/guestbook',
    fetcher,
    { fallbackData }
  );

  const registerGuestbook = async (data: GuestbookFormData): Promise<void> => {
    const newGuestbook = await fetcher<Guestbook>('/api/guestbook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    await mutate([newGuestbook, ...(guestbook ?? [])]);
  };

  const unRegisterGuestbook = async (id: string): Promise<void> => {
    await fetcher(`/api/guestbook/${id}`, { method: 'DELETE' });

    const newGuestbook = guestbook?.filter((entry) => entry.id !== id);

    await mutate(newGuestbook);
  };

  return { guestbook, isLoading, registerGuestbook, unRegisterGuestbook };
}
