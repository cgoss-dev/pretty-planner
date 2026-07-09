// NOTE: Save The Planner Into Browser Storage
function getPageId(page) {
  return page === pages[0] ? "left" : "right";
}

// NOTE: Page templates use grid units so saved widgets survive paper, zoom, and viewport changes.
function getGridTemplateBox(item, page) {
  const grid = getGridSize(page);
  const origin = getGridSnapOrigin(page);
  const box = getItemBox(item);

  return {
    x: Math.round((box.x - origin.x) / grid.x),
    y: Math.round((box.y - origin.y) / grid.y),
    width: Number((box.width / grid.x).toFixed(4)),
    height: Number((box.height / grid.y).toFixed(4)),
  };
}

// NOTE: Desk items are not tied to paper, so their frame is saved as a percentage of the desk.
function getDeskTemplateBox(item) {
  const deskRect = plannerDesk.getBoundingClientRect();
  const box = getItemBox(item);

  return {
    x: Number((box.x / deskRect.width).toFixed(4)),
    y: Number((box.y / deskRect.height).toFixed(4)),
    width: Number((box.width / deskRect.width).toFixed(4)),
    height: Number((box.height / deskRect.height).toFixed(4)),
  };
}

function getPageTemplateItems() {
  const pageItems = [];

  getAllPlannerItems().forEach((item) => {
    const page = item.dataset.pageId
      ? pages.find(
          (plannerPage) => getPageId(plannerPage) === item.dataset.pageId,
        ) || null
      : null;

    if (!page) {
      return;
    }

    pageItems.push({
      item,
      page,
      grid: getGridTemplateBox(item, page),
    });
  });

  return pageItems;
}

function resizePageTemplateItems(items) {
  items.forEach(({ item, page, grid }) => {
    const nextGrid = getGridSize(page);
    const origin = getGridSnapOrigin(page);
    const maxX = plannerConfig.gridColumns - Math.max(1, grid.width);
    const maxY = plannerConfig.gridRows - Math.max(1, grid.height);
    const nextBox = {
      x: origin.x + clamp(grid.x, 0, maxX) * nextGrid.x,
      y: origin.y + clamp(grid.y, 0, maxY) * nextGrid.y,
      width: Math.max(1, grid.width) * nextGrid.x,
      height: Math.max(1, grid.height) * nextGrid.y,
    };

    setItemBox(item, nextBox);
  });
}

function getDatasetBoolean(item, name, fallback = false) {
  const value = item.dataset[name];

  if (value === undefined) {
    return fallback;
  }

  return value === "true";
}

function getDatasetNumber(item, name, fallback = 0) {
  const value = Number(item.dataset[name]);

  return Number.isFinite(value) ? value : fallback;
}

function getStoredWidgetStyle(item) {
  return {
    fillColor: item.dataset.fillColor || null,
    borderColor: item.dataset.borderColor || null,
    borderWidth: item.dataset.borderWidth || null,
    borderEnabled: item.dataset.borderEnabled || null,
    pageFlagSide: item.dataset.pageFlagSide || null,
    themeMode: item.dataset.themeMode || null,
  };
}

function getStoredTextSettings(item) {
  const textElement = getStickerTextElement(item);

  return {
    enabled: getDatasetBoolean(item, "textEnabled"),
    content: isTocItem(item) ? "" : textElement?.textContent || "",
    appearsInToc: getDatasetBoolean(item, "textAppearsInToc"),
    size: item.dataset.textSize || null,
    font: item.dataset.textFont || null,
    color: item.dataset.textColor || null,
    bold: item.dataset.textBold || null,
    italic: item.dataset.textItalic || null,
    underline: item.dataset.textUnderline || null,
    strike: item.dataset.textStrike || null,
    align: item.dataset.textAlign || null,
    yAlign: item.dataset.textYAlign || null,
    lineHeight: item.dataset.textLineHeight || null,
  };
}

