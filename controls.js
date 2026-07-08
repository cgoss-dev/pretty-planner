// NOTE: Page Turns, Page Numbers, And Corner Folds
window.PageControls = (() => {
     let pageTurnTimer = 0;

     function applyPageNumberLayering(root = document.documentElement) {
          PlannerRootControls.setRootProperties(PlannerRootControls.controls.pageNumbers.layering, root);
     }

     function applyCornerFlipControls(root = document.documentElement) {
          PlannerRootControls.setRootProperties({
               ...PlannerRootControls.controls.pageCornerFlip.layering,
               ...PlannerRootControls.controls.pageCornerFlip.debugColors
          }, root);
     }

     function applyControls(root = document.documentElement) {
          applyPageNumberLayering(root);
          applyCornerFlipControls(root);
     }

     function updatePageLabels({
          pages,
          notebook,
          currentSpreadIndex,
          notebookSpreadCount,
          notebookPageCount,
          getPageId,
          getCurrentSpreadPageNumber,
          isPageNumberAvailable,
          isFinalRightPlaceholderPage,
          formatPageNumber
     }) {
          pages.forEach((page) => {
               const side = getPageId(page);
               const pageNumberValue = getCurrentSpreadPageNumber(side);
               const pageNumber = String(pageNumberValue);
               const pageExists = isPageNumberAvailable(pageNumberValue);
               const isFinalRightPlaceholder = isFinalRightPlaceholderPage(pageNumberValue);
               const isLeft = side === "left";
               const canTurn = pageExists && (isLeft ? currentSpreadIndex > 0 : currentSpreadIndex < notebookSpreadCount - 1);
               const foldNumber = isLeft ? pageNumberValue - 1 : pageNumberValue + 1;
               const behindNumber = isLeft ? pageNumberValue - 2 : pageNumberValue + 2;

               page.dataset.pageNumber = pageNumber;
               page.classList.toggle("is-missing-page", !pageExists && !isFinalRightPlaceholder);
               page.classList.toggle("is-placeholder-page", isFinalRightPlaceholder);
               page.classList.toggle("can-turn-page", canTurn);
               page.querySelector("[data-page-number]")?.replaceChildren(pageExists ? pageNumber : "");

               page.querySelectorAll("[data-page-fold-number]").forEach((foldElement) => {
                    foldElement.textContent = canTurn ? formatPageNumber(foldNumber) : "";
               });
               page.querySelectorAll("[data-page-fold-behind-number]").forEach((foldElement) => {
                    foldElement.textContent = canTurn ? formatPageNumber(behindNumber) : "";
               });

               page.querySelector("[data-page-behind-number]")?.replaceChildren();
          });

          notebook.dataset.spreadIndex = String(currentSpreadIndex);
          notebook.dataset.spreadCount = String(notebookSpreadCount);
          notebook.dataset.pageCount = String(notebookPageCount);
     }

     function getCurrentSpreadPageNumber({ currentSpreadIndex, side = "left" }) {
          return (currentSpreadIndex * 2) + (side === "right" ? 1 : 0);
     }

     function getSpreadCountForPageCount(pageCount) {
          return Math.max(1, Math.ceil(pageCount / 2));
     }

     function normalizeNotebookPageCount({ pageCount, initialNotebookPageCount, minNotebookPageCount, maxNotebookPageCount, clamp }) {
          const roundedPageCount = Math.round(Number(pageCount)) || initialNotebookPageCount;

          return clamp(roundedPageCount, minNotebookPageCount, maxNotebookPageCount);
     }

     function getPageSideForPageNumber(pageNumber) {
          return pageNumber % 2 === 0 ? "left" : "right";
     }

     function isPageNumberAvailable({ pageNumber, notebookPageCount }) {
          return pageNumber >= 0 && pageNumber < notebookPageCount;
     }

     function isFinalRightPlaceholderPage({ pageNumber, notebookPageCount }) {
          return pageNumber === notebookPageCount && pageNumber % 2 === 1;
     }

     function isPageSideAvailable({ side, spreadIndex, notebookPageCount }) {
          return isPageNumberAvailable({
               pageNumber: (spreadIndex * 2) + (side === "right" ? 1 : 0),
               notebookPageCount
          });
     }

     function formatPageNumber({ pageNumber, notebookPageCount }) {
          return isPageNumberAvailable({ pageNumber, notebookPageCount }) ? String(pageNumber) : "";
     }

     function getFocusedPageSide() {
          return "left";
     }

     function getFocusedPageNumber({ currentSpreadIndex }) {
          return getCurrentSpreadPageNumber({
               currentSpreadIndex,
               side: getFocusedPageSide()
          });
     }

     function getNotebookPageCountState({
          pageCount,
          currentSpreadIndex,
          initialNotebookPageCount,
          minNotebookPageCount,
          maxNotebookPageCount,
          clamp
     }) {
          const notebookPageCount = normalizeNotebookPageCount({
               pageCount,
               initialNotebookPageCount,
               minNotebookPageCount,
               maxNotebookPageCount,
               clamp
          });
          const notebookSpreadCount = getSpreadCountForPageCount(notebookPageCount);
          const nextSpreadIndex = clamp(currentSpreadIndex, 0, notebookSpreadCount - 1);

          return {
               currentSpreadIndex: nextSpreadIndex,
               notebookPageCount,
               notebookSpreadCount
          };
     }

     function getFocusedPageState({ pageNumber, notebookPageCount, notebookSpreadCount, clamp }) {
          const nextPageNumber = clamp(Math.round(Number(pageNumber)) || 0, 0, notebookPageCount - 1);

          return {
               currentSpreadIndex: clamp(Math.floor(nextPageNumber / 2), 0, notebookSpreadCount - 1)
          };
     }

     function updatePageActionButtons({
          focusedPageNumber,
          notebookPageCount,
          minNotebookPageCount,
          maxNotebookPageCount,
          insertPageButton,
          deletePageButton,
          pageCountStatus
     }) {
          const focusedPageExists = isPageNumberAvailable({ pageNumber: focusedPageNumber, notebookPageCount });

          if (insertPageButton) {
               insertPageButton.disabled = notebookPageCount >= maxNotebookPageCount;
          }

          if (deletePageButton) {
               deletePageButton.disabled = notebookPageCount <= minNotebookPageCount || !focusedPageExists;
          }

          if (pageCountStatus) {
               pageCountStatus.textContent = `${notebookPageCount} pages`;
          }
     }

     function updateSpreadItemVisibility({
          items,
          currentSpreadIndex,
          notebookPageCount,
          getItemSpreadIndex,
          getItemPageNumber,
          closeItemMenu,
          selectedItems,
          setSelectedItem,
          updateObjectControlsState
     }) {
          items.forEach((item) => {
               const isPageItem = Boolean(item.dataset.pageId);
               const isPersistentPageFlag = item.dataset.itemType === "page-flag";
               const isVisible = !isPageItem || (
                    (isPersistentPageFlag || getItemSpreadIndex(item) === currentSpreadIndex) &&
                    isPageNumberAvailable({ pageNumber: getItemPageNumber(item), notebookPageCount })
               );

               item.classList.toggle("is-spread-hidden", !isVisible);
               if (!isVisible) {
                    closeItemMenu(item);
                    selectedItems.delete(item);
                    item.classList.remove("is-selected");
               }
          });
          setSelectedItem(selectedItems.size ? Array.from(selectedItems).at(-1) : null);
          updateObjectControlsState();
     }

     function syncNotebookSpread({ updatePageLabels, updateSpreadItemVisibility, refreshPageItemViews }) {
          updatePageLabels();
          updateSpreadItemVisibility();
          requestAnimationFrame(refreshPageItemViews);
     }

     function turnNotebookSpread({
          step,
          currentSpreadIndex,
          notebookSpreadCount,
          pendingSpreadTurn,
          notebook,
          clamp,
          clearSelection,
          setPendingSpreadTurn,
          setCurrentSpreadIndex,
          resetViewPanOffset,
          syncNotebookSpread,
          applyViewControls,
          notifyTemplateChanged
     }) {
          const nextSpreadIndex = clamp(currentSpreadIndex + step, 0, notebookSpreadCount - 1);

          if (nextSpreadIndex === currentSpreadIndex || pendingSpreadTurn) {
               return;
          }

          clearSelection();
          setPendingSpreadTurn({
               from: currentSpreadIndex,
               to: nextSpreadIndex,
               direction: step
          });
          animateSpreadTurn({
               notebook,
               direction: step,
               onComplete: () => {
                    setPendingSpreadTurn(null);
               }
          });
          setCurrentSpreadIndex(nextSpreadIndex);
          resetViewPanOffset();
          window.setTimeout(() => {
               syncNotebookSpread();
               applyViewControls();
               notifyTemplateChanged();
          }, PlannerRootControls.controls.pageCornerFlip.animation.spreadSyncDelayMs);
     }

     function getClearPageSides() {
          return [getFocusedPageSide()];
     }

     function insertFocusedPage({
          notebookPageCount,
          maxNotebookPageCount,
          focusedPageNumber,
          clamp,
          clearSelection,
          closeItemMenus,
          shiftPageItemsFromPage,
          setNotebookPageCount,
          setFocusedPageNumber,
          syncNotebookSpread,
          applyViewControls,
          notifyTemplateChanged
     }) {
          if (notebookPageCount >= maxNotebookPageCount) {
               return;
          }

          const insertPageNumber = clamp(focusedPageNumber, 0, notebookPageCount);

          clearSelection();
          closeItemMenus();
          shiftPageItemsFromPage(insertPageNumber, 1);
          setNotebookPageCount(notebookPageCount + 1);
          setFocusedPageNumber(insertPageNumber);
          syncNotebookSpread();
          applyViewControls();
          notifyTemplateChanged();
     }

     function deleteFocusedPage({
          notebookPageCount,
          minNotebookPageCount,
          focusedPageNumber,
          clearSelection,
          closeItemMenus,
          removeFocusedPageItems,
          setNotebookPageCount,
          setFocusedPageNumber,
          syncNotebookSpread,
          applyViewControls,
          notifyTemplateChanged
     }) {
          if (
               notebookPageCount <= minNotebookPageCount ||
               !isPageNumberAvailable({ pageNumber: focusedPageNumber, notebookPageCount })
          ) {
               return;
          }

          clearSelection();
          closeItemMenus();
          removeFocusedPageItems(focusedPageNumber);
          setNotebookPageCount(notebookPageCount - 1);
          setFocusedPageNumber(Math.min(focusedPageNumber, notebookPageCount - 1));
          syncNotebookSpread();
          applyViewControls();
          notifyTemplateChanged();
     }

     function clearFocusedPage({ clearItems, getFocusedPageItems, notifyTemplateChanged }) {
          clearItems(getFocusedPageItems());
          notifyTemplateChanged();
     }

     function clearCurrentBook({ clearCurrentBookItems, notifyTemplateChanged }) {
          clearCurrentBookItems();
          notifyTemplateChanged();
     }

     function isCornerPointer(page, event, { gridColumns, gridRows }) {
          if (!page.classList.contains("can-turn-page")) {
               return false;
          }

          const rect = page.getBoundingClientRect();
          const cellWidth = rect.width / gridColumns;
          const cellHeight = rect.height / gridRows;
          const localX = event.clientX - rect.left;
          const localY = event.clientY - rect.top;
          const hitAreaGridCells = PlannerRootControls.controls.pageCornerFlip.hitAreaGridCells;
          const isBottomCornerArea = localY >= rect.height - (cellHeight * hitAreaGridCells);

          if (page.dataset.turnPage === "next") {
               return isBottomCornerArea && localX >= rect.width - (cellWidth * hitAreaGridCells);
          }

          return isBottomCornerArea && localX <= cellWidth * hitAreaGridCells;
     }

     function bindPageTurnControls({ pages, getGridMetrics, turnNotebookSpread, setCornerOverlay = () => {} }) {
          pages.forEach((page) => {
               page.addEventListener("click", (event) => {
                    if (event.target.closest(".planner-item, .widget-panel")) {
                         return;
                    }

                    if (!isCornerPointer(page, event, getGridMetrics())) {
                         return;
                    }

                    setCornerOverlay(page, false);
                    turnNotebookSpread(page.dataset.turnPage === "next" ? 1 : -1);
               });

               page.addEventListener("pointermove", (event) => {
                    const isHover = isCornerPointer(page, event, getGridMetrics());

                    page.classList.toggle("is-corner-hover", isHover);
                    setCornerOverlay(page, isHover);
               });

               page.addEventListener("pointerleave", () => {
                    page.classList.remove("is-corner-hover");
                    setCornerOverlay(page, false);
               });
          });
     }

     function animateSpreadTurn({ notebook, direction, onComplete }) {
          window.clearTimeout(pageTurnTimer);
          notebook.classList.remove("is-turning-next", "is-turning-previous", "is-turning");
          notebook.dataset.turnDirection = direction > 0 ? "next" : "previous";
          notebook.classList.add("is-turning");

          if (direction > 0) {
               notebook.classList.add("is-turning-next");
          } else if (direction < 0) {
               notebook.classList.add("is-turning-previous");
          }

          pageTurnTimer = window.setTimeout(() => {
               notebook.classList.remove("is-turning-next", "is-turning-previous", "is-turning");
               delete notebook.dataset.turnDirection;
               onComplete?.();
          }, PlannerRootControls.controls.pageCornerFlip.animation.classResetDelayMs);
     }

     applyControls();

     return {
          animateSpreadTurn,
          applyControls,
          applyCornerFlipControls,
          applyPageNumberLayering,
          bindPageTurnControls,
          debugColors: PlannerRootControls.controls.pageCornerFlip.debugColors,
          formatPageNumber,
          getCurrentSpreadPageNumber,
          getFocusedPageNumber,
          getFocusedPageSide,
          getFocusedPageState,
          getClearPageSides,
          getNotebookPageCountState,
          getPageSideForPageNumber,
          getSpreadCountForPageCount,
          isCornerPointer,
          isFinalRightPlaceholderPage,
          isPageNumberAvailable,
          isPageSideAvailable,
          insertFocusedPage,
          layering: {
               ...PlannerRootControls.controls.pageNumbers.layering,
               ...PlannerRootControls.controls.pageCornerFlip.layering
          },
          normalizeNotebookPageCount,
          clearCurrentBook,
          clearFocusedPage,
          deleteFocusedPage,
          syncNotebookSpread,
          turnNotebookSpread,
          updatePageActionButtons,
          updateSpreadItemVisibility,
          updatePageLabels
     };
})();

