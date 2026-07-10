// Calendar widget previews, date helpers, sizing, rendering, and option controls.

// Tiny Preview Pictures In The Widget Tray
function createCalendarSourcePreviewCell(
  row,
  column,
  rows,
  columns,
  classNames = [],
) {
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

function populateCalendarSourcePreviewGrid(
  container,
  {
    columns = 8,
    rows = 8,
    weekNumberColumn = 1,
    timeColumn = 0,
    wkdColumns = [7, 8],
  } = {},
) {
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
        classNames.push(
          isTimeColumn && !isWeekNumberColumn ? "is-tinted" : "is-weekday",
        );
      } else if (isWeekNumberColumn || isTimeColumn) {
        classNames.push("is-tinted");
      } else if (isWkdColumn) {
        classNames.push("is-wkd");
      }

      container.append(
        createCalendarSourcePreviewCell(row, column, rows, columns, classNames),
      );
    }
  }
}

function populateMonthCalendarSourcePreview(
  preview,
  { expanded = false } = {},
) {
  const rows = expanded ? 10 : 8;
  const columns = 8;
  const titleCell = createCalendarSourcePreviewCell(1, 1, rows, columns, [
    "is-title",
  ]);

  preview.classList.add("calendar-source-preview-month");
  preview.classList.toggle("is-max-month-preview", expanded);
  preview.style.gridTemplateColumns = `0.85fr repeat(7, minmax(0, 1fr))`;
  preview.style.gridTemplateRows = expanded
    ? `1.15fr repeat(${rows - 1}, minmax(0, 1fr))`
    : `1.2fr repeat(${rows - 1}, minmax(0, 1fr))`;

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

      preview.append(
        createCalendarSourcePreviewCell(row, column, rows, columns, classNames),
      );
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

      const cell = createCalendarSourcePreviewCell(
        row,
        column,
        rows,
        columns,
        classNames,
      );

      if (column === 1 && row > 1) {
        cell.classList.add("is-time-label");
        cell.textContent = `${row + 4}a`;
      }
      preview.append(cell);
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

      preview.append(
        createCalendarSourcePreviewCell(row, column, rows, columns, classNames),
      );
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

      preview.append(
        createCalendarSourcePreviewCell(row, column, rows, columns, classNames),
      );
    }
  }
}

function populatePerpetualCalendarSourcePreview(preview) {
  const rows = 16;
  const columns = 2;
  const titleCell = document.createElement("span");

  preview.classList.add("calendar-source-preview-list");
  preview.style.gridTemplateColumns = "1fr 4fr";
  preview.style.gridTemplateRows = `1.35fr repeat(${rows - 1}, minmax(0, 1fr))`;
  titleCell.className = "calendar-source-preview-cell is-title";
  titleCell.style.gridRow = "1";
  titleCell.style.gridColumn = "1 / -1";
  preview.append(titleCell);

  for (let row = 2; row <= rows; row += 1) {
    const dayNumber = row - 1;
    const isWeekend = dayNumber % 7 === 6 || dayNumber % 7 === 0;
    const numberCell = createCalendarSourcePreviewCell(row, 1, rows, columns, [
      "is-list-number",
    ]);
    const lineCell = createCalendarSourcePreviewCell(row, 2, rows, columns, [
      "is-list-line",
    ]);

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
      populateMonthCalendarSourcePreview(preview, {
        expanded: type === "full-month",
      });
    } else if (type === "weekly-view") {
      populateWeeklyCalendarSourcePreview(preview);
    } else if (type === "diary-view") {
      populateDiaryCalendarSourcePreview(preview);
    } else {
      populateCalendarSourcePreviewGrid(preview, {
        columns: 8,
        rows: type === "weekly-view" || type === "diary-view" ? 14 : 8,
        timeColumn: type === "weekly-view" ? 1 : 0,
        wkdColumns: [7, 8],
      });
    }
    sourceItem.append(preview);
  });
}

function isCalendarItemType(type) {
  return type === "mini-month" || isFullPageCalendarType(type);
}

function isFullPageCalendarType(type) {
  return (
    type === "full-month" ||
    type === "weekly-view" ||
    type === "diary-view" ||
    type === "perpetual-calendar"
  );
}

function isCalendarItem(item) {
  return isCalendarItemType(item.dataset.itemType);
}

function isTimeGridCalendarType(type) {
  return type === "weekly-view";
}

function isCalendarTextItemType(type) {
  return (
    type === "full-month" ||
    type === "weekly-view" ||
    type === "diary-view" ||
    type === "perpetual-calendar"
  );
}

function isCalendarTextItem(item) {
  return isCalendarTextItemType(item.dataset.itemType);
}
