import { Equipment } from '_tosslib/server/types';
import { EQUIPMENT_LABELS } from '../constants/room';

export const formatEquipment = (equipment: Equipment[]) => {
  return equipment.map((equipment: string) => EQUIPMENT_LABELS[equipment]).join(', ');
};
