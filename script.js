const pages = Array.from(document.querySelectorAll("[data-page]"));
const plannerDesk = document.querySelector(".planner-desk");
const sourceSticky = document.querySelector("[data-create-item]");

const resizeEdgeSize = 12;
const pageStickDepth = 2;
const stickyGridUnits = 12;
const templateSchemaVersion = 1;

let activeAction = null;
let selectedItem = null;
let nextTemplateItemId = 1;

function getGridSize(page) {
     const rect = page.getBoundingClientRect();

     return {
          x: rect.width / 34,
          y: rect.height / 44
     };
}

function getPageId(page) {
     return page === pages[0] ? "left" : "right";
}

function getGridTemplateBox(item, page) {
     const grid = getGridSize(page);
     const box = getItemBox(item);

     return {
          x: Math.round(box.x / grid.x),
          y: Math.round(box.y / grid.y),
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

function serializePlannerItem(item) {
     const page = item.closest("[data-page]");
     const baseItem = {
          id: item.dataset.templateId,
          type: "sticky-note",
          style: {
               fillColor: item.dataset.fillColor,
               borderColor: item.dataset.borderColor,
               borderWidth: Number(item.dataset.borderWidth)
          }
     };

     if (page) {
          return {
               ...baseItem,
               placement: "page",
               page: getPageId(page),
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
               size: "letter",
               widthInches: 8.5,
               heightInches: 11,
               gridIntervalInches: 0.25,
               gridColumns: 34,
               gridRows: 44
          },
          spread: {
               pages: ["left", "right"],
               spineLeewayGridColumns: 1
          },
          items: Array.from(document.querySelectorAll(".planner-item:not(.is-floating-source)")).map(serializePlannerItem)
     };
}

function notifyTemplateChanged() {
     window.dispatchEvent(new CustomEvent("perfectplanner:templatechange", {
          detail: serializePlannerTemplate()
     }));
}

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

function getItemBox(item) {
     return {
          x: Number(item.dataset.x) || 0,
          y: Number(item.dataset.y) || 0,
          width: Number(item.dataset.width) || item.offsetWidth,
          height: Number(item.dataset.height) || item.offsetHeight
     };
}

function setItemBox(item, box) {
     item.dataset.x = String(box.x);
     item.dataset.y = String(box.y);
     item.dataset.width = String(box.width);
     item.dataset.height = String(box.height);
     item.style.left = `${box.x}px`;
     item.style.top = `${box.y}px`;
     item.style.width = `${box.width}px`;
     item.style.height = `${box.height}px`;
     updateItemSizeLabel(item);
}

function setItemStyle(item, style) {
     item.dataset.fillColor = style.fillColor || item.dataset.fillColor || "#f9e2af";
     item.dataset.borderColor = style.borderColor || item.dataset.borderColor || "rgba(17, 17, 17, 0.18)";
     item.dataset.borderWidth = style.borderWidth || item.dataset.borderWidth || "1";
     item.style.setProperty("--sticky-fill", item.dataset.fillColor);
     item.style.setProperty("--sticky-border-color", item.dataset.borderColor);
     item.style.setProperty("--sticky-border-size", `${item.dataset.borderWidth}px`);

     const fillInput = item.querySelector("[data-style-control='fill']");
     const borderColorInput = item.querySelector("[data-style-control='border-color']");
     const borderWidthSelect = item.querySelector("[data-style-control='border-width']");

     if (fillInput) {
          fillInput.value = item.dataset.fillColor;
     }

     if (borderColorInput && item.dataset.borderColor.startsWith("#")) {
          borderColorInput.value = item.dataset.borderColor;
     }

     if (borderWidthSelect) {
          borderWidthSelect.value = item.dataset.borderWidth;
     }
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
     const fallbackSize = {
          width: grid.x * stickyGridUnits,
          height: grid.y * stickyGridUnits
     };

     if (item.classList.contains("is-floating-source")) {
          return fallbackSize;
     }

     return {
          width: current.width ? Math.round(current.width / grid.x) * grid.x : fallbackSize.width,
          height: current.height ? Math.round(current.height / grid.y) * grid.y : fallbackSize.height
     };
}

function clearDragOver() {
     pages.forEach((page) => page.classList.remove("is-drag-over"));
}

function selectItem(item) {
     if (selectedItem && selectedItem !== item) {
          selectedItem.classList.remove("is-selected", "is-menu-open", "is-resizing", "is-resize-ew", "is-resize-ns", "is-resize-nwse", "is-resize-nesw");
     }

     selectedItem = item;
     selectedItem.classList.add("is-selected");
}

function clearSelection() {
     if (!selectedItem) {
          return;
     }

     selectedItem.classList.remove("is-selected", "is-menu-open", "is-resizing", "is-resize-ew", "is-resize-ns", "is-resize-nwse", "is-resize-nesw");
     selectedItem = null;
}

function closeItemMenus(exceptItem = null) {
     document.querySelectorAll(".planner-item.is-menu-open").forEach((item) => {
          if (item !== exceptItem) {
               item.classList.remove("is-menu-open");
          }
     });
}

function markGridState(item, isOnGrid) {
     item.classList.toggle("is-on-grid", isOnGrid);
}

function markSnapReady(item, isSnapReady) {
     item.classList.toggle("is-snap-ready", isSnapReady);
}

function getResizeMode(item, event) {
     if (item !== selectedItem) {
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
     const grid = getGridSize(page);
     const current = getItemBox(item);
     const rawX = clientX - pageRect.left - offsetX;
     const rawY = clientY - pageRect.top - offsetY;
     const nextX = shouldClamp ? snap(rawX, grid.x) : rawX;
     const nextY = shouldClamp ? snap(rawY, grid.y) : rawY;
     const minX = grid.x * pageStickDepth - current.width;
     const minY = grid.y * pageStickDepth - current.height;
     const maxX = pageRect.width - grid.x * pageStickDepth;
     const maxY = pageRect.height - grid.y * pageStickDepth;

     return {
          ...current,
          x: shouldClamp ? clamp(nextX, minX, maxX) : nextX,
          y: shouldClamp ? clamp(nextY, minY, maxY) : nextY
     };
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
     const grid = getGridSize(page);
     const minWidth = grid.x * 2;
     const minHeight = grid.y * 2;
     const right = current.x + current.width;
     const bottom = current.y + current.height;
     const pointerX = snap(clientX - pageRect.left, grid.x);
     const pointerY = snap(clientY - pageRect.top, grid.y);
     const nextLeft = resizeLeft ? clamp(pointerX, grid.x * pageStickDepth - current.width, right - minWidth) : current.x;
     const nextTop = resizeTop ? clamp(pointerY, grid.y * pageStickDepth - current.height, bottom - minHeight) : current.y;
     const nextRight = resizeRight ? clamp(pointerX, current.x + minWidth, pageRect.width - grid.x * pageStickDepth + current.width) : right;
     const nextBottom = resizeBottom ? clamp(pointerY, current.y + minHeight, pageRect.height - grid.y * pageStickDepth + current.height) : bottom;

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

function setResizeCursor(item, resizeMode) {
     item.classList.remove("is-resize-ew", "is-resize-ns", "is-resize-nwse", "is-resize-nesw");

     const resizeClass = getResizeClass(resizeMode);

     if (resizeClass) {
          item.classList.add(resizeClass);
     }
}

function updateItemSizeLabel(item) {
     const label = item.querySelector(".item-size-label");

     if (!label) {
          return;
     }

     const page = item.closest("[data-page]");
     const box = getItemBox(item);
     const width = page ? Math.round(box.width / getGridSize(page).x) : Math.round(box.width);
     const height = page ? Math.round(box.height / getGridSize(page).y) : Math.round(box.height);

     label.textContent = `${width} x ${height}`;
}

function makePlannerItem() {
     const item = document.createElement("div");
     const sizeLabel = document.createElement("span");
     const controls = document.createElement("div");
     const duplicateButton = document.createElement("button");
     const fillLabel = document.createElement("label");
     const fillInput = document.createElement("input");
     const borderColorLabel = document.createElement("label");
     const borderColorInput = document.createElement("input");
     const borderWidthLabel = document.createElement("label");
     const borderWidthSelect = document.createElement("select");
     const deleteButton = document.createElement("button");

     item.className = "planner-item";
     item.dataset.templateId = `sticky-${nextTemplateItemId}`;
     nextTemplateItemId += 1;
     item.tabIndex = 0;
     item.setAttribute("role", "button");
     item.setAttribute("aria-label", "Sticky note");

     sizeLabel.className = "item-size-label";
     sizeLabel.setAttribute("aria-hidden", "true");
     controls.className = "item-controls";
     controls.setAttribute("role", "menu");
     duplicateButton.className = "item-control";
     duplicateButton.type = "button";
     duplicateButton.textContent = "Duplicate";
     duplicateButton.setAttribute("aria-label", "Duplicate sticky note");
     fillLabel.className = "item-control-row";
     fillLabel.textContent = "Fill";
     fillInput.type = "color";
     fillInput.value = "#f9e2af";
     fillInput.dataset.styleControl = "fill";
     fillInput.setAttribute("aria-label", "Sticky note fill color");
     borderColorLabel.className = "item-control-row";
     borderColorLabel.textContent = "Border";
     borderColorInput.type = "color";
     borderColorInput.value = "#d4ccd0";
     borderColorInput.dataset.styleControl = "border-color";
     borderColorInput.setAttribute("aria-label", "Sticky note border color");
     borderWidthLabel.className = "item-control-row";
     borderWidthLabel.textContent = "Border size";
     borderWidthSelect.setAttribute("aria-label", "Sticky note border thickness");
     borderWidthSelect.dataset.styleControl = "border-width";
     ["1", "2", "3", "4", "5"].forEach((value) => {
          const option = document.createElement("option");

          option.value = value;
          option.textContent = `${value}px`;
          borderWidthSelect.append(option);
     });
     deleteButton.className = "item-control";
     deleteButton.type = "button";
     deleteButton.textContent = "Delete";
     deleteButton.setAttribute("aria-label", "Delete sticky note");

     fillLabel.append(fillInput);
     borderColorLabel.append(borderColorInput);
     borderWidthLabel.append(borderWidthSelect);
     controls.append(duplicateButton, fillLabel, borderColorLabel, borderWidthLabel, deleteButton);
     item.append(sizeLabel, controls);
     setItemStyle(item, {
          fillColor: fillInput.value,
          borderColor: borderColorInput.value,
          borderWidth: borderWidthSelect.value
     });

     item.addEventListener("pointerdown", (event) => {
          if (event.target.closest(".item-controls")) {
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
     item.addEventListener("click", () => selectItem(item));
     item.addEventListener("focus", () => selectItem(item));
     item.addEventListener("contextmenu", (event) => {
          event.preventDefault();
          selectItem(item);
          closeItemMenus(item);
          item.classList.add("is-menu-open");
     });
     controls.addEventListener("pointerdown", (event) => event.stopPropagation());
     controls.addEventListener("click", (event) => event.stopPropagation());
     duplicateButton.addEventListener("click", (event) => {
          event.stopPropagation();
          duplicateItem(item);
     });
     fillInput.addEventListener("input", () => {
          setItemStyle(item, {
               fillColor: fillInput.value
          });
          notifyTemplateChanged();
     });
     borderColorInput.addEventListener("input", () => {
          setItemStyle(item, {
               borderColor: borderColorInput.value
          });
          notifyTemplateChanged();
     });
     borderWidthSelect.addEventListener("change", () => {
          setItemStyle(item, {
               borderWidth: borderWidthSelect.value
          });
          notifyTemplateChanged();
     });
     deleteButton.addEventListener("click", (event) => {
          event.stopPropagation();
          deleteItem(item);
     });

     return item;
}

function addItemToPage(page, x = 4, y = 4) {
     const item = makePlannerItem();
     const grid = getGridSize(page);
     const box = {
          x: snap(x * grid.x, grid.x),
          y: snap(y * grid.y, grid.y),
          width: grid.x * stickyGridUnits,
          height: grid.y * stickyGridUnits
     };

     page.append(item);
     setItemBox(item, box);
     markGridState(item, true);
     selectItem(item);

     return item;
}

function duplicateItem(item) {
     const page = item.closest("[data-page]");
     const box = getItemBox(item);
     const duplicate = makePlannerItem();
     const parent = page || plannerDesk;
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
     setItemStyle(duplicate, {
          fillColor: item.dataset.fillColor,
          borderColor: item.dataset.borderColor,
          borderWidth: item.dataset.borderWidth
     });
     setItemBox(duplicate, nextBox);
     markGridState(duplicate, Boolean(page));
     selectItem(duplicate);
     notifyTemplateChanged();
}

function deleteItem(item) {
     item.remove();
     selectedItem = null;
     notifyTemplateChanged();
}

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
     const snappedSize = getGridSnappedSize(item, page);

     page.append(item);
     item.classList.remove("is-floating-source");
     markGridState(item, true);
     setItemBox(item, {
          ...getItemBox(item),
          width: snappedSize.width,
          height: snappedSize.height
     });
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
}

function setFloatingBox(item, clientX, clientY, offsetX, offsetY) {
     item.style.left = `${clientX - offsetX}px`;
     item.style.top = `${clientY - offsetY}px`;
}

function startMove(item, event) {
     const page = item.closest("[data-page]");
     const itemRect = item.getBoundingClientRect();

     event.preventDefault();
     closeItemMenus();
     selectItem(item);
     activeAction = {
          type: "move",
          item,
          page,
          offsetX: event.clientX - itemRect.left,
          offsetY: event.clientY - itemRect.top
     };
     item.classList.add("is-dragging");

     try {
          item.setPointerCapture(event.pointerId);
     } catch {
     }
}

function startSourceMove(event) {
     const item = makePlannerItem();
     const sourceRect = sourceSticky.getBoundingClientRect();
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
          offsetX,
          offsetY
     };

     try {
          item.setPointerCapture(event.pointerId);
     } catch {
     }
}

function startResize(item, event, mode) {
     event.preventDefault();
     closeItemMenus();
     selectItem(item);
     updateItemSizeLabel(item);
     activeAction = {
          type: "resize",
          item,
          page: item.closest("[data-page]"),
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

          markGridState(activeAction.item, false);
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

     try {
          activeAction.item.releasePointerCapture(event.pointerId);
     } catch {
     }

     if (activeAction.type === "source" || activeAction.type === "move") {
          const page = getPageFromDraggedBox(
               activeAction.item,
               event.clientX,
               event.clientY,
               activeAction.offsetX,
               activeAction.offsetY
          );

          if (page) {
               snapItemToPage(activeAction.item, page, event);
          } else {
               placeItemOnDesk(activeAction.item, event);
          }

          activeAction.item.classList.remove("is-dragging");
          selectItem(activeAction.item);
     } else {
          activeAction.item.classList.remove("is-dragging", "is-resizing");
          selectItem(activeAction.item);
     }

     markSnapReady(activeAction.item, false);
     notifyTemplateChanged();
     activeAction = null;
     clearDragOver();
}

window.perfectPlanner = {
     serializeTemplate: serializePlannerTemplate
};

sourceSticky.addEventListener("pointerdown", startSourceMove);
document.addEventListener("click", (event) => {
     if (!event.target.closest(".planner-item")) {
          clearSelection();
     }
});
window.addEventListener("pointermove", moveActiveItem);
window.addEventListener("pointerup", endActiveItem);
window.addEventListener("pointercancel", endActiveItem);
