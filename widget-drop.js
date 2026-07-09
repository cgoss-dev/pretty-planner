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
    y: itemRect.top - deskRect.top,
  });

  if (event) {
    setItemBox(
      item,
      getDeskBox(
        item,
        event.clientX,
        event.clientY,
        activeAction.offsetX,
        activeAction.offsetY,
      ),
    );
  }
}

function snapItemToPage(item, page, event) {
  if (!canPlaceItemOnPage(item, page)) {
    return false;
  }

  const snappedSize = getGridSnappedSize(item, page);
  const isNewPageCalendar =
    activeAction.type === "source" &&
    isFullPageCalendarType(item.dataset.itemType);

  plannerDesk.append(item);
  item.classList.remove("is-floating-source");
  markGridState(item, true, page);
  setItemBox(item, {
    ...getItemBox(item),
    width: snappedSize.width,
    height: snappedSize.height,
  });

  if (isNewPageCalendar) {
    const grid = getGridSize(page);
    const origin = getGridSnapOrigin(page);

    setItemBox(item, {
      ...getItemBox(item),
      x: origin.x + grid.x,
      y: origin.y + grid.y,
      width: Math.max(grid.x, snappedSize.width - grid.x * 2),
      height: Math.max(
        grid.y,
        Math.min(
          snappedSize.height - grid.y * 2,
          item.dataset.itemType === "perpetual-calendar"
            ? grid.y * getPerpetualCalendarMaxGridRows()
            : item.dataset.itemType === "diary-view"
              ? grid.y * getDiaryViewMaxGridRows()
              : Infinity,
        ),
      ),
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
      activeAction.offsetY,
    ),
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

function moveGroupItemsToDestination(
  destinationPage,
  activeStart,
  activeFinalRect,
) {
  const deltaLeft = activeFinalRect.left - activeStart.rect.left;
  const deltaTop = activeFinalRect.top - activeStart.rect.top;
  const destinationRect = destinationPage
    ? destinationPage.getBoundingClientRect()
    : plannerDesk.getBoundingClientRect();
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
      y: (nextTop - destinationRect.top) / viewZoom,
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
        height: current.height,
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
    height,
  };
}

function updateMarqueeSelection(selectionBox) {
  const selectedFromMarquee = getPlannerItems().filter((item) =>
    boxesIntersect(getDeskRelativeRect(item), selectionBox),
  );
  const nextSelection = new Set(activeAction.baseSelection);

  selectedFromMarquee.forEach((item) => nextSelection.add(item));
  selectItems(Array.from(nextSelection));
}

function canStartViewPan(event) {
  return (
    event.button === 1 &&
    viewZoomIndex > 0 &&
    !event.target.closest(".control-panel, .widget-panel")
  );
}

function preventMiddleMouseAutoscroll(event) {
  if (canStartViewPan(event)) {
    event.preventDefault();
  }
}

function startViewPan(event) {
  event.preventDefault();
  event.stopPropagation();
  closeItemMenus();
  activeAction = {
    type: "pan-view",
    startX: event.clientX,
    startY: event.clientY,
    startPanX: viewPanOffsetX,
    startPanY: viewPanOffsetY,
    startRootPanX: getRootPixelValue("--view-pan-x"),
    startRootPanY: getRootPixelValue("--view-pan-y"),
  };
  document.documentElement.classList.add("is-view-panning");

  try {
    plannerDesk.setPointerCapture(event.pointerId);
  } catch {}
}

function startMarquee(event) {
  if (canStartViewPan(event)) {
    startViewPan(event);
    return;
  }

  if (event.button !== 0) {
    return;
  }

  if (
    event.target.closest(
      ".planner-item, .sticker-source, .control-panel, .page-snap-controls, [data-color-panel-matrix], [data-color-panel-hex]",
    )
  ) {
    return;
  }

  const resizeMode =
    selectedItem &&
    !event.target.closest(".control-panel, .widget-panel, .page-snap-controls")
      ? getResizeMode(selectedItem, event)
      : "";

  if (resizeMode) {
    startResize(selectedItem, event, resizeMode);
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
    baseSelection:
      event.metaKey || event.ctrlKey ? new Set(selectedItems) : new Set(),
  };
  setMarqueeBox(
    marquee,
    event.clientX,
    event.clientY,
    event.clientX,
    event.clientY,
  );
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
    wasSelected: selectedItems.has(item),
    selectionSize: selectedItems.size,
    items: movingItems.map((movingItem) => {
      return {
        item: movingItem,
        page: getItemPage(movingItem),
        box: getItemBox(movingItem),
        rect: movingItem.getBoundingClientRect(),
      };
    }),
    page,
    startX: event.clientX,
    startY: event.clientY,
    offsetX: event.clientX - itemRect.left,
    offsetY: event.clientY - itemRect.top,
  };

  try {
    item.setPointerCapture(event.pointerId);
  } catch {}
}

function startSourceMove(event) {
  if (activeAction || event.button > 0) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();

  const source = event.currentTarget;
  const item = makePlannerItem(source.dataset.createType || "sticker");
  const sourceRect = source.getBoundingClientRect();
  const offsetX = event.clientX - sourceRect.left;
  const offsetY = event.clientY - sourceRect.top;

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
    didMove: false,
    offsetX,
    offsetY,
  };

  document.addEventListener("pointermove", moveActiveItem, true);
  document.addEventListener("pointerup", endActiveItem, true);
  document.addEventListener("pointercancel", endActiveItem, true);
  document.addEventListener("mousemove", moveActiveItem, true);
  document.addEventListener("mouseup", endActiveItem, true);
}

