import { sanitizeHtml } from "./html";

const inlineMarkdown = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/!\[([^\]]*)\]\((franchise-image:[^)]+|https?:\/\/[^)]+)\)/g, '<img src="$2" alt="$1">')
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');

export function markdownToHtml(markdown: string) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const html: string[] = [];
  let listItems: string[] = [];

  const flushList = () => {
    if (!listItems.length) return;
    html.push(`<ul>${listItems.map((item) => `<li>${inlineMarkdown(item)}</li>`).join("")}</ul>`);
    listItems = [];
  };

  lines.forEach((line) => {
    const value = line.trim();
    if (!value) {
      flushList();
      return;
    }

    const heading = value.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      flushList();
      html.push(`<h${heading[1].length}>${inlineMarkdown(heading[2])}</h${heading[1].length}>`);
      return;
    }

    const bullet = value.match(/^[-*]\s+(.+)$/);
    if (bullet) {
      listItems.push(bullet[1]);
      return;
    }

    flushList();
    html.push(`<p>${inlineMarkdown(value)}</p>`);
  });

  flushList();
  return sanitizeHtml(html.join("\n"));
}

export function htmlToMarkdown(html: string) {
  const parsedDocument = new DOMParser().parseFromString(sanitizeHtml(html), "text/html");
  const lines: string[] = [];

  parsedDocument.body.childNodes.forEach((node) => {
    if (!(node instanceof HTMLElement)) {
      const text = node.textContent?.trim();
      if (text) lines.push(text);
      return;
    }

    if (/^H[1-3]$/.test(node.tagName)) {
      lines.push(`${"#".repeat(Number(node.tagName.slice(1)))} ${node.textContent?.trim() || ""}`);
      return;
    }

    if (node.tagName === "UL" || node.tagName === "OL") {
      node.querySelectorAll("li").forEach((item) => lines.push(`- ${item.textContent?.trim() || ""}`));
      return;
    }

    if (node.tagName === "FIGURE") {
      const image = node.querySelector("img");
      const caption = node.querySelector("figcaption")?.textContent?.trim() || image?.getAttribute("alt") || "";
      const src = image?.getAttribute("src");
      if (src) lines.push(`![${caption}](${src})`);
      return;
    }

    if (node.tagName === "IMG") {
      lines.push(`![${node.getAttribute("alt") || ""}](${node.getAttribute("src") || ""})`);
      return;
    }

    const text = node.textContent?.trim();
    if (text) lines.push(text);
  });

  return lines.join("\n\n").trim();
}
