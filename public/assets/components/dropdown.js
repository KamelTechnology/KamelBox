import { createFragment } from "../lib/skeleton/index.js";
import { animate, slideYIn } from "../lib/animate.js";
import { loadCSS } from "../helpers/loader.js";

await loadCSS(import.meta.url, "./dropdown.css");

export default class ComponentDropdown extends HTMLDivElement {
    constructor() {
        super();
        this.render();
    }

    static get observedAttributes() {
        return ["options"];
    }

    render() {
        this.classList.add("component_dropdown", "view", "sort")
        this.appendChild(createFragment(`
  <div class="dropdown_button">
    <img class="component_icon" draggable="false" src="data:image/svg+xml,%3Csvg%20width%3D%22512%22%20height%3D%22512%22%20viewBox%3D%220%200%20512%20512%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M325.547%20474.667H186.453C81.7067%20474.667%2036.9067%20429.867%2036.9067%20325.12V322.347C36.9067%20227.627%2074.2401%20181.973%20157.867%20174.08C166.4%20173.44%20174.507%20179.84%20175.36%20188.587C176.213%20197.333%20169.813%20205.227%20160.853%20206.08C93.8667%20212.267%2068.9067%20243.84%2068.9067%20322.56V325.333C68.9067%20412.16%2099.6267%20442.88%20186.453%20442.88H325.547C412.373%20442.88%20443.093%20412.16%20443.093%20325.333V322.56C443.093%20243.413%20417.707%20211.84%20349.44%20206.08C340.693%20205.227%20334.08%20197.547%20334.933%20188.8C335.787%20180.053%20343.253%20173.44%20352.213%20174.293C437.12%20181.547%20475.093%20227.413%20475.093%20322.773V325.547C475.093%20429.867%20430.293%20474.667%20325.547%20474.667Z%22%20fill%3D%22%23F2F2F2%22%2F%3E%3Cpath%20d%3D%22M256%20333.44C247.253%20333.44%20240%20326.187%20240%20317.44V42.6666C240%2033.92%20247.253%2026.6666%20256%2026.6666C264.747%2026.6666%20272%2033.92%20272%2042.6666V317.44C272%20326.4%20264.747%20333.44%20256%20333.44Z%22%20fill%3D%22%23F2F2F2%22%2F%3E%3Cpath%20d%3D%22M256%20357.333C251.947%20357.333%20247.893%20355.84%20244.693%20352.64L173.227%20281.173C167.04%20274.987%20167.04%20264.747%20173.227%20258.56C179.413%20252.373%20189.653%20252.373%20195.84%20258.56L256%20318.72L316.16%20258.56C322.347%20252.373%20332.587%20252.373%20338.773%20258.56C344.96%20264.747%20344.96%20274.987%20338.773%20281.173L267.307%20352.64C264.107%20355.84%20260.053%20357.333%20256%20357.333Z%22%20fill%3D%22%23F2F2F2%22%2F%3E%3C%2Fsvg%3E" alt="download_white">
  </div>`));

        this.appendChild(createFragment(`
  <div class="dropdown_container">
    <ul>
      <li>
        <div>
          <a download="README.org" href="/api/files/cat?path=%2FREADME.org">Save current file</a>
        </div>
      </li>
      <li>
        <div>
          <a target="_blank" href="/api/export/private/text/html/README.org">Export as HTML</a>
        </div>
      </li>
      <li>
        <div>
          <a target="_blank" href="/api/export/private/application/pdf/README.org">Export as PDF</a>
        </div>
      </li>
      <li>
        <div>
          <a target="_blank" href="/api/export/private/text/markdown/README.org">Export as Markdown</a>
        </div>
      </li>
      <li>
        <div>
          <a target="_blank" href="/api/export/private/text/plain/README.org">Export as TXT</a>
        </div>
      </li>
      <li>
        <div>
          <a target="_blank" download="README.tex" href="/api/export/private/text/x-latex/README.org">Export as Latex</a>
        </div>
      </li>
      <li>
        <div>
          <a target="_blank" download="README.ics" href="/api/export/private/text/calendar/README.org">Export as ical</a>
        </div>
      </li>
      <li>
        <div>
          <a target="_blank" download="README.odt" href="/api/export/private/application/vnd.oasis.opendocument.text/README.org">Export as Open office</a>
        </div>
      </li>
      <li>
        <div>
          <a target="_blank" download="README.pdf" href="/api/export/private/application/pdf/README.org?mode=beamer">Export as Beamer</a>
        </div>
      </li>
    </ul>
  </div>
</div>
        `));

        const setActive = () => this.classList.toggle("active");
        this.querySelector(".dropdown_button").onclick = () => {
            setActive();
            animate(this.querySelector(".dropdown_container"), {
                time: 100,
                keyframes: slideYIn(2),
            });
        };
    }
}

customElements.define("component-dropdown", ComponentDropdown, { extends: "div" });
