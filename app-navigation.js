// NOTE: Zoom And Which Page You Are Looking At
function applyViewControls(zoomAnchor = null) {
  const zoom = viewZoomLevels[viewZoomIndex];
  const shouldCenterFocusedPage = isSinglePageViewport || viewZoomIndex > 0;

  setRootNumber("--view-zoom", zoom.value);
  setRootNumber("--view-pan-x", "0px");
  setRootNumber("--view-pan-y", "0px");
  syncKeyboardCursorWithFocusedPage();

  if (shouldCenterFocusedPage) {
    syncViewTargetCenter(zoomAnchor);
  } else {
    requestAnimationFrame(() => {
      refreshPageItemViews();
      scheduleKeyboardCursorUpdate();
    });
  }
  scheduleKeyboardCursorUpdate();
}

function syncViewTargetCenter(zoomAnchor = null) {
  window.cancelAnimationFrame(responsiveViewFrame);

  responsiveViewFrame = window.requestAnimationFrame(() => {
    const notebookRect = notebook.getBoundingClientRect();
    const deskRect = plannerDesk.getBoundingClientRect();
    const targetX = notebookRect.left + notebookRect.width / 2;
    const targetY = notebookRect.top + notebookRect.height / 2;
    const currentPanX = getRootPixelValue("--view-pan-x");
    const currentPanY = getRootPixelValue("--view-pan-y");
    const notebookStageY = getRootPixelValue("--notebook-stage-y");

    if (!Number.isFinite(targetX) || !Number.isFinite(targetY)) {
      return;
    }

    const mainMenuRect =
      plannerMainMenu && getComputedStyle(plannerMainMenu).display !== "none"
        ? plannerMainMenu.getBoundingClientRect()
        : null;
    const mainMenuClearance = mainMenuRect
      ? Math.max(0, mainMenuRect.left - deskRect.left)
      : 0;
    const contentLeft =
      mainMenuRect && mainMenuRect.right > deskRect.left
        ? Math.min(mainMenuRect.right + mainMenuClearance, deskRect.right)
        : deskRect.left;
    const deskCenter =
      contentLeft + Math.max(0, deskRect.right - contentLeft) / 2;
    const deskMiddle = deskRect.top + deskRect.height / 2 + notebookStageY;
    const basePanX = deskCenter - (targetX - currentPanX);
    const basePanY = deskMiddle - (targetY - currentPanY);

    setRootNumber("--view-pan-x", `${basePanX + viewPanOffsetX}px`);
    setRootNumber("--view-pan-y", `${basePanY + viewPanOffsetY}px`);

    if (zoomAnchor) {
      const zoomedRect = notebook.getBoundingClientRect();
      const zoomedAnchorX =
        zoomedRect.left + zoomedRect.width * zoomAnchor.ratioX;
      const zoomedAnchorY =
        zoomedRect.top + zoomedRect.height * zoomAnchor.ratioY;

      viewPanOffsetX += zoomAnchor.clientX - zoomedAnchorX;
      viewPanOffsetY += zoomAnchor.clientY - zoomedAnchorY;
      setRootNumber("--view-pan-x", `${basePanX + viewPanOffsetX}px`);
      setRootNumber("--view-pan-y", `${basePanY + viewPanOffsetY}px`);
    }

    requestAnimationFrame(() => {
      refreshPageItemViews();
      scheduleKeyboardCursorUpdate();
    });
  });
}

function getReferencePaperSizeInches() {
  return {
    width: convertLength(
      screenReferencePaper.width,
      screenReferencePaper.unit,
      "in",
    ),
    height: convertLength(
      screenReferencePaper.height,
      screenReferencePaper.unit,
      "in",
    ),
  };
}

function getNotebookWidthFormula() {
  return `${notebookMaxWidth}px`;
}

function syncResponsiveViewportClass() {
  document.body.classList.toggle(
    "is-single-page-viewport",
    isSinglePageViewport,
  );
}

function applyResponsiveViewMode() {
  const nextIsSinglePageViewport = singlePageViewportQuery.matches;

  if (nextIsSinglePageViewport === isSinglePageViewport) {
    syncResponsiveViewportClass();
    if (isSinglePageViewport) {
      applyViewControls();
    }
    return false;
  }

  isSinglePageViewport = nextIsSinglePageViewport;
  syncResponsiveViewportClass();
  resetViewPanOffset();

  applyPlannerConfig();
  applyViewControls();
  return true;
}

function handleWindowResize() {
  applyResponsiveViewMode();
  syncControlPanelSnap();
  customSelectDetails.forEach((dropdown) => updateSelectFocusSpace(dropdown));
  positionColorMatrix();
}

function getZoomAnchor(clientX, clientY) {
  const rect = notebook.getBoundingClientRect();

  if (!rect.width || !rect.height) {
    return null;
  }

  return {
    clientX,
    clientY,
    ratioX: (clientX - rect.left) / rect.width,
    ratioY: (clientY - rect.top) / rect.height,
  };
}

function changeViewZoom(direction, zoomAnchor = null) {
  const step = direction === "in" ? 1 : -1;
  const nextZoomIndex = clamp(
    viewZoomIndex + step,
    0,
    viewZoomLevels.length - 1,
  );

  if (nextZoomIndex === viewZoomIndex) {
    return;
  }

  viewZoomIndex = nextZoomIndex;
  if (direction === "out") {
    resetViewPanOffset();
  }
  applyViewControls(direction === "in" ? zoomAnchor : null);
  showZoomToast();
}

function cycleViewZoom() {
  // NOTE: Cycles through zoom levels with one key, wrapping back to 100% after the closest zoom
  const nextZoomIndex =
    viewZoomIndex >= viewZoomLevels.length - 1 ? 0 : viewZoomIndex + 1;

  if (nextZoomIndex === viewZoomIndex) {
    return;
  }

  viewZoomIndex = nextZoomIndex;
  if (viewZoomIndex === 0) {
    resetViewPanOffset();
  }
  applyViewControls();
  showZoomToast();
}

function showZoomToast() {
  if (!zoomToast) {
    return;
  }

  zoomToast.textContent = viewZoomLevels[viewZoomIndex].label;
  zoomToast.classList.add("is-visible");
  window.clearTimeout(zoomToastTimer);
  zoomToastTimer = window.setTimeout(() => {
    zoomToast.classList.remove("is-visible");
  }, 760);
}

function zoomViewFromWheel(event) {
  if (
    event.target.closest(
      ".sticker-text[contenteditable='true'], .calendar-day-text[contenteditable='true']",
    )
  ) {
    return;
  }

  if (event.target.closest(".control-panel, .widget-panel")) {
    return;
  }

  event.preventDefault();
  wheelZoomDelta += event.deltaY;

  const isWheelNotch = event.deltaMode !== 0 || Math.abs(event.deltaY) >= 32;
  const threshold = event.ctrlKey ? 8 : 32;
  if (Math.abs(wheelZoomDelta) < threshold) {
    return;
  }

  changeViewZoom(
    wheelZoomDelta < 0 ? "in" : "out",
    getZoomAnchor(event.clientX, event.clientY),
  );
  wheelZoomDelta = isWheelNotch ? 0 : wheelZoomDelta % threshold;
}

function resetViewPanOffset() {
  viewPanOffsetX = 0;
  viewPanOffsetY = 0;
}

function getCurrentSpreadPageNumber(side = "left") {
  return PageControls.getCurrentSpreadPageNumber({ currentSpreadIndex, side });
}

function getSpreadCountForPageCount(pageCount) {
  return PageControls.getSpreadCountForPageCount(pageCount);
}

function normalizeNotebookPageCount(pageCount) {
  return PageControls.normalizeNotebookPageCount({
    pageCount,
    initialNotebookPageCount,
    minNotebookPageCount,
    maxNotebookPageCount,
    clamp,
  });
}

function getPageSideForPageNumber(pageNumber) {
  return PageControls.getPageSideForPageNumber(pageNumber);
}

function isPageNumberAvailable(pageNumber) {
  return PageControls.isPageNumberAvailable({ pageNumber, notebookPageCount });
}

function isFinalRightPlaceholderPage(pageNumber) {
  return PageControls.isFinalRightPlaceholderPage({
    pageNumber,
    notebookPageCount,
  });
}

function isPageSideAvailable(side, spreadIndex = currentSpreadIndex) {
  return PageControls.isPageSideAvailable({
    side,
    spreadIndex,
    notebookPageCount,
  });
}

function formatPageNumber(pageNumber) {
  return PageControls.formatPageNumber({ pageNumber, notebookPageCount });
}

