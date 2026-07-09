// NOTE: Start The App And Connect The Buttons
function startPlanner() {
  window.prettyPlanner = {
    serializeTemplate: serializePlannerTemplate,
    turnNotebookSpread,
    version: "planner-storage-155",
  };
  window.perfectPlanner = window.prettyPlanner;

  syncAllSettingChoiceInputs();
  if (keyboardControlsPanel) {
    KeyboardControls.renderControlsPanel(keyboardControlsPanel);
  }
  initializeDefaultControls();
  initializeCustomSelects();
  initializeNotebookControlSections();
  initializeControlSections(controlPanel);
  initializePalettePreview();
  updateControlPanelSteps();
  updateObjectControlsState();
  updateControlPanelFocusState();
  syncResponsiveViewportClass();
  syncCurrentActionUi();
  applyPlannerConfig();
  restorePlannerBook(plannerConfig.paperKey);
  syncNotebookSpread();
  applyViewControls();
  renderKeyHints();
  syncControlPanelSnap();
  paperSelect.addEventListener("change", () => {
    syncSettingChoiceInputs("paper");
    changePaperSetting();
  });
  paperColorSelect.addEventListener("change", () => {
    changePlannerSetting();
    updatePalettePreview();
  });
  accentColorSelect?.addEventListener("change", () => {
    changePlannerSetting();
    updateAccentPalettePreview();
  });
  deskColorSelect.addEventListener("change", () => {
    syncSettingChoiceInputs("desk-color");
    changePlannerSetting();
  });
  settingSelects.forEach((select) => {
    select.addEventListener("change", () => updateCustomSelectDisplay(select));
  });
  controlChoiceInputs.forEach((input) => {
    input.addEventListener("change", () => changeSettingChoice(input));
  });
  guideInputs.forEach((input) => {
    input.addEventListener("change", changePlannerSetting);
  });
  controlPanel.addEventListener("change", (event) => {
    const section = event.target.closest("[data-control-section]");

    if (section) {
      window.setTimeout(() => closeControlSection(section), 0);
    }
  });
  insertPageButton?.addEventListener("click", insertFocusedPage);
  deletePageButton?.addEventListener("click", deleteFocusedPage);
  clearPageButton?.addEventListener("click", clearFocusedPage);
  clearBookButton?.addEventListener("click", clearCurrentBook);
  document.addEventListener(
    "click",
    (event) => {
      const toggle = event.target.closest("[data-color-panel-matrix-toggle]");

      if (!toggle) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      const shouldOpen = toggle.getAttribute("aria-expanded") !== "true";

      activeColorMatrixToggle = toggle;
      setColorMatrixOpen(shouldOpen);
    },
    true,
  );
  PageControls.bindPageTurnControls({
    pages,
    getGridMetrics: () => ({
      gridColumns: plannerConfig.gridColumns,
      gridRows: plannerConfig.gridRows,
    }),
    turnNotebookSpread,
    setCornerOverlay: setPageCornerOverlay,
  });
  controlPanelTabs.forEach((tab) => {
    tab.addEventListener("click", (event) => {
      if (shouldSkipNextTabClick) {
        shouldSkipNextTabClick = false;
        return;
      }

      const isActiveTab = tab.getAttribute("aria-selected") === "true";

      if (isActiveTab && controlPanel.classList.contains("is-open")) {
        closeControlPanel();
        return;
      }

      selectControlPanelTab(tab.dataset.controlPanelTab);
      openControlPanel();
    });
  });
  controlPanel.addEventListener("pointerdown", (event) => {
    const tab = event.target.closest("[data-control-panel-tab]");

    if (!tab || controlPanel.classList.contains("is-open")) {
      return;
    }

    selectControlPanelTab(tab.dataset.controlPanelTab);
    openControlPanel();
    shouldSkipNextTabClick = true;
  });
  controlPanelStepButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (button.getAttribute("aria-disabled") === "true") {
        return;
      }
      stepControlPanelTab(Number(button.dataset.controlPanelStep) || 0);
    });
  });
  controlPanel.addEventListener("pointerdown", (event) => {
    if (event.target.closest("[data-control-panel-tab]")) {
      return;
    }

    const resizeMode = getControlPanelVerticalResizeMode(event);

    if (resizeMode) {
      startControlPanelResize(event, resizeMode);
      return;
    }

    startControlPanelMove(event);
  });
  controlPanel.addEventListener("pointermove", (event) => {
    if (activeAction) {
      return;
    }

    controlPanel.classList.toggle(
      "is-resize-ns",
      Boolean(getControlPanelVerticalResizeMode(event)),
    );
  });
  controlPanel.addEventListener("pointerleave", () => {
    if (!activeAction) {
      controlPanel.classList.remove("is-resize-ns");
    }
  });
  initializeCalendarSourcePreviews(sourceItems);
  loadPlannerThemeData();
  sourceItems.forEach((sourceItem) => {
    sourceItem.addEventListener("pointerdown", startSourceMove, true);
    sourceItem.addEventListener("mousedown", startSourceMove, true);
  });
  document.addEventListener("pointerdown", hideKeyboardCursorForPointer, true);
  document.addEventListener(
    "pointerdown",
    closeColorMatrixFromOutsidePointer,
    true,
  );
  document.addEventListener(
    "pointerdown",
    closeFloatingWidgetPanelsFromOutsidePointer,
    true,
  );
  plannerDesk.addEventListener("pointerdown", startMarquee);
  plannerDesk.addEventListener("mousedown", preventMiddleMouseAutoscroll);
  plannerDesk.addEventListener("auxclick", preventMiddleMouseAutoscroll);
  plannerDesk.addEventListener("pointermove", updateDeskResizeCursor);
  plannerDesk.addEventListener("pointerleave", () => {
    plannerDesk.style.cursor = "";
    if (selectedItem) {
      setResizeCursor(selectedItem, "");
    }
  });
  plannerDesk.addEventListener("wheel", zoomViewFromWheel, {
    passive: false,
  });
  document.addEventListener(
    "pointerdown",
    finishTextEditingFromOutsidePointer,
    true,
  );
  document.addEventListener(
    "pointerdown",
    collapseMenusFromOutsidePointer,
    true,
  );
  document.addEventListener("click", (event) => {
    if (shouldSkipNextClear) {
      shouldSkipNextClear = false;
      return;
    }

    customSelectDetails.forEach((details) => {
      if (!details.contains(event.target)) {
        details.removeAttribute("open");
      }
    });

    if (
      colorMatrixPopover &&
      !colorMatrixPopover.hidden &&
      !event.target.closest("[data-color-panel-matrix]") &&
      !event.target.closest("[data-color-panel-matrix-toggle]")
    ) {
      setColorMatrixOpen(false);
    }

    document
      .querySelectorAll("[data-control-section].is-open")
      .forEach((section) => {
        if (
          !section.contains(event.target) &&
          !event.target.closest(
            "[data-color-panel-matrix], [data-color-panel-hex]",
          )
        ) {
          closeControlSection(section);
        }
      });

    if (
      !event.target.closest(".planner-item") &&
      !event.target.closest(".control-panel") &&
      !event.target.closest("[data-color-panel-matrix], [data-color-panel-hex]")
    ) {
      clearSelection();
    }
  });
  document.addEventListener(
    "pointerdown",
    closeHexPopoverFromOutsidePointer,
    true,
  );
  document.addEventListener("mousedown", handleMousePageTurnButton, true);
  document.addEventListener("auxclick", handleMousePageTurnButton, true);
  mainMenuToggleButton?.addEventListener("click", toggleMainMenu);
  document.addEventListener("keydown", (event) => {
    handleUndoShortcut(event);
    handleClipboardShortcut(event);
    handleTextEditEnterKey(event);
    handleTextEditFinishKey(event);
    blockSpacebarShortcut(event);
    handleKeyboardPlacementKey(event);
    handleMainMenuArrowKey(event);
    handleMainMenuWasdKey(event);
    handlePageTurnKey(event);
    handleMenuEnterKey(event);
    handleSelectedTextEditKey(event);
    handleKeyboardCursorActivateKey(event);
    toggleMainMenuFromKeyboard(event);
    handleNumberedMenuTabKey(event);
    handleSelectedDeleteKey(event);
    handleCancelKey(event);
    handleViewZoomKey(event);
    handlePageFocusNavigationKey(event);
    toggleGroupFromKeyboard(event);
    toggleGuidesFromKeyboard(event);
    if (!event.defaultPrevented && isCancelKey(event)) {
      const didToggleMenu = handleMenuToggleKey(event);

      closeCustomSelects();
      clearSelectFocus();
      setColorMatrixOpen(false);
      closeHexPopover();
      if (didToggleMenu) {
        return;
      }
    }
  });
  document.documentElement.dataset.appReady = "true";
  window.addEventListener("pointermove", moveActiveItem);
  window.addEventListener("pointerup", endActiveItem);
  window.addEventListener("pointercancel", endActiveItem);
  window.addEventListener("resize", handleWindowResize);
  window.addEventListener("scroll", positionColorMatrix, true);
  window.setInterval(refreshRelativeCalendarWidgets, 60 * 60 * 1000);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      refreshRelativeCalendarWidgets();
    }
  });
  singlePageViewportQuery.addEventListener("change", applyResponsiveViewMode);
}

startPlanner();
