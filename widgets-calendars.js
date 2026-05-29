// NOTE: Calendar widget previews, date helpers, sizing, rendering, and option controls.

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

function populateMonthCalendarSourcePreview(preview) {
     const rows = 8;
     const columns = 8;
     const titleCell = createCalendarSourcePreviewCell(1, 1, rows, columns, ["is-title"]);

     preview.classList.add("calendar-source-preview-month");
     preview.style.gridTemplateColumns = `0.85fr repeat(7, minmax(0, 1fr))`;
     preview.style.gridTemplateRows = `1.2fr repeat(${rows - 1}, minmax(0, 1fr))`;

     titleCell.style.gridColumn = "1 / -1";
     preview.append(titleCell);
     for (let row = 2; row <= rows; row += 1) {
          for (let column = 1; column <= columns; column += 1) {
               const classNames = [];

               if (row === 2) {
                    classNames.push("is-weekday");
               } else if (column === 1 || column >= 7) {
                    classNames.push("is-tinted");
               }

               preview.append(createCalendarSourcePreviewCell(row, column, rows, columns, classNames));
          }
     }
}

function populateWeeklyCalendarSourcePreview(preview) {
     const rows = 12;
     const columns = 8;

     preview.classList.add("calendar-source-preview-time-grid");
     preview.style.gridTemplateColumns = `0.95fr repeat(7, minmax(0, 1fr))`;
     preview.style.gridTemplateRows = `1.05fr repeat(${rows - 1}, minmax(0, 1fr))`;
     for (let row = 1; row <= rows; row += 1) {
          for (let column = 1; column <= columns; column += 1) {
               const classNames = [];

               if (row === 1) {
                    classNames.push(column === 1 ? "is-tinted" : "is-weekday");
               } else if (column === 1 || column >= 7) {
                    classNames.push("is-tinted");
               }

               preview.append(createCalendarSourcePreviewCell(row, column, rows, columns, classNames));
          }
     }
}

function populateDayCalendarSourcePreview(preview) {
     const rows = 12;
     const columns = 2;

     preview.classList.add("calendar-source-preview-time-grid");
     preview.style.gridTemplateColumns = "0.9fr 3fr";
     preview.style.gridTemplateRows = `1.05fr repeat(${rows - 1}, minmax(0, 1fr))`;
     for (let row = 1; row <= rows; row += 1) {
          for (let column = 1; column <= columns; column += 1) {
               const classNames = [];

               if (row === 1) {
                    classNames.push("is-weekday");
               } else if (column === 1) {
                    classNames.push("is-tinted");
               }

               preview.append(createCalendarSourcePreviewCell(row, column, rows, columns, classNames));
          }
     }
}

function populateDiaryCalendarSourcePreview(preview) {
     const rows = 7;
     const columns = 2;

     preview.classList.add("calendar-source-preview-diary");
     preview.style.gridTemplateColumns = "1.05fr 3fr";
     preview.style.gridTemplateRows = `repeat(${rows}, minmax(0, 1fr))`;
     for (let row = 1; row <= rows; row += 1) {
          for (let column = 1; column <= columns; column += 1) {
               const classNames = column === 1 || row >= 6 ? ["is-tinted"] : [];

               preview.append(createCalendarSourcePreviewCell(row, column, rows, columns, classNames));
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
          if (type === "perpetual-calendar") {
               populatePerpetualCalendarSourcePreview(preview);
          } else if (type === "mini-month" || type === "full-month") {
               populateMonthCalendarSourcePreview(preview);
          } else if (type === "weekly-view") {
               populateWeeklyCalendarSourcePreview(preview);
          } else if (type === "day-view") {
               populateDayCalendarSourcePreview(preview);
          } else if (type === "diary-view") {
               populateDiaryCalendarSourcePreview(preview);
          } else {
               populateCalendarSourcePreviewGrid(preview, {
                    columns: type === "day-view" ? 4 : 8,
                    rows: type === "weekly-view" || type === "day-view" || type === "diary-view" ? 14 : 8,
                    timeColumn: type === "weekly-view" || type === "day-view" ? 1 : 0,
                    wkdColumns: type === "day-view" ? [] : [7, 8]
               });
          }
          sourceItem.append(preview);
     });
}

function isCalendarItemType(type) {
     return type === "mini-month" || type === "day-view" || isFullPageCalendarType(type);
}

function isFullPageCalendarType(type) {
     return type === "full-month" || type === "weekly-view" || type === "diary-view" || type === "perpetual-calendar";
}

function isCalendarItem(item) {
     return isCalendarItemType(item.dataset.itemType);
}

function isTimeGridCalendarType(type) {
     return type === "weekly-view" || type === "day-view";
}

function isCalendarTextItemType(type) {
     return type === "full-month" || type === "weekly-view" || type === "day-view" || type === "diary-view" || type === "perpetual-calendar";
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

function normalizeCalendarTimeFormat(format) {
     if (format === "12" || format === "12-double" || format === "compact" || format === "ampm") {
          return "12";
     }

     return "24";
}

function formatWeeklyTimeLabel(totalMinutes, format = "24") {
     const dayMinutes = 24 * 60;
     const normalizedMinutes = ((totalMinutes % dayMinutes) + dayMinutes) % dayMinutes;
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
     const normalizedMinutes = ((totalMinutes % (24 * 60)) + (24 * 60)) % (24 * 60);

     return normalizedMinutes % 60 === 0;
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
     if (item.dataset.itemType !== "full-month" && !isTimeGridCalendarType(item.dataset.itemType)) {
          return;
     }

     const visibleDays = clamp(Number(item.dataset.visibleDays) || 7, 1, 7);
     const timeColumnUnits = isTimeGridCalendarType(item.dataset.itemType) && item.dataset.timeVisible !== "false" ? 1 : 0;
     const dayColumnUnits = item.dataset.itemType === "day-view" ? 7 : visibleDays * 5;
     const columnUnits = item.dataset.itemType === "full-month" ? getFullMonthGridUnits().width : timeColumnUnits + dayColumnUnits;
     const rowUnits = item.dataset.itemType === "full-month"
          ? getFullMonthGridUnits().height
          : Math.max(1, Number(item.style.getPropertyValue("--weekly-row-count")) || 14);
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
          const fixedRowUnits = Math.max(1, Number(item.style.getPropertyValue("--mini-month-fixed-row-units")) || 3);
          const weekRowCount = Math.max(1, Number(item.style.getPropertyValue("--mini-month-week-row-count")) || 6);
          const weekRowUnits = getFullMonthWeekRowUnits();

          item.style.setProperty("--mini-month-week-row-units", String(weekRowUnits));
          metricsTarget.style.setProperty("--mini-month-week-row-units", String(weekRowUnits));
          metricsTarget.style.setProperty("--mini-month-week-row-height", `${cellHeight * weekRowUnits}px`);
          metricsTarget.style.setProperty("--mini-month-visible-row-units", String(fixedRowUnits + (weekRowCount * weekRowUnits)));
          metricsTarget.style.setProperty("--mini-month-max-row-units", String(fixedRowUnits + (6 * weekRowUnits)));
     }
}

