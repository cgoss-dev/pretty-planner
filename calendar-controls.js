// NOTE: Calendar Widget Option Controls
function syncStartDayOptions(select, year, month, selectedDay) {
  if (!select) {
    return;
  }

  const daysInMonth = getCalendarDaysInMonth(year, month);
  const nextDay = clamp(Number(selectedDay) || 1, 1, daysInMonth);

  select.replaceChildren();
  for (let day = 1; day <= daysInMonth; day += 1) {
    const option = document.createElement("option");
    const date = new Date(year, month, day);
    const dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
      date.getDay()
    ];

    option.value = String(day);
    option.textContent = `${String(day).padStart(2, "0")} ${dayName}`;
    select.append(option);
  }
  select.value = String(nextDay);
}

function syncDiaryWeekOptions(
  select,
  year,
  month,
  selectedDay,
  weekStart = "monday",
) {
  if (!select) {
    return;
  }

  const daysInMonth = getCalendarDaysInMonth(year, month);
  const nextDay = clamp(Number(selectedDay) || 1, 1, daysInMonth);
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month, daysInMonth);
  const firstWeekStart = getWeekStartDate(monthStart, weekStart);
  const selectedWeekStart = getWeekStartDate(
    new Date(year, month, nextDay),
    weekStart,
  );

  select.replaceChildren();
  for (
    let weekDate = new Date(firstWeekStart);
    weekDate <= monthEnd;
    weekDate.setDate(weekDate.getDate() + 7)
  ) {
    const option = document.createElement("option");
    const anchorDay = clamp(
      weekDate.getMonth() === month ? weekDate.getDate() : 1,
      1,
      daysInMonth,
    );

    option.value = String(anchorDay);
    option.textContent = `Week ${getCalendarWeekNumber(weekDate, weekStart)}`;
    select.append(option);
    if (weekDate.getTime() === selectedWeekStart.getTime()) {
      select.value = option.value;
    }
  }

  if (!select.value) {
    select.value = String(nextDay);
  }
}

function normalizeCalendarTitleVisible(value) {
  return value === "false" || value === false ? "false" : "true";
}

function getVisibleCalendarDisplay(
  nextDisplay,
  currentDisplay,
  fallback = "full",
) {
  if (nextDisplay) {
    return nextDisplay;
  }

  if (currentDisplay) {
    return currentDisplay;
  }

  return fallback;
}

