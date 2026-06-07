export const walk = (node, options = {}) => {
  const { excludeTags = ['script', 'style', 'nav', 'footer', 'header', 'noscript'] } = options;

  if (node.nodeType === 3) {
    // Node.TEXT_NODE
    return node.nodeValue.trim();
  }
  if (node.nodeType !== 1) return ''; // Node.ELEMENT_NODE

  const tag = node.tagName.toLowerCase();
  if (excludeTags.includes(tag)) return '';

  let childrenParts = [];
  for (let child of node.childNodes) {
    const result = walk(child, options);
    if (result) {
      childrenParts.push(result);
    }
  }

  // インライン要素かブロック要素かで結合方法を変える
  const isBlock = [
    'div',
    'p',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'li',
    'article',
    'section',
    'main',
    'ul',
    'ol',
  ].includes(tag);
  let childrenMd = childrenParts.join(isBlock ? ' ' : '');

  if (!childrenMd && tag !== 'br') return '';

  switch (tag) {
    case 'h1':
      return `\n# ${childrenMd}\n\n`;
    case 'h2':
      return `\n## ${childrenMd}\n\n`;
    case 'h3':
      return `\n### ${childrenMd}\n\n`;
    case 'h4':
      return `\n#### ${childrenMd}\n\n`;
    case 'h5':
      return `\n##### ${childrenMd}\n\n`;
    case 'h6':
      return `\n###### ${childrenMd}\n\n`;
    case 'p':
      return `\n${childrenMd}\n\n`;
    case 'li':
      return `- ${childrenMd}\n`;
    case 'br':
      return '\n';
    case 'strong':
    case 'b':
      return `**${childrenMd}**`;
    case 'em':
    case 'i':
      return `*${childrenMd}*`;
    case 'a': {
      const href = node.getAttribute('href');
      return href && (href.startsWith('http') || href.startsWith('/'))
        ? `[${childrenMd}](${href})`
        : childrenMd;
    }
    default:
      return isBlock ? `\n${childrenMd}\n` : childrenMd;
  }
};

export const convertToMarkdown = (container) => {
  if (!container) return '';
  const rawMd = walk(container);
  return rawMd
    .replace(/\n\s+\n/g, '\n\n') // 空行のスペースを削除
    .replace(/\n{3,}/g, '\n\n') // 3つ以上の改行を2つに
    .trim();
};