function getStoredCalendarSettings(item) {
  return {
    weekNumbers: getDatasetBoolean(item, "weekNumbers", true),
    weekNumberFormat:
      item.dataset.weekNumberFormat ||
      (item.dataset.weekNumbers === "false" ? "off" : "no-outlines"),
    weekStart: item.dataset.weekStart || "monday",
    weekdayLabelFormat: item.dataset.weekdayLabelFormat || "d",
    dateOrder: item.dataset.dateOrder || "month,date,year,day",
    yearFormat: item.dataset.dateYearFormat || "yyyy",
    monthFormat: item.dataset.dateMonthFormat || "full",
    dayFormat: item.dataset.dateDayFormat || "ddd",
    dateMode: item.dataset.dateMode || "fixed",
    dateOffset: getDatasetNumber(item, "dateOffset"),
    titleVisible: getDatasetBoolean(item, "calendarTitleVisible", true),
    monthDisplay: item.dataset.monthDisplay || "full",
    monthVisible: item.dataset.monthDisplay !== "none",
    month: getDatasetNumber(item, "month"),
    monthLabel: calendarMonthNames[getDatasetNumber(item, "month")],
    yearDisplay: item.dataset.yearDisplay || "full",
    yearVisible: item.dataset.yearDisplay !== "none",
    year: getDatasetNumber(item, "year", new Date().getFullYear()),
    startDay: getDatasetNumber(item, "startDay", 1),
    visibleDays: getDatasetNumber(item, "visibleDays", 7),
    diaryLayout: item.dataset.diaryLayout || "horizontal",
    diaryMonthYearVisible: item.dataset.diaryMonthYearVisible !== "false",
    diaryTitleLines: item.dataset.diaryTitleLines || "two",
    timeIncrement: getDatasetNumber(item, "timeIncrement", 30),
    startTime: item.dataset.startTime || "06:00",
    timeFormat: item.dataset.timeFormat || "24",
    timeVisible: item.dataset.timeVisible !== "false",
    weeklyMonthYearVisible: item.dataset.weeklyMonthYearVisible !== "false",
    shareWeekends: getDatasetBoolean(item, "shareWeekends"),
    pageSize: item.dataset.calendarPageSize || null,
    weekNotes: item.dataset.weekNotes || "off",
    dayNotes: isCalendarTextItem(item) ? getCalendarDayNotes(item) : null,
    dayTextAppearsInToc: getDatasetBoolean(item, "dayTextAppearsInToc"),
    dayText: isCalendarTextItem(item)
      ? {
          size: item.dataset.dayTextSize || null,
          font: item.dataset.dayTextFont || null,
          color: item.dataset.dayTextColor || null,
          bold: item.dataset.dayTextBold || null,
          italic: item.dataset.dayTextItalic || null,
          underline: item.dataset.dayTextUnderline || null,
          strike: item.dataset.dayTextStrike || null,
          align: item.dataset.dayTextAlign || null,
          yAlign: item.dataset.dayTextYAlign || null,
          lineHeight: item.dataset.dayTextLineHeight || null,
        }
      : null,
  };
}

// NOTE: Converts one live widget into portable storage data.
function serializePlannerItem(item) {
  const pageId = item.dataset.pageId || "";
  const page = pageId
    ? pages.find((plannerPage) => getPageId(plannerPage) === pageId) || null
    : null;
  const baseItem = {
    id: item.dataset.templateId,
    type: item.dataset.itemType || "sticker",
    groupId: item.dataset.groupId || null,
    style: getStoredWidgetStyle(item),
    widget: isCalendarItem(item) ? getStoredCalendarSettings(item) : null,
    text: isStickerTextItem(item) ? getStoredTextSettings(item) : null,
  };

  if (page) {
    return {
      ...baseItem,
      placement: "page",
      spreadIndex: getItemSpreadIndex(item),
      page: pageId,
      pageNumber: getItemPageNumber(item),
      grid: getGridTemplateBox(item, page),
    };
  }

  return {
    ...baseItem,
    placement: "desk",
    frame: getDeskTemplateBox(item),
  };
}