// NOTE: Keyboard command labels and rendering helpers for the Controls menu tab
window.KeyboardControls = (() => {
     const groups = [
          {
               title: "Hotkeys",
               controls: [
                    { key: "M", action: "Open/Close Main Menu" },
                    { key: "</>", action: "Page Left/Right" },
                    { key: "Shift + </>", action: "First/Last Page" },
                    { key: "Tab", action: "Next Element" },
                    { key: "Shift+Tab", action: "Last Element" },
                    { key: "Enter", action: "Edit/Select" },
                    { key: "Escape", action: "Back/clear Selection" },
                    { key: "G", action: "Gridlines On/Off" },
                    { key: "Z", action: "Zoom" },
                    { key: "Delete", action: "Delete Selected" }
               ]
          }
     ];

     function getGroups() {
          // NOTE: Returns the keyboard control groups used by the Controls tab
          return groups.map((group) => ({
               ...group,
               controls: group.controls.map((control) => ({ ...control }))
          }));
     }

     function makeKeyElement(key) {
          // NOTE: Builds the visual key label for one keyboard command
          const element = document.createElement("kbd");

          element.className = "keyboard-control-key";
          element.textContent = key;

          return element;
     }

     function renderControlsPanel(container) {
          // NOTE: Renders the keyboard command reference into the Controls panel
          if (!container) {
               return;
          }

          container.replaceChildren();
          getGroups().forEach((group) => {
               const section = document.createElement("section");
               const title = document.createElement("h3");
               const list = document.createElement("dl");

               section.className = "keyboard-control-section";
               title.className = "keyboard-control-title";
               title.textContent = group.title;
               list.className = "keyboard-control-list";

               group.controls.forEach((control) => {
                    const keyTerm = document.createElement("dt");
                    const action = document.createElement("dd");

                    keyTerm.append(makeKeyElement(control.key));
                    action.textContent = control.action;
                    list.append(keyTerm, action);
               });

               section.append(title, list);
               container.append(section);
          });
     }

     return {
          getGroups,
          renderControlsPanel
     };
})();
