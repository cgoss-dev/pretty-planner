// Drag Items, Resize Items, And Move The Control Panel
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

  if (
    item.dataset.itemType === "mini-month" ||
    item.dataset.itemType === "weekly-view" ||
    item.dataset.itemType === "full-month"
  ) {
    return "";
  }

  if (selectedItems.size !== 1) {
    return "";
  }

  if (item.dataset.groupId) {
    return "";
  }

  if (
    item.dataset.itemType === "perpetual-calendar" &&
    event.target.closest(".perpetual-calendar-title")
  ) {
    return "";
  }

  const rect = item.getBoundingClientRect();
  const isLeftEdge =
    event.clientX >= rect.left - resizeEdgeSize &&
    event.clientX <= rect.left + resizeEdgeSize;
  const isRightEdge =
    event.clientX >= rect.right - resizeEdgeSize &&
    event.clientX <= rect.right + resizeEdgeSize;
  const isTopEdge =
    event.clientY >= rect.top - resizeEdgeSize &&
    event.clientY <= rect.top + resizeEdgeSize;
  const isBottomEdge =
    event.clientY >= rect.bottom - resizeEdgeSize &&
    event.clientY <= rect.bottom + resizeEdgeSize;

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

  return "";
}

function getMovedBox(
  item,
  page,
  clientX,
  clientY,
  offsetX,
  offsetY,
  shouldClamp = true,
) {
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
  const maxX = pageRect.width / viewZoom - grid.x * pageStickDepth;
  const maxY = pageRect.height / viewZoom - grid.y * pageStickDepth;

  return {
    ...current,
    x: shouldClamp ? clamp(nextX, minX, maxX) : nextX,
    y: shouldClamp ? clamp(nextY, minY, maxY) : nextY,
  };
}

function getResizedPerpetualCalendarBox(
  item,
  page,
  clientX,
  current,
  mode,
  grid,
  origin,
  pageRect,
  viewZoom,
) {
  const resizeLeft = mode.includes("left");
  const resizeRight = mode.includes("right");
  const minWidth = grid.x * getPerpetualCalendarMinGridColumns();
  const fixedHeight = grid.y * getPerpetualCalendarMaxGridRows();
  const right = current.x + current.width;
  const pointerX = snapToGridOrigin(
    (clientX - pageRect.left) / viewZoom,
    origin.x,
    grid.x,
  );
  let nextX = current.x;
  let nextWidth = current.width;

  if (resizeLeft) {
    nextX = clamp(
      pointerX,
      grid.x * pageStickDepth - current.width,
      right - minWidth,
    );
    nextWidth = right - nextX;
  } else if (resizeRight) {
    const nextRight = clamp(
      pointerX,
      current.x + minWidth,
      pageRect.width / viewZoom - grid.x * pageStickDepth + current.width,
    );

    nextWidth = nextRight - current.x;
  }

  nextWidth = Math.max(minWidth, Math.round(nextWidth / grid.x) * grid.x);

  return clampPerpetualCalendarBox(item, page, {
    ...current,
    x: resizeLeft ? right - nextWidth : nextX,
    width: nextWidth,
    height: fixedHeight,
  });
}

function getItemMinGridHeight(item) {
  if (isTocItem(item)) {
    return getTocMinGridRows();
  }

  if (item.dataset.itemType === "weekly-view") {
    return getScheduleViewFixedGridRows();
  }

  if (item.dataset.itemType === "perpetual-calendar") {
    return getPerpetualCalendarMaxGridRows();
  }

  if (item.dataset.itemType === "diary-view") {
    return getDiaryViewMinGridRows(item);
  }

  if (isFullPageCalendarType(item.dataset.itemType)) {
    return 14;
  }

  return 2;
}