// NOTE: Public export shape for consumers that need the whole visible planner layout.
function serializePlannerTemplate() {
  return {
    schemaVersion: templateSchemaVersion,
    type: "planner-layout-template",
    page: {
      size: plannerConfig.paperKey,
      label: plannerConfig.paper.label,
      width: Number(plannerConfig.pageWidth.toFixed(4)),
      height: Number(plannerConfig.pageHeight.toFixed(4)),
      unit: plannerConfig.grid.unit,
      color: plannerConfig.paperColorKey,
      colorLabel: plannerConfig.paperColor.label,
      colorValue: plannerConfig.paperColor.color,
      accentColor: plannerConfig.accentColorKey,
      accentColorLabel: plannerConfig.accentColor.label,
      accentColorValue: plannerConfig.accentColor.color,
      deskColor: plannerConfig.deskColorKey,
      deskColorLabel: plannerConfig.deskColor.label,
      deskColorValue: plannerConfig.deskColor.color,
      deskImageValue: plannerConfig.deskColor.image || null,
      widthInches: Number(
        convertLength(
          plannerConfig.pageWidth,
          plannerConfig.grid.unit,
          "in",
        ).toFixed(4),
      ),
      heightInches: Number(
        convertLength(
          plannerConfig.pageHeight,
          plannerConfig.grid.unit,
          "in",
        ).toFixed(4),
      ),
      grid: plannerConfig.gridKey,
      gridLabel: plannerConfig.grid.label,
      gridInterval: plannerConfig.grid.size,
      gridUnit: plannerConfig.grid.unit,
      gridIntervalInches: Number(
        convertLength(
          plannerConfig.grid.size,
          plannerConfig.grid.unit,
          "in",
        ).toFixed(4),
      ),
      gridColumns: plannerConfig.gridColumns,
      gridRows: plannerConfig.gridRows,
    },
    spread: {
      pages: ["left", "right"],
      currentIndex: currentSpreadIndex,
      count: notebookSpreadCount,
      pageCount: notebookPageCount,
      visiblePages: [
        getCurrentSpreadPageNumber("left"),
        getCurrentSpreadPageNumber("right"),
      ].filter(isPageNumberAvailable),
      spineLeewayGridColumns: 1,
    },
    guides: {
      thirds: plannerConfig.guides.thirds,
      fourths: plannerConfig.guides.fourths,
    },
    tocEntries: getTocTitleEntries(),
    items: getAllPlannerItems().map(serializePlannerItem),
  };
}

function getEmptyPlannerState() {
  return {
    schemaVersion: plannerStateSchemaVersion,
    settings: null,
    books: {},
  };
}

function readPlannerState() {
  try {
    const storedState = window.localStorage.getItem(plannerStorageKey);
    const legacyStoredState =
      !storedState && legacyPlannerStorageKey
        ? window.localStorage.getItem(legacyPlannerStorageKey)
        : null;
    const state =
      storedState || legacyStoredState
        ? JSON.parse(storedState || legacyStoredState)
        : null;

    if (!state || typeof state !== "object") {
      return getEmptyPlannerState();
    }

    // Migrate old saves forward the first time a valid legacy key is found.
    if (!storedState && legacyStoredState) {
      writePlannerState(state);
    }

    return {
      schemaVersion: plannerStateSchemaVersion,
      settings: state.settings || null,
      books: state.books && typeof state.books === "object" ? state.books : {},
    };
  } catch {
    return getEmptyPlannerState();
  }
}

function writePlannerState(state) {
  try {
    window.localStorage.setItem(
      plannerStorageKey,
      JSON.stringify({
        schemaVersion: plannerStateSchemaVersion,
        settings: state.settings || null,
        books: state.books || {},
      }),
    );
  } catch {}
}

// NOTE: Save enough state to undo the last meaningful storage write.
let plannerUndoState = null;
let isApplyingPlannerUndo = false;

