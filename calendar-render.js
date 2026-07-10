// Draw The Calendar Widgets
function getWeekStartDate(date, weekStart) {
  const nextDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  const offset =
    weekStart === "monday" ? (nextDate.getDay() + 6) % 7 : nextDate.getDay();

  nextDate.setDate(nextDate.getDate() - offset);
  return nextDate;
}

function getCalendarWeekNumber(
  date,
  weekStart,
  displayYear = date.getFullYear(),
) {
  const weekStartDate = getWeekStartDate(date, weekStart);
  const weekDate =
    weekStartDate.getFullYear() < displayYear
      ? new Date(displayYear, 0, 1)
      : weekStartDate;
  const yearStart = new Date(displayYear, 0, 1);
  const firstFullWeekStart = getWeekStartDate(yearStart, weekStart);

  if (firstFullWeekStart < yearStart) {
    firstFullWeekStart.setDate(firstFullWeekStart.getDate() + 7);
  }

  if (weekDate < firstFullWeekStart) {
    return 1;
  }

  return (
    Math.floor((weekDate - firstFullWeekStart) / 604800000) +
    (firstFullWeekStart.getTime() === yearStart.getTime() ? 1 : 2)
  );
}

function setCalendarDayNote(item, dayKey, value) {
  const notes = getCalendarDayNotes(item);
  const nextValue = value.trim();

  if (nextValue) {
    notes[dayKey] = nextValue;
  } else {
    delete notes[dayKey];
  }

  item.dataset.dayNotes = JSON.stringify(notes);
}

function setCalendarDayTextSettings(item, settings = {}) {
  if (!isCalendarTextItem(item)) {
    return;
  }

  const controls = getWidgetPanel(item) || item;

  item.dataset.dayTextSize = settings.size || item.dataset.dayTextSize || "10";
  item.dataset.dayTextFont =
    settings.font || item.dataset.dayTextFont || "annotation-mono";
  item.dataset.dayTextColor =
    settings.color || item.dataset.dayTextColor || "var(--color-gray1)";
  delete item.dataset.dayTextAlpha;
  item.dataset.dayTextBold =
    settings.bold ?? item.dataset.dayTextBold ?? "false";
  item.dataset.dayTextItalic =
    settings.italic ?? item.dataset.dayTextItalic ?? "false";
  item.dataset.dayTextUnderline =
    settings.underline ?? item.dataset.dayTextUnderline ?? "false";
  item.dataset.dayTextStrike =
    settings.strike ?? item.dataset.dayTextStrike ?? "false";
  item.dataset.dayTextAlign =
    settings.align || item.dataset.dayTextAlign || "center";
  item.dataset.dayTextYAlign =
    settings.yAlign || item.dataset.dayTextYAlign || "center";
  item.dataset.dayTextLineHeight =
    settings.lineHeight || item.dataset.dayTextLineHeight || "1";

  item.querySelectorAll(".calendar-day-text").forEach((textElement) => {
    applyCalendarDayTextStyle(item, textElement);
    if (textElement.classList.contains("calendar-day-text")) {
      updateCalendarDayTextOverflow(textElement);
    }
  });

  const fontSelect = controls.querySelector("[data-text-control='font']");
  const colorInput = controls.querySelector("[data-text-control='color']");
  const colorSwatches = controls.querySelector("[data-text-swatches='color']");
  const boldInput = controls.querySelector("[data-text-control='bold']");
  const italicInput = controls.querySelector("[data-text-control='italic']");
  const underlineInput = controls.querySelector(
    "[data-text-control='underline']",
  );
  const strikeInput = controls.querySelector("[data-text-control='strike']");
  const alignSelect = controls.querySelector("[data-text-control='align']");
  const yAlignSelect = controls.querySelector("[data-text-control='y-align']");
  const lineHeightSelect = controls.querySelector(
    "[data-text-control='line-height']",
  );

  updateTextSizeControls(controls, item.dataset.dayTextSize);

  if (fontSelect) {
    fontSelect.value = item.dataset.dayTextFont;
  }

  if (colorInput) {
    setPaletteControlValue(
      colorInput,
      colorSwatches,
      item.dataset.dayTextColor,
    );
  }

  if (boldInput) {
    updateTextToggleControl(boldInput, item.dataset.dayTextBold === "true");
  }

  if (italicInput) {
    updateTextToggleControl(italicInput, item.dataset.dayTextItalic === "true");
  }

  if (underlineInput) {
    updateTextToggleControl(
      underlineInput,
      item.dataset.dayTextUnderline === "true",
    );
  }

  if (strikeInput) {
    updateTextToggleControl(strikeInput, item.dataset.dayTextStrike === "true");
  }

  if (alignSelect) {
    alignSelect.value = item.dataset.dayTextAlign;
  }

  if (yAlignSelect) {
    yAlignSelect.value = item.dataset.dayTextYAlign;
  }

  updateTextAlignmentControls(
    controls,
    item.dataset.dayTextAlign,
    item.dataset.dayTextYAlign,
  );

  if (lineHeightSelect) {
    lineHeightSelect.value = item.dataset.dayTextLineHeight;
  }

  controls.querySelectorAll("select").forEach(updateCustomSelectDisplay);
}

function applyCalendarDayTextStyle(item, textElement) {
  textElement.style.fontSize = `${item.dataset.dayTextSize || "10"}px`;
  textElement.style.color = item.dataset.dayTextColor || "var(--color-gray1)";
  textElement.style.fontFamily = getStickerTextFont(
    item.dataset.dayTextFont || "annotation-mono",
  );
  textElement.style.fontWeight =
    item.dataset.dayTextBold === "true" ? "800" : "400";
  textElement.style.fontStyle =
    item.dataset.dayTextItalic === "true" ? "italic" : "normal";
  textElement.style.textDecoration = getTextDecorationValue(
    item.dataset.dayTextUnderline,
    item.dataset.dayTextStrike,
  );
  textElement.style.textAlign = item.dataset.dayTextAlign || "center";
  textElement.style.alignContent = getTextYAlignValue(
    item.dataset.dayTextYAlign,
  );
  textElement.style.lineHeight = getTextLineHeightPixels(
    item,
    item.dataset.dayTextLineHeight,
  );
}

function updateCalendarDayTextOverflow(textElement) {
  const cell = textElement.closest(".dayCell, .perpetual-calendar-row");
  const item = textElement.closest(
    ".planner-item-full-month, .planner-item-weekly-view, .planner-item-diary-view, .planner-item-perpetual-calendar",
  );

  if (!cell || !item) {
    return;
  }

  requestAnimationFrame(() => {
    cell.dataset.textOverflow = String(
      textElement.scrollHeight > textElement.clientHeight + 1,
    );
  });
}

function updateCalendarTextOverflow(item) {
  if (!item || !isCalendarTextItem(item)) {
    return;
  }

  item
    .querySelectorAll(".calendar-day-text")
    .forEach((textElement) => updateCalendarDayTextOverflow(textElement));
}

function getScheduleViewStartDate(item) {
  if (item.dataset.dateMode === "relative") {
    const date = getCalendarEffectiveDate(item);
    const firstDayIndex = item.dataset.weekStart === "sunday" ? 0 : 1;
    const dayOffset = (date.getDay() - firstDayIndex + 7) % 7;

    date.setDate(date.getDate() - dayOffset);
    return date;
  }

  const { month, year } = getCalendarEffectiveMonthYear(item);
  const startDay = clamp(
    Number(item.dataset.startDay) || 1,
    1,
    getCalendarDaysInMonth(year, month),
  );
  const fixedDate = new Date(year, month, startDay);

  return item.dataset.itemType === "diary-view"
    ? getWeekStartDate(fixedDate, item.dataset.weekStart || "monday")
    : fixedDate;
}

function normalizeRelativeDateUnit(unit) {
  return ["day", "week", "month", "year"].includes(unit) ? unit : "month";
}

function getCalendarRelativeDateUnit(item) {
  return item?.dataset?.itemType === "weekly-view" ||
    item?.dataset?.itemType === "diary-view"
    ? "week"
    : "month";
}

function getRelativeDateOffsetMax(unit) {
  const normalizedUnit = normalizeRelativeDateUnit(unit);

  if (normalizedUnit === "day") {
    return 31;
  }

  if (normalizedUnit === "month") {
    return 31;
  }

  if (normalizedUnit === "week") {
    return 12;
  }

  if (normalizedUnit === "year") {
    return 5;
  }

  return 12;
}

