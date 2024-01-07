import { animate, slideYOut, slideYIn, slideXIn, opacityOut } from "../lib/animate.js";
import { loadCSS } from "../helpers/loader.js";

class ComponentBreadcrumb extends window.HTMLDivElement {

    constructor() {
        super();
        if (new window.URL(location.href).searchParams.get("nav") === "false") {
            this.disabled = true;
            return;
        }
        this.__init();
    }

    async __init() {
        this.innerHTML = `
        <div class="component_breadcrumb container" role="navigation">
            <div class="breadcrumb no-select">
                <div class="ul">
                    <span data-bind="path"></span>
                    <div class="li component_logout">${this.__htmlLogout()}</div>
                </div>
            </div>
        </div>`;
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (this.disabled === true) return;
        else if (oldValue === newValue) return;

        switch (name) {
        case "path":
            if (newValue == "") return;
            return this.renderPath({ path: newValue, previous: oldValue || null });
        case "indicator":
            return this.renderIndicator()
        }
        throw new Error("component::breadcrumb.js unknow attribute name: "+ name)
    }

    static get observedAttributes() {
        return ["path", "indicator"];
    }

    async renderPath({ path = "", previous }) {
        path = this.__normalised(path);
        previous = this.__normalised(previous);
        let pathChunks = path.split("/");

        // STEP1: leaving animation on elements that will be removed
        if (previous !== null && previous.indexOf(path) >= 0) {
            const previousChunks = previous.split("/");
            const nToAnimate = previousChunks.length - pathChunks.length;
            const tasks = [];
            for (let i=0; i<nToAnimate; i++) {
                const n = previousChunks.length - i - 1;
                const $chunk = this.querySelector(`.component_path-element.n${n}`);
                if (!$chunk) throw new Error("component::breadcrumb.js - assertion failed - empty element");
                tasks.push(animate($chunk, { time: 100, keyframes: slideYOut(-10) }));
            }
            await Promise.all(tasks);
        }

        // STEP2: setup the actual content
        this.querySelector(`[data-bind="path"]`).innerHTML = pathChunks.map((chunk, idx) => {
            const label = idx === 0 ? "Filestash" : chunk;
            const link = pathChunks.slice(0, idx + 1).join("/") + "/";
            const limitSize = (word, highlight = false) => {
                if (highlight === true && word.length > 30) {
                    return word.substring(0, 12).trim() + "..." +
                        word.substring(word.length - 10, word.length).trim();
                }
                else if (word.length > 27) return word.substring(0, 20).trim() + "...";
                return word;
            };
            const isLast = idx === pathChunks.length - 1;
            if (isLast) return `
                <div class="component_path-element n${idx}">
                    <div class="li component_path-element-wrapper">
                        <div class="label">
                            <div>${limitSize(label)}</div><span></span>
                        </div>
                    </div>
                </div>`;

            const minify = (() => {
                if (idx === 0) return false;
                else if (pathChunks.length <= (document.body.clientWidth > 800 ? 5 : 4)) return false;
                else if (idx > pathChunks.length - (document.body.clientWidth > 1000 ? 4 : 3)) return false;
                return true;
            })();

            const tmpl = (() => {
                if (minify) return `
                    ...
                    <span class="title">
                        ${limitSize(label, true)}
                    </span>
                `;
                return `<div>${limitSize(label)}</div>`
            })();

            return `
                <div class="component_path-element n${idx}">
                    <div class="li component_path-element-wrapper">
                        <div>
                            <a class="label" href="/files${link}" data-link>
                                ${tmpl}
                            </a>
                            <div class="component_separator">
                                <img alt="path_separator" width="16" height="16" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAARCAYAAAA7bUf6AAAA30lEQVQ4T63T7Q2CMBAG4OuVPdQNcAPdBCYwDdclCAQ3ACfRDXQDZQMHgNRcAoYApfWjv0jIPX3b3gn4wxJjI03TUAhRBkGwV0o9ffaYIEVRrJumuQHA3ReaILxzl+bCkNZ660ozi/QQIl4BoCKieAmyIlyU53lkjCld0CIyhIwxSmt9nEvkRLgoyzIuPggh4iRJqjHkhXTQAwBWUsqNUoq/38sL+TlJf7lf38ngdU5EFNme2adPFgGGrR2LiGcAqIko/LhjeXbatuVOraWUO58hnJ1iRKx8AetxXPHH/1+y62USursaSgAAAABJRU5ErkJggg==">
                            </div>
                        </div>
                    </div>
                </div>`;
        }).join("");

        // STEP3: entering animation for elements that got added in
        if (previous !== null && path.indexOf(previous) >= 0) {
            const previousChunks = previous.split("/");
            const nToAnimate = pathChunks.length - previousChunks.length;
            for (let i=0; i<nToAnimate; i++) {
                const n = pathChunks.length - i - 1;
                const $chunk = this.querySelector(`.component_path-element.n${n}`);
                if (!$chunk) throw new Error("component::breadcrumb.js - assertion failed - empty element");
                await animate($chunk, { time: 100, keyframes: slideYIn(-5) });
            }
        }
    }