function getCurrentPlannerStateForStorage() {
  const currentState = readPlannerState();

  return {
    schemaVersion: plannerStateSchemaVersion,
    settings: serializePlannerSettings(),
    books: {
      ...currentState.books,
      [plannerConfig.paperKey]: serializePlannerBook(),
    },
  };
}

function rememberPlannerUndoState(previousState, nextState) {
  if (isRestoringPlannerState || isApplyingPlannerUndo) {
    return;
  }

  if (JSON.stringify(previousState) !== JSON.stringify(nextState)) {
    plannerUndoState = previousState;
  }
}

function setSelectValue(select, value) {
  if (!select || value === undefined || value === null) {
    return;
  }

  const nextValue = String(value);

  if (Array.from(select.options).some((option) => option.value === nextValue)) {
    select.value = nextValue;
  }
}

// NOTE: Stores user-facing controls separately from the current book so settings follow paper changes.
function serializePlannerSettings() {
  return {
    paper: paperSelect?.value || "letter",
    paperColor: paperColorSelect?.value || "White",
    customPaperColor: paperColors.Custom?.color || "#ffffff",
    accentColor: accentColorSelect?.value || "Red",
    customAccentColor: accentColors.Custom?.color || "#ff0000",
    deskColor: deskColorSelect?.value || "wood-brown",
    defaults:
      typeof serializePlannerDefaults === "function"
        ? serializePlannerDefaults()
        : null,
    guides: Object.fromEntries(
      guideInputs.map((input) => [input.dataset.guide, input.checked]),
    ),
    view: {
      zoomIndex: viewZoomIndex,
    },
  };
}

function restorePlannerSettings(settings) {
  if (!settings) {
    return;
  }

  setSelectValue(paperSelect, settings.paper);
  if (settings.customPaperColor && paperColors.Custom) {
    paperColors.Custom.color = settings.customPaperColor;
  }
  if (settings.customAccentColor && accentColors.Custom) {
    accentColors.Custom.color = settings.customAccentColor;
  }
  setSelectValue(paperColorSelect, settings.paperColor);
  setSelectValue(accentColorSelect, settings.accentColor);
  setSelectValue(deskColorSelect, settings.deskColor);
  if (settings.defaults && typeof restorePlannerDefaults === "function") {
    restorePlannerDefaults(settings.defaults);
  }
  if (settings.guides && typeof settings.guides === "object") {
    if (settings.guides.halves === true) {
      settings.guides.fourths = true;
    }
    guideInputs.forEach((input) => {
      if (settings.guides[input.dataset.guide] !== undefined) {
        input.checked = Boolean(settings.guides[input.dataset.guide]);
      }
    });
  }
  if (settings.view && typeof settings.view === "object") {
    viewZoomIndex = clamp(
      Number(settings.view.zoomIndex) || 0,
      0,
      viewZoomLevels.length - 1,
    );
  }
}

function restoreSavedSettings() {
  restorePlannerSettings(readPlannerState().settings);
}

// NOTE: A book is the current paper-size-specific planner: page count, spread position, and widgets.
function serializePlannerBook() {
  return {
    schemaVersion: plannerStateSchemaVersion,
    pageCount: notebookPageCount,
    spread: {
      currentIndex: currentSpreadIndex,
      count: notebookSpreadCount,
      pageCount: notebookPageCount,
    },
    items: getAllPlannerItems().map(serializePlannerItem),
  };
}

function savePlannerBook(paperKey = plannerConfig.paperKey) {
  if (isRestoringPlannerState) {
    return;
  }

  const state = readPlannerState();
  const nextState = {
    ...state,
    books: {
      ...state.books,
      [paperKey]: serializePlannerBook(),
    },
  };

  rememberPlannerUndoState(state, nextState);
  writePlannerState(nextState);
}

function savePlannerState() {
  if (isRestoringPlannerState) {
    return;
  }

  const state = readPlannerState();
  const nextState = getCurrentPlannerStateForStorage();

  rememberPlannerUndoState(state, nextState);
  writePlannerState(nextState);
}