function clampRelativeDateOffset(offset, unit) {
  const maxOffset = getRelativeDateOffsetMax(unit);

  return String(clamp(Number(offset) || 0, -maxOffset, maxOffset));
}

function syncRelativeDateOffsetInput(input, unit, selectedOffset) {
  if (!input) {
    return;
  }

  const maxOffset = getRelativeDateOffsetMax(unit);
  const clampedOffset = clampRelativeDateOffset(selectedOffset, unit);

  input.dataset.offsetMin = String(-maxOffset);
  input.dataset.offsetMax = String(maxOffset);
  input.value = clampedOffset;
}

function replaceSelectOptions(select, options, selectedValue) {
  if (!select) {
    return;
  }

  select.replaceChildren();
  options.forEach(([value, label]) => {
    const option = document.createElement("option");

    option.value = String(value);
    option.textContent = String(label);
    select.append(option);
  });
  select.value = String(selectedValue);
}

function getCalendarDisplayOffsetParts(offset) {
  const number = Number(offset) || 0;
  const direction = number < 0 ? "-" : "+";
  const magnitude = clamp(Math.abs(number), 0, 31);

  return {
    direction,
    magnitude: String(magnitude),
  };
}

function getCalendarDisplayOffsetValue(direction, magnitude) {
  const amount = clamp(Number(magnitude) || 0, 0, 31);

  return String(direction === "-" ? -amount : amount);
}

function setCalendarDisplayControlLabel(select, labelText, ariaLabel) {
  const label = select?.closest(".item-calendar-display-control");
  const textNode = label
    ? [...label.childNodes].find((node) => node.nodeType === Node.TEXT_NODE)
    : null;

  if (textNode) {
    textNode.textContent = labelText;
  }
  select?.setAttribute("aria-label", ariaLabel);
}

function setCalendarDisplayControlHidden(select, hidden) {
  const label = select?.closest(".item-calendar-display-control");

  if (label) {
    label.hidden = hidden;
  }
}

function syncCalendarDisplayDateControls(
  item,
  displayYearSelect,
  displayMonthSelect,
) {
  if (!displayYearSelect || !displayMonthSelect) {
    return;
  }

  if (item.dataset.dateMode === "relative") {
    const offset = getCalendarDisplayOffsetParts(item.dataset.dateOffset);

    setCalendarDisplayControlHidden(displayYearSelect, false);
    setCalendarDisplayControlHidden(displayMonthSelect, false);
    setCalendarDisplayControlLabel(
      displayYearSelect,
      "Offset",
      "Display date offset direction",
    );
    setCalendarDisplayControlLabel(
      displayMonthSelect,
      "Amount",
      "Display date offset amount",
    );
    replaceSelectOptions(
      displayYearSelect,
      [
        ["+", "+"],
        ["-", "-"],
      ],
      offset.direction,
    );
    replaceSelectOptions(
      displayMonthSelect,
      Array.from(
        {
          length: 32,
        },
        (_, index) => {
          const value = String(index);

          return [value, value];
        },
      ),
      offset.magnitude,
    );
    return;
  }

  setCalendarDisplayControlHidden(
    displayYearSelect,
    item.dataset.itemType === "perpetual-calendar",
  );
  setCalendarDisplayControlHidden(displayMonthSelect, false);
  setCalendarDisplayControlLabel(displayYearSelect, "Year", "Display year");
  setCalendarDisplayControlLabel(displayMonthSelect, "Month", "Display month");
  replaceSelectOptions(
    displayYearSelect,
    Array.from(
      {
        length: calendarYearRange.end - calendarYearRange.start + 1,
      },
      (_, index) => {
        const year = String(calendarYearRange.start + index);

        return [year, year];
      },
    ),
    item.dataset.year,
  );
  replaceSelectOptions(
    displayMonthSelect,
    calendarMonthNames.map((monthName, index) => [String(index), monthName]),
    item.dataset.month,
  );
}

function getCalendarFixedNumber(value, fallback) {
  const number = Number(value);

  return Number.isFinite(number) ? number : fallback;
}

function addCalendarMonthsClamped(date, offset) {
  const targetYear = date.getFullYear();
  const targetMonth = date.getMonth() + offset;
  const target = new Date(targetYear, targetMonth, 1);
  const targetDay = Math.min(
    date.getDate(),
    getCalendarDaysInMonth(target.getFullYear(), target.getMonth()),
  );

  target.setDate(targetDay);
  return target;
}

function addCalendarYearsClamped(date, offset) {
  const targetYear = date.getFullYear() + offset;
  const targetMonth = date.getMonth();
  const targetDay = Math.min(
    date.getDate(),
    getCalendarDaysInMonth(targetYear, targetMonth),
  );

  return new Date(targetYear, targetMonth, targetDay);
}

function getCalendarEffectiveDate(item) {
  const today = new Date();

  if (item.dataset.dateMode !== "relative") {
    const month = getCalendarFixedNumber(item.dataset.month, today.getMonth());
    const year = getCalendarFixedNumber(item.dataset.year, today.getFullYear());
    const startDay = clamp(
      Number(item.dataset.startDay) || 1,
      1,
      getCalendarDaysInMonth(year, month),
    );

    return new Date(year, month, startDay);
  }

  const unit = getCalendarRelativeDateUnit(item);
  const offset = Number(clampRelativeDateOffset(item.dataset.dateOffset, unit));
  const date = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  if (unit === "day") {
    date.setDate(date.getDate() + offset);
  } else if (unit === "week") {
    date.setDate(date.getDate() + offset * 7);
  } else if (unit === "month") {
    return addCalendarMonthsClamped(date, offset);
  } else if (unit === "year") {
    return addCalendarYearsClamped(date, offset);
  }

  return date;
}

function getCalendarEffectiveMonthYear(item) {
  const date = getCalendarEffectiveDate(item);

  return {
    month: date.getMonth(),
    year: date.getFullYear(),
  };
}

function getWeeklyVisibleSlotCount(item) {
  const page = getItemPage(item);
  const timeIncrement = Number(item.dataset.timeIncrement) || 30;
  const startMinutes = parseTimeValue(item.dataset.startTime || "06:00");
  const maxSlotCount = Math.max(
    1,
    Math.ceil((24 * 60 - startMinutes) / timeIncrement),
  );
  const headerRows = getWeeklyHeaderGridRows(item);
  const bodyRows = getWeeklyBodyGridRows(item);

  if (!page) {
    return maxSlotCount;
  }

  const grid = getGridSize(page);
  const box = getItemBox(item);
  const rowCount = Math.max(1, Math.floor(box.height / grid.y));

  return clamp(Math.floor((rowCount - headerRows) / bodyRows), 1, maxSlotCount);
}

function getCalendarWeekName(weekIndex, month, year) {
  const ordinals = ["First", "Second", "Third", "Fourth", "Fifth", "Last"];
  const weekLabel = ordinals[Math.min(weekIndex - 1, ordinals.length - 1)];

  return `${weekLabel} week of ${calendarMonthNames[month]} ${year}`;
}

function normalizeWeekdayLabelFormat(format) {
  return ["d", "ddd", "full"].includes(format) ? format : "d";
}

function getWeekdayLabel(dayIndex, format = "d") {
  const names = [
    ["S", "Sun", "Sunday"],
    ["M", "Mon", "Monday"],
    ["T", "Tue", "Tuesday"],
    ["W", "Wed", "Wednesday"],
    ["T", "Thu", "Thursday"],
    ["F", "Fri", "Friday"],
    ["S", "Sat", "Saturday"],
  ];
  const labelIndex =
    normalizeWeekdayLabelFormat(format) === "full"
      ? 2
      : normalizeWeekdayLabelFormat(format) === "ddd"
        ? 1
        : 0;

  return names[dayIndex]?.[labelIndex] || "";
}

function getCalendarDateOrder(item) {
  const defaultDateSettings =
    typeof getPlannerDefaultDateSettings === "function"
      ? getPlannerDefaultDateSettings()
      : {};
  const order =
    typeof normalizeDateOrder === "function"
      ? normalizeDateOrder(
          item?.dataset?.dateOrder || defaultDateSettings.dateOrder,
        )
      : ["month", "date", "year", "day"];

  return order;
}

function normalizeCalendarDateYearFormat(format) {
  return format === "yy" ? "yy" : "yyyy";
}

function normalizeCalendarDateMonthFormat(format) {
  return format === "ddd" ? "ddd" : "full";
}

function normalizeCalendarDateDayFormat(format) {
  return format === "full" ? "full" : "ddd";
}