function getPerpetualCalendarMaxGridRows() {
     return perpetualCalendarMaxDayRows + perpetualCalendarHeaderRows;
}

function getPerpetualCalendarMinGridColumns() {
     return perpetualCalendarLeftColumnGridUnits + perpetualCalendarRightColumnMinGridUnits;
}

function getWeeklyVerticalDisplayColumnCount(item) {
     if (item.dataset.itemType === "day-view") {
          return 1;
     }

     const visibleDays = clamp(Number(item.dataset.visibleDays) || 7, 1, 7);
     const weekStartDate = getWeeklyViewStartDate(item);

     return getWeeklyDisplayColumns(weekStartDate, visibleDays, item.dataset.shareWeekends === "true").length;
}

function getWeeklyVerticalMinGridColumns(item) {
     const timeColumnUnits = item.dataset.timeVisible !== "false" ? 1 : 0;
     const dayColumnUnits = item.dataset.itemType === "day-view" ? 7 : getWeeklyVerticalDisplayColumnCount(item) * 5;

     return timeColumnUnits + dayColumnUnits;
}

function getFullMonthGridUnits() {
     return {
          width: 31,
          height: 38
     };
}

function getFullMonthTitleRowUnits() {
     return 1;
}

function getFullMonthWeekRowUnits() {
     return 6;
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
     const snappedWidth = Math.max(minWidth, Math.round(box.width / grid.x) * grid.x);

     return {
          ...box,
          width: snappedWidth,
          height: fixedHeight
     };
}