function getFocusedPageSide() {
  return PageControls.getFocusedPageSide();
}

function getFocusedPageNumber() {
  return PageControls.getFocusedPageNumber({ currentSpreadIndex });
}

function setNotebookPageCount(pageCount) {
  const pageState = PageControls.getNotebookPageCountState({
    pageCount,
    currentSpreadIndex,
    initialNotebookPageCount,
    minNotebookPageCount,
    maxNotebookPageCount,
    clamp,
  });

  notebookPageCount = pageState.notebookPageCount;
  notebookSpreadCount = pageState.notebookSpreadCount;
  currentSpreadIndex = pageState.currentSpreadIndex;
}

function setFocusedPageNumber(pageNumber) {
  const pageState = PageControls.getFocusedPageState({
    pageNumber,
    notebookPageCount,
    notebookSpreadCount,
    clamp,
  });

  currentSpreadIndex = pageState.currentSpreadIndex;
}

function getItemSpreadIndex(item) {
  return Number(item.dataset.spreadIndex || 0);
}

function setItemSpreadIndex(item, spreadIndex = currentSpreadIndex) {
  item.dataset.spreadIndex = String(
    clamp(Number(spreadIndex) || 0, 0, notebookSpreadCount - 1),
  );
}

function getItemPageNumber(item) {
  return (
    getItemSpreadIndex(item) * 2 + (item.dataset.pageId === "right" ? 1 : 0)
  );
}

function getStoredItemPageNumber(itemData) {
  const spreadIndex = Number(itemData.spreadIndex) || 0;
  const pageId = itemData.page || itemData.pageId || "left";

  return spreadIndex * 2 + (pageId === "right" ? 1 : 0);
}

function setItemPageNumber(item, pageNumber) {
  item.dataset.spreadIndex = String(Math.floor(pageNumber / 2));
  item.dataset.pageId = getPageSideForPageNumber(pageNumber);
}

function updatePageActionButtons() {
  PageControls.updatePageActionButtons({
    focusedPageNumber: getFocusedPageNumber(),
    notebookPageCount,
    minNotebookPageCount,
    maxNotebookPageCount,
    insertPageButton,
    deletePageButton,
    pageCountStatus,
  });
}

function updatePageLabels() {
  PageControls.updatePageLabels({
    pages,
    notebook,
    currentSpreadIndex,
    notebookSpreadCount,
    notebookPageCount,
    getPageId,
    getCurrentSpreadPageNumber,
    isPageNumberAvailable,
    isFinalRightPlaceholderPage,
    formatPageNumber,
  });
}

function updateSpreadItemVisibility() {
  PageControls.updateSpreadItemVisibility({
    items: getAllPlannerItems(),
    currentSpreadIndex,
    notebookPageCount,
    getItemSpreadIndex,
    getItemPageNumber,
    closeItemMenu,
    selectedItems,
    setSelectedItem: (item) => {
      selectedItem = item;
    },
    updateObjectControlsState,
  });
}

function syncNotebookSpread() {
  PageControls.syncNotebookSpread({
    updatePageLabels,
    updateSpreadItemVisibility,
    refreshPageItemViews,
  });
}

function turnNotebookSpread(step) {
  PageControls.turnNotebookSpread({
    step,
    currentSpreadIndex,
    notebookSpreadCount,
    pendingSpreadTurn,
    notebook,
    clamp,
    clearSelection,
    setPendingSpreadTurn: (turn) => {
      pendingSpreadTurn = turn;
    },
    setCurrentSpreadIndex: (spreadIndex) => {
      currentSpreadIndex = spreadIndex;
    },
    resetViewPanOffset,
    syncNotebookSpread,
    applyViewControls,
    notifyTemplateChanged,
  });
}

function jumpNotebookSpread(spreadIndex) {
  const nextSpreadIndex = clamp(
    Number(spreadIndex) || 0,
    0,
    notebookSpreadCount - 1,
  );

  turnNotebookSpread(nextSpreadIndex - currentSpreadIndex);
}

function handlePageTurnKey(event) {
  // NOTE: Uses comma/period for previous/next page, chevrons or Home/End for notebook ends
  const isBookStartKey =
    event.key === "Home" ||
    event.key === "<" ||
    (event.shiftKey && event.code === "Comma");
  const isBookEndKey =
    event.key === "End" ||
    event.key === ">" ||
    (event.shiftKey && event.code === "Period");

  if (
    event.defaultPrevented ||
    activeAction ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    (event.shiftKey && !isBookStartKey && !isBookEndKey) ||
    isTypingFieldShortcutTarget(event.target) ||
    isPanelControlShortcutTarget(event.target)
  ) {
    return;
  }

  if (isBookStartKey) {
    event.preventDefault();
    if (!controlPanel.classList.contains("is-open")) {
      jumpNotebookSpread(0);
    }
  } else if (isBookEndKey) {
    event.preventDefault();
    if (!controlPanel.classList.contains("is-open")) {
      jumpNotebookSpread(notebookSpreadCount - 1);
    }
  } else if (event.key === "," || event.key === "PageDown") {
    event.preventDefault();
    if (controlPanel.classList.contains("is-open")) {
      stepControlPanelTab(-1);
    } else {
      turnNotebookSpread(-1);
    }
  } else if (event.key === "." || event.key === "PageUp") {
    event.preventDefault();
    if (controlPanel.classList.contains("is-open")) {
      stepControlPanelTab(1);
    } else {
      turnNotebookSpread(1);
    }
  }
}

function handleMousePageTurnButton(event) {
  // NOTE: Uses browser back/forward mouse side buttons to turn planner pages instead of browser history.
  const isPageTurnButton = event.button === 3 || event.button === 4;

  if (!isPageTurnButton) {
    return;
  }

  if (event.defaultPrevented) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();

  if (
    lastMousePageTurnButton === event.button &&
    event.timeStamp - lastMousePageTurnTime < 300
  ) {
    return;
  }
  lastMousePageTurnButton = event.button;
  lastMousePageTurnTime = event.timeStamp;

  if (
    activeAction ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey ||
    isTypingFieldShortcutTarget(event.target) ||
    isPanelControlShortcutTarget(event.target)
  ) {
    return;
  }

  if (event.button === 3) {
    turnNotebookSpread(-1);
  } else if (event.button === 4) {
    turnNotebookSpread(1);
  }
}

function closeColorMatrixFromOutsidePointer(event) {
  // NOTE: Closes the Color Panel as soon as the user points anywhere outside it.
  if (
    !colorMatrixPopover ||
    colorMatrixPopover.hidden ||
    event.target.closest("[data-color-panel-matrix]") ||
    event.target.closest("[data-color-panel-matrix-toggle]") ||
    event.target.closest("[data-color-panel-hex]")
  ) {
    return;
  }

  setColorMatrixOpen(false);
}

function isTypingFieldShortcutTarget(target) {
  // NOTE: Detects fields where letter or arrow shortcuts should not interrupt text entry
  const input = target?.closest?.("textarea, [contenteditable='true'], input");

  if (!input) {
    return false;
  }

  if (input.matches("textarea, [contenteditable='true']")) {
    return true;
  }

  const type = (input.getAttribute("type") || "text").toLowerCase();

  return ![
    "button",
    "checkbox",
    "radio",
    "range",
    "color",
    "submit",
    "reset",
  ].includes(type);
}

function isPanelControlShortcutTarget(target) {
  // NOTE: Lets focused panel controls receive Enter instead of reopening the selected widget panel
  return Boolean(
    target?.closest?.(
      "button, input, select, textarea, [contenteditable='true'], .custom-select",
    ),
  );
}

function insertTextEditLineBreak(editingTarget) {
  const selection = window.getSelection();

  if (!selection || !selection.rangeCount) {
    editingTarget.append(document.createTextNode("\n"));
    return;
  }

  const range = selection.getRangeAt(0);

  const lineBreak = document.createTextNode("\n");

  range.deleteContents();
  range.insertNode(lineBreak);
  range.setStartAfter(lineBreak);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
  editingTarget.dispatchEvent(
    new Event("input", {
      bubbles: true,
    }),
  );
}

function handleTextEditEnterKey(event) {
  // NOTE: Keeps Enter for starting text edit mode; Shift+Enter owns new lines while editing.
  if (
    event.defaultPrevented ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    event.key !== "Enter"
  ) {
    return;
  }

  const editingTarget = event.target?.closest?.("[contenteditable='true']");

  if (!editingTarget) {
    return;
  }

  event.preventDefault();

  if (event.shiftKey) {
    insertTextEditLineBreak(editingTarget);
  }
}

