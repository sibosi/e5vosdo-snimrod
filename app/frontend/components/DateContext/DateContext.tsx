import React, { createContext, useState, useContext } from 'react';
import { format } from 'date-fns';
import { hu } from 'date-fns/locale';

const DateContext = createContext<{
  date: Date;
  setDate: (date: Date) => void;
  nextDay: () => void;
  prevDay: () => void;
  displayableDate: string;
  dateInMenuFormat: string;
} | null>(null);

function formatDateForMenu(date: Date, simple = false) {
  if (simple) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const diff = (d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    if (diff === 0) return 'Ma';
    if (diff === 1) return 'Holnap';
    if (diff === -1) return 'Tegnap';
    return format(d, 'MM.dd EEE', { locale: hu });
  }
  return format(date, 'yyyy.MM.dd', { locale: hu });
}

export const DateProvider = ({ children }: { children: React.ReactNode }) => {
  const [date, setDate] = useState(new Date());

  const nextDay = React.useCallback(
    () =>
      setDate((prev) => {
        const d = new Date(prev);
        d.setDate(d.getDate() + 1);
        return d;
      }),
    [setDate]
  );

  const prevDay = React.useCallback(
    () =>
      setDate((prev) => {
        const d = new Date(prev);
        d.setDate(d.getDate() - 1);
        return d;
      }),
    [setDate]
  );

  const displayableDate = date.toLocaleDateString();
  const dateInMenuFormat = formatDateForMenu(date, true);

  const contextValue = React.useMemo(
    () => ({
      date,
      setDate,
      nextDay,
      prevDay,
      displayableDate,
      dateInMenuFormat,
    }),
    [date, setDate, nextDay, prevDay, displayableDate, dateInMenuFormat]
  );

  return (
    <DateContext.Provider value={contextValue}>{children}</DateContext.Provider>
  );
};

export const useDateContext = () => {
  const context = useContext(DateContext);
  if (!context) {
    throw new Error('useDateContext must be used within DateProvider');
  }
  return context;
};
