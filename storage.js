// NOTE: Save The Planner Into Browser Storage
function getPageId(page) {
     return page === pages[0] ? "left" : "right";
}

function getGridTemplateBox(item, page) {
     const grid = getGridSize(page);
     const origin = getGridSnapOrigin(page);
     const box = getItemBox(item);

     return {
          x: Math.round((box.x - origin.x) / grid.x),
          y: Math.round((box.y - origin.y) / grid.y),
          width: Math.round(box.width / grid.x),
          height: Math.round(box.height / grid.y)
     };
}

function getDeskTemplateBox(item) {
     const deskRect = plannerDesk.getBoundingClientRect();
     const box = getItemBox(item);

     return {
          x: Number((box.x / deskRect.width).toFixed(4)),
          y: Number((box.y / deskRect.height).toFixed(4)),
          width: Number((box.width / deskRect.width).toFixed(4)),
          height: Number((box.height / deskRect.height).toFixed(4))
     };
}

function getPageTemplateItems() {
     return getAllPlannerItems().flatMap((item) => {
          const page = item.dataset.pageId
               ? pages.find((plannerPage) => getPageId(plannerPage) === item.dataset.pageId) || null
               : null;

          if (!page) {
               return [];
          }

          return {
               item,
               page,
               grid: getGridTemplateBox(item, page)
          };
     });
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
               height: Math.max(1, grid.height) * nextGrid.y
          };

          setItemBox(item, nextBox);
     });
}