function getCalendarDateFormats(item) {
  const defaultDateSettings =
    typeof getPlannerDefaultDateSettings === "function"
      ? getPlannerDefaultDateSettings()
      : {};

  return {
    yearFormat: normalizeCalendarDateYearFormat(
      item?.dataset?.dateYearFormat || defaultDateSettings.yearFormat,
    ),
    monthFormat: normalizeCalendarDateMonthFormat(
      item?.dataset?.dateMonthFormat || defaultDateSettings.monthFormat,
    ),
    dayFormat: normalizeCalendarDateDayFormat(
      item?.dataset?.dateDayFormat || defaultDateSettings.dayFormat,
    ),
  };
}

function createCalendarDatePart(
  part,
  date,
  {
    weekdayLabelFormat = "d",
    monthDisplay = "full",
    yearDisplay = "full",
    yearFormat = "yyyy",
    monthFormat = "full",
    dayFormat = "ddd",
    todayKey = getTodayCalendarDayKey(),
  } = {},
) {
  const element = document.createElement("span");
  const dayKey = getCalendarDayKey(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );

  if (part === "day") {
    element.className =
      "calendar-date-part calendar-date-day weekly-view-day-name";
    element.textContent = getWeekdayLabel(
      date.getDay(),
      dayFormat === "full" ? "full" : "ddd",
    );
  } else if (part === "date") {
    element.className = "calendar-date-part calendar-date-number dayNumber";
    element.textContent = String(date.getDate()).padStart(2, "0");
    if (todayKey) {
      markCurrentCalendarDayNumber(element, dayKey, todayKey);
    }
  } else if (part === "year") {
    element.className = "calendar-date-part calendar-date-year";
    element.textContent =
      yearDisplay === "none"
        ? ""
        : yearFormat === "yy"
          ? String(date.getFullYear()).slice(-2)
          : String(date.getFullYear());
  } else {
    element.className =
      "calendar-date-part calendar-date-month weekly-view-month-name";
    element.textContent = getCalendarMonthTitle(
      date.getMonth(),
      monthFormat === "ddd" ? "short" : monthDisplay,
    );
  }

  return element;
}

function appendCalendarDateParts(container, item, date, options = {}) {
  const dateFormats = getCalendarDateFormats(item);
  const monthDisplay = options.hideMonthYear
    ? "none"
    : options.monthDisplay || item.dataset.monthDisplay || "full";
  const yearDisplay = options.hideMonthYear
    ? "none"
    : options.yearDisplay || item.dataset.yearDisplay || "full";
  const dateOrder = options.hideMonthYear
    ? ["day", "date"]
    : getCalendarDateOrder(item);

  dateOrder.forEach((part) => {
    if (
      (part === "month" && monthDisplay === "none") ||
      (part === "year" && yearDisplay === "none")
    ) {
      return;
    }

    container.append(
      createCalendarDatePart(part, date, {
        ...options,
        ...dateFormats,
        monthDisplay,
        yearDisplay,
      }),
    );
  });
}

function getMonthCalendarColumns(weekStart = "monday", shareWeekends = false) {
  const weekdays =
    weekStart === "monday" ? [1, 2, 3, 4, 5, 6, 0] : [0, 1, 2, 3, 4, 5, 6];

  if (!shareWeekends) {
    return weekdays.map((dayIndex) => ({
      type: "day",
      days: [dayIndex],
    }));
  }

  const weekdayOnly = weekdays.filter(
    (dayIndex) => dayIndex !== 0 && dayIndex !== 6,
  );
  const weekendColumn = {
    type: "shared-weekend",
    days: [6, 0],
  };

  const weekdayColumns = weekdayOnly.map((dayIndex) => ({
    type: "day",
    days: [dayIndex],
  }));

  return weekStart === "monday"
    ? [...weekdayColumns, weekendColumn]
    : [weekendColumn, ...weekdayColumns];
}

function startCalendarDayTextEditing(textElement, item) {
  if (typeof activeAction !== "undefined" && activeAction) {
    return;
  }

  if (textElement.isContentEditable) {
    textElement.focus();
    return;
  }

  textElement.setAttribute("contenteditable", "true");
  item.classList.add("is-editing-day-text");
  updateTextEditingState();
  renderKeyHints();

  requestAnimationFrame(() => {
    textElement.focus();

    const selection = window.getSelection();
    const range = document.createRange();

    range.selectNodeContents(textElement);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
  });

  textElement.addEventListener(
    "blur",
    () => {
      textElement.setAttribute("contenteditable", "false");
      normalizeEditablePlainText(textElement);
      item.classList.remove("is-editing-day-text");
      updateTextEditingState();
      renderKeyHints();
      setCalendarDayNote(
        item,
        textElement.dataset.dayKey,
        textElement.textContent || "",
      );
      updateCalendarDayTextOverflow(textElement);
      notifyTemplateChanged();
    },
    {
      once: true,
    },
  );
}

function handleCalendarTextPointerDown(textElement, event) {
  if (!textElement.isContentEditable) {
    return;
  }

  event.stopPropagation();
}

function isEditableCalendarTextEvent(event) {
  return Boolean(
    event.target?.closest?.(".calendar-day-text[contenteditable='true']"),
  );
}