function getResizedBox(item, page, clientX, clientY, mode) {
  const current = getItemBox(item);

  if (
    item.dataset.itemType === "mini-month" ||
    item.dataset.itemType === "weekly-view" ||
    item.dataset.itemType === "full-month"
  ) {
    return current;
  }

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
    const nextLeft = resizeLeft
      ? Math.min(pointerX, right - minSize)
      : current.x;
    const nextTop = resizeTop
      ? Math.min(pointerY, bottom - minSize)
      : current.y;
    const nextRight = resizeRight
      ? Math.max(pointerX, current.x + minSize)
      : right;
    const nextBottom = resizeBottom
      ? Math.max(pointerY, current.y + minSize)
      : bottom;

    return {
      ...current,
      x: nextLeft,
      y: nextTop,
      width: nextRight - nextLeft,
      height: nextBottom - nextTop,
    };
  }

  const pageRect = page.getBoundingClientRect();
  const viewZoom = getViewZoom();
  const grid = getGridSize(page);
  const origin = getGridSnapOrigin(page);
  if (item.dataset.itemType === "perpetual-calendar") {
    return getResizedPerpetualCalendarBox(
      item,
      page,
      clientX,
      current,
      mode,
      grid,
      origin,
      pageRect,
      viewZoom,
    );
  }

  const minGridWidth = isTocItem(item)
    ? getTocMinGridColumns()
    : item.dataset.itemType === "perpetual-calendar"
      ? getPerpetualCalendarMinGridColumns()
      : item.dataset.itemType === "diary-view"
        ? getDiaryViewMinGridColumns(item)
        : item.dataset.itemType === "full-month"
          ? getFullMonthGridUnits(item).width
          : isTimeGridCalendarType(item.dataset.itemType)
            ? getWeeklyVerticalMinGridColumns(item)
            : isFullPageCalendarType(item.dataset.itemType)
              ? 16
              : 2;
  const minGridHeight = getItemMinGridHeight(item);
  const minWidth = grid.x * minGridWidth;
  const minHeight = grid.y * minGridHeight;
  const maxHeight =
    item.dataset.itemType === "perpetual-calendar"
      ? grid.y * getPerpetualCalendarMaxGridRows()
      : item.dataset.itemType === "weekly-view"
        ? grid.y * getScheduleViewFixedGridRows()
        : item.dataset.itemType === "diary-view"
          ? grid.y * getDiaryViewMaxGridRows()
          : Infinity;
  const right = current.x + current.width;
  const bottom = current.y + current.height;
  const pointerX = snapToGridOrigin(
    (clientX - pageRect.left) / viewZoom,
    origin.x,
    grid.x,
  );
  const pointerY = snapToGridOrigin(
    (clientY - pageRect.top) / viewZoom,
    origin.y,
    grid.y,
  );
  const nextLeft = resizeLeft
    ? clamp(pointerX, grid.x * pageStickDepth - current.width, right - minWidth)
    : current.x;
  const nextTop = resizeTop
    ? clamp(
        pointerY,
        Math.max(grid.y * pageStickDepth - current.height, bottom - maxHeight),
        bottom - minHeight,
      )
    : current.y;
  const nextRight = resizeRight
    ? clamp(
        pointerX,
        current.x + minWidth,
        pageRect.width / viewZoom - grid.x * pageStickDepth + current.width,
      )
    : right;
  const nextBottom = resizeBottom
    ? clamp(
        pointerY,
        current.y + minHeight,
        Math.min(
          pageRect.height / viewZoom - grid.y * pageStickDepth + current.height,
          current.y + maxHeight,
        ),
      )
    : bottom;

  const resizedBox = {
    ...current,
    x: nextLeft,
    y: nextTop,
    width: nextRight - nextLeft,
    height: nextBottom - nextTop,
  };

  return resizedBox;
}

function getResizeClass(resizeMode) {
  if (resizeMode === "top-left" || resizeMode === "bottom-right") {
    return "is-resize-nwse";
  }

  if (resizeMode === "top-right" || resizeMode === "bottom-left") {
    return "is-resize-nesw";
  }

  return "";
}

function getResizeCursorValue(resizeMode) {
  if (resizeMode === "top-left" || resizeMode === "bottom-right") {
    return "nwse-resize";
  }

  if (resizeMode === "top-right" || resizeMode === "bottom-left") {
    return "nesw-resize";
  }

  return "";
}

function setResizeCursor(item, resizeMode) {
  item.classList.remove("is-resize-nwse", "is-resize-nesw");

  const resizeClass = getResizeClass(resizeMode);

  if (resizeClass) {
    item.classList.add(resizeClass);
  }
}

function clearSelectedResizeCursors() {
  selectedItems.forEach((item) => setResizeCursor(item, ""));
}

function updateDeskResizeCursor(event) {
  if (
    activeAction ||
    !selectedItem ||
    selectedItems.size !== 1 ||
    event.target.closest(".control-panel, .widget-panel, .page-snap-controls")
  ) {
    plannerDesk.style.cursor = "";
    clearSelectedResizeCursors();
    return;
  }

  const resizeMode = getResizeMode(selectedItem, event);

  setResizeCursor(selectedItem, resizeMode);
  plannerDesk.style.cursor = getResizeCursorValue(resizeMode);
}

