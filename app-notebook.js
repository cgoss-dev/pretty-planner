// NOTE: Drawing The Notebook Pages
function getViewZoom() {
  return viewZoomLevels[viewZoomIndex].value;
}

function applyPlannerConfig() {
  const pageWidthInches = convertLength(
    plannerConfig.pageWidth,
    plannerConfig.grid.unit,
    "in",
  );
  const pageHeightInches = convertLength(
    plannerConfig.pageHeight,
    plannerConfig.grid.unit,
    "in",
  );
  const referencePaper = getReferencePaperSizeInches();
  const sourceStickerRatio =
    (50 / plannerConfig.gridColumns) * stickerGridUnits;
  const pageViewScale = paperViewScales[plannerConfig.paperKey] || 1;
  const screenPageWidthInches = pageWidthInches * pageViewScale;
  const screenPageHeightInches = pageHeightInches * pageViewScale;
  const pageSpreadWidth =
    (screenPageWidthInches / (referencePaper.width * 2)) * 100;
  const pageScreenHeightRatio = screenPageHeightInches / referencePaper.height;
  const pageSpineGapWidth = Math.max(0, 50 - pageSpreadWidth);
  const pageLeftInset = (50 - pageSpreadWidth) / 2;

  setRootNumber("--page-aspect", `${pageWidthInches} / ${pageHeightInches}`);
  setRootNumber(
    "--spread-aspect",
    `${pageWidthInches * 2} / ${pageHeightInches}`,
  );
  setRootNumber(
    "--notebook-screen-aspect",
    `${referencePaper.width * 2} / ${referencePaper.height}`,
  );
  setRootNumber(
    "--page-screen-width",
    `${(screenPageWidthInches / referencePaper.width) * 100}%`,
  );
  setRootNumber(
    "--page-screen-height",
    `${(screenPageHeightInches / referencePaper.height) * 100}%`,
  );
  setRootNumber("--page-spread-width", `${pageSpreadWidth}%`);
  setRootNumber("--page-spine-gap-ratio", pageSpineGapWidth / 100);
  setRootNumber("--page-turn-left", `${pageLeftInset}%`);
  setRootNumber("--page-turn-right", `${50 + pageLeftInset}%`);
  setRootNumber("--page-spread-left-left", `${pageSpineGapWidth}%`);
  setRootNumber(
    "--page-joined-left-left",
    `${pageLeftInset + pageSpineGapWidth}%`,
  );
  setRootNumber("--page-joined-right-left", `${50 - pageLeftInset}%`);
  setRootNumber(
    "--dot-grid-size-x",
    `calc(100% / ${plannerConfig.gridColumns})`,
  );
  setRootNumber("--dot-grid-size-y", `calc(100% / ${plannerConfig.gridRows})`);
  setRootNumber(
    "--dot-grid-half-size-x",
    `calc(50% / ${plannerConfig.gridColumns})`,
  );
  setRootNumber(
    "--dot-grid-half-size-y",
    `calc(50% / ${plannerConfig.gridRows})`,
  );
  setRootNumber(
    "--notebook-dot-grid-size-x",
    `calc(50% / ${plannerConfig.gridColumns})`,
  );
  setRootNumber(
    "--notebook-grid-cell-width",
    `calc(var(--notebook-width) / ${plannerConfig.gridColumns * 2})`,
  );
  PlannerRootControls.setRootProperties(
    PlannerRootControls.getPageBadgeRootProperties({
      pageSpreadWidth,
      pageScreenHeightRatio,
      gridColumns: plannerConfig.gridColumns,
      gridRows: plannerConfig.gridRows,
    }),
  );
  syncGridSnapOrigins();
  setRootNumber("--notebook-width", getNotebookWidthFormula());
  setRootNumber(
    "--notebook-height",
    "calc(var(--notebook-width) / var(--notebook-screen-aspect))",
  );
  setRootNumber(
    "--source-sticker-size",
    `calc(var(--notebook-width) * ${sourceStickerRatio / 100})`,
  );
  setRootNumber("--print-page-width", `${pageWidthInches}in`);
  setRootNumber("--print-page-height", `${pageHeightInches}in`);
  setRootNumber("--print-spread-width", `${pageWidthInches * 2}in`);
  setRootNumber("--paper", plannerConfig.paperColor.color);
  setRootNumber("--color-rainbow", plannerConfig.accentColor.color);
  setRootNumber("--desk", plannerConfig.deskColor.color);
  setRootNumber("--desk-image", plannerConfig.deskColor.image || "none");
  setRootNumber("--desk-size", plannerConfig.deskColor.size || "auto");
  setRootLength(
    "--half-x",
    (plannerConfig.halfColumn / plannerConfig.gridColumns) * 100,
  );
  setRootLength(
    "--half-left-x",
    (plannerConfig.halfLeftColumn / plannerConfig.gridColumns) * 100,
  );
  setRootLength(
    "--half-right-x",
    (plannerConfig.halfRightColumn / plannerConfig.gridColumns) * 100,
  );
  setRootLength(
    "--half-y",
    (plannerConfig.halfRow / plannerConfig.gridRows) * 100,
  );
  setRootLength(
    "--third-x-1",
    (plannerConfig.thirdColumnOne / plannerConfig.gridColumns) * 100,
  );
  setRootLength(
    "--third-x-2",
    (plannerConfig.thirdColumnTwo / plannerConfig.gridColumns) * 100,
  );
  setRootLength(
    "--third-left-x-1",
    (plannerConfig.thirdLeftColumnOne / plannerConfig.gridColumns) * 100,
  );
  setRootLength(
    "--third-left-x-2",
    (plannerConfig.thirdLeftColumnTwo / plannerConfig.gridColumns) * 100,
  );
  setRootLength(
    "--third-right-x-1",
    (plannerConfig.thirdRightColumnOne / plannerConfig.gridColumns) * 100,
  );
  setRootLength(
    "--third-right-x-2",
    (plannerConfig.thirdRightColumnTwo / plannerConfig.gridColumns) * 100,
  );
  setRootLength(
    "--third-y-1",
    (plannerConfig.thirdRowOne / plannerConfig.gridRows) * 100,
  );
  setRootLength(
    "--third-y-2",
    (plannerConfig.thirdRowTwo / plannerConfig.gridRows) * 100,
  );
  setRootLength(
    "--fourth-x-1",
    (plannerConfig.fourthColumnOne / plannerConfig.gridColumns) * 100,
  );
  setRootLength(
    "--fourth-x-2",
    (plannerConfig.fourthColumnTwo / plannerConfig.gridColumns) * 100,
  );
  setRootLength(
    "--fourth-x-3",
    (plannerConfig.fourthColumnThree / plannerConfig.gridColumns) * 100,
  );
  setRootLength(
    "--fourth-left-x-1",
    (plannerConfig.fourthLeftColumnOne / plannerConfig.gridColumns) * 100,
  );
  setRootLength(
    "--fourth-left-x-2",
    (plannerConfig.fourthLeftColumnTwo / plannerConfig.gridColumns) * 100,
  );
  setRootLength(
    "--fourth-left-x-3",
    (plannerConfig.fourthLeftColumnThree / plannerConfig.gridColumns) * 100,
  );
  setRootLength(
    "--fourth-right-x-1",
    (plannerConfig.fourthRightColumnOne / plannerConfig.gridColumns) * 100,
  );
  setRootLength(
    "--fourth-right-x-2",
    (plannerConfig.fourthRightColumnTwo / plannerConfig.gridColumns) * 100,
  );
  setRootLength(
    "--fourth-right-x-3",
    (plannerConfig.fourthRightColumnThree / plannerConfig.gridColumns) * 100,
  );
  setRootLength(
    "--fourth-y-1",
    (plannerConfig.fourthRowOne / plannerConfig.gridRows) * 100,
  );
  setRootLength(
    "--fourth-y-2",
    (plannerConfig.fourthRowTwo / plannerConfig.gridRows) * 100,
  );
  setRootLength(
    "--fourth-y-3",
    (plannerConfig.fourthRowThree / plannerConfig.gridRows) * 100,
  );
  setRootNumber(
    "--third-guide-opacity",
    plannerConfig.guides.thirds ? "0.25" : "0",
  );
  setRootNumber(
    "--fourth-guide-opacity",
    plannerConfig.guides.fourths ? "0.25" : "0",
  );

  delete controlPanel.dataset.width;
  controlPanel.style.width = "";

  delete controlPanel.dataset.height;
  controlPanel.style.height = "";

  delete controlPanel.dataset.centerX;
  controlPanel.style.left = "";

  document.documentElement.dataset.paper = plannerConfig.paperKey;
  document.documentElement.dataset.paperColor = plannerConfig.paperColorKey;
  document.documentElement.dataset.accentColor = plannerConfig.accentColorKey;
  document.documentElement.dataset.deskColor = plannerConfig.deskColorKey;
  document.documentElement.dataset.grid = plannerConfig.gridKey;
  document.documentElement.dataset.guideThirds = String(
    plannerConfig.guides.thirds,
  );
  document.documentElement.dataset.guideFourths = String(
    plannerConfig.guides.fourths,
  );
}