function restorePlannerUndoState() {
  if (!plannerUndoState) {
    return false;
  }

  try {
    isApplyingPlannerUndo = true;
    writePlannerState(plannerUndoState);
    restorePlannerSettings(plannerUndoState.settings || null);
    plannerConfig = buildPlannerConfig();
    applyPlannerConfig();
    restorePlannerBook(plannerConfig.paperKey);
    plannerUndoState = null;
    syncNotebookSpread();
    applyViewControls();
    renderTocWidgets();
    window.dispatchEvent(
      new CustomEvent("perfectplanner:templatechange", {
        detail: serializePlannerTemplate(),
      }),
    );
    return true;
  } finally {
    isApplyingPlannerUndo = false;
  }
}

window.restorePlannerUndoState = restorePlannerUndoState;

function getStoredBook(paperKey) {
  return readPlannerState().books?.[paperKey] || null;
}

function normalizeStoredBoolean(value, fallback = "false") {
  if (value === undefined || value === null) {
    return fallback;
  }

  return value === true || value === "true" ? "true" : "false";
}

function normalizeWeekNumberFormat(value, fallback = "no-outlines") {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  if (value === false || value === "false" || value === "off") {
    return "off";
  }

  if (value === true || value === "true") {
    return fallback === "off" ? "no-outlines" : fallback;
  }

  return value === "outlines" || value === "no-outlines" ? value : fallback;
}

function getWeekNumberFormatFromSettings(settings = {}, item = null) {
  const current = normalizeWeekNumberFormat(
    item?.dataset?.weekNumberFormat,
    item?.dataset?.weekNumbers === "false" ? "off" : "no-outlines",
  );

  if (settings.weekNumberFormat !== undefined) {
    return normalizeWeekNumberFormat(settings.weekNumberFormat, current);
  }

  if (settings.weekNumbers !== undefined) {
    return normalizeWeekNumberFormat(settings.weekNumbers, current);
  }

  return current;
}

function normalizePlannerItemType(type = "sticker") {
  if (type === "sticky") {
    return "sticker";
  }

  if (type === "mini-cal" || type === "mini-cal2" || type === "mini-month2") {
    return "mini-month";
  }

  if (type === "full-cal") {
    return "full-month";
  }

  if (type === "weekly-vertical") {
    return "weekly-view";
  }

  return type;
}

function isUnsupportedPlannerItemType(type) {
  return type === "page-title" || type === "day-view";
}

function isLegacyMiniMonth2Type(type) {
  return type === "mini-cal2" || type === "mini-month2";
}

function getStoredCalendarPageSize(type, itemData = {}) {
  if (type !== "weekly-view" && type !== "full-month") {
    return null;
  }

  const storedWidth = Number(itemData.grid?.width);

  if (Number.isFinite(storedWidth)) {
    return storedWidth >= 60 ? "both-pages" : "one-page";
  }

  return itemData.widget?.pageSize === "both-pages" ? "both-pages" : "one-page";
}

function getStoredCalendarMinGridUnits(type, itemData = {}) {
  const pageSize = getStoredCalendarPageSize(type, itemData);

  if (!pageSize) {
    return null;
  }

  if (typeof getCalendarPageSizeGridUnits === "function") {
    const itemLike = {
      dataset: {
        itemType: type,
        calendarPageSize: pageSize,
      },
    };

    return getCalendarPageSizeGridUnits(itemLike);
  }

  if (type === "weekly-view") {
    return {
      width: pageSize === "both-pages" ? 62 : 32,
      height: 40,
    };
  }

  return {
    width: pageSize === "both-pages" ? 61 : 31,
    height: 42,
  };
}