function serializePlannerItem(item) {
     const pageId = item.dataset.pageId || "";
     const page = pageId ? pages.find((plannerPage) => getPageId(plannerPage) === pageId) || null : null;
     const textElement = getStickerTextElement(item);
     const isTextItem = isStickerTextItem(item);
     const baseItem = {
          id: item.dataset.templateId,
          type: item.dataset.itemType || "sticker",
          groupId: item.dataset.groupId || null,
          style: {
               fillColor: item.dataset.fillColor,
               borderColor: item.dataset.borderColor,
               borderWidth: Number(item.dataset.borderWidth),
               dotGrid: item.dataset.dotGrid === "true"
          },
          widget: isCalendarItem(item)
               ? {
                    weekNumbers: item.dataset.weekNumbers !== "false",
                    weekNumberFormat: item.dataset.weekNumberFormat || (item.dataset.weekNumbers === "false" ? "off" : "no-outlines"),
                    weekStart: item.dataset.weekStart || "monday",
                    weekdayLabelFormat: item.dataset.weekdayLabelFormat || "d",
                    dateOrder: item.dataset.dateOrder || "month,date,year,day",
                    yearFormat: item.dataset.dateYearFormat || "yyyy",
                    monthFormat: item.dataset.dateMonthFormat || "full",
                    dayFormat: item.dataset.dateDayFormat || "ddd",
                    dateMode: item.dataset.dateMode || "fixed",
                    dateOffset: Number(item.dataset.dateOffset) || 0,
                    titleVisible: item.dataset.calendarTitleVisible !== "false",
                    monthDisplay: item.dataset.monthDisplay || "full",
                    monthVisible: item.dataset.monthDisplay !== "none",
                    month: Number(item.dataset.month) || 0,
                    monthLabel: calendarMonthNames[Number(item.dataset.month) || 0],
                    yearDisplay: item.dataset.yearDisplay || "full",
                    yearVisible: item.dataset.yearDisplay !== "none",
                    year: Number(item.dataset.year) || new Date().getFullYear(),
                    startDay: Number(item.dataset.startDay) || 1,
                    visibleDays: Number(item.dataset.visibleDays) || 7,
                    timeIncrement: Number(item.dataset.timeIncrement) || 30,
                    startTime: item.dataset.startTime || "00:00",
                    timeFormat: item.dataset.timeFormat || "24",
                    timeVisible: item.dataset.timeVisible !== "false",
                    shareWeekends: item.dataset.shareWeekends === "true",
                    weekNotes: item.dataset.weekNotes || "off",
                    partStyles: getCalendarPartStyles(item),
                    dayNotes: isCalendarTextItem(item) ? getCalendarDayNotes(item) : null,
                    dayText: isCalendarTextItem(item)
                         ? {
                              size: Number(item.dataset.dayTextSize) || 10,
                              font: item.dataset.dayTextFont || "annotation-mono",
                              color: item.dataset.dayTextColor || "var(--color-gray1)",
                              bold: item.dataset.dayTextBold === "true",
                              italic: item.dataset.dayTextItalic === "true",
                              underline: item.dataset.dayTextUnderline === "true",
                              strike: item.dataset.dayTextStrike === "true",
                              align: item.dataset.dayTextAlign || "center",
                              yAlign: item.dataset.dayTextYAlign || "center",
                              lineHeight: Number(item.dataset.dayTextLineHeight) || 1,
                              role: item.dataset.dayTextRole || "body"
                         }
                         : null
          }
               : null,
          text: isTextItem
               ? {
                    enabled: item.dataset.textEnabled === "true",
                    content: isTocItem(item) ? "" : textElement ? textElement.textContent : "",
                   size: Number(item.dataset.textSize) || 10,
                   font: item.dataset.textFont || "annotation-mono",
                   color: item.dataset.textColor || "var(--color-gray1)",
                   bold: item.dataset.textBold === "true",
                    italic: item.dataset.textItalic === "true",
                    underline: item.dataset.textUnderline === "true",
                    strike: item.dataset.textStrike === "true",
                    align: item.dataset.textAlign || "center",
                    yAlign: item.dataset.textYAlign || "center",
                    lineHeight: Number(item.dataset.textLineHeight) || 1,
                    role: item.dataset.textRole || "body"
               }
               : null
     };

     if (page) {
          return {
               ...baseItem,
               placement: "page",
               spreadIndex: getItemSpreadIndex(item),
               page: pageId,
               pageNumber: getItemPageNumber(item),
               grid: getGridTemplateBox(item, page)
          };
     }

     return {
          ...baseItem,
          placement: "desk",
          frame: getDeskTemplateBox(item)
     };
}

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
               widthInches: Number(convertLength(plannerConfig.pageWidth, plannerConfig.grid.unit, "in").toFixed(4)),
               heightInches: Number(convertLength(plannerConfig.pageHeight, plannerConfig.grid.unit, "in").toFixed(4)),
               grid: plannerConfig.gridKey,
               gridLabel: plannerConfig.grid.label,
               gridInterval: plannerConfig.grid.size,
               gridUnit: plannerConfig.grid.unit,
               gridIntervalInches: Number(convertLength(plannerConfig.grid.size, plannerConfig.grid.unit, "in").toFixed(4)),
               gridColumns: plannerConfig.gridColumns,
               gridRows: plannerConfig.gridRows
          },
          spread: {
               pages: ["left", "right"],
               currentIndex: currentSpreadIndex,
               count: notebookSpreadCount,
               pageCount: notebookPageCount,
               visiblePages: [getCurrentSpreadPageNumber("left"), getCurrentSpreadPageNumber("right")].filter(isPageNumberAvailable),
               spineLeewayGridColumns: 1
          },
          guides: {
               thirds: plannerConfig.guides.thirds,
               fourths: plannerConfig.guides.fourths
          },
          pageTitles: getPageTitleEntries(),
          items: getAllPlannerItems().map(serializePlannerItem)
     };
}

function getEmptyPlannerState() {
     return {
          schemaVersion: plannerStateSchemaVersion,
          settings: null,
          books: {}
     };
}