function renderMiniMonth(item) {
  if (item.dataset.itemType === "diary-view") {
    renderDiaryView(item);
    return;
  }

  if (isTimeGridCalendarType(item.dataset.itemType)) {
    renderWeeklyVertical(item);
    return;
  }

  if (item.dataset.itemType === "perpetual-calendar") {
    renderPerpetualCalendar(item);
    return;
  }

  let calendar = item.querySelector(".mini-month");
  const weekNumberFormat = normalizeWeekNumberFormat(
    item.dataset.weekNumberFormat,
    item.dataset.weekNumbers === "false" ? "off" : "no-outlines",
  );
  const weekNumbersEnabled = weekNumberFormat !== "off";
  const weekNumberOutlines = weekNumberFormat === "outlines";
  const weekStart = item.dataset.weekStart || "monday";
  const weekdayLabelFormat = normalizeWeekdayLabelFormat(
    item.dataset.weekdayLabelFormat,
  );
  const shareWeekends =
    item.dataset.itemType === "full-month"
      ? true
      : item.dataset.shareWeekends === "true";
  const monthDisplay = item.dataset.monthDisplay || "full";
  const yearDisplay =
    item.dataset.yearDisplay ||
    (item.dataset.yearVisible === "false" ? "none" : "full");
  const dateFormats = getCalendarDateFormats(item);
  const { month, year } = getCalendarEffectiveMonthYear(item);
  const titleMonthText =
    monthDisplay === "none"
      ? ""
      : getCalendarMonthTitle(
          month,
          dateFormats.monthFormat === "ddd" ? "short" : "full",
        );
  const titleYearText =
    yearDisplay === "none"
      ? ""
      : getCalendarYearTitle(
          year,
          dateFormats.yearFormat === "yy" ? "short" : "full",
        );
  const monthVisible = titleMonthText !== "";
  const yearVisible = titleYearText !== "";
  const titleTextVisible = monthVisible || yearVisible;
  const titleRowVisible = monthVisible || yearVisible;
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOffset =
    weekStart === "monday" ? (firstDay.getDay() + 6) % 7 : firstDay.getDay();
  const displayColumns = getMonthCalendarColumns(weekStart, shareWeekends);
  const hasDayText = isCalendarTextItem(item);
  const dayNotes = hasDayText ? getCalendarDayNotes(item) : {};
  const todayKey = getTodayCalendarDayKey();
  const usesExpandedCalendarUnits = item.dataset.itemType === "full-month";
  const weekNotesPosition = usesExpandedCalendarUnits
    ? getWeekNotesPosition(item)
    : "off";
  const weekNotesEnabled = weekNotesPosition !== "off";
  const dayColumnSlots = displayColumns.map((displayColumn) => ({
    type: "day",
    displayColumn,
  }));
  const contentColumnSlots =
    weekNotesEnabled && weekNotesPosition === "first"
      ? [{ type: "notes" }, ...dayColumnSlots]
      : [...dayColumnSlots, ...(weekNotesEnabled ? [{ type: "notes" }] : [])];
  const columnSlots = [{ type: "week" }, ...contentColumnSlots];
  const allWeekRows = Array.from(
    {
      length: 6,
    },
    (_, weekIndex) => weekIndex,
  );
  const weekRows = allWeekRows.filter((weekIndex) => {
    const weekStartDayNumber = weekIndex * 7 + 1 - firstDayOffset;

    return weekStartDayNumber <= daysInMonth && weekStartDayNumber + 6 >= 1;
  });
  const calendarRows = [
    ...(titleRowVisible ? [0] : []),
    1,
    ...weekRows.map((weekIndex) => weekIndex + 2),
  ];
  const titleRowUnits = usesExpandedCalendarUnits
    ? getFullMonthTitleRowUnits()
    : 2;
  const dayNameRowUnits = usesExpandedCalendarUnits
    ? getFullMonthWeekdayRowUnits()
    : 1;
  const weekRowUnits = usesExpandedCalendarUnits
    ? getFullMonthWeekRowUnits()
    : 1;
  const visibleColumnCount = columnSlots.length;
  const visibleRowCount = calendarRows.length;
  const visibleColumnUnits = usesExpandedCalendarUnits
    ? getFullMonthGridUnits(item).width
    : visibleColumnCount;
  const visibleRowUnits =
    (titleRowVisible ? titleRowUnits : 0) +
    dayNameRowUnits +
    weekRows.length * weekRowUnits;
  const maxVisibleRowUnits =
    (titleRowVisible ? titleRowUnits : 0) + dayNameRowUnits + 6 * weekRowUnits;
  const fixedRowUnits = (titleRowVisible ? titleRowUnits : 0) + dayNameRowUnits;

  if (!calendar) {
    calendar = document.createElement("div");
    calendar.className = "mini-month";
    item.append(calendar);
  }

  calendar.replaceChildren();
  calendar.classList.toggle("has-week-numbers", weekNumbersEnabled);
  calendar.classList.toggle("has-week-number-outlines", weekNumberOutlines);
  calendar.classList.toggle("has-title-row", titleRowVisible);
  calendar.classList.toggle("no-title-row", !titleRowVisible);
  calendar.classList.toggle(
    "has-hidden-title-text",
    titleRowVisible && !titleTextVisible,
  );
  calendar.style.setProperty(
    "--mini-month-visible-columns",
    String(visibleColumnCount),
  );
  calendar.style.setProperty(
    "--mini-month-visible-rows",
    String(visibleRowCount),
  );
  calendar.style.setProperty(
    "--mini-month-visible-column-units",
    String(visibleColumnUnits),
  );
  calendar.style.setProperty(
    "--mini-month-visible-row-units",
    String(visibleRowUnits),
  );
  calendar.style.setProperty(
    "--mini-month-max-row-units",
    String(maxVisibleRowUnits),
  );
  calendar.style.setProperty(
    "--mini-month-fixed-row-units",
    String(fixedRowUnits),
  );
  calendar.style.setProperty(
    "--mini-month-title-row-units",
    String(titleRowUnits),
  );
  calendar.style.setProperty(
    "--mini-month-weekday-row-units",
    String(dayNameRowUnits),
  );
  calendar.style.setProperty(
    "--mini-month-week-row-count",
    String(weekRows.length),
  );
  calendar.style.setProperty(
    "--mini-month-day-column-count",
    String(displayColumns.length + (weekNotesEnabled ? 1 : 0)),
  );
  if (usesExpandedCalendarUnits) {
    calendar.style.width = "100%";
    const dayColumnUnits = shareWeekends ? 5 : 30 / displayColumns.length;
    const contentTemplateColumns = contentColumnSlots
      .map((slot) => {
        if (slot.type === "notes") {
          return "minmax(calc(var(--weekly-column-cell-width, 12px) * 5), 1fr)";
        }

        return `minmax(calc(var(--weekly-column-cell-width, 12px) * ${dayColumnUnits}), 1fr)`;
      })
      .join(" ");

    calendar.style.gridTemplateColumns = `var(--weekly-column-cell-width, 12px) ${contentTemplateColumns}`;
    calendar.style.gridTemplateRows = [
      ...(titleRowVisible
        ? [`calc(var(--weekly-row-cell-height, 12px) * ${titleRowUnits})`]
        : []),
      `calc(var(--weekly-row-cell-height, 12px) * ${dayNameRowUnits})`,
      `repeat(${weekRows.length}, calc(var(--weekly-row-cell-height, 12px) * ${weekRowUnits}))`,
    ].join(" ");
  } else {
    calendar.style.removeProperty("width");
    calendar.style.gridTemplateColumns = `repeat(${visibleColumnCount}, calc(100% / ${visibleColumnCount}))`;
    calendar.style.gridTemplateRows = `repeat(${visibleRowUnits}, calc(100% / ${visibleRowUnits}))`;
  }
  item.style.setProperty("--mini-month-fixed-row-units", String(fixedRowUnits));
  item.style.setProperty("--mini-month-title-row-units", String(titleRowUnits));
  item.style.setProperty(
    "--mini-month-weekday-row-units",
    String(dayNameRowUnits),
  );
  item.style.setProperty(
    "--mini-month-week-row-count",
    String(weekRows.length),
  );
  for (let row = 0; row < calendarRows.length; row += 1) {
    const calendarRow = calendarRows[row];
    const displayRow = usesExpandedCalendarUnits
      ? row + 1
      : calendarRows
          .slice(0, row)
          .reduce(
            (totalRows, previousCalendarRow) =>
              totalRows + (previousCalendarRow === 0 ? titleRowUnits : 1),
            1,
          );

    for (let column = 0; column < visibleColumnCount; column += 1) {
      const columnSlot = columnSlots[column];

      if (!weekNumbersEnabled && columnSlot.type === "week") {
        continue;
      }

      const cell = document.createElement("span");
      const displayColumnInfo =
        columnSlot.type === "day" ? columnSlot.displayColumn : null;
      const isTitleCell = calendarRow === 0 && column === 1;
      const displayColumn = column + 1;

      cell.className = "mini-month-cell";
      cell.dataset.themePart = "dayCell";
      cell.style.gridRow =
        calendarRow === 0 && !usesExpandedCalendarUnits
          ? `${displayRow} / span ${titleRowUnits}`
          : String(displayRow);
      cell.style.gridColumn = isTitleCell
        ? `2 / span ${contentColumnSlots.length}`
        : String(displayColumn);

      if (calendarRow === 0) {
        if (isTitleCell) {
          const titleYear = document.createElement("span");
          const titleMonth = document.createElement("span");

          cell.classList.add(
            "mini-month-month",
            (month + 1) % 2 === 1 ? "monthOdd" : "monthEven",
          );
          cell.dataset.themePart = "monthTitle";
          cell.dataset.calendarStyleKey = "month-title";
          cell.dataset.calendarStyleRole = "cell";
          titleYear.textContent = titleYearText;
          titleMonth.textContent = titleMonthText;
          titleYear.hidden = !titleTextVisible || !yearVisible;
          titleMonth.hidden = !titleTextVisible || !monthVisible;
          cell.classList.toggle(
            "has-title-pair",
            titleTextVisible && monthVisible && yearVisible,
          );
          cell.classList.toggle("has-hidden-title-text", !titleTextVisible);
          cell.append(titleMonth, titleYear);
        } else {
          continue;
        }
      } else if (columnSlot.type === "week") {
        cell.classList.add("mini-month-week");
        cell.dataset.calendarStyleKey =
          calendarRow === 1 ? "week-number-header" : `week-${calendarRow - 1}`;
        cell.dataset.calendarStyleRole = "cell";
        if (calendarRow === 1) {
          if (weekNumberOutlines) {
            cell.classList.add("weekNumberCell", "week-number-header");
          } else {
            continue;
          }
        } else {
          const weekDate = new Date(
            year,
            month,
            1 - firstDayOffset + (calendarRow - 2) * 7,
          );
          const weekNumberLabel = document.createElement("span");

          cell.classList.add("weekName", "weekNumberCell");
          cell.dataset.weekName = getCalendarWeekName(
            calendarRow - 1,
            month,
            year,
          );
          cell.title = cell.dataset.weekName;
          weekNumberLabel.className = "weekNumber";
          weekNumberLabel.dataset.themePart = "weekNumber";
          weekNumberLabel.textContent = String(
            getCalendarWeekNumber(weekDate, weekStart, year),
          );
          cell.append(weekNumberLabel);
        }
      } else if (columnSlot.type === "notes") {
        cell.classList.add("mini-month-week-notes", "dayCell");
        cell.dataset.themePart = "dayNotes";
        cell.dataset.calendarStyleKey =
          calendarRow === 1
            ? "week-notes-header"
            : `week-notes-${calendarRow - 1}`;
        cell.dataset.calendarStyleRole = "cell";
        if (calendarRow === 1) {
          const notesLabel = document.createElement("span");

          cell.classList.add("mini-month-day-name", "dayName");
          notesLabel.className = "calendar-title-label";
          notesLabel.textContent = "Note";
          cell.append(notesLabel);
        } else {
          const weekDate = new Date(
            year,
            month,
            1 - firstDayOffset + (calendarRow - 2) * 7,
          );
          const noteKey = getCalendarWeekNoteKey(weekDate, weekStart);
          const notesText = createCalendarWeekNotesText(
            item,
            noteKey,
            "mini-month-week-notes-text",
          );

          cell.dataset.dayKey = noteKey;
          cell.append(notesText);
          cell.addEventListener("dblclick", (event) => {
            if (isEditableCalendarTextEvent(event)) {
              return;
            }

            event.preventDefault();
            event.stopPropagation();
            startCalendarDayTextEditing(notesText, item);
          });
          updateCalendarDayTextOverflow(notesText);
        }
      } else if (calendarRow === 1) {
        cell.classList.add("mini-month-day-name", "dayName");
        cell.dataset.themePart = "weekdayHeader";
        cell.dataset.calendarStyleKey = `weekday-${displayColumn}`;
        cell.dataset.calendarStyleRole = "cell";
        if (displayColumnInfo?.type === "shared-weekend") {
          cell.classList.add("mini-month-shared-weekend");
          cell.textContent = "Wkd";
        } else {
          cell.textContent = getWeekdayLabel(
            displayColumnInfo.days[0],
            weekdayLabelFormat,
          );
        }
        if (
          displayColumnInfo.days.some(
            (dayIndex) => dayIndex === 0 || dayIndex === 6,
          )
        ) {
          cell.classList.add("mini-month-weekend");
        }
      } else {
        const weekStartDayNumber = (calendarRow - 2) * 7 + 1 - firstDayOffset;
        const renderedDayKeys = [];

        if (
          displayColumnInfo.days.some(
            (dayIndex) => dayIndex === 0 || dayIndex === 6,
          )
        ) {
          cell.classList.add("mini-month-weekend");
          cell.dataset.themePart = "weekendDayCell";
        }
        displayColumnInfo.days.forEach((dayIndex) => {
          const dayPosition =
            weekStart === "monday" ? (dayIndex + 6) % 7 : dayIndex;
          const dayNumber = weekStartDayNumber + dayPosition;

          if (dayNumber < 1 || dayNumber > daysInMonth) {
            return;
          }

          const dayNumberLabel = document.createElement("span");
          const dayKey = getCalendarDayKey(year, month, dayNumber);
          const isSharedWeekendDay =
            displayColumnInfo.type === "shared-weekend";
          const dayContent = isSharedWeekendDay
            ? document.createElement("span")
            : cell;

          cell.classList.add("dayCell");
          cell.classList.toggle(
            "mini-month-shared-weekend",
            isSharedWeekendDay,
          );
          if (isSharedWeekendDay) {
            dayContent.className = "mini-month-shared-weekend-day";
            dayContent.classList.add(
              dayIndex === 6 ? "is-saturday" : "is-sunday",
            );
            dayContent.style.gridRow = dayIndex === 6 ? "1" : "2";
          }
          renderedDayKeys.push(dayKey);
          dayNumberLabel.className = "mini-month-day-number dayNumber";
          dayNumberLabel.dataset.themePart = "dayNumber";
          markCurrentCalendarDayNumber(dayNumberLabel, dayKey, todayKey);
          dayNumberLabel.textContent = String(dayNumber);
          dayContent.append(dayNumberLabel);
          if (hasDayText) {
            const dayText = document.createElement("div");

            dayText.className = "calendar-day-text";
            dayText.dataset.dayKey = dayKey;
            dayText.setAttribute("contenteditable", "false");
            dayText.textContent = dayNotes[dayKey] || "";
            applyCalendarDayTextStyle(item, dayText);
            dayText.addEventListener("input", () =>
              updateCalendarDayTextOverflow(dayText),
            );
            dayText.addEventListener("paste", handlePlainTextPaste);
            dayText.addEventListener("dblclick", (event) => {
              if (isEditableCalendarTextEvent(event)) {
                event.stopPropagation();
                return;
              }

              event.preventDefault();
              event.stopPropagation();
              startCalendarDayTextEditing(dayText, item);
            });
            dayText.addEventListener("pointerdown", (event) => {
              handleCalendarTextPointerDown(dayText, event);
            });
            dayText.addEventListener("wheel", (event) => {
              if (dayText.isContentEditable) {
                event.stopPropagation();
              }
            });
            cell.addEventListener("dblclick", (event) => {
              if (isEditableCalendarTextEvent(event)) {
                return;
              }

              event.preventDefault();
              event.stopPropagation();
              startCalendarDayTextEditing(dayText, item);
            });
            dayContent.append(dayText);
            updateCalendarDayTextOverflow(dayText);
          }
          if (isSharedWeekendDay) {
            cell.append(dayContent);
          }
        });
        if (renderedDayKeys.length) {
          cell.dataset.dayKey = renderedDayKeys.join(",");
          cell.dataset.calendarStyleKey = `cell-r${displayRow}-c${displayColumn}`;
          cell.dataset.calendarStyleRole = "cell";
          markCurrentCalendarDay(cell, renderedDayKeys, todayKey);
        }
      }
      if (column === visibleColumnCount - 1) {
        cell.classList.add("mini-month-edge-right");
      }
      if (row === calendarRows.length - 1) {
        cell.classList.add("mini-month-edge-bottom");
      }
      if (isTitleCell) {
        cell.classList.add(
          "mini-month-draw-top-left",
          "mini-month-draw-top-right",
        );
      } else if (column > 0) {
        const isFirstDrawColumn = column === 1;
        const isLastDrawColumn = column === visibleColumnCount - 1;
        const isTopDrawRow = titleRowVisible ? row === 0 : calendarRow === 1;
        const isBottomDrawRow = row === calendarRows.length - 1;

        if (isFirstDrawColumn && isTopDrawRow) {
          cell.classList.add("mini-month-draw-top-left");
        }
        if (isLastDrawColumn && isTopDrawRow) {
          cell.classList.add("mini-month-draw-top-right");
        }
        if (isFirstDrawColumn && isBottomDrawRow) {
          cell.classList.add("mini-month-draw-bottom-left");
        }
        if (isLastDrawColumn && isBottomDrawRow) {
          cell.classList.add("mini-month-draw-bottom-right");
        }
      }

      if (cell.dataset.calendarStyleKey) {
        cell.addEventListener("click", (event) => {
          if (shouldSkipNextItemClick || hasActiveWidgetTextSelection()) {
            return;
          }
          selectCalendarCellStyleTarget(item, cell, event);
        });
      }

      calendar.append(cell);
    }
  }
  ["top", "right", "bottom", "left"].forEach((edge) => {
    const borderTarget = document.createElement("span");

    borderTarget.className = `calendar-border-hit-target is-${edge}`;
    borderTarget.setAttribute("aria-hidden", "true");
    borderTarget.addEventListener("click", (event) => {
      if (shouldSkipNextItemClick || hasActiveWidgetTextSelection()) {
        return;
      }

      selectCalendarBorderStyleTarget(item, event);
    });
    calendar.append(borderTarget);
  });
  applyThemeToWidget(item);
  applyCalendarPartStyles(item);
}

