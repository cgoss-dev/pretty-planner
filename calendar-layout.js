// NOTE: Widget Sizes, Clear Fills, And Box Styling
function updateCalendarGridMetrics(item, page, box) {
  if (
    item.dataset.itemType !== "full-month" &&
    !isTimeGridCalendarType(item.dataset.itemType)
  ) {
    return;
  }

  const visibleDays = clamp(Number(item.dataset.visibleDays) || 7, 1, 7);
  const timeColumnUnits = getWeeklyTimeColumnGridUnits(item);
  const dayColumnUnits = visibleDays * 5;
  const columnUnits =
    item.dataset.itemType === "full-month"
      ? getFullMonthGridUnits(item).width
      : timeColumnUnits + dayColumnUnits + getWeekNotesColumnUnits(item);
  const bodyRowUnits = getWeeklyBodyGridRows(item);
  const rowUnits =
    item.dataset.itemType === "full-month"
      ? getFullMonthGridUnits(item).height
      : getWeeklyHeaderGridRows(item) +
        Math.max(
          1,
          Number(item.style.getPropertyValue("--weekly-slot-count")) || 1,
        ) *
          bodyRowUnits;
  const fallbackCellWidth = box.width / columnUnits;
  const fallbackCellHeight = box.height / rowUnits;
  const grid = page ? getGridSize(page) : null;
  const cellWidth = grid ? grid.x : fallbackCellWidth;
  const cellHeight = grid ? grid.y : fallbackCellHeight;

  item.style.setProperty("--weekly-column-cell-width", `${cellWidth}px`);
  item.style.setProperty("--weekly-row-cell-height", `${cellHeight}px`);

  if (item.dataset.itemType === "full-month") {
    const calendar = item.querySelector(".mini-month");
    const metricsTarget = calendar || item;
    const fixedRowUnits = Math.max(
      1,
      Number(item.style.getPropertyValue("--mini-month-fixed-row-units")) || 3,
    );
    const weekRowCount = Math.max(
      1,
      Number(item.style.getPropertyValue("--mini-month-week-row-count")) || 6,
    );
    const weekRowUnits = getFullMonthWeekRowUnits();

    item.style.setProperty("--mini-month-week-row-units", String(weekRowUnits));
    metricsTarget.style.setProperty(
      "--mini-month-week-row-units",
      String(weekRowUnits),
    );
    metricsTarget.style.setProperty(
      "--mini-month-week-row-height",
      `${cellHeight * weekRowUnits}px`,
    );
    metricsTarget.style.setProperty(
      "--mini-month-visible-row-units",
      String(fixedRowUnits + weekRowCount * weekRowUnits),
    );
    metricsTarget.style.setProperty(
      "--mini-month-max-row-units",
      String(fixedRowUnits + 6 * weekRowUnits),
    );
  }
}

function getPerpetualCalendarMaxGridRows() {
  return perpetualCalendarMaxDayRows + perpetualCalendarHeaderRows;
}

function getPerpetualCalendarMinGridColumns() {
  return (
    perpetualCalendarLeftColumnGridUnits +
    perpetualCalendarRightColumnMinGridUnits
  );
}

function getWeeklyVerticalDisplayColumnCount(item) {
  const visibleDays = clamp(Number(item.dataset.visibleDays) || 7, 1, 7);
  const weekStartDate = getScheduleViewStartDate(item);

  return getWeeklyDisplayColumns(weekStartDate, visibleDays, true).length;
}

function getWeeklyVerticalMinGridColumns(item) {
  const timeColumnUnits = getWeeklyTimeColumnGridUnits(item);
  const dayColumnUnits = getWeeklyVerticalDisplayColumnCount(item) * 5;

  return timeColumnUnits + dayColumnUnits + getWeekNotesColumnUnits(item);
}

function getWeeklyTimeColumnGridUnits(item) {
  if (
    !isTimeGridCalendarType(item.dataset.itemType) ||
    item.dataset.timeVisible === "false"
  ) {
    return 0;
  }

  return 2;
}

function getWeeklyHeaderGridRows(item) {
  return 4;
}

function getWeeklyBodyGridRows(item) {
  return 1;
}

function getScheduleViewFixedGridRows() {
  return 40;
}

function normalizeCalendarPageSize(value) {
  return value === "both-pages" ? "both-pages" : "one-page";
}

