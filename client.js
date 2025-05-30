console.info("[vue-click-to-component] enabled");

function setTarget(el, type = "") {
  el.setAttribute("vue-click-to-component-target", type);
}

function cleanTarget(type) {
  /**
   * @type {NodeListOf<Element>}
   */
  let targetElList;

  if (type) {
    targetElList = document.querySelectorAll(
      `[vue-click-to-component-target="${type}"]`,
    );
  } else {
    targetElList = document.querySelectorAll(
      "[vue-click-to-component-target]",
    );
  }

  targetElList.forEach((el) => {
    el.removeAttribute("vue-click-to-component-target");
  });
}

/**
 * @param {MouseEvent} clickEvent
 * @returns {boolean}
 */
function checkHandleAltClick(clickEvent) {
  if (!clickEvent.altKey || clickEvent.button !== 0) {
    return false;
  }

  let el = clickEvent.target;

  try {
    while (
      el &&
      !el.hasAttribute("vue-click-to-component-ignore-alt-click")
    ) {
      el = el.parentElement;
    }
  } catch (error) {
    return false;
  }

  if (el) {
    return false;
  }

  return true;
}

function getElWithSourceCodeLocation(el) {
  try {
    while (el && !el.dataset.__sourceCodeLocation) {
      el = el.parentElement;
    }
  } catch (error) {
    return null;
  }

  return el;
}

function openEditor(sourceCodeLocation) {
  // __VUE_CLICK_TO_COMPONENT_URL_FUNCTION__ can be async
  const urlPromise = Promise.resolve().then(() => {
    if (
      typeof window.__VUE_CLICK_TO_COMPONENT_URL_FUNCTION__ !== "function"
    ) {
      // Fix https://github.com/click-to-component/vue-click-to-component/issues/4
      if (sourceCodeLocation.startsWith("/")) {
        return `vscode://file${sourceCodeLocation}`;
      }

      return `vscode://file/${sourceCodeLocation}`;
    }

    return window.__VUE_CLICK_TO_COMPONENT_URL_FUNCTION__({
      sourceCodeLocation,
    });
  });

  urlPromise
    .then((url) => {
      if (!url) {
        console.error(
          "[vue-click-to-component] url is empty, please check __VUE_CLICK_TO_COMPONENT_URL_FUNCTION__",
        );
        return;
      }

      window.location.assign(url);
    })
    .catch((e) => {
      console.error(e);
    })
    .finally(() => {
      cleanTarget();
    });
}

// this funciton will update after vue-click-to-component-popover is defined
let hidePopover = () => {};

// Alt+Click CSS
document.head.insertAdjacentHTML(
  "beforeend",
  `
<style type="text/css" key="vue-click-to-component-style">
  [vue-click-to-component] * {
    pointer-events: auto !important;
  }

  [vue-click-to-component-target] {
    cursor: var(--click-to-component-cursor, context-menu) !important;
    outline: 1px auto !important;
  }

  @supports (outline-color: Highlight) {
    [vue-click-to-component-target] {
      outline: var(--click-to-component-outline, 1px auto Highlight) !important;
    }
  }

  @supports (outline-color: -webkit-focus-ring-color) {
    [vue-click-to-component-target] {
      outline: var(--click-to-component-outline, 1px auto -webkit-focus-ring-color) !important;
    }
  }
</style>`.trim(),
);

window.addEventListener(
  "click",
  (e) => {
    hidePopover();

    if (checkHandleAltClick(e)) {
      const elWithSourceCodeLocation = getElWithSourceCodeLocation(e.target);
      if (!elWithSourceCodeLocation) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      const sourceCodeLocation =
        elWithSourceCodeLocation.dataset.__sourceCodeLocation;

      openEditor(sourceCodeLocation);
    }
  },
  true,
);

window.addEventListener(
  "mousemove",
  (e) => {
    cleanTarget("hover");

    if (e.altKey) {
      document.body.setAttribute("vue-click-to-component", "");

      const elWithSourceCodeLocation = getElWithSourceCodeLocation(e.target);

      if (!elWithSourceCodeLocation) {
        return;
      }

      setTarget(elWithSourceCodeLocation, "hover");
    } else {
      document.body.removeAttribute("vue-click-to-component");
    }
  },
  true,
);

window.addEventListener(
  "keyup",
  (e) => {
    if (e.altKey) {
      cleanTarget();
      document.body.removeAttribute("vue-click-to-component");
    }
  },
  true,
);

window.addEventListener(
  "blur",
  () => {
    cleanTarget();
    document.body.removeAttribute("vue-click-to-component");
  },
  true,
);