function setCalendarWidgetSettings(item, settings = {}) {
  const today = new Date();
  const defaultDateSettings =
    typeof getPlannerDefaultDateSettings === "function"
      ? getPlannerDefaultDateSettings()
      : {};
  const previousDateMode = item.dataset.dateMode || "fixed";
  const hasFixedDateSetting = ["month", "year", "startDay"].some((key) =>
    Object.prototype.hasOwnProperty.call(settings, key),
  );
  const requestedDateMode =
    settings.dateMode ||
    (hasFixedDateSetting ? "fixed" : item.dataset.dateMode);
  const nextDateMode = requestedDateMode === "relative" ? "relative" : "fixed";
  const weekNumberFormat = getWeekNumberFormatFromSettings(settings, item);
  const titleVisible =
    settings.titleVisible !== undefined
      ? normalizeCalendarTitleVisible(settings.titleVisible)
      : item.dataset.calendarTitleVisible ||
        (item.dataset.monthDisplay === "none" &&
        item.dataset.yearDisplay === "none"
          ? "false"
          : "true");

  item.dataset.weekNumberFormat = weekNumberFormat;
  item.dataset.weekNumbers = weekNumberFormat === "off" ? "false" : "true";
  item.dataset.weekStart =
    settings.weekStart ||
    item.dataset.weekStart ||
    defaultDateSettings.weekStart ||
    "monday";
  item.dataset.dateOrder = normalizeDateOrder(
    settings.dateOrder ||
      item.dataset.dateOrder ||
      defaultDateSettings.dateOrder,
  ).join(",");
  item.dataset.dateYearFormat = normalizeCalendarDateYearFormat(
    settings.yearFormat ||
      settings.dateYearFormat ||
      item.dataset.dateYearFormat ||
      defaultDateSettings.yearFormat,
  );
  item.dataset.dateMonthFormat = normalizeCalendarDateMonthFormat(
    settings.monthFormat ||
      settings.dateMonthFormat ||
      item.dataset.dateMonthFormat ||
      defaultDateSettings.monthFormat,
  );
  item.dataset.dateDayFormat = normalizeCalendarDateDayFormat(
    settings.dayFormat ||
      settings.dateDayFormat ||
      item.dataset.dateDayFormat ||
      defaultDateSettings.dayFormat,
  );
  item.dataset.weekdayLabelFormat = normalizeWeekdayLabelFormat(
    settings.weekdayLabelFormat ||
      item.dataset.weekdayLabelFormat ||
      (item.dataset.dateDayFormat === "full" ? "full" : "ddd"),
  );
  item.dataset.dateMode = nextDateMode;
  item.dataset.dateUnit = getCalendarRelativeDateUnit(item);
  item.dataset.dateOffset = clampRelativeDateOffset(
    settings.dateOffset ??
      (nextDateMode === "relative" && previousDateMode !== "relative"
        ? "0"
        : (item.dataset.dateOffset ?? "0")),
    item.dataset.dateUnit,
  );
  item.dataset.calendarTitleVisible = titleVisible;
  item.dataset.monthDisplay = getVisibleCalendarDisplay(
    settings.monthDisplay,
    item.dataset.monthDisplay,
    "full",
  );
  item.dataset.monthVisible =
    item.dataset.monthDisplay === "none" ? "false" : "true";
  item.dataset.month =
    settings.month || item.dataset.month || String(today.getMonth());
  item.dataset.yearDisplay = getVisibleCalendarDisplay(
    settings.yearDisplay,
    item.dataset.yearDisplay,
    "full",
  );
  item.dataset.yearVisible =
    item.dataset.yearDisplay === "none" ? "false" : "true";
  item.dataset.year =
    settings.year || item.dataset.year || String(today.getFullYear());
  item.dataset.startDay = settings.startDay || item.dataset.startDay || "1";
  item.dataset.visibleDays =
    settings.visibleDays || item.dataset.visibleDays || "7";
  item.dataset.diaryLayout =
    settings.diaryLayout || item.dataset.diaryLayout || "horizontal";
  item.dataset.diaryMonthYearVisible =
    settings.diaryMonthYearVisible ??
    item.dataset.diaryMonthYearVisible ??
    "false";
  item.dataset.diaryTitleLines =
    settings.diaryTitleLines === "one"
      ? "one"
      : settings.diaryTitleLines === "two"
        ? "two"
        : item.dataset.diaryTitleLines || "two";
  item.dataset.startDay = String(
    clamp(
      Number(item.dataset.startDay) || 1,
      1,
      getCalendarDaysInMonth(
        Number(item.dataset.year),
        Number(item.dataset.month),
      ),
    ),
  );
  item.dataset.timeIncrement =
    settings.timeIncrement || item.dataset.timeIncrement || "30";
  item.dataset.startTime = normalizeScheduleStartTime(
    settings.startTime || item.dataset.startTime || "06:00",
  );
  item.dataset.timeFormat = normalizeCalendarTimeFormat(
    settings.timeFormat ||
      item.dataset.timeFormat ||
      defaultDateSettings.timeFormat ||
      "24",
  );
  item.dataset.timeVisible =
    settings.timeVisible ?? item.dataset.timeVisible ?? "true";
  item.dataset.weeklyMonthYearVisible =
    settings.weeklyMonthYearVisible ??
    item.dataset.weeklyMonthYearVisible ??
    "false";
  item.dataset.shareWeekends =
    item.dataset.itemType === "full-month" ||
    item.dataset.itemType === "weekly-view"
      ? "true"
      : (settings.shareWeekends ?? item.dataset.shareWeekends ?? "false");
  item.dataset.calendarPageSize =
    item.dataset.itemType === "full-month" ||
    item.dataset.itemType === "weekly-view"
      ? normalizeCalendarPageSize(
          settings.pageSize ?? item.dataset.calendarPageSize,
        )
      : (item.dataset.calendarPageSize ?? "");
  item.dataset.weekNotes = normalizeWeekNotesPosition(
    settings.weekNotes ?? item.dataset.weekNotes,
  );
  renderMiniMonth(item);
  updateCalendarGridMetrics(item, getItemPage(item), getItemBox(item));
  updatePerpetualCalendarGridMetrics(item, getItemPage(item), getItemBox(item));

  const controls = getWidgetPanel(item) || item;
  const weekNumberControl = controls.querySelector(
    "[data-widget-control='week-number-format']",
  );
  const weekStartSelect = controls.querySelector(
    "[data-widget-control='week-start']",
  );
  const weekdayLabelSelect = controls.querySelector(
    "[data-widget-control='weekday-label-format']",
  );
  const dateModeSelect = controls.querySelector(
    "[data-widget-control='date-mode']",
  );
  const dateOffsetInput = controls.querySelector(
    "[data-widget-control='date-offset']",
  );
  const displayMonthSelect = controls.querySelector(
    "[data-widget-control='display-month']",
  );
  const displayYearSelect = controls.querySelector(
    "[data-widget-control='display-year']",
  );
  const displayDateModeSelect = controls.querySelector(
    "[data-widget-control='display-date-mode']",
  );
  const displayDaySelect = controls.querySelector(
    "[data-widget-control='display-day']",
  );
  const displayWeekNumberSelect = controls.querySelector(
    "[data-widget-control='display-week-number']",
  );
  const displayTitleVisibleSelect = controls.querySelector(
    "[data-widget-control='display-title-visible']",
  );
  const displayWeekStartSelect = controls.querySelector(
    "[data-widget-control='display-week-start']",
  );
  const monthVisibleInput = controls.querySelector(
    "[data-widget-control='month-visible']",
  );
  const yearVisibleInput = controls.querySelector(
    "[data-widget-control='year-visible']",
  );
  const monthSelect = controls.querySelector("[data-widget-control='month']");
  const yearSelect = controls.querySelector("[data-widget-control='year']");
  const startDaySelect = controls.querySelector(
    "[data-widget-control='start-day']",
  );
  const visibleDaysSelect = controls.querySelector(
    "[data-widget-control='visible-days']",
  );
  const diaryLayoutSelect = controls.querySelector(
    "[data-widget-control='diary-layout']",
  );
  const diaryTitleLinesSelect = controls.querySelector(
    "[data-widget-control='diary-title-lines']",
  );
  const timeIncrementSelect = controls.querySelector(
    "[data-widget-control='time-increment']",
  );
  const startTimeSelect = controls.querySelector(
    "[data-widget-control='start-time']",
  );
  const timeFormatSelect = controls.querySelector(
    "[data-widget-control='time-format']",
  );
  const timeVisibleInput = controls.querySelector(
    "[data-widget-control='time-visible']",
  );
  const shareWeekendsInput = controls.querySelector(
    "[data-widget-control='share-weekends']",
  );
  const calendarSizeButtons = controls.querySelectorAll(
    "[data-calendar-page-size]",
  );
  const weekNotesSelect = controls.querySelector(
    "[data-widget-control='week-notes']",
  );

  if (weekNumberControl) {
    if (weekNumberControl.type === "checkbox") {
      weekNumberControl.checked = item.dataset.weekNumberFormat !== "off";
    } else {
      weekNumberControl.value = item.dataset.weekNumberFormat;
    }
  }

  if (displayWeekNumberSelect) {
    displayWeekNumberSelect.value =
      item.dataset.weekNumberFormat === "off" ? "off" : "on";
  }

  if (displayTitleVisibleSelect) {
    displayTitleVisibleSelect.value =
      item.dataset.calendarTitleVisible !== "false" ? "true" : "false";
  }

  if (weekStartSelect) {
    weekStartSelect.value = item.dataset.weekStart;
  }

  if (displayWeekStartSelect) {
    displayWeekStartSelect.value = item.dataset.weekStart;
  }

  if (weekdayLabelSelect) {
    weekdayLabelSelect.value = item.dataset.weekdayLabelFormat;
  }

  if (dateModeSelect) {
    dateModeSelect.value = item.dataset.dateMode;
  }

  if (displayDateModeSelect) {
    displayDateModeSelect.value = item.dataset.dateMode;
  }

  if (dateOffsetInput) {
    syncRelativeDateOffsetInput(
      dateOffsetInput,
      item.dataset.dateUnit,
      item.dataset.dateOffset,
    );
  }

  if (monthVisibleInput) {
    monthVisibleInput.checked = item.dataset.monthDisplay !== "none";
  }

  if (yearVisibleInput) {
    yearVisibleInput.checked = item.dataset.yearDisplay !== "none";
  }

  if (monthSelect) {
    monthSelect.value = item.dataset.month;
  }

  if (yearSelect) {
    yearSelect.value = item.dataset.year;
  }

  if (item.dataset.itemType === "diary-view") {
    setCalendarDisplayControlLabel(
      displayDaySelect,
      "Week #",
      "Display week number",
    );
    syncDiaryWeekOptions(
      startDaySelect,
      Number(item.dataset.year),
      Number(item.dataset.month),
      item.dataset.startDay,
      item.dataset.weekStart,
    );
    syncDiaryWeekOptions(
      displayDaySelect,
      Number(item.dataset.year),
      Number(item.dataset.month),
      item.dataset.startDay,
      item.dataset.weekStart,
    );
  } else {
    setCalendarDisplayControlLabel(
      displayDaySelect,
      "Day",
      "Display start day",
    );
    syncStartDayOptions(
      startDaySelect,
      Number(item.dataset.year),
      Number(item.dataset.month),
      item.dataset.startDay,
    );
    syncStartDayOptions(
      displayDaySelect,
      Number(item.dataset.year),
      Number(item.dataset.month),
      item.dataset.startDay,
    );
  }
  syncCalendarDisplayDateControls(item, displayYearSelect, displayMonthSelect);

  if (visibleDaysSelect) {
    visibleDaysSelect.value = item.dataset.visibleDays;
  }

  if (diaryLayoutSelect) {
    diaryLayoutSelect.value = item.dataset.diaryLayout;
  }

  if (diaryTitleLinesSelect) {
    diaryTitleLinesSelect.value = item.dataset.diaryTitleLines;
  }

  if (timeIncrementSelect) {
    timeIncrementSelect.value = item.dataset.timeIncrement;
  }

  if (startTimeSelect) {
    startTimeSelect.value = item.dataset.startTime;
  }

  if (timeFormatSelect) {
    timeFormatSelect.value = item.dataset.timeFormat;
  }

  if (timeVisibleInput) {
    timeVisibleInput.checked = item.dataset.timeVisible !== "false";
  }

  if (shareWeekendsInput) {
    shareWeekendsInput.checked = item.dataset.shareWeekends === "true";
  }

  calendarSizeButtons.forEach((button) => {
    const isActive =
      button.dataset.calendarPageSize ===
      normalizeCalendarPageSize(item.dataset.calendarPageSize);

    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  if (weekNotesSelect) {
    weekNotesSelect.value = item.dataset.weekNotes;
  }

  if (typeof applyMainMenuControlVisibility === "function") {
    applyMainMenuControlVisibility(item);
  }

  const rebuiltSelects = new Set(
    [
      startDaySelect,
      displayDaySelect,
      displayYearSelect,
      displayMonthSelect,
    ].filter(Boolean),
  );

  rebuiltSelects.forEach(syncCustomSelect);
  controls.querySelectorAll("select").forEach((select) => {
    if (!rebuiltSelects.has(select)) {
      updateCustomSelectDisplay(select);
    }
  });
}