function readPlannerState() {
     try {
          const storedState = window.localStorage.getItem(plannerStorageKey);
          const legacyStoredState = !storedState && legacyPlannerStorageKey
               ? window.localStorage.getItem(legacyPlannerStorageKey)
               : null;
          const state = storedState || legacyStoredState ? JSON.parse(storedState || legacyStoredState) : null;

          if (!state || typeof state !== "object") {
               return getEmptyPlannerState();
          }

          if (!storedState && legacyStoredState) {
               writePlannerState(state);
          }

          return {
               schemaVersion: plannerStateSchemaVersion,
               settings: state.settings || null,
               books: state.books && typeof state.books === "object" ? state.books : {}
          };
     } catch {
          return getEmptyPlannerState();
     }
}

function writePlannerState(state) {
     try {
          window.localStorage.setItem(plannerStorageKey, JSON.stringify({
               schemaVersion: plannerStateSchemaVersion,
               settings: state.settings || null,
               books: state.books || {}
          }));
     } catch {
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

function normalizeStoredViewFocusIndex(value) {
     if (value === "right") {
          return 1;
     }

     if (value === "left") {
          return 0;
     }

     const storedIndex = Number(value);

     if (!Number.isFinite(storedIndex)) {
          return 0;
     }

     // Previous saves used 0 = left, 1 = center, 2 = right.
     return storedIndex >= 2 ? 1 : 0;
}

function serializePlannerSettings() {
     return {
          paper: paperSelect?.value || "letter",
          paperColor: paperColorSelect?.value || "White",
          customPaperColor: paperColors.Custom?.color || "#ffffff",
          accentColor: accentColorSelect?.value || "Red",
          customAccentColor: accentColors.Custom?.color || "#ff0000",
          deskColor: deskColorSelect?.value || "wood-brown",
          defaults: typeof serializePlannerDefaults === "function" ? serializePlannerDefaults() : null,
          guides: Object.fromEntries(guideInputs.map((input) => [input.dataset.guide, input.checked])),
          view: {
               zoomIndex: viewZoomIndex,
               focusIndex: viewFocusIndex,
               focusSide: viewFocusPoints[viewFocusIndex],
               verticalFocusIndex: viewVerticalFocusIndex
          }
     };
}

function restoreSavedSettings() {
     const settings = readPlannerState().settings;

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
          viewZoomIndex = clamp(Number(settings.view.zoomIndex) || 0, 0, viewZoomLevels.length - 1);
          viewFocusIndex = normalizeStoredViewFocusIndex(settings.view.focusSide ?? settings.view.focusIndex);
          viewVerticalFocusIndex = clamp(Number(settings.view.verticalFocusIndex) || 1, 0, viewVerticalFocusPoints.length - 1);
     }
}

function serializePlannerBook() {
     return {
          schemaVersion: plannerStateSchemaVersion,
          pageCount: notebookPageCount,
          spread: {
               currentIndex: currentSpreadIndex,
               count: notebookSpreadCount,
               pageCount: notebookPageCount
          },
          items: getAllPlannerItems().map(serializePlannerItem)
     };
}

function savePlannerBook(paperKey = plannerConfig.paperKey) {
     if (isRestoringPlannerState) {
          return;
     }

     const state = readPlannerState();

     state.books[paperKey] = serializePlannerBook();
     writePlannerState(state);
}

function savePlannerState() {
     if (isRestoringPlannerState) {
          return;
     }

     const state = readPlannerState();

     state.settings = serializePlannerSettings();
     state.books[plannerConfig.paperKey] = serializePlannerBook();
     writePlannerState(state);
}

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
     const current = normalizeWeekNumberFormat(item?.dataset?.weekNumberFormat, item?.dataset?.weekNumbers === "false" ? "off" : "no-outlines");

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

function isLegacyMiniMonth2Type(type) {
     return type === "mini-cal2" || type === "mini-month2";
}

function getStoredItemGrid(itemData) {
     const type = normalizePlannerItemType(itemData.type || "sticker");
     const isLegacyMiniMonth2 = isLegacyMiniMonth2Type(itemData.type);
     const fallback = isLegacyMiniMonth2 ? getMiniMonthGridUnits() : itemGridUnits[type] || itemGridUnits.sticker;
     const grid = itemData.grid || {};
     const storedWidth = Number(grid.width);
     const storedHeight = Number(grid.height);
     const shouldUseMiniMonth2DefaultSize = isLegacyMiniMonth2 && storedWidth === 16 && storedHeight === 15;
     const isMiniMonth = type === "mini-month";

     return {
          x: Number.isFinite(Number(grid.x)) ? Number(grid.x) : 0,
          y: Number.isFinite(Number(grid.y)) ? Number(grid.y) : 0,
          width: isMiniMonth || shouldUseMiniMonth2DefaultSize ? fallback.width : Math.max(1, Number.isFinite(storedWidth) ? storedWidth : fallback.width),
          height: isMiniMonth || shouldUseMiniMonth2DefaultSize ? fallback.height : Math.max(1, Number.isFinite(storedHeight) ? storedHeight : fallback.height)
     };
}

// NOTE: Load The Planner Back From Browser Storage
function restorePlannerItemSettings(item, itemData) {
     const style = itemData.style || {};
     const text = itemData.text || {};
     const widget = itemData.widget || {};

     setItemStyle(item, {
          fillColor: style.fillColor,
          borderColor: style.borderColor,
          borderWidth: style.borderWidth,
          dotGrid: normalizeStoredBoolean(style.dotGrid)
     });
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
               role: text.role
          });
     }
     if (isCalendarItem(item)) {
          if (isCalendarTextItem(item)) {
               item.dataset.dayNotes = JSON.stringify(widget.dayNotes || {});
               setCalendarDayTextSettings(item, {
                    size: widget.dayText?.size,
                    font: widget.dayText?.font,
                    color: widget.dayText?.color,
                    bold: normalizeStoredBoolean(widget.dayText?.bold),
                    italic: normalizeStoredBoolean(widget.dayText?.italic),
                    underline: normalizeStoredBoolean(widget.dayText?.underline),
                    strike: normalizeStoredBoolean(widget.dayText?.strike),
                    align: widget.dayText?.align,
                    yAlign: widget.dayText?.yAlign,
                    lineHeight: widget.dayText?.lineHeight,
                    role: widget.dayText?.role
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
               dateOffset: widget.dateOffset !== undefined && widget.dateOffset !== null ? String(widget.dateOffset) : undefined,
               titleVisible: normalizeStoredBoolean(widget.titleVisible, "true"),
               monthDisplay: widget.monthDisplay || "full",
               monthVisible: normalizeStoredBoolean(widget.monthVisible, "true"),
               month: widget.month !== undefined && widget.month !== null ? String(widget.month) : undefined,
               yearDisplay: widget.yearDisplay || (widget.yearVisible === false || widget.yearVisible === "false" ? "none" : undefined),
               yearVisible: normalizeStoredBoolean(widget.yearVisible, "true"),
               year: widget.year !== undefined && widget.year !== null ? String(widget.year) : undefined,
               startDay: widget.startDay !== undefined && widget.startDay !== null ? String(widget.startDay) : undefined,
               visibleDays: widget.visibleDays !== undefined && widget.visibleDays !== null ? String(widget.visibleDays) : undefined,
               timeIncrement: widget.timeIncrement !== undefined && widget.timeIncrement !== null ? String(widget.timeIncrement) : undefined,
               startTime: widget.startTime,
               timeFormat: widget.timeFormat,
               timeVisible: normalizeStoredBoolean(widget.timeVisible, "true"),
               shareWeekends: normalizeStoredBoolean(widget.shareWeekends),
               weekNotes: widget.weekNotes
          });
          if (widget.partStyles && typeof widget.partStyles === "object") {
               setCalendarPartStyles(item, widget.partStyles);
               applyCalendarPartStyles(item);
          }
     }
     if (itemData.groupId) {
          item.dataset.groupId = itemData.groupId;
     }
}

