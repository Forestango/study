export function sanitizeHtml(html: string) {
  const parsed = new DOMParser().parseFromString(html || "", "text/html");
  const root = parsed.body;
  root.querySelectorAll("script, style, link, meta, iframe, object, embed, form, input, button, textarea, select, option").forEach((node) => node.remove());
  root.querySelectorAll("*").forEach((node) => {
    Array.from(node.attributes).forEach((attribute) => {
      const name = attribute.name.toLowerCase();
      const value = attribute.value.trim().toLowerCase();
      if (name === "style" || name.startsWith("on") || value.startsWith("javascript:")) {
        node.removeAttribute(attribute.name);
      }
    });
  });
  return root.innerHTML.trim();
}

export function plainTextFromHtml(html: string) {
  const template = document.createElement("template");
  template.innerHTML = sanitizeHtml(html);
  return (template.content.textContent || "").replace(/\s+/g, " ").trim();
}

export function summaryFromHtml(html: string) {
  return plainTextFromHtml(html).slice(0, 150) || "Без описания";
}