function handleMenuEnterKey(event) {
  // NOTE: Activates the focused panel control with E or Enter while the control panel is open
  if (
    event.defaultPrevented ||
    activeAction ||
    !controlPanel.classList.contains("is-open") ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey ||
    isTypingFieldShortcutTarget(event.target) ||
    isPanelControlShortcutTarget(event.target)
  ) {
    return;
  }

  if (event.key !== "Enter" && event.key.toLowerCase() !== "e") {
    return;
  }

  const activeElement = document.activeElement;

  if (!activeElement || !controlPanel.contains(activeElement)) {
    return;
  }

  event.preventDefault();
  if (activeElement.matches("[data-create-item]")) {
    startKeyboardSourcePlacement(activeElement);
    return;
  }

  activateMenuFocusedElement(activeElement);
}

function getKeyboardDirection(event) {
  // NOTE: Normalizes WASD and arrow keys to one shared movement vocabulary
  const directions = {
    ArrowLeft: "left",
    ArrowRight: "right",
    ArrowUp: "up",
    ArrowDown: "down",
    a: "left",
    d: "right",
    w: "up",
    s: "down",
  };

  return directions[event.key] || directions[event.key.toLowerCase()];
}

function isCancelKey(event) {
  // NOTE: Treats Delete as the right-hand companion to Escape for backing out of actions
  return event.key === "Escape" || event.key === "Delete";
}

function getKeyboardCursorPage() {
  // NOTE: Finds the current page for the keyboard grid cursor
  const page = pages.find(
    (plannerPage) => getPageId(plannerPage) === keyboardCursor.pageSide,
  );

  if (page && !page.classList.contains("is-missing-page")) {
    return page;
  }

  const focusedSide = getFocusedPageSide();
  const focusedPage = pages.find(
    (plannerPage) => getPageId(plannerPage) === focusedSide,
  );

  return (
    focusedPage ||
    pages.find(
      (plannerPage) => !plannerPage.classList.contains("is-missing-page"),
    ) ||
    pages[0] ||
    null
  );
}

function getKeyboardGridMetrics(page) {
  // NOTE: Returns page grid metrics for cursor labels and keyboard movement
  const grid = getGridSize(page);
  const origin = getGridSnapOrigin(page);

  return {
    grid,
    origin,
    columns: Math.max(1, Math.round(plannerConfig.gridColumns)),
    rows: Math.max(1, Math.round(plannerConfig.gridRows)),
  };
}

function getKeyboardCursorPageNumber() {
  // NOTE: Matches the cursor label page number to the page badge number
  const side = keyboardCursor.pageSide;

  return getCurrentSpreadPageNumber(side);
}

function getKeyboardCursorLabel() {
  // NOTE: Formats the cursor anchor as page, row, and column
  const pageSide = keyboardCursor.pageSide === "right" ? "PR" : "PL";

  return `${pageSide}${getKeyboardCursorPageNumber()} R${keyboardCursor.row} C${keyboardCursor.column}`;
}

function getKeyboardCursorAnchor(page = getKeyboardCursorPage()) {
  // NOTE: Returns the page-local upper-left anchor point for keyboard actions
  if (!page) {
    return null;
  }

  const metrics = getKeyboardGridMetrics(page);

  return {
    x: metrics.origin.x + (keyboardCursor.column - 1) * metrics.grid.x,
    y: metrics.origin.y + (keyboardCursor.row - 1) * metrics.grid.y,
    ...metrics,
  };
}

function setKeyboardCursor(page, column, row) {
  // NOTE: Moves the keyboard grid cursor to a clamped row and column on a page
  if (!page) {
    return;
  }

  const metrics = getKeyboardGridMetrics(page);

  keyboardCursor = {
    pageSide: getPageId(page),
    column: clamp(Math.round(Number(column)) || 1, 1, metrics.columns),
    row: clamp(Math.round(Number(row)) || 1, 1, metrics.rows),
    isInitialized: true,
  };
  updateKeyboardCursor();
}

function setKeyboardCursorFromBox(item, page = getItemPage(item)) {
  // NOTE: Moves the keyboard cursor to an item's upper-left grid anchor
  if (!item || !page) {
    return;
  }

  const box = getItemBox(item);
  const metrics = getKeyboardGridMetrics(page);
  const column = Math.round((box.x - metrics.origin.x) / metrics.grid.x) + 1;
  const row = Math.round((box.y - metrics.origin.y) / metrics.grid.y) + 1;

  setKeyboardCursor(page, column, row);
}

function syncKeyboardCursorWithFocusedPage() {
  // NOTE: Initializes or clamps the cursor when the visible page or paper grid changes
  const focusedSide = getFocusedPageSide();
  const page =
    pages.find((plannerPage) => getPageId(plannerPage) === focusedSide) ||
    getKeyboardCursorPage();

  if (!page) {
    return;
  }

  const metrics = getKeyboardGridMetrics(page);
  const shouldCenter = !keyboardCursor.isInitialized;
  const column = shouldCenter
    ? Math.ceil(metrics.columns / 2)
    : keyboardCursor.column;
  const row = shouldCenter ? Math.ceil(metrics.rows / 2) : keyboardCursor.row;

  setKeyboardCursor(page, column, row);
}

function shouldShowKeyboardCursor() {
  // NOTE: Shows the cursor only when keyboard page actions are relevant
  return Boolean(
    pageGridCursor &&
    hasUsedKeyboardCursor &&
    !controlPanel.classList.contains("is-open") &&
    !document.querySelector("[contenteditable='true']"),
  );
}

function wakeKeyboardCursor() {
  // NOTE: Reveals the keyboard cursor after directional-key use, then dims it after three idle seconds
  hasUsedKeyboardCursor = true;
  isKeyboardCursorActive = true;
  window.clearTimeout(keyboardCursorIdleTimer);
  keyboardCursorIdleTimer = window.setTimeout(() => {
    hasUsedKeyboardCursor = false;
    isKeyboardCursorActive = false;
    updateKeyboardCursor();
    renderKeyHints();
  }, 3000);
  updateKeyboardCursor();
}

function hideKeyboardCursorForPointer() {
  // NOTE: Leaves keyboard navigation when the user goes back to pointer navigation
  if (!hasUsedKeyboardCursor) {
    return;
  }

  hasUsedKeyboardCursor = false;
  isKeyboardCursorActive = false;
  window.clearTimeout(keyboardCursorIdleTimer);
  updateKeyboardCursor();
  renderKeyHints();
}

function scheduleKeyboardCursorUpdate() {
  // NOTE: Refreshes the page navigation cursor after layout, pan, and turn animation transforms settle
  requestAnimationFrame(() => {
    requestAnimationFrame(updateKeyboardCursor);
  });
}

function updateKeyboardCursor() {
  // NOTE: Positions the visible page cursor and updates its anchor label
  if (!pageGridCursor) {
    return;
  }

  const page = getKeyboardCursorPage();

  if (!page || !keyboardCursor.isInitialized || !shouldShowKeyboardCursor()) {
    pageGridCursor.classList.remove("is-visible", "is-idle");
    return;
  }

  const anchor = getKeyboardCursorAnchor(page);
  const deskRect = plannerDesk.getBoundingClientRect();
  const pageRect = page.getBoundingClientRect();
  const viewZoom = getViewZoom();

  pageGridCursor.style.left = `${pageRect.left - deskRect.left + anchor.x * viewZoom}px`;
  pageGridCursor.style.top = `${pageRect.top - deskRect.top + anchor.y * viewZoom}px`;
  pageGridCursor.style.width = `${anchor.grid.x * viewZoom}px`;
  pageGridCursor.style.height = `${anchor.grid.y * viewZoom}px`;
  pageGridCursor.classList.add("is-visible");
  pageGridCursor.classList.toggle("is-idle", !isKeyboardCursorActive);
}

function moveKeyboardCursor(direction) {
  // NOTE: Moves the page grid cursor by one row or column
  const page = getKeyboardCursorPage();

  if (!page) {
    return;
  }

  const deltas = {
    left: { column: -1, row: 0 },
    right: { column: 1, row: 0 },
    up: { column: 0, row: -1 },
    down: { column: 0, row: 1 },
  };
  const delta = deltas[direction];

  if (!delta) {
    return;
  }

  setKeyboardCursor(
    page,
    keyboardCursor.column + delta.column,
    keyboardCursor.row + delta.row,
  );
  wakeKeyboardCursor();
  renderKeyHints();
}