function restorePlannerItem(itemData) {
     const type = normalizePlannerItemType(itemData.type || "sticker");
     const isPagePlacement = itemData.placement === "page" || itemData.page;

     if (!itemGridUnits[type]) {
          return null;
     }

     if (isPagePlacement && !isPageNumberAvailable(getStoredItemPageNumber(itemData))) {
          return null;
     }

     if (type === "page-title" && isPagePlacement && getPageTitleItemForPageNumber(getStoredItemPageNumber(itemData))) {
          return null;
     }

     const item = makePlannerItem(type);

     plannerDesk.append(item);
     restorePlannerItemSettings(item, itemData);

     if (isPagePlacement) {
          const page = pages.find((plannerPage) => getPageId(plannerPage) === (itemData.page || "left")) || pages[0];
          const grid = getGridSize(page);
          const origin = getGridSnapOrigin(page);
          const storedGrid = getStoredItemGrid(itemData);
          const box = {
               x: origin.x + (storedGrid.x * grid.x),
               y: origin.y + (storedGrid.y * grid.y),
               width: storedGrid.width * grid.x,
               height: storedGrid.height * grid.y
          };

          markGridState(item, true, page);
          setItemBox(item, box);
          setItemSpreadIndex(item, Number(itemData.spreadIndex) || 0);
     } else {
          const deskRect = plannerDesk.getBoundingClientRect();
          const frame = itemData.frame || {};
          const fallback = isLegacyMiniMonth2Type(itemData.type) ? getMiniMonthGridUnits(item) : itemGridUnits[type] || itemGridUnits.sticker;
          const frameX = Number(frame.x);
          const frameY = Number(frame.y);
          const frameWidth = Number(frame.width);
          const frameHeight = Number(frame.height);
          const box = {
               x: (Number.isFinite(frameX) ? frameX : 0) * deskRect.width,
               y: (Number.isFinite(frameY) ? frameY : 0) * deskRect.height,
               width: Number.isFinite(frameWidth) && frameWidth > 0 ? frameWidth * deskRect.width : fallback.width * 12,
               height: Number.isFinite(frameHeight) && frameHeight > 0 ? frameHeight * deskRect.height : fallback.height * 12
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
     const fallbackPageCount = Number.isFinite(storedPageCount) && storedPageCount > 0
          ? storedPageCount
          : (Number.isFinite(storedSpreadCount) && storedSpreadCount > 0 ? storedSpreadCount * 2 : initialNotebookPageCount);

     return normalizeNotebookPageCount(Math.max(fallbackPageCount, highestPageNumber + 1, minNotebookPageCount));
}

function restorePlannerBook(paperKey = plannerConfig.paperKey) {
     const book = getStoredBook(paperKey);

     try {
          isRestoringPlannerState = true;
          clearCurrentBookItems();
          setNotebookPageCount(getStoredPageCount(book));
          currentSpreadIndex = clamp(Number(book?.spread?.currentIndex) || 0, 0, notebookSpreadCount - 1);
          if (!isPageSideAvailable(getFocusedPageSide())) {
               viewFocusIndex = 0;
          }
          if (book && Array.isArray(book.items)) {
               book.items.forEach((itemData) => {
                    try {
                         restorePlannerItem(itemData);
                    } catch (error) {
                         console.warn("Skipped saved planner item that could not be restored.", error);
                    }
               });
          }
          renderTocWidgets();
     } catch (error) {
          console.warn("Saved planner book could not be restored. Opening an empty planner instead.", error);
          clearCurrentBookItems();
          setNotebookPageCount(initialNotebookPageCount);
          currentSpreadIndex = 0;
          viewFocusIndex = 0;
     } finally {
          isRestoringPlannerState = false;
          syncNextGroupId();
     }
}

function syncNextGroupId() {
     const highestGroupId = getAllPlannerItems().reduce((highest, item) => {
          const match = item.dataset.groupId?.match(/^group-(\d+)$/);

          return match ? Math.max(highest, Number(match[1]) || 0) : highest;
     }, 0);

     nextGroupId = Math.max(nextGroupId, highestGroupId + 1);
}
