import { describe, it, expect, beforeEach } from 'vitest';
import { convertToMarkdown, walk } from '../../src/converter.js';

describe('converter.js Unit Tests', () => {
  let container;

  beforeEach(() => {
    document.body.innerHTML = '';
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  describe('walk function', () => {
    it('should extract text from a simple text node', () => {
      container.innerHTML = 'Hello World';
      expect(walk(container).trim()).toBe('Hello World');
    });

    it('should convert h1-h6 tags', () => {
      container.innerHTML = '<h1>Title 1</h1><h2>Title 2</h2>';
      const result = walk(container);
      expect(result).toContain('# Title 1');
      expect(result).toContain('## Title 2');
    });

    it('should convert list items', () => {
      container.innerHTML = '<ul><li>Item 1</li><li>Item 2</li></ul>';
      const result = walk(container);
      expect(result).toContain('- Item 1');
      expect(result).toContain('- Item 2');
    });

    it('should handle bold and italic tags', () => {
      container.innerHTML = '<b>Bold</b> <i>Italic</i> <strong>Strong</strong> <em>Em</em>';
      const result = walk(container);
      expect(result).toContain('**Bold**');
      expect(result).toContain('*Italic*');
      expect(result).toContain('**Strong**');
      expect(result).toContain('*Em*');
    });

    it('should convert links with href', () => {
      container.innerHTML = '<a href="https://example.com">Link</a>';
      const result = walk(container);
      expect(result).toContain('[Link](https://example.com)');
    });

    it('should handle complex nested structures with mixed block/inline elements', () => {
      container.innerHTML = `
        <article>
          <h1>Main Title</h1>
          <p>This is a <b>bold</b> paragraph with a <a href="http://test.com">link</a>.</p>
          <ul>
            <li>Item 1</li>
            <li>Item 2 with <i>italics</i></li>
          </ul>
          <div>
            <h2>Sub Title</h2>
            <p>Nested text <strong>here</strong>.</p>
          </div>
        </article>
      `;
      const result = convertToMarkdown(container);
      expect(result).toContain('# Main Title');
      expect(result).toContain('This is a **bold** paragraph');
      expect(result).toContain('[link](http://test.com)');
      expect(result).toContain('- Item 1');
      expect(result).toContain('- Item 2 with *italics*');
      expect(result).toContain('Nested text **here**');
      expect(result).toContain('## Sub Title');
    });

    it('should ignore script and style tags', () => {
      container.innerHTML =
        '<div>Text</div><script>console.log(1)</script><style>.a{color:red}</style>';
      const result = walk(container);
      expect(result).toContain('Text');
      expect(result).not.toContain('console.log');
      expect(result).not.toContain('.a{color:red}');
    });

    it('should handle nested structures', () => {
      container.innerHTML = '<div><h1>Title</h1><p>Paragraph with <b>bold</b> text.</p></div>';
      const result = walk(container);
      expect(result).toContain('# Title');
      expect(result).toContain('Paragraph with **bold** text.');
    });
  });

  describe('convertToMarkdown function', () => {
    it('should return empty string for null container', () => {
      expect(convertToMarkdown(null)).toBe('');
    });

    it('should clean up multiple newlines', () => {
      container.innerHTML = '<h1>Title</h1><p>Para 1</p><p>Para 2</p>';
      const result = convertToMarkdown(container);
      expect(result).not.toMatch(/\n{3,}/);
      expect(result).toBe('# Title\n\nPara 1\n\nPara 2');
    });

    it('should handle malformed or unexpected structures (Negative Testing)', () => {
      // Unclosed tags are handled by JSDOM parser
      container.innerHTML = '<div><span>No close tag';
      expect(convertToMarkdown(container)).toBe('No close tag');
    });

    it('should handle very large content (Stress Testing)', () => {
      let largeHtml = '';
      for (let i = 0; i < 1000; i++) {
        largeHtml += `<p>Paragraph ${i}</p>`;
      }
      container.innerHTML = largeHtml;
      const start = performance.now();
      const result = convertToMarkdown(container);
      const end = performance.now();
      expect(result).toContain('Paragraph 999');
      console.log(`Large conversion took ${end - start}ms`);
      expect(end - start).toBeLessThan(500); // Should be reasonably fast
    });
  });
});
