import { Equipment } from '_tosslib/server/types';

export const EQUIPMENT_LABELS: Record<string, string> = {
  tv: 'TV',
  whiteboard: '화이트보드',
  video: '화상장비',
  speaker: '스피커',
};

export const ALL_EQUIPMENT: Equipment[] = ['tv', 'whiteboard', 'video', 'speaker'];
