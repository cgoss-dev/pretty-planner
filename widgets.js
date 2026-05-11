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