function renderPerpetualCalendar(item) {
  let calendar = item.querySelector(".perpetual-calendar");
  const monthDisplay = item.dataset.monthDisplay || "full";
  const yearDisplay =
    item.dataset.yearDisplay ||
    (item.dataset.yearVisible === "false" ? "none" : "full");
  const dateFormats = getCalendarDateFormats(item);
  const { month, year } = getCalendarEffectiveMonthYear(item);
  const titleMonthText =
    monthDisplay === "none"
      ? ""
      : getCalendarMonthTitle(
          month,
          dateFormats.monthFormat === "ddd" ? "short" : "full",
        );
  const titleYearText =
    yearDisplay === "none"
      ? ""
      : getCalendarYearTitle(
          year,
          dateFormats.yearFormat === "yy" ? "short" : "full",
        );
  const daysInMonth = getCalendarDaysInMonth(year, month);
  const dayNotes = getCalendarDayNotes(item);
  const todayKey = getTodayCalendarDayKey();

  if (!calendar) {
    calendar = document.createElement("div");
    calendar.className = "perpetual-calendar";
    item.append(calendar);
  }

  calendar.replaceChildren();
  calendar.classList.add("has-title-row");
  calendar.classList.remove("no-title-row");
  calendar.style.removeProperty("grid-template-rows");

  const titleCell = document.createElement("span");
  const titleLabel = document.createElement("span");

  titleCell.className = "perpetual-calendar-title";
  titleCell.style.gridRow = `span ${perpetualCalendarHeaderRows}`;
  titleCell.dataset.themePart = "monthTitle";
  titleLabel.className = "calendar-title-label";
  titleLabel.textContent = [titleMonthText, titleYearText]
    .filter(Boolean)
    .join(" ");
  titleCell.append(titleLabel);
  calendar.append(titleCell);

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    const dayKey = getCalendarDayKey(year, month, day);
    const row = document.createElement("span");
    const numberCell = document.createElement("span");
    const lineCell = document.createElement("span");

    row.className = "perpetual-calendar-row";
    row.dataset.themePart = "dayRow";
    row.dataset.dayKey = dayKey;
    if (date.getDay() === 0 || date.getDay() === 6) {
      row.classList.add("perpetual-calendar-weekend");
      row.dataset.themePart = "weekendDayRow";
    }
    if (day === daysInMonth) {
      row.classList.add("perpetual-calendar-edge-bottom");
    }
    markCurrentCalendarDay(row, dayKey, todayKey);

    numberCell.className = "perpetual-calendar-day-number dayNumber";
    numberCell.dataset.themePart = "dayNumber";
    numberCell.textContent = String(day);
    markCurrentCalendarDayNumber(numberCell, dayKey, todayKey);
    lineCell.className = "perpetual-calendar-line";

    const dayText = document.createElement("div");

    dayText.className = "calendar-day-text perpetual-calendar-day-text";
    dayText.dataset.dayKey = dayKey;
    dayText.setAttribute("contenteditable", "false");
    dayText.textContent = dayNotes[dayKey] || "";
    applyCalendarDayTextStyle(item, dayText);
    dayText.addEventListener("input", () =>
      updateCalendarDayTextOverflow(dayText),
    );
    dayText.addEventListener("paste", handlePlainTextPaste);
    dayText.addEventListener("pointerdown", (event) => {
      handleCalendarTextPointerDown(dayText, event);
    });
    dayText.addEventListener("wheel", (event) => {
      if (dayText.isContentEditable) {
        event.stopPropagation();
      }
    });
    lineCell.append(dayText);
    row.append(numberCell, lineCell);
    calendar.append(row);
  }
  applyThemeToWidget(item);
}