function getStoredItemGrid(itemData) {
  const type = normalizePlannerItemType(itemData.type || "sticker");
  const isLegacyMiniMonth2 = isLegacyMiniMonth2Type(itemData.type);
  const fallback =
    isLegacyMiniMonth2 || type === "mini-month"
      ? getMiniMonthGridUnits()
      : itemGridUnits[type] || itemGridUnits.sticker;
  const grid = itemData.grid || {};
  const storedWidth = Number(grid.width);
  const storedHeight = Number(grid.height);
  const shouldUseMiniMonth2DefaultSize =
    isLegacyMiniMonth2 && storedWidth === 16 && storedHeight === 15;
  const minCalendarSize = getStoredCalendarMinGridUnits(type, itemData);
  const restoredWidth =
    type === "mini-month" || shouldUseMiniMonth2DefaultSize
      ? fallback.width
      : Math.max(
          1,
          Number.isFinite(storedWidth) ? storedWidth : fallback.width,
        );
  const restoredHeight =
    type === "mini-month" || shouldUseMiniMonth2DefaultSize
      ? fallback.height
      : Math.max(
          1,
          Number.isFinite(storedHeight) ? storedHeight : fallback.height,
        );

  return {
    x: Number.isFinite(Number(grid.x)) ? Number(grid.x) : 0,
    y: Number.isFinite(Number(grid.y)) ? Number(grid.y) : 0,
    width: minCalendarSize
      ? Math.max(minCalendarSize.width, restoredWidth)
      : restoredWidth,
    height: minCalendarSize
      ? Math.max(minCalendarSize.height, restoredHeight)
      : restoredHeight,
  };
}

function sharesWeekendSpaceByDefault(type) {
  return type === "full-month" || type === "weekly-view";
}

// NOTE: Load The Planner Back From Browser Storage
function restorePlannerItemSettings(item, itemData) {
  const style = itemData.style || {};
  const text = itemData.text || {};
  const widget = itemData.widget || {};

  if (
    style.fillColor ||
    style.borderColor ||
    style.borderWidth ||
    style.borderEnabled
  ) {
    if (style.themeMode) {
      item.dataset.themeMode = style.themeMode;
    }

    setItemStyle(item, {
      fillColor: style.fillColor || item.dataset.fillColor,
      borderColor: style.borderColor || item.dataset.borderColor,
      borderWidth: style.borderWidth || item.dataset.borderWidth,
      borderEnabled: style.borderEnabled || item.dataset.borderEnabled,
    });
  }
  if (item.dataset.itemType === "page-flag") {
    item.dataset.pageFlagSide =
      style.pageFlagSide === "left" ? "left" : "right";
  }

  if (isStickerTextItem(item)) {
    setStickerTextSettings(item, {
      enabled: normalizeStoredBoolean(text.enabled),
      content: isTocItem(item) ? undefined : text.content || "",
      size: text.size,
      font: text.font,
      color: text.color,
      bold: normalizeStoredBoolean(text.bold),
      italic: normalizeStoredBoolean(text.italic),
      underline: normalizeStoredBoolean(text.underline),
      strike: normalizeStoredBoolean(text.strike),
      align: text.align,
      yAlign: text.yAlign,
      lineHeight: text.lineHeight,
    });
    item.dataset.textAppearsInToc =
      normalizeStoredBoolean(text.appearsInToc) || "false";
  }
  if (isCalendarItem(item)) {
    const defaultShareWeekends = sharesWeekendSpaceByDefault(
      item.dataset.itemType,
    )
      ? "true"
      : "false";

    if (isCalendarTextItem(item)) {
      const dayText = widget.dayText || {};

      item.dataset.dayNotes = JSON.stringify(widget.dayNotes || {});
      item.dataset.dayTextAppearsInToc =
        normalizeStoredBoolean(widget.dayTextAppearsInToc) || "false";
      setCalendarDayTextSettings(item, {
        size: dayText.size,
        font: dayText.font,
        color: dayText.color,
        bold: normalizeStoredBoolean(dayText.bold),
        italic: normalizeStoredBoolean(dayText.italic),
        underline: normalizeStoredBoolean(dayText.underline),
        strike: normalizeStoredBoolean(dayText.strike),
        align: dayText.align,
        yAlign: dayText.yAlign,
        lineHeight: dayText.lineHeight,
      });
    }
    setCalendarWidgetSettings(item, {
      weekNumbers: normalizeStoredBoolean(widget.weekNumbers, "true"),
      weekNumberFormat: widget.weekNumberFormat,
      weekStart: widget.weekStart,
      weekdayLabelFormat: widget.weekdayLabelFormat,
      dateOrder: widget.dateOrder,
      yearFormat: widget.yearFormat,
      monthFormat: widget.monthFormat,
      dayFormat: widget.dayFormat,
      dateMode: widget.dateMode,
      dateOffset:
        widget.dateOffset !== undefined && widget.dateOffset !== null
          ? String(widget.dateOffset)
          : undefined,
      titleVisible: normalizeStoredBoolean(widget.titleVisible, "true"),
      monthDisplay: widget.monthDisplay || "full",
      monthVisible: normalizeStoredBoolean(widget.monthVisible, "true"),
      month:
        widget.month !== undefined && widget.month !== null
          ? String(widget.month)
          : undefined,
      yearDisplay:
        widget.yearDisplay ||
        (widget.yearVisible === false || widget.yearVisible === "false"
          ? "none"
          : undefined),
      yearVisible: normalizeStoredBoolean(widget.yearVisible, "true"),
      year:
        widget.year !== undefined && widget.year !== null
          ? String(widget.year)
          : undefined,
      startDay:
        widget.startDay !== undefined && widget.startDay !== null
          ? String(widget.startDay)
          : undefined,
      visibleDays:
        widget.visibleDays !== undefined && widget.visibleDays !== null
          ? String(widget.visibleDays)
          : undefined,
      diaryLayout: widget.diaryLayout,
      diaryMonthYearVisible: normalizeStoredBoolean(
        widget.diaryMonthYearVisible,
        "false",
      ),
      diaryTitleLines: widget.diaryTitleLines,
      timeIncrement:
        widget.timeIncrement !== undefined && widget.timeIncrement !== null
          ? String(widget.timeIncrement)
          : undefined,
      startTime: widget.startTime,
      timeFormat: widget.timeFormat,
      timeVisible: normalizeStoredBoolean(widget.timeVisible, "true"),
      weeklyMonthYearVisible: normalizeStoredBoolean(
        widget.weeklyMonthYearVisible,
        "false",
      ),
      shareWeekends: normalizeStoredBoolean(
        widget.shareWeekends,
        defaultShareWeekends,
      ),
      pageSize:
        getStoredCalendarPageSize(item.dataset.itemType, itemData) ||
        widget.pageSize,
      weekNotes: widget.weekNotes,
    });
  }
  if (itemData.groupId) {
    item.dataset.groupId = itemData.groupId;
  }
}