/* --- popover --- */
function initPopover() {
  if (customElements.get("vue-click-to-component-popover")) {
    console.warn("[vue-click-to-component] popover is already defined");
    return;
  }

  function cleanAnchor() {
    document
      .querySelectorAll("[vue-click-to-component-anchor]")
      .forEach((el) => {
        el.removeAttribute("vue-click-to-component-anchor");
      });
  }

  function setAnchor(el) {
    el.setAttribute("vue-click-to-component-anchor", "");
  }

  function getElListWithSourceCodeLocation(el) {
    const elList = [];

    let elWithSourceCodeLocation = getElWithSourceCodeLocation(el);

    while (elWithSourceCodeLocation) {
      elList.push(elWithSourceCodeLocation);
      elWithSourceCodeLocation = getElWithSourceCodeLocation(
        elWithSourceCodeLocation.parentElement,
      );
    }

    return elList;
  }

  function getComponentInfoList(elList) {
    const componentInfoList = [];

    for (const el of elList) {
      const componentInfo = {
        el,
        sourceCodeLocation: el.dataset.__sourceCodeLocation,
        localName: el.localName,
      };

      componentInfoList.push(componentInfo);
    }

    return componentInfoList;
  }

  customElements.define(
    "vue-click-to-component-popover",
    class extends HTMLElement {
      static get observedAttributes() {
        return [];
      }

      constructor() {
        super();

        this.componentInfoList = [];

        this.setStyle();
        this.setForm();
      }

      updateComponentInfoList(componentInfoList) {
        this.componentInfoList = componentInfoList;
        this.listEl.innerHTML = "";

        for (const item of componentInfoList) {
          const itemEL = document.createElement("li");
          itemEL.classList.add("vue-click-to-component-popover__list__item");

          const buttonEl = document.createElement("button");
          const sourceCodeLocationStr = item.sourceCodeLocation;
          buttonEl.type = "submit";
          buttonEl.value = sourceCodeLocationStr;
          buttonEl.addEventListener("mouseenter", () => {
            setTarget(item.el, "popover");
          });
          buttonEl.addEventListener("mouseleave", () => {
            cleanTarget();
          });
          buttonEl.innerHTML = `<code>&lt;${item.localName}&gt;</code>
<cite>
  <span dir="ltr">
    ${sourceCodeLocationStr.replace(/.*(src|pages)/, "$1")}
  </span>
</cite>`;

          itemEL.appendChild(buttonEl);

          this.listEl.appendChild(itemEL);
        }
      }

      setForm() {
        const formEl = document.createElement("form");
        formEl.addEventListener("submit", (e) => {
          e.preventDefault();

          const submitter = e.submitter;

          if (submitter.tagName !== "BUTTON") {
            return;
          }

          const sourceCodeLocation = submitter.value;

          if (!sourceCodeLocation) {
            return;
          }

          openEditor(sourceCodeLocation);
          hidePopover();
        });

        const listEl = document.createElement("ul");
        listEl.classList.add("vue-click-to-component-popover__list");
        formEl.appendChild(listEl);
        this.listEl = listEl;

        this.appendChild(formEl);
      }

      setStyle() {
        const styleEl = document.createElement("style");
        styleEl.textContent = `
.vue-click-to-component-popover__list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0;
  margin: 0;
  list-style: none;
  max-height: 300px;
  overflow-y: auto;
}

.vue-click-to-component-popover__list__item {
  button {
    all: unset;
    box-sizing: border-box;
    outline: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
    width: 100%;
    padding: 4px;
    border-radius: 4px;
    font-size: 14px;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;

    &:hover, &:focus, &:active {
      cursor: pointer;
      background: royalblue;
      color: white;

      code {
        color: white;
      }
    }

    code {
      color: royalblue;
    }

    cite {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      text-align: left;
      /* text-overflow ellipsis on left sida. Inner span element set dir="ltr" */
      direction: rtl;
      font-weight: normal;
      font-style: normal;
      font-size: 12px;
      opacity: 0.5;
    }
  }
}`;

        this.appendChild(styleEl);
      }
    },
  );

  document.body.insertAdjacentHTML(
    "beforeend",
    `
<style type="text/css" key="click-to-component-popover-style">
  [vue-click-to-component-anchor] {
    anchor-name: --vue-click-to-component-component-anchor;
  }

  vue-click-to-component-popover {
    inset: unset;
    position: fixed;
    position-anchor: --vue-click-to-component-component-anchor;
    top: anchor(bottom);
    justify-self: anchor-center;
    position-try: most-height flip-block;
    box-sizing: border-box;
    max-width: 100%;
    margin: 0;
  }
</style>
<vue-click-to-component-popover popover="manual" vue-click-to-component-ignore-alt-click></vue-click-to-component-popover>`,
  );

  const vueClickToComponentPopoverEl = document.querySelector(
    "vue-click-to-component-popover",
  );

  window.addEventListener(
    "contextmenu",
    (e) => {
      if (e.altKey && e.button === 2) {
        const elListWithSourceCodeLocationList =
          getElListWithSourceCodeLocation(e.target);

        if (elListWithSourceCodeLocationList.length === 0) {
          return;
        }

        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        const componentInfoList = getComponentInfoList(
          elListWithSourceCodeLocationList,
        );
        vueClickToComponentPopoverEl.updateComponentInfoList(
          componentInfoList,
        );

        cleanAnchor();
        setAnchor(elListWithSourceCodeLocationList[0]);
        vueClickToComponentPopoverEl.showPopover();

        if (document.activeElement) {
          document.activeElement.blur();
        }
      }
    },
    true,
  );

  hidePopover = () => {
    try {
      vueClickToComponentPopoverEl.hidePopover();
      cleanAnchor();
    } catch (error) {
      console.error("[vue-click-to-component] hide popover failed", error);
    }
  };
}

try {
  initPopover();
} catch (error) {
  console.warn("[vue-click-to-component] init popover failed", error);
}
