// NOTE: Tiny Preview Pictures In The Widget Tray
function createCalendarSourcePreviewCell(row, column, rows, columns, classNames = []) {
     const cell = document.createElement("span");

     cell.className = "calendar-source-preview-cell";
     cell.style.gridRow = String(row);
     cell.style.gridColumn = String(column);
     classNames.forEach((className) => cell.classList.add(className));
     if (column === columns) {
          cell.classList.add("is-edge-right");
     }
     if (row === rows) {
          cell.classList.add("is-edge-bottom");
     }

     return cell;
}

function populateCalendarSourcePreviewGrid(container, {
     columns = 8,
     rows = 8,
     weekNumberColumn = 1,
     timeColumn = 0,
     wkdColumns = [7, 8]
} = {}) {
     const titleCell = document.createElement("span");

     container.style.gridTemplateColumns = `repeat(${columns}, minmax(0, 1fr))`;
     container.style.gridTemplateRows = `repeat(${rows}, minmax(0, 1fr))`;
     titleCell.className = "calendar-source-preview-cell is-title";
     titleCell.style.gridRow = "1";
     titleCell.style.gridColumn = "1 / -1";
     container.append(titleCell);

     for (let row = 2; row <= rows; row += 1) {
          for (let column = 1; column <= columns; column += 1) {
               const classNames = [];
               const isWeekNumberColumn = column === weekNumberColumn;
               const isTimeColumn = column === timeColumn;
               const isWkdColumn = wkdColumns.includes(column);

               if (row === 2) {
                    classNames.push(isTimeColumn && !isWeekNumberColumn ? "is-tinted" : "is-weekday");
               } else if (isWeekNumberColumn || isTimeColumn) {
                    classNames.push("is-tinted");
               } else if (isWkdColumn) {
                    classNames.push("is-wkd");
               }

               container.append(createCalendarSourcePreviewCell(row, column, rows, columns, classNames));
          }
     }
}

function populatePerpetualCalendarSourcePreview(preview) {
     const rows = 12;
     const columns = 2;
     const titleCell = document.createElement("span");

     preview.classList.add("calendar-source-preview-list");
     preview.style.gridTemplateColumns = "1fr 4fr";
     preview.style.gridTemplateRows = `repeat(${rows}, minmax(0, 1fr))`;
     titleCell.className = "calendar-source-preview-cell is-title";
     titleCell.style.gridRow = "1";
     titleCell.style.gridColumn = "1 / -1";
     preview.append(titleCell);

     for (let row = 2; row <= rows; row += 1) {
          const dayNumber = row - 1;
          const isWeekend = dayNumber % 7 === 6 || dayNumber % 7 === 0;
          const numberCell = createCalendarSourcePreviewCell(row, 1, rows, columns, ["is-list-number"]);
          const lineCell = createCalendarSourcePreviewCell(row, 2, rows, columns, ["is-list-line"]);

          if (isWeekend) {
               numberCell.classList.add("is-wkd");
               lineCell.classList.add("is-wkd");
          }
          numberCell.textContent = String(dayNumber);
          preview.append(numberCell, lineCell);
     }
}

function populateMiniYearSourcePreview(preview) {
     preview.classList.add("calendar-source-preview-year");

     for (let month = 0; month < 12; month += 1) {
          const tile = document.createElement("span");

          tile.className = "calendar-source-preview-tile";
          if ((month + 1) % 3 === 0) {
               tile.classList.add("is-edge-right");
          }
          if (month >= 9) {
               tile.classList.add("is-edge-bottom");
          }
          populateCalendarSourcePreviewGrid(tile);
          preview.append(tile);
     }
}

function initializeCalendarSourcePreviews(sourceItems) {
     sourceItems.forEach((sourceItem) => {
          const type = sourceItem.dataset.createType;

          if (!isCalendarItemType(type)) {
               return;
          }

          const preview = document.createElement("span");

          sourceItem.querySelector(".calendar-source-preview")?.remove();
          preview.className = "calendar-source-preview";
          preview.setAttribute("aria-hidden", "true");
          if (type === "mini-year") {
               populateMiniYearSourcePreview(preview);
          } else if (type === "perpetual-calendar") {
               populatePerpetualCalendarSourcePreview(preview);
          } else {
               populateCalendarSourcePreviewGrid(preview, {
                    columns: 8,
                    rows: type === "weekly-vertical" ? 14 : 8,
                    timeColumn: type === "weekly-vertical" ? 1 : 0
               });
          }
          sourceItem.append(preview);
     });
}

// NOTE: Table Of Contents And Calendar Helper Checks
function isTocItemType(type) {
     return type === "toc";
}

function isTocItem(item) {
     return isTocItemType(item?.dataset?.itemType);
}

function getTocItems(items) {
     return items.filter(isTocItem);
}

function getTocDisplayTitle(title) {
     return String(title || "").replace(/\s+/g, " ").trim();
}

function renderToc(item, entries) {
     if (!isTocItem(item)) {
          return;
     }

     let toc = item.querySelector(".toc-widget");

     if (!toc) {
          toc = document.createElement("div");
          toc.className = "toc-widget";
          item.append(toc);
     }

     const list = document.createElement("div");
     const tocTitle = document.createElement("div");
     const tocTitlePage = document.createElement("span");
     const tocTitleName = document.createElement("span");

     list.className = "toc-list";
     toc.replaceChildren(list);
     tocTitle.className = "toc-title";
     tocTitlePage.className = "toc-title-page";
     tocTitleName.className = "toc-title-name";
     tocTitlePage.textContent = "Page";
     tocTitleName.textContent = "Table of Contents";
     tocTitle.append(tocTitlePage, tocTitleName);
     list.append(tocTitle);

     if (!entries.length) {
          const empty = document.createElement("div");

          empty.className = "toc-empty";
          empty.textContent = "No page titles";
          list.append(empty);
          return;
     }

     entries.forEach((entry) => {
          const row = document.createElement("div");
          const number = document.createElement("span");
          const title = document.createElement("span");

          row.className = "toc-row";
          number.className = "toc-page-number";
          number.textContent = String(entry.pageNumber);
          title.className = "toc-entry-title";
          title.textContent = getTocDisplayTitle(entry.title);
          row.append(number, title);
          list.append(row);
     });
}

function renderTocWidgetsForItems(items, getEntries) {
     getTocItems(items).forEach((item) => renderToc(item, getEntries()));
}

function isCalendarItemType(type) {
     return type === "mini-month" || isFullPageCalendarType(type);
}

function isFullPageCalendarType(type) {
     return type === "full-month" || type === "mini-year" || type === "weekly-vertical" || type === "perpetual-calendar";
}

function isCalendarItem(item) {
     return isCalendarItemType(item.dataset.itemType);
}

function isCalendarTextItemType(type) {
     return type === "full-month" || type === "weekly-vertical";
}

function isCalendarTextItem(item) {
     return isCalendarTextItemType(item.dataset.itemType);
}

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

     return getCalendarDayKey(today.getFullYear(), today.getMonth(), today.getDate());
}

function hasCalendarDayKey(dayKeys, targetDayKey) {
     const keys = Array.isArray(dayKeys) ? dayKeys : String(dayKeys).split(/[,+]/);

     return keys.some((key) => key.split("T")[0] === targetDayKey);
}

function markCurrentCalendarDay(cell, dayKeys, todayKey = getTodayCalendarDayKey()) {
     const isCurrentDay = hasCalendarDayKey(dayKeys, todayKey);

     cell.classList.toggle("calendar-current-day", isCurrentDay);
     if (isCurrentDay) {
          cell.dataset.currentDay = "true";
     } else {
          delete cell.dataset.currentDay;
     }
}

function markCurrentCalendarDayNumber(element, dayKey, todayKey = getTodayCalendarDayKey()) {
     element.classList.toggle("calendar-current-day-number", dayKey === todayKey);
}

function getCalendarDaysInMonth(year, month) {
     return new Date(year, month + 1, 0).getDate();
}

function parseTimeValue(value) {
     const [hour = "0", minute = "0"] = String(value || "00:00").split(":");

     return (Number(hour) * 60) + Number(minute);
}

