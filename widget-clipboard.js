// Copy, Paste, Duplicate, And Delete Items
function copyItemConfiguration(source, target) {
  setItemStyle(target, {
    fillColor: source.dataset.fillColor,
    borderColor: source.dataset.borderColor,
    borderWidth: source.dataset.borderWidth,
    borderEnabled: source.dataset.borderEnabled,
  });
  if (source.dataset.themeMode) {
    target.dataset.themeMode = source.dataset.themeMode;
  }
  if (isPageFlagItem(source) && isPageFlagItem(target)) {
    target.dataset.pageFlagSide =
      source.dataset.pageFlagSide === "left" ? "left" : "right";
  }
  setStickerTextSettings(target, {
    enabled: source.dataset.textEnabled,
    content: isTocItem(source)
      ? undefined
      : getStickerTextElement(source)
        ? getStickerTextElement(source).textContent
        : "",
    size: source.dataset.textSize,
    font: source.dataset.textFont,
    color: source.dataset.textColor,
    bold: source.dataset.textBold,
    italic: source.dataset.textItalic,
    underline: source.dataset.textUnderline,
    strike: source.dataset.textStrike,
    align: source.dataset.textAlign,
    yAlign: source.dataset.textYAlign,
    lineHeight: source.dataset.textLineHeight,
  });
  if (isCalendarItem(source)) {
    setCalendarWidgetSettings(target, {
      weekNumbers: source.dataset.weekNumbers,
      weekNumberFormat: source.dataset.weekNumberFormat,
      weekStart: source.dataset.weekStart,
      weekdayLabelFormat: source.dataset.weekdayLabelFormat,
      dateOrder: source.dataset.dateOrder,
      yearFormat: source.dataset.dateYearFormat,
      monthFormat: source.dataset.dateMonthFormat,
      dayFormat: source.dataset.dateDayFormat,
      dateMode: source.dataset.dateMode,
      dateOffset: source.dataset.dateOffset,
      titleVisible: source.dataset.calendarTitleVisible,
      monthDisplay: source.dataset.monthDisplay,
      monthVisible: source.dataset.monthVisible,
      month: source.dataset.month,
      yearDisplay: source.dataset.yearDisplay,
      yearVisible: source.dataset.yearVisible,
      year: source.dataset.year,
      startDay: source.dataset.startDay,
      visibleDays: source.dataset.visibleDays,
      diaryLayout: source.dataset.diaryLayout,
      diaryMonthYearVisible: source.dataset.diaryMonthYearVisible,
      diaryTitleLines: source.dataset.diaryTitleLines,
      timeIncrement: source.dataset.timeIncrement,
      startTime: source.dataset.startTime,
      timeFormat: source.dataset.timeFormat,
      timeVisible: source.dataset.timeVisible,
      shareWeekends: source.dataset.shareWeekends,
      weekNotes: source.dataset.weekNotes,
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
        strike: source.dataset.dayTextStrike,
        align: source.dataset.dayTextAlign,
        yAlign: source.dataset.dayTextYAlign,
        lineHeight: source.dataset.dayTextLineHeight,
      });
    }
    renderMiniMonth(target);
  }
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
        sourcePageNumber: Number.isFinite(pageNumber) ? pageNumber : null,
      };
    }),
  };
  updateClipboardControls();
  return true;
}

function getClipboardTargetPage(entry) {
  const preferredSide = entry.sourcePageId || getFocusedPageSide();
  const preferredPage =
    pages.find((page) => getPageId(page) === preferredSide) || null;

  if (
    preferredPage &&
    isPageNumberAvailable(getPageNumberForPage(preferredPage))
  ) {
    return preferredPage;
  }

  const focusedSide = getFocusedPageSide();
  const focusedPage =
    pages.find((page) => getPageId(page) === focusedSide) || null;

  if (focusedPage && isPageNumberAvailable(getPageNumberForPage(focusedPage))) {
    return focusedPage;
  }

  return (
    pages.find((page) => isPageNumberAvailable(getPageNumberForPage(page))) ||
    null
  );
}

function getClipboardPasteBox(entry, page) {
  const box = entry.box;

  if (!page) {
    const offset = 16 * Math.max(1, plannerClipboard.pasteCount + 1);

    return {
      ...box,
      x: box.x + offset,
      y: box.y + offset,
    };
  }

  const grid = getGridSize(page);
  const targetPageNumber = getPageNumberForPage(page);
  const isOriginalPage = targetPageNumber === entry.sourcePageNumber;
  const offset =
    grid.x *
    (isOriginalPage
      ? plannerClipboard.pasteCount + 1
      : plannerClipboard.pasteCount);

  return {
    ...box,
    x: clamp(box.x + offset, 0, page.clientWidth - box.width),
    y: clamp(box.y + offset, 0, page.clientHeight - box.height),
  };
}

