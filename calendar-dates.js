// NOTE: Calendar Date And Time Helpers
function getCalendarDayNotes(item) {
  try {
    return JSON.parse(item.dataset.dayNotes || "{}");
  } catch {
    return {};
  }
}

function getCalendarDayKey(year, month, dayNumber) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNumber).padStart(2, "0")}`;
}

function getTodayCalendarDayKey() {
  const today = new Date();

  return getCalendarDayKey(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
}

function hasCalendarDayKey(dayKeys, targetDayKey) {
  const keys = Array.isArray(dayKeys) ? dayKeys : String(dayKeys).split(/[,+]/);

  return keys.some((key) => key.split("T")[0] === targetDayKey);
}

function markCurrentCalendarDay(
  cell,
  dayKeys,
  todayKey = getTodayCalendarDayKey(),
) {
  const isCurrentDay = hasCalendarDayKey(dayKeys, todayKey);

  cell.classList.toggle("calendar-current-day", isCurrentDay);
  if (isCurrentDay) {
    cell.dataset.currentDay = "true";
  } else {
    delete cell.dataset.currentDay;
  }
}

function markCurrentCalendarDayNumber(
  element,
  dayKey,
  todayKey = getTodayCalendarDayKey(),
) {
  element.classList.toggle("calendar-current-day-number", dayKey === todayKey);
}

function getCalendarDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function parseTimeValue(value) {
  const [hour = "0", minute = "0"] = String(value || "00:00").split(":");

  return Number(hour) * 60 + Number(minute);
}

function formatMinutesAsTime(totalMinutes) {
  const dayMinutes = 24 * 60;
  const normalizedMinutes =
    ((totalMinutes % dayMinutes) + dayMinutes) % dayMinutes;
  const hour = Math.floor(normalizedMinutes / 60);
  const minute = normalizedMinutes % 60;

  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function normalizeScheduleStartTime(value) {
  const minutes = parseTimeValue(value);
  const hour = Math.floor(minutes / 60);

  if (!Number.isFinite(minutes) || hour < 0 || hour > 11) {
    return "00:00";
  }

  return formatMinutesAsTime(hour * 60);
}

function normalizeCalendarTimeFormat(format) {
  if (
    format === "12" ||
    format === "12-double" ||
    format === "compact" ||
    format === "ampm"
  ) {
    return "12";
  }

  return "24";
}

function formatWeeklyTimeLabel(totalMinutes, format = "24") {
  const dayMinutes = 24 * 60;
  const normalizedMinutes =
    ((totalMinutes % dayMinutes) + dayMinutes) % dayMinutes;
  const hour = Math.floor(normalizedMinutes / 60);
  const minute = normalizedMinutes % 60;
  const period = hour < 12 ? "a" : "p";
  const hour12 = hour % 12 || 12;
  const normalizedFormat = normalizeCalendarTimeFormat(format);

  if (normalizedFormat === "12") {
    return `${hour12}:${String(minute).padStart(2, "0")}${period}`;
  }

  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function getWeeklySlotKey(date, totalMinutes) {
  return `${getCalendarDayKey(date.getFullYear(), date.getMonth(), date.getDate())}T${formatMinutesAsTime(totalMinutes)}`;
}

function shouldShowWeeklyTimeLabel(totalMinutes, timeIncrement) {
  const normalizedMinutes = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);

  return normalizedMinutes % 60 === 0;
}

function getWeeklyDisplayColumns(startDate, visibleDays, shouldShareWeekends) {
  const dates = Array.from(
    {
      length: visibleDays,
    },
    (_, index) => {
      const date = new Date(startDate);

      date.setDate(startDate.getDate() + index);
      return date;
    },
  );
  const columns = [];

  for (let index = 0; index < dates.length; index += 1) {
    const date = dates[index];
    const nextDate = dates[index + 1];

    if (
      shouldShareWeekends &&
      date.getDay() === 6 &&
      nextDate &&
      nextDate.getDay() === 0
    ) {
      columns.push({
        type: "shared-weekend",
        dates: [date, nextDate],
      });
      index += 1;
    } else {
      columns.push({
        type: "day",
        dates: [date],
      });
    }
  }

  return columns;
}

function getCalendarMonthTitle(month, display = "full") {
  if (display === "number") {
    return String(month + 1);
  }

  if (display === "short") {
    return calendarMonthNames[month].slice(0, 3);
  }

  return calendarMonthNames[month];
}

function getCalendarYearTitle(year, display = "full") {
  if (display === "none") {
    return "";
  }

  if (display === "short") {
    return String(year).slice(-2);
  }

  return String(year);
}

function normalizeWeekNotesPosition(value) {
  return value === "first" || value === "last" ? value : "off";
}

function getWeekNotesPosition(item) {
  return normalizeWeekNotesPosition(item?.dataset?.weekNotes);
}

function getWeekNotesColumnUnits(item) {
  return getWeekNotesPosition(item) === "off" ? 0 : 5;
}

function getCalendarWeekNoteKey(date, weekStart = "monday") {
  const weekDate = getWeekStartDate(date, weekStart);

  return `week:${getCalendarDayKey(weekDate.getFullYear(), weekDate.getMonth(), weekDate.getDate())}`;
}

function createCalendarWeekNotesText(item, noteKey, className) {
  const dayNotes = getCalendarDayNotes(item);
  const text = document.createElement("div");

  text.className = `calendar-day-text ${className}`;
  text.dataset.themePart = "dayNotes";
  text.dataset.dayKey = noteKey;
  text.setAttribute("contenteditable", "false");
  text.textContent = dayNotes[noteKey] || "";
  applyCalendarDayTextStyle(item, text);
  text.addEventListener("input", () => updateCalendarDayTextOverflow(text));
  text.addEventListener("paste", handlePlainTextPaste);
  text.addEventListener("dblclick", (event) => {
    if (isEditableCalendarTextEvent(event)) {
      event.stopPropagation();
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    startCalendarDayTextEditing(text, item);
  });
  text.addEventListener("pointerdown", (event) => {
    handleCalendarTextPointerDown(text, event);
  });
  text.addEventListener("wheel", (event) => {
    if (text.isContentEditable) {
      event.stopPropagation();
    }
  });

  return text;
}