    async renderIndicator() {
        let state = this.hasAttribute("indicator");
        if (state && this.getAttribute("indicator") !== "false") state = true;

        const $indicator = this.querySelector(`[data-bind="path"]`)
              .lastChild
              .querySelector("span");

        if (state) {
            $indicator.style.opacity = 1;
            $indicator.innerHTML = `<div class="component_saving">*</div>`;
            await animate($indicator, { time: 500, keyframes: [
                { transform: "scale(0)", offset: 0 },
                { transform: "scale(1.5)", offset: 0.3 },
                { transform: "scale(1)", offset: 1 },
            ], fill: "none"});
        } else {
            $indicator.style.opacity = 0;
            await animate($indicator, { time: 200, keyframes: opacityOut(), fill: "none" });
        }
    }

    __htmlLogout() {
        if (window.self !== window.top) return ""; // no logout button from an iframe
        return `
            <a href="/logout" data-link>
                <img class="component_icon" draggable="false" src="data:image/svg+xml,%3Csvg width='512' height='512' viewBox='0 0 512 512' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M372.053 327.893C368 327.893 363.946 326.4 360.746 323.2C354.56 317.013 354.56 306.773 360.746 300.586L404.053 257.28L360.746 213.973C354.56 207.786 354.56 197.546 360.746 191.36C366.933 185.173 377.173 185.173 383.36 191.36L437.973 245.973C444.16 252.16 444.16 262.4 437.973 268.586L383.36 323.2C380.16 326.4 376.106 327.893 372.053 327.893Z' fill='%236F6F6F'/%3E%3Cpath d='M425.173 273.28H208.213C199.466 273.28 192.213 266.027 192.213 257.28C192.213 248.534 199.466 241.28 208.213 241.28H425.173C433.92 241.28 441.173 248.534 441.173 257.28C441.173 266.027 433.92 273.28 425.173 273.28Z' fill='%236F6F6F'/%3E%3Cpath d='M250.88 442.666C141.013 442.666 64.2129 365.866 64.2129 256C64.2129 146.133 141.013 69.333 250.88 69.333C259.626 69.333 266.88 76.5863 266.88 85.333C266.88 94.0797 259.626 101.333 250.88 101.333C159.786 101.333 96.2129 164.906 96.2129 256C96.2129 347.093 159.786 410.666 250.88 410.666C259.626 410.666 266.88 417.92 266.88 426.666C266.88 435.413 259.626 442.666 250.88 442.666Z' fill='%236F6F6F'/%3E%3C/svg%3E" alt="power">
            </a>
        `;
    }

    __normalised(path) {
        if (path === null) return null;
        else if (path.endsWith("/") === false) return path;
        return path.replace(new RegExp("/$"), "");
    }
}

export function init() {
    return loadCSS(import.meta.url, "./breadcrumb.css");
}

customElements.define("component-breadcrumb", ComponentBreadcrumb, { extends: "div" });