// NOTE: Rebuilds a saved widget, then places it using the coordinate system it was saved with.
function restorePlannerItem(itemData) {
  const type = normalizePlannerItemType(itemData.type || "sticker");
  const isPagePlacement = itemData.placement === "page" || itemData.page;

  if (isUnsupportedPlannerItemType(type)) {
    return null;
  }

  if (!itemGridUnits[type]) {
    return null;
  }

  if (
    isPagePlacement &&
    !isPageNumberAvailable(getStoredItemPageNumber(itemData))
  ) {
    return null;
  }

  const item = makePlannerItem(type);

  plannerDesk.append(item);
  restorePlannerItemSettings(item, itemData);

  if (isPagePlacement) {
    const page =
      pages.find(
        (plannerPage) => getPageId(plannerPage) === (itemData.page || "left"),
      ) || pages[0];
    const grid = getGridSize(page);
    const origin = getGridSnapOrigin(page);
    const storedGrid = getStoredItemGrid(itemData);
    const box = {
      x: origin.x + storedGrid.x * grid.x,
      y: origin.y + storedGrid.y * grid.y,
      width: storedGrid.width * grid.x,
      height: storedGrid.height * grid.y,
    };

    markGridState(item, true, page);
    setItemBox(item, box);
    setItemSpreadIndex(item, Number(itemData.spreadIndex) || 0);
  } else {
    const deskRect = plannerDesk.getBoundingClientRect();
    const frame = itemData.frame || {};
    const fallback = isLegacyMiniMonth2Type(itemData.type)
      ? getMiniMonthGridUnits(item)
      : itemGridUnits[type] || itemGridUnits.sticker;
    const frameX = Number(frame.x);
    const frameY = Number(frame.y);
    const frameWidth = Number(frame.width);
    const frameHeight = Number(frame.height);
    const box = {
      x: (Number.isFinite(frameX) ? frameX : 0) * deskRect.width,
      y: (Number.isFinite(frameY) ? frameY : 0) * deskRect.height,
      width:
        Number.isFinite(frameWidth) && frameWidth > 0
          ? frameWidth * deskRect.width
          : fallback.width * 12,
      height:
        Number.isFinite(frameHeight) && frameHeight > 0
          ? frameHeight * deskRect.height
          : fallback.height * 12,
    };

    markGridState(item, false);
    setItemBox(item, box);
  }

  if (isCalendarItem(item)) {
    applyCalendarPartStyles(item);
  }

  return item;
}