function clampMiniMonthBox(item, page, box) {
     if (item.dataset.itemType !== "mini-month" && item.dataset.itemType !== "full-month") {
          return box;
     }

     const grid = getGridSize(page);
     const units = item.dataset.itemType === "full-month" ? getFullMonthGridUnits() : getMiniMonthGridUnits(item);

     return {
          ...box,
          width: grid.x * units.width,
          height: grid.y * units.height
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

     const controls = getWidgetPanel(item) || item;

     item.dataset.dayTextSize = settings.size || item.dataset.dayTextSize || "10";
     item.dataset.dayTextFont = settings.font || item.dataset.dayTextFont || "annotation-mono";
     item.dataset.dayTextColor = settings.color || item.dataset.dayTextColor || "var(--color-gray1)";
     delete item.dataset.dayTextAlpha;
     item.dataset.dayTextBold = settings.bold ?? item.dataset.dayTextBold ?? "false";
     item.dataset.dayTextItalic = settings.italic ?? item.dataset.dayTextItalic ?? "false";
     item.dataset.dayTextUnderline = settings.underline ?? item.dataset.dayTextUnderline ?? "false";
     item.dataset.dayTextStrike = settings.strike ?? item.dataset.dayTextStrike ?? "false";
     item.dataset.dayTextAlign = settings.align || item.dataset.dayTextAlign || "center";
     item.dataset.dayTextYAlign = settings.yAlign || item.dataset.dayTextYAlign || "center";
     item.dataset.dayTextLineHeight = settings.lineHeight || item.dataset.dayTextLineHeight || "1";
     item.dataset.dayTextRole = settings.role || item.dataset.dayTextRole || "body";

     item.querySelectorAll(".calendar-day-text").forEach((textElement) => {
          applyCalendarDayTextStyle(item, textElement);
          updateCalendarDayTextOverflow(textElement);
     });

     const fontSelect = controls.querySelector("[data-text-control='font']");
     const colorInput = controls.querySelector("[data-text-control='color']");
     const colorSwatches = controls.querySelector("[data-text-swatches='color']");
     const boldInput = controls.querySelector("[data-text-control='bold']");
     const italicInput = controls.querySelector("[data-text-control='italic']");
     const underlineInput = controls.querySelector("[data-text-control='underline']");
     const strikeInput = controls.querySelector("[data-text-control='strike']");
     const alignSelect = controls.querySelector("[data-text-control='align']");
     const yAlignSelect = controls.querySelector("[data-text-control='y-align']");
     const lineHeightSelect = controls.querySelector("[data-text-control='line-height']");
     const roleSelect = controls.querySelector("[data-text-control='role']");

     updateTextSizeControls(controls, item.dataset.dayTextSize);

     if (fontSelect) {
          fontSelect.value = item.dataset.dayTextFont;
     }

     if (colorInput) {
          setPaletteControlValue(colorInput, colorSwatches, item.dataset.dayTextColor);
     }

     if (boldInput) {
          updateTextToggleControl(boldInput, item.dataset.dayTextBold === "true");
     }

     if (italicInput) {
          updateTextToggleControl(italicInput, item.dataset.dayTextItalic === "true");
     }

     if (underlineInput) {
          updateTextToggleControl(underlineInput, item.dataset.dayTextUnderline === "true");
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

     updateTextAlignmentControls(controls, item.dataset.dayTextAlign, item.dataset.dayTextYAlign);

     if (lineHeightSelect) {
          lineHeightSelect.value = item.dataset.dayTextLineHeight;
     }

     if (roleSelect) {
          roleSelect.value = item.dataset.dayTextRole;
     }

     controls.querySelectorAll("select").forEach(updateCustomSelectDisplay);
}

function applyCalendarDayTextStyle(item, textElement) {
     textElement.style.fontSize = `${item.dataset.dayTextSize || "10"}px`;
     textElement.style.color = item.dataset.dayTextColor || "var(--color-gray1)";
     textElement.style.fontFamily = getStickerTextFont(item.dataset.dayTextFont || "annotation-mono");
     textElement.style.fontWeight = item.dataset.dayTextBold === "true" ? "700" : "400";
     textElement.style.fontStyle = item.dataset.dayTextItalic === "true" ? "italic" : "normal";
     textElement.style.textDecoration = getTextDecorationValue(item.dataset.dayTextUnderline, item.dataset.dayTextStrike);
     textElement.style.textAlign = item.dataset.dayTextAlign || "center";
     textElement.style.alignContent = getTextYAlignValue(item.dataset.dayTextYAlign);
     textElement.style.lineHeight = getTextLineHeightPixels(item, item.dataset.dayTextLineHeight);
}

function updateCalendarDayTextOverflow(textElement) {
     const cell = textElement.closest(".dayCell, .perpetual-calendar-row");
     const item = textElement.closest(".planner-item-full-month, .planner-item-weekly-view, .planner-item-day-view, .planner-item-diary-view, .planner-item-perpetual-calendar");

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
     if (item.dataset.itemType === "day-view") {
          return getCalendarEffectiveDate(item);
     }

     if (item.dataset.dateMode === "relative") {
          const date = getCalendarEffectiveDate(item);
          const firstDayIndex = item.dataset.weekStart === "sunday" ? 0 : 1;
          const dayOffset = (date.getDay() - firstDayIndex + 7) % 7;

          date.setDate(date.getDate() - dayOffset);
          return date;
     }

     const { month, year } = getCalendarEffectiveMonthYear(item);
     const startDay = clamp(Number(item.dataset.startDay) || 1, 1, getCalendarDaysInMonth(year, month));

     return new Date(year, month, startDay);
}

function normalizeRelativeDateUnit(unit) {
     return ["day", "week", "month", "year"].includes(unit) ? unit : "month";
}

function getCalendarRelativeDateUnit(item) {
     if (item?.dataset?.itemType === "day-view") {
          return "day";
     }

     return item?.dataset?.itemType === "weekly-view" || item?.dataset?.itemType === "diary-view" ? "week" : "month";
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

function formatRelativeDateOffset(offset) {
     return offset > 0 ? `+${offset}` : String(offset);
}

function populateRelativeDateOffsetSelect(select, unit, selectedOffset) {
     if (!select) {
          return;
     }

     const maxOffset = getRelativeDateOffsetMax(unit);
     const clampedOffset = clampRelativeDateOffset(selectedOffset, unit);

     select.replaceChildren();
     for (let offset = -maxOffset; offset <= maxOffset; offset += 1) {
          const option = document.createElement("option");

          option.value = String(offset);
          option.textContent = formatRelativeDateOffset(offset);
          select.append(option);
     }
     select.value = clampedOffset;
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
          magnitude: String(magnitude)
     };
}

function getCalendarDisplayOffsetValue(direction, magnitude) {
     const amount = clamp(Number(magnitude) || 0, 0, 31);

     return String(direction === "-" ? -amount : amount);
}

function setCalendarDisplayControlLabel(select, labelText, ariaLabel) {
     const label = select?.closest(".item-calendar-display-control");
     const textNode = label ? [...label.childNodes].find((node) => node.nodeType === Node.TEXT_NODE) : null;

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

function syncCalendarDisplayDateControls(item, displayYearSelect, displayMonthSelect) {
     if (!displayYearSelect || !displayMonthSelect) {
          return;
     }

     if (item.dataset.dateMode === "relative") {
          const offset = getCalendarDisplayOffsetParts(item.dataset.dateOffset);

          setCalendarDisplayControlHidden(displayYearSelect, false);
          setCalendarDisplayControlHidden(displayMonthSelect, false);
          setCalendarDisplayControlLabel(displayYearSelect, "Offset", "Display date offset direction");
          setCalendarDisplayControlLabel(displayMonthSelect, "Amount", "Display date offset amount");
          replaceSelectOptions(displayYearSelect, [
               ["+", "+"],
               ["-", "-"]
          ], offset.direction);
          replaceSelectOptions(displayMonthSelect, Array.from({
               length: 32
          }, (_, index) => {
               const value = String(index);

               return [value, value];
          }), offset.magnitude);
          return;
     }

     setCalendarDisplayControlHidden(displayYearSelect, item.dataset.itemType === "perpetual-calendar");
     setCalendarDisplayControlHidden(displayMonthSelect, false);
     setCalendarDisplayControlLabel(displayYearSelect, "Year", "Display year");
     setCalendarDisplayControlLabel(displayMonthSelect, "Month", "Display month");
     replaceSelectOptions(displayYearSelect, Array.from({
          length: calendarYearRange.end - calendarYearRange.start + 1
     }, (_, index) => {
          const year = String(calendarYearRange.start + index);

          return [year, year];
     }), item.dataset.year);
     replaceSelectOptions(displayMonthSelect, calendarMonthNames.map((monthName, index) => [String(index), monthName]), item.dataset.month);
}

function getCalendarFixedNumber(value, fallback) {
     const number = Number(value);

     return Number.isFinite(number) ? number : fallback;
}

function getCalendarEffectiveDate(item) {
     const today = new Date();

     if (item.dataset.dateMode !== "relative") {
          const month = getCalendarFixedNumber(item.dataset.month, today.getMonth());
          const year = getCalendarFixedNumber(item.dataset.year, today.getFullYear());
          const startDay = clamp(Number(item.dataset.startDay) || 1, 1, getCalendarDaysInMonth(year, month));

          return new Date(year, month, startDay);
     }

     const unit = getCalendarRelativeDateUnit(item);
     const offset = Number(clampRelativeDateOffset(item.dataset.dateOffset, unit));
     const date = new Date(today.getFullYear(), today.getMonth(), today.getDate());

     if (unit === "day") {
          date.setDate(date.getDate() + offset);
     } else if (unit === "week") {
          date.setDate(date.getDate() + (offset * 7));
     } else if (unit === "month") {
          date.setMonth(date.getMonth() + offset);
     } else if (unit === "year") {
          date.setFullYear(date.getFullYear() + offset);
     }

     return date;
}

function getCalendarEffectiveMonthYear(item) {
     const date = getCalendarEffectiveDate(item);

     return {
          month: date.getMonth(),
          year: date.getFullYear()
     };
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

     return clamp(rowCount - 1, 1, maxSlotCount);
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
          ["S", "Sat", "Saturday"]
     ];
     const labelIndex = normalizeWeekdayLabelFormat(format) === "full" ? 2 : (normalizeWeekdayLabelFormat(format) === "ddd" ? 1 : 0);

     return names[dayIndex]?.[labelIndex] || "";
}

function getCalendarDateOrder(item) {
     const defaultDateSettings = typeof getPlannerDefaultDateSettings === "function" ? getPlannerDefaultDateSettings() : {};
     const order = typeof normalizeDateOrder === "function"
          ? normalizeDateOrder(item?.dataset?.dateOrder || defaultDateSettings.dateOrder)
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
     const defaultDateSettings = typeof getPlannerDefaultDateSettings === "function" ? getPlannerDefaultDateSettings() : {};

     return {
          yearFormat: normalizeCalendarDateYearFormat(item?.dataset?.dateYearFormat || defaultDateSettings.yearFormat),
          monthFormat: normalizeCalendarDateMonthFormat(item?.dataset?.dateMonthFormat || defaultDateSettings.monthFormat),
          dayFormat: normalizeCalendarDateDayFormat(item?.dataset?.dateDayFormat || defaultDateSettings.dayFormat)
     };
}

function createCalendarDatePart(part, date, {
     weekdayLabelFormat = "d",
     monthDisplay = "full",
     yearFormat = "yyyy",
     monthFormat = "full",
     dayFormat = "ddd",
     todayKey = getTodayCalendarDayKey()
} = {}) {
     const element = document.createElement("span");
     const dayKey = getCalendarDayKey(date.getFullYear(), date.getMonth(), date.getDate());

     if (part === "day") {
          element.className = "calendar-date-part calendar-date-day weekly-view-day-name";
          element.textContent = getWeekdayLabel(date.getDay(), dayFormat === "full" ? "full" : "ddd");
     } else if (part === "date") {
          element.className = "calendar-date-part calendar-date-number dayNumber";
          element.textContent = String(date.getDate()).padStart(2, "0");
          markCurrentCalendarDayNumber(element, dayKey, todayKey);
     } else if (part === "year") {
          element.className = "calendar-date-part calendar-date-year";
          element.textContent = yearFormat === "yy" ? String(date.getFullYear()).slice(-2) : String(date.getFullYear());
     } else {
          element.className = "calendar-date-part calendar-date-month weekly-view-month-name";
          element.textContent = getCalendarMonthTitle(date.getMonth(), monthFormat === "ddd" ? "short" : monthDisplay);
     }

     return element;
}

function appendCalendarDateParts(container, item, date, options = {}) {
     const dateFormats = getCalendarDateFormats(item);

     getCalendarDateOrder(item).forEach((part) => {
          container.append(createCalendarDatePart(part, date, {
               ...options,
               ...dateFormats
          }));
     });
}

function getMonthCalendarColumns(weekStart = "monday", shareWeekends = false) {
     const weekdays = weekStart === "monday" ? [1, 2, 3, 4, 5, 6, 0] : [0, 1, 2, 3, 4, 5, 6];

     if (!shareWeekends) {
          return weekdays.map((dayIndex) => ({
               type: "day",
               days: [dayIndex]
          }));
     }

     const weekdayOnly = weekdays.filter((dayIndex) => dayIndex !== 0 && dayIndex !== 6);
     const weekendColumn = {
          type: "shared-weekend",
          days: [6, 0]
     };

     const weekdayColumns = weekdayOnly.map((dayIndex) => ({
          type: "day",
          days: [dayIndex]
     }));

     return weekStart === "monday" ? [...weekdayColumns, weekendColumn] : [weekendColumn, ...weekdayColumns];
}

function startCalendarDayTextEditing(textElement, item) {
     if (typeof keyboardMode !== "undefined" && keyboardMode !== "interact") {
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

     textElement.addEventListener("blur", () => {
          textElement.setAttribute("contenteditable", "false");
          normalizeEditablePlainText(textElement);
          item.classList.remove("is-editing-day-text");
          updateTextEditingState();
          renderKeyHints();
          setCalendarDayNote(item, textElement.dataset.dayKey, textElement.textContent || "");
          updateCalendarDayTextOverflow(textElement);
          notifyTemplateChanged();
     }, {
          once: true
     });
}

function handleCalendarTextPointerDown(textElement, event) {
     if (!textElement.isContentEditable) {
          return;
     }

     if (typeof keyboardMode !== "undefined" && keyboardMode === "design") {
          textElement.blur();
          return;
     }

     event.stopPropagation();
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
     const weekNumberFormat = normalizeWeekNumberFormat(item.dataset.weekNumberFormat, item.dataset.weekNumbers === "false" ? "off" : "no-outlines");
     const weekNumbersEnabled = weekNumberFormat !== "off";
     const weekNumberOutlines = weekNumberFormat === "outlines";
     const weekStart = item.dataset.weekStart || "monday";
     const shareWeekends = item.dataset.shareWeekends === "true";
     const monthDisplay = item.dataset.monthDisplay || "full";
     const yearDisplay = item.dataset.yearDisplay || (item.dataset.yearVisible === "false" ? "none" : "full");
     const dateFormats = getCalendarDateFormats(item);
     const { month, year } = getCalendarEffectiveMonthYear(item);
     const titleMonthText = monthDisplay === "none"
          ? ""
          : getCalendarMonthTitle(month, dateFormats.monthFormat === "ddd" ? "short" : "full");
     const titleYearText = yearDisplay === "none"
          ? ""
          : getCalendarYearTitle(year, dateFormats.yearFormat === "yy" ? "short" : "full");
     const monthVisible = titleMonthText !== "";
     const yearVisible = titleYearText !== "";
     const titleVisible = item.dataset.calendarTitleVisible !== "false" && (monthVisible || yearVisible);
     const firstDay = new Date(year, month, 1);
     const daysInMonth = new Date(year, month + 1, 0).getDate();
     const firstDayOffset = weekStart === "monday"
          ? (firstDay.getDay() + 6) % 7
          : firstDay.getDay();
     const displayColumns = getMonthCalendarColumns(weekStart, shareWeekends);
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
     const titleRowUnits = usesExpandedCalendarUnits ? getFullMonthTitleRowUnits() : 1;
     const dayNameRowUnits = 1;
     const weekRowUnits = usesExpandedCalendarUnits ? getFullMonthWeekRowUnits() : 1;
     const visibleColumnCount = 1 + displayColumns.length;
     const visibleRowCount = calendarRows.length;
     const visibleColumnUnits = usesExpandedCalendarUnits ? getFullMonthGridUnits().width : visibleColumnCount;
     const visibleRowUnits = (titleVisible ? titleRowUnits : 0) + dayNameRowUnits + (weekRows.length * weekRowUnits);
     const maxVisibleRowUnits = (titleVisible ? titleRowUnits : 0) + dayNameRowUnits + (6 * weekRowUnits);
     const fixedRowUnits = (titleVisible ? titleRowUnits : 0) + dayNameRowUnits;

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
     calendar.style.setProperty("--mini-month-max-row-units", String(maxVisibleRowUnits));
     calendar.style.setProperty("--mini-month-fixed-row-units", String(fixedRowUnits));
     calendar.style.setProperty("--mini-month-title-row-units", String(titleRowUnits));
     calendar.style.setProperty("--mini-month-week-row-count", String(weekRows.length));
     calendar.style.setProperty("--mini-month-day-column-count", String(displayColumns.length));
     if (usesExpandedCalendarUnits) {
          const dayColumnUnits = shareWeekends ? 5 : 30 / displayColumns.length;

          calendar.style.gridTemplateColumns = `var(--weekly-column-cell-width, 12px) repeat(${displayColumns.length}, minmax(calc(var(--weekly-column-cell-width, 12px) * ${dayColumnUnits}), 1fr))`;
          calendar.style.gridTemplateRows = [
               ...(titleVisible ? ["calc(var(--weekly-row-cell-height, 12px) * 2)"] : []),
               "var(--weekly-row-cell-height, 12px)",
               `repeat(${weekRows.length}, calc(var(--weekly-row-cell-height, 12px) * ${weekRowUnits}))`
          ].join(" ");
     } else {
          calendar.style.gridTemplateColumns = `repeat(${visibleColumnCount}, calc(100% / ${visibleColumnCount}))`;
          calendar.style.gridTemplateRows = `repeat(${visibleRowCount}, calc(100% / ${visibleRowCount}))`;
     }
     item.style.setProperty("--mini-month-fixed-row-units", String(fixedRowUnits));
     item.style.setProperty("--mini-month-title-row-units", String(titleRowUnits));
     item.style.setProperty("--mini-month-week-row-count", String(weekRows.length));
     for (let row = 0; row < calendarRows.length; row += 1) {
          const calendarRow = calendarRows[row];
          const displayRow = row + 1;

          for (let column = 0; column < visibleColumnCount; column += 1) {
               if (!weekNumbersEnabled && column === 0) {
                    continue;
               }

               const cell = document.createElement("span");
               const displayColumnInfo = column > 0 ? displayColumns[column - 1] : null;
               const isTitleCell = calendarRow === 0 && column === 1;
               const displayColumn = column + 1;

               cell.className = "mini-month-cell";
               cell.dataset.themePart = "dayCell";
               cell.style.gridRow = String(displayRow);
               cell.style.gridColumn = isTitleCell
                    ? `2 / span ${displayColumns.length}`
                    : String(displayColumn);

               if (calendarRow === 0) {
                    if (isTitleCell) {
                         const titleYear = document.createElement("span");
                         const titleMonth = document.createElement("span");

                         cell.classList.add("mini-month-month", (month + 1) % 2 === 1 ? "monthOdd" : "monthEven");
                         cell.dataset.themePart = "monthTitle";
                         cell.dataset.calendarStyleKey = "month-title";
                         cell.dataset.calendarStyleRole = "cell";
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
                    cell.dataset.calendarStyleKey = calendarRow === 1 ? "week-number-header" : `week-${calendarRow - 1}`;
                    cell.dataset.calendarStyleRole = "cell";
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
                         weekNumberLabel.dataset.themePart = "weekNumber";
                         weekNumberLabel.textContent = String(getCalendarWeekNumber(weekDate, weekStart));
                         cell.append(weekNumberLabel);
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
                         cell.textContent = getWeekdayLabel(displayColumnInfo.days[0], dateFormats.dayFormat === "full" ? "full" : "ddd");
                    }
                    if (displayColumnInfo.days.some((dayIndex) => dayIndex === 0 || dayIndex === 6)) {
                         cell.classList.add("mini-month-weekend");
                    }
               } else {
                    const weekStartDayNumber = ((calendarRow - 2) * 7) + 1 - firstDayOffset;
                    const renderedDayKeys = [];

                    if (displayColumnInfo.days.some((dayIndex) => dayIndex === 0 || dayIndex === 6)) {
                         cell.classList.add("mini-month-weekend");
                         cell.dataset.themePart = "weekendDayCell";
                    }
                    displayColumnInfo.days.forEach((dayIndex) => {
                         const dayPosition = weekStart === "monday" ? (dayIndex + 6) % 7 : dayIndex;
                         const dayNumber = weekStartDayNumber + dayPosition;

                         if (dayNumber < 1 || dayNumber > daysInMonth) {
                              return;
                         }

                         const dayNumberLabel = document.createElement("span");
                         const dayKey = getCalendarDayKey(year, month, dayNumber);
                         const isSharedWeekendDay = displayColumnInfo.type === "shared-weekend";
                         const dayContent = isSharedWeekendDay ? document.createElement("span") : cell;

                         cell.classList.add("dayCell");
                         cell.classList.toggle("mini-month-shared-weekend", isSharedWeekendDay);
                         if (isSharedWeekendDay) {
                              dayContent.className = "mini-month-shared-weekend-day";
                              dayContent.classList.add(dayIndex === 6 ? "is-saturday" : "is-sunday");
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
                              dayText.addEventListener("input", () => updateCalendarDayTextOverflow(dayText));
                              dayText.addEventListener("paste", handlePlainTextPaste);
                              dayText.addEventListener("dblclick", (event) => {
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
                    cell.classList.add("mini-month-draw-top-left", "mini-month-draw-top-right");
               } else if (column > 0) {
                    const isFirstDrawColumn = column === 1;
                    const isLastDrawColumn = column === visibleColumnCount - 1;
                    const isTopDrawRow = titleVisible ? row === 0 : calendarRow === 1;
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
                         if (shouldSkipNextItemClick) {
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
               if (shouldSkipNextItemClick) {
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
     const dateFormats = getCalendarDateFormats(item);
     const { month, year } = getCalendarEffectiveMonthYear(item);
     const titleMonthText = monthDisplay === "none"
          ? ""
          : getCalendarMonthTitle(month, dateFormats.monthFormat === "ddd" ? "short" : "full");
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

     titleCell.className = "perpetual-calendar-title";
     titleCell.style.gridRow = `span ${perpetualCalendarHeaderRows}`;
     titleCell.dataset.themePart = "monthTitle";
     titleCell.textContent = titleMonthText;
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
          dayText.addEventListener("input", () => updateCalendarDayTextOverflow(dayText));
          dayText.addEventListener("paste", handlePlainTextPaste);
          dayText.addEventListener("pointerdown", (event) => {
               handleCalendarTextPointerDown(dayText, event);
          });
          dayText.addEventListener("wheel", (event) => {
               if (dayText.isContentEditable) {
                    event.stopPropagation();
               }
          });
          row.addEventListener("click", (event) => {
               if (typeof keyboardMode !== "undefined" && keyboardMode !== "interact") {
                    return;
               }

               event.preventDefault();
               event.stopPropagation();
               startCalendarDayTextEditing(dayText, item);
          });
          lineCell.append(dayText);
          row.append(numberCell, lineCell);
          calendar.append(row);
     }
     applyThemeToWidget(item);
}

function renderDiaryView(item) {
     let calendar = item.querySelector(".diary-view");
     const weekdayLabelFormat = normalizeWeekdayLabelFormat(item.dataset.weekdayLabelFormat);
     const monthDisplay = item.dataset.monthDisplay || "short";
     const visibleDays = clamp(Number(item.dataset.visibleDays) || 7, 1, 7);
     const startDate = getWeeklyViewStartDate(item);
     const dayNotes = getCalendarDayNotes(item);
     const todayKey = getTodayCalendarDayKey();

     if (!calendar) {
          calendar = document.createElement("div");
          calendar.className = "diary-view";
          item.append(calendar);
     }

     calendar.replaceChildren();
     calendar.style.setProperty("--diary-row-count", String(visibleDays));

     for (let index = 0; index < visibleDays; index += 1) {
          const date = new Date(startDate);
          const row = document.createElement("span");
          const dateLabel = document.createElement("span");
          const dayText = document.createElement("div");

          date.setDate(startDate.getDate() + index);

          const dayKey = getCalendarDayKey(date.getFullYear(), date.getMonth(), date.getDate());
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
          }
          markCurrentCalendarDay(row, dayKey, todayKey);

          dateLabel.className = "diary-view-date-label";
          dateLabel.dataset.themePart = isWeekend ? "weekendDayHeader" : "dayHeader";
          appendCalendarDateParts(dateLabel, item, date, {
               weekdayLabelFormat,
               monthDisplay,
               todayKey
          });

          dayText.className = "calendar-day-text diary-view-day-text";
          dayText.dataset.themePart = "dayNotes";
          dayText.dataset.dayKey = dayKey;
          dayText.setAttribute("contenteditable", "false");
          dayText.textContent = dayNotes[dayKey] || "";
          applyCalendarDayTextStyle(item, dayText);
          dayText.addEventListener("input", () => updateCalendarDayTextOverflow(dayText));
          dayText.addEventListener("paste", handlePlainTextPaste);
          dayText.addEventListener("dblclick", (event) => {
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
               if (typeof keyboardMode !== "undefined" && keyboardMode !== "interact") {
                    return;
               }

               event.preventDefault();
               event.stopPropagation();
               startCalendarDayTextEditing(dayText, item);
          });
          row.addEventListener("click", (event) => {
               if (shouldSkipNextItemClick) {
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
               if (shouldSkipNextItemClick) {
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
     const weekdayLabelFormat = normalizeWeekdayLabelFormat(item.dataset.weekdayLabelFormat);
     const monthDisplay = item.dataset.monthDisplay || "full";
     const isDayView = item.dataset.itemType === "day-view";
     const visibleDays = isDayView ? 1 : clamp(Number(item.dataset.visibleDays) || 7, 1, 7);
     const timeIncrement = Number(item.dataset.timeIncrement) || 30;
     const startTime = item.dataset.startTime || "00:00";
     const timeFormat = item.dataset.timeFormat || "24";
     const timeVisible = item.dataset.timeVisible !== "false";
     const shareWeekends = item.dataset.shareWeekends === "true";
     const startMinutes = parseTimeValue(startTime);
     const slotCount = getWeeklyVisibleSlotCount(item);
     const weekStartDate = getWeeklyViewStartDate(item);
     const dayNotes = getCalendarDayNotes(item);
     const displayColumns = isDayView
          ? [{ type: "day", dates: [weekStartDate] }]
          : getWeeklyDisplayColumns(weekStartDate, visibleDays, shareWeekends);
     const timeColumn = timeVisible ? 0 : -1;
     const dayColumnStart = timeVisible ? 1 : 0;
     const columnCount = displayColumns.length + dayColumnStart;
     const todayKey = getTodayCalendarDayKey();

     if (!calendar) {
          calendar = document.createElement("div");
          calendar.className = "weekly-view";
          item.append(calendar);
     }

     calendar.replaceChildren();
     calendar.style.setProperty("--weekly-slot-count", String(slotCount));
     calendar.style.setProperty("--weekly-row-count", String(slotCount + 1));
     calendar.style.setProperty("--weekly-day-count", String(displayColumns.length));
     calendar.style.setProperty("--weekly-visible-column-units", String((timeVisible ? 1 : 0) + (isDayView ? 7 : displayColumns.length * 5)));
     calendar.style.gridTemplateColumns = [
          ...(timeVisible ? ["var(--weekly-column-cell-width, 12px)"] : []),
          `repeat(${displayColumns.length}, minmax(calc(var(--weekly-column-cell-width, 12px) * ${isDayView ? 7 : 5}), 1fr))`
     ].join(" ");
     calendar.classList.remove("has-week-numbers", "has-week-number-outlines");
     calendar.classList.toggle("has-time-column", timeVisible);
     calendar.classList.remove("has-title-row");
     calendar.classList.add("no-title-row");

     for (let row = 0; row < slotCount + 1; row += 1) {
          const calendarRow = row;

          for (let column = 0; column < columnCount; column += 1) {
               const cell = document.createElement("span");
               const dayIndex = column - dayColumnStart;
               const displayColumn = column + 1;

               cell.className = "weekly-view-cell";
               cell.dataset.themePart = "timeSlot";
               cell.style.gridRow = String(row + 1);
               cell.style.gridColumn = String(displayColumn);

               if (calendarRow === 0 && column === timeColumn) {
                    cell.classList.add("weekly-view-time-heading");
                    cell.dataset.themePart = "timeLabel";
               } else if (calendarRow === 0) {
                    const displayColumn = displayColumns[dayIndex];

                    cell.classList.add("weekly-view-date", "dayCell", "dayName");
                    cell.dataset.themePart = "dayHeader";
                    if (displayColumn.type === "shared-weekend") {
                         cell.classList.add("weekly-view-shared-weekend");
                         cell.dataset.themePart = "weekendDayHeader";
                    }
                    if (displayColumn.dates.some((date) => date.getDay() === 0 || date.getDay() === 6)) {
                         cell.classList.add("weekly-view-weekend");
                         cell.dataset.themePart = "weekendDayHeader";
                    }
                    cell.dataset.dayKey = displayColumn.dates.map((date) => getCalendarDayKey(date.getFullYear(), date.getMonth(), date.getDate())).join(",");
                    markCurrentCalendarDay(cell, displayColumn.dates.map((date) => getCalendarDayKey(date.getFullYear(), date.getMonth(), date.getDate())), todayKey);
                    displayColumn.dates.slice(0, 1).forEach((date) => {
                         const dateLabel = document.createElement("span");

                         dateLabel.className = "weekly-view-date-label";
                         appendCalendarDateParts(dateLabel, item, date, {
                              weekdayLabelFormat,
                              monthDisplay,
                              todayKey
                         });
                         cell.append(dateLabel);
                    });
               } else if (column === timeColumn) {
                    const timeMinutes = startMinutes + ((calendarRow - 1) * timeIncrement);

                    cell.classList.add("weekly-view-time");
                    cell.dataset.themePart = "timeLabel";
                    cell.textContent = shouldShowWeeklyTimeLabel(timeMinutes, timeIncrement) ? formatWeeklyTimeLabel(timeMinutes, timeFormat) : "";
               } else {
                    const displayColumn = displayColumns[dayIndex];
                    const slotMinutes = startMinutes + ((calendarRow - 1) * timeIncrement);
                    const primaryDate = displayColumn.dates[0];
                    const slotKey = displayColumn.type === "shared-weekend"
                         ? `${displayColumn.dates.map((date) => getCalendarDayKey(date.getFullYear(), date.getMonth(), date.getDate())).join("+")}T${formatMinutesAsTime(slotMinutes)}`
                         : getWeeklySlotKey(primaryDate, slotMinutes);
                    const slotText = document.createElement("div");
                    const isSharedWeekendLabelRow = displayColumn.type === "shared-weekend" && calendarRow === 1 + Math.floor(slotCount / 2);

                    cell.classList.add("weekly-view-slot");
                    cell.dataset.themePart = "timeSlot";
                    if (displayColumn.type === "shared-weekend") {
                         cell.classList.add("weekly-view-shared-weekend");
                         cell.dataset.themePart = "weekendTimeSlot";
                    }
                    if (displayColumn.dates.some((date) => date.getDay() === 0 || date.getDay() === 6)) {
                         cell.classList.add("weekly-view-weekend");
                         cell.dataset.themePart = "weekendTimeSlot";
                    }
                    cell.classList.add("dayCell");
                    cell.dataset.dayKey = slotKey;
                    markCurrentCalendarDay(cell, displayColumn.dates.map((date) => getCalendarDayKey(date.getFullYear(), date.getMonth(), date.getDate())), todayKey);
                    if (isSharedWeekendLabelRow) {
                         const sundayDate = displayColumn.dates[1];
                         const sundayMarker = document.createElement("span");

                         sundayMarker.className = "weekly-view-date-label weekly-view-sunday-mid-marker";
                         sundayMarker.dataset.themePart = "weekendDayHeader";
                         appendCalendarDateParts(sundayMarker, item, sundayDate, {
                              weekdayLabelFormat,
                              monthDisplay,
                              todayKey
                         });
                         cell.append(sundayMarker);
                    } else {
                         slotText.className = "calendar-day-text weekly-view-slot-text";
                         slotText.dataset.themePart = "dayNotes";
                         slotText.dataset.dayKey = slotKey;
                         slotText.setAttribute("contenteditable", "false");
                         slotText.textContent = dayNotes[slotKey] || dayNotes[getWeeklySlotKey(primaryDate, slotMinutes)] || "";
                         applyCalendarDayTextStyle(item, slotText);
                         slotText.addEventListener("input", () => updateCalendarDayTextOverflow(slotText));
                         slotText.addEventListener("paste", handlePlainTextPaste);
                         slotText.addEventListener("dblclick", (event) => {
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
     applyThemeToWidget(item);
}

function refreshRelativeCalendarWidgets() {
     getAllPlannerItems()
          .filter((item) => isCalendarItem(item) && item.dataset.dateMode === "relative")
          .forEach((item) => {
               renderMiniMonth(item);
               updateCalendarGridMetrics(item, getItemPage(item), getItemBox(item));
               updatePerpetualCalendarGridMetrics(item, getItemPage(item), getItemBox(item));
          });
}

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
          const dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()];

          option.value = String(day);
          option.textContent = `${String(day).padStart(2, "0")} ${dayName}`;
          select.append(option);
     }
     select.value = String(nextDay);
}

function normalizeCalendarTitleVisible(value) {
     return value === "false" || value === false ? "false" : "true";
}

function getVisibleCalendarDisplay(nextDisplay, currentDisplay, fallback = "full") {
     if (nextDisplay && nextDisplay !== "none") {
          return nextDisplay;
     }

     if (currentDisplay && currentDisplay !== "none") {
          return currentDisplay;
     }

     return fallback;
}

function setCalendarWidgetSettings(item, settings = {}) {
     const today = new Date();
     const defaultDateSettings = typeof getPlannerDefaultDateSettings === "function" ? getPlannerDefaultDateSettings() : {};
     const previousDateMode = item.dataset.dateMode || "fixed";
     const nextDateMode = (settings.dateMode || item.dataset.dateMode) === "relative" ? "relative" : "fixed";
     const weekNumberFormat = getWeekNumberFormatFromSettings(settings, item);
     const titleVisible = settings.titleVisible !== undefined
          ? normalizeCalendarTitleVisible(settings.titleVisible)
          : (item.dataset.calendarTitleVisible || (item.dataset.monthDisplay === "none" && item.dataset.yearDisplay === "none" ? "false" : "true"));

     item.dataset.weekNumberFormat = weekNumberFormat;
     item.dataset.weekNumbers = weekNumberFormat === "off" ? "false" : "true";
     item.dataset.weekStart = settings.weekStart || item.dataset.weekStart || defaultDateSettings.weekStart || "monday";
     item.dataset.dateOrder = normalizeDateOrder(settings.dateOrder || item.dataset.dateOrder || defaultDateSettings.dateOrder).join(",");
     item.dataset.dateYearFormat = normalizeCalendarDateYearFormat(settings.yearFormat || settings.dateYearFormat || item.dataset.dateYearFormat || defaultDateSettings.yearFormat);
     item.dataset.dateMonthFormat = normalizeCalendarDateMonthFormat(settings.monthFormat || settings.dateMonthFormat || item.dataset.dateMonthFormat || defaultDateSettings.monthFormat);
     item.dataset.dateDayFormat = normalizeCalendarDateDayFormat(settings.dayFormat || settings.dateDayFormat || item.dataset.dateDayFormat || defaultDateSettings.dayFormat);
     item.dataset.weekdayLabelFormat = item.dataset.dateDayFormat === "full" ? "full" : "ddd";
     item.dataset.dateMode = nextDateMode;
     item.dataset.dateUnit = getCalendarRelativeDateUnit(item);
     item.dataset.dateOffset = clampRelativeDateOffset(settings.dateOffset ?? (nextDateMode === "relative" && previousDateMode !== "relative" ? "0" : item.dataset.dateOffset ?? "0"), item.dataset.dateUnit);
     item.dataset.calendarTitleVisible = titleVisible;
     item.dataset.monthDisplay = getVisibleCalendarDisplay(settings.monthDisplay, item.dataset.monthDisplay, "full");
     item.dataset.monthVisible = item.dataset.monthDisplay === "none" ? "false" : "true";
     item.dataset.month = settings.month || item.dataset.month || String(today.getMonth());
     item.dataset.yearDisplay = getVisibleCalendarDisplay(settings.yearDisplay, item.dataset.yearDisplay, "full");
     item.dataset.yearVisible = item.dataset.yearDisplay === "none" ? "false" : "true";
     item.dataset.year = settings.year || item.dataset.year || String(today.getFullYear());
     item.dataset.startDay = settings.startDay || item.dataset.startDay || "1";
     item.dataset.visibleDays = settings.visibleDays || item.dataset.visibleDays || "7";
     item.dataset.startDay = String(clamp(Number(item.dataset.startDay) || 1, 1, getCalendarDaysInMonth(Number(item.dataset.year), Number(item.dataset.month))));
     item.dataset.timeIncrement = settings.timeIncrement || item.dataset.timeIncrement || "30";
     item.dataset.startTime = settings.startTime || item.dataset.startTime || "00:00";
     item.dataset.timeFormat = normalizeCalendarTimeFormat(settings.timeFormat || item.dataset.timeFormat || defaultDateSettings.timeFormat || "24");
     item.dataset.timeVisible = settings.timeVisible ?? item.dataset.timeVisible ?? "true";
     item.dataset.shareWeekends = settings.shareWeekends ?? item.dataset.shareWeekends ?? "false";
     renderMiniMonth(item);
     updateCalendarGridMetrics(item, getItemPage(item), getItemBox(item));
     updatePerpetualCalendarGridMetrics(item, getItemPage(item), getItemBox(item));

     const controls = getWidgetPanel(item) || item;
     const weekNumberSelect = controls.querySelector("[data-widget-control='week-number-format']");
     const weekStartSelect = controls.querySelector("[data-widget-control='week-start']");
     const weekdayLabelSelect = controls.querySelector("[data-widget-control='weekday-label-format']");
     const dateModeSelect = controls.querySelector("[data-widget-control='date-mode']");
     const dateOffsetSelect = controls.querySelector("[data-widget-control='date-offset']");
     const displayMonthSelect = controls.querySelector("[data-widget-control='display-month']");
     const displayYearSelect = controls.querySelector("[data-widget-control='display-year']");
     const displayDateModeSelect = controls.querySelector("[data-widget-control='display-date-mode']");
     const displayDaySelect = controls.querySelector("[data-widget-control='display-day']");
     const displayWeekNumberSelect = controls.querySelector("[data-widget-control='display-week-number']");
     const displayTitleVisibleSelect = controls.querySelector("[data-widget-control='display-title-visible']");
     const displayWeekStartSelect = controls.querySelector("[data-widget-control='display-week-start']");
     const titleVisibleInput = controls.querySelector("[data-widget-control='calendar-title-visible']");
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

     if (displayWeekNumberSelect) {
          displayWeekNumberSelect.value = item.dataset.weekNumberFormat === "off" ? "off" : "on";
     }

     if (displayTitleVisibleSelect) {
          displayTitleVisibleSelect.value = item.dataset.calendarTitleVisible !== "false" ? "true" : "false";
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

     if (dateOffsetSelect) {
          populateRelativeDateOffsetSelect(dateOffsetSelect, item.dataset.dateUnit, item.dataset.dateOffset);
     }

     if (titleVisibleInput) {
          titleVisibleInput.checked = item.dataset.calendarTitleVisible !== "false";
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
     syncStartDayOptions(displayDaySelect, Number(item.dataset.year), Number(item.dataset.month), item.dataset.startDay);
     syncCalendarDisplayDateControls(item, displayYearSelect, displayMonthSelect);

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

     const rebuiltSelects = new Set([dateOffsetSelect, startDaySelect, displayDaySelect, displayYearSelect, displayMonthSelect].filter(Boolean));

     rebuiltSelects.forEach(syncCustomSelect);
     controls.querySelectorAll("select").forEach((select) => {
          if (!rebuiltSelects.has(select)) {
               updateCustomSelectDisplay(select);
          }
     });
}
