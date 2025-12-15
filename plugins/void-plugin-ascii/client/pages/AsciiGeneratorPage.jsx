import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Copy, Download, RefreshCw, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

// ASCII font for block letters (ANSI Shadow style)
const ASCII_FONT = {
  'A': [
    ' █████╗ ',
    '██╔══██╗',
    '███████║',
    '██╔══██║',
    '██║  ██║',
    '╚═╝  ╚═╝'
  ],
  'B': [
    '██████╗ ',
    '██╔══██╗',
    '██████╔╝',
    '██╔══██╗',
    '██████╔╝',
    '╚═════╝ '
  ],
  'C': [
    ' ██████╗',
    '██╔════╝',
    '██║     ',
    '██║     ',
    '╚██████╗',
    ' ╚═════╝'
  ],
  'D': [
    '██████╗ ',
    '██╔══██╗',
    '██║  ██║',
    '██║  ██║',
    '██████╔╝',
    '╚═════╝ '
  ],
  'E': [
    '███████╗',
    '██╔════╝',
    '█████╗  ',
    '██╔══╝  ',
    '███████╗',
    '╚══════╝'
  ],
  'F': [
    '███████╗',
    '██╔════╝',
    '█████╗  ',
    '██╔══╝  ',
    '██║     ',
    '╚═╝     '
  ],
  'G': [
    ' ██████╗ ',
    '██╔════╝ ',
    '██║  ███╗',
    '██║   ██║',
    '╚██████╔╝',
    ' ╚═════╝ '
  ],
  'H': [
    '██╗  ██╗',
    '██║  ██║',
    '███████║',
    '██╔══██║',
    '██║  ██║',
    '╚═╝  ╚═╝'
  ],
  'I': [
    '██╗',
    '██║',
    '██║',
    '██║',
    '██║',
    '╚═╝'
  ],
  'J': [
    '     ██╗',
    '     ██║',
    '     ██║',
    '██   ██║',
    '╚█████╔╝',
    ' ╚════╝ '
  ],
  'K': [
    '██╗  ██╗',
    '██║ ██╔╝',
    '█████╔╝ ',
    '██╔═██╗ ',
    '██║  ██╗',
    '╚═╝  ╚═╝'
  ],
  'L': [
    '██╗     ',
    '██║     ',
    '██║     ',
    '██║     ',
    '███████╗',
    '╚══════╝'
  ],
  'M': [
    '███╗   ███╗',
    '████╗ ████║',
    '██╔████╔██║',
    '██║╚██╔╝██║',
    '██║ ╚═╝ ██║',
    '╚═╝     ╚═╝'
  ],
  'N': [
    '███╗   ██╗',
    '████╗  ██║',
    '██╔██╗ ██║',
    '██║╚██╗██║',
    '██║ ╚████║',
    '╚═╝  ╚═══╝'
  ],
  'O': [
    ' ██████╗ ',
    '██╔═══██╗',
    '██║   ██║',
    '██║   ██║',
    '╚██████╔╝',
    ' ╚═════╝ '
  ],
  'P': [
    '██████╗ ',
    '██╔══██╗',
    '██████╔╝',
    '██╔═══╝ ',
    '██║     ',
    '╚═╝     '
  ],
  'Q': [
    ' ██████╗ ',
    '██╔═══██╗',
    '██║   ██║',
    '██║▄▄ ██║',
    '╚██████╔╝',
    ' ╚══▀▀═╝ '
  ],
  'R': [
    '██████╗ ',
    '██╔══██╗',
    '██████╔╝',
    '██╔══██╗',
    '██║  ██║',
    '╚═╝  ╚═╝'
  ],
  'S': [
    '███████╗',
    '██╔════╝',
    '███████╗',
    '╚════██║',
    '███████║',
    '╚══════╝'
  ],
  'T': [
    '████████╗',
    '╚══██╔══╝',
    '   ██║   ',
    '   ██║   ',
    '   ██║   ',
    '   ╚═╝   '
  ],
  'U': [
    '██╗   ██╗',
    '██║   ██║',
    '██║   ██║',
    '██║   ██║',
    '╚██████╔╝',
    ' ╚═════╝ '
  ],
  'V': [
    '██╗   ██╗',
    '██║   ██║',
    '██║   ██║',
    '╚██╗ ██╔╝',
    ' ╚████╔╝ ',
    '  ╚═══╝  '
  ],
  'W': [
    '██╗    ██╗',
    '██║    ██║',
    '██║ █╗ ██║',
    '██║███╗██║',
    '╚███╔███╔╝',
    ' ╚══╝╚══╝ '
  ],
  'X': [
    '██╗  ██╗',
    '╚██╗██╔╝',
    ' ╚███╔╝ ',
    ' ██╔██╗ ',
    '██╔╝ ██╗',
    '╚═╝  ╚═╝'
  ],
  'Y': [
    '██╗   ██╗',
    '╚██╗ ██╔╝',
    ' ╚████╔╝ ',
    '  ╚██╔╝  ',
    '   ██║   ',
    '   ╚═╝   '
  ],
  'Z': [
    '███████╗',
    '╚══███╔╝',
    '  ███╔╝ ',
    ' ███╔╝  ',
    '███████╗',
    '╚══════╝'
  ],
  '0': [
    ' ██████╗ ',
    '██╔═████╗',
    '██║██╔██║',
    '████╔╝██║',
    '╚██████╔╝',
    ' ╚═════╝ '
  ],
  '1': [
    ' ██╗',
    '███║',
    '╚██║',
    ' ██║',
    ' ██║',
    ' ╚═╝'
  ],
  '2': [
    '██████╗ ',
    '╚════██╗',
    ' █████╔╝',
    '██╔═══╝ ',
    '███████╗',
    '╚══════╝'
  ],
  '3': [
    '██████╗ ',
    '╚════██╗',
    ' █████╔╝',
    ' ╚═══██╗',
    '██████╔╝',
    '╚═════╝ '
  ],
  '4': [
    '██╗  ██╗',
    '██║  ██║',
    '███████║',
    '╚════██║',
    '     ██║',
    '     ╚═╝'
  ],
  '5': [
    '███████╗',
    '██╔════╝',
    '███████╗',
    '╚════██║',
    '███████║',
    '╚══════╝'
  ],
  '6': [
    ' ██████╗ ',
    '██╔════╝ ',
    '███████╗ ',
    '██╔═══██╗',
    '╚██████╔╝',
    ' ╚═════╝ '
  ],
  '7': [
    '███████╗',
    '╚════██║',
    '    ██╔╝',
    '   ██╔╝ ',
    '   ██║  ',
    '   ╚═╝  '
  ],
  '8': [
    ' █████╗ ',
    '██╔══██╗',
    '╚█████╔╝',
    '██╔══██╗',
    '╚█████╔╝',
    ' ╚════╝ '
  ],
  '9': [
    ' █████╗ ',
    '██╔══██╗',
    '╚██████║',
    ' ╚═══██║',
    ' █████╔╝',
    ' ╚════╝ '
  ],
  ' ': [
    '   ',
    '   ',
    '   ',
    '   ',
    '   ',
    '   '
  ],
  '_': [
    '        ',
    '        ',
    '        ',
    '        ',
    '████████',
    '╚═══════╝'
  ],
  '-': [
    '      ',
    '      ',
    '█████╗',
    '╚════╝',
    '      ',
    '      '
  ],
  '.': [
    '   ',
    '   ',
    '   ',
    '   ',
    '██╗',
    '╚═╝'
  ],
  ':': [
    '   ',
    '██╗',
    '╚═╝',
    '██╗',
    '╚═╝',
    '   '
  ],
  '/': [
    '    ██╗',
    '   ██╔╝',
    '  ██╔╝ ',
    ' ██╔╝  ',
    '██╔╝   ',
    '╚═╝    '
  ],
  '!': [
    '██╗',
    '██║',
    '██║',
    '╚═╝',
    '██╗',
    '╚═╝'
  ],
  '?': [
    '██████╗ ',
    '╚════██╗',
    '  ▄███╔╝',
    '  ▀▀══╝ ',
    '  ██╗   ',
    '  ╚═╝   '
  ]
};