function startResize(item, event, mode) {
  if (
    selectedItems.size !== 1 ||
    item.dataset.groupId ||
    item.dataset.itemType === "mini-month"
  ) {
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
    mode,
  };
  item.classList.add("is-dragging", "is-resizing");

  try {
    item.setPointerCapture(event.pointerId);
  } catch {}
}

function moveActiveItem(event) {
  if (!activeAction) {
    return;
  }

  if (activeAction.type === "pan-view") {
    event.preventDefault();
    const deltaX = event.clientX - activeAction.startX;
    const deltaY = event.clientY - activeAction.startY;

    viewPanOffsetX = activeAction.startPanX + deltaX;
    viewPanOffsetY = activeAction.startPanY + deltaY;
    setRootNumber("--view-pan-x", `${activeAction.startRootPanX + deltaX}px`);
    setRootNumber("--view-pan-y", `${activeAction.startRootPanY + deltaY}px`);
    return;
  }

  if (activeAction.type === "control-panel-move") {
    activeAction.hasMoved = true;
    setControlPanelBox(getMovedControlPanelBox(event.clientX, event.clientY));
    return;
  }

  if (activeAction.type === "control-panel-resize") {
    setControlPanelBox(getResizedControlPanelBox(event.clientY));
    return;
  }

  if (activeAction.type === "select") {
    updateMarqueeSelection(
      setMarqueeBox(
        activeAction.marquee,
        activeAction.startX,
        activeAction.startY,
        event.clientX,
        event.clientY,
      ),
    );
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
  const overlapPage =
    activeAction.type === "source" || activeAction.type === "move"
      ? getPageFromDraggedBox(
          activeAction.item,
          event.clientX,
          event.clientY,
          activeAction.offsetX,
          activeAction.offsetY,
        )
      : null;
  const page = pointerPage || overlapPage;
  clearDragOver();
  markSnapReady(activeAction.item, Boolean(overlapPage || pointerPage));

  if (page) {
    page.classList.add("is-drag-over");
  }

  if (activeAction.type === "source") {
    activeAction.didMove = true;
    setFloatingBox(
      activeAction.item,
      event.clientX,
      event.clientY,
      activeAction.offsetX,
      activeAction.offsetY,
    );
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
          false,
        ),
      );
    } else {
      setItemBox(
        activeAction.item,
        getDeskBox(
          activeAction.item,
          event.clientX,
          event.clientY,
          activeAction.offsetX,
          activeAction.offsetY,
        ),
      );
    }

    const movedBox = getItemBox(activeAction.item);
    const startingBox = activeAction.items.find(
      ({ item }) => item === activeAction.item,
    ).box;
    const deltaX = movedBox.x - startingBox.x;
    const deltaY = movedBox.y - startingBox.y;

    activeAction.items.forEach(({ item, page, box }) => {
      if (item === activeAction.item) {
        return;
      }

      setItemBox(item, {
        ...box,
        x: box.x + deltaX,
        y: box.y + deltaY,
      });
    });
  }

  if (activeAction.type === "resize") {
    setItemBox(
      activeAction.item,
      getResizedBox(
        activeAction.item,
        activeAction.page,
        event.clientX,
        event.clientY,
        activeAction.mode,
      ),
    );
    markGridState(activeAction.item, Boolean(activeAction.page));
  }
}

function endActiveItem(event) {
  if (!activeAction) {
    return;
  }

  document.removeEventListener("pointermove", moveActiveItem, true);
  document.removeEventListener("pointerup", endActiveItem, true);
  document.removeEventListener("pointercancel", endActiveItem, true);
  document.removeEventListener("mousemove", moveActiveItem, true);
  document.removeEventListener("mouseup", endActiveItem, true);

  if (activeAction.type === "pan-view") {
    try {
      plannerDesk.releasePointerCapture(event.pointerId);
    } catch {}

    document.documentElement.classList.remove("is-view-panning");
    activeAction = null;
    refreshPageItemViews();
    scheduleKeyboardCursorUpdate();
    return;
  }

  if (
    activeAction.type === "control-panel-move" ||
    activeAction.type === "control-panel-resize"
  ) {
    try {
      controlPanel.releasePointerCapture(event.pointerId);
    } catch {}

    if (activeAction.type === "control-panel-move" && activeAction.hasMoved) {
      shouldSkipNextTabClick = true;
    }

    controlPanel.classList.remove("is-dragging", "is-resizing");
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
  } catch {}

  if (activeAction.type === "pending-move") {
    if (!activeAction.wasSelected || activeAction.selectionSize < 2) {
      selectItem(activeAction.item);
    }
    activeAction = null;
    clearDragOver();
    return;
  }

  if (activeAction.type === "source" || activeAction.type === "move") {
    const pointerPage = getPageFromPoint(event.clientX, event.clientY);
    const overlapPage = getPageFromDraggedBox(
      activeAction.item,
      event.clientX,
      event.clientY,
      activeAction.offsetX,
      activeAction.offsetY,
    );
    const page = pointerPage || overlapPage;

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
      if (activeAction.type === "source") {
        closeControlPanel();
      }
    } else {
      if (activeAction.type === "source") {
        removeRejectedSourceItem();
        activeAction = null;
        clearDragOver();
        return;
      }
      placeItemOnDesk(activeAction.item, event);
    }

    if (activeAction.type === "move" && activeAction.items.length > 1) {
      moveGroupItemsToDestination(
        page,
        activeAction.items.find(({ item }) => item === activeAction.item),
        activeAction.item.getBoundingClientRect(),
      );
    }

    if (activeAction.type === "move") {
      activeAction.items.forEach(({ item }) =>
        item.classList.remove("is-dragging"),
      );
      shouldSkipNextItemClick = true;
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

document.addEventListener(
  "selectionchange",
  syncSelectedTextTargetFromSelection,
);