function getItemAtKeyboardCursor() {
  // NOTE: Finds the topmost visible widget under the cursor anchor
  const page = getKeyboardCursorPage();
  const anchor = getKeyboardCursorAnchor(page);

  if (!page || !anchor) {
    return null;
  }

  return (
    getPlannerItems()
      .reverse()
      .find((item) => {
        const itemPage = getItemPage(item);

        if (itemPage !== page || item.classList.contains("is-spread-hidden")) {
          return false;
        }

        const box = getItemBox(item);

        return (
          anchor.x >= box.x &&
          anchor.x <= box.x + box.width &&
          anchor.y >= box.y &&
          anchor.y <= box.y + box.height
        );
      }) || null
  );
}

function activateKeyboardCursor() {
  // NOTE: Selects, edits, or clears based on what sits under the keyboard cursor
  const item = getItemAtKeyboardCursor();

  if (!item) {
    return false;
  }

  if (
    item === selectedItem &&
    selectedItems.size === 1 &&
    startSelectedItemTextEditing(item)
  ) {
    return true;
  }

  selectItem(item);
  setKeyboardCursorFromBox(item);
  return true;
}

function getElementCenter(element) {
  const rect = element.getBoundingClientRect();

  return {
    rect,
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
}

function isElementVisibleForFocus(element) {
  const rect = element.getBoundingClientRect();

  return (
    rect.width > 0 &&
    rect.height > 0 &&
    !element.closest(".is-spread-hidden, [hidden]")
  );
}

function chooseSpatialElement(elements, currentElement, direction) {
  const visibleElements = elements.filter(isElementVisibleForFocus);

  if (!visibleElements.length) {
    return null;
  }

  const orderedElements = [...visibleElements].sort((first, second) => {
    const firstRect = first.getBoundingClientRect();
    const secondRect = second.getBoundingClientRect();

    return firstRect.top - secondRect.top || firstRect.left - secondRect.left;
  });

  if (!currentElement || !visibleElements.includes(currentElement)) {
    return orderedElements[0];
  }

  const current = getElementCenter(currentElement);
  const directionalCandidates = visibleElements
    .filter((element) => element !== currentElement)
    .map((element) => {
      const candidate = getElementCenter(element);
      const deltaX = candidate.x - current.x;
      const deltaY = candidate.y - current.y;
      const isDirectional =
        (direction === "left" && deltaX < -1) ||
        (direction === "right" && deltaX > 1) ||
        (direction === "up" && deltaY < -1) ||
        (direction === "down" && deltaY > 1);

      if (!isDirectional) {
        return null;
      }

      const primary =
        direction === "left" || direction === "right"
          ? Math.abs(deltaX)
          : Math.abs(deltaY);
      const cross =
        direction === "left" || direction === "right"
          ? Math.abs(deltaY)
          : Math.abs(deltaX);

      return {
        element,
        score: primary + cross * 0.65,
      };
    })
    .filter(Boolean)
    .sort((first, second) => first.score - second.score);

  if (directionalCandidates[0]) {
    return directionalCandidates[0].element;
  }

  const currentIndex = orderedElements.indexOf(currentElement);

  if (currentIndex === -1) {
    return orderedElements[0];
  }

  return direction === "left" || direction === "up"
    ? orderedElements[
        (currentIndex - 1 + orderedElements.length) % orderedElements.length
      ]
    : orderedElements[(currentIndex + 1) % orderedElements.length];
}

function getWidgetFocusItems() {
  return getPlannerItems().filter(
    (item) => getItemPage(item) && isElementVisibleForFocus(item),
  );
}

function clearWidgetFocusTarget() {
  document
    .querySelectorAll(".is-widget-target")
    .forEach((element) => element.classList.remove("is-widget-target"));
  widgetFocusTarget = null;
}

function clearWidgetFocus() {
  clearWidgetFocusTarget();
  document
    .querySelectorAll(".is-widget-focus")
    .forEach((element) => element.classList.remove("is-widget-focus"));
  widgetFocusItem = null;
}

function setWidgetFocusItem(item) {
  clearWidgetFocus();

  if (!item) {
    renderKeyHints();
    return false;
  }

  widgetFocusItem = item;
  item.classList.add("is-widget-focus");
  item.scrollIntoView({
    block: "nearest",
    inline: "nearest",
  });
  renderKeyHints();
  return true;
}

function setWidgetFocusTarget(item, target) {
  clearWidgetFocusTarget();

  if (!item || !target) {
    renderKeyHints();
    return false;
  }

  widgetFocusItem = item;
  item.classList.add("is-widget-focus");
  widgetFocusTarget = target;
  target.classList.add("is-widget-target");
  target.scrollIntoView({
    block: "nearest",
    inline: "nearest",
  });
  renderKeyHints();
  return true;
}

function getWidgetFocusTargets(item) {
  if (!item) {
    return [];
  }

  if (item.dataset.itemType === "mini-month") {
    return Array.from(
      item.querySelectorAll(".mini-month .dayCell[data-day-key]"),
    );
  }

  if (item.dataset.itemType === "full-month") {
    return Array.from(
      item.querySelectorAll(".mini-month .dayCell[data-day-key]"),
    );
  }

  if (item.dataset.itemType === "perpetual-calendar") {
    return Array.from(
      item.querySelectorAll(".perpetual-calendar-row[data-day-key]"),
    );
  }

  if (item.dataset.itemType === "weekly-view") {
    return Array.from(
      item.querySelectorAll(".weekly-view-slot.dayCell[data-day-key]"),
    );
  }

  if (item.dataset.itemType === "diary-view") {
    return Array.from(
      item.querySelectorAll(".diary-view-row.dayCell[data-day-key]"),
    );
  }

  const stickerText = item.querySelector(".sticker-text");

  return stickerText ? [stickerText] : [];
}

function moveWidgetFocus(direction) {
  if (plannerAction !== "browse") {
    return false;
  }

  if (widgetFocusTarget && widgetFocusItem) {
    const targets = getWidgetFocusTargets(widgetFocusItem);
    const nextTarget = chooseSpatialElement(
      targets,
      widgetFocusTarget,
      direction,
    );

    if (nextTarget) {
      return setWidgetFocusTarget(widgetFocusItem, nextTarget);
    }
  }

  const nextItem = chooseSpatialElement(
    getWidgetFocusItems(),
    widgetFocusItem,
    direction,
  );

  return setWidgetFocusItem(nextItem);
}

function enterWidgetContentFocus(item = widgetFocusItem) {
  if (!item) {
    return false;
  }

  const targets = getWidgetFocusTargets(item);

  if (!targets.length) {
    return false;
  }

  if (isStickerTextItem(item)) {
    startStickerTextEditing(item);
    return true;
  }

  return setWidgetFocusTarget(item, targets[0]);
}

function activateWidgetFocus() {
  if (plannerAction !== "browse") {
    return false;
  }

  if (!widgetFocusItem) {
    return setWidgetFocusItem(selectedItem || getWidgetFocusItems()[0]);
  }

  if (!widgetFocusTarget) {
    return enterWidgetContentFocus(widgetFocusItem);
  }

  const textElement = widgetFocusTarget.matches(".calendar-day-text")
    ? widgetFocusTarget
    : widgetFocusTarget.querySelector(".calendar-day-text");

  if (textElement) {
    startCalendarDayTextEditing(textElement, widgetFocusItem);
    return true;
  }

  return false;
}

function stepBackWidgetFocus() {
  if (widgetFocusTarget) {
    clearWidgetFocusTarget();
    renderKeyHints();
    return true;
  }

  if (widgetFocusItem) {
    clearWidgetFocus();
    renderKeyHints();
    return true;
  }

  return false;
}

function handleKeyboardCursorActivateKey(event) {
  // NOTE: Uses E or Enter as the page cursor activate key when the menu is closed
  if (
    event.defaultPrevented ||
    activeAction ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey ||
    isTypingFieldShortcutTarget(event.target) ||
    isPanelControlShortcutTarget(event.target)
  ) {
    return;
  }

  if (event.key !== "Enter") {
    return;
  }

  if (plannerAction === "browse") {
    const hadWidgetFocus = Boolean(widgetFocusItem);

    if (activateWidgetFocus() || hadWidgetFocus) {
      event.preventDefault();
    }
    return;
  }

  if (activateKeyboardCursor()) {
    event.preventDefault();
    renderKeyHints();
  }
}

function getKeyboardPlacementPage() {
  // NOTE: Finds the visible page that should receive a keyboard-placed widget
  const cursorPage = getKeyboardCursorPage();

  if (cursorPage && !cursorPage.classList.contains("is-missing-page")) {
    return cursorPage;
  }

  const focusedSide = getFocusedPageSide();
  const focusedPage = pages.find((page) => getPageId(page) === focusedSide);

  if (focusedPage && !focusedPage.classList.contains("is-missing-page")) {
    return focusedPage;
  }

  return (
    pages.find((page) => !page.classList.contains("is-missing-page")) ||
    pages[0] ||
    null
  );
}

function centerKeyboardPlacementItem(item, page) {
  // NOTE: Centers a newly keyboard-created widget on the active page grid
  if (!page || isFullPageCalendarType(item.dataset.itemType)) {
    return;
  }

  const box = getItemBox(item);
  const pageRect = page.getBoundingClientRect();
  const viewZoom = getViewZoom();
  const pageWidth = pageRect.width / viewZoom;
  const pageHeight = pageRect.height / viewZoom;
  const grid = getGridSize(page);
  const origin = getGridSnapOrigin(page);
  const centeredX = snapToGridOrigin(
    (pageWidth - box.width) / 2,
    origin.x,
    grid.x,
  );
  const centeredY = snapToGridOrigin(
    (pageHeight - box.height) / 2,
    origin.y,
    grid.y,
  );

  setItemBox(item, {
    ...box,
    x: clamp(centeredX, 0, Math.max(0, pageWidth - box.width)),
    y: clamp(centeredY, 0, Math.max(0, pageHeight - box.height)),
  });
}

function placeKeyboardPlacementItemAtCursor(item, page) {
  // NOTE: Places a new keyboard widget with its upper-left corner on the cursor anchor
  if (!page || isFullPageCalendarType(item.dataset.itemType)) {
    return;
  }

  if (getPageId(page) !== keyboardCursor.pageSide) {
    setKeyboardCursorFromBox(item, page);
    return;
  }

  const box = getItemBox(item);
  const anchor = getKeyboardCursorAnchor(page);
  const pageRect = page.getBoundingClientRect();
  const viewZoom = getViewZoom();
  const pageWidth = pageRect.width / viewZoom;
  const pageHeight = pageRect.height / viewZoom;

  setItemBox(item, {
    ...box,
    x: clamp(anchor.x, 0, Math.max(0, pageWidth - box.width)),
    y: clamp(anchor.y, 0, Math.max(0, pageHeight - box.height)),
  });
  setKeyboardCursorFromBox(item, page);
}

function startKeyboardSourcePlacement(source) {
  // NOTE: Creates a widget from the menu and starts keyboard placement
  if (activeAction || !source?.matches?.("[data-create-item]")) {
    return false;
  }

  const page = getKeyboardPlacementPage();

  if (!page) {
    return false;
  }

  const item = makePlannerItem(source.dataset.createType || "sticker");
  const sourceRect = source.getBoundingClientRect();
  const pageRect = page.getBoundingClientRect();
  const offsetX = sourceRect.width / 2;
  const offsetY = sourceRect.height / 2;
  const fakeEvent = {
    clientX: pageRect.left + pageRect.width / 2,
    clientY: pageRect.top + pageRect.height / 2,
  };

  closeItemMenus();
  document.body.append(item);
  item.classList.add("is-floating-source", "is-dragging");
  item.style.width = `${sourceRect.width}px`;
  item.style.height = `${sourceRect.height}px`;

  activeAction = {
    type: "source",
    item,
    page,
    didMove: true,
    offsetX,
    offsetY,
  };

  if (!snapItemToPage(item, page, fakeEvent)) {
    removeRejectedSourceItem();
    activeAction = null;
    renderKeyHints();
    return false;
  }

  placeKeyboardPlacementItemAtCursor(item, page);
  markSnapReady(item, true);
  selectItem(item);
  activeAction = {
    type: "keyboard-source",
    item,
    page,
  };
  closeControlPanel();
  renderKeyHints();
  return true;
}

function moveKeyboardPlacementItem(direction) {
  // NOTE: Moves the keyboard-held widget by one grid cell in the requested direction
  const item = activeAction?.item;
  const page = activeAction?.page;

  if (!item || !page) {
    return;
  }

  const box = getItemBox(item);
  const grid = getGridSize(page);
  const pageRect = page.getBoundingClientRect();
  const viewZoom = getViewZoom();
  const pageWidth = pageRect.width / viewZoom;
  const pageHeight = pageRect.height / viewZoom;
  const delta = {
    left: { x: -grid.x, y: 0 },
    right: { x: grid.x, y: 0 },
    up: { x: 0, y: -grid.y },
    down: { x: 0, y: grid.y },
  }[direction];

  if (!delta) {
    return;
  }

  setItemBox(item, {
    ...box,
    x: clamp(box.x + delta.x, 0, Math.max(0, pageWidth - box.width)),
    y: clamp(box.y + delta.y, 0, Math.max(0, pageHeight - box.height)),
  });
  setKeyboardCursorFromBox(item, page);
  wakeKeyboardCursor();
  renderKeyHints();
}

function finishKeyboardPlacement() {
  // NOTE: Places the keyboard-held widget and saves the planner state
  if (activeAction?.type !== "keyboard-source") {
    return;
  }

  const item = activeAction.item;

  item.classList.remove("is-dragging");
  markSnapReady(item, false);
  selectItem(item);
  notifyTemplateChanged();
  activeAction = null;
  clearDragOver();
  setKeyboardCursorFromBox(item);
  renderKeyHints();
}

function cancelKeyboardPlacement() {
  // NOTE: Removes a keyboard-created widget when placement is cancelled
  if (activeAction?.type !== "keyboard-source") {
    return;
  }

  const item = activeAction.item;

  selectedItems.delete(item);
  if (selectedItem === item) {
    selectedItem = null;
  }
  item.remove();
  activeAction = null;
  clearDragOver();
  updateObjectControlsState();
  renderKeyHints();
}

function handleKeyboardPlacementKey(event) {
  // NOTE: Handles WASD/arrow movement, E/Enter placement, and Delete/Escape cancel while placing a widget
  if (
    activeAction?.type !== "keyboard-source" ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey
  ) {
    return;
  }

  const direction = getKeyboardDirection(event);

  if (direction) {
    event.preventDefault();
    moveKeyboardPlacementItem(direction);
    return;
  }

  if (event.key === "Enter" || event.key.toLowerCase() === "e") {
    event.preventDefault();
    finishKeyboardPlacement();
    return;
  }

  if (isCancelKey(event)) {
    event.preventDefault();
    cancelKeyboardPlacement();
  }
}

function getSelectedTextEditItem() {
  // NOTE: Returns the single selected planner item that can enter text editing
  if (
    selectedItems.size !== 1 ||
    !selectedItem ||
    !getPlannerItems().includes(selectedItem)
  ) {
    return null;
  }

  return selectedItem.querySelector(".sticker-text, .calendar-day-text")
    ? selectedItem
    : null;
}

function startSelectedItemTextEditing(item) {
  // NOTE: Starts text editing for the selected planner item using its primary editable text area
  const stickerText = item.querySelector(".sticker-text");

  if (stickerText) {
    startStickerTextEditing(item);
    return true;
  }

  const calendarText = item.querySelector(".calendar-day-text");

  if (calendarText) {
    startCalendarDayTextEditing(calendarText, item);
    return true;
  }

  return false;
}

function handleSelectedTextEditKey(event) {
  // NOTE: Uses Enter to edit selected text widgets or open selected widget actions
  if (
    event.defaultPrevented ||
    activeAction ||
    controlPanel.classList.contains("is-open") ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey ||
    isTypingFieldShortcutTarget(event.target) ||
    isPanelControlShortcutTarget(event.target)
  ) {
    return;
  }

  if (event.key !== "Enter") {
    return;
  }

  const item = getSelectedTextEditItem();

  if (item) {
    event.preventDefault();
    startSelectedItemTextEditing(item);
    return;
  }

  const actionItem = getItemForMenuKeyboardToggle(event.target) || selectedItem;

  if (!actionItem) {
    return;
  }

  const rect = actionItem.getBoundingClientRect();

  event.preventDefault();
  if (!selectedItems.has(actionItem)) {
    selectItem(actionItem);
  }
  openItemPopupMenu(actionItem, {
    clientX: rect.left + rect.width / 2,
    clientY: rect.top + Math.min(rect.height / 2, 36),
  });
}

function syncCurrentActionUi() {
  // NOTE: Reflects the current action on shared UI hooks
  controlPanel.classList.toggle(
    "is-browse-context",
    plannerAction === "browse",
  );
  document.documentElement.dataset.plannerAction = plannerAction;
}

function enterBrowseAction() {
  // NOTE: Returns to the base planner action and closes any main menu panel
  plannerAction = "browse";
  mainMenuContext = "root";
  syncCurrentActionUi();
  closeControlPanel();
  renderKeyHints();
}

function enterKeyboardMenuBranch(branch, tabName) {
  // NOTE: Opens a numbered main menu context backed by a control panel tab
  mainMenuContext = branch;
  syncCurrentActionUi();
  selectControlPanelTab(tabName);
  openControlPanel();
  renderKeyHints();
}

function returnToMainMenuRoot() {
  // NOTE: Goes one level up from a main menu context to the top-level choices
  mainMenuContext = "root";
  closeControlPanel();
  renderKeyHints();
}

function toggleMainMenu() {
  if (controlPanel.classList.contains("is-open")) {
    returnToMainMenuRoot();
    return;
  }

  enterKeyboardMenuBranch("guide", "guide");
}

function toggleMainMenuFromKeyboard(event) {
  if (
    event.defaultPrevented ||
    activeAction ||
    event.repeat ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey ||
    isTypingFieldShortcutTarget(event.target)
  ) {
    return;
  }

  if (event.key.toLowerCase() !== "m") {
    return;
  }

  event.preventDefault();
  toggleMainMenu();
}

function openSelectedObjectActionsFromKeyboard() {
  // NOTE: Opens selected object popup menu from actions > Object via number key
  if (!selectedItem || !selectedItems.size) {
    return false;
  }

  const rect = selectedItem.getBoundingClientRect();

  mainMenuContext = "object";
  syncCurrentActionUi();
  closeControlPanel();
  openItemPopupMenu(selectedItem, {
    clientX: rect.left + rect.width / 2,
    clientY: rect.top + Math.min(rect.height / 2, 36),
  });
  renderKeyHints();
  return true;
}

function toggleSelectedGroupFromKeyboard() {
  // NOTE: Groups or ungroups selected objects from actions > Object via number key
  const items = getKeyboardGroupItems();

  if (!items.length) {
    return false;
  }

  if (itemsHaveGroup(items)) {
    ungroupItems(items);
  } else {
    groupItems(items, selectedItem);
  }
  renderKeyHints();
  return true;
}

function deleteSelectedItemsFromKeyboard() {
  // NOTE: Deletes selected objects from actions > Object via number key
  if (!selectedItem || !selectedItems.size) {
    return false;
  }

  deleteItem(selectedItem);
  mainMenuContext = "root";
  renderKeyHints();
  return true;
}

function handleMainMenuNumberKey(event) {
  // NOTE: Uses number keys for the current action stack and context-specific choices
  if (
    event.defaultPrevented ||
    activeAction ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey ||
    isTypingFieldShortcutTarget(event.target)
  ) {
    return;
  }

  if (!/^[1-9]$/.test(event.key)) {
    return;
  }

  if (mainMenuContext === "root") {
    event.preventDefault();
    if (event.key === "1") {
      enterKeyboardMenuBranch("guide", "guide");
    } else if (event.key === "2") {
      enterKeyboardMenuBranch("add", "add");
    } else if (event.key === "3") {
      enterKeyboardMenuBranch("notebook", "notebook");
    } else if (
      event.key === "4" &&
      !controlPanelTabs.find(
        (tab) => tab.dataset.controlPanelTab === "object-selected",
      )?.disabled
    ) {
      enterKeyboardMenuBranch("object-selected", "object-selected");
    }
    return;
  }

  if (mainMenuContext === "guide" && event.key === "1") {
    event.preventDefault();
    returnToMainMenuRoot();
    return;
  }

  if (mainMenuContext === "add" && event.key === "2") {
    event.preventDefault();
    returnToMainMenuRoot();
    return;
  }

  if (mainMenuContext === "notebook" && event.key === "3") {
    event.preventDefault();
    returnToMainMenuRoot();
    return;
  }

  if (mainMenuContext === "object-selected" && event.key === "4") {
    event.preventDefault();
    returnToMainMenuRoot();
    return;
  }

  if (
    mainMenuContext === "guide" ||
    mainMenuContext === "add" ||
    mainMenuContext === "notebook" ||
    mainMenuContext === "object-selected"
  ) {
    const tab = controlPanelTabs[Number(event.key) - 1];

    if (!tab || tab.disabled) {
      return;
    }

    event.preventDefault();
    selectControlPanelTab(tab.dataset.controlPanelTab);
    openControlPanel();
    renderKeyHints();
    return;
  }

  if (mainMenuContext === "object") {
    event.preventDefault();
    if (event.key === "4") {
      returnToMainMenuRoot();
    } else if (event.key === "1") {
      openSelectedObjectActionsFromKeyboard();
    } else if (event.key === "2") {
      toggleSelectedGroupFromKeyboard();
    } else if (event.key === "3") {
      deleteSelectedItemsFromKeyboard();
    }
    return;
  }
}

function handleNumberedMenuTabKey(event) {
  // NOTE: Backward wrapper for the numeric current action stack
  handleMainMenuNumberKey(event);
}

function handleSelectedDeleteKey(event) {
  // NOTE: Deletes an explicit widget selection without treating Delete as a generic back key
  if (
    event.defaultPrevented ||
    activeAction ||
    (event.key !== "Delete" && event.key !== "Backspace") ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey ||
    isTypingFieldShortcutTarget(event.target)
  ) {
    return;
  }

  if (!selectedItem || !selectedItems.size) {
    return;
  }

  event.preventDefault();
  deleteItem(selectedItem);
  mainMenuContext = "root";
  renderKeyHints();
}

function handleUndoShortcut(event) {
  if (
    event.defaultPrevented ||
    event.altKey ||
    event.shiftKey ||
    event.key.toLowerCase() !== "z" ||
    !(event.metaKey || event.ctrlKey) ||
    isTypingFieldShortcutTarget(event.target)
  ) {
    return;
  }

  const restoreUndo =
    typeof restorePlannerUndoState === "function"
      ? restorePlannerUndoState
      : window.restorePlannerUndoState;

  if (typeof restoreUndo === "function" && restoreUndo()) {
    event.preventDefault();
  }
}

function handleCancelKey(event) {
  // NOTE: Uses Escape to step back through open planner UI without deleting selection
  if (
    event.defaultPrevented ||
    activeAction ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey ||
    isTypingFieldShortcutTarget(event.target)
  ) {
    return;
  }

  if (event.key !== "Escape") {
    return;
  }

  event.preventDefault();
  if (document.querySelector(".widget-popup-menu")) {
    if (typeof closeWidgetPopupMenus === "function") {
      closeWidgetPopupMenus();
    }
    renderKeyHints();
    return;
  }

  if (stepBackWidgetFocus()) {
    return;
  }

  if (controlPanel.classList.contains("is-open")) {
    closeControlPanel();
    return;
  }

  closeCustomSelects();
  clearSelectFocus();
  setColorMatrixOpen(false);
  closeHexPopover();
  clearSelection();
}

function handleTextEditFinishKey(event) {
  // NOTE: Uses Escape to finish active text editing by leaving the editable text field.
  if (
    event.defaultPrevented ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey
  ) {
    return;
  }

  if (event.key !== "Escape") {
    return;
  }

  const editingTarget = event.target?.closest?.("[contenteditable='true']");

  if (!editingTarget) {
    return;
  }

  event.preventDefault();
  editingTarget.blur();
}

function finishTextEditingFromOutsidePointer(event) {
  // NOTE: Leaves text editing when pointer input starts outside the widget being edited
  const editingTarget = document.querySelector("[contenteditable='true']");

  if (!editingTarget) {
    return;
  }

  const editingItem = editingTarget.closest(".planner-item");

  if (!editingItem || editingItem.contains(event.target)) {
    return;
  }

  editingTarget.blur();
}

function finishAllTextEditing() {
  // NOTE: Ends any active widget text entry before layout actions such as dragging.
  document
    .querySelectorAll("[contenteditable='true']")
    .forEach((editingTarget) => editingTarget.blur());
}

function blockSpacebarShortcut(event) {
  // NOTE: Prevents Space from acting as a custom planner keyboard control outside typing fields
  if (
    event.defaultPrevented ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey ||
    isTextInputShortcutTarget(event.target)
  ) {
    return;
  }

  if (event.key !== " ") {
    return;
  }

  event.preventDefault();
}

function getActiveControlPanelPage() {
  // NOTE: Finds the currently visible control panel page for keyboard scrolling
  const activeTabName = controlPanelTabs.find(
    (tab) => tab.getAttribute("aria-selected") === "true",
  )?.dataset.controlPanelTab;

  return (
    controlPanelPages.find(
      (panel) => panel.dataset.controlPanelPage === activeTabName,
    ) || null
  );
}

function getMenuFocusableElements() {
  // NOTE: Gets visible controls in the active panel for arrow-key panel navigation
  const activePanel = getActiveControlPanelPage();

  if (!activePanel) {
    return [];
  }

  return Array.from(
    activePanel.querySelectorAll(
      "button, .control-choice, input, select, textarea, [tabindex]:not([tabindex='-1'])",
    ),
  ).filter((element) => {
    if (element.matches(".control-choice input")) {
      return false;
    }

    const isDisabled =
      element.disabled || element.getAttribute("aria-disabled") === "true";
    const isHidden = element.hidden || element.closest("[hidden]");
    const rect = element.getBoundingClientRect();

    return (
      !isDisabled &&
      !isHidden &&
      element.offsetParent !== null &&
      rect.width > 0 &&
      rect.height > 0
    );
  });
}

function getElementGeometry(element) {
  // NOTE: Calculates the screen center point used for spatial keyboard focus movement
  const rect = element.getBoundingClientRect();

  return {
    height: rect.height,
    width: rect.width,
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
}

function getMenuFocusCandidateScore(
  fromGeometry,
  candidateGeometry,
  direction,
) {
  // NOTE: Scores possible menu focus targets by direction first, then nearest visual distance
  const deltaX = candidateGeometry.x - fromGeometry.x;
  const deltaY = candidateGeometry.y - fromGeometry.y;
  const absX = Math.abs(deltaX);
  const absY = Math.abs(deltaY);
  const horizontalLaneSize = Math.max(
    fromGeometry.height,
    candidateGeometry.height,
    24,
  );
  const verticalLaneSize = Math.max(
    fromGeometry.width,
    candidateGeometry.width,
    48,
  );

  if (direction === "up" && deltaY >= -1) {
    return null;
  }

  if (direction === "down" && deltaY <= 1) {
    return null;
  }

  if (direction === "left" && deltaX >= -1) {
    return null;
  }

  if (direction === "right" && deltaX <= 1) {
    return null;
  }

  if (direction === "up" || direction === "down") {
    return absX <= verticalLaneSize ? absY : 1000000 + absX * 1000 + absY;
  }

  return absY <= horizontalLaneSize ? absX : 1000000 + absY * 1000 + absX;
}

function moveMenuFocus(direction) {
  // NOTE: Moves focus spatially to the closest visible control in the requested menu direction
  const focusableElements = getMenuFocusableElements();

  if (!focusableElements.length) {
    return false;
  }

  const activeElement = focusableElements.includes(document.activeElement)
    ? document.activeElement
    : null;
  const currentElement = activeElement || focusableElements[0];
  const currentGeometry = getElementGeometry(currentElement);
  const nextElement = activeElement
    ? focusableElements.reduce((best, element) => {
        if (element === activeElement) {
          return best;
        }

        const score = getMenuFocusCandidateScore(
          currentGeometry,
          getElementGeometry(element),
          direction,
        );

        if (score === null || (best && score >= best.score)) {
          return best;
        }

        return {
          element,
          score,
        };
      }, null)?.element
    : currentElement;

  if (!nextElement) {
    return false;
  }

  if (
    nextElement.matches(".control-choice") &&
    !nextElement.hasAttribute("tabindex")
  ) {
    nextElement.tabIndex = -1;
  }
  controlPanel
    .querySelectorAll(".is-panel-keyboard-focus")
    .forEach((element) => {
      element.classList.remove("is-panel-keyboard-focus");
    });
  nextElement.classList.add("is-panel-keyboard-focus");
  nextElement.focus();
  nextElement.scrollIntoView({
    block: "nearest",
    inline: "nearest",
  });

  return true;
}

function activateMenuFocusedElement(element) {
  // NOTE: Activates the visible menu tile or native control currently selected by keyboard navigation
  if (element.matches(".control-choice")) {
    const input = element.querySelector("input");

    if (input && !input.disabled) {
      input.click();
      return true;
    }
  }

  if (typeof element.click === "function") {
    element.click();
    return true;
  }

  return false;
}

function scrollActiveMenuPanel(direction, distance = 64) {
  // NOTE: Scrolls the active panel when spatial focus cannot move farther vertically
  const activePanel = getActiveControlPanelPage();

  if (!activePanel) {
    return false;
  }

  activePanel.scrollBy({
    top: direction === "down" ? distance : -distance,
    behavior: "smooth",
  });

  return true;
}

function handleMainMenuArrowKey(event) {
  // NOTE: Uses arrow keys to move through visible controls in the open menu
  if (
    activeAction ||
    !controlPanel.classList.contains("is-open") ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey ||
    isTypingFieldShortcutTarget(event.target)
  ) {
    return;
  }

  if (event.key === "ArrowLeft") {
    event.preventDefault();
    moveMenuFocus("left");
  } else if (event.key === "ArrowRight") {
    event.preventDefault();
    moveMenuFocus("right");
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    if (!moveMenuFocus("up")) {
      scrollActiveMenuPanel("up");
    }
  } else if (event.key === "ArrowDown") {
    event.preventDefault();
    if (!moveMenuFocus("down")) {
      scrollActiveMenuPanel("down");
    }
  } else if (event.key === "PageUp" || event.key === "PageDown") {
    const activePanel = getActiveControlPanelPage();

    if (!activePanel) {
      return;
    }

    event.preventDefault();
    activePanel.scrollBy({
      top:
        event.key === "PageDown"
          ? activePanel.clientHeight * 0.8
          : activePanel.clientHeight * -0.8,
      behavior: "smooth",
    });
  }
}

function handleMainMenuWasdKey(event) {
  // NOTE: Uses WASD to move through visible controls in the open menu
  if (
    event.defaultPrevented ||
    activeAction ||
    !controlPanel.classList.contains("is-open") ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey ||
    isTypingFieldShortcutTarget(event.target)
  ) {
    return;
  }

  const key = event.key.toLowerCase();

  if (key === "a") {
    event.preventDefault();
    moveMenuFocus("left");
  } else if (key === "d") {
    event.preventDefault();
    moveMenuFocus("right");
  } else if (key === "w") {
    event.preventDefault();
    if (!moveMenuFocus("up")) {
      scrollActiveMenuPanel("up");
    }
  } else if (key === "s") {
    event.preventDefault();
    if (!moveMenuFocus("down")) {
      scrollActiveMenuPanel("down");
    }
  }
}

function handleViewZoomKey(event) {
  // NOTE: Cycles zoom levels with Z when the user is not typing or moving an object
  if (
    event.defaultPrevented ||
    activeAction ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey ||
    isTextInputShortcutTarget(event.target)
  ) {
    return;
  }

  if (event.key.toLowerCase() === "z") {
    event.preventDefault();
    cycleViewZoom();
  }
}

function handlePageFocusNavigationKey(event) {
  // NOTE: Moves widget focus between real widgets/targets, falling back to the legacy grid cursor outside widget
  if (
    event.defaultPrevented ||
    activeAction ||
    controlPanel.classList.contains("is-open") ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey ||
    isTextInputShortcutTarget(event.target)
  ) {
    return;
  }

  const direction = getKeyboardDirection(event);

  if (!direction) {
    return;
  }

  event.preventDefault();
  if (plannerAction === "browse") {
    moveWidgetFocus(direction);
    return;
  }

  moveKeyboardCursor(direction);
}

function getKeyboardGroupItems() {
  // NOTE: Gets the current selection that can be grouped or ungrouped from the keyboard
  if (!selectedItems.size) {
    return [];
  }

  return Array.from(selectedItems).filter((item) =>
    getPlannerItems().includes(item),
  );
}

function toggleGroupFromKeyboard(event) {
  // NOTE: Numeric object controls own keyboard group/ungroup now
}

function toggleGuidesFromKeyboard(event) {
  // NOTE: Toggles every page guide checkbox on or off as one keyboard command
  if (
    event.defaultPrevented ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey ||
    isTextInputShortcutTarget(event.target)
  ) {
    return;
  }

  const key = event.key.toLowerCase();

  if (key !== "g") {
    return;
  }

  event.preventDefault();
  const hasActiveGuide = guideInputs.some((input) => input.checked);
  const shouldShowAllGuides = !hasActiveGuide;

  guideInputs.forEach((input) => {
    input.checked = shouldShowAllGuides;
  });

  changePlannerSetting();
}

function getKeyHintState() {
  // NOTE: Chooses the visible current-action label and keyboard actions for the planner state
  if (activeAction?.type === "keyboard-source") {
    return {
      mode: "Current Action > Place Widget",
      entries: [
        ["Enter", "Place"],
        ["G", "Gridlines"],
        ["Delete / Esc", "Cancel"],
      ],
    };
  }

  if (document.querySelector("[contenteditable='true']")) {
    return {
      mode: "Current Action > Text Edit",
      entries: [
        ["Shift+Enter", "New line"],
        ["Escape", "Finish editing"],
      ],
    };
  }

  if (mainMenuContext === "guide") {
    return {
      mode: "Current Action > Guide",
      entries: [
        ["1", "Back"],
        ["1-3", "Tabs"],
        ["</>", "Page Left/Right"],
        ["Enter", "Select"],
      ],
    };
  }

  if (mainMenuContext === "add") {
    return {
      mode: "Current Action > Widgets",
      entries: [
        ["2", "Back"],
        ["1-3", "Tabs"],
        ["</>", "Page Left/Right"],
        ["Enter", "Select"],
      ],
    };
  }

  if (mainMenuContext === "notebook") {
    return {
      mode: "Current Action > Notebook",
      entries: [
        ["3", "Back"],
        ["1-3", "Tabs"],
        ["</>", "Page Left/Right"],
        ["Enter", "Select"],
      ],
    };
  }

  if (mainMenuContext === "object") {
    return {
      mode: "Current Action > Object",
      entries: [
        ["4", "Back"],
        ["1 / Enter", "Actions"],
        ["2", "Group / Ungroup"],
        ["3", "Delete selected"],
        ["G", "Gridlines"],
      ],
    };
  }

  if (mainMenuContext === "object-selected") {
    return {
      mode: "Current Action > Selected",
      entries: [
        ["4", "Back"],
        ["1-3", "Tabs"],
        ["Enter", "Select"],
        ["Esc", "Clear selection"],
      ],
    };
  }

  if (selectedItems.size > 1) {
    return {
      mode: "Current Action > Selection",
      entries: [
        ["Enter", "Actions"],
        ["Delete", "Delete selected"],
        ["Esc", "Clear selection"],
        ["G", "Gridlines"],
      ],
    };
  }

  if (selectedItem && getPlannerItems().includes(selectedItem)) {
    const canEditText = Boolean(
      selectedItem.querySelector(".sticker-text, .calendar-day-text"),
    );

    return {
      mode: "Current Action > Widget Selected",
      entries: [
        ["Enter", canEditText ? "Edit text" : "Actions"],
        ["Delete", "Delete widget"],
        ["Esc", "Clear selection"],
        ["G", "Gridlines"],
      ],
    };
  }

  if (widgetFocusTarget) {
    return {
      mode: "Current Action > Widget Navigate",
      entries: [
        ["Enter", "Open"],
        ["Delete / Esc", "Back"],
        ["Tab", "Next focus"],
      ],
    };
  }

  if (widgetFocusItem) {
    return {
      mode: "Current Action > Widget Focus",
      entries: [
        ["Enter", "Open"],
        ["Delete / Esc", "Clear focus"],
        ["Tab", "Next focus"],
      ],
    };
  }

  return {
    mode: "Current Action",
    entries: [
      ["Tab", "Next focus"],
      ["Enter", "Edit"],
      ["</>", "Page Left/Right"],
      ["SHIFT + </>", "First/Last Page"],
      ["Z", "Zoom"],
      ["M", "Main Menu"],
      ["G", "Gridlines"],
    ],
  };
}

function renderKeyHints() {
  // NOTE: Renders the upper-left keyboard shortcut popup for the current app state
  if (!hintPanel) {
    return;
  }

  hintPanel.replaceChildren();
  const hintState = getKeyHintState();
  const modeRow = document.createElement("div");

  modeRow.className = "hint-mode subtitle";
  modeRow.textContent = hintState.mode;
  if (!plannerMainMenu?.contains(hintPanel)) {
    const panelTitle = document.createElement("div");

    panelTitle.className = "panel-title title hint-panel-title";
    panelTitle.textContent = "Hint Panel";
    hintPanel.append(panelTitle, modeRow);
  }

  if (hasUsedKeyboardCursor && !controlPanel.classList.contains("is-open")) {
    const coordinateRow = document.createElement("div");

    coordinateRow.className = "hint-coordinates";
    coordinateRow.classList.toggle("is-idle", !isKeyboardCursorActive);
    coordinateRow.textContent = getKeyboardCursorLabel();
    hintPanel.append(coordinateRow);
  }
  hintState.entries.forEach(([key, action]) => {
    const row = document.createElement("div");
    const keyElement = document.createElement("kbd");
    const actionElement = document.createElement("span");

    row.className = "hint-row";
    keyElement.className = "hint-key";
    keyElement.textContent = key;
    actionElement.className = "hint-action";
    actionElement.textContent = action;
    row.append(keyElement, actionElement);
    hintPanel.append(row);
  });
  syncControlPanelHintAnchor();
  updateKeyboardCursor();
}

function syncControlPanelHintAnchor() {
  // NOTE: Attaches the control panel position to the bottom-left of the hint panel
  if (!hintPanel || !controlPanel || !plannerDesk) {
    return;
  }

  if (plannerMainMenu?.contains(controlPanel)) {
    return;
  }

  if (
    activeAction?.type === "control-panel-move" ||
    activeAction?.type === "control-panel-resize"
  ) {
    return;
  }

  const deskRect = plannerDesk.getBoundingClientRect();
  const hintRect = hintPanel.getBoundingClientRect();
  const panelWidth = controlPanel.offsetWidth || 135;
  const anchorLeft = clamp(
    hintRect.left - deskRect.left,
    8,
    Math.max(8, deskRect.width - panelWidth - 8),
  );
  const anchorTop = clamp(
    hintRect.bottom - deskRect.top + 8,
    8,
    Math.max(8, deskRect.height - 80),
  );

  delete controlPanel.dataset.centerX;
  delete controlPanel.dataset.height;
  delete controlPanel.dataset.userPositioned;
  controlPanel.style.left = "";
  controlPanel.style.top = "";
  controlPanel.style.height = "";
  controlPanel.style.setProperty(
    "--control-panel-anchor-left",
    `${anchorLeft}px`,
  );
  controlPanel.style.setProperty(
    "--control-panel-anchor-top",
    `${anchorTop}px`,
  );
}

function getItemForMenuKeyboardToggle(target) {
  const targetItem = target?.closest?.(".planner-item");

  if (targetItem && getPlannerItems().includes(targetItem)) {
    return targetItem;
  }

  const targetControls = target?.closest?.(".widget-panel");
  const ownerId = targetControls?.dataset.ownerId;
  const ownerItem = ownerId
    ? getPlannerItems().find((item) => item.dataset.templateId === ownerId)
    : null;

  if (ownerItem) {
    return ownerItem;
  }

  return selectedItem && getPlannerItems().includes(selectedItem)
    ? selectedItem
    : null;
}

function handleMenuToggleKey(event) {
  if (
    !isCancelKey(event) ||
    activeAction ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey
  ) {
    return false;
  }

  if (event.target.closest("[contenteditable='true']")) {
    return false;
  }

  const item = getItemForMenuKeyboardToggle(event.target);

  if (!item) {
    return false;
  }

  event.preventDefault();
  if (!selectedItems.has(item)) {
    selectItem(item);
  }

  if (item.classList.contains("is-widget-panel-open")) {
    closeItemMenu(item);
  } else {
    openItemMenu(item);
  }

  return true;
}

function setPageCornerOverlay(page, isVisible) {
  if (!isVisible || !page) {
    pageCornerFoldOverlay.classList.remove("is-visible");
    pageCornerFoldOverlayNumber.textContent = "";
    return;
  }

  const fold = page.querySelector(".page-corner-fold");
  const foldNumber = page.querySelector("[data-page-fold-number]");

  if (!fold) {
    return;
  }

  const deskRect = plannerDesk.getBoundingClientRect();
  const foldRect = fold.getBoundingClientRect();
  const side = getPageId(page);

  pageCornerFoldOverlay.style.left = `${foldRect.left - deskRect.left}px`;
  pageCornerFoldOverlay.style.top = `${foldRect.top - deskRect.top}px`;
  pageCornerFoldOverlay.style.width = `${foldRect.width}px`;
  pageCornerFoldOverlay.style.height = `${foldRect.height}px`;
  pageCornerFoldOverlayNumber.textContent = foldNumber?.textContent || "";
  pageCornerFoldOverlay.classList.toggle("is-left", side === "left");
  pageCornerFoldOverlay.classList.toggle("is-right", side === "right");
  pageCornerFoldOverlay.classList.add("is-visible");
}