function initializeDefaultControls() {
  const bodyTextColorSelect = document.querySelector(
    "[data-default-control='body-text-color'], [data-default-control='text-color']",
  );

  if (bodyTextColorSelect) {
    initializePaletteColorControl(
      bodyTextColorSelect,
      defaultTextColorSwatches,
      plannerDefaultSettings.text.color,
      (nextColor) => {
        setDefaultControlValue(
          bodyTextColorSelect.dataset.defaultControl,
          nextColor,
        );
        savePlannerState();
      },
    );
  }

  defaultControls.forEach((control) => {
    if (control.matches("select")) {
      if (
        ["text-color", "body-text-color"].includes(
          control.dataset.defaultControl,
        )
      ) {
        return;
      }
      makeCustomSelect(control);
      control.addEventListener("change", () => {
        setDefaultControlValue(control.dataset.defaultControl, control.value);
        updateCustomSelectDisplay(control);
        savePlannerState();
      });
    } else if (control.matches("input[type='radio']")) {
      control.addEventListener("change", () => {
        if (control.checked) {
          setDefaultControlValue(control.dataset.defaultControl, control.value);
          savePlannerState();
        }
      });
    } else if (control.matches("button")) {
      control.addEventListener("click", () => {
        toggleDefaultTextStyle(control.dataset.defaultControl, control);
        savePlannerState();
      });
    }
  });

  syncDefaultControls();
}