function formatMinutesAsTime(totalMinutes) {
     const dayMinutes = 24 * 60;
     const normalizedMinutes = ((totalMinutes % dayMinutes) + dayMinutes) % dayMinutes;
     const hour = Math.floor(normalizedMinutes / 60);
     const minute = normalizedMinutes % 60;

     return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function formatWeeklyTimeLabel(totalMinutes, format = "24") {
     const dayMinutes = 24 * 60;
     const normalizedMinutes = ((totalMinutes % dayMinutes) + dayMinutes) % dayMinutes;
     const hour = Math.floor(normalizedMinutes / 60);
     const minute = normalizedMinutes % 60;
     const period = hour < 12 ? "a" : "p";
     const hour12 = hour % 12 || 12;

     if (format === "compact") {
          return minute === 0 ? `${hour12}${period}` : `${hour12}:${String(minute).padStart(2, "0")}${period}`;
     }

     if (format === "ampm") {
          return `${hour12}:${String(minute).padStart(2, "0")} ${period}m`;
     }

     return `${String(hour).padStart(2, "0")}${String(minute).padStart(2, "0")}`;
}

function getWeeklySlotKey(date, totalMinutes) {
     return `${getCalendarDayKey(date.getFullYear(), date.getMonth(), date.getDate())}T${formatMinutesAsTime(totalMinutes)}`;
}

function shouldShowWeeklyTimeLabel(totalMinutes, timeIncrement) {
     const normalizedMinutes = ((totalMinutes % (24 * 60)) + (24 * 60)) % (24 * 60);

     if (timeIncrement === 15) {
          return normalizedMinutes % 30 === 0;
     }

     if (timeIncrement === 30) {
          return normalizedMinutes % 60 === 0;
     }

     return true;
}

function getWeeklyDisplayColumns(startDate, visibleDays, shouldShareWeekends) {
     const dates = Array.from({
          length: visibleDays
     }, (_, index) => {
          const date = new Date(startDate);

          date.setDate(startDate.getDate() + index);
          return date;
     });
     const columns = [];

     for (let index = 0; index < dates.length; index += 1) {
          const date = dates[index];
          const nextDate = dates[index + 1];

          if (shouldShareWeekends && date.getDay() === 6 && nextDate && nextDate.getDay() === 0) {
               columns.push({
                    type: "shared-weekend",
                    dates: [date, nextDate]
               });
               index += 1;
          } else {
               columns.push({
                    type: "day",
                    dates: [date]
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

// NOTE: Widget Sizes, Clear Fills, And Box Styling
function updateCalendarGridMetrics(item, page, box) {
     if (item.dataset.itemType !== "full-month" && item.dataset.itemType !== "weekly-vertical") {
          return;
     }

     const visibleDays = clamp(Number(item.dataset.visibleDays) || 7, 1, 7);
     const timeColumnUnits = item.dataset.itemType === "weekly-vertical" && item.dataset.timeVisible !== "false" ? 2 : 0;
     const columnUnits = item.dataset.itemType === "full-month" ? 16 : (visibleDays * 2) + timeColumnUnits + 2;
     const rowUnits = item.dataset.itemType === "full-month"
          ? 14
          : Math.max(1, Number(item.style.getPropertyValue("--weekly-row-count")) || 14);
     const fallbackCellWidth = box.width / columnUnits;
     const fallbackCellHeight = box.height / rowUnits;
     const grid = page ? getGridSize(page) : null;
     const cellWidth = grid ? grid.x : fallbackCellWidth;
     const cellHeight = grid ? grid.y : fallbackCellHeight;

     item.style.setProperty("--weekly-column-cell-width", `${cellWidth}px`);
     item.style.setProperty("--weekly-row-cell-height", `${cellHeight}px`);
}

function updateTocGridMetrics(item, page, box) {
     if (!isTocItem(item)) {
          return;
     }

     const grid = page ? getGridSize(page) : null;
     const fallbackWidthUnits = itemGridUnits.toc?.width || 18;
     const fallbackHeightUnits = itemGridUnits.toc?.height || 18;
     const columnWidth = grid ? grid.x : box.width / fallbackWidthUnits;
     const rowHeight = grid ? grid.y : box.height / fallbackHeightUnits;
     const rowCount = Math.max(1, Math.round(box.height / rowHeight));
     item.style.setProperty("--toc-left-column-width", `${columnWidth * tocLeftColumnGridUnits}px`);
     item.style.setProperty("--toc-right-column-min-width", `${columnWidth * tocRightColumnMinGridUnits}px`);
     item.style.setProperty("--toc-row-height", `${rowHeight}px`);
     item.style.setProperty("--toc-row-count", String(rowCount));
}

function getTocMinGridColumns() {
     return tocLeftColumnGridUnits + tocRightColumnMinGridUnits;
}

function clampTocBox(item, page, box) {
     if (!isTocItem(item)) {
          return box;
     }

     const grid = getGridSize(page);
     const minWidth = grid.x * getTocMinGridColumns();
     const snappedWidth = Math.max(minWidth, Math.round(box.width / grid.x) * grid.x);

     return {
          ...box,
          width: snappedWidth
     };
}

function getPerpetualCalendarMaxGridRows() {
     return perpetualCalendarMaxDayRows + perpetualCalendarHeaderRows;
}

function getPerpetualCalendarMinGridColumns() {
     return perpetualCalendarLeftColumnGridUnits + perpetualCalendarRightColumnMinGridUnits;
}

function getPerpetualCalendarVisibleGridRows(item) {
     const month = Number(item.dataset.month) || 0;
     const year = Number(item.dataset.year) || new Date().getFullYear();

     return perpetualCalendarHeaderRows + getCalendarDaysInMonth(year, month);
}

function clampPerpetualCalendarBox(item, page, box) {
     if (item.dataset.itemType !== "perpetual-calendar") {
          return box;
     }

     const grid = getGridSize(page);
     const minWidth = grid.x * getPerpetualCalendarMinGridColumns();
     const fixedHeight = grid.y * getPerpetualCalendarMaxGridRows();
     const snappedWidth = Math.max(minWidth, Math.round(box.width / grid.x) * grid.x);

     return {
          ...box,
          width: snappedWidth,
          height: fixedHeight
     };
}

function updatePerpetualCalendarGridMetrics(item, page, box) {
     if (item.dataset.itemType !== "perpetual-calendar") {
          return;
     }

     const grid = page ? getGridSize(page) : null;
     const fallbackWidthUnits = itemGridUnits["perpetual-calendar"]?.width || getPerpetualCalendarMinGridColumns();
     const fallbackHeightUnits = itemGridUnits["perpetual-calendar"]?.height || getPerpetualCalendarMaxGridRows();
     const columnWidth = grid ? grid.x : box.width / fallbackWidthUnits;
     const rowHeight = grid ? grid.y : box.height / fallbackHeightUnits;
     const rowCount = Math.min(getPerpetualCalendarMaxGridRows(), Math.max(1, Math.round(box.height / rowHeight)));
     const visibleRows = getPerpetualCalendarVisibleGridRows(item);

     item.style.setProperty("--perpetual-calendar-left-column-width", `${columnWidth * perpetualCalendarLeftColumnGridUnits}px`);
     item.style.setProperty("--perpetual-calendar-right-column-min-width", `${columnWidth * perpetualCalendarRightColumnMinGridUnits}px`);
     item.style.setProperty("--perpetual-calendar-row-height", `${rowHeight}px`);
     item.style.setProperty("--perpetual-calendar-row-count", String(rowCount));
     item.style.setProperty("--perpetual-calendar-visible-height", `${rowHeight * visibleRows}px`);
     item.style.setProperty("--perpetual-calendar-visible-rows", String(visibleRows));
}

function updateMiniYearGridMetrics(item, page, box) {
     if (item.dataset.itemType !== "mini-year") {
          return;
     }

     const grid = page ? getGridSize(page) : {
          x: box.width / plannerConfig.gridColumns,
          y: box.height / plannerConfig.gridRows
     };
     const cellWidth = grid.x || 12;
     const cellHeight = grid.y || 12;
     const monthWidth = cellWidth * 8;
     const monthHeight = cellHeight * 8;
     const columnGap = Math.max(0, (box.width - (monthWidth * 3)) / 2);
     const rowGap = Math.max(0, (box.height - (monthHeight * 4)) / 3);

     item.style.setProperty("--mini-year-cell-width", `${cellWidth}px`);
     item.style.setProperty("--mini-year-cell-height", `${cellHeight}px`);
     item.style.setProperty("--mini-year-column-gap", `${columnGap}px`);
     item.style.setProperty("--mini-year-row-gap", `${rowGap}px`);
}

function setItemStyle(item, style) {
     item.dataset.fillColor = style.fillColor || item.dataset.fillColor || "var(--paper-offwhite)";
     item.dataset.borderColor = style.borderColor || item.dataset.borderColor || "var(--color-gray4)";
     item.dataset.borderWidth = style.borderWidth || item.dataset.borderWidth || "1";
     item.dataset.dotGrid = style.dotGrid || item.dataset.dotGrid || "false";
     const hasClearFill = item.dataset.fillColor === "transparent";

     item.dataset.hasClearFill = String(hasClearFill);
     delete item.dataset.fillAlpha;
     delete item.dataset.borderAlpha;
     item.style.setProperty("--sticky-fill", item.dataset.fillColor);
     item.style.setProperty("--sticky-fill-opaque", item.dataset.fillColor);
     if (hasClearFill) {
          item.style.setProperty("--calendar-tint-alpha", "0");
     } else {
          item.style.removeProperty("--calendar-tint-alpha");
     }
     item.style.setProperty("--sticky-border-color", item.dataset.borderColor);
     item.style.setProperty("--sticky-border-size", `${item.dataset.borderWidth}px`);

     const controls = getItemControls(item) || item;
     const fillInput = controls.querySelector("[data-style-control='fill']");
     const fillSwatches = controls.querySelector("[data-style-swatches='fill']");
     const borderColorInput = controls.querySelector("[data-style-control='border-color']");
     const borderColorSwatches = controls.querySelector("[data-style-swatches='border-color']");
     const borderWidthSelect = controls.querySelector("[data-style-control='border-width']");
     const dotGridInput = controls.querySelector("[data-style-control='dot-grid']");

     if (fillInput) {
          setPaletteControlValue(fillInput, fillSwatches, item.dataset.fillColor);
     }

     if (borderColorInput) {
          setPaletteControlValue(borderColorInput, borderColorSwatches, item.dataset.borderColor);
     }

     if (borderWidthSelect) {
          borderWidthSelect.value = item.dataset.borderWidth;
     }

     if (dotGridInput) {
          dotGridInput.checked = item.dataset.dotGrid === "true";
     }

     controls.querySelectorAll("select").forEach(updateCustomSelectDisplay);
}

// NOTE: Draw The Calendar Widgets
function getWeekStartDate(date, weekStart) {
     const nextDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
     const offset = weekStart === "monday"
          ? (nextDate.getDay() + 6) % 7
          : nextDate.getDay();

     nextDate.setDate(nextDate.getDate() - offset);
     return nextDate;
}

function getCalendarWeekNumber(date, weekStart) {
     if (weekStart === "monday") {
          const nextDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
          const day = nextDate.getDay() || 7;

          nextDate.setDate(nextDate.getDate() + 4 - day);

          const yearStart = new Date(nextDate.getFullYear(), 0, 1);

          return Math.ceil((((nextDate - yearStart) / 86400000) + 1) / 7);
     }

     const weekStartDate = getWeekStartDate(date, weekStart);
     const yearStart = getWeekStartDate(new Date(weekStartDate.getFullYear(), 0, 1), weekStart);

     return Math.floor((weekStartDate - yearStart) / 604800000) + 1;
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

     const controls = getItemControls(item) || item;

     item.dataset.dayTextSize = settings.size || item.dataset.dayTextSize || "10";
     item.dataset.dayTextFont = settings.font || item.dataset.dayTextFont || "noto";
     item.dataset.dayTextColor = settings.color || item.dataset.dayTextColor || "var(--color-gray1)";
     delete item.dataset.dayTextAlpha;
     item.dataset.dayTextBold = settings.bold ?? item.dataset.dayTextBold ?? "false";
     item.dataset.dayTextItalic = settings.italic ?? item.dataset.dayTextItalic ?? "false";
     item.dataset.dayTextUnderline = settings.underline ?? item.dataset.dayTextUnderline ?? "false";
     item.dataset.dayTextAlign = settings.align || item.dataset.dayTextAlign || "left";
     item.dataset.dayTextLineHeight = settings.lineHeight || item.dataset.dayTextLineHeight || "1";

     item.querySelectorAll(".calendar-day-text").forEach((textElement) => {
          applyCalendarDayTextStyle(item, textElement);
          updateCalendarDayTextOverflow(textElement);
     });

     const sizeInput = controls.querySelector("[data-text-control='size']");
     const fontSelect = controls.querySelector("[data-text-control='font']");
     const colorInput = controls.querySelector("[data-text-control='color']");
     const colorSwatches = controls.querySelector("[data-text-swatches='color']");
     const boldInput = controls.querySelector("[data-text-control='bold']");
     const italicInput = controls.querySelector("[data-text-control='italic']");
     const underlineInput = controls.querySelector("[data-text-control='underline']");
     const alignSelect = controls.querySelector("[data-text-control='align']");
     const lineHeightSelect = controls.querySelector("[data-text-control='line-height']");

     if (sizeInput) {
          sizeInput.value = item.dataset.dayTextSize;
     }

     if (fontSelect) {
          fontSelect.value = item.dataset.dayTextFont;
     }

     if (colorInput) {
          setPaletteControlValue(colorInput, colorSwatches, item.dataset.dayTextColor);
     }

     if (boldInput) {
          boldInput.checked = item.dataset.dayTextBold === "true";
     }

     if (italicInput) {
          italicInput.checked = item.dataset.dayTextItalic === "true";
     }

     if (underlineInput) {
          underlineInput.checked = item.dataset.dayTextUnderline === "true";
     }

     if (alignSelect) {
          alignSelect.value = item.dataset.dayTextAlign;
     }

     if (lineHeightSelect) {
          lineHeightSelect.value = item.dataset.dayTextLineHeight;
     }

     controls.querySelectorAll("select").forEach(updateCustomSelectDisplay);
}

function applyCalendarDayTextStyle(item, textElement) {
     textElement.style.fontSize = `${item.dataset.dayTextSize || "10"}px`;
     textElement.style.color = item.dataset.dayTextColor || "var(--color-gray1)";
     textElement.style.fontFamily = getStickyTextFont(item.dataset.dayTextFont || "noto");
     textElement.style.fontWeight = item.dataset.dayTextBold === "true" ? "700" : "400";
     textElement.style.fontStyle = item.dataset.dayTextItalic === "true" ? "italic" : "normal";
     textElement.style.textDecoration = item.dataset.dayTextUnderline === "true" ? "underline" : "none";
     textElement.style.textAlign = item.dataset.dayTextAlign || "left";
     textElement.style.lineHeight = getTextLineHeightPixels(item, item.dataset.dayTextLineHeight);
}

function updateCalendarDayTextOverflow(textElement) {
     const cell = textElement.closest(".dayCell");
     const item = textElement.closest(".planner-item-full-month, .planner-item-weekly-vertical");

     if (!cell || !item) {
          return;
     }

     requestAnimationFrame(() => {
          cell.dataset.textOverflow = String(textElement.scrollHeight > textElement.clientHeight + 1);
     });
}

function updateCalendarTextOverflow(item) {
     if (!item || !isCalendarTextItem(item)) {
          return;
     }

     item.querySelectorAll(".calendar-day-text").forEach((textElement) => updateCalendarDayTextOverflow(textElement));
}

function getWeeklyViewStartDate(item) {
     const month = Number(item.dataset.month) || 0;
     const year = Number(item.dataset.year) || new Date().getFullYear();
     const startDay = clamp(Number(item.dataset.startDay) || 1, 1, getCalendarDaysInMonth(year, month));

     return new Date(year, month, startDay);
}

function getWeeklyVisibleSlotCount(item) {
     const page = getItemPage(item);
     const timeIncrement = Number(item.dataset.timeIncrement) || 30;
     const startMinutes = parseTimeValue(item.dataset.startTime || "00:00");
     const maxSlotCount = Math.max(1, Math.ceil(((24 * 60) - startMinutes) / timeIncrement));

     if (!page) {
          return maxSlotCount;
     }

     const grid = getGridSize(page);
     const box = getItemBox(item);
     const rowCount = Math.max(1, Math.floor(box.height / grid.y));

     return clamp(rowCount - 2, 1, maxSlotCount);
}

function getCalendarWeekName(weekIndex, month, year) {
     const ordinals = ["First", "Second", "Third", "Fourth", "Fifth", "Last"];
     const weekLabel = ordinals[Math.min(weekIndex - 1, ordinals.length - 1)];

     return `${weekLabel} week of ${calendarMonthNames[month]} ${year}`;
}

function startCalendarDayTextEditing(textElement, item) {
     textElement.setAttribute("contenteditable", "true");
     item.classList.add("is-editing-day-text");
     updateTextEditingState();

     requestAnimationFrame(() => {
          textElement.focus();

          const selection = window.getSelection();
          const range = document.createRange();

          range.selectNodeContents(textElement);
          range.collapse(false);
          selection.removeAllRanges();
          selection.addRange(range);
     });

     textElement.addEventListener("blur", () => {
          textElement.setAttribute("contenteditable", "false");
          item.classList.remove("is-editing-day-text");
          updateTextEditingState();
          setCalendarDayNote(item, textElement.dataset.dayKey, textElement.textContent || "");
          updateCalendarDayTextOverflow(textElement);
          notifyTemplateChanged();
     }, {
          once: true
     });
}

function createMiniYearMonth(item, month, year) {
     const calendar = document.createElement("div");
     const weekNumberFormat = normalizeWeekNumberFormat(item.dataset.weekNumberFormat, item.dataset.weekNumbers === "false" ? "off" : "no-outlines");
     const weekNumbersEnabled = weekNumberFormat !== "off";
     const weekNumberOutlines = weekNumberFormat === "outlines";
     const weekStart = item.dataset.weekStart || "monday";
     const monthDisplay = item.dataset.monthDisplay || "full";
     const yearDisplay = item.dataset.yearDisplay || (item.dataset.yearVisible === "false" ? "none" : "full");
     const titleMonthText = getCalendarMonthTitle(month, monthDisplay);
     const titleYearText = getCalendarYearTitle(year, yearDisplay);
     const monthVisible = titleMonthText !== "";
     const yearVisible = titleYearText !== "";
     const titleVisible = monthVisible || yearVisible;
     const firstDay = new Date(year, month, 1);
     const daysInMonth = new Date(year, month + 1, 0).getDate();
     const firstDayOffset = weekStart === "monday"
          ? (firstDay.getDay() + 6) % 7
          : firstDay.getDay();
     const dayLabels = weekStart === "monday"
          ? ["M", "T", "W", "T", "F", "S", "S"]
          : ["S", "M", "T", "W", "T", "F", "S"];
     const weekendIndexes = weekStart === "monday" ? [5, 6] : [0, 6];
     const todayKey = getTodayCalendarDayKey();
     const weekRows = Array.from({
          length: 6
     }, (_, weekIndex) => weekIndex).filter((weekIndex) => {
          const weekStartDayNumber = (weekIndex * 7) + 1 - firstDayOffset;

          return weekStartDayNumber <= daysInMonth && weekStartDayNumber + 6 >= 1;
     });
     const calendarRows = [
          ...(titleVisible ? [0] : []),
          1,
          ...weekRows.map((weekIndex) => weekIndex + 2)
     ];

     calendar.className = "mini-month mini-year-month";
     calendar.classList.toggle("has-week-numbers", weekNumbersEnabled);
     calendar.classList.toggle("has-week-number-outlines", weekNumberOutlines);
     calendar.classList.toggle("has-title-row", titleVisible);
     calendar.classList.toggle("no-title-row", !titleVisible);
     calendar.style.setProperty("--mini-month-visible-columns", "8");
     calendar.style.setProperty("--mini-month-visible-rows", String(calendarRows.length));
     calendar.style.setProperty("--mini-month-visible-column-units", "8");
     calendar.style.setProperty("--mini-month-visible-row-units", "8");

     for (let row = 0; row < calendarRows.length; row += 1) {
          const calendarRow = calendarRows[row];
          const displayRow = row + 1;

          for (let column = 0; column < 8; column += 1) {
               if (!weekNumbersEnabled && column === 0) {
                    continue;
               }

               const cell = document.createElement("span");
               const dayIndex = column - 1;
               const isTitleCell = calendarRow === 0 && column === 1;
               const displayColumn = column + 1;

               cell.className = "mini-month-cell";
               cell.style.gridRow = String(displayRow);
               cell.style.gridColumn = isTitleCell
                    ? "2 / span 7"
                    : String(displayColumn);

               if (calendarRow === 0) {
                    if (isTitleCell) {
                         const titleYear = document.createElement("span");
                         const titleMonth = document.createElement("span");

                         cell.classList.add("mini-month-month", (month + 1) % 2 === 1 ? "monthOdd" : "monthEven");
                         titleYear.textContent = titleYearText;
                         titleMonth.textContent = titleMonthText;
                         titleYear.hidden = !yearVisible;
                         titleMonth.hidden = !monthVisible;
                         cell.classList.toggle("has-title-pair", monthVisible && yearVisible);
                         cell.append(titleMonth, titleYear);
                    } else {
                         continue;
                    }
               } else if (column === 0) {
                    cell.classList.add("mini-month-week");
                    if (calendarRow === 1) {
                         if (weekNumberOutlines) {
                              cell.classList.add("weekNumberCell", "week-number-header");
                         } else {
                              continue;
                         }
                    } else {
                         const weekDate = new Date(year, month, 1 - firstDayOffset + ((calendarRow - 2) * 7));
                         const weekNumberLabel = document.createElement("span");

                         cell.classList.add("weekName", "weekNumberCell");
                         cell.dataset.weekName = getCalendarWeekName(calendarRow - 1, month, year);
                         cell.title = cell.dataset.weekName;
                         weekNumberLabel.className = "weekNumber";
                         weekNumberLabel.textContent = String(getCalendarWeekNumber(weekDate, weekStart));
                         cell.append(weekNumberLabel);
                    }
               } else if (calendarRow === 1) {
                    cell.classList.add("mini-month-day-name", "dayName");
                    cell.textContent = dayLabels[dayIndex];
                    if (weekendIndexes.includes(dayIndex)) {
                         cell.classList.add("mini-month-weekend");
                    }
               } else {
                    const dayNumber = ((calendarRow - 2) * 7) + column - firstDayOffset;

                    if (weekendIndexes.includes(dayIndex)) {
                         cell.classList.add("mini-month-weekend");
                    }
                    if (dayNumber >= 1 && dayNumber <= daysInMonth) {
                         const dayNumberLabel = document.createElement("span");
                         const dayKey = getCalendarDayKey(year, month, dayNumber);

                         cell.classList.add("dayCell");
                         cell.dataset.dayKey = dayKey;
                         markCurrentCalendarDay(cell, dayKey, todayKey);
                         dayNumberLabel.className = "mini-month-day-number dayNumber";
                         markCurrentCalendarDayNumber(dayNumberLabel, dayKey, todayKey);
                         dayNumberLabel.textContent = String(dayNumber);
                         cell.append(dayNumberLabel);
                    }
               }
               if (column === 7) {
                    cell.classList.add("mini-month-edge-right");
               }
               if (row === calendarRows.length - 1) {
                    cell.classList.add("mini-month-edge-bottom");
               }

               calendar.append(cell);
          }
     }

     return calendar;
}

function renderMiniYear(item) {
     let yearGrid = item.querySelector(".mini-year");
     const year = Number(item.dataset.year) || new Date().getFullYear();

     if (!yearGrid) {
          yearGrid = document.createElement("div");
          yearGrid.className = "mini-year";
          item.append(yearGrid);
     }

     yearGrid.replaceChildren();
     for (let month = 0; month < 12; month += 1) {
          yearGrid.append(createMiniYearMonth(item, month, year));
     }
}

function renderMiniMonth(item) {
     if (item.dataset.itemType === "weekly-vertical") {
          renderWeeklyVertical(item);
          return;
     }

     if (item.dataset.itemType === "perpetual-calendar") {
          renderPerpetualCalendar(item);
          return;
     }

     if (item.dataset.itemType === "mini-year") {
          renderMiniYear(item);
          return;
     }

     let calendar = item.querySelector(".mini-month");
     const weekNumberFormat = normalizeWeekNumberFormat(item.dataset.weekNumberFormat, item.dataset.weekNumbers === "false" ? "off" : "no-outlines");
     const weekNumbersEnabled = weekNumberFormat !== "off";
     const weekNumberOutlines = weekNumberFormat === "outlines";
     const weekStart = item.dataset.weekStart || "monday";
     const monthDisplay = item.dataset.monthDisplay || "full";
     const yearDisplay = item.dataset.yearDisplay || (item.dataset.yearVisible === "false" ? "none" : "full");
     const month = Number(item.dataset.month) || 0;
     const year = Number(item.dataset.year) || new Date().getFullYear();
     const titleMonthText = getCalendarMonthTitle(month, monthDisplay);
     const titleYearText = getCalendarYearTitle(year, yearDisplay);
     const monthVisible = titleMonthText !== "";
     const yearVisible = titleYearText !== "";
     const titleVisible = monthVisible || yearVisible;
     const firstDay = new Date(year, month, 1);
     const daysInMonth = new Date(year, month + 1, 0).getDate();
     const firstDayOffset = weekStart === "monday"
          ? (firstDay.getDay() + 6) % 7
          : firstDay.getDay();
     const dayLabels = weekStart === "monday"
          ? ["M", "T", "W", "T", "F", "S", "S"]
          : ["S", "M", "T", "W", "T", "F", "S"];
     const weekendIndexes = weekStart === "monday" ? [5, 6] : [0, 6];
     const hasDayText = isCalendarTextItem(item);
     const dayNotes = hasDayText ? getCalendarDayNotes(item) : {};
     const todayKey = getTodayCalendarDayKey();
     const weekRows = Array.from({
          length: 6
     }, (_, weekIndex) => weekIndex).filter((weekIndex) => {
          const weekStartDayNumber = (weekIndex * 7) + 1 - firstDayOffset;

          return weekStartDayNumber <= daysInMonth && weekStartDayNumber + 6 >= 1;
     });
     const calendarRows = [
          ...(titleVisible ? [0] : []),
          1,
          ...weekRows.map((weekIndex) => weekIndex + 2)
     ];
     const usesExpandedCalendarUnits = item.dataset.itemType === "full-month";
     const titleRowUnits = 1;
     const weekRowUnits = usesExpandedCalendarUnits ? 2 : 1;
     const visibleColumnCount = 8;
     const visibleRowCount = calendarRows.length;
     const visibleColumnUnits = usesExpandedCalendarUnits ? 16 : 8;
     const visibleRowUnits = (titleVisible ? titleRowUnits : 0) + 1 + (weekRows.length * weekRowUnits);

     if (!calendar) {
          calendar = document.createElement("div");
          calendar.className = "mini-month";
          item.append(calendar);
     }

     calendar.replaceChildren();
     calendar.classList.toggle("has-week-numbers", weekNumbersEnabled);
     calendar.classList.toggle("has-week-number-outlines", weekNumberOutlines);
     calendar.classList.toggle("has-title-row", titleVisible);
     calendar.classList.toggle("no-title-row", !titleVisible);
     calendar.style.setProperty("--mini-month-visible-columns", String(visibleColumnCount));
     calendar.style.setProperty("--mini-month-visible-rows", String(visibleRowCount));
     calendar.style.setProperty("--mini-month-visible-column-units", String(visibleColumnUnits));
     calendar.style.setProperty("--mini-month-visible-row-units", String(visibleRowUnits));
     for (let row = 0; row < calendarRows.length; row += 1) {
          const calendarRow = calendarRows[row];
          const displayRow = row + 1;

          for (let column = 0; column < 8; column += 1) {
               if (!weekNumbersEnabled && column === 0) {
                    continue;
               }

               const cell = document.createElement("span");
               const dayIndex = column - 1;
               const isTitleCell = calendarRow === 0 && column === 1;
               const displayColumn = column + 1;

               cell.className = "mini-month-cell";
               cell.style.gridRow = String(displayRow);
               cell.style.gridColumn = isTitleCell
                    ? "2 / span 7"
                    : String(displayColumn);

               if (calendarRow === 0) {
                    if (isTitleCell) {
                         const titleYear = document.createElement("span");
                         const titleMonth = document.createElement("span");

                         cell.classList.add("mini-month-month", (month + 1) % 2 === 1 ? "monthOdd" : "monthEven");
                         titleYear.textContent = titleYearText;
                         titleMonth.textContent = titleMonthText;
                         titleYear.hidden = !yearVisible;
                         titleMonth.hidden = !monthVisible;
                         cell.classList.toggle("has-title-pair", monthVisible && yearVisible);
                         cell.append(titleMonth, titleYear);
                    } else {
                         continue;
                    }
               } else if (column === 0) {
                    cell.classList.add("mini-month-week");
                    if (calendarRow === 1) {
                         if (weekNumberOutlines) {
                              cell.classList.add("weekNumberCell", "week-number-header");
                         } else {
                              continue;
                         }
                    } else {
                         const weekDate = new Date(year, month, 1 - firstDayOffset + ((calendarRow - 2) * 7));
                         const weekNumberLabel = document.createElement("span");

                         cell.classList.add("weekName", "weekNumberCell");
                         cell.dataset.weekName = getCalendarWeekName(calendarRow - 1, month, year);
                         cell.title = cell.dataset.weekName;
                         weekNumberLabel.className = "weekNumber";
                         weekNumberLabel.textContent = String(getCalendarWeekNumber(weekDate, weekStart));
                         cell.append(weekNumberLabel);
                    }
               } else if (calendarRow === 1) {
                    cell.classList.add("mini-month-day-name", "dayName");
                    cell.textContent = dayLabels[dayIndex];
                    if (weekendIndexes.includes(dayIndex)) {
                         cell.classList.add("mini-month-weekend");
                    }
               } else {
                    const dayNumber = ((calendarRow - 2) * 7) + column - firstDayOffset;

                    if (weekendIndexes.includes(dayIndex)) {
                         cell.classList.add("mini-month-weekend");
                    }
                    if (dayNumber >= 1 && dayNumber <= daysInMonth) {
                         const dayNumberLabel = document.createElement("span");
                         const dayKey = getCalendarDayKey(year, month, dayNumber);

                         cell.classList.add("dayCell");
                         cell.dataset.dayKey = dayKey;
                         markCurrentCalendarDay(cell, dayKey, todayKey);
                         dayNumberLabel.className = "mini-month-day-number dayNumber";
                         markCurrentCalendarDayNumber(dayNumberLabel, dayKey, todayKey);
                         dayNumberLabel.textContent = String(dayNumber);
                         cell.addEventListener("pointerdown", (event) => {
                              if (getResizeMode(item, event)) {
                                   return;
                              }

                              event.stopPropagation();
                              selectItem(item);
                         });
                         cell.append(dayNumberLabel);
                         if (hasDayText) {
                              const dayText = document.createElement("div");

                              dayText.className = "calendar-day-text";
                              dayText.dataset.dayKey = dayKey;
                              dayText.setAttribute("contenteditable", "false");
                              dayText.textContent = dayNotes[dayKey] || "";
                              applyCalendarDayTextStyle(item, dayText);
                              dayText.addEventListener("input", () => updateCalendarDayTextOverflow(dayText));
                              dayText.addEventListener("dblclick", (event) => {
                                   event.preventDefault();
                                   event.stopPropagation();
                                   startCalendarDayTextEditing(dayText, item);
                              });
                              dayText.addEventListener("pointerdown", (event) => {
                                   if (dayText.isContentEditable) {
                                        event.stopPropagation();
                                   }
                              });
                              dayText.addEventListener("wheel", (event) => {
                                   if (dayText.isContentEditable) {
                                        event.stopPropagation();
                                   }
                              });
                              cell.addEventListener("dblclick", (event) => {
                                   event.preventDefault();
                                   event.stopPropagation();
                                   startCalendarDayTextEditing(dayText, item);
                              });
                              cell.append(dayText);
                              updateCalendarDayTextOverflow(dayText);
                         }
                    }
               }
               if (column === 7) {
                    cell.classList.add("mini-month-edge-right");
               }
               if (row === calendarRows.length - 1) {
                    cell.classList.add("mini-month-edge-bottom");
               }

               calendar.append(cell);
          }
     }
}

function renderPerpetualCalendar(item) {
     let calendar = item.querySelector(".perpetual-calendar");
     const monthDisplay = item.dataset.monthDisplay || "full";
     const month = Number(item.dataset.month) || 0;
     const year = Number(item.dataset.year) || new Date().getFullYear();
     const titleMonthText = getCalendarMonthTitle(month, monthDisplay);
     const titleYearText = String(year);
     const daysInMonth = getCalendarDaysInMonth(year, month);
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
     const titleYear = document.createElement("span");
     const titleMonth = document.createElement("span");

     titleCell.className = "perpetual-calendar-title";
     titleYear.className = "perpetual-calendar-title-year";
     titleMonth.className = "perpetual-calendar-title-month";
     titleYear.textContent = titleYearText;
     titleMonth.textContent = titleMonthText ? `Perpetual ${titleMonthText}` : "Perpetual";
     titleCell.append(titleYear, titleMonth);
     calendar.append(titleCell);

     for (let day = 1; day <= daysInMonth; day += 1) {
          const date = new Date(year, month, day);
          const dayKey = getCalendarDayKey(year, month, day);
          const row = document.createElement("span");
          const numberCell = document.createElement("span");
          const lineCell = document.createElement("span");

          row.className = "perpetual-calendar-row";
          row.dataset.dayKey = dayKey;
          if (date.getDay() === 0 || date.getDay() === 6) {
               row.classList.add("perpetual-calendar-weekend");
          }
          if (day === daysInMonth) {
               row.classList.add("perpetual-calendar-edge-bottom");
          }
          markCurrentCalendarDay(row, dayKey, todayKey);

          numberCell.className = "perpetual-calendar-day-number dayNumber";
          numberCell.textContent = String(day);
          markCurrentCalendarDayNumber(numberCell, dayKey, todayKey);
          lineCell.className = "perpetual-calendar-line";
          row.append(numberCell, lineCell);
          calendar.append(row);
     }
}

function renderWeeklyVertical(item) {
     let calendar = item.querySelector(".weekly-vertical");
     const weekNumberFormat = normalizeWeekNumberFormat(item.dataset.weekNumberFormat, item.dataset.weekNumbers === "false" ? "off" : "no-outlines");
     const weekNumbersEnabled = weekNumberFormat !== "off";
     const weekNumberOutlines = weekNumberFormat === "outlines";
     const weekStart = item.dataset.weekStart || "monday";
     const monthDisplay = item.dataset.monthDisplay || "full";
     const yearDisplay = item.dataset.yearDisplay || (item.dataset.yearVisible === "false" ? "none" : "full");
     const month = Number(item.dataset.month) || 0;
     const year = Number(item.dataset.year) || new Date().getFullYear();
     const titleMonthText = getCalendarMonthTitle(month, monthDisplay);
     const titleYearText = getCalendarYearTitle(year, yearDisplay);
     const monthVisible = titleMonthText !== "";
     const yearVisible = titleYearText !== "";
     const visibleDays = clamp(Number(item.dataset.visibleDays) || 7, 1, 7);
     const timeIncrement = Number(item.dataset.timeIncrement) || 30;
     const startTime = item.dataset.startTime || "00:00";
     const timeFormat = item.dataset.timeFormat || "24";
     const timeVisible = item.dataset.timeVisible !== "false";
     const shareWeekends = item.dataset.shareWeekends === "true";
     const startMinutes = parseTimeValue(startTime);
     const slotCount = getWeeklyVisibleSlotCount(item);
     const weekStartDate = getWeeklyViewStartDate(item);
     const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
     const dayNotes = getCalendarDayNotes(item);
     const titleParts = [];
     const displayColumns = getWeeklyDisplayColumns(weekStartDate, visibleDays, shareWeekends);
     const weekNumberColumn = 0;
     const timeColumn = timeVisible ? 1 : -1;
     const dayColumnStart = 1 + (timeVisible ? 1 : 0);
     const columnCount = displayColumns.length + dayColumnStart;
     const renderedColumnCount = columnCount;
     const titleVisible = monthVisible || yearVisible;
     const todayKey = getTodayCalendarDayKey();

     if (!calendar) {
          calendar = document.createElement("div");
          calendar.className = "weekly-vertical";
          item.append(calendar);
     }

     calendar.replaceChildren();
     calendar.style.setProperty("--weekly-slot-count", String(slotCount));
     calendar.style.setProperty("--weekly-row-count", String(slotCount + (titleVisible ? 2 : 1)));
     calendar.style.setProperty("--weekly-day-count", String(displayColumns.length));
     calendar.style.setProperty("--weekly-visible-column-units", String(renderedColumnCount * 2));
     calendar.style.gridTemplateColumns = `${Array(dayColumnStart).fill("calc(var(--weekly-column-cell-width, 12px) * 2)").join(" ")} repeat(${displayColumns.length}, minmax(calc(var(--weekly-column-cell-width, 12px) * 2), 1fr))`.trim();
     calendar.classList.toggle("has-week-numbers", weekNumbersEnabled);
     calendar.classList.toggle("has-week-number-outlines", weekNumberOutlines);
     calendar.classList.toggle("has-time-column", timeVisible);
     calendar.classList.toggle("has-title-row", titleVisible);
     calendar.classList.toggle("no-title-row", !titleVisible);

     if (monthVisible) {
          titleParts.push(titleMonthText);
     }

     if (yearVisible) {
          titleParts.push(titleYearText);
     }

     for (let row = 0; row < slotCount + (titleVisible ? 2 : 1); row += 1) {
          const calendarRow = titleVisible ? row : row + 1;

          for (let column = 0; column < columnCount; column += 1) {
               if (calendarRow !== 0 && !weekNumbersEnabled && column === weekNumberColumn) {
                    continue;
               }

               const cell = document.createElement("span");
               const dayIndex = column - dayColumnStart;
               const displayColumn = column + 1;

               cell.className = "weekly-vertical-cell";
               cell.style.gridRow = String(row + 1);
               if (!(calendarRow === 0 && column === 0)) {
                    cell.style.gridColumn = String(displayColumn);
               }

               if (calendarRow === 0 && column === 0) {
                    cell.classList.add("weekly-vertical-title", (month + 1) % 2 === 1 ? "monthOdd" : "monthEven");
                    cell.style.gridColumn = `2 / span ${renderedColumnCount - 1}`;
                    cell.textContent = titleParts.join(" ");
               } else if (calendarRow === 0) {
                    continue;
               } else if (calendarRow === 1 && column === weekNumberColumn) {
                    if (weekNumberOutlines) {
                         cell.classList.add("weekly-vertical-week", "weekNumberCell", "week-number-header");
                    } else {
                         continue;
                    }
               } else if (column === weekNumberColumn) {
                    cell.classList.add("weekly-vertical-week", "weekNumberCell");
                    if (calendarRow === 2) {
                         const weekNumberLabel = document.createElement("span");

                         weekNumberLabel.className = "weekNumber";
                         weekNumberLabel.textContent = String(getCalendarWeekNumber(weekStartDate, weekStart));
                         cell.append(weekNumberLabel);
                    }
               } else if (calendarRow === 1 && column === timeColumn) {
                    cell.classList.add("weekly-vertical-time-heading");
                    cell.textContent = "Time";
               } else if (calendarRow === 1) {
                    const displayColumn = displayColumns[dayIndex];

                    cell.classList.add("weekly-vertical-date", "dayCell", "dayName");
                    if (displayColumn.type === "shared-weekend") {
                         cell.classList.add("weekly-vertical-shared-weekend");
                    }
                    if (displayColumn.dates.some((date) => date.getDay() === 0 || date.getDay() === 6)) {
                         cell.classList.add("weekly-vertical-weekend");
                    }
                    cell.dataset.dayKey = displayColumn.dates.map((date) => getCalendarDayKey(date.getFullYear(), date.getMonth(), date.getDate())).join(",");
                    markCurrentCalendarDay(cell, displayColumn.dates.map((date) => getCalendarDayKey(date.getFullYear(), date.getMonth(), date.getDate())), todayKey);
                    displayColumn.dates.slice(0, 1).forEach((date) => {
                         const dateLabel = document.createElement("span");
                         const dayName = document.createElement("span");
                         const dayNumber = document.createElement("span");

                         dateLabel.className = "weekly-vertical-date-label";
                         dayName.className = "weekly-vertical-day-name";
                         dayName.textContent = dayLabels[date.getDay()];
                         dayNumber.className = "dayNumber";
                         markCurrentCalendarDayNumber(dayNumber, getCalendarDayKey(date.getFullYear(), date.getMonth(), date.getDate()), todayKey);
                         dayNumber.textContent = String(date.getDate()).padStart(2, "0");
                         dateLabel.append(dayName, dayNumber);
                         cell.append(dateLabel);
                    });
               } else if (column === timeColumn) {
                    const timeMinutes = startMinutes + ((calendarRow - 2) * timeIncrement);

                    cell.classList.add("weekly-vertical-time");
                    cell.textContent = shouldShowWeeklyTimeLabel(timeMinutes, timeIncrement) ? formatWeeklyTimeLabel(timeMinutes, timeFormat) : "";
               } else {
                    const displayColumn = displayColumns[dayIndex];
                    const slotMinutes = startMinutes + ((calendarRow - 2) * timeIncrement);
                    const primaryDate = displayColumn.dates[0];
                    const slotKey = displayColumn.type === "shared-weekend"
                         ? `${displayColumn.dates.map((date) => getCalendarDayKey(date.getFullYear(), date.getMonth(), date.getDate())).join("+")}T${formatMinutesAsTime(slotMinutes)}`
                         : getWeeklySlotKey(primaryDate, slotMinutes);
                    const slotText = document.createElement("div");
                    const isSharedWeekendLabelRow = displayColumn.type === "shared-weekend" && calendarRow === 2 + Math.floor(slotCount / 2);

                    cell.classList.add("weekly-vertical-slot");
                    if (displayColumn.type === "shared-weekend") {
                         cell.classList.add("weekly-vertical-shared-weekend");
                    }
                    if (displayColumn.dates.some((date) => date.getDay() === 0 || date.getDay() === 6)) {
                         cell.classList.add("weekly-vertical-weekend");
                    }
                    cell.classList.add("dayCell");
                    cell.dataset.dayKey = slotKey;
                    markCurrentCalendarDay(cell, displayColumn.dates.map((date) => getCalendarDayKey(date.getFullYear(), date.getMonth(), date.getDate())), todayKey);
                    if (isSharedWeekendLabelRow) {
                         const sundayDate = displayColumn.dates[1];
                         const sundayMarker = document.createElement("span");
                         const sundayName = document.createElement("span");
                         const sundayNumber = document.createElement("span");

                         sundayMarker.className = "weekly-vertical-date-label weekly-vertical-sunday-mid-marker";
                         sundayName.className = "weekly-vertical-day-name";
                         sundayName.textContent = dayLabels[sundayDate.getDay()];
                         sundayNumber.className = "dayNumber";
                         markCurrentCalendarDayNumber(sundayNumber, getCalendarDayKey(sundayDate.getFullYear(), sundayDate.getMonth(), sundayDate.getDate()), todayKey);
                         sundayNumber.textContent = String(sundayDate.getDate()).padStart(2, "0");
                         sundayMarker.append(sundayName, sundayNumber);
                         cell.append(sundayMarker);
                    } else {
                         slotText.className = "calendar-day-text weekly-vertical-slot-text";
                         slotText.dataset.dayKey = slotKey;
                         slotText.setAttribute("contenteditable", "false");
                         slotText.textContent = dayNotes[slotKey] || dayNotes[getWeeklySlotKey(primaryDate, slotMinutes)] || "";
                         applyCalendarDayTextStyle(item, slotText);
                         slotText.addEventListener("input", () => updateCalendarDayTextOverflow(slotText));
                         slotText.addEventListener("dblclick", (event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              startCalendarDayTextEditing(slotText, item);
                         });
                         slotText.addEventListener("pointerdown", (event) => {
                              if (slotText.isContentEditable) {
                                   event.stopPropagation();
                              }
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

               if (column === columnCount - 1 || (calendarRow === 0 && column === dayColumnStart)) {
                    cell.classList.add("weekly-vertical-edge-right");
               }
               if (calendarRow === slotCount + 1) {
                    cell.classList.add("weekly-vertical-edge-bottom");
               }

               calendar.append(cell);
          }
     }
}

// NOTE: Calendar Widget Settings Controls
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
          const dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()];

          option.value = String(day);
          option.textContent = `${String(day).padStart(2, "0")} ${dayName}`;
          select.append(option);
     }
     select.value = String(nextDay);
}

function setMiniMonthSettings(item, settings = {}) {
     const today = new Date();
     const weekNumberFormat = getWeekNumberFormatFromSettings(settings, item);

     item.dataset.weekNumberFormat = weekNumberFormat;
     item.dataset.weekNumbers = weekNumberFormat === "off" ? "false" : "true";
     item.dataset.weekStart = settings.weekStart || item.dataset.weekStart || "monday";
     item.dataset.monthDisplay = settings.monthDisplay || item.dataset.monthDisplay || "full";
     item.dataset.monthVisible = item.dataset.monthDisplay === "none" ? "false" : "true";
     item.dataset.month = settings.month || item.dataset.month || String(today.getMonth());
     item.dataset.yearDisplay = settings.yearDisplay || item.dataset.yearDisplay || (settings.yearVisible === "false" || item.dataset.yearVisible === "false" ? "none" : "full");
     item.dataset.yearVisible = item.dataset.yearDisplay === "none" ? "false" : "true";
     item.dataset.year = settings.year || item.dataset.year || String(today.getFullYear());
     item.dataset.startDay = settings.startDay || item.dataset.startDay || "1";
     item.dataset.visibleDays = settings.visibleDays || item.dataset.visibleDays || "7";
     item.dataset.startDay = String(clamp(Number(item.dataset.startDay) || 1, 1, getCalendarDaysInMonth(Number(item.dataset.year), Number(item.dataset.month))));
     item.dataset.timeIncrement = settings.timeIncrement || item.dataset.timeIncrement || "30";
     item.dataset.startTime = settings.startTime || item.dataset.startTime || "00:00";
     item.dataset.timeFormat = settings.timeFormat || item.dataset.timeFormat || "24";
     item.dataset.timeVisible = settings.timeVisible ?? item.dataset.timeVisible ?? "true";
     item.dataset.shareWeekends = settings.shareWeekends ?? item.dataset.shareWeekends ?? "false";
     renderMiniMonth(item);
     updateCalendarGridMetrics(item, getItemPage(item), getItemBox(item));
     updatePerpetualCalendarGridMetrics(item, getItemPage(item), getItemBox(item));

     const controls = getItemControls(item) || item;
     const weekNumberSelect = controls.querySelector("[data-widget-control='week-number-format']");
     const weekStartSelect = controls.querySelector("[data-widget-control='week-start']");
     const monthSelect = controls.querySelector("[data-widget-control='month']");
     const monthDisplaySelect = controls.querySelector("[data-widget-control='month-display']");
     const yearSelect = controls.querySelector("[data-widget-control='year']");
     const yearDisplaySelect = controls.querySelector("[data-widget-control='year-display']");
     const startDaySelect = controls.querySelector("[data-widget-control='start-day']");
     const visibleDaysSelect = controls.querySelector("[data-widget-control='visible-days']");
     const timeIncrementSelect = controls.querySelector("[data-widget-control='time-increment']");
     const startTimeSelect = controls.querySelector("[data-widget-control='start-time']");
     const timeFormatSelect = controls.querySelector("[data-widget-control='time-format']");
     const timeVisibleInput = controls.querySelector("[data-widget-control='time-visible']");
     const shareWeekendsInput = controls.querySelector("[data-widget-control='share-weekends']");

     if (weekNumberSelect) {
          weekNumberSelect.value = item.dataset.weekNumberFormat;
     }

     if (weekStartSelect) {
          weekStartSelect.value = item.dataset.weekStart;
     }

     if (monthSelect) {
          monthSelect.value = item.dataset.month;
     }

     if (monthDisplaySelect) {
          monthDisplaySelect.value = item.dataset.monthDisplay;
     }

     if (yearSelect) {
          yearSelect.value = item.dataset.year;
     }

     if (yearDisplaySelect) {
          yearDisplaySelect.value = item.dataset.yearDisplay;
     }

     syncStartDayOptions(startDaySelect, Number(item.dataset.year), Number(item.dataset.month), item.dataset.startDay);

     if (visibleDaysSelect) {
          visibleDaysSelect.value = item.dataset.visibleDays;
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

     controls.querySelectorAll("select").forEach(syncCustomSelect);
}

// NOTE: Page Titles, Table Of Contents, And Page Ins/Rmv Rules
function getClearPageSides() {
     return PageControls.getClearPageSides({ viewFocusPoints, viewFocusIndex });
}

function isPageTitleItemType(type) {
     return type === "page-title";
}

function isPageTitleItem(item) {
     return isPageTitleItemType(item?.dataset?.itemType);
}

function isStickyTextItemType(type) {
     return type === "sticky" || type === "page-title";
}

function isStickyTextItem(item) {
     return isStickyTextItemType(item?.dataset?.itemType);
}

function getPageNumberForPage(page) {
     return getCurrentSpreadPageNumber(getPageId(page));
}

function getPageTitleText(item) {
     const text = getStickyTextElement(item)?.textContent?.trim() || "";

     return text;
}

function getPageTitleItemForPageNumber(pageNumber, exceptItem = null) {
     return getAllPlannerItems().find((item) => (
          item !== exceptItem &&
          isPageTitleItem(item) &&
          item.dataset.pageId &&
          getItemPageNumber(item) === pageNumber
     )) || null;
}

function getPageTitleEntries() {
     return getAllPlannerItems()
          .filter((item) => isPageTitleItem(item) && item.dataset.pageId && isPageNumberAvailable(getItemPageNumber(item)))
          .map((item) => ({
               pageNumber: getItemPageNumber(item),
               title: getPageTitleText(item)
          }))
          .filter((entry) => entry.title !== "")
          .sort((first, second) => first.pageNumber - second.pageNumber);
}

function renderTocWidgets() {
     renderTocWidgetsForItems(getAllPlannerItems(), getPageTitleEntries);
}

function canPlaceItemOnPage(item, page) {
     if (!page || !isPageTitleItem(item)) {
          return true;
     }

     const pageNumber = getPageNumberForPage(page);

     return isPageNumberAvailable(pageNumber) && !getPageTitleItemForPageNumber(pageNumber, item);
}

function canPlaceActiveMoveItemsOnPage(page) {
     if (!page || activeAction?.type !== "move") {
          return true;
     }

     const pageNumber = getPageNumberForPage(page);
     const pageTitleItems = activeAction.items.filter(({ item }) => isPageTitleItem(item));

     if (!pageTitleItems.length) {
          return true;
     }

     if (!isPageNumberAvailable(pageNumber) || pageTitleItems.length > 1) {
          return false;
     }

     const existingTitleItem = getPageTitleItemForPageNumber(pageNumber);

     return !existingTitleItem || pageTitleItems.some(({ item }) => item === existingTitleItem);
}

function clearItems(items) {
     items.forEach((item) => {
          selectedItems.delete(item);
          closeItemMenu(item);
          item.remove();
     });
     selectedItem = selectedItems.size ? Array.from(selectedItems).at(-1) : null;
     updateObjectControlsState();
}

function shiftPageItemsFromPage(startPageNumber, offset) {
     getAllPlannerItems().forEach((item) => {
          if (!item.dataset.pageId) {
               return;
          }

          const pageNumber = getItemPageNumber(item);

          if (pageNumber >= startPageNumber) {
               setItemPageNumber(item, pageNumber + offset);
          }
     });
}

function insertFocusedPage() {
     PageControls.insertFocusedPage({
          notebookPageCount,
          maxNotebookPageCount,
          focusedPageNumber: getFocusedPageNumber(),
          clamp,
          clearSelection,
          closeItemMenus,
          shiftPageItemsFromPage,
          setNotebookPageCount,
          setFocusedPageNumber,
          syncNotebookSpread,
          applyViewControls,
          notifyTemplateChanged
     });
}

function deleteFocusedPage() {
     const deletePageNumber = getFocusedPageNumber();

     PageControls.deleteFocusedPage({
          notebookPageCount,
          minNotebookPageCount,
          focusedPageNumber: deletePageNumber,
          clearSelection,
          closeItemMenus,
          removeFocusedPageItems: (pageToDelete) => {
               const removedItems = [];

               getAllPlannerItems().forEach((item) => {
                    if (!item.dataset.pageId) {
                         return;
                    }

                    const pageNumber = getItemPageNumber(item);

                    if (pageNumber === pageToDelete) {
                         removedItems.push(item);
                    } else if (pageNumber > pageToDelete) {
                         setItemPageNumber(item, pageNumber - 1);
                    }
               });
               clearItems(removedItems);
          },
          setNotebookPageCount,
          setFocusedPageNumber,
          syncNotebookSpread,
          applyViewControls,
          notifyTemplateChanged
     });
}

function clearFocusedPage() {
     PageControls.clearFocusedPage({
          clearItems,
          getFocusedPageItems: () => {
               const pageSides = new Set(getClearPageSides());

               return getAllPlannerItems().filter((item) => (
                    item.dataset.pageId &&
                    getItemSpreadIndex(item) === currentSpreadIndex &&
                    pageSides.has(item.dataset.pageId)
               ));
          },
          notifyTemplateChanged
     });
}

function clearCurrentBook() {
     PageControls.clearCurrentBook({
          clearCurrentBookItems,
          notifyTemplateChanged
     });
}

function changePaperSetting() {
     const previousPaperKey = plannerConfig.paperKey;

     savePlannerBook(previousPaperKey);
     clearCurrentBookItems();
     plannerConfig = buildPlannerConfig();
     applyPlannerConfig();
     restorePlannerBook(plannerConfig.paperKey);
     syncNotebookSpread();
     applyViewControls();
     notifyTemplateChanged();
}

function notifyTemplateChanged() {
     renderTocWidgets();
     savePlannerState();
     window.dispatchEvent(new CustomEvent("perfectplanner:templatechange", {
          detail: serializePlannerTemplate()
     }));
}

// NOTE: Item Position, Size, And Grid Snapping
function getPageFromPoint(clientX, clientY) {
     return pages.find((page) => {
          const rect = page.getBoundingClientRect();

          return (
               clientX >= rect.left &&
               clientX <= rect.right &&
               clientY >= rect.top &&
               clientY <= rect.bottom
          );
     });
}

function getPageFromDraggedBox(item, clientX, clientY, offsetX, offsetY) {
     return pages.find((page) => {
          const box = getMovedBox(item, page, clientX, clientY, offsetX, offsetY, false);

          return hasRequiredGridOverlap(box, page);
     });
}

function snap(value, gridSize) {
     return Math.round(value / gridSize) * gridSize;
}

function clamp(value, min, max) {
     return Math.min(max, Math.max(min, value));
}

function boxesIntersect(first, second) {
     return !(
          first.x + first.width < second.x ||
          second.x + second.width < first.x ||
          first.y + first.height < second.y ||
          second.y + second.height < first.y
     );
}

function getDeskRelativeRect(element) {
     const deskRect = plannerDesk.getBoundingClientRect();
     const rect = element.getBoundingClientRect();

     return {
          x: rect.left - deskRect.left,
          y: rect.top - deskRect.top,
          width: rect.width,
          height: rect.height
     };
}

function getItemPage(item) {
     if (item.dataset.pageId) {
          if (getItemSpreadIndex(item) !== currentSpreadIndex) {
               return null;
          }
          return pages.find((page) => getPageId(page) === item.dataset.pageId) || null;
     }

     return item.closest("[data-page]");
}

function snapToGridOrigin(value, origin, gridSize) {
     return origin + snap(value - origin, gridSize);
}

function getItemBox(item) {
     return {
          x: Number(item.dataset.x) || 0,
          y: Number(item.dataset.y) || 0,
          width: Number(item.dataset.width) || item.offsetWidth,
          height: Number(item.dataset.height) || item.offsetHeight
     };
}

function refreshPageItemViews() {
     getPlannerItems().forEach((item) => {
          if (getItemPage(item)) {
               setItemBox(item, getItemBox(item));
               positionItemControls(item);
          }
     });
}

function setItemBox(item, box) {
     const page = getItemPage(item);
     const shouldScaleWithPage = page && item.parentElement === plannerDesk;
     const viewZoom = shouldScaleWithPage ? getViewZoom() : 1;

     if (page) {
          box = clampPerpetualCalendarBox(item, page, box);
          box = clampTocBox(item, page, box);
     }

     item.dataset.x = String(box.x);
     item.dataset.y = String(box.y);
     item.dataset.width = String(box.width);
     item.dataset.height = String(box.height);
     item.style.transformOrigin = "top left";
     item.style.transform = shouldScaleWithPage ? `scale(${viewZoom})` : "";
     if (shouldScaleWithPage) {
          const deskRect = plannerDesk.getBoundingClientRect();
          const pageRect = page.getBoundingClientRect();

          item.style.left = `${pageRect.left - deskRect.left + (box.x * viewZoom)}px`;
          item.style.top = `${pageRect.top - deskRect.top + (box.y * viewZoom)}px`;
     } else {
          item.style.left = `${box.x}px`;
          item.style.top = `${box.y}px`;
     }
     item.style.width = `${box.width}px`;
     item.style.height = `${box.height}px`;
     updateStickyDotGrid(item, page, box);
     updateItemSizeLabel(item);
     if (item.dataset.itemType === "full-month" || item.dataset.itemType === "weekly-vertical") {
          updateCalendarGridMetrics(item, page, box);
     }
     updateTocGridMetrics(item, page, box);
     updatePerpetualCalendarGridMetrics(item, page, box);
     updateMiniYearGridMetrics(item, page, box);
     updateItemTextLineHeight(item);
     updateStickyTextOverflow(item);
     renderToc(item);
     if (item.dataset.itemType === "weekly-vertical") {
          renderWeeklyVertical(item);
     }
     updateCalendarTextOverflow(item);
}

function updateStickyDotGrid(item, page, box) {
     if (item.dataset.itemType !== "sticky") {
          return;
     }

     if (!page) {
          item.style.setProperty("--sticky-dot-grid-size-x", `${box.width / stickyGridUnits}px`);
          item.style.setProperty("--sticky-dot-grid-size-y", `${box.height / stickyGridUnits}px`);
          item.style.setProperty("--sticky-dot-grid-offset-x", "0px");
          item.style.setProperty("--sticky-dot-grid-offset-y", "0px");
          return;
     }

     const grid = getGridSize(page);
     const origin = getGridSnapOrigin(page);
     const offsetX = (((box.x - origin.x) % grid.x) + grid.x) % grid.x;
     const offsetY = (((box.y - origin.y) % grid.y) + grid.y) % grid.y;

     item.style.setProperty("--sticky-dot-grid-size-x", `${grid.x}px`);
     item.style.setProperty("--sticky-dot-grid-size-y", `${grid.y}px`);
     item.style.setProperty("--sticky-dot-grid-offset-x", `${-offsetX}px`);
     item.style.setProperty("--sticky-dot-grid-offset-y", `${-offsetY}px`);
}

// NOTE: Text Inside Notes, Titles, And Calendars
function getStickyTextElement(item) {
     return item.querySelector(".sticky-text");
}

function updateItemTextLineHeight(item) {
     if (!item) {
          return;
     }

     if (isStickyTextItem(item)) {
          const textElement = getStickyTextElement(item);

          if (textElement) {
               textElement.style.lineHeight = getTextLineHeightPixels(item, item.dataset.textLineHeight);
          }
     }

     if (isCalendarTextItem(item)) {
          item.querySelectorAll(".calendar-day-text").forEach((textElement) => {
               textElement.style.lineHeight = getTextLineHeightPixels(item, item.dataset.dayTextLineHeight);
          });
     }
}

function setStickyTextSettings(item, settings = {}) {
     if (!isStickyTextItem(item)) {
          return;
     }

     const textElement = getStickyTextElement(item);
     const controls = getItemControls(item) || item;
     const isEnabled = isPageTitleItem(item) ? "true" : settings.enabled ?? item.dataset.textEnabled ?? "false";

     item.dataset.textEnabled = String(isEnabled);
     item.dataset.textSize = settings.size || item.dataset.textSize || "10";
     item.dataset.textFont = settings.font || item.dataset.textFont || "noto";
     item.dataset.textColor = settings.color || item.dataset.textColor || "var(--color-gray1)";
     delete item.dataset.textAlpha;
     item.dataset.textBold = settings.bold ?? item.dataset.textBold ?? "false";
     item.dataset.textItalic = settings.italic ?? item.dataset.textItalic ?? "false";
     item.dataset.textUnderline = settings.underline ?? item.dataset.textUnderline ?? "false";
     item.dataset.textAlign = settings.align || item.dataset.textAlign || "left";
     item.dataset.textLineHeight = settings.lineHeight || item.dataset.textLineHeight || "1";

     if (textElement) {
          if (settings.content !== undefined) {
               textElement.textContent = settings.content;
          }

          textElement.hidden = item.dataset.textEnabled !== "true";
          textElement.style.fontSize = `${item.dataset.textSize}px`;
          textElement.style.color = item.dataset.textColor;
          textElement.style.fontFamily = getStickyTextFont(item.dataset.textFont);
          textElement.style.fontWeight = item.dataset.textBold === "true" ? "700" : "400";
          textElement.style.fontStyle = item.dataset.textItalic === "true" ? "italic" : "normal";
          textElement.style.textDecoration = item.dataset.textUnderline === "true" ? "underline" : "none";
          textElement.style.textAlign = item.dataset.textAlign;
          textElement.style.lineHeight = getTextLineHeightPixels(item, item.dataset.textLineHeight);
     }

     const enabledInput = controls.querySelector("[data-text-control='enabled']");
     const sizeInput = controls.querySelector("[data-text-control='size']");
     const fontSelect = controls.querySelector("[data-text-control='font']");
     const colorInput = controls.querySelector("[data-text-control='color']");
     const colorSwatches = controls.querySelector("[data-text-swatches='color']");
     const boldInput = controls.querySelector("[data-text-control='bold']");
     const italicInput = controls.querySelector("[data-text-control='italic']");
     const underlineInput = controls.querySelector("[data-text-control='underline']");
     const alignSelect = controls.querySelector("[data-text-control='align']");
     const lineHeightSelect = controls.querySelector("[data-text-control='line-height']");

     if (enabledInput) {
          enabledInput.checked = item.dataset.textEnabled === "true";
     }

     if (sizeInput) {
          sizeInput.value = item.dataset.textSize;
     }

     if (fontSelect) {
          fontSelect.value = item.dataset.textFont;
     }

     if (colorInput) {
          setPaletteControlValue(colorInput, colorSwatches, item.dataset.textColor);
     }

     if (boldInput) {
          boldInput.checked = item.dataset.textBold === "true";
     }

     if (italicInput) {
          italicInput.checked = item.dataset.textItalic === "true";
     }

     if (underlineInput) {
          underlineInput.checked = item.dataset.textUnderline === "true";
     }

     if (alignSelect) {
          alignSelect.value = item.dataset.textAlign;
     }

     if (lineHeightSelect) {
          lineHeightSelect.value = item.dataset.textLineHeight;
     }

     controls.querySelectorAll("select").forEach(updateCustomSelectDisplay);
     updateStickyTextOverflow(item);
}

function getStickyTextFont(fontKey) {
     const fonts = {
          noto: "var(--font-noto)",
          dancing: "var(--font-dancing)",
          sans: "Arial, Verdana, sans-serif",
          serif: "Georgia, serif"
     };

     return fonts[fontKey] || fonts.noto;
}

function updateStickyTextOverflow(item) {
     if (!item || !isStickyTextItem(item)) {
          return;
     }

     const textElement = getStickyTextElement(item);

     if (!textElement || item.dataset.textEnabled !== "true") {
          item.dataset.textOverflow = "false";
          return;
     }

     requestAnimationFrame(() => {
          item.dataset.textOverflow = String(textElement.scrollHeight > textElement.clientHeight + 1);
     });
}

function updateTextEditingState() {
     plannerDesk.classList.toggle("is-editing-text", Boolean(document.querySelector(".planner-item.is-editing-text, .planner-item.is-editing-day-text")));
}

function stopStickyTextEditing(item) {
     const textElement = getStickyTextElement(item);

     if (!textElement) {
          return;
     }

     textElement.setAttribute("contenteditable", "false");
     item.classList.remove("is-editing-text");
     updateTextEditingState();
     updateStickyTextOverflow(item);
     notifyTemplateChanged();
}

function startStickyTextEditing(item) {
     if (!isStickyTextItem(item)) {
          return;
     }

     const textElement = getStickyTextElement(item);

     if (!textElement) {
          return;
     }

     if (item.dataset.textEnabled !== "true") {
          setStickyTextSettings(item, {
               enabled: "true"
          });
     }

     item.classList.add("is-editing-text");
     textElement.hidden = false;
     textElement.setAttribute("contenteditable", "true");
     updateTextEditingState();

     requestAnimationFrame(() => {
          textElement.focus();

          const selection = window.getSelection();
          const range = document.createRange();

          range.selectNodeContents(textElement);
          range.collapse(false);
          selection.removeAllRanges();
          selection.addRange(range);
     });
}

function getDeskBox(item, clientX, clientY, offsetX, offsetY) {
     const deskRect = plannerDesk.getBoundingClientRect();
     const current = getItemBox(item);

     return {
          ...current,
          x: clientX - deskRect.left - offsetX,
          y: clientY - deskRect.top - offsetY
     };
}

function getPageOverlap(box, page) {
     const overlapWidth = Math.max(0, Math.min(box.x + box.width, page.clientWidth) - Math.max(box.x, 0));
     const overlapHeight = Math.max(0, Math.min(box.y + box.height, page.clientHeight) - Math.max(box.y, 0));

     return {
          width: overlapWidth,
          height: overlapHeight
     };
}

function hasRequiredGridOverlap(box, page) {
     const grid = getGridSize(page);
     const overlap = getPageOverlap(box, page);
     const isOffLeft = box.x < 0;
     const isOffRight = box.x + box.width > page.clientWidth;
     const isOffTop = box.y < 0;
     const isOffBottom = box.y + box.height > page.clientHeight;
     const hasHorizontalDepth = isOffLeft || isOffRight ? overlap.width >= grid.x * pageStickDepth : true;
     const hasVerticalDepth = isOffTop || isOffBottom ? overlap.height >= grid.y * pageStickDepth : true;

     return overlap.width > 0 && overlap.height > 0 && hasHorizontalDepth && hasVerticalDepth;
}

function getGridSnappedSize(item, page) {
     const grid = getGridSize(page);
     const current = getItemBox(item);
     const units = getItemGridUnits(item);
     const fallbackSize = {
          width: grid.x * units.width,
          height: grid.y * units.height
     };

     if (item.classList.contains("is-floating-source")) {
          return fallbackSize;
     }

     return {
          width: current.width ? Math.round(current.width / grid.x) * grid.x : fallbackSize.width,
          height: current.height ? Math.round(current.height / grid.y) * grid.y : fallbackSize.height
     };
}

function getItemGridUnits(item) {
     if (item.dataset.itemType === "mini-month") {
          return getMiniMonthGridUnits(item);
     }

     if (isFullPageCalendarType(item.dataset.itemType)) {
          return {
               width: plannerConfig.gridColumns,
               height: plannerConfig.gridRows
          };
     }

     return itemGridUnits[item.dataset.itemType] || itemGridUnits.sticky;
}

// NOTE: Click Items, Select Items, And Open Item Menus
function clearDragOver() {
     pages.forEach((page) => page.classList.remove("is-drag-over"));
}

function getItemControls(item) {
     return document.querySelector(`.item-controls[data-owner-id="${item.dataset.templateId}"]`);
}

function getItemTypeLabel(type) {
     return {
          sticky: "Sticky Note",
          "page-title": "Page Title",
          toc: "Table of Contents",
          "mini-month": "Mini Month",
          "full-month": "Full Month",
          "mini-year": "Mini Year",
          "perpetual-calendar": "Perpetual Calendar",
          "weekly-vertical": "Vertical Week"
     }[type] || "Widget";
}

function getItemAriaLabel(type) {
     return `${getItemTypeLabel(type)} widget`;
}

function getActionItemsTypeLabel(items) {
     if (!items.length) {
          return "Widget";
     }

     const type = items[0]?.dataset.itemType || "sticky";

     return items.every((item) => item.dataset.itemType === type) ? getItemTypeLabel(type) : "Multiple";
}

function updateActionsPopupTypeLabel(controls, items) {
     const typeLabel = controls.querySelector("[data-actions-widget-type]");

     if (typeLabel) {
          typeLabel.textContent = getActionItemsTypeLabel(items);
     }
}

function positionItemControls(item) {
     const controls = getItemControls(item);

     if (!controls || !controls.classList.contains("is-floating")) {
          return;
     }

     if (controls.classList.contains("is-actions-popup")) {
          return;
     }

     const itemRect = item.getBoundingClientRect();
     const deskRect = plannerDesk.getBoundingClientRect();
     const menuWidth = controls.offsetWidth || 148;
     const menuHeight = controls.offsetHeight || 0;
     const gap = 8;
     const preferRight = itemRect.right + gap + menuWidth <= deskRect.right;
     const left = preferRight
          ? itemRect.right - deskRect.left + gap
          : itemRect.left - deskRect.left - menuWidth - gap;
     const top = clamp(itemRect.top - deskRect.top, gap, Math.max(gap, deskRect.height - menuHeight - gap));

     controls.style.left = `${Math.max(gap, left)}px`;
     controls.style.top = `${top}px`;
}

function positionItemActionsPopup(controls, event) {
     const deskRect = plannerDesk.getBoundingClientRect();
     const gap = 8;
     const menuWidth = controls.offsetWidth || 156;
     const menuHeight = controls.offsetHeight || 0;
     const x = clamp(event.clientX - deskRect.left, gap, Math.max(gap, deskRect.width - menuWidth - gap));
     const y = clamp(event.clientY - deskRect.top, gap, Math.max(gap, deskRect.height - menuHeight - gap));

     controls.style.left = `${x}px`;
     controls.style.top = `${y}px`;
}

function getSelectedOrGroupedActionItems(item) {
     if (selectedItems.has(item)) {
          return Array.from(selectedItems);
     }

     if (item.dataset.groupId) {
          return getPlannerItems().filter((plannerItem) => plannerItem.dataset.groupId === item.dataset.groupId);
     }

     return [item];
}

function itemsShareWidgetType(items) {
     if (items.length < 2) {
          return true;
     }

     const type = items[0]?.dataset.itemType;

     return Boolean(type) && items.every((item) => item.dataset.itemType === type);
}

function setControlsActionItems(controls, items) {
     controls.dataset.actionItemIds = items.map((item) => item.dataset.templateId).filter(Boolean).join(" ");
}

function clearControlsActionItems(controls) {
     delete controls.dataset.actionItemIds;
}

function getControlsActionItems(controls) {
     const ids = controls?.dataset.actionItemIds?.split(" ").filter(Boolean) || [];

     if (!ids.length) {
          return [];
     }

     const idSet = new Set(ids);

     return getPlannerItems().filter((item) => idSet.has(item.dataset.templateId));
}

function openItemMenu(item) {
     const controls = getItemControls(item);
     const actionItems = getSelectedOrGroupedActionItems(item);

     if (!controls || !objectControlsShell) {
          return;
     }

     if (!itemsShareWidgetType(actionItems)) {
          return;
     }

     closeItemMenu(item);
     closeItemMenus();
     objectControlsShell.append(controls);
     setControlsActionItems(controls, actionItems);
     controls.classList.remove("is-floating", "is-actions-popup");
     controls.classList.add("is-docked");
     setItemControlsTab(controls, "style");
     item.classList.add("is-menu-open");
     updateObjectControlsState();
     updateClipboardControls();
     selectSettingsTab("style");
     openSidebar();
}

function openItemActionsPopup(item, event, actionItems = getSelectedOrGroupedActionItems(item)) {
     const controls = getItemControls(item);

     if (!controls) {
          return;
     }

     closeSidebar();
     closeItemMenus();
     plannerDesk.append(controls);
     setControlsActionItems(controls, actionItems);
     updateActionsPopupTypeLabel(controls, actionItems);
     controls.classList.remove("is-docked");
     controls.classList.add("is-floating", "is-actions-popup");
     item.classList.add("is-menu-open");
     setItemControlsTab(controls, "actions");
     positionItemActionsPopup(controls, event);
     updateObjectControlsState();
     updateClipboardControls();
}

function closeItemMenu(item) {
     const controls = getItemControls(item);

     item.classList.remove("is-menu-open");
     if (!controls) {
          return;
     }

     closeCustomSelects(controls);
     clearSelectFocus(controls);
     controls.classList.remove("is-floating", "is-docked", "is-actions-popup");
     controls.removeAttribute("style");
     clearControlsActionItems(controls);
     item.append(controls);
     updateObjectControlsState();
}

function getAllPlannerItems() {
     return Array.from(document.querySelectorAll(".planner-item:not(.is-floating-source)"));
}

function getPlannerItems() {
     return getAllPlannerItems().filter((item) => !item.classList.contains("is-spread-hidden"));
}

function clearItemSelectionClasses(item) {
     closeItemMenu(item);
     item.classList.remove("is-selected", "is-resizing", "is-resize-ew", "is-resize-ns", "is-resize-nwse", "is-resize-nesw");
}

function setItemSelected(item, isSelected) {
     item.classList.toggle("is-selected", isSelected);

     if (isSelected) {
          selectedItems.add(item);
          selectedItem = item;
          return;
     }

     selectedItems.delete(item);
     clearItemSelectionClasses(item);

     if (selectedItem === item) {
          selectedItem = selectedItems.size ? Array.from(selectedItems).at(-1) : null;
     }
}

function selectItems(items) {
     clearSelection();
     items.forEach((item) => setItemSelected(item, true));
}

function selectItem(item, shouldAdd = false) {
     if (shouldAdd) {
          setItemSelected(item, !selectedItems.has(item));
          return;
     }

     if (item.dataset.groupId) {
          selectItems(getPlannerItems().filter((plannerItem) => plannerItem.dataset.groupId === item.dataset.groupId));
          selectedItem = item;
          return;
     }

     selectItems([item]);
}

function clearSelection() {
     selectedItems.forEach((item) => clearItemSelectionClasses(item));
     selectedItems = new Set();
     selectedItem = null;
}

function closeItemMenus(exceptItem = null) {
     document.querySelectorAll(".planner-item.is-menu-open").forEach((item) => {
          if (item !== exceptItem) {
               closeItemMenu(item);
          }
     });
}

function syncSelectionToActionItems(items, preferredItem = null) {
     const nextSelection = new Set(items);

     selectedItems.forEach((item) => {
          if (!nextSelection.has(item)) {
               item.classList.remove("is-selected", "is-resizing", "is-resize-ew", "is-resize-ns", "is-resize-nwse", "is-resize-nesw");
          }
     });
     items.forEach((item) => item.classList.add("is-selected"));
     selectedItems = nextSelection;
     selectedItem = preferredItem && nextSelection.has(preferredItem) ? preferredItem : items.at(-1) || null;
}

function groupItems(items, preferredItem = null) {
     if (items.length < 2) {
          return false;
     }

     const groupId = `group-${nextGroupId}`;
     nextGroupId += 1;
     items.forEach((item) => {
          item.dataset.groupId = groupId;
          setResizeCursor(item, "");
     });
     syncSelectionToActionItems(items, preferredItem);
     notifyTemplateChanged();
     return true;
}

function ungroupItems(items) {
     const groupIds = new Set(items.map((item) => item.dataset.groupId).filter(Boolean));

     if (!groupIds.size) {
          return false;
     }

     getPlannerItems().forEach((item) => {
          if (groupIds.has(item.dataset.groupId)) {
               delete item.dataset.groupId;
          }
     });
     syncSelectionToActionItems(items.filter((item) => getPlannerItems().includes(item)), selectedItem);
     notifyTemplateChanged();
     return true;
}

function itemsHaveGroup(items) {
     return items.some((item) => item.dataset.groupId);
}

function updateGroupButton(button, items = Array.from(selectedItems)) {
     const isGrouped = itemsHaveGroup(items);

     button.classList.toggle("is-grouped", isGrouped);
     button.textContent = isGrouped ? "Ungroup" : "Group";
     button.setAttribute("aria-label", isGrouped ? "Ungroup selected sticky notes" : "Group selected sticky notes");
}

// NOTE: Bring Forward, Send Back, Group, And Shared Actions
function getActionItems(item) {
     const controlsActionItems = getControlsActionItems(getItemControls(item));

     if (controlsActionItems.length) {
          return controlsActionItems;
     }

     return getSelectedOrGroupedActionItems(item);
}

function moveActionItemsLayer(item, direction) {
     const actionItems = getActionItems(item);
     const actionSet = new Set(actionItems);
     const plannerItems = getPlannerItems();
     const orderedActionItems = plannerItems.filter((plannerItem) => actionSet.has(plannerItem));

     if (!orderedActionItems.length) {
          return;
     }

     const firstIndex = plannerItems.indexOf(orderedActionItems[0]);
     const lastIndex = plannerItems.indexOf(orderedActionItems.at(-1));

     if (direction === "forward") {
          const nextItem = plannerItems.slice(lastIndex + 1).find((plannerItem) => !actionSet.has(plannerItem));

          if (!nextItem) {
               return;
          }

          nextItem.after(...orderedActionItems);
     } else {
          const previousItem = plannerItems.slice(0, firstIndex).reverse().find((plannerItem) => !actionSet.has(plannerItem));

          if (!previousItem) {
               return;
          }

          previousItem.before(...orderedActionItems);
     }

     notifyTemplateChanged();
}

function applyStyleToActionItems(item, style) {
     getActionItems(item).forEach((targetItem) => setItemStyle(targetItem, style));
     notifyTemplateChanged();
}

function applyTextSettingsToActionItems(item, settings) {
     getActionItems(item).forEach((targetItem) => {
          if (isCalendarTextItem(targetItem)) {
               setCalendarDayTextSettings(targetItem, settings);
          } else {
               setStickyTextSettings(targetItem, settings);
          }
     });
     notifyTemplateChanged();
}

function applyMiniMonthSettingsToActionItems(item, settings) {
     getActionItems(item).forEach((targetItem) => {
          if (isCalendarItem(targetItem)) {
               setMiniMonthSettings(targetItem, settings);
          }
     });
     notifyTemplateChanged();
}

function setItemControlsTab(controls, tabName) {
     closeCustomSelects(controls);
     clearSelectFocus(controls);

     controls.querySelectorAll("[data-item-control-tab]").forEach((tab) => {
          const isActive = tab.dataset.itemControlTab === tabName;

          tab.classList.toggle("is-active", isActive);
          tab.setAttribute("aria-selected", String(isActive));
     });
     controls.querySelectorAll("[data-item-control-panel]").forEach((panel) => {
          panel.hidden = panel.dataset.itemControlPanel !== tabName;
     });
}

// NOTE: Drag Items, Resize Items, And Move The Bottom Menu
function markGridState(item, isOnGrid, page = null) {
     item.classList.toggle("is-on-grid", isOnGrid);
     if (isOnGrid && page) {
          item.dataset.pageId = getPageId(page);
          setItemSpreadIndex(item);
          item.classList.remove("is-spread-hidden");
     } else if (!isOnGrid) {
          delete item.dataset.pageId;
          delete item.dataset.spreadIndex;
          item.classList.remove("is-spread-hidden");
     }
}

function markSnapReady(item, isSnapReady) {
     item.classList.toggle("is-snap-ready", isSnapReady);
}

function getResizeMode(item, event) {
     if (item !== selectedItem) {
          return "";
     }

     if (selectedItems.size !== 1) {
          return "";
     }

     if (item.dataset.groupId) {
          return "";
     }

     if (item.dataset.itemType === "perpetual-calendar" && event.target.closest(".perpetual-calendar-title")) {
          return "";
     }

     const rect = item.getBoundingClientRect();
     const isLeftEdge = event.clientX >= rect.left - resizeEdgeSize && event.clientX <= rect.left + resizeEdgeSize;
     const isRightEdge = event.clientX >= rect.right - resizeEdgeSize && event.clientX <= rect.right + resizeEdgeSize;
     const isTopEdge = event.clientY >= rect.top - resizeEdgeSize && event.clientY <= rect.top + resizeEdgeSize;
     const isBottomEdge = event.clientY >= rect.bottom - resizeEdgeSize && event.clientY <= rect.bottom + resizeEdgeSize;

     if (isLeftEdge && isTopEdge) {
          return "top-left";
     }

     if (isRightEdge && isTopEdge) {
          return "top-right";
     }

     if (isLeftEdge && isBottomEdge) {
          return "bottom-left";
     }

     if (isRightEdge && isBottomEdge) {
          return "bottom-right";
     }

     if (isLeftEdge) {
          return "left";
     }

     if (isRightEdge) {
          return "right";
     }

     if (isTopEdge) {
          return "top";
     }

     if (isBottomEdge) {
          return "bottom";
     }

     return "";
}

function getMovedBox(item, page, clientX, clientY, offsetX, offsetY, shouldClamp = true) {
     const pageRect = page.getBoundingClientRect();
     const viewZoom = getViewZoom();
     const grid = getGridSize(page);
     const origin = getGridSnapOrigin(page);
     const current = getItemBox(item);
     const rawX = (clientX - pageRect.left - offsetX) / viewZoom;
     const rawY = (clientY - pageRect.top - offsetY) / viewZoom;
     const nextX = shouldClamp ? snapToGridOrigin(rawX, origin.x, grid.x) : rawX;
     const nextY = shouldClamp ? snapToGridOrigin(rawY, origin.y, grid.y) : rawY;
     const minX = grid.x * pageStickDepth - current.width;
     const minY = grid.y * pageStickDepth - current.height;
     const maxX = (pageRect.width / viewZoom) - grid.x * pageStickDepth;
     const maxY = (pageRect.height / viewZoom) - grid.y * pageStickDepth;

     return {
          ...current,
          x: shouldClamp ? clamp(nextX, minX, maxX) : nextX,
          y: shouldClamp ? clamp(nextY, minY, maxY) : nextY
     };
}

function getResizedPerpetualCalendarBox(item, page, clientX, current, mode, grid, origin, pageRect, viewZoom) {
     const resizeLeft = mode.includes("left");
     const resizeRight = mode.includes("right");
     const minWidth = grid.x * getPerpetualCalendarMinGridColumns();
     const fixedHeight = grid.y * getPerpetualCalendarMaxGridRows();
     const right = current.x + current.width;
     const pointerX = snapToGridOrigin((clientX - pageRect.left) / viewZoom, origin.x, grid.x);
     let nextX = current.x;
     let nextWidth = current.width;

     if (resizeLeft) {
          nextX = clamp(pointerX, grid.x * pageStickDepth - current.width, right - minWidth);
          nextWidth = right - nextX;
     } else if (resizeRight) {
          const nextRight = clamp(pointerX, current.x + minWidth, (pageRect.width / viewZoom) - grid.x * pageStickDepth + current.width);

          nextWidth = nextRight - current.x;
     }

     nextWidth = Math.max(minWidth, Math.round(nextWidth / grid.x) * grid.x);

     return clampPerpetualCalendarBox(item, page, {
          ...current,
          x: resizeLeft ? right - nextWidth : nextX,
          width: nextWidth,
          height: fixedHeight
     });
}

function getResizedBox(item, page, clientX, clientY, mode) {
     const current = getItemBox(item);
     const resizeLeft = mode.includes("left");
     const resizeRight = mode.includes("right");
     const resizeTop = mode.includes("top");
     const resizeBottom = mode.includes("bottom");

     if (!page) {
          const parentRect = item.parentElement.getBoundingClientRect();
          const minSize = 24;
          const right = current.x + current.width;
          const bottom = current.y + current.height;
          const pointerX = clientX - parentRect.left;
          const pointerY = clientY - parentRect.top;
          const nextLeft = resizeLeft ? Math.min(pointerX, right - minSize) : current.x;
          const nextTop = resizeTop ? Math.min(pointerY, bottom - minSize) : current.y;
          const nextRight = resizeRight ? Math.max(pointerX, current.x + minSize) : right;
          const nextBottom = resizeBottom ? Math.max(pointerY, current.y + minSize) : bottom;

          return {
               ...current,
               x: nextLeft,
               y: nextTop,
               width: nextRight - nextLeft,
               height: nextBottom - nextTop
          };
     }

     const pageRect = page.getBoundingClientRect();
     const viewZoom = getViewZoom();
     const grid = getGridSize(page);
     const origin = getGridSnapOrigin(page);
     if (item.dataset.itemType === "perpetual-calendar") {
          return getResizedPerpetualCalendarBox(item, page, clientX, current, mode, grid, origin, pageRect, viewZoom);
     }

     const minGridWidth = isTocItem(item) ? getTocMinGridColumns() : (item.dataset.itemType === "perpetual-calendar" ? getPerpetualCalendarMinGridColumns() : (item.dataset.itemType === "mini-year" ? 24 : (isFullPageCalendarType(item.dataset.itemType) ? 16 : 2)));
     const minGridHeight = item.dataset.itemType === "perpetual-calendar" ? getPerpetualCalendarMaxGridRows() : (item.dataset.itemType === "mini-year" ? 32 : (isFullPageCalendarType(item.dataset.itemType) ? 14 : 2));
     const minWidth = grid.x * minGridWidth;
     const minHeight = grid.y * minGridHeight;
     const maxHeight = item.dataset.itemType === "perpetual-calendar" ? grid.y * getPerpetualCalendarMaxGridRows() : Infinity;
     const right = current.x + current.width;
     const bottom = current.y + current.height;
     const pointerX = snapToGridOrigin((clientX - pageRect.left) / viewZoom, origin.x, grid.x);
     const pointerY = snapToGridOrigin((clientY - pageRect.top) / viewZoom, origin.y, grid.y);
     const nextLeft = resizeLeft ? clamp(pointerX, grid.x * pageStickDepth - current.width, right - minWidth) : current.x;
     const nextTop = resizeTop ? clamp(pointerY, Math.max(grid.y * pageStickDepth - current.height, bottom - maxHeight), bottom - minHeight) : current.y;
     const nextRight = resizeRight ? clamp(pointerX, current.x + minWidth, (pageRect.width / viewZoom) - grid.x * pageStickDepth + current.width) : right;
     const nextBottom = resizeBottom ? clamp(pointerY, current.y + minHeight, Math.min((pageRect.height / viewZoom) - grid.y * pageStickDepth + current.height, current.y + maxHeight)) : bottom;

     return {
          ...current,
          x: nextLeft,
          y: nextTop,
          width: nextRight - nextLeft,
          height: nextBottom - nextTop
     };
}

function getResizeClass(resizeMode) {
     if (resizeMode === "left" || resizeMode === "right") {
          return "is-resize-ew";
     }

     if (resizeMode === "top" || resizeMode === "bottom") {
          return "is-resize-ns";
     }

     if (resizeMode === "top-left" || resizeMode === "bottom-right") {
          return "is-resize-nwse";
     }

     if (resizeMode === "top-right" || resizeMode === "bottom-left") {
          return "is-resize-nesw";
     }

     return "";
}

function getResizeCursorValue(resizeMode) {
     if (resizeMode === "left" || resizeMode === "right") {
          return "ew-resize";
     }

     if (resizeMode === "top" || resizeMode === "bottom") {
          return "ns-resize";
     }

     if (resizeMode === "top-left" || resizeMode === "bottom-right") {
          return "nwse-resize";
     }

     if (resizeMode === "top-right" || resizeMode === "bottom-left") {
          return "nesw-resize";
     }

     return "";
}

function setResizeCursor(item, resizeMode) {
     item.classList.remove("is-resize-ew", "is-resize-ns", "is-resize-nwse", "is-resize-nesw");

     const resizeClass = getResizeClass(resizeMode);

     if (resizeClass) {
          item.classList.add(resizeClass);
     }
}

function clearSelectedResizeCursors() {
     selectedItems.forEach((item) => setResizeCursor(item, ""));
}

function updateDeskResizeCursor(event) {
     if (activeAction || !selectedItem || selectedItems.size !== 1 || event.target.closest(".planner-settings, .item-controls, .page-snap-controls")) {
          plannerDesk.style.cursor = "";
          clearSelectedResizeCursors();
          return;
     }

     const resizeMode = getResizeMode(selectedItem, event);

     setResizeCursor(selectedItem, resizeMode);
     plannerDesk.style.cursor = getResizeCursorValue(resizeMode);
}

function getSidebarBox() {
     const deskRect = plannerDesk.getBoundingClientRect();
     const rect = plannerSettings.getBoundingClientRect();
     const width = rect.width;
     const height = Number(plannerSettings.dataset.height) || rect.height;
     const centerX = Number(plannerSettings.dataset.centerX) || getSidebarCenter(width);

     return {
          x: centerX - width / 2,
          y: deskRect.height - height,
          centerX,
          width,
          height
     };
}

function setSidebarBox(box) {
     plannerSettings.dataset.height = String(box.height);
     plannerSettings.dataset.centerX = String(box.centerX);
     plannerSettings.style.left = `${box.centerX}px`;
     plannerSettings.style.height = `${box.height}px`;
}

function getMovedSidebarBox(clientX, clientY) {
     const deskRect = plannerDesk.getBoundingClientRect();
     const current = activeAction.box;
     const rawX = clientX - deskRect.left - activeAction.offsetX;
     const minX = 12;
     const maxX = deskRect.width - current.width - 12;
     const x = clamp(rawX, minX, maxX);

     return {
          ...current,
          x,
          centerX: x + current.width / 2
     };
}

function getSidebarVerticalResizeMode(event) {
     const rect = plannerSettings.getBoundingClientRect();
     const isTopEdge = event.clientY >= rect.top - resizeEdgeSize && event.clientY <= rect.top + resizeEdgeSize;

     if (isTopEdge) {
          return "top";
     }

     return "";
}

function getSidebarHeightBounds() {
     const pageRect = pages[0].getBoundingClientRect();
     const notebookRect = notebook.getBoundingClientRect();
     const deskRect = plannerDesk.getBoundingClientRect();
     const measuredHeight = Math.max(pageRect.height, notebookRect.height);
     const fullHeight = measuredHeight > 220 ? measuredHeight : deskRect.height * 0.68;
     const gridRowHeight = Math.max(fullHeight / plannerConfig.gridRows, 8);
     const maxHeight = Math.max(300, Math.min(fullHeight, deskRect.height * 0.78));

     return {
          min: Math.min(300, maxHeight),
          max: maxHeight,
          grid: gridRowHeight
     };
}

function getResizedSidebarBox(clientY) {
     const deskRect = plannerDesk.getBoundingClientRect();
     const current = activeAction.box;
     const bounds = getSidebarHeightBounds();
     const bottom = deskRect.height;
     const pointerY = snap(clientY - deskRect.top, bounds.grid);

     const nextTop = clamp(pointerY, bottom - bounds.max, bottom - bounds.min);

     return {
          ...current,
          y: nextTop,
          height: bottom - nextTop
     };
}

function startSidebarResize(event, mode) {
     const box = getSidebarBox();

     event.preventDefault();
     setSidebarBox(box);
     activeAction = {
          type: "sidebar-resize",
          box,
          mode
     };
     plannerSettings.classList.add("is-resizing");

     try {
          plannerSettings.setPointerCapture(event.pointerId);
     } catch {
     }
}

function updateItemSizeLabel(item) {
     const label = item.querySelector(".item-size-label");

     if (!label) {
          return;
     }

     const page = getItemPage(item);
     const box = getItemBox(item);
     const width = page ? Math.round(box.width / getGridSize(page).x) : Math.round(box.width);
     const height = page ? Math.round(box.height / getGridSize(page).y) : Math.round(box.height);

     label.textContent = `${width} x ${height}`;
}

// NOTE: Build New Items And Their Settings Controls
function makePlannerItem(type = "sticky") {
     const hasWidgetControls = type === "sticky" || isCalendarItemType(type);
     const item = document.createElement("div");
     const sizeLabel = document.createElement("span");
     const controls = document.createElement("div");
     const controlTabs = document.createElement("div");
     const actionsTab = document.createElement("button");
     const styleTab = document.createElement("button");
     const textTab = document.createElement("button");
     const widgetTab = document.createElement("button");
     const actionsPanel = document.createElement("div");
     const actionsWidgetType = document.createElement("div");
     const stylePanel = document.createElement("div");
     const textPanel = document.createElement("div");
     const widgetPanel = document.createElement("div");
     const dateWidgetGroup = document.createElement("div");
     const dateWidgetTitle = document.createElement("div");
     const calendarAttributesGrid = document.createElement("div");
     const timeWidgetGroup = document.createElement("div");
     const timeWidgetTitle = document.createElement("div");
     const duplicateButton = document.createElement("button");
     const copyButton = document.createElement("button");
     const pasteButton = document.createElement("button");
     const groupButton = document.createElement("button");
     const layerButtonGroup = document.createElement("div");
     const bringForwardButton = document.createElement("button");
     const sendBackwardButton = document.createElement("button");
     const fillLabel = document.createElement("label");
     const fillTitle = document.createElement("span");
     const fillInput = document.createElement("select");
     const fillSwatches = document.createElement("div");
     const borderColorLabel = document.createElement("label");
     const borderTitle = document.createElement("span");
     const borderSizeField = document.createElement("span");
     const borderColorInput = document.createElement("select");
     const borderColorSwatches = document.createElement("div");
     const borderWidthSelect = document.createElement("select");
     const dotGridLabel = document.createElement("label");
     const dotGridInput = document.createElement("input");
     const textElement = document.createElement("div");
     const tocElement = document.createElement("div");
     const textToggleLabel = document.createElement("label");
     const textTitle = document.createElement("span");
     const textToggleInput = document.createElement("input");
     const textSizeInput = document.createElement("input");
     const textFontSelect = document.createElement("select");
     const textColorLabel = document.createElement("label");
     const textColorTitle = document.createElement("span");
     const textColorInput = document.createElement("select");
     const textColorSwatches = document.createElement("div");
     const textFormatGroup = document.createElement("div");
     const textBoldLabel = document.createElement("label");
     const textBoldInput = document.createElement("input");
     const textItalicLabel = document.createElement("label");
     const textItalicInput = document.createElement("input");
     const textUnderlineLabel = document.createElement("label");
     const textUnderlineInput = document.createElement("input");
     const textAlignLabel = document.createElement("label");
     const textAlignSelect = document.createElement("select");
     const textLineHeightLabel = document.createElement("label");
     const textLineHeightSelect = document.createElement("select");
     const weekNumberLabel = document.createElement("label");
     const weekNumberSelect = document.createElement("select");
     const weekStartLabel = document.createElement("label");
     const weekStartSelect = document.createElement("select");
     const monthLabel = document.createElement("label");
     const monthSelect = document.createElement("select");
     const monthDisplayLabel = document.createElement("label");
     const monthDisplaySelect = document.createElement("select");
     const yearLabel = document.createElement("label");
     const yearSelect = document.createElement("select");
     const yearDisplayLabel = document.createElement("label");
     const yearDisplaySelect = document.createElement("select");
     const startDayLabel = document.createElement("label");
     const startDaySelect = document.createElement("select");
     const visibleDaysLabel = document.createElement("label");
     const visibleDaysSelect = document.createElement("select");
     const timeIncrementLabel = document.createElement("label");
     const timeIncrementSelect = document.createElement("select");
     const startTimeLabel = document.createElement("label");
     const startTimeSelect = document.createElement("select");
     const timeVisibleInput = document.createElement("input");
     const timeFormatLabel = document.createElement("label");
     const timeFormatSelect = document.createElement("select");
     const shareWeekendsLabel = document.createElement("label");
     const shareWeekendsInput = document.createElement("input");
     const deleteButton = document.createElement("button");

     item.className = `planner-item planner-item-${type}`;
     item.dataset.itemType = type;
     item.dataset.templateId = `${type}-${nextTemplateItemId}`;
     nextTemplateItemId += 1;
     item.tabIndex = 0;
     item.setAttribute("role", "button");
     item.setAttribute("aria-label", getItemAriaLabel(type));

     sizeLabel.className = "item-size-label";
     sizeLabel.setAttribute("aria-hidden", "true");
     controls.className = `item-controls item-controls-${type}`;
     controls.dataset.ownerId = item.dataset.templateId;
     controls.setAttribute("role", "menu");
     controlTabs.className = "item-control-tabs";
     controlTabs.setAttribute("role", "tablist");
     actionsTab.className = "item-control-tab";
     actionsTab.type = "button";
     actionsTab.textContent = "Actions";
     actionsTab.dataset.itemControlTab = "actions";
     actionsTab.setAttribute("role", "tab");
     styleTab.className = "item-control-tab";
     styleTab.type = "button";
     styleTab.textContent = "Appearance";
     styleTab.dataset.itemControlTab = "style";
     styleTab.setAttribute("role", "tab");
     textTab.className = "item-control-tab";
     textTab.type = "button";
     textTab.textContent = "Text";
     textTab.dataset.itemControlTab = "text";
     textTab.setAttribute("role", "tab");
     widgetTab.className = "item-control-tab";
     widgetTab.type = "button";
     widgetTab.textContent = "Attributes";
     widgetTab.dataset.itemControlTab = "widget";
     widgetTab.setAttribute("role", "tab");
     actionsPanel.className = "item-control-panel";
     actionsPanel.dataset.itemControlPanel = "actions";
     actionsPanel.setAttribute("role", "tabpanel");
     actionsWidgetType.className = "item-actions-widget-type";
     actionsWidgetType.dataset.actionsWidgetType = "true";
     actionsWidgetType.textContent = getItemTypeLabel(type);
     stylePanel.className = "item-control-panel";
     stylePanel.dataset.itemControlPanel = "style";
     stylePanel.setAttribute("role", "tabpanel");
     textPanel.className = "item-control-panel";
     textPanel.dataset.itemControlPanel = "text";
     textPanel.setAttribute("role", "tabpanel");
     widgetPanel.className = "item-control-panel item-widget-panel";
     widgetPanel.dataset.itemControlPanel = "widget";
     widgetPanel.setAttribute("role", "tabpanel");
     dateWidgetGroup.className = "item-widget-group item-widget-date-group";
     dateWidgetTitle.className = "item-widget-group-title";
     dateWidgetTitle.textContent = "Day";
     calendarAttributesGrid.className = "item-calendar-attributes-grid";
     timeWidgetGroup.className = "item-widget-group item-widget-time-group";
     timeWidgetTitle.className = "item-widget-group-title";
     timeWidgetTitle.textContent = "Time";
     duplicateButton.className = "item-control";
     duplicateButton.type = "button";
     duplicateButton.textContent = "Duplicate";
     duplicateButton.setAttribute("aria-label", "Duplicate sticky note");
     copyButton.className = "item-control";
     copyButton.type = "button";
     copyButton.textContent = "Copy";
     copyButton.dataset.clipboardAction = "copy";
     copyButton.setAttribute("aria-label", "Copy selected planner items");
     pasteButton.className = "item-control";
     pasteButton.type = "button";
     pasteButton.textContent = "Paste";
     pasteButton.dataset.clipboardAction = "paste";
     pasteButton.setAttribute("aria-label", "Paste copied planner items");
     pasteButton.disabled = !plannerClipboard;
     groupButton.className = "item-control";
     groupButton.type = "button";
     groupButton.textContent = "Group";
     groupButton.setAttribute("aria-label", "Group selected sticky notes");
     layerButtonGroup.className = "item-layer-actions";
     bringForwardButton.className = "item-control";
     bringForwardButton.type = "button";
     bringForwardButton.textContent = "Bring Fwd";
     bringForwardButton.setAttribute("aria-label", "Bring selected item forward");
     sendBackwardButton.className = "item-control";
     sendBackwardButton.type = "button";
     sendBackwardButton.textContent = "Send Bwd";
     sendBackwardButton.setAttribute("aria-label", "Send selected item backward");
     fillLabel.className = "item-control-row item-color-control";
     fillTitle.className = "item-control-title";
     fillTitle.textContent = "Fill";
     fillInput.className = "native-select";
     fillInput.dataset.styleControl = "fill";
     fillInput.setAttribute("aria-label", "Sticky note fill palette");
     fillSwatches.className = "item-color-swatches";
     fillSwatches.dataset.styleSwatches = "fill";
     borderColorLabel.className = "item-control-row item-color-control";
     borderTitle.className = "item-control-title";
     borderTitle.textContent = "Border";
     borderSizeField.className = "item-control-row";
     borderSizeField.textContent = "Size";
     borderColorInput.className = "native-select";
     borderColorInput.dataset.styleControl = "border-color";
     borderColorInput.setAttribute("aria-label", "Sticky note border palette");
     borderColorSwatches.className = "item-color-swatches";
     borderColorSwatches.dataset.styleSwatches = "border-color";
     borderWidthSelect.setAttribute("aria-label", "Sticky note border thickness");
     borderWidthSelect.dataset.styleControl = "border-width";
     ["1", "2", "3", "4", "5"].forEach((value) => {
          const option = document.createElement("option");

          option.value = value;
          option.textContent = `${value}px`;
          borderWidthSelect.append(option);
     });
     dotGridLabel.className = "item-control-row";
     dotGridLabel.textContent = "Dot grid";
     dotGridInput.type = "checkbox";
     dotGridInput.dataset.styleControl = "dot-grid";
     dotGridInput.setAttribute("aria-label", "Show sticky note dot grid");
     textElement.className = "sticky-text";
     textElement.hidden = true;
     textElement.spellcheck = true;
     textElement.setAttribute("contenteditable", "false");
     textElement.setAttribute("aria-label", "Sticky note text");
     tocElement.className = "toc-widget";
     textToggleLabel.className = "item-control-row item-text-control item-text-settings-control";
     textTitle.className = "item-control-title";
     textTitle.textContent = "Text";
     textToggleInput.type = "checkbox";
     textToggleInput.dataset.textControl = "enabled";
     textToggleInput.setAttribute("aria-label", "Show sticky note text");
     textSizeInput.type = "number";
     textSizeInput.min = "8";
     textSizeInput.max = "48";
     textSizeInput.step = "1";
     textSizeInput.value = "10";
     textSizeInput.dataset.textControl = "size";
     textSizeInput.setAttribute("aria-label", "Sticky note text size");
     textFontSelect.dataset.textControl = "font";
     textFontSelect.setAttribute("aria-label", "Sticky note text font");
     [
          ["noto", "Noto"],
          ["dancing", "Script"],
          ["sans", "Sans"],
          ["serif", "Serif"]
     ].forEach(([value, label]) => {
          const option = document.createElement("option");

          option.value = value;
          option.textContent = label;
          textFontSelect.append(option);
     });
     textColorLabel.className = "item-control-row item-text-control item-color-control";
     textColorTitle.className = "item-control-title";
     textColorTitle.textContent = "Font Palette";
     textColorInput.className = "native-select";
     textColorInput.dataset.textControl = "color";
     textColorInput.setAttribute("aria-label", "Sticky note text palette");
     textColorSwatches.className = "item-color-swatches";
     textColorSwatches.dataset.textSwatches = "color";
     textFormatGroup.className = "item-text-format item-text-control";
     textBoldLabel.className = "item-text-toggle";
     textBoldLabel.textContent = "B";
     textBoldInput.type = "checkbox";
     textBoldInput.dataset.textControl = "bold";
     textBoldInput.setAttribute("aria-label", "Bold sticky note text");
     textItalicLabel.className = "item-text-toggle";
     textItalicLabel.textContent = "I";
     textItalicInput.type = "checkbox";
     textItalicInput.dataset.textControl = "italic";
     textItalicInput.setAttribute("aria-label", "Italic sticky note text");
     textUnderlineLabel.className = "item-text-toggle";
     textUnderlineLabel.textContent = "U";
     textUnderlineInput.type = "checkbox";
     textUnderlineInput.dataset.textControl = "underline";
     textUnderlineInput.setAttribute("aria-label", "Underline sticky note text");
     textAlignLabel.className = "item-control-row item-text-control";
     textAlignLabel.textContent = "Alignment";
     textAlignSelect.dataset.textControl = "align";
     textAlignSelect.setAttribute("aria-label", "Sticky note text alignment");
     ["left", "center", "right"].forEach((value) => {
          const option = document.createElement("option");

          option.value = value;
          option.textContent = value[0].toUpperCase() + value.slice(1);
          textAlignSelect.append(option);
     });
     textLineHeightLabel.className = "item-control-row item-text-control";
     textLineHeightLabel.textContent = "Line Height";
     textLineHeightSelect.dataset.textControl = "line-height";
     textLineHeightSelect.setAttribute("aria-label", "Text line height in grid cells");
     textLineHeightCellOptions.forEach((value) => {
          const option = document.createElement("option");

          option.value = value;
          option.textContent = value;
          textLineHeightSelect.append(option);
     });
     deleteButton.className = "item-control item-control-danger";
     deleteButton.type = "button";
     deleteButton.textContent = "Delete";
     deleteButton.setAttribute("aria-label", "Delete planner item");
     weekNumberLabel.className = "item-control-row item-widget-control";
     weekNumberLabel.textContent = "Week #";
     weekNumberSelect.dataset.widgetControl = "week-number-format";
     weekNumberSelect.setAttribute("aria-label", "Week number column formatting");
     [
          ["off", "Off"],
          ["outlines", "Outlines"],
          ["no-outlines", "No Outlines"]
     ].forEach(([value, label]) => {
          const option = document.createElement("option");

          option.value = value;
          option.textContent = label;
          weekNumberSelect.append(option);
     });
     weekStartLabel.className = "item-control-row item-widget-control";
     weekStartLabel.textContent = "Week Start";
     weekStartSelect.dataset.widgetControl = "week-start";
     weekStartSelect.setAttribute("aria-label", "Calendar week start");
     ["monday", "sunday"].forEach((value) => {
          const option = document.createElement("option");

          option.value = value;
          option.textContent = value[0].toUpperCase() + value.slice(1);
          weekStartSelect.append(option);
     });
     monthLabel.className = "item-control-row item-widget-control";
     monthLabel.textContent = "Month";
     monthSelect.dataset.widgetControl = "month";
     monthSelect.setAttribute("aria-label", "Calendar month");
     calendarMonthNames.forEach((monthName, index) => {
          const option = document.createElement("option");

          option.value = String(index);
          option.textContent = monthName;
          monthSelect.append(option);
     });
     monthDisplayLabel.className = "item-control-row item-widget-control";
     monthDisplayLabel.textContent = "Month Display";
     monthDisplaySelect.dataset.widgetControl = "month-display";
     monthDisplaySelect.setAttribute("aria-label", "Calendar month display");
     [
          ["number", "#"],
          ["short", "MMM"],
          ["full", "Full"]
     ].forEach(([value, label]) => {
          const option = document.createElement("option");

          option.value = value;
          option.textContent = label;
          monthDisplaySelect.append(option);
     });
     yearLabel.className = "item-control-row item-widget-control";
     yearLabel.textContent = "Year";
     yearSelect.dataset.widgetControl = "year";
     yearSelect.setAttribute("aria-label", "Calendar year");
     for (let year = calendarYearRange.start; year <= calendarYearRange.end; year += 1) {
          const option = document.createElement("option");

          option.value = String(year);
          option.textContent = String(year);
          yearSelect.append(option);
     }
     yearDisplayLabel.className = "item-control-row item-widget-control";
     yearDisplayLabel.textContent = "Year Display";
     yearDisplaySelect.dataset.widgetControl = "year-display";
     yearDisplaySelect.setAttribute("aria-label", "Calendar year display");
     [
          ["none", "Off"],
          ["short", "YY"],
          ["full", "YYYY"]
     ].forEach(([value, label]) => {
          const option = document.createElement("option");

          option.value = value;
          option.textContent = label;
          yearDisplaySelect.append(option);
     });
     startDayLabel.className = "item-control-row item-widget-control";
     startDayLabel.textContent = "Day";
     startDaySelect.dataset.widgetControl = "start-day";
     startDaySelect.setAttribute("aria-label", "Weekly planner start day");
     visibleDaysLabel.className = "item-control-row item-widget-control";
     visibleDaysLabel.textContent = "Duration";
     visibleDaysSelect.dataset.widgetControl = "visible-days";
     visibleDaysSelect.setAttribute("aria-label", "Weekly planner visible days");
     for (let dayCount = 1; dayCount <= 7; dayCount += 1) {
          const option = document.createElement("option");

          option.value = String(dayCount);
          option.textContent = `${dayCount} ${dayCount === 1 ? "day" : "days"}`;
          visibleDaysSelect.append(option);
     }
     timeIncrementLabel.className = "item-control-row item-widget-control";
     timeIncrementLabel.textContent = "Increments";
     timeIncrementSelect.dataset.widgetControl = "time-increment";
     timeIncrementSelect.setAttribute("aria-label", "Weekly planner time increment");
     [
          ["15", "15m"],
          ["30", "30m"],
          ["60", "1h"]
     ].forEach(([value, label]) => {
          const option = document.createElement("option");

          option.value = value;
          option.textContent = label;
          timeIncrementSelect.append(option);
     });
     startTimeLabel.className = "item-control-row item-widget-control";
     startTimeLabel.textContent = "Start";
     startTimeSelect.dataset.widgetControl = "start-time";
     startTimeSelect.setAttribute("aria-label", "Weekly planner start time");
     timeVisibleInput.type = "checkbox";
     timeVisibleInput.checked = true;
     timeVisibleInput.dataset.widgetControl = "time-visible";
     timeVisibleInput.setAttribute("aria-label", "Show weekly planner time column");
     timeFormatLabel.className = "item-control-row item-widget-control";
     timeFormatLabel.textContent = "Format";
     timeFormatSelect.dataset.widgetControl = "time-format";
     timeFormatSelect.setAttribute("aria-label", "Weekly planner time format");
     [
          ["24", "24hr"],
          ["compact", "8a"],
          ["ampm", "8:30 am"]
     ].forEach(([value, label]) => {
          const option = document.createElement("option");

          option.value = value;
          option.textContent = label;
          timeFormatSelect.append(option);
     });
     shareWeekendsLabel.className = "item-control-row item-widget-control";
     shareWeekendsLabel.textContent = "Share Weekends";
     shareWeekendsInput.type = "checkbox";
     shareWeekendsInput.dataset.widgetControl = "share-weekends";
     shareWeekendsInput.setAttribute("aria-label", "Share Saturday and Sunday in one column");
     for (let minute = 0; minute < 24 * 60; minute += 30) {
          const option = document.createElement("option");
          const time = formatMinutesAsTime(minute);

          option.value = time;
          option.textContent = time;
          startTimeSelect.append(option);
     }

     borderSizeField.append(borderWidthSelect);
     fillLabel.append(fillTitle, fillInput, fillSwatches);
     borderColorLabel.append(borderTitle, borderColorInput, borderColorSwatches);
     dotGridLabel.append(dotGridInput);
     if (type === "sticky") {
          textToggleLabel.append(textTitle, textToggleInput, textSizeInput, textFontSelect);
     } else {
          textToggleLabel.classList.add("item-text-settings-control-no-toggle");
          textToggleLabel.append(textTitle, textSizeInput, textFontSelect);
     }
     textColorLabel.append(textColorTitle, textColorInput, textColorSwatches);
     textBoldLabel.append(textBoldInput);
     textItalicLabel.append(textItalicInput);
     textUnderlineLabel.append(textUnderlineInput);
     textFormatGroup.append(textBoldLabel, textItalicLabel, textUnderlineLabel);
     textAlignLabel.append(textAlignSelect);
     textLineHeightLabel.append(textLineHeightSelect);
     monthLabel.append(monthSelect);
     monthDisplayLabel.append(monthDisplaySelect);
     yearLabel.append(yearSelect);
     yearDisplayLabel.append(yearDisplaySelect);
     weekStartLabel.append(weekStartSelect);
     weekNumberLabel.append(weekNumberSelect);
     if (type === "mini-year") {
          calendarAttributesGrid.append(weekStartLabel, yearLabel, weekNumberLabel, monthDisplayLabel, yearDisplayLabel);
     } else if (type === "perpetual-calendar") {
          calendarAttributesGrid.append(monthLabel, yearLabel, monthDisplayLabel, yearDisplayLabel);
     } else {
          calendarAttributesGrid.append(weekStartLabel, monthLabel, yearLabel, weekNumberLabel, monthDisplayLabel, yearDisplayLabel);
     }
     startDayLabel.append(startDaySelect);
     visibleDaysLabel.append(visibleDaysSelect);
     timeIncrementLabel.append(timeIncrementSelect);
     startTimeLabel.append(timeVisibleInput, startTimeSelect);
     timeFormatLabel.append(timeFormatSelect);
     shareWeekendsLabel.append(shareWeekendsInput);
     controlTabs.append(styleTab);
     layerButtonGroup.append(bringForwardButton, sendBackwardButton);
     actionsPanel.append(actionsWidgetType, duplicateButton, copyButton, pasteButton, groupButton, layerButtonGroup, deleteButton);
     stylePanel.append(fillLabel, borderColorLabel, borderSizeField);
     if (isStickyTextItemType(type)) {
          textPanel.append(
               textToggleLabel,
               textColorLabel,
               textFormatGroup,
               textAlignLabel,
               textLineHeightLabel
          );
     }
     if (isCalendarTextItemType(type)) {
          textPanel.append(
               textToggleLabel,
               textColorLabel,
               textFormatGroup,
               textAlignLabel,
               textLineHeightLabel
          );
     }
     if (isStickyTextItemType(type) || isCalendarTextItemType(type)) {
          controlTabs.append(textTab);
     }
     if (type === "sticky") {
          widgetPanel.append(dotGridLabel);
     }
     if (isCalendarItemType(type) && type !== "weekly-vertical") {
          widgetPanel.append(calendarAttributesGrid);
     }
     if (type === "weekly-vertical") {
          dateWidgetGroup.append(dateWidgetTitle, calendarAttributesGrid, startDayLabel);
          timeWidgetGroup.append(timeWidgetTitle, startTimeLabel, timeFormatLabel, timeIncrementLabel, visibleDaysLabel, shareWeekendsLabel);
          widgetPanel.append(dateWidgetGroup, timeWidgetGroup);
     }
     if (hasWidgetControls) {
          controlTabs.append(widgetTab);
     }
     controls.append(controlTabs, actionsPanel, stylePanel);
     if (isStickyTextItemType(type) || isCalendarTextItemType(type)) {
          controls.append(textPanel);
     }
     if (hasWidgetControls) {
          controls.append(widgetPanel);
     }
     initializePaletteColorControl(fillInput, fillSwatches, "var(--paper-offwhite)", (nextColor) => {
          applyStyleToActionItems(item, {
               fillColor: nextColor
          });
     });
     initializePaletteColorControl(borderColorInput, borderColorSwatches, "var(--color-gray4)", (nextColor) => {
          applyStyleToActionItems(item, {
               borderColor: nextColor
          });
     });
     initializePaletteColorControl(textColorInput, textColorSwatches, "var(--color-gray1)", (nextColor) => {
          applyTextSettingsToActionItems(item, {
               color: nextColor
          });
     });
     controls.querySelectorAll("select:not([data-style-control='fill']):not([data-style-control='border-color']):not([data-text-control='color'])").forEach((select) => {
          makeCustomSelect(select);
          select.addEventListener("change", () => updateCustomSelectDisplay(select));
     });
     setItemControlsTab(controls, "style");
     item.append(sizeLabel);
     if (isStickyTextItemType(type)) {
          item.append(textElement);
     }
     if (isTocItemType(type)) {
          item.append(tocElement);
     }
     item.append(controls);
     setItemStyle(item, {
          fillColor: "var(--paper-offwhite)",
          borderColor: "var(--color-gray4)",
          borderWidth: borderWidthSelect.value,
          dotGrid: "false"
     });
     setStickyTextSettings(item, isPageTitleItemType(type) ? {
          enabled: "true",
          size: "14",
          bold: "true",
          align: "center"
     } : {});
     setCalendarDayTextSettings(item);
     if (isCalendarItemType(type)) {
          setMiniMonthSettings(item);
     }
     renderToc(item);

     item.addEventListener("pointerdown", (event) => {
          if (event.target.closest(".item-controls")) {
               return;
          }

          if (event.button !== 0) {
               return;
          }

          if (isStickyTextItem(item) && event.detail > 1) {
               event.preventDefault();
               selectItem(item);
               return;
          }

          if (event.metaKey || event.ctrlKey) {
               event.preventDefault();
               selectItem(item, true);
               shouldSkipNextItemClick = true;
               return;
          }

          const resizeMode = getResizeMode(item, event);

          if (resizeMode) {
               startResize(item, event, resizeMode);
               return;
          }

          startMove(item, event);
     });
     item.addEventListener("pointermove", (event) => {
          const resizeMode = getResizeMode(item, event);

          setResizeCursor(item, resizeMode);
     });
     item.addEventListener("pointerleave", () => {
          setResizeCursor(item, "");
     });
     item.addEventListener("click", (event) => {
          if (shouldSkipNextItemClick) {
               shouldSkipNextItemClick = false;
               return;
          }

          if (event.metaKey || event.ctrlKey) {
               selectItem(item, true);
          } else if (!activeAction) {
               selectItem(item);
               openItemMenu(item);
          }
     });
     item.addEventListener("dblclick", (event) => {
          if (event.target.closest(".item-controls")) {
               return;
          }

          event.preventDefault();
          startStickyTextEditing(item);
     });
     item.addEventListener("focus", () => {
          if (!item.classList.contains("is-menu-open") && !selectedItems.has(item)) {
               selectItem(item);
          }
     });
     item.addEventListener("contextmenu", (event) => {
          event.preventDefault();
          event.stopPropagation();
          if (!selectedItems.has(item)) {
               selectItem(item);
          }
          const actionItems = getSelectedOrGroupedActionItems(item);

          closeItemMenus(item);
          updateGroupButton(groupButton, actionItems);
          openItemActionsPopup(item, event, actionItems);
     });
     controls.addEventListener("pointerdown", (event) => event.stopPropagation());
     controls.addEventListener("click", (event) => event.stopPropagation());
     controls.querySelectorAll("[data-item-control-tab]").forEach((tab) => {
          tab.addEventListener("click", () => setItemControlsTab(controls, tab.dataset.itemControlTab));
     });
     duplicateButton.addEventListener("click", (event) => {
          event.stopPropagation();
          duplicateItem(item);
     });
     copyButton.addEventListener("click", (event) => {
          event.stopPropagation();
          copyPlannerItems(getActionItems(item));
     });
     pasteButton.addEventListener("click", (event) => {
          event.stopPropagation();
          pastePlannerClipboard();
     });
     groupButton.addEventListener("click", (event) => {
          event.stopPropagation();
          const actionItems = getActionItems(item);

          if (itemsHaveGroup(actionItems)) {
               ungroupItems(actionItems);
          } else {
               groupItems(actionItems, item);
          }
          updateGroupButton(groupButton, getActionItems(item));
     });
     bringForwardButton.addEventListener("click", (event) => {
          event.stopPropagation();
          moveActionItemsLayer(item, "forward");
     });
     sendBackwardButton.addEventListener("click", (event) => {
          event.stopPropagation();
          moveActionItemsLayer(item, "backward");
     });
     borderWidthSelect.addEventListener("change", () => {
          applyStyleToActionItems(item, {
               borderWidth: borderWidthSelect.value
          });
     });
     dotGridInput.addEventListener("change", () => {
          applyStyleToActionItems(item, {
               dotGrid: dotGridInput.checked ? "true" : "false"
          });
     });
     textToggleInput.addEventListener("change", () => {
          applyTextSettingsToActionItems(item, {
               enabled: textToggleInput.checked ? "true" : "false"
          });
     });
     textSizeInput.addEventListener("input", () => {
          applyTextSettingsToActionItems(item, {
               size: textSizeInput.value
          });
     });
     textFontSelect.addEventListener("change", () => {
          applyTextSettingsToActionItems(item, {
               font: textFontSelect.value
          });
     });
     textBoldInput.addEventListener("change", () => {
          applyTextSettingsToActionItems(item, {
               bold: textBoldInput.checked ? "true" : "false"
          });
     });
     textItalicInput.addEventListener("change", () => {
          applyTextSettingsToActionItems(item, {
               italic: textItalicInput.checked ? "true" : "false"
          });
     });
     textUnderlineInput.addEventListener("change", () => {
          applyTextSettingsToActionItems(item, {
               underline: textUnderlineInput.checked ? "true" : "false"
          });
     });
     textAlignSelect.addEventListener("change", () => {
          applyTextSettingsToActionItems(item, {
               align: textAlignSelect.value
          });
     });
     textLineHeightSelect.addEventListener("change", () => {
          applyTextSettingsToActionItems(item, {
               lineHeight: textLineHeightSelect.value
          });
     });
     textElement.addEventListener("input", () => {
          updateStickyTextOverflow(item);
          if (isPageTitleItem(item)) {
               renderTocWidgets();
          }
     });
     textElement.addEventListener("blur", () => stopStickyTextEditing(item));
     textElement.addEventListener("pointerdown", (event) => {
          if (textElement.isContentEditable) {
               event.stopPropagation();
          }
     });
     textElement.addEventListener("wheel", (event) => {
          if (textElement.isContentEditable) {
               event.stopPropagation();
          }
     });
     weekNumberSelect.addEventListener("change", () => {
          applyMiniMonthSettingsToActionItems(item, {
               weekNumberFormat: weekNumberSelect.value
          });
     });
     weekStartSelect.addEventListener("change", () => {
          applyMiniMonthSettingsToActionItems(item, {
               weekStart: weekStartSelect.value
          });
     });
     monthSelect.addEventListener("change", () => {
          applyMiniMonthSettingsToActionItems(item, {
               month: monthSelect.value
          });
     });
     monthDisplaySelect.addEventListener("change", () => {
          applyMiniMonthSettingsToActionItems(item, {
               monthDisplay: monthDisplaySelect.value
          });
     });
     yearSelect.addEventListener("change", () => {
          applyMiniMonthSettingsToActionItems(item, {
               year: yearSelect.value
          });
     });
     yearDisplaySelect.addEventListener("change", () => {
          applyMiniMonthSettingsToActionItems(item, {
               yearDisplay: yearDisplaySelect.value
          });
     });
     startDaySelect.addEventListener("change", () => {
          applyMiniMonthSettingsToActionItems(item, {
               startDay: startDaySelect.value
          });
     });
     visibleDaysSelect.addEventListener("change", () => {
          applyMiniMonthSettingsToActionItems(item, {
               visibleDays: visibleDaysSelect.value
          });
     });
     timeIncrementSelect.addEventListener("change", () => {
          applyMiniMonthSettingsToActionItems(item, {
               timeIncrement: timeIncrementSelect.value
          });
     });
     startTimeSelect.addEventListener("change", () => {
          applyMiniMonthSettingsToActionItems(item, {
               startTime: startTimeSelect.value
          });
     });
     timeFormatSelect.addEventListener("change", () => {
          applyMiniMonthSettingsToActionItems(item, {
               timeFormat: timeFormatSelect.value
          });
     });
     timeVisibleInput.addEventListener("change", () => {
          applyMiniMonthSettingsToActionItems(item, {
               timeVisible: timeVisibleInput.checked ? "true" : "false"
          });
     });
     shareWeekendsInput.addEventListener("change", () => {
          applyMiniMonthSettingsToActionItems(item, {
               shareWeekends: shareWeekendsInput.checked ? "true" : "false"
          });
     });
     deleteButton.addEventListener("click", (event) => {
          event.stopPropagation();
          deleteItem(item);
     });

     return item;
}

// NOTE: Copy, Paste, Duplicate, And Delete Items
function copyItemConfiguration(source, target) {
     setItemStyle(target, {
          fillColor: source.dataset.fillColor,
          borderColor: source.dataset.borderColor,
          borderWidth: source.dataset.borderWidth,
          dotGrid: source.dataset.dotGrid
     });
     setStickyTextSettings(target, {
          enabled: source.dataset.textEnabled,
          content: getStickyTextElement(source) ? getStickyTextElement(source).textContent : "",
          size: source.dataset.textSize,
          font: source.dataset.textFont,
          color: source.dataset.textColor,
          bold: source.dataset.textBold,
          italic: source.dataset.textItalic,
          underline: source.dataset.textUnderline,
          align: source.dataset.textAlign,
          lineHeight: source.dataset.textLineHeight
     });
     if (isCalendarItem(source)) {
          setMiniMonthSettings(target, {
               weekNumbers: source.dataset.weekNumbers,
               weekNumberFormat: source.dataset.weekNumberFormat,
               weekStart: source.dataset.weekStart,
               monthDisplay: source.dataset.monthDisplay,
               monthVisible: source.dataset.monthVisible,
               month: source.dataset.month,
               yearDisplay: source.dataset.yearDisplay,
               yearVisible: source.dataset.yearVisible,
               year: source.dataset.year,
               startDay: source.dataset.startDay,
               visibleDays: source.dataset.visibleDays,
               timeIncrement: source.dataset.timeIncrement,
               startTime: source.dataset.startTime,
               timeFormat: source.dataset.timeFormat,
               timeVisible: source.dataset.timeVisible,
               shareWeekends: source.dataset.shareWeekends
          });
          if (isCalendarTextItem(source)) {
               target.dataset.dayNotes = source.dataset.dayNotes || "{}";
               setCalendarDayTextSettings(target, {
                    size: source.dataset.dayTextSize,
                    font: source.dataset.dayTextFont,
                    color: source.dataset.dayTextColor,
                    bold: source.dataset.dayTextBold,
                    italic: source.dataset.dayTextItalic,
                    underline: source.dataset.dayTextUnderline,
                    align: source.dataset.dayTextAlign,
                    lineHeight: source.dataset.dayTextLineHeight
               });
          }
          renderMiniMonth(target);
     }
}

function advanceDuplicatedCalendarView(source, target) {
     if (!isCalendarItem(source) || !isCalendarItem(target)) {
          return;
     }

     if (source.dataset.itemType === "mini-year") {
          const year = Number(source.dataset.year) || new Date().getFullYear();

          setMiniMonthSettings(target, {
               year: String(year + 1)
          });
          return;
     }

     if (source.dataset.itemType === "weekly-vertical") {
          const visibleDays = clamp(Number(source.dataset.visibleDays) || 7, 1, 7);
          const nextStartDate = getWeeklyViewStartDate(source);

          nextStartDate.setDate(nextStartDate.getDate() + visibleDays);
          setMiniMonthSettings(target, {
               month: String(nextStartDate.getMonth()),
               year: String(nextStartDate.getFullYear()),
               startDay: String(nextStartDate.getDate())
          });
          return;
     }

     const month = Number(source.dataset.month) || 0;
     const year = Number(source.dataset.year) || new Date().getFullYear();
     const nextMonthDate = new Date(year, month + 1, 1);

     setMiniMonthSettings(target, {
          month: String(nextMonthDate.getMonth()),
          year: String(nextMonthDate.getFullYear())
     });
}

function getOrderedPlannerItems(items) {
     const itemSet = new Set(items);

     return getAllPlannerItems().filter((item) => itemSet.has(item));
}

function copyPlannerItems(items = Array.from(selectedItems)) {
     const orderedItems = getOrderedPlannerItems(items);

     if (!orderedItems.length) {
          return false;
     }

     plannerClipboard = {
          pasteCount: 0,
          items: orderedItems.map((item) => {
               const pageNumber = item.dataset.pageId ? getItemPageNumber(item) : null;

               return {
                    data: serializePlannerItem(item),
                    box: getItemBox(item),
                    groupId: item.dataset.groupId || "",
                    sourcePageId: item.dataset.pageId || "",
                    sourcePageNumber: Number.isFinite(pageNumber) ? pageNumber : null
               };
          })
     };
     updateClipboardControls();
     return true;
}

function getClipboardTargetPage(entry) {
     const preferredSide = entry.sourcePageId || getFocusedPageSide();
     const preferredPage = pages.find((page) => getPageId(page) === preferredSide) || null;

     if (preferredPage && isPageNumberAvailable(getPageNumberForPage(preferredPage))) {
          return preferredPage;
     }

     const focusedSide = getFocusedPageSide();
     const focusedPage = pages.find((page) => getPageId(page) === focusedSide) || null;

     if (focusedPage && isPageNumberAvailable(getPageNumberForPage(focusedPage))) {
          return focusedPage;
     }

     return pages.find((page) => isPageNumberAvailable(getPageNumberForPage(page))) || null;
}

function getClipboardPasteBox(entry, page) {
     const box = entry.box;

     if (!page) {
          const offset = 16 * Math.max(1, plannerClipboard.pasteCount + 1);

          return {
               ...box,
               x: box.x + offset,
               y: box.y + offset
          };
     }

     const grid = getGridSize(page);
     const targetPageNumber = getPageNumberForPage(page);
     const isOriginalPage = targetPageNumber === entry.sourcePageNumber;
     const offset = grid.x * (isOriginalPage ? plannerClipboard.pasteCount + 1 : plannerClipboard.pasteCount);

     return {
          ...box,
          x: clamp(box.x + offset, 0, page.clientWidth - box.width),
          y: clamp(box.y + offset, 0, page.clientHeight - box.height)
     };
}

function pasteClipboardItem(entry, copiedGroupIds) {
     const type = normalizePlannerItemType(entry.data.type || "sticky");

     if (!itemGridUnits[type]) {
          return null;
     }

     const duplicate = makePlannerItem(type);
     const itemData = {
          ...entry.data,
          groupId: null
     };

     plannerDesk.append(duplicate);
     restorePlannerItemSettings(duplicate, itemData);
     delete duplicate.dataset.groupId;

     if (entry.data.placement === "page" || entry.sourcePageId) {
          const page = getClipboardTargetPage(entry);

          if (!page || (isPageTitleItem(duplicate) && !canPlaceItemOnPage(duplicate, page))) {
               duplicate.remove();
               return null;
          }

          markGridState(duplicate, true, page);
          setItemBox(duplicate, getClipboardPasteBox(entry, page));
     } else {
          markGridState(duplicate, false);
          setItemBox(duplicate, getClipboardPasteBox(entry, null));
     }

     if (entry.groupId) {
          if (!copiedGroupIds.has(entry.groupId)) {
               copiedGroupIds.set(entry.groupId, `group-${nextGroupId}`);
               nextGroupId += 1;
          }

          duplicate.dataset.groupId = copiedGroupIds.get(entry.groupId);
     }

     return duplicate;
}

function pastePlannerClipboard() {
     if (!plannerClipboard?.items?.length) {
          return false;
     }

     const pastedItems = [];
     const copiedGroupIds = new Map();

     plannerClipboard.items.forEach((entry) => {
          const pastedItem = pasteClipboardItem(entry, copiedGroupIds);

          if (pastedItem) {
               pastedItems.push(pastedItem);
          }
     });

     if (!pastedItems.length) {
          return false;
     }

     plannerClipboard.pasteCount += 1;
     selectItems(pastedItems);
     notifyTemplateChanged();
     updateClipboardControls();
     return true;
}

function isTextInputShortcutTarget(target) {
     return Boolean(target?.closest?.("input, textarea, select, [contenteditable='true']"));
}

function handleClipboardShortcut(event) {
     if (activeAction || isTextInputShortcutTarget(event.target) || !(event.metaKey || event.ctrlKey) || event.altKey) {
          return;
     }

     const key = event.key.toLowerCase();

     if (key === "c") {
          if (copyPlannerItems()) {
               event.preventDefault();
          }
     } else if (key === "v") {
          if (pastePlannerClipboard()) {
               event.preventDefault();
          }
     }
}

function duplicateItem(item) {
     const actionItems = getActionItems(item);

     if (actionItems.length > 1) {
          selectItems(actionItems);
          duplicateSelectedItems();
          return;
     }

     const page = getItemPage(item);

     if (page && isPageTitleItem(item)) {
          return;
     }

     const box = getItemBox(item);
     const duplicate = makePlannerItem(item.dataset.itemType || "sticky");
     const parent = plannerDesk;
     const nextBox = page
          ? {
               ...box,
               x: clamp(box.x + getGridSize(page).x, 0, page.clientWidth - box.width),
               y: clamp(box.y + getGridSize(page).y, 0, page.clientHeight - box.height)
          }
          : {
               ...box,
               x: box.x + 16,
               y: box.y + 16
          };

     parent.append(duplicate);
     copyItemConfiguration(item, duplicate);
     advanceDuplicatedCalendarView(item, duplicate);
     markGridState(duplicate, Boolean(page), page);
     setItemBox(duplicate, nextBox);
     selectItem(duplicate);
     notifyTemplateChanged();
}

function duplicateSelectedItems() {
     const copies = [];
     const copiedGroupIds = new Map();

     selectedItems.forEach((item) => {
          const page = getItemPage(item);

          if (page && isPageTitleItem(item)) {
               return;
          }

          const box = getItemBox(item);
          const duplicate = makePlannerItem(item.dataset.itemType || "sticky");
          const parent = plannerDesk;
          const offset = page ? getGridSize(page).x : 16;
          const nextBox = page
               ? {
                    ...box,
                    x: clamp(box.x + offset, 0, page.clientWidth - box.width),
                    y: clamp(box.y + offset, 0, page.clientHeight - box.height)
               }
               : {
                    ...box,
                    x: box.x + offset,
                    y: box.y + offset
               };

          parent.append(duplicate);
          copyItemConfiguration(item, duplicate);
          markGridState(duplicate, Boolean(page), page);
          setItemBox(duplicate, nextBox);

          if (item.dataset.groupId) {
               if (!copiedGroupIds.has(item.dataset.groupId)) {
                    copiedGroupIds.set(item.dataset.groupId, `group-${nextGroupId}`);
                    nextGroupId += 1;
               }

               duplicate.dataset.groupId = copiedGroupIds.get(item.dataset.groupId);
          }

          copies.push(duplicate);
     });

     if (!copies.length) {
          return;
     }

     selectItems(copies);
     notifyTemplateChanged();
}

function deleteItem(item) {
     const actionItems = getActionItems(item);

     actionItems.forEach((targetItem) => {
          selectedItems.delete(targetItem);
          closeItemMenu(targetItem);
          targetItem.remove();
     });
     selectedItem = selectedItems.size ? Array.from(selectedItems).at(-1) : null;
     notifyTemplateChanged();
}

// NOTE: Drop Items Onto Pages Or Back Onto The Desk
function placeItemOnDesk(item, event) {
     const itemRect = item.getBoundingClientRect();
     const deskRect = plannerDesk.getBoundingClientRect();

     plannerDesk.append(item);
     item.classList.remove("is-floating-source");
     markGridState(item, false);
     setItemBox(item, {
          ...getItemBox(item),
          x: itemRect.left - deskRect.left,
          y: itemRect.top - deskRect.top
     });

     if (event) {
          setItemBox(item, getDeskBox(item, event.clientX, event.clientY, activeAction.offsetX, activeAction.offsetY));
     }
}

function snapItemToPage(item, page, event) {
     if (!canPlaceItemOnPage(item, page)) {
          return false;
     }

     const snappedSize = getGridSnappedSize(item, page);
     const isNewPageCalendar = activeAction.type === "source" && isFullPageCalendarType(item.dataset.itemType);

     plannerDesk.append(item);
     item.classList.remove("is-floating-source");
     markGridState(item, true, page);
     setItemBox(item, {
          ...getItemBox(item),
          width: snappedSize.width,
          height: snappedSize.height
     });

     if (isNewPageCalendar) {
          const grid = getGridSize(page);
          const origin = getGridSnapOrigin(page);

          setItemBox(item, {
               ...getItemBox(item),
               x: origin.x + grid.x,
               y: origin.y + grid.y,
               width: Math.max(grid.x, snappedSize.width - (grid.x * 2)),
               height: Math.max(grid.y, Math.min(
                    snappedSize.height - (grid.y * 2),
                    item.dataset.itemType === "perpetual-calendar" ? grid.y * getPerpetualCalendarMaxGridRows() : Infinity
               ))
          });
          return true;
     }

     setItemBox(
          item,
          getMovedBox(
               item,
               page,
               event.clientX,
               event.clientY,
               activeAction.offsetX,
               activeAction.offsetY
          )
     );
     return true;
}

function restoreActiveMoveItems() {
     activeAction.items.forEach(({ item, page, box }) => {
          plannerDesk.append(item);
          markGridState(item, Boolean(page), page);
          setItemBox(item, box);
          item.classList.remove("is-dragging");
     });
}

function removeRejectedSourceItem() {
     selectedItems.delete(activeAction.item);
     if (selectedItem === activeAction.item) {
          selectedItem = null;
     }
     activeAction.item.remove();
     updateObjectControlsState();
}

function moveGroupItemsToDestination(destinationPage, activeStart, activeFinalRect) {
     const deltaLeft = activeFinalRect.left - activeStart.rect.left;
     const deltaTop = activeFinalRect.top - activeStart.rect.top;
     const destinationRect = destinationPage ? destinationPage.getBoundingClientRect() : plannerDesk.getBoundingClientRect();
     const viewZoom = destinationPage ? getViewZoom() : 1;

     activeAction.items.forEach(({ item, rect }) => {
          if (item === activeAction.item) {
               return;
          }

          const nextLeft = rect.left + deltaLeft;
          const nextTop = rect.top + deltaTop;
          const current = getItemBox(item);
          const nextBox = {
               ...current,
               x: (nextLeft - destinationRect.left) / viewZoom,
               y: (nextTop - destinationRect.top) / viewZoom
          };

          if (destinationPage) {
               const grid = getGridSize(destinationPage);
               const origin = getGridSnapOrigin(destinationPage);

               plannerDesk.append(item);
               markGridState(item, true, destinationPage);
               setItemBox(item, {
                    ...nextBox,
                    x: snapToGridOrigin(nextBox.x, origin.x, grid.x),
                    y: snapToGridOrigin(nextBox.y, origin.y, grid.y),
                    width: current.width,
                    height: current.height
               });
          } else {
               plannerDesk.append(item);
               setItemBox(item, nextBox);
               markGridState(item, false);
          }
     });
}

function setFloatingBox(item, clientX, clientY, offsetX, offsetY) {
     item.style.left = `${clientX - offsetX}px`;
     item.style.top = `${clientY - offsetY}px`;
}

function setMarqueeBox(marquee, startX, startY, currentX, currentY) {
     const deskRect = plannerDesk.getBoundingClientRect();
     const left = Math.min(startX, currentX) - deskRect.left;
     const top = Math.min(startY, currentY) - deskRect.top;
     const width = Math.abs(currentX - startX);
     const height = Math.abs(currentY - startY);

     marquee.style.left = `${left}px`;
     marquee.style.top = `${top}px`;
     marquee.style.width = `${width}px`;
     marquee.style.height = `${height}px`;

     return {
          x: left,
          y: top,
          width,
          height
     };
}

function updateMarqueeSelection(selectionBox) {
     const selectedFromMarquee = getPlannerItems().filter((item) => boxesIntersect(getDeskRelativeRect(item), selectionBox));
     const nextSelection = new Set(activeAction.baseSelection);

     selectedFromMarquee.forEach((item) => nextSelection.add(item));
     selectItems(Array.from(nextSelection));
}

function startMarquee(event) {
     if (event.button !== 0) {
          return;
     }

     const resizeMode = selectedItem && !event.target.closest(".planner-settings, .item-controls, .page-snap-controls")
          ? getResizeMode(selectedItem, event)
          : "";

     if (resizeMode) {
          startResize(selectedItem, event, resizeMode);
          return;
     }

     if (event.target.closest(".planner-item, .sticky-note, .planner-settings, .page-snap-controls")) {
          return;
     }

     const marquee = document.createElement("div");

     event.preventDefault();
     closeItemMenus();

     if (!event.metaKey && !event.ctrlKey) {
          clearSelection();
     }

     marquee.className = "selection-marquee";
     plannerDesk.append(marquee);
     activeAction = {
          type: "select",
          marquee,
          startX: event.clientX,
          startY: event.clientY,
          baseSelection: event.metaKey || event.ctrlKey ? new Set(selectedItems) : new Set()
     };
     setMarqueeBox(marquee, event.clientX, event.clientY, event.clientX, event.clientY);
}

function startMove(item, event) {
     const page = getItemPage(item);
     const itemRect = item.getBoundingClientRect();

     closeItemMenus();
     if (!selectedItems.has(item)) {
          selectItem(item);
     }

     const movingItems = Array.from(selectedItems);
     activeAction = {
          type: "pending-move",
          item,
          items: movingItems.map((movingItem) => {
               return {
                    item: movingItem,
                    page: getItemPage(movingItem),
                    box: getItemBox(movingItem),
                    rect: movingItem.getBoundingClientRect()
               };
          }),
          page,
          startX: event.clientX,
          startY: event.clientY,
          offsetX: event.clientX - itemRect.left,
          offsetY: event.clientY - itemRect.top
     };

     try {
          item.setPointerCapture(event.pointerId);
     } catch {
     }
}

function startSourceMove(event) {
     const source = event.currentTarget;
     const item = makePlannerItem(source.dataset.createType || "sticky");
     const sourceRect = source.getBoundingClientRect();
     const offsetX = event.clientX - sourceRect.left;
     const offsetY = event.clientY - sourceRect.top;

     event.preventDefault();
     closeItemMenus();
     document.body.append(item);
     item.classList.add("is-floating-source", "is-dragging");
     item.style.width = `${sourceRect.width}px`;
     item.style.height = `${sourceRect.height}px`;
     setFloatingBox(item, event.clientX, event.clientY, offsetX, offsetY);

     activeAction = {
          type: "source",
          item,
          page: null,
          didCloseSidebar: false,
          offsetX,
          offsetY
     };

     try {
          item.setPointerCapture(event.pointerId);
     } catch {
     }
}

function startResize(item, event, mode) {
     if (selectedItems.size !== 1 || item.dataset.groupId) {
          return;
     }

     event.preventDefault();
     closeItemMenus();
     selectItem(item);
     updateItemSizeLabel(item);
     activeAction = {
          type: "resize",
          item,
          page: getItemPage(item),
          mode
     };
     item.classList.add("is-dragging", "is-resizing");

     try {
          item.setPointerCapture(event.pointerId);
     } catch {
     }
}

function moveActiveItem(event) {
     if (!activeAction) {
          return;
     }

     if (activeAction.type === "sidebar-move") {
          activeAction.hasMoved = true;
          setSidebarBox(getMovedSidebarBox(event.clientX, event.clientY));
          return;
     }

     if (activeAction.type === "sidebar-resize") {
          setSidebarBox(getResizedSidebarBox(event.clientY));
          return;
     }

     if (activeAction.type === "select") {
          updateMarqueeSelection(setMarqueeBox(activeAction.marquee, activeAction.startX, activeAction.startY, event.clientX, event.clientY));
          return;
     }

     if (activeAction.type === "pending-move") {
          const deltaX = event.clientX - activeAction.startX;
          const deltaY = event.clientY - activeAction.startY;

          if (Math.hypot(deltaX, deltaY) < moveStartThreshold) {
               return;
          }

          event.preventDefault();
          activeAction.type = "move";
          activeAction.items.forEach(({ item }) => item.classList.add("is-dragging"));
     }

     const pointerPage = getPageFromPoint(event.clientX, event.clientY);
     const overlapPage = activeAction.type === "source" || activeAction.type === "move"
          ? getPageFromDraggedBox(activeAction.item, event.clientX, event.clientY, activeAction.offsetX, activeAction.offsetY)
          : null;
     const page = pointerPage || overlapPage;
     clearDragOver();
     markSnapReady(activeAction.item, Boolean(overlapPage || pointerPage));

     if (page) {
          page.classList.add("is-drag-over");
     }

     if (activeAction.type === "source") {
          if (!activeAction.didCloseSidebar) {
               closeSidebar();
               activeAction.didCloseSidebar = true;
          }
          setFloatingBox(activeAction.item, event.clientX, event.clientY, activeAction.offsetX, activeAction.offsetY);
          return;
     }

     if (activeAction.type === "move") {
          if (activeAction.page) {
               setItemBox(
                    activeAction.item,
                    getMovedBox(
                         activeAction.item,
                         activeAction.page,
                         event.clientX,
                         event.clientY,
                         activeAction.offsetX,
                         activeAction.offsetY,
                         false
                    )
               )
          } else {
               setItemBox(
                    activeAction.item,
                    getDeskBox(activeAction.item, event.clientX, event.clientY, activeAction.offsetX, activeAction.offsetY)
               );
          }

          const movedBox = getItemBox(activeAction.item);
          const startingBox = activeAction.items.find(({ item }) => item === activeAction.item).box;
          const deltaX = movedBox.x - startingBox.x;
          const deltaY = movedBox.y - startingBox.y;

          activeAction.items.forEach(({ item, page, box }) => {
               if (item === activeAction.item) {
                    return;
               }

               setItemBox(item, {
                    ...box,
                    x: box.x + deltaX,
                    y: box.y + deltaY
               });
          });
     }

     if (activeAction.type === "resize") {
          setItemBox(activeAction.item, getResizedBox(activeAction.item, activeAction.page, event.clientX, event.clientY, activeAction.mode));
          markGridState(activeAction.item, Boolean(activeAction.page));
     }
}

function endActiveItem(event) {
     if (!activeAction) {
          return;
     }

     if (activeAction.type === "sidebar-move" || activeAction.type === "sidebar-resize") {
          try {
               plannerSettings.releasePointerCapture(event.pointerId);
          } catch {
          }

          if (activeAction.type === "sidebar-move" && activeAction.hasMoved) {
               shouldSkipNextTabClick = true;
          }

          plannerSettings.classList.remove("is-dragging", "is-resizing");
          activeAction = null;
          return;
     }

     if (activeAction.type === "select") {
          activeAction.marquee.remove();
          shouldSkipNextClear = true;
          activeAction = null;
          return;
     }

     try {
          activeAction.item.releasePointerCapture(event.pointerId);
     } catch {
     }

     if (activeAction.type === "pending-move") {
          selectItem(activeAction.item);
          activeAction = null;
          clearDragOver();
          return;
     }

     if (activeAction.type === "source" && !activeAction.didCloseSidebar) {
          removeRejectedSourceItem();
          activeAction = null;
          clearDragOver();
          return;
     }

     if (activeAction.type === "source" || activeAction.type === "move") {
          const page = getPageFromDraggedBox(
               activeAction.item,
               event.clientX,
               event.clientY,
               activeAction.offsetX,
               activeAction.offsetY
          );

          if (page && !canPlaceActiveMoveItemsOnPage(page)) {
               restoreActiveMoveItems();
               markSnapReady(activeAction.item, false);
               activeAction = null;
               clearDragOver();
               return;
          }

          if (page) {
               const didPlaceOnPage = snapItemToPage(activeAction.item, page, event);

               if (!didPlaceOnPage) {
                    if (activeAction.type === "source") {
                         removeRejectedSourceItem();
                    } else {
                         restoreActiveMoveItems();
                    }
                    markSnapReady(activeAction.item, false);
                    activeAction = null;
                    clearDragOver();
                    return;
               }
          } else {
               placeItemOnDesk(activeAction.item, event);
          }

          if (activeAction.type === "move" && activeAction.items.length > 1) {
               moveGroupItemsToDestination(page, activeAction.items.find(({ item }) => item === activeAction.item), activeAction.item.getBoundingClientRect());
          }

          if (activeAction.type === "move") {
               activeAction.items.forEach(({ item }) => item.classList.remove("is-dragging"));
          } else {
               activeAction.item.classList.remove("is-dragging");
               selectItem(activeAction.item);
          }
     } else {
          activeAction.item.classList.remove("is-dragging", "is-resizing");
          selectItem(activeAction.item);
     }

     markSnapReady(activeAction.item, false);
     notifyTemplateChanged();
     activeAction = null;
     clearDragOver();
}