const generateAsciiText = (text) => {
  const upperText = text.toUpperCase();
  const lines = ['', '', '', '', '', ''];

  for (const char of upperText) {
    const charArt = ASCII_FONT[char] || ASCII_FONT[' '];
    for (let i = 0; i < 6; i++) {
      lines[i] += charArt[i];
    }
  }

  return lines.join('\n');
};

function AsciiGeneratorPage() {
  const [inputText, setInputText] = useState('CLAWED');
  const [boxWidth, setBoxWidth] = useState(63);
  const [useBox, setUseBox] = useState(true);
  const [headerText, setHeaderText] = useState('VOID_PROTOCOL_v0.1.0');
  const [catEmoji, setCatEmoji] = useState('=^._.^=');
  const [output, setOutput] = useState('');
  const outputRef = useRef(null);

  useEffect(() => {
    generateOutput();
  }, [inputText, boxWidth, useBox, headerText, catEmoji]);

  const generateOutput = () => {
    if (!inputText.trim()) {
      setOutput('');
      return;
    }

    if (useBox) {
      const asciiLines = generateAsciiText(inputText).split('\n');
      const border = '#'.repeat(boxWidth);
      const emptyLine = '#' + ' '.repeat(boxWidth - 2) + '#';

      // Header line with title and cat emoji
      const headerContent = `           ${headerText}    ${catEmoji}`;
      const headerPadding = boxWidth - 2 - headerContent.length;
      const headerLine = '#' + headerContent + ' '.repeat(Math.max(0, headerPadding)) + '#';

      // Center the ASCII text
      // Format: '#  ' (3 chars) + content + ' #' (2 chars) = 5 chars overhead
      const centeredLines = asciiLines.map(line => {
        const padding = Math.max(0, boxWidth - 5 - line.length);
        const leftPad = Math.floor(padding / 2);
        const rightPad = padding - leftPad;
        return '#  ' + ' '.repeat(leftPad) + line + ' '.repeat(rightPad) + ' #';
      });

      const result = [
        border,
        emptyLine,
        headerLine,
        emptyLine,
        ...centeredLines,
        emptyLine,
        border
      ].join('\n');

      setOutput(result);
    } else {
      setOutput(generateAsciiText(inputText));
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(output);
    toast.success('Copied to clipboard');
  };

  const downloadTxt = () => {
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ascii-${inputText.toLowerCase().replace(/\s+/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded');
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-2 sm:gap-3">
        <Terminal className="w-6 h-6 sm:w-8 sm:h-8 text-primary flex-shrink-0" />
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary">ASCII Text Generator</h1>
          <p className="text-secondary text-xs sm:text-sm">Generate block letter ASCII art for terminal output</p>
        </div>
      </div>

      {/* Input Controls */}
      <div className="card space-y-3 sm:space-y-4">
        <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2 text-text-primary">
          <Terminal className="w-4 h-4 sm:w-5 sm:h-5" />
          Generator Settings
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="form-label">Text to Convert</label>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter text..."
              className="form-input w-full"
              data-testid="ascii-input"
            />
            <p className="text-xs text-secondary">
              Supports A-Z, 0-9, space, and some punctuation
            </p>
          </div>

          <div className="space-y-2">
            <label className="form-label">Box Width</label>
            <input
              type="number"
              value={boxWidth}
              onChange={(e) => setBoxWidth(parseInt(e.target.value) || 63)}
              min={40}
              max={100}
              className="form-input w-full"
              disabled={!useBox}
              data-testid="box-width-input"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={useBox}
              onChange={(e) => setUseBox(e.target.checked)}
              className="w-4 h-4"
              data-testid="use-box-checkbox"
            />
            <span className="text-sm text-text-primary">Wrap in terminal box</span>
          </label>
        </div>

        {useBox && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-border">
            <div className="space-y-2">
              <label className="form-label">Header Text</label>
              <input
                type="text"
                value={headerText}
                onChange={(e) => setHeaderText(e.target.value)}
                placeholder="VOID_RELAY_PROTOCOL_v0.1.0"
                className="form-input w-full"
                data-testid="header-text-input"
              />
            </div>

            <div className="space-y-2">
              <label className="form-label">Cat Emoji</label>
              <input
                type="text"
                value={catEmoji}
                onChange={(e) => setCatEmoji(e.target.value)}
                placeholder="=^._.^="
                className="form-input w-full"
                data-testid="cat-emoji-input"
              />
            </div>
          </div>
        )}
      </div>

      {/* Output Preview */}
      <div className="card space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between gap-2 mb-2">
          <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2 text-text-primary">
            <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
            Preview
          </h2>
          <div className="flex gap-1">
            <button
              onClick={generateOutput}
              className="p-1.5 rounded border border-border hover:border-primary text-text-secondary hover:text-primary transition-colors"
              title="Refresh preview"
              data-testid="refresh-btn"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={copyToClipboard}
              disabled={!output}
              className="p-1.5 rounded border border-border hover:border-primary text-text-secondary hover:text-primary transition-colors disabled:opacity-50"
              title="Copy to clipboard"
              data-testid="copy-btn"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={downloadTxt}
              disabled={!output}
              className="p-1.5 rounded border border-primary bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
              title="Download as .txt"
              data-testid="download-btn"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div
          ref={outputRef}
          className="bg-surface border border-border rounded p-2 sm:p-4 font-mono ascii-preview overflow-x-auto"
          data-testid="ascii-output"
        >
          {output ? (
            <pre className="whitespace-pre text-primary">{output}</pre>
          ) : (
            <p className="text-secondary">Enter text above to generate ASCII art</p>
          )}
        </div>
      </div>

      {/* Character Reference */}
      <div className="card space-y-3 sm:space-y-4">
        <h2 className="text-base sm:text-lg font-semibold text-text-primary">Supported Characters</h2>
        <div className="char-grid">
          {Object.keys(ASCII_FONT).filter(c => c !== ' ').map(char => (
            <button
              key={char}
              onClick={() => setInputText(prev => prev + char)}
              className="px-2 py-1.5 sm:px-3 sm:py-2 bg-surface border border-border rounded hover:border-primary font-mono text-text-primary transition-colors text-sm sm:text-base"
              data-testid={`char-btn-${char}`}
            >
              {char}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AsciiGeneratorPage;
