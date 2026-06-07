import { describe, it, expect } from 'vitest';
import { convertToMarkdown } from '../../src/converter.js';

describe('System Data Integrity & Negative Tests', () => {
  describe('Data Auditor (DOM as Database)', () => {
    it('should preserve all numeric values correctly during conversion', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <table>
          <tr><td>Price</td><td>1,234.56</td></tr>
          <tr><td>Count</td><td>42</td></tr>
          <tr><td>ID</td><td>#999-001</td></tr>
        </table>
      `;
      const result = convertToMarkdown(container);
      expect(result).toContain('1,234.56');
      expect(result).toContain('42');
      expect(result).toContain('#999-001');
    });

    it('should preserve specific Japanese characters and text patterns', () => {
      const container = document.createElement('div');
      container.innerHTML = '<p>価格は ￥5,000 です。在庫あり。</p>';
      const result = convertToMarkdown(container);
      expect(result).toContain('価格は ￥5,000 です。在庫あり。');
    });
  });

  describe('Negative & Boundary Tests', () => {
    it('should handle extremely deep DOM trees without stack overflow', () => {
      const root = document.createElement('div');
      let current = root;
      for (let i = 0; i < 200; i++) {
        const child = document.createElement('div');
        child.textContent = `Level ${i}`;
        current.appendChild(child);
        current = child;
      }
      expect(() => convertToMarkdown(root)).not.toThrow();
      expect(convertToMarkdown(root)).toContain('Level 199');
    });

    it('should handle empty or whitespace-only nodes gracefully', () => {
      const container = document.createElement('div');
      container.innerHTML = '<div>   </div><span>\n\n</span>';
      expect(convertToMarkdown(container)).toBe('');
    });

    it('should not leak sensitive content from script/style tags into output', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <p>Visible</p>
        <script>const secret = "PRIVATE_KEY";</script>
        <style>.secret { display: none; }</style>
      `;
      const result = convertToMarkdown(container);
      expect(result).toContain('Visible');
      expect(result).not.toContain('PRIVATE_KEY');
      expect(result).not.toContain('.secret');
    });
  });
});
