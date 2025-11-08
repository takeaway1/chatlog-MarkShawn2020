import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import type { GetChatlogParams } from '@/libs/ChatlogAPI';

// Tab state with localStorage persistence
export const activeTabAtom = atomWithStorage<'session' | 'chatroom' | 'contact' | 'chatlog'>(
  'chatlog_active_tab',
  'session',
);

// Chatlog query parameters with localStorage persistence
export const chatlogParamsAtom = atomWithStorage<GetChatlogParams>(
  'chatlog_query_params',
  {
    time: 'last-7d',
    talker: '',
    sender: '',
    keyword: '',
    limit: 100,
  },
);

// Search trigger state (to trigger query execution)
export const chatlogSearchParamsAtom = atom<GetChatlogParams | null>(null);

// Validation error state
export const chatlogValidationErrorAtom = atom<string>('');

// Export dialog state
export const exportDialogOpenAtom = atom<boolean>(false);