function renderDiaryView(item) {
  let calendar = item.querySelector(".diary-view");
  const weekdayLabelFormat = normalizeWeekdayLabelFormat(
    item.dataset.weekdayLabelFormat,
  );
  const monthDisplay = item.dataset.monthDisplay || "short";
  const visibleDays = clamp(Number(item.dataset.visibleDays) || 7, 1, 7);
  const diaryLayout =
    item.dataset.diaryLayout === "vertical" ? "vertical" : "horizontal";
  const yearDisplay =
    item.dataset.yearDisplay ||
    (item.dataset.yearVisible === "false" ? "none" : "full");
  const diaryTitleLines =
    item.dataset.diaryTitleLines === "one" ? "one" : "two";
  const startDate = getScheduleViewStartDate(item);
  const dayNotes = getCalendarDayNotes(item);
  const todayKey = getTodayCalendarDayKey();

  if (!calendar) {
    calendar = document.createElement("div");
    calendar.className = "diary-view";
    item.append(calendar);
  }

  calendar.replaceChildren();
  calendar.classList.toggle("is-vertical", diaryLayout === "vertical");
  calendar.classList.toggle("is-horizontal", diaryLayout !== "vertical");
  calendar.classList.toggle("is-title-one-line", diaryTitleLines === "one");
  calendar.classList.toggle("is-title-two-lines", diaryTitleLines !== "one");
  calendar.dataset.diaryMonthYearVisible =
    monthDisplay === "none" && yearDisplay === "none" ? "false" : "true";
  calendar.dataset.diaryTitleLines = diaryTitleLines;
  calendar.style.setProperty("--diary-row-count", String(visibleDays));
  calendar.style.setProperty("--diary-day-count", String(visibleDays));
  calendar.style.setProperty(
    "--diary-column-cell-width",
    `${getGridSize(getItemPage(item) || pages[0]).x}px`,
  );
  calendar.style.setProperty(
    "--diary-row-cell-height",
    `${getGridSize(getItemPage(item) || pages[0]).y}px`,
  );

  for (let index = 0; index < visibleDays; index += 1) {
    const date = new Date(startDate);
    const row = document.createElement("span");
    const dateLabel = document.createElement("span");
    const dayText = document.createElement("div");

    date.setDate(startDate.getDate() + index);

    const dayKey = getCalendarDayKey(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    );
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;

    row.className = "diary-view-row dayCell";
    row.dataset.themePart = isWeekend ? "weekendDayRow" : "dayRow";
    row.dataset.dayKey = dayKey;
    row.dataset.calendarStyleKey = `diary-day-${index + 1}`;
    row.dataset.calendarStyleRole = "cell";
    if (isWeekend) {
      row.classList.add("diary-view-weekend");
    }
    if (index === visibleDays - 1) {
      row.classList.add("diary-view-edge-bottom");
      row.classList.add("diary-view-edge-right");
    }
    markCurrentCalendarDay(row, dayKey, todayKey);

    dateLabel.className = "diary-view-date-label";
    dateLabel.dataset.themePart = isWeekend ? "weekendDayHeader" : "dayHeader";
    appendCalendarDateParts(dateLabel, item, date, {
      weekdayLabelFormat,
      monthDisplay,
      yearDisplay,
      todayKey,
    });

    dayText.className = "calendar-day-text diary-view-day-text";
    dayText.dataset.themePart = "dayNotes";
    dayText.dataset.dayKey = dayKey;
    dayText.setAttribute("contenteditable", "false");
    dayText.textContent = dayNotes[dayKey] || "";
    applyCalendarDayTextStyle(item, dayText);
    dayText.addEventListener("input", () =>
      updateCalendarDayTextOverflow(dayText),
    );
    dayText.addEventListener("paste", handlePlainTextPaste);
    dayText.addEventListener("dblclick", (event) => {
      if (isEditableCalendarTextEvent(event)) {
        event.stopPropagation();
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      startCalendarDayTextEditing(dayText, item);
    });
    dayText.addEventListener("pointerdown", (event) => {
      handleCalendarTextPointerDown(dayText, event);
    });
    dayText.addEventListener("wheel", (event) => {
      if (dayText.isContentEditable) {
        event.stopPropagation();
      }
    });
    row.addEventListener("click", (event) => {
      if (shouldSkipNextItemClick || hasActiveWidgetTextSelection()) {
        return;
      }
      selectCalendarCellStyleTarget(item, row, event);
    });
    row.append(dateLabel, dayText);
    calendar.append(row);
    updateCalendarDayTextOverflow(dayText);
  }

  ["top", "right", "bottom", "left"].forEach((edge) => {
    const borderTarget = document.createElement("span");

    borderTarget.className = `calendar-border-hit-target is-${edge}`;
    borderTarget.setAttribute("aria-hidden", "true");
    borderTarget.addEventListener("click", (event) => {
      if (shouldSkipNextItemClick || hasActiveWidgetTextSelection()) {
        return;
      }

      selectCalendarBorderStyleTarget(item, event);
    });
    calendar.append(borderTarget);
  });
  applyThemeToWidget(item);
  applyCalendarPartStyles(item);
}

function renderWeeklyVertical(item) {
  let calendar = item.querySelector(".weekly-view");
  const weekdayLabelFormat = normalizeWeekdayLabelFormat(
    item.dataset.weekdayLabelFormat,
  );
  const monthDisplay = item.dataset.monthDisplay || "full";
  const yearDisplay =
    item.dataset.yearDisplay ||
    (item.dataset.yearVisible === "false" ? "none" : "full");
  const visibleDays = clamp(Number(item.dataset.visibleDays) || 7, 1, 7);
  const timeIncrement = Number(item.dataset.timeIncrement) || 30;
  const startTime = item.dataset.startTime || "06:00";
  const timeFormat = item.dataset.timeFormat || "24";
  const timeVisible = item.dataset.timeVisible !== "false";
  const shareWeekends = true;
  const startMinutes = parseTimeValue(startTime);
  const slotCount = getWeeklyVisibleSlotCount(item);
  const weekStartDate = getScheduleViewStartDate(item);
  const dayNotes = getCalendarDayNotes(item);
  const displayColumns = getWeeklyDisplayColumns(
    weekStartDate,
    visibleDays,
    shareWeekends,
  );
  const weekNotesPosition = getWeekNotesPosition(item);
  const weekNotesEnabled = weekNotesPosition !== "off";
  const headerRowUnits = getWeeklyHeaderGridRows(item);
  const bodyRowUnits = getWeeklyBodyGridRows(item);
  const timeColumnUnits = getWeeklyTimeColumnGridUnits(item);
  const hasTimeColumn = timeColumnUnits > 0 && timeVisible;
  const dayColumnSlots = displayColumns.map((displayColumn) => ({
    type: "day",
    displayColumn,
  }));
  const bodyColumnSlots =
    weekNotesEnabled && weekNotesPosition === "first"
      ? [{ type: "notes" }, ...dayColumnSlots]
      : [...dayColumnSlots, ...(weekNotesEnabled ? [{ type: "notes" }] : [])];
  const columnSlots = [
    ...(hasTimeColumn ? [{ type: "time" }] : []),
    ...bodyColumnSlots,
  ];
  const columnCount = columnSlots.length;
  const sharedWeekendColumnIndex = columnSlots.findIndex(
    (slot) =>
      slot.type === "day" && slot.displayColumn?.type === "shared-weekend",
  );
  const sharedWeekendColumnStartUnits =
    sharedWeekendColumnIndex >= 0
      ? columnSlots
          .slice(0, sharedWeekendColumnIndex)
          .reduce(
            (sum, slot) => sum + (slot.type === "time" ? timeColumnUnits : 5),
            0,
          )
      : 0;
  const sharedWeekendColumnEndUnits = sharedWeekendColumnStartUnits + 5;
  const sharedWeekendSundayRow = Math.max(1, 1 + Math.floor(slotCount / 2) - 2);
  const sharedWeekendSundaySpan = Math.min(
    4,
    Math.max(1, slotCount - sharedWeekendSundayRow + 1),
  );
  const todayKey = getTodayCalendarDayKey();
  const weekNoteKey = getCalendarWeekNoteKey(
    weekStartDate,
    item.dataset.weekStart || "monday",
  );

  if (!calendar) {
    calendar = document.createElement("div");
    calendar.className = "weekly-view";
    item.append(calendar);
  }

  calendar.replaceChildren();
  calendar.style.setProperty("--weekly-slot-count", String(slotCount));
  calendar.style.setProperty(
    "--weekly-header-row-units",
    String(headerRowUnits),
  );
  calendar.style.setProperty(
    "--weekly-row-count",
    String(headerRowUnits + slotCount * bodyRowUnits),
  );
  calendar.style.setProperty("--weekly-body-row-units", String(bodyRowUnits));
  calendar.style.setProperty(
    "--weekly-day-count",
    String(displayColumns.length),
  );
  calendar.style.setProperty(
    "--weekly-time-column-units",
    String(hasTimeColumn ? timeColumnUnits : 0),
  );
  calendar.style.setProperty(
    "--weekly-visible-column-units",
    String(
      timeColumnUnits + displayColumns.length * 5 + (weekNotesEnabled ? 5 : 0),
    ),
  );
  calendar.dataset.weeklyMonthYearVisible =
    monthDisplay === "none" && yearDisplay === "none" ? "false" : "true";
  calendar.style.gridTemplateColumns = columnSlots
    .map((slot) => {
      if (slot.type === "time") {
        return `calc(var(--weekly-column-cell-width, 12px) * ${timeColumnUnits})`;
      }

      return `minmax(calc(var(--weekly-column-cell-width, 12px) * ${slot.type === "notes" ? 5 : 5}), 1fr)`;
    })
    .join(" ");
  calendar.style.gridTemplateRows = [
    `calc(var(--weekly-row-cell-height, 12px) * ${headerRowUnits})`,
    `repeat(${slotCount}, calc(var(--weekly-row-cell-height, 12px) * ${bodyRowUnits}))`,
  ].join(" ");
  calendar.classList.remove("has-week-numbers", "has-week-number-outlines");
  calendar.classList.toggle("has-time-column", hasTimeColumn);
  calendar.classList.remove("has-title-row");
  calendar.classList.add("no-title-row");

  const gridLineOverlay = document.createElement("span");
  const columnLineOverlay = document.createElement("span");

  gridLineOverlay.className = "weekly-view-grid-lines";
  gridLineOverlay.setAttribute("aria-hidden", "true");
  columnLineOverlay.className = "weekly-view-column-lines";
  columnLineOverlay.setAttribute("aria-hidden", "true");
  for (let row = 1; row < slotCount; row += 1) {
    const gridLine = document.createElement("span");
    const isSundayInteriorLine =
      sharedWeekendColumnIndex >= 0 &&
      row >= sharedWeekendSundayRow &&
      row < sharedWeekendSundayRow + sharedWeekendSundaySpan - 1;
    const isSundayEdgeLine =
      sharedWeekendColumnIndex >= 0 &&
      (row === sharedWeekendSundayRow - 1 ||
        row === sharedWeekendSundayRow + sharedWeekendSundaySpan - 1);
    const isHourBoundary = (startMinutes + row * timeIncrement) % 60 === 0;
    const shouldSplitSharedWeekendColumn =
      sharedWeekendColumnIndex >= 0 &&
      (isHourBoundary || isSundayInteriorLine || isSundayEdgeLine);

    gridLine.className = `weekly-view-grid-line ${isHourBoundary ? "is-solid" : "is-dotted"}`;
    gridLine.style.top = `calc(var(--weekly-row-cell-height, 12px) * var(--weekly-body-row-units, 1) * ${row})`;
    if (shouldSplitSharedWeekendColumn) {
      const beforeSegment = document.createElement("span");
      const afterSegment = document.createElement("span");

      gridLine.classList.add("has-shared-weekend-gap");
      gridLine.style.setProperty(
        "--weekly-sunday-column-start",
        `calc(var(--weekly-column-cell-width, 12px) * ${sharedWeekendColumnStartUnits})`,
      );
      gridLine.style.setProperty(
        "--weekly-sunday-column-end",
        `calc(var(--weekly-column-cell-width, 12px) * ${sharedWeekendColumnEndUnits})`,
      );
      beforeSegment.className =
        "weekly-view-grid-line-segment is-before-sunday";
      afterSegment.className = "weekly-view-grid-line-segment is-after-sunday";
      gridLine.append(beforeSegment);
      if (!isSundayInteriorLine) {
        const sharedWeekendSegment = document.createElement("span");

        sharedWeekendSegment.className = `weekly-view-grid-line-segment is-shared-weekend ${isSundayEdgeLine ? "is-solid" : "is-dotted"}`;
        gridLine.append(sharedWeekendSegment);
      }
      gridLine.append(afterSegment);
    }
    gridLineOverlay.append(gridLine);
  }
  for (let column = 1; column < columnCount; column += 1) {
    const columnLine = document.createElement("span");

    if (sharedWeekendColumnIndex >= 0 && column === sharedWeekendColumnIndex) {
      continue;
    }

    columnLine.className = "weekly-view-column-line";
    columnLine.style.gridColumn = String(column);
    columnLineOverlay.append(columnLine);
  }

  for (let row = 0; row < slotCount + 1; row += 1) {
    const calendarRow = row;

    for (let column = 0; column < columnCount; column += 1) {
      const columnSlot = columnSlots[column];
      const cell = document.createElement("span");
      const displayColumn = column + 1;

      cell.className = "weekly-view-cell";
      cell.dataset.themePart = "timeSlot";
      cell.style.gridRow = calendarRow === 0 ? "1" : String(calendarRow + 1);
      cell.style.gridColumn = String(displayColumn);
      if (calendarRow > 0 && calendarRow % 2 === 1) {
        cell.classList.add("weekly-view-alt-row-line");
      }

      if (calendarRow === 0 && columnSlot.type === "time") {
        cell.classList.add("weekly-view-time-heading");
        cell.dataset.themePart = "dayHeader";
      } else if (columnSlot.type === "notes") {
        cell.classList.add("weekly-view-notes", "dayCell");
        cell.dataset.themePart = "dayNotes";
        cell.dataset.calendarStyleKey = "week-notes";
        cell.dataset.calendarStyleRole = "cell";
        if (calendarRow === 0) {
          const notesLabel = document.createElement("span");

          cell.classList.add(
            "weekly-view-date",
            "dayName",
            "weekly-view-notes-heading",
          );
          cell.dataset.themePart = "weekNotesHeader";
          notesLabel.className = "calendar-title-label";
          notesLabel.textContent = "Note";
          cell.append(notesLabel);
        } else if (calendarRow === 1) {
          const notesText = createCalendarWeekNotesText(
            item,
            weekNoteKey,
            "weekly-view-week-notes-text",
          );

          cell.classList.add("weekly-view-slot", "weekly-view-week-notes");
          cell.classList.add("weekly-view-edge-bottom");
          cell.style.gridRow = `2 / span ${slotCount}`;
          cell.dataset.dayKey = weekNoteKey;
          cell.append(notesText);
          cell.addEventListener("dblclick", (event) => {
            if (isEditableCalendarTextEvent(event)) {
              return;
            }

            event.preventDefault();
            event.stopPropagation();
            startCalendarDayTextEditing(notesText, item);
          });
          updateCalendarDayTextOverflow(notesText);
        } else {
          continue;
        }
      } else if (calendarRow === 0) {
        const displayColumn = columnSlot.displayColumn;

        cell.classList.add("weekly-view-date", "dayCell", "dayName");
        cell.dataset.themePart = "dayHeader";
        if (displayColumn.type === "shared-weekend") {
          cell.classList.add("weekly-view-shared-weekend");
          cell.dataset.themePart = "weekendDayHeader";
        }
        if (
          displayColumn.dates.some(
            (date) => date.getDay() === 0 || date.getDay() === 6,
          )
        ) {
          cell.classList.add("weekly-view-weekend");
          cell.dataset.themePart = "weekendDayHeader";
        }
        cell.dataset.dayKey = displayColumn.dates
          .map((date) =>
            getCalendarDayKey(
              date.getFullYear(),
              date.getMonth(),
              date.getDate(),
            ),
          )
          .join(",");
        markCurrentCalendarDay(
          cell,
          displayColumn.dates.map((date) =>
            getCalendarDayKey(
              date.getFullYear(),
              date.getMonth(),
              date.getDate(),
            ),
          ),
          todayKey,
        );
        displayColumn.dates.slice(0, 1).forEach((date) => {
          const dateLabel = document.createElement("span");

          dateLabel.className = "weekly-view-date-label";
          appendCalendarDateParts(dateLabel, item, date, {
            weekdayLabelFormat,
            monthDisplay,
            yearDisplay,
            todayKey: null,
          });
          cell.append(dateLabel);
        });
      } else if (columnSlot.type === "time") {
        const timeMinutes = startMinutes + (calendarRow - 1) * timeIncrement;

        cell.classList.add("weekly-view-time");
        cell.dataset.themePart = "timeLabel";
        cell.textContent = shouldShowWeeklyTimeLabel(timeMinutes, timeIncrement)
          ? formatWeeklyTimeLabel(timeMinutes, timeFormat)
          : "";
      } else {
        const displayColumn = columnSlot.displayColumn;
        const slotMinutes = startMinutes + (calendarRow - 1) * timeIncrement;
        const primaryDate = displayColumn.dates[0];
        const slotKey =
          displayColumn.type === "shared-weekend"
            ? `${displayColumn.dates.map((date) => getCalendarDayKey(date.getFullYear(), date.getMonth(), date.getDate())).join("+")}T${formatMinutesAsTime(slotMinutes)}`
            : getWeeklySlotKey(primaryDate, slotMinutes);
        const slotText = document.createElement("div");
        const isSharedWeekendSundayRow =
          displayColumn.type === "shared-weekend" &&
          calendarRow === sharedWeekendSundayRow;
        const isSharedWeekendSundayCoveredRow =
          displayColumn.type === "shared-weekend" &&
          sharedWeekendSundaySpan > 1 &&
          calendarRow > sharedWeekendSundayRow &&
          calendarRow < sharedWeekendSundayRow + sharedWeekendSundaySpan;

        cell.classList.add("weekly-view-slot");
        cell.dataset.themePart = "timeSlot";
        if (displayColumn.type === "shared-weekend") {
          cell.classList.add("weekly-view-shared-weekend");
          cell.dataset.themePart = "weekendTimeSlot";
          const rowBeforeSundayBox = calendarRow - 1;
          const rowAfterSundayBox =
            calendarRow - (sharedWeekendSundayRow + sharedWeekendSundaySpan);

          if (
            calendarRow < sharedWeekendSundayRow &&
            rowBeforeSundayBox >= 0 &&
            rowBeforeSundayBox % 2 === 0
          ) {
            cell.dataset.weekendRowNumber = String(rowBeforeSundayBox / 2 + 1);
          } else if (rowAfterSundayBox >= 0 && rowAfterSundayBox % 2 === 0) {
            cell.dataset.weekendRowNumber = String(rowAfterSundayBox / 2 + 1);
          }
        }
        if (
          displayColumn.dates.some(
            (date) => date.getDay() === 0 || date.getDay() === 6,
          )
        ) {
          cell.classList.add("weekly-view-weekend");
          cell.dataset.themePart = "weekendTimeSlot";
        }
        cell.classList.add("dayCell");
        cell.dataset.dayKey = slotKey;
        markCurrentCalendarDay(
          cell,
          displayColumn.dates.map((date) =>
            getCalendarDayKey(
              date.getFullYear(),
              date.getMonth(),
              date.getDate(),
            ),
          ),
          todayKey,
        );
        if (isSharedWeekendSundayCoveredRow) {
          continue;
        }
        if (isSharedWeekendSundayRow) {
          const sundayDate = displayColumn.dates[1];
          const sundayMarker = document.createElement("span");

          cell.classList.add("weekly-view-sunday-date-cell");
          cell.style.gridRow = `${calendarRow + 1} / span ${sharedWeekendSundaySpan}`;
          delete cell.dataset.weekendRowNumber;
          sundayMarker.className =
            "weekly-view-date-label weekly-view-sunday-mid-marker";
          sundayMarker.dataset.themePart = "weekendDayHeader";
          appendCalendarDateParts(sundayMarker, item, sundayDate, {
            weekdayLabelFormat,
            monthDisplay,
            yearDisplay,
            todayKey: null,
          });
          cell.append(sundayMarker);
        } else {
          slotText.className = "calendar-day-text weekly-view-slot-text";
          slotText.dataset.themePart = "dayNotes";
          slotText.dataset.dayKey = slotKey;
          slotText.setAttribute("contenteditable", "false");
          slotText.textContent =
            dayNotes[slotKey] ||
            dayNotes[getWeeklySlotKey(primaryDate, slotMinutes)] ||
            "";
          applyCalendarDayTextStyle(item, slotText);
          slotText.addEventListener("input", () =>
            updateCalendarDayTextOverflow(slotText),
          );
          slotText.addEventListener("paste", handlePlainTextPaste);
          slotText.addEventListener("dblclick", (event) => {
            if (isEditableCalendarTextEvent(event)) {
              event.stopPropagation();
              return;
            }

            event.preventDefault();
            event.stopPropagation();
            startCalendarDayTextEditing(slotText, item);
          });
          slotText.addEventListener("pointerdown", (event) => {
            handleCalendarTextPointerDown(slotText, event);
          });
          slotText.addEventListener("wheel", (event) => {
            if (slotText.isContentEditable) {
              event.stopPropagation();
            }
          });
          cell.append(slotText);
          updateCalendarDayTextOverflow(slotText);
        }
      }

      if (column === columnCount - 1) {
        cell.classList.add("weekly-view-edge-right");
      }
      if (calendarRow === slotCount) {
        cell.classList.add("weekly-view-edge-bottom");
      }

      calendar.append(cell);
    }
  }
  calendar.append(columnLineOverlay);
  calendar.append(gridLineOverlay);
  applyThemeToWidget(item);
}

function refreshRelativeCalendarWidgets() {
  getAllPlannerItems()
    .filter(
      (item) => isCalendarItem(item) && item.dataset.dateMode === "relative",
    )
    .forEach((item) => {
      renderMiniMonth(item);
      updateCalendarGridMetrics(item, getItemPage(item), getItemBox(item));
      updatePerpetualCalendarGridMetrics(
        item,
        getItemPage(item),
        getItemBox(item),
      );
    });
}