function clearCurrentBookItems() {
  clearSelection();
  getAllPlannerItems().forEach((item) => {
    closeItemMenu(item);
    item.remove();
  });
  updateObjectControlsState();
}

function getStoredPageCount(book) {
  const items = Array.isArray(book?.items) ? book.items : [];
  const highestPageNumber = items.reduce((highest, item) => {
    if (item.placement !== "page" && !item.page) {
      return highest;
    }

    return Math.max(highest, getStoredItemPageNumber(item));
  }, -1);
  const storedPageCount = Number(book?.pageCount ?? book?.spread?.pageCount);
  const storedSpreadCount = Number(book?.spread?.count);
  const fallbackPageCount =
    Number.isFinite(storedPageCount) && storedPageCount > 0
      ? storedPageCount
      : Number.isFinite(storedSpreadCount) && storedSpreadCount > 0
        ? storedSpreadCount * 2
        : initialNotebookPageCount;

  return normalizeNotebookPageCount(
    Math.max(fallbackPageCount, highestPageNumber + 1, minNotebookPageCount),
  );
}

// NOTE: Restores one paper-size-specific book and falls back to an empty planner if saved data is bad.
function restorePlannerBook(paperKey = plannerConfig.paperKey) {
  const book = getStoredBook(paperKey);
  let removedUnsupportedItems = false;

  try {
    isRestoringPlannerState = true;
    clearCurrentBookItems();
    setNotebookPageCount(getStoredPageCount(book));
    currentSpreadIndex = clamp(
      Number(book?.spread?.currentIndex) || 0,
      0,
      notebookSpreadCount - 1,
    );
    if (book && Array.isArray(book.items)) {
      book.items.forEach((itemData) => {
        try {
          const restoredItem = restorePlannerItem(itemData);

          if (
            !restoredItem &&
            isUnsupportedPlannerItemType(
              normalizePlannerItemType(itemData.type || "sticker"),
            )
          ) {
            removedUnsupportedItems = true;
          }
        } catch (error) {
          console.warn(
            "Skipped saved planner item that could not be restored.",
            error,
          );
        }
      });
    }
    renderTocWidgets();
  } catch (error) {
    console.warn(
      "Saved planner book could not be restored. Opening an empty planner instead.",
      error,
    );
    clearCurrentBookItems();
    setNotebookPageCount(initialNotebookPageCount);
    currentSpreadIndex = 0;
  } finally {
    isRestoringPlannerState = false;
    syncNextGroupId();
    if (removedUnsupportedItems) {
      savePlannerState();
    }
  }
}

function syncNextGroupId() {
  const highestGroupId = getAllPlannerItems().reduce((highest, item) => {
    const match = item.dataset.groupId?.match(/^group-(\d+)$/);

    return match ? Math.max(highest, Number(match[1]) || 0) : highest;
  }, 0);

  nextGroupId = Math.max(nextGroupId, highestGroupId + 1);
}