function getCalendarPageSizeGridUnits(item) {
  const pageSize = normalizeCalendarPageSize(item?.dataset?.calendarPageSize);

  if (item?.dataset?.itemType === "weekly-view") {
    return {
      width: pageSize === "both-pages" ? 62 : 32,
      height: 40,
    };
  }

  if (item?.dataset?.itemType === "full-month") {
    return {
      width: pageSize === "both-pages" ? 61 : 31,
      height: 42,
    };
  }

  return null;
}

function getFullMonthGridUnits(item) {
  const fixedSize = getCalendarPageSizeGridUnits(item);

  return {
    width: fixedSize?.width || 31,
    height: fixedSize?.height || 42,
  };
}

function getFullMonthTitleRowUnits() {
  return 4;
}

function getFullMonthWeekdayRowUnits() {
  return 2;
}

function getFullMonthWeekRowUnits() {
  return 6;
}

function getDiaryViewMinGridRows(item) {
  const visibleDays = clamp(Number(item?.dataset?.visibleDays) || 7, 1, 7);

  if (item?.dataset?.diaryLayout === "vertical") {
    return 20;
  }

  return visibleDays * 6;
}

function getDiaryViewMinGridColumns(item) {
  return item?.dataset?.diaryLayout === "vertical" ? 15 : 20;
}

function clampScheduleViewBox(item, page, box) {
  if (item.dataset.itemType !== "weekly-view") {
    return box;
  }

  const grid = getGridSize(page);

  return {
    ...box,
    height: grid.y * getScheduleViewFixedGridRows(),
  };
}

function getDiaryViewMaxGridRows() {
  return 42;
}

function getPerpetualCalendarVisibleGridRows(item) {
  const { month, year } = getCalendarEffectiveMonthYear(item);

  return perpetualCalendarHeaderRows + getCalendarDaysInMonth(year, month);
}

function clampPerpetualCalendarBox(item, page, box) {
  if (item.dataset.itemType !== "perpetual-calendar") {
    return box;
  }

  const grid = getGridSize(page);
  const minWidth = grid.x * getPerpetualCalendarMinGridColumns();
  const fixedHeight = grid.y * getPerpetualCalendarMaxGridRows();
  const snappedWidth = Math.max(
    minWidth,
    Math.round((box.width - minWidth) / grid.x) * grid.x + minWidth,
  );

  return {
    ...box,
    width: snappedWidth,
    height: fixedHeight,
  };
}

function clampMiniMonthBox(item, page, box) {
  if (item.dataset.itemType !== "mini-month") {
    return box;
  }

  const grid = getGridSize(page);
  const units = getMiniMonthGridUnits(item);

  return {
    ...box,
    width: grid.x * units.width,
    height: grid.y * units.height,
  };
}

function updatePerpetualCalendarGridMetrics(item, page, box) {
  if (item.dataset.itemType !== "perpetual-calendar") {
    return;
  }

  const grid = page ? getGridSize(page) : null;
  const fallbackWidthUnits =
    itemGridUnits["perpetual-calendar"]?.width ||
    getPerpetualCalendarMinGridColumns();
  const fallbackHeightUnits =
    itemGridUnits["perpetual-calendar"]?.height ||
    getPerpetualCalendarMaxGridRows();
  const columnWidth = grid ? grid.x : box.width / fallbackWidthUnits;
  const rowHeight = grid ? grid.y : box.height / fallbackHeightUnits;
  const rowCount = Math.min(
    getPerpetualCalendarMaxGridRows(),
    Math.max(1, Math.round(box.height / rowHeight)),
  );
  const visibleRows = getPerpetualCalendarVisibleGridRows(item);

  item.style.setProperty(
    "--perpetual-calendar-left-column-width",
    `${columnWidth * perpetualCalendarLeftColumnGridUnits}px`,
  );
  item.style.setProperty(
    "--perpetual-calendar-right-column-min-width",
    `${columnWidth * perpetualCalendarRightColumnMinGridUnits}px`,
  );
  item.style.setProperty("--perpetual-calendar-row-height", `${rowHeight}px`);
  item.style.setProperty("--perpetual-calendar-row-count", String(rowCount));
  item.style.setProperty(
    "--perpetual-calendar-title-row-units",
    String(perpetualCalendarHeaderRows),
  );
  item.style.setProperty(
    "--perpetual-calendar-visible-height",
    `${rowHeight * visibleRows}px`,
  );
  item.style.setProperty(
    "--perpetual-calendar-visible-rows",
    String(visibleRows),
  );
}
