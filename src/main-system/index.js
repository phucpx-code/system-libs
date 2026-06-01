import {
  LitElement,
  html,
} from "https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js";
import "https://cdn.jsdelivr.net/npm/systemjs@6.15.1/dist/system.min.js";
import "https://cdn.jsdelivr.net/npm/systemjs@6.15.1/dist/extras/amd.min.js";

window.System.addImportMap({
  imports: {
    react: "https://system-libs.vercel.app/dist/react@19.2.6.system.js",
    "react-dom":
      "https://system-libs.vercel.app/dist/react-dom@19.2.6.system.js",
    zustand: "https://system-libs.vercel.app/dist/zustand@5.0.13.system.js",
    "react-dom/client":
      "https://system-libs.vercel.app/dist/react-dom/client@19.2.6.system.js",
    "react/jsx-runtime":
      "https://system-libs.vercel.app/dist/react-jsx-runtime@19.2.6.system.js",
    crypto: "https://system-libs.vercel.app/dist/crypto@3.12.1.system.js",
    "@puckeditor/core":
      "https://system-libs.vercel.app/dist/@puckeditor/core@0.21.2.system.js",
    "@emotion/react":
      "https://system-libs.vercel.app/dist/@emotion/react@11.14.0.system.js",
    "@emotion/styled":
      "https://system-libs.vercel.app/dist/@emotion/styled@11.14.1.system.js",
    "@emotion/cache":
      "https://system-libs.vercel.app/dist/@emotion/cache@11.14.0.system.js",
    "@mui/material":
      "https://system-libs.vercel.app/dist/@mui/material@9.0.1.system.js",
    "react-icons/md":
      "https://system-libs.vercel.app/dist/react-icons/md@undefined.system.js",
    "main-system": "./index.system.js",
  },
});

const ELEMENT_NAME = "cms-fe-v2";
export class MainSystemWb extends LitElement {
  static properties = {
    mode: { type: String },
    accessToken: { type: String, attribute: "access-token" },
    templateId: { type: String, attribute: "template-id" },
  };

  createRenderRoot() {
    return this;
  }

  async firstUpdated() {
    const [ReactModule, ReactDOMClientModule, MainSystemModule] =
      await Promise.all([
        window.System.import("react"),
        window.System.import("react-dom/client"),
        window.System.import("main-system"),
      ]);

    this.React = ReactModule.default || ReactModule;
    this.ReactDOMClient = ReactDOMClientModule.default || ReactDOMClientModule;
    this.MainSystem = MainSystemModule.MainSystem;
    this.reactRoot = null;
    this.renderReactApp();
  }

  renderReactApp() {
    const mountNode = this.renderRoot.querySelector("#main-system");
    if (!mountNode) return;
    const h = this.React.createElement;

    if (!this.reactRoot) {
      this.reactRoot = this.ReactDOMClient.createRoot(mountNode);
    }

    this.reactRoot.render(
      h(this.MainSystem, {
        renderRoot: mountNode,
        mode: this.mode,
        accessToken: this.accessToken,
        templateId: this.templateId,
      }),
    );
  }

  render() {
    return html`
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/@puckeditor/core@0.21.2/dist/index.min.css"
      />
      <div id="main-system"></div>
    `;
  }
}

if (!customElements.get(ELEMENT_NAME)) {
  customElements.define(ELEMENT_NAME, MainSystemWb);
}
