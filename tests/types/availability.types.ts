export interface AvailabilityResponse {
  resourceServiceId: number;
  weekStart: string;
  weekEnd: string;
  weekHeader: string;
  navigation: {
    canGoPrevious: boolean;
    canGoNext: boolean;
  };
  weekSchedule: DaySchedule[];
}

export interface DaySchedule {
  date: string;
  dayOfWeek: string;
  shortName: string;
  dayNumber: number;
  isAvailable: boolean;
  timeSlots: string[];
}

export interface SelectedTimeSlot {
  date: string;
  time: string;
}