function getControlPanelBox() {
  const deskRect = plannerDesk.getBoundingClientRect();
  const rect = controlPanel.getBoundingClientRect();
  const width = rect.width;
  const height = Number(controlPanel.dataset.height) || rect.height;
  const x = rect.left - deskRect.left;
  const y = rect.top - deskRect.top;

  return {
    x,
    y,
    width,
    height,
  };
}

function setControlPanelBox(box) {
  controlPanel.dataset.height = String(box.height);
  controlPanel.dataset.userPositioned = "true";
  controlPanel.style.left = `${box.x}px`;
  controlPanel.style.top = `${box.y}px`;
  controlPanel.style.height = `${box.height}px`;
}

function getMovedControlPanelBox(clientX, clientY) {
  const deskRect = plannerDesk.getBoundingClientRect();
  const current = activeAction.box;
  const rawX = clientX - deskRect.left - activeAction.offsetX;
  const minX = 12;
  const maxX = deskRect.width - current.width - 12;
  const x = clamp(rawX, minX, maxX);

  return {
    ...current,
    x,
    y: clamp(
      clientY - deskRect.top - activeAction.offsetY,
      8,
      Math.max(8, deskRect.height - current.height - 8),
    ),
  };
}

function startControlPanelMove(event) {
  if (
    controlPanel.closest("[data-planner-main-menu]") ||
    activeAction ||
    event.button !== 0 ||
    event.target.closest(
      "button, input, select, textarea, [contenteditable='true'], .custom-select",
    )
  ) {
    return;
  }

  const box = getControlPanelBox();

  event.preventDefault();
  activeAction = {
    type: "control-panel-move",
    box,
    offsetX: event.clientX - controlPanel.getBoundingClientRect().left,
    offsetY: event.clientY - controlPanel.getBoundingClientRect().top,
    hasMoved: false,
  };
  controlPanel.classList.add("is-dragging");
  try {
    controlPanel.setPointerCapture(event.pointerId);
  } catch {}
  document.addEventListener("pointermove", moveActiveItem, true);
  document.addEventListener("pointerup", endActiveItem, true);
  document.addEventListener("pointercancel", endActiveItem, true);
}

function getControlPanelVerticalResizeMode(event) {
  // Main menu is a floating panel now, so it no longer has a drawer resize edge
  return "";
}

function getControlPanelHeightBounds() {
  const pageRect = pages[0].getBoundingClientRect();
  const notebookRect = notebook.getBoundingClientRect();
  const deskRect = plannerDesk.getBoundingClientRect();
  const measuredHeight = Math.max(pageRect.height, notebookRect.height);
  const fullHeight =
    measuredHeight > 220 ? measuredHeight : deskRect.height * 0.68;
  const gridRowHeight = Math.max(fullHeight / plannerConfig.gridRows, 8);
  const maxHeight = Math.max(300, Math.min(fullHeight, deskRect.height * 0.78));

  return {
    min: Math.min(300, maxHeight),
    max: maxHeight,
    grid: gridRowHeight,
  };
}

function getResizedControlPanelBox(clientY) {
  const deskRect = plannerDesk.getBoundingClientRect();
  const current = activeAction.box;
  const bounds = getControlPanelHeightBounds();
  const bottom = deskRect.height;
  const pointerY = snap(clientY - deskRect.top, bounds.grid);

  const nextTop = clamp(pointerY, bottom - bounds.max, bottom - bounds.min);

  return {
    ...current,
    y: nextTop,
    height: bottom - nextTop,
  };
}

function startControlPanelResize(event, mode) {
  const box = getControlPanelBox();

  event.preventDefault();
  setControlPanelBox(box);
  activeAction = {
    type: "control-panel-resize",
    box,
    mode,
  };
  controlPanel.classList.add("is-resizing");

  try {
    controlPanel.setPointerCapture(event.pointerId);
  } catch {}
}

function updateItemSizeLabel(item) {
  const label = item.querySelector(".item-size-label");

  if (!label) {
    return;
  }

  const page = getItemPage(item);
  const box = getItemBox(item);
  const width = page
    ? Math.round(box.width / getGridSize(page).x)
    : Math.round(box.width);
  const height = page
    ? Math.round(box.height / getGridSize(page).y)
    : Math.round(box.height);

  label.textContent = `${width} x ${height}`;
}
