import { onDestroy, createElement, createRender, createFragment } from "../../lib/skeleton/index.js";
import rxjs, { effect, applyMutation, onClick } from "../../lib/rx.js";
import { animate } from "../../lib/animate.js";
import { loadCSS } from "../../helpers/loader.js";
import { qs } from "../../lib/dom.js";
import { getSelection$, clearSelection } from "./model_files.js";

import "../../components/dropdown.js";

export default async function(render) {
    const $page = createElement(`<div class="component_submenu container"></div>`);
    render($page);

    const $scroll = $page.closest(".scroll-y")
    effect(rxjs.fromEvent($scroll, "scroll", { passive: true }).pipe(
        rxjs.map((e) => e.target.scrollTop > 30),
        rxjs.distinctUntilChanged(),
        rxjs.startWith(false),
        rxjs.tap((scrolling) => scrolling ?
                 $scroll.classList.add("scrolling") :
                 $scroll.classList.remove("scrolling")),
    ));

    onDestroy(() => clearSelection());
    effect(getSelection$().pipe(
        rxjs.filter((selections) => selections.length === 0),
        rxjs.mapTo(createFragment(`
            <div class="action left no-select" style="margin-left:2px;">
                <button>ملف جديد</button>
                <button>مجلد جديد</button>
            </div>
            <div class="action right no-select" style="margin-right:2px;">
                <button>
                   <input style="
                     display: none;
                     background: transparent;
                     border: none;
                     border-bottom: 2px solid #e2e2e2;
                     margin-right: 10px;
                     color: var(--color);
                     font-size: 0.8rem;
                    ">
                    <img class="component_icon" draggable="false" src="data:image/svg+xml,%3Csvg width='512' height='512' viewBox='0 0 512 512' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M245.334 464C124.8 464 26.667 365.867 26.667 245.334C26.667 124.8 124.8 26.667 245.334 26.667C365.867 26.667 464 124.8 464 245.334C464 365.867 365.867 464 245.334 464ZM245.334 58.667C142.294 58.667 58.667 142.507 58.667 245.334C58.667 348.16 142.294 432 245.334 432C348.374 432 432 348.16 432 245.334C432 142.507 348.374 58.667 245.334 58.667Z' fill='%236F6F6F'/%3E%3Cpath d='M469.333 485.333C465.28 485.333 461.226 483.84 458.026 480.64L415.36 437.973C409.173 431.786 409.173 421.546 415.36 415.36C421.546 409.173 431.786 409.173 437.973 415.36L480.64 458.026C486.826 464.213 486.826 474.453 480.64 480.64C477.44 483.84 473.386 485.333 469.333 485.333Z' fill='%236F6F6F'/%3E%3C/svg%3E" alt="search" />
                </button>
                <button>
                    <img class="component_icon" draggable="false" src="data:image/svg+xml,%3Csvg width='512' height='512' viewBox='0 0 512 512' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M424.534 485.333H87.467C46.507 485.333 26.667 464.427 26.667 421.76V335.573C26.667 292.693 46.507 272 87.467 272H424.534C465.494 272 485.334 292.907 485.334 335.573V421.76C485.334 464.427 465.494 485.333 424.534 485.333ZM87.467 304C65.9203 304 58.667 308.48 58.667 335.573V421.76C58.667 448.853 65.9203 453.333 87.467 453.333H424.534C446.08 453.333 453.334 448.853 453.334 421.76V335.573C453.334 308.48 446.08 304 424.534 304H87.467Z' fill='%236F6F6F'/%3E%3Cpath d='M424.534 240H87.467C46.507 240 26.667 219.094 26.667 176.427V90.2403C26.667 47.3603 46.507 26.667 87.467 26.667H424.534C465.494 26.667 485.334 47.5737 485.334 90.2403V176.427C485.334 219.094 465.494 240 424.534 240ZM87.467 58.667C65.9203 58.667 58.667 63.147 58.667 90.2403V176.427C58.667 203.52 65.9203 208 87.467 208H424.534C446.08 208 453.334 203.52 453.334 176.427V90.2403C453.334 63.147 446.08 58.667 424.534 58.667H87.467V58.667Z' fill='%236F6F6F'/%3E%3C/svg%3E" alt="list" />
                </button>
                <button>
                    <img class="component_icon" draggable="false" src="data:image/svg+xml,%3Csvg width='512' height='512' viewBox='0 0 512 512' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M192.213 453.334C188.16 453.334 184.107 451.84 180.907 448.64L74.0267 341.76C67.8401 335.574 67.8401 325.334 74.0267 319.147C80.2134 312.96 90.4534 312.96 96.6401 319.147L203.52 426.027C209.707 432.213 209.707 442.454 203.52 448.64C200.32 451.627 196.267 453.334 192.213 453.334Z' fill='%236F6F6F'/%3E%3Cpath d='M192.213 453.334C183.466 453.334 176.213 446.08 176.213 437.334V74.667C176.213 65.9203 183.466 58.667 192.213 58.667C200.96 58.667 208.213 65.9203 208.213 74.667V437.334C208.213 446.08 200.96 453.334 192.213 453.334Z' fill='%236F6F6F'/%3E%3Cpath d='M426.88 197.546C422.827 197.546 418.774 196.053 415.574 192.853L308.694 85.9731C302.507 79.7864 302.507 69.5464 308.694 63.3597C314.88 57.1731 325.12 57.1731 331.307 63.3597L438.187 170.24C444.374 176.426 444.374 186.666 438.187 192.853C434.987 196.053 430.934 197.546 426.88 197.546Z' fill='%236F6F6F'/%3E%3Cpath d='M319.787 453.334C311.04 453.334 303.787 446.08 303.787 437.334V74.667C303.787 65.9203 311.04 58.667 319.787 58.667C328.534 58.667 335.787 65.9203 335.787 74.667V437.334C335.787 446.08 328.747 453.334 319.787 453.334Z' fill='%236F6F6F'/%3E%3C/svg%3E" alt="sort" />
                </button>
                <!--<div is="component-dropdown"></div>-->
            </div>
        `)),
        applyMutation($page, "replaceChildren"),
    ));

    effect(getSelection$().pipe(
        rxjs.filter((selections) => selections.length > 0),
        rxjs.tap((selections) => selections.length === 1 && animate($page)),
        rxjs.map((selections) => createFragment(`
            <div class="action left">
                <button>Download</button>
                <button>Share</button>
                <button>Embed</button>
                <button>Tag</button>
                <button>Rename</button>
                <button>Delete</button>
            </div>
            <div class="action right">
                <button data-bind="clear">
                    ${selections.length} x
                </button>
            </div>
        `)),
        applyMutation($page, "replaceChildren"),
        rxjs.mergeMap((e) => rxjs.merge(
            onClick(qs($page, `[data-bind="clear"]`)).pipe(
                rxjs.tap(() => clearSelection()),
            ),
        )),
    ));
}

export function init() {
    return loadCSS(import.meta.url, "./ctrl_submenu.css");
}
