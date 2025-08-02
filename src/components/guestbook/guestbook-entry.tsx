import { motion, type MotionProps } from 'framer-motion';
import { formatFullTimeStamp, formatTimestamp } from '@lib/format';
import { Tooltip } from '@components/ui/tooltip';
import { LazyImage } from '@components/ui/lazy-image';
import type { Guestbook } from '@lib/types/guestbook';

type GuestbookEntryProps = Guestbook & {
  unRegisterGuestbook: (id: string) => Promise<void>;
};

export function GuestbookEntry({
  id,
  text,
  name,
  username,
  createdAt
}: GuestbookEntryProps): React.JSX.Element {
  // Generate a simple avatar based on username
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || username)}&background=random&size=48`;

  return (
    <motion.article
      className='main-border relative grid grid-cols-[auto,1fr] gap-3 rounded-md p-4'
      layout='position'
      {...variants}
    >
      <LazyImage
        className='main-border rounded-full'
        src={avatarUrl}
        alt={name || username}
        width={48}
        height={48}
      />
      <div className='min-w-0'>
        <div className='flex items-end gap-2'>
          <span
            className='truncate font-bold text-gray-900 dark:text-gray-100'
            title={name || username}
          >
            {name || username}
          </span>
          <Tooltip
            className='whitespace-nowrap'
            tip={formatFullTimeStamp(createdAt)}
          >
            <span className='text-sm text-gray-600 dark:text-gray-300'>
              {formatTimestamp(createdAt)}
            </span>
          </Tooltip>
        </div>
        <p className='break-words mt-1'>{text}</p>
      </div>
    </motion.article>
  );
}

const variants: MotionProps = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.8 } },
  exit: { opacity: 0, transition: { duration: 0.2 } }
};