function pasteClipboardItem(entry, copiedGroupIds) {
  const type = normalizePlannerItemType(entry.data.type || "sticker");

  if (!itemGridUnits[type]) {
    return null;
  }

  const duplicate = makePlannerItem(type);
  const itemData = {
    ...entry.data,
    groupId: null,
  };

  plannerDesk.append(duplicate);
  restorePlannerItemSettings(duplicate, itemData);
  delete duplicate.dataset.groupId;

  if (entry.data.placement === "page" || entry.sourcePageId) {
    const page = getClipboardTargetPage(entry);

    if (!page) {
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
  return Boolean(
    target?.closest?.("input, textarea, select, [contenteditable='true']"),
  );
}

function handleClipboardShortcut(event) {
  if (
    activeAction ||
    isTextInputShortcutTarget(event.target) ||
    !(event.metaKey || event.ctrlKey) ||
    event.altKey
  ) {
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
    return duplicateSelectedItems();
  }

  const page = getItemPage(item);

  const box = getItemBox(item);
  const duplicate = makePlannerItem(item.dataset.itemType || "sticker");
  const parent = plannerDesk;
  const nextBox = page
    ? {
        ...box,
        x: clamp(box.x + getGridSize(page).x, 0, page.clientWidth - box.width),
        y: clamp(
          box.y + getGridSize(page).y,
          0,
          page.clientHeight - box.height,
        ),
      }
    : {
        ...box,
        x: box.x + 16,
        y: box.y + 16,
      };

  parent.append(duplicate);
  copyItemConfiguration(item, duplicate);
  markGridState(duplicate, Boolean(page), page);
  setItemBox(duplicate, nextBox);
  selectItem(duplicate);
  notifyTemplateChanged();
  return [duplicate];
}

function duplicateSelectedItems() {
  const copies = [];
  const copiedGroupIds = new Map();

  selectedItems.forEach((item) => {
    const page = getItemPage(item);

    const box = getItemBox(item);
    const duplicate = makePlannerItem(item.dataset.itemType || "sticker");
    const parent = plannerDesk;
    const offset = page ? getGridSize(page).x : 16;
    const nextBox = page
      ? {
          ...box,
          x: clamp(box.x + offset, 0, page.clientWidth - box.width),
          y: clamp(box.y + offset, 0, page.clientHeight - box.height),
        }
      : {
          ...box,
          x: box.x + offset,
          y: box.y + offset,
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
    return [];
  }

  selectItems(copies);
  notifyTemplateChanged();
  return copies;
}

function incrementPlainNumberText(value) {
  const text = String(value || "").trim();

  if (!/^-?\d+$/.test(text)) {
    return null;
  }

  return String(Number(text) + 1);
}

function incrementCalendarSequenceDate(item) {
  if (!isCalendarItem(item)) {
    return false;
  }

  if (item.dataset.dateMode === "relative") {
    setCalendarWidgetSettings(item, {
      dateMode: "relative",
      dateOffset: String((Number(item.dataset.dateOffset) || 0) + 1),
    });
    return true;
  }

  const currentMonth = Number(item.dataset.month);
  const currentYear = Number(item.dataset.year);
  const month = Number.isFinite(currentMonth)
    ? currentMonth
    : new Date().getMonth();
  const year = Number.isFinite(currentYear)
    ? currentYear
    : new Date().getFullYear();
  const nextMonth = (month + 1) % 12;
  const nextYear = year + (nextMonth === 0 ? 1 : 0);

  setCalendarWidgetSettings(item, {
    dateMode: "fixed",
    month: String(nextMonth),
    year: String(nextYear),
  });
  return true;
}

function incrementItemPrimaryText(item) {
  if (isCalendarItem(item)) {
    return incrementCalendarSequenceDate(item);
  }

  const stickerText = getStickerTextElement(item);
  const stickerNextText =
    stickerText && item.dataset.textEnabled === "true"
      ? incrementPlainNumberText(stickerText.textContent)
      : null;

  if (stickerNextText !== null) {
    setStickerTextSettings(item, {
      enabled: "true",
      content: stickerNextText,
    });
    return true;
  }

  const calendarText = item.querySelector(".calendar-day-text");
  const calendarNextText = calendarText
    ? incrementPlainNumberText(calendarText.textContent)
    : null;

  if (calendarNextText === null) {
    return false;
  }

  calendarText.textContent = calendarNextText;
  if (calendarText.dataset.dayKey && typeof setCalendarDayNote === "function") {
    setCalendarDayNote(item, calendarText.dataset.dayKey, calendarNextText);
  }
  if (typeof updateCalendarDayTextOverflow === "function") {
    updateCalendarDayTextOverflow(calendarText);
  }
  return true;
}

function sequenceItem(item) {
  const copies = duplicateItem(item);

  copies.forEach(incrementItemPrimaryText);
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
