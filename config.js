// NOTE: One Place For The Main Planner Knobs
(function () {
     const initialNotebookPageCount = 10;
     const perpetualCalendarLeftColumnGridUnits = 1;
     const perpetualCalendarRightColumnMinGridUnits = 3;
     const rootControls = {
          app: {
               singlePageViewportMaxWidth: 1000,
               notebookViewportHeightReserve: 68,
               notebookViewportWidth: 132,
               notebookMaxWidth: 1220,
               resizeEdgeSize: 16,
               moveStartThreshold: 5,
               pageStickDepth: 2,
               inchToCentimeters: 2.54
          },
          storage: {
               templateSchemaVersion: 1,
               plannerStorageKey: "prettyPlanner:v1",
               legacyPlannerStorageKey: "perfectPlanner:v1",
               plannerStateSchemaVersion: 1
          },
          notebook: {
               minPageCount: 10,
               maxPageCount: 1000,
               initialPageCount: initialNotebookPageCount,
               initialSpreadCount: Math.ceil(initialNotebookPageCount / 2)
          },
          screenReferencePaper: {
               unit: "in",
               width: 8.5,
               height: 11
          },
          items: {
               stickerGridUnits: 12,
               tocLeftColumnGridUnits: 2,
               tocRightColumnMinGridUnits: 8,
               perpetualCalendarMaxDayRows: 31,
               perpetualCalendarHeaderRows: 1,
               perpetualCalendarLeftColumnGridUnits,
               perpetualCalendarRightColumnMinGridUnits,
               itemGridUnits: {
                    sticker: {
                         width: 12,
                         height: 12
                    },
                    "page-title": {
                         width: 18,
                         height: 3
                    },
                    toc: {
                         width: 18,
                         height: 18
                    },
                    "mini-month": {
                         width: 8,
                         height: 8
                    },
                    "full-month": {
                         width: 14,
                         height: 10
                    },
                    "perpetual-calendar": {
                         width: perpetualCalendarLeftColumnGridUnits + perpetualCalendarRightColumnMinGridUnits,
                         height: 32
                    },
                    "weekly-view": {
                         width: 14,
                         height: 14
                    },
                    "day-view": {
                         width: 8,
                         height: 14
                    },
                    "diary-view": {
                         width: 14,
                         height: 14
                    }
               }
          },
          calendar: {
               monthNames: [
                    "January",
                    "February",
                    "March",
                    "April",
                    "May",
                    "June",
                    "July",
                    "August",
                    "September",
                    "October",
                    "November",
                    "December"
               ],
               yearRange: {
                    start: 2025,
                    end: 2035
               }
          },
          view: {
               zoomLevels: [
                    {
                         label: "100%",
                         value: 1
                    },
                    {
                         label: "150%",
                         value: 1.5
                    },
                    {
                         label: "200%",
                         value: 2
                    }
               ],
               focusPoints: ["left", "right"],
               verticalFocusPoints: ["top", "mid", "bottom"]
          },
          paper: {
               sizes: {
                    "letter": {
                         label: "Letter",
                         unit: "in",
                         width: 8.5,
                         height: 11
                    },
                    "half-letter": {
                         label: "Half Letter",
                         unit: "in",
                         width: 5.5,
                         height: 8.5
                    },
                    "a4": {
                         label: "A4",
                         unit: "cm",
                         width: 21,
                         height: 29.7
                    },
                    "a5": {
                         label: "A5",
                         unit: "cm",
                         width: 14.8,
                         height: 21
                    }
               },
               viewScales: {
                    "letter": 1,
                    "half-letter": 1.28,
                    "a4": 0.92,
                    "a5": 1.28
               },
               gridSizes: {
                    "quarter-inch": {
                         label: "1/4 inch",
                         unit: "in",
                         size: 0.25
                    },
                    "half-centimeter": {
                         label: "1/2 cm",
                         unit: "cm",
                         size: 0.5
                    }
               },
               colorPalette: [
                    {
                         key: "Offwhite",
                         label: "Offwhite",
                         display: "FFE",
                         color: "var(--paper-offwhite)"
                    },
                    {
                         key: "Cream",
                         label: "Cream",
                         display: "EDB",
                         color: "var(--paper-cream)"
                    },
                    {
                         key: "Linen",
                         label: "Linen",
                         display: "DCA",
                         color: "var(--paper-linen)"
                    }
               ]
          },
          colors: {
               palettes: {
                    "gray": {
                         label: "Gray",
                         colors: [
                              { label: "FFF", value: "var(--color-white)" },
                              { label: "CCC", value: "var(--color-gray4)" },
                              { label: "999", value: "var(--color-gray3)" },
                              { label: "666", value: "var(--color-gray2)", ink: "var(--color-white)" },
                              { label: "333", value: "var(--color-gray1)", ink: "var(--color-white)" },
                              { label: "000", value: "var(--color-black)", ink: "var(--color-white)" }
                         ]
                    },
                    "tertiary": {
                         label: "Tertiary",
                         colors: [
                              { label: "F00", value: "var(--tertiary-01)", ink: "var(--color-white)" },
                              { label: "F40", value: "var(--tertiary-02)", ink: "var(--color-white)" },
                              { label: "F80", value: "var(--tertiary-03)" },
                              { label: "FC0", value: "var(--tertiary-04)" },
                              { label: "FF0", value: "var(--tertiary-05)" },
                              { label: "8F0", value: "var(--tertiary-06)" },
                              { label: "0F0", value: "var(--tertiary-07)" },
                              { label: "08F", value: "var(--tertiary-08)", ink: "var(--color-white)" },
                              { label: "00F", value: "var(--tertiary-09)", ink: "var(--color-white)" },
                              { label: "40F", value: "var(--tertiary-10)", ink: "var(--color-white)" },
                              { label: "80F", value: "var(--tertiary-11)", ink: "var(--color-white)" },
                              { label: "F0F", value: "var(--tertiary-12)" }
                         ]
                    }
               },
               paletteOrder: ["gray", "tertiary"],
               tertiaryMatrixSteps: [80, 60, 40, 20],
               deskColors: {
                    "pink": {
                         label: "Pink",
                         color: "var(--tertiary-03)"
                    },
                    "gray": {
                         label: "Gray",
                         color: "var(--color-gray3)"
                    },
                    "black": {
                         label: "Black",
                         color: "#333"
                    },
                    "white": {
                         label: "White",
                         color: "#f1ebef"
                    },
                    "wood-white": {
                         label: "White Wood",
                         color: "#edece8",
                         image: "url('images/desk/desk-wood-white.png')",
                         size: "cover"
                    },
                    "wood-brown": {
                         label: "Brown Wood",
                         color: "#8d6243",
                         image: "url('images/desk/desk-wood-brown.png')",
                         size: "cover"
                    },
                    "hot-springs-playa": {
                         label: "Playa",
                         color: "#e8d8d5",
                         image: "url('images/desk/desk-hot-springs-playa.jpg')",
                         size: "cover"
                    },
                    "valencia": {
                         label: "Valencia",
                         color: "#d8ae5c",
                         image: "url('images/desk/desk-valencia.jpg')",
                         size: "cover"
                    }
               }
          },
          guides: {
               labels: {
                    thirds: "1/3",
                    fourths: "1/4"
               },
               order: ["thirds", "fourths"]
          },
          text: {
               lineHeightCellOptions: ["1", "1.5", "2", "2.5", "3"]
          },
          pageNumbers: {
               badge: {
                    sizeMultiplier: 1,
                    minSize: "20px",
                    xOffsetMultiplier: 0.5,
                    xOffsetMin: "10px",
                    yOffsetMultiplier: 0.5,
                    yOffsetMin: "8px"
               },
               layering: {
                    "--page-number-z": "20",
                    "--page-behind-number-z": "20",
                    "--page-corner-fold-number-z": "3"
               }
          },
          pageCornerFlip: {
               hitAreaGridCells: 4,
               animation: {
                    classResetDelayMs: 760,
                    spreadSyncDelayMs: 380
               },
               layering: {
                    "--page-corner-fold-z": "20",
                    "--page-corner-fold-bottom-z": "0",
                    "--page-corner-fold-top-z": "1",
                    "--page-corner-fold-border-z": "2"
               },
               // debugColors: {
               //      "--page-corner-fold-bottom-fill": "rgba(65, 105, 225, 0.45)",
               //      "--page-corner-fold-top-fill": "rgba(255, 99, 71, 0.62)",
               //      "--page-corner-fold-border-color": "#00a86b",
               //      "--page-corner-fold-number-fill": "#fff176",
               //      "--page-corner-fold-bottom-number-fill": "#8fd3ff",
               //      "--page-corner-fold-number-color": "#111"
               // }
          }
     };

     function setRootProperties(properties, root = document.documentElement) {
          Object.entries(properties).forEach(([name, value]) => {
               root.style.setProperty(name, value);
          });
     }

     function getStaticRootProperties() {
          return {
               ...rootControls.pageNumbers.layering,
               ...rootControls.pageCornerFlip.layering,
               ...rootControls.pageCornerFlip.debugColors
          };
     }

     function getPageBadgeRootProperties({
          pageSpreadWidth,
          pageScreenHeightRatio,
          gridColumns,
          gridRows
     }) {
          const badge = rootControls.pageNumbers.badge;

          return {
               "--page-grid-cell-width": `calc(var(--notebook-width) * ${pageSpreadWidth / 100} / ${gridColumns})`,
               "--page-grid-cell-height": `calc(var(--notebook-height) * ${pageScreenHeightRatio} / ${gridRows})`,
               "--page-number-badge-width": `max(${badge.minSize}, calc(var(--page-grid-cell-width) * ${badge.sizeMultiplier}))`,
               "--page-number-badge-height": `max(${badge.minSize}, calc(var(--page-grid-cell-height) * ${badge.sizeMultiplier}))`,
               "--page-number-badge-x-offset": `max(${badge.xOffsetMin}, calc(var(--page-grid-cell-width) * ${badge.xOffsetMultiplier}))`,
               "--page-number-badge-y-offset": `max(${badge.yOffsetMin}, calc(var(--page-grid-cell-height) * ${badge.yOffsetMultiplier}))`
          };
     }

     function applyStaticRootControls(root = document.documentElement) {
          setRootProperties(getStaticRootProperties(), root);
     }

     applyStaticRootControls();

     window.PlannerRootControls = {
          applyStaticRootControls,
          controls: rootControls,
          getPageBadgeRootProperties,
          getStaticRootProperties,
          setRootProperties
     };
})();
