// Utilities to export a DOM node (the diagram canvas) as SVG or PNG
export function sanitizeFilename(name) {
  if (!name) return 'diagram';
  return String(name)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-_.]/g, '')
    .replace(/[-_]{2,}/g, '-')
    .replace(/^-+|-+$/g, '') || 'diagram';
}

function copyComputedStyles(orig, clone) {
  try {
    const computed = window.getComputedStyle(orig);
    if (computed) {
      for (let i = 0; i < computed.length; i++) {
        const prop = computed[i];
        const val = computed.getPropertyValue(prop);
        const prio = computed.getPropertyPriority(prop);
        if (val) clone.style.setProperty(prop, val, prio);
      }
    }
  } catch (e) {
    // ignore
  }
}

function inlineAllStyles(origRoot, cloneRoot) {
  copyComputedStyles(origRoot, cloneRoot);
  const origChildren = Array.from(origRoot.children || []);
  const cloneChildren = Array.from(cloneRoot.children || []);
  for (let i = 0; i < origChildren.length; i++) {
    if (!cloneChildren[i]) continue;
    inlineAllStyles(origChildren[i], cloneChildren[i]);
  }
}

function collectStyleSheetsCss() {
  let css = '';
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      if (!sheet.cssRules) continue;
      for (const rule of Array.from(sheet.cssRules)) {
        // Prefer to include @font-face and normal rules
        if (rule.cssText) css += rule.cssText + "\n";
      }
    } catch (e) {
      // Could be cross-origin stylesheet, skip
      continue;
    }
  }
  return css;
}

export function nodeToSerializedSvg(node, width, height) {
  const cloned = node.cloneNode(true);

  // Inline computed styles by walking both trees in parallel
  try {
    inlineAllStyles(node, cloned);
  } catch (e) {
    console.warn('Failed to inline styles:', e);
  }

  const xmlns = 'http://www.w3.org/2000/svg';
  const xhtml = 'http://www.w3.org/1999/xhtml';
  const svg = document.createElementNS(xmlns, 'svg');
  svg.setAttribute('xmlns', xmlns);
  svg.setAttribute('width', String(width));
  svg.setAttribute('height', String(height));

  const foreignObject = document.createElementNS(xmlns, 'foreignObject');
  foreignObject.setAttribute('width', '100%');
  foreignObject.setAttribute('height', '100%');

  const wrapper = document.createElementNS(xhtml, 'div');
  wrapper.setAttribute('xmlns', xhtml);
  wrapper.style.width = `${width}px`;
  wrapper.style.height = `${height}px`;
  // Add collected styles as a style tag to keep fonts and custom rules
  const styleTag = document.createElement('style');
  try {
    styleTag.textContent = collectStyleSheetsCss();
  } catch (e) {
    styleTag.textContent = '';
  }
  wrapper.appendChild(styleTag);
  wrapper.appendChild(cloned);

  foreignObject.appendChild(wrapper);
  svg.appendChild(foreignObject);

  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svg);
  return svgString;
}

export function downloadDataUrl(dataUrl, filename) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export async function exportNodeAsSvg(node, filename = 'diagram.svg') {
  const rect = node.getBoundingClientRect();
  const svgString = nodeToSerializedSvg(node, Math.ceil(rect.width), Math.ceil(rect.height));
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  downloadDataUrl(url, filename);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function exportNodeAsPng(node, filename = 'diagram.png') {
  const rect = node.getBoundingClientRect();
  const svgString = nodeToSerializedSvg(node, Math.ceil(rect.width), Math.ceil(rect.height));
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil(rect.width);
    canvas.height = Math.ceil(rect.height);
    const ctx = canvas.getContext('2d');
    // White background for better contrast
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    canvas.toBlob((blob) => {
      const url2 = URL.createObjectURL(blob);
      downloadDataUrl(url2, filename);
      setTimeout(() => URL.revokeObjectURL(url2), 1000);
    }, 'image/png');
    URL.revokeObjectURL(url);
  };
  img.onerror = (e) => {
    console.error('Error rendering SVG to image', e);
    URL.revokeObjectURL(url);
  };
  img.src = url;
}
