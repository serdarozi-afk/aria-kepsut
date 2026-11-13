import { HTTPResponse } from "../_libs/h3+rou3+srvx.mjs";
//#region #nitro/virtual/renderer-template
var rendererTemplate = () => new HTTPResponse("<!doctype html>\r\n<html lang=\"tr\">\r\n  <head>\r\n    <meta charset=\"UTF-8\" />\r\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0, viewport-fit=cover\" />\r\n    <meta name=\"theme-color\" content=\"#234b45\" />\r\n    <link rel=\"icon\" type=\"image/png\" href=\"/aria-logo.png\" />\r\n    <title>ARIA KEPSUT</title>\r\n    <script type=\"module\" crossorigin src=\"/assets/index-Avppsp1E.js\"><\/script>\n    <link rel=\"stylesheet\" crossorigin href=\"/assets/index-DZOLhxXd.css\">\n  </head>\r\n\r\n  <body>\r\n    <div id=\"root\"></div>\r\r\n  </body>\r\n</html>\r\n", { headers: { "content-type": "text/html; charset=utf-8" } });
//#endregion
//#region node_modules/.pnpm/nitro@3.0.261103-rc/node_modules/nitro/dist/runtime/internal/routes/renderer-template.mjs
function renderIndexHTML(event) {
	return rendererTemplate(event.req);
}
//#endregion
export { renderIndexHTML as default };
