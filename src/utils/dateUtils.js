/** Format a Date (or date string) as `YYYY-MM-DD` in local time. */
export const formatDate = (date = new Date()) => {
  const d = typeof date === 'string' ? new Date(`${date}T00:00:00`) : date;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const formatTime = isoString => {
  if (!isoString) {
    return '';
  }
  const d = new Date(isoString);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

export const formatMonthTitle = (year, month) => `${year}년 ${month + 1}월`;

/** All `YYYY-MM-DD` strings visible in a calendar month grid (includes padding days). */
export const getMonthGrid = (year, month) => {
  const first = new Date(year, month, 1);
  const startPad = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];

  for (let i = 0; i < startPad; i += 1) {
    cells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d += 1) {
    cells.push(formatDate(new Date(year, month, d)));
  }
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }
  return cells;
};

export const isToday = dateStr => dateStr === formatDate(new Date());

export const shiftMonth = (year, month, delta) => {
  const d = new Date(year, month + delta, 1);
  return {year: d.getFullYear(), month: d.getMonth()};
};
