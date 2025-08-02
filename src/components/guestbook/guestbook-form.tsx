import { useState, type FormEvent } from 'react';
import { clsx } from 'clsx';
import { Button } from '@components/ui/button';
import { useNotification } from '@lib/hooks/use-notification';

type GuestbookFormData = {
  username: string;
  message: string;
};

type GuestbookFormProps = {
  registerGuestbook: (data: GuestbookFormData) => Promise<void>;
};

export function GuestbookForm({
  registerGuestbook
}: GuestbookFormProps): React.JSX.Element {
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const { success, error } = useNotification();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!username.trim() || !message.trim()) {
      error('Please fill in both username and message');
      return;
    }

    setLoading(true);

    try {
      await registerGuestbook({
        username: username.trim(),
        message: message.trim()
      });

      // Clear form after successful submission
      setUsername('');
      setMessage('');
      success('Message posted successfully!');
    } catch (err) {
      error('Failed to post message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className='mt-4 space-y-3 text-sm transition md:text-base'
      onSubmit={handleSubmit}
    >
      <div className='flex gap-2'>
        <input
          className={clsx(
            'custom-input flex-1 disabled:cursor-not-allowed',
            loading && 'brightness-75'
          )}
          type='text'
          placeholder='Your username...'
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={loading}
          maxLength={50}
          required
        />
      </div>
      <div className='flex gap-2'>
        <input
          className={clsx(
            'custom-input flex-1 disabled:cursor-not-allowed',
            loading && 'brightness-75'
          )}
          type='text'
          placeholder='Your message...'
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={loading}
          maxLength={500}
          required
        />
        <Button
          type='submit'
          className='custom-button clickable font-bold text-gray-600 dark:text-gray-300'
          loading={loading}
        >
          Post
        </Button>
      </div>
    </form>
  );
}
