// Better Compact 0.2.5 — AGPL-3.0-or-later; upstream: https://github.com/AshishKumar4/better-compact; base commit: 105ce9cfeb8e207c8c2abd55096c89a6db442c28.

// index.ts
import { join as join8 } from "path";

// lib/config.ts
import {
  closeSync,
  existsSync,
  fsyncSync,
  mkdirSync,
  openSync,
  readFileSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync
} from "fs";
import { join as join2, dirname as dirname2 } from "path";
import { homedir } from "os";

// ../../node_modules/.pnpm/jsonc-parser@3.3.1/node_modules/jsonc-parser/lib/esm/impl/scanner.js
function createScanner(text, ignoreTrivia = false) {
  const len = text.length;
  let pos = 0, value = "", tokenOffset = 0, token = 16, lineNumber = 0, lineStartOffset = 0, tokenLineStartOffset = 0, prevTokenLineStartOffset = 0, scanError = 0;
  function scanHexDigits(count, exact) {
    let digits = 0;
    let value2 = 0;
    while (digits < count || !exact) {
      let ch = text.charCodeAt(pos);
      if (ch >= 48 && ch <= 57) {
        value2 = value2 * 16 + ch - 48;
      } else if (ch >= 65 && ch <= 70) {
        value2 = value2 * 16 + ch - 65 + 10;
      } else if (ch >= 97 && ch <= 102) {
        value2 = value2 * 16 + ch - 97 + 10;
      } else {
        break;
      }
      pos++;
      digits++;
    }
    if (digits < count) {
      value2 = -1;
    }
    return value2;
  }
  function setPosition(newPosition) {
    pos = newPosition;
    value = "";
    tokenOffset = 0;
    token = 16;
    scanError = 0;
  }
  function scanNumber() {
    let start = pos;
    if (text.charCodeAt(pos) === 48) {
      pos++;
    } else {
      pos++;
      while (pos < text.length && isDigit(text.charCodeAt(pos))) {
        pos++;
      }
    }
    if (pos < text.length && text.charCodeAt(pos) === 46) {
      pos++;
      if (pos < text.length && isDigit(text.charCodeAt(pos))) {
        pos++;
        while (pos < text.length && isDigit(text.charCodeAt(pos))) {
          pos++;
        }
      } else {
        scanError = 3;
        return text.substring(start, pos);
      }
    }
    let end = pos;
    if (pos < text.length && (text.charCodeAt(pos) === 69 || text.charCodeAt(pos) === 101)) {
      pos++;
      if (pos < text.length && text.charCodeAt(pos) === 43 || text.charCodeAt(pos) === 45) {
        pos++;
      }
      if (pos < text.length && isDigit(text.charCodeAt(pos))) {
        pos++;
        while (pos < text.length && isDigit(text.charCodeAt(pos))) {
          pos++;
        }
        end = pos;
      } else {
        scanError = 3;
      }
    }
    return text.substring(start, end);
  }
  function scanString() {
    let result = "", start = pos;
    while (true) {
      if (pos >= len) {
        result += text.substring(start, pos);
        scanError = 2;
        break;
      }
      const ch = text.charCodeAt(pos);
      if (ch === 34) {
        result += text.substring(start, pos);
        pos++;
        break;
      }
      if (ch === 92) {
        result += text.substring(start, pos);
        pos++;
        if (pos >= len) {
          scanError = 2;
          break;
        }
        const ch2 = text.charCodeAt(pos++);
        switch (ch2) {
          case 34:
            result += '"';
            break;
          case 92:
            result += "\\";
            break;
          case 47:
            result += "/";
            break;
          case 98:
            result += "\b";
            break;
          case 102:
            result += "\f";
            break;
          case 110:
            result += "\n";
            break;
          case 114:
            result += "\r";
            break;
          case 116:
            result += "	";
            break;
          case 117:
            const ch3 = scanHexDigits(4, true);
            if (ch3 >= 0) {
              result += String.fromCharCode(ch3);
            } else {
              scanError = 4;
            }
            break;
          default:
            scanError = 5;
        }
        start = pos;
        continue;
      }
      if (ch >= 0 && ch <= 31) {
        if (isLineBreak(ch)) {
          result += text.substring(start, pos);
          scanError = 2;
          break;
        } else {
          scanError = 6;
        }
      }
      pos++;
    }
    return result;
  }
  function scanNext() {
    value = "";
    scanError = 0;
    tokenOffset = pos;
    lineStartOffset = lineNumber;
    prevTokenLineStartOffset = tokenLineStartOffset;
    if (pos >= len) {
      tokenOffset = len;
      return token = 17;
    }
    let code = text.charCodeAt(pos);
    if (isWhiteSpace(code)) {
      do {
        pos++;
        value += String.fromCharCode(code);
        code = text.charCodeAt(pos);
      } while (isWhiteSpace(code));
      return token = 15;
    }
    if (isLineBreak(code)) {
      pos++;
      value += String.fromCharCode(code);
      if (code === 13 && text.charCodeAt(pos) === 10) {
        pos++;
        value += "\n";
      }
      lineNumber++;
      tokenLineStartOffset = pos;
      return token = 14;
    }
    switch (code) {
      // tokens: []{}:,
      case 123:
        pos++;
        return token = 1;
      case 125:
        pos++;
        return token = 2;
      case 91:
        pos++;
        return token = 3;
      case 93:
        pos++;
        return token = 4;
      case 58:
        pos++;
        return token = 6;
      case 44:
        pos++;
        return token = 5;
      // strings
      case 34:
        pos++;
        value = scanString();
        return token = 10;
      // comments
      case 47:
        const start = pos - 1;
        if (text.charCodeAt(pos + 1) === 47) {
          pos += 2;
          while (pos < len) {
            if (isLineBreak(text.charCodeAt(pos))) {
              break;
            }
            pos++;
          }
          value = text.substring(start, pos);
          return token = 12;
        }
        if (text.charCodeAt(pos + 1) === 42) {
          pos += 2;
          const safeLength = len - 1;
          let commentClosed = false;
          while (pos < safeLength) {
            const ch = text.charCodeAt(pos);
            if (ch === 42 && text.charCodeAt(pos + 1) === 47) {
              pos += 2;
              commentClosed = true;
              break;
            }
            pos++;
            if (isLineBreak(ch)) {
              if (ch === 13 && text.charCodeAt(pos) === 10) {
                pos++;
              }
              lineNumber++;
              tokenLineStartOffset = pos;
            }
          }
          if (!commentClosed) {
            pos++;
            scanError = 1;
          }
          value = text.substring(start, pos);
          return token = 13;
        }
        value += String.fromCharCode(code);
        pos++;
        return token = 16;
      // numbers
      case 45:
        value += String.fromCharCode(code);
        pos++;
        if (pos === len || !isDigit(text.charCodeAt(pos))) {
          return token = 16;
        }
      // found a minus, followed by a number so
      // we fall through to proceed with scanning
      // numbers
      case 48:
      case 49:
      case 50:
      case 51:
      case 52:
      case 53:
      case 54:
      case 55:
      case 56:
      case 57:
        value += scanNumber();
        return token = 11;
      // literals and unknown symbols
      default:
        while (pos < len && isUnknownContentCharacter(code)) {
          pos++;
          code = text.charCodeAt(pos);
        }
        if (tokenOffset !== pos) {
          value = text.substring(tokenOffset, pos);
          switch (value) {
            case "true":
              return token = 8;
            case "false":
              return token = 9;
            case "null":
              return token = 7;
          }
          return token = 16;
        }
        value += String.fromCharCode(code);
        pos++;
        return token = 16;
    }
  }
  function isUnknownContentCharacter(code) {
    if (isWhiteSpace(code) || isLineBreak(code)) {
      return false;
    }
    switch (code) {
      case 125:
      case 93:
      case 123:
      case 91:
      case 34:
      case 58:
      case 44:
      case 47:
        return false;
    }
    return true;
  }
  function scanNextNonTrivia() {
    let result;
    do {
      result = scanNext();
    } while (result >= 12 && result <= 15);
    return result;
  }
  return {
    setPosition,
    getPosition: () => pos,
    scan: ignoreTrivia ? scanNextNonTrivia : scanNext,
    getToken: () => token,
    getTokenValue: () => value,
    getTokenOffset: () => tokenOffset,
    getTokenLength: () => pos - tokenOffset,
    getTokenStartLine: () => lineStartOffset,
    getTokenStartCharacter: () => tokenOffset - prevTokenLineStartOffset,
    getTokenError: () => scanError
  };
}
function isWhiteSpace(ch) {
  return ch === 32 || ch === 9;
}
function isLineBreak(ch) {
  return ch === 10 || ch === 13;
}
function isDigit(ch) {
  return ch >= 48 && ch <= 57;
}
var CharacterCodes;
(function(CharacterCodes2) {
  CharacterCodes2[CharacterCodes2["lineFeed"] = 10] = "lineFeed";
  CharacterCodes2[CharacterCodes2["carriageReturn"] = 13] = "carriageReturn";
  CharacterCodes2[CharacterCodes2["space"] = 32] = "space";
  CharacterCodes2[CharacterCodes2["_0"] = 48] = "_0";
  CharacterCodes2[CharacterCodes2["_1"] = 49] = "_1";
  CharacterCodes2[CharacterCodes2["_2"] = 50] = "_2";
  CharacterCodes2[CharacterCodes2["_3"] = 51] = "_3";
  CharacterCodes2[CharacterCodes2["_4"] = 52] = "_4";
  CharacterCodes2[CharacterCodes2["_5"] = 53] = "_5";
  CharacterCodes2[CharacterCodes2["_6"] = 54] = "_6";
  CharacterCodes2[CharacterCodes2["_7"] = 55] = "_7";
  CharacterCodes2[CharacterCodes2["_8"] = 56] = "_8";
  CharacterCodes2[CharacterCodes2["_9"] = 57] = "_9";
  CharacterCodes2[CharacterCodes2["a"] = 97] = "a";
  CharacterCodes2[CharacterCodes2["b"] = 98] = "b";
  CharacterCodes2[CharacterCodes2["c"] = 99] = "c";
  CharacterCodes2[CharacterCodes2["d"] = 100] = "d";
  CharacterCodes2[CharacterCodes2["e"] = 101] = "e";
  CharacterCodes2[CharacterCodes2["f"] = 102] = "f";
  CharacterCodes2[CharacterCodes2["g"] = 103] = "g";
  CharacterCodes2[CharacterCodes2["h"] = 104] = "h";
  CharacterCodes2[CharacterCodes2["i"] = 105] = "i";
  CharacterCodes2[CharacterCodes2["j"] = 106] = "j";
  CharacterCodes2[CharacterCodes2["k"] = 107] = "k";
  CharacterCodes2[CharacterCodes2["l"] = 108] = "l";
  CharacterCodes2[CharacterCodes2["m"] = 109] = "m";
  CharacterCodes2[CharacterCodes2["n"] = 110] = "n";
  CharacterCodes2[CharacterCodes2["o"] = 111] = "o";
  CharacterCodes2[CharacterCodes2["p"] = 112] = "p";
  CharacterCodes2[CharacterCodes2["q"] = 113] = "q";
  CharacterCodes2[CharacterCodes2["r"] = 114] = "r";
  CharacterCodes2[CharacterCodes2["s"] = 115] = "s";
  CharacterCodes2[CharacterCodes2["t"] = 116] = "t";
  CharacterCodes2[CharacterCodes2["u"] = 117] = "u";
  CharacterCodes2[CharacterCodes2["v"] = 118] = "v";
  CharacterCodes2[CharacterCodes2["w"] = 119] = "w";
  CharacterCodes2[CharacterCodes2["x"] = 120] = "x";
  CharacterCodes2[CharacterCodes2["y"] = 121] = "y";
  CharacterCodes2[CharacterCodes2["z"] = 122] = "z";
  CharacterCodes2[CharacterCodes2["A"] = 65] = "A";
  CharacterCodes2[CharacterCodes2["B"] = 66] = "B";
  CharacterCodes2[CharacterCodes2["C"] = 67] = "C";
  CharacterCodes2[CharacterCodes2["D"] = 68] = "D";
  CharacterCodes2[CharacterCodes2["E"] = 69] = "E";
  CharacterCodes2[CharacterCodes2["F"] = 70] = "F";
  CharacterCodes2[CharacterCodes2["G"] = 71] = "G";
  CharacterCodes2[CharacterCodes2["H"] = 72] = "H";
  CharacterCodes2[CharacterCodes2["I"] = 73] = "I";
  CharacterCodes2[CharacterCodes2["J"] = 74] = "J";
  CharacterCodes2[CharacterCodes2["K"] = 75] = "K";
  CharacterCodes2[CharacterCodes2["L"] = 76] = "L";
  CharacterCodes2[CharacterCodes2["M"] = 77] = "M";
  CharacterCodes2[CharacterCodes2["N"] = 78] = "N";
  CharacterCodes2[CharacterCodes2["O"] = 79] = "O";
  CharacterCodes2[CharacterCodes2["P"] = 80] = "P";
  CharacterCodes2[CharacterCodes2["Q"] = 81] = "Q";
  CharacterCodes2[CharacterCodes2["R"] = 82] = "R";
  CharacterCodes2[CharacterCodes2["S"] = 83] = "S";
  CharacterCodes2[CharacterCodes2["T"] = 84] = "T";
  CharacterCodes2[CharacterCodes2["U"] = 85] = "U";
  CharacterCodes2[CharacterCodes2["V"] = 86] = "V";
  CharacterCodes2[CharacterCodes2["W"] = 87] = "W";
  CharacterCodes2[CharacterCodes2["X"] = 88] = "X";
  CharacterCodes2[CharacterCodes2["Y"] = 89] = "Y";
  CharacterCodes2[CharacterCodes2["Z"] = 90] = "Z";
  CharacterCodes2[CharacterCodes2["asterisk"] = 42] = "asterisk";
  CharacterCodes2[CharacterCodes2["backslash"] = 92] = "backslash";
  CharacterCodes2[CharacterCodes2["closeBrace"] = 125] = "closeBrace";
  CharacterCodes2[CharacterCodes2["closeBracket"] = 93] = "closeBracket";
  CharacterCodes2[CharacterCodes2["colon"] = 58] = "colon";
  CharacterCodes2[CharacterCodes2["comma"] = 44] = "comma";
  CharacterCodes2[CharacterCodes2["dot"] = 46] = "dot";
  CharacterCodes2[CharacterCodes2["doubleQuote"] = 34] = "doubleQuote";
  CharacterCodes2[CharacterCodes2["minus"] = 45] = "minus";
  CharacterCodes2[CharacterCodes2["openBrace"] = 123] = "openBrace";
  CharacterCodes2[CharacterCodes2["openBracket"] = 91] = "openBracket";
  CharacterCodes2[CharacterCodes2["plus"] = 43] = "plus";
  CharacterCodes2[CharacterCodes2["slash"] = 47] = "slash";
  CharacterCodes2[CharacterCodes2["formFeed"] = 12] = "formFeed";
  CharacterCodes2[CharacterCodes2["tab"] = 9] = "tab";
})(CharacterCodes || (CharacterCodes = {}));

// ../../node_modules/.pnpm/jsonc-parser@3.3.1/node_modules/jsonc-parser/lib/esm/impl/string-intern.js
var cachedSpaces = new Array(20).fill(0).map((_, index) => {
  return " ".repeat(index);
});
var maxCachedValues = 200;
var cachedBreakLinesWithSpaces = {
  " ": {
    "\n": new Array(maxCachedValues).fill(0).map((_, index) => {
      return "\n" + " ".repeat(index);
    }),
    "\r": new Array(maxCachedValues).fill(0).map((_, index) => {
      return "\r" + " ".repeat(index);
    }),
    "\r\n": new Array(maxCachedValues).fill(0).map((_, index) => {
      return "\r\n" + " ".repeat(index);
    })
  },
  "	": {
    "\n": new Array(maxCachedValues).fill(0).map((_, index) => {
      return "\n" + "	".repeat(index);
    }),
    "\r": new Array(maxCachedValues).fill(0).map((_, index) => {
      return "\r" + "	".repeat(index);
    }),
    "\r\n": new Array(maxCachedValues).fill(0).map((_, index) => {
      return "\r\n" + "	".repeat(index);
    })
  }
};

// ../../node_modules/.pnpm/jsonc-parser@3.3.1/node_modules/jsonc-parser/lib/esm/impl/parser.js
var ParseOptions;
(function(ParseOptions2) {
  ParseOptions2.DEFAULT = {
    allowTrailingComma: false
  };
})(ParseOptions || (ParseOptions = {}));
function parse(text, errors = [], options = ParseOptions.DEFAULT) {
  let currentProperty = null;
  let currentParent = [];
  const previousParents = [];
  function onValue(value) {
    if (Array.isArray(currentParent)) {
      currentParent.push(value);
    } else if (currentProperty !== null) {
      currentParent[currentProperty] = value;
    }
  }
  const visitor = {
    onObjectBegin: () => {
      const object = {};
      onValue(object);
      previousParents.push(currentParent);
      currentParent = object;
      currentProperty = null;
    },
    onObjectProperty: (name) => {
      currentProperty = name;
    },
    onObjectEnd: () => {
      currentParent = previousParents.pop();
    },
    onArrayBegin: () => {
      const array = [];
      onValue(array);
      previousParents.push(currentParent);
      currentParent = array;
      currentProperty = null;
    },
    onArrayEnd: () => {
      currentParent = previousParents.pop();
    },
    onLiteralValue: onValue,
    onError: (error, offset, length) => {
      errors.push({ error, offset, length });
    }
  };
  visit(text, visitor, options);
  return currentParent[0];
}
function visit(text, visitor, options = ParseOptions.DEFAULT) {
  const _scanner = createScanner(text, false);
  const _jsonPath = [];
  let suppressedCallbacks = 0;
  function toNoArgVisit(visitFunction) {
    return visitFunction ? () => suppressedCallbacks === 0 && visitFunction(_scanner.getTokenOffset(), _scanner.getTokenLength(), _scanner.getTokenStartLine(), _scanner.getTokenStartCharacter()) : () => true;
  }
  function toOneArgVisit(visitFunction) {
    return visitFunction ? (arg) => suppressedCallbacks === 0 && visitFunction(arg, _scanner.getTokenOffset(), _scanner.getTokenLength(), _scanner.getTokenStartLine(), _scanner.getTokenStartCharacter()) : () => true;
  }
  function toOneArgVisitWithPath(visitFunction) {
    return visitFunction ? (arg) => suppressedCallbacks === 0 && visitFunction(arg, _scanner.getTokenOffset(), _scanner.getTokenLength(), _scanner.getTokenStartLine(), _scanner.getTokenStartCharacter(), () => _jsonPath.slice()) : () => true;
  }
  function toBeginVisit(visitFunction) {
    return visitFunction ? () => {
      if (suppressedCallbacks > 0) {
        suppressedCallbacks++;
      } else {
        let cbReturn = visitFunction(_scanner.getTokenOffset(), _scanner.getTokenLength(), _scanner.getTokenStartLine(), _scanner.getTokenStartCharacter(), () => _jsonPath.slice());
        if (cbReturn === false) {
          suppressedCallbacks = 1;
        }
      }
    } : () => true;
  }
  function toEndVisit(visitFunction) {
    return visitFunction ? () => {
      if (suppressedCallbacks > 0) {
        suppressedCallbacks--;
      }
      if (suppressedCallbacks === 0) {
        visitFunction(_scanner.getTokenOffset(), _scanner.getTokenLength(), _scanner.getTokenStartLine(), _scanner.getTokenStartCharacter());
      }
    } : () => true;
  }
  const onObjectBegin = toBeginVisit(visitor.onObjectBegin), onObjectProperty = toOneArgVisitWithPath(visitor.onObjectProperty), onObjectEnd = toEndVisit(visitor.onObjectEnd), onArrayBegin = toBeginVisit(visitor.onArrayBegin), onArrayEnd = toEndVisit(visitor.onArrayEnd), onLiteralValue = toOneArgVisitWithPath(visitor.onLiteralValue), onSeparator = toOneArgVisit(visitor.onSeparator), onComment = toNoArgVisit(visitor.onComment), onError = toOneArgVisit(visitor.onError);
  const disallowComments = options && options.disallowComments;
  const allowTrailingComma = options && options.allowTrailingComma;
  function scanNext() {
    while (true) {
      const token = _scanner.scan();
      switch (_scanner.getTokenError()) {
        case 4:
          handleError(
            14
            /* ParseErrorCode.InvalidUnicode */
          );
          break;
        case 5:
          handleError(
            15
            /* ParseErrorCode.InvalidEscapeCharacter */
          );
          break;
        case 3:
          handleError(
            13
            /* ParseErrorCode.UnexpectedEndOfNumber */
          );
          break;
        case 1:
          if (!disallowComments) {
            handleError(
              11
              /* ParseErrorCode.UnexpectedEndOfComment */
            );
          }
          break;
        case 2:
          handleError(
            12
            /* ParseErrorCode.UnexpectedEndOfString */
          );
          break;
        case 6:
          handleError(
            16
            /* ParseErrorCode.InvalidCharacter */
          );
          break;
      }
      switch (token) {
        case 12:
        case 13:
          if (disallowComments) {
            handleError(
              10
              /* ParseErrorCode.InvalidCommentToken */
            );
          } else {
            onComment();
          }
          break;
        case 16:
          handleError(
            1
            /* ParseErrorCode.InvalidSymbol */
          );
          break;
        case 15:
        case 14:
          break;
        default:
          return token;
      }
    }
  }
  function handleError(error, skipUntilAfter = [], skipUntil = []) {
    onError(error);
    if (skipUntilAfter.length + skipUntil.length > 0) {
      let token = _scanner.getToken();
      while (token !== 17) {
        if (skipUntilAfter.indexOf(token) !== -1) {
          scanNext();
          break;
        } else if (skipUntil.indexOf(token) !== -1) {
          break;
        }
        token = scanNext();
      }
    }
  }
  function parseString(isValue) {
    const value = _scanner.getTokenValue();
    if (isValue) {
      onLiteralValue(value);
    } else {
      onObjectProperty(value);
      _jsonPath.push(value);
    }
    scanNext();
    return true;
  }
  function parseLiteral() {
    switch (_scanner.getToken()) {
      case 11:
        const tokenValue = _scanner.getTokenValue();
        let value = Number(tokenValue);
        if (isNaN(value)) {
          handleError(
            2
            /* ParseErrorCode.InvalidNumberFormat */
          );
          value = 0;
        }
        onLiteralValue(value);
        break;
      case 7:
        onLiteralValue(null);
        break;
      case 8:
        onLiteralValue(true);
        break;
      case 9:
        onLiteralValue(false);
        break;
      default:
        return false;
    }
    scanNext();
    return true;
  }
  function parseProperty() {
    if (_scanner.getToken() !== 10) {
      handleError(3, [], [
        2,
        5
        /* SyntaxKind.CommaToken */
      ]);
      return false;
    }
    parseString(false);
    if (_scanner.getToken() === 6) {
      onSeparator(":");
      scanNext();
      if (!parseValue()) {
        handleError(4, [], [
          2,
          5
          /* SyntaxKind.CommaToken */
        ]);
      }
    } else {
      handleError(5, [], [
        2,
        5
        /* SyntaxKind.CommaToken */
      ]);
    }
    _jsonPath.pop();
    return true;
  }
  function parseObject() {
    onObjectBegin();
    scanNext();
    let needsComma = false;
    while (_scanner.getToken() !== 2 && _scanner.getToken() !== 17) {
      if (_scanner.getToken() === 5) {
        if (!needsComma) {
          handleError(4, [], []);
        }
        onSeparator(",");
        scanNext();
        if (_scanner.getToken() === 2 && allowTrailingComma) {
          break;
        }
      } else if (needsComma) {
        handleError(6, [], []);
      }
      if (!parseProperty()) {
        handleError(4, [], [
          2,
          5
          /* SyntaxKind.CommaToken */
        ]);
      }
      needsComma = true;
    }
    onObjectEnd();
    if (_scanner.getToken() !== 2) {
      handleError(7, [
        2
        /* SyntaxKind.CloseBraceToken */
      ], []);
    } else {
      scanNext();
    }
    return true;
  }
  function parseArray() {
    onArrayBegin();
    scanNext();
    let isFirstElement = true;
    let needsComma = false;
    while (_scanner.getToken() !== 4 && _scanner.getToken() !== 17) {
      if (_scanner.getToken() === 5) {
        if (!needsComma) {
          handleError(4, [], []);
        }
        onSeparator(",");
        scanNext();
        if (_scanner.getToken() === 4 && allowTrailingComma) {
          break;
        }
      } else if (needsComma) {
        handleError(6, [], []);
      }
      if (isFirstElement) {
        _jsonPath.push(0);
        isFirstElement = false;
      } else {
        _jsonPath[_jsonPath.length - 1]++;
      }
      if (!parseValue()) {
        handleError(4, [], [
          4,
          5
          /* SyntaxKind.CommaToken */
        ]);
      }
      needsComma = true;
    }
    onArrayEnd();
    if (!isFirstElement) {
      _jsonPath.pop();
    }
    if (_scanner.getToken() !== 4) {
      handleError(8, [
        4
        /* SyntaxKind.CloseBracketToken */
      ], []);
    } else {
      scanNext();
    }
    return true;
  }
  function parseValue() {
    switch (_scanner.getToken()) {
      case 3:
        return parseArray();
      case 1:
        return parseObject();
      case 10:
        return parseString(true);
      default:
        return parseLiteral();
    }
  }
  scanNext();
  if (_scanner.getToken() === 17) {
    if (options.allowEmptyContent) {
      return true;
    }
    handleError(4, [], []);
    return false;
  }
  if (!parseValue()) {
    handleError(4, [], []);
    return false;
  }
  if (_scanner.getToken() !== 17) {
    handleError(9, [], []);
  }
  return true;
}

// ../../node_modules/.pnpm/jsonc-parser@3.3.1/node_modules/jsonc-parser/lib/esm/main.js
var ScanError;
(function(ScanError2) {
  ScanError2[ScanError2["None"] = 0] = "None";
  ScanError2[ScanError2["UnexpectedEndOfComment"] = 1] = "UnexpectedEndOfComment";
  ScanError2[ScanError2["UnexpectedEndOfString"] = 2] = "UnexpectedEndOfString";
  ScanError2[ScanError2["UnexpectedEndOfNumber"] = 3] = "UnexpectedEndOfNumber";
  ScanError2[ScanError2["InvalidUnicode"] = 4] = "InvalidUnicode";
  ScanError2[ScanError2["InvalidEscapeCharacter"] = 5] = "InvalidEscapeCharacter";
  ScanError2[ScanError2["InvalidCharacter"] = 6] = "InvalidCharacter";
})(ScanError || (ScanError = {}));
var SyntaxKind;
(function(SyntaxKind2) {
  SyntaxKind2[SyntaxKind2["OpenBraceToken"] = 1] = "OpenBraceToken";
  SyntaxKind2[SyntaxKind2["CloseBraceToken"] = 2] = "CloseBraceToken";
  SyntaxKind2[SyntaxKind2["OpenBracketToken"] = 3] = "OpenBracketToken";
  SyntaxKind2[SyntaxKind2["CloseBracketToken"] = 4] = "CloseBracketToken";
  SyntaxKind2[SyntaxKind2["CommaToken"] = 5] = "CommaToken";
  SyntaxKind2[SyntaxKind2["ColonToken"] = 6] = "ColonToken";
  SyntaxKind2[SyntaxKind2["NullKeyword"] = 7] = "NullKeyword";
  SyntaxKind2[SyntaxKind2["TrueKeyword"] = 8] = "TrueKeyword";
  SyntaxKind2[SyntaxKind2["FalseKeyword"] = 9] = "FalseKeyword";
  SyntaxKind2[SyntaxKind2["StringLiteral"] = 10] = "StringLiteral";
  SyntaxKind2[SyntaxKind2["NumericLiteral"] = 11] = "NumericLiteral";
  SyntaxKind2[SyntaxKind2["LineCommentTrivia"] = 12] = "LineCommentTrivia";
  SyntaxKind2[SyntaxKind2["BlockCommentTrivia"] = 13] = "BlockCommentTrivia";
  SyntaxKind2[SyntaxKind2["LineBreakTrivia"] = 14] = "LineBreakTrivia";
  SyntaxKind2[SyntaxKind2["Trivia"] = 15] = "Trivia";
  SyntaxKind2[SyntaxKind2["Unknown"] = 16] = "Unknown";
  SyntaxKind2[SyntaxKind2["EOF"] = 17] = "EOF";
})(SyntaxKind || (SyntaxKind = {}));
var parse2 = parse;
var ParseErrorCode;
(function(ParseErrorCode2) {
  ParseErrorCode2[ParseErrorCode2["InvalidSymbol"] = 1] = "InvalidSymbol";
  ParseErrorCode2[ParseErrorCode2["InvalidNumberFormat"] = 2] = "InvalidNumberFormat";
  ParseErrorCode2[ParseErrorCode2["PropertyNameExpected"] = 3] = "PropertyNameExpected";
  ParseErrorCode2[ParseErrorCode2["ValueExpected"] = 4] = "ValueExpected";
  ParseErrorCode2[ParseErrorCode2["ColonExpected"] = 5] = "ColonExpected";
  ParseErrorCode2[ParseErrorCode2["CommaExpected"] = 6] = "CommaExpected";
  ParseErrorCode2[ParseErrorCode2["CloseBraceExpected"] = 7] = "CloseBraceExpected";
  ParseErrorCode2[ParseErrorCode2["CloseBracketExpected"] = 8] = "CloseBracketExpected";
  ParseErrorCode2[ParseErrorCode2["EndOfFileExpected"] = 9] = "EndOfFileExpected";
  ParseErrorCode2[ParseErrorCode2["InvalidCommentToken"] = 10] = "InvalidCommentToken";
  ParseErrorCode2[ParseErrorCode2["UnexpectedEndOfComment"] = 11] = "UnexpectedEndOfComment";
  ParseErrorCode2[ParseErrorCode2["UnexpectedEndOfString"] = 12] = "UnexpectedEndOfString";
  ParseErrorCode2[ParseErrorCode2["UnexpectedEndOfNumber"] = 13] = "UnexpectedEndOfNumber";
  ParseErrorCode2[ParseErrorCode2["InvalidUnicode"] = 14] = "InvalidUnicode";
  ParseErrorCode2[ParseErrorCode2["InvalidEscapeCharacter"] = 15] = "InvalidEscapeCharacter";
  ParseErrorCode2[ParseErrorCode2["InvalidCharacter"] = 16] = "InvalidCharacter";
})(ParseErrorCode || (ParseErrorCode = {}));

// ../core/src/identity.ts
import { createHash } from "crypto";
function rangeHash(turns) {
  const seed = turns.map((turn) => `${turn.key}:${turn.stamp}${turn.fragmentKey ? `:${turn.fragmentKey}` : ""}`).join("|");
  return createHash("sha256").update(seed).digest("hex").slice(0, 16);
}
function assistantRunKey(turns) {
  const seed = turns.map((turn) => [
    turn.role,
    turn.stamp,
    assistantContentDigest(turn.items),
    turn.fragmentKey ?? null
  ]);
  return createHash("sha256").update(JSON.stringify(seed)).digest("hex").slice(0, 16);
}
function assistantContentDigest(items) {
  const seed = items.map((item) => {
    if (item.kind === "text" || item.kind === "synthetic") return [item.kind, item.text];
    if (item.kind === "tool") return [item.kind, item.callId];
    return [item.kind];
  });
  return createHash("sha256").update(JSON.stringify(seed)).digest("hex");
}
function syntheticTextKey(turnKey, text) {
  return `${turnKey}_better_compact_text_${createHash("sha1").update(text).digest("hex").slice(0, 8)}`;
}

// ../core/src/estimate.ts
function countTokens(text) {
  if (!text) return 0;
  return Math.max(0, Math.round(text.length / 4));
}
function estimateTurns(turns, codec, estimator) {
  return Math.max(0, Math.round(codec.estimateTurns(turns) + estimator.overheadTokens));
}
function truncate(text, maxChars) {
  if (text.length <= maxChars) return text;
  return `${text.slice(0, Math.max(0, maxChars - 24)).trimEnd()}
[...omitted]`;
}

// ../core/src/plan.ts
function toPlanSnapshot(plan) {
  return {
    sessionId: plan.sessionId,
    rangeHash: plan.rangeHash,
    contextLimit: plan.contextLimit,
    rawTailStartMessageId: plan.rawTailStartMessageId,
    rawTailItemBoundary: plan.rawTailItemBoundary,
    transcriptRelativePath: plan.transcript.relativePath,
    beforeTokens: plan.beforeTokens,
    afterPruneTokens: plan.afterPruneTokens,
    overheadTokens: plan.overheadTokens,
    triggerTokens: plan.triggerTokens,
    targetTokens: plan.targetTokens,
    requiresCustomCompaction: plan.requiresCustomCompaction,
    preservedToolCallIds: plan.preservedToolCallIds,
    assistantSummaryKeys: plan.assistantSummaryKeys,
    assistantSummaries: plan.assistantSummaries,
    prefixSummary: plan.prefixSummary,
    stages: plan.stages,
    createdAt: Date.now()
  };
}

// ../core/src/transcript.ts
function formatTranscript(turns, codec) {
  const lines = ["# Better Compact Raw Transcript", ""];
  for (const turn of turns) {
    lines.push(`## ${turn.role.toUpperCase()} ${turn.key}`);
    lines.push(`created: ${turn.stamp}`);
    lines.push("");
    for (const item of turn.items) {
      lines.push(codec.transcriptLine(item));
    }
    lines.push("");
  }
  return lines.join("\n").trimEnd() + "\n";
}
async function writeTranscript(plan, deps) {
  const turns = plan.transcript.turns ?? [];
  const content = plan.transcript.content || (deps.codec.transcriptDocument ? deps.codec.transcriptDocument(turns) : formatTranscript(turns, deps.codec));
  const { absolutePath } = await deps.transcripts.write(plan.transcript.relativePath, content);
  plan.transcript.content = content;
  plan.transcript.turns = void 0;
  plan.transcript.absolutePath = absolutePath;
  deps.logger.info("Wrote Better Compact transcript reference", {
    path: absolutePath,
    messages: plan.transcript.messageIds.length
  });
}

// ../core/src/summarize.ts
var DEFAULT_CONCURRENCY = 4;
var MIN_SUMMARY_CHARS = 80;
var MAX_SUMMARY_CHARS = 4e3;
var FAILURE_THRESHOLD = 3;
var BREAKER_WINDOW_MS = 5 * 6e4;
var SUMMARY_SECTION_HEADERS = [
  "## Decisions",
  "## Files & Symbols",
  "## Errors (verbatim)",
  "## What failed and why",
  "## Constraints",
  "## Next step"
];
function createSummaryScheduler(logger, options = {}) {
  const now = options.now ?? Date.now;
  const failures = /* @__PURE__ */ new Map();
  return {
    async summarize(input) {
      if (input.jobs.length === 0) return {};
      const startedAt = now();
      expireFailures(failures, startedAt);
      const state = failures.get(input.sessionKey);
      if (state?.openUntil && state.openUntil > startedAt) {
        logger.debug("Summary circuit breaker is open; using deterministic fallback", {
          sessionKey: input.sessionKey,
          retryAfterMs: state.openUntil - startedAt
        });
        return {};
      }
      const summaries = {};
      const pending = dedupeJobs(input.jobs);
      const concurrency = Math.max(
        1,
        Math.min(input.concurrency ?? DEFAULT_CONCURRENCY, pending.length)
      );
      let done = 0;
      let succeeded = 0;
      let failed = 0;
      for (let offset = 0; offset < pending.length; offset += concurrency) {
        const jobs = pending.slice(offset, offset + concurrency);
        const outcomes = await Promise.all(
          jobs.map((job) => runJob(input.sessionKey, job, input.summarizer, logger))
        );
        for (let index = 0; index < jobs.length; index++) {
          const job = jobs[index];
          const summary = outcomes[index];
          if (summary) {
            summaries[job.key] = summary;
            succeeded++;
          } else {
            failed++;
          }
          done++;
          await input.onProgress?.({
            total: pending.length,
            done,
            succeeded,
            failed,
            ok: !!summary,
            rangeStartMessageId: job.rangeStartMessageId,
            rangeEndMessageId: job.rangeEndMessageId
          });
        }
        updateFailureState(
          failures,
          input.sessionKey,
          outcomes.map(Boolean),
          now(),
          logger
        );
        if (failures.get(input.sessionKey)?.openUntil) break;
      }
      return summaries;
    },
    reset(sessionKey) {
      failures.delete(sessionKey);
    }
  };
}
async function runJob(sessionKey, job, summarizer, logger) {
  try {
    const raw = await summarizer.complete(job);
    return raw === null ? null : validateSummary(raw, job, logger);
  } catch (error) {
    logger.warn("Summary job failed", {
      sessionKey,
      rangeStartMessageId: job.rangeStartMessageId,
      rangeEndMessageId: job.rangeEndMessageId,
      error: error instanceof Error ? error.message : String(error)
    });
    return null;
  }
}
function expireFailures(failures, now) {
  for (const [sessionKey, state] of failures) {
    const expiresAt = state.openUntil ?? state.lastFailureAt + BREAKER_WINDOW_MS;
    if (expiresAt <= now) failures.delete(sessionKey);
  }
}
function updateFailureState(failures, sessionKey, outcomes, now, logger) {
  let state = failures.get(sessionKey);
  for (const succeeded of outcomes) {
    if (succeeded) {
      failures.delete(sessionKey);
      state = void 0;
      continue;
    }
    state = state ?? { consecutiveFailures: 0, lastFailureAt: now };
    state.consecutiveFailures++;
    state.lastFailureAt = now;
    if (state.consecutiveFailures === FAILURE_THRESHOLD) {
      state.openUntil = now + BREAKER_WINDOW_MS;
      logger.warn("Summary circuit breaker opened", {
        sessionKey,
        consecutiveFailures: state.consecutiveFailures,
        retryAfterMs: BREAKER_WINDOW_MS
      });
    }
    failures.set(sessionKey, state);
  }
}
function formatAssistantSummaryPrompt(turns, transcriptRelativePath, codec) {
  const first = turns[0]?.key ?? "unknown";
  const last = turns.at(-1)?.key ?? first;
  return [
    "Summarize this historical assistant turn for future context replay.",
    ...summarySchemaInstructions(),
    "Do not include raw tool JSON, command output dumps, or filler narration.",
    "Do not rewrite or invent user intent. User messages stay raw elsewhere.",
    `Keep the completed summary within ${MAX_SUMMARY_CHARS} characters.`,
    `Raw transcript reference: ${transcriptRelativePath}`,
    `Range: ${first} through ${last}`,
    "",
    formatSummarySections(
      SUMMARY_SECTION_HEADERS.map(() => ["(fill from transcript or use (none))"])
    ),
    "",
    "Source transcript:",
    "",
    formatTranscript(turns, codec)
  ].join("\n");
}
function formatPrefixSummaryPrompt(previousSummary, deltaTurns, transcriptRelativePath, codec) {
  const first = deltaTurns[0]?.key ?? "unknown";
  const last = deltaTurns.at(-1)?.key ?? first;
  return [
    "Roll this prior prefix summary forward for future context replay.",
    ...summarySchemaInstructions(),
    "Keep every still-valid fact from the prior checkpoint and incorporate only the newly compacted delta.",
    "Do not include raw tool JSON, command output dumps, or filler narration.",
    `Keep the completed summary within ${MAX_SUMMARY_CHARS} characters.`,
    `Raw transcript reference: ${transcriptRelativePath}`,
    `New delta range: ${first} through ${last}`,
    "",
    formatSummarySections(
      SUMMARY_SECTION_HEADERS.map(() => ["(merge prior checkpoint with delta, or use (none))"])
    ),
    "",
    "Prior prefix summary:",
    "",
    previousSummary,
    "",
    "Newly compacted delta transcript:",
    "",
    formatTranscript(deltaTurns, codec)
  ].join("\n");
}
function formatSummarySections(sections) {
  return SUMMARY_SECTION_HEADERS.flatMap((header, index) => {
    const items = sections[index] ?? [];
    return [header, ...items.length > 0 ? items.map((item) => `- ${item}`) : ["- (none)"], ""];
  }).slice(0, -1).join("\n");
}
function summarySchemaInstructions() {
  return [
    "Return only the fixed Markdown schema below, with itemized entries under every heading.",
    "Use '- (none)' when the transcript contains no evidence for a section.",
    "Preserve exact paths, symbols, error strings, and IDs verbatim, including tool/call, message, session, and request IDs.",
    "Preserve concrete conclusions, decisions, failures, constraints, and next-step state without inventing facts."
  ];
}
function dedupeJobs(jobs) {
  const seen = /* @__PURE__ */ new Set();
  return jobs.filter((job) => {
    if (seen.has(job.key)) return false;
    seen.add(job.key);
    return true;
  });
}
function validateSummary(text, job, logger) {
  const summary = text.trim();
  const lines = summary.split(/\r\n|\n|\r/).map((line) => line.trim());
  let headerIndex = -1;
  const headerIndexes = SUMMARY_SECTION_HEADERS.map((header) => {
    headerIndex = lines.indexOf(header, headerIndex + 1);
    return headerIndex;
  });
  const hasRequiredSections = headerIndexes.every((index) => index >= 0);
  if (summary.length < MIN_SUMMARY_CHARS || !hasRequiredSections) {
    logger.warn("Discarded invalid Better Compact scratch summary", {
      rangeStartMessageId: job.rangeStartMessageId,
      rangeEndMessageId: job.rangeEndMessageId,
      length: summary.length,
      hasRequiredSections
    });
    return null;
  }
  return summary.length <= MAX_SUMMARY_CHARS ? summary : truncateSummarySections(lines, headerIndexes);
}
function truncateSummarySections(lines, headerIndexes) {
  const bodies = headerIndexes.map((headerIndex, index) => {
    const nextHeaderIndex = headerIndexes[index + 1] ?? lines.length;
    return lines.slice(headerIndex + 1, nextHeaderIndex).join("\n").trim();
  });
  const render = () => SUMMARY_SECTION_HEADERS.map(
    (header, index) => bodies[index] ? `${header}
${bodies[index]}` : header
  ).join("\n\n");
  let summary = render();
  while (summary.length > MAX_SUMMARY_CHARS) {
    let longestBodyIndex = 0;
    for (let index = 1; index < bodies.length; index++) {
      if (bodies[index].length > bodies[longestBodyIndex].length) {
        longestBodyIndex = index;
      }
    }
    const overflow = summary.length - MAX_SUMMARY_CHARS;
    const retainedLength = Math.max(0, bodies[longestBodyIndex].length - overflow);
    let body = bodies[longestBodyIndex].slice(0, retainedLength).trimEnd();
    const lineBoundary = body.lastIndexOf("\n");
    if (lineBoundary >= 0) body = body.slice(0, lineBoundary).trimEnd();
    bodies[longestBodyIndex] = body;
    summary = render();
  }
  return summary;
}

// ../core/src/stages.ts
var ASSISTANT_TEXT_PREVIEW_CHARS = 1200;
var skillsStage = {
  name: "skills",
  label: "Pruned loaded skills",
  always: true,
  run: (working, ctx) => stubToolItems(working, ctx, (item) => ctx.conventions.isSkillItem?.(item) ?? false)
};
var supersedeReadsStage = {
  name: "supersede-reads",
  label: "Superseded repeated tool reads",
  always: true,
  run: (working, ctx) => supersedeToolReads(working, ctx)
};
var purgeErrorInputsStage = {
  name: "purge-error-inputs",
  label: "Purged stale failed tool inputs",
  always: true,
  run: (working, ctx) => purgeErrorInputs(working, ctx)
};
var toolsOldStage = {
  name: "tools-old",
  label: "Pruned old tool calls/results",
  always: true,
  run: (working, ctx) => stripToolItems(working, ctx, ctx.preservedToolCallIds)
};
var reasoningStage = {
  name: "reasoning",
  label: "Pruned thinking tokens",
  run: (working, ctx) => stripAssistantItems(working, ctx.rawTailStartIndex, (item) => item.kind === "reasoning")
};
var toolsRemainingStage = {
  name: "tools-remaining",
  label: "Pruned remaining tool calls/results",
  run: (working, ctx) => stripToolItems(working, ctx, /* @__PURE__ */ new Set())
};
var assistantRunsStage = {
  name: "assistant-runs",
  label: "Summarized assistant turns",
  run: (working, ctx) => compactAssistantRuns(working, ctx)
};
function findRawTailStartIndex(turns, minTurns, minUserTurns) {
  let userTurns = 0;
  for (let index = turns.length - 1; index >= 0; index--) {
    if (turns[index].role !== "user" || turns[index].ephemeral) continue;
    userTurns++;
    if (userTurns >= minUserTurns) return index;
  }
  return Math.max(0, turns.length - Math.min(minTurns, turns.length));
}
function findRecentToolCallTail(turns, budgetTokens, codec, conventions) {
  const preserved = /* @__PURE__ */ new Set();
  if (budgetTokens <= 0) return preserved;
  let used = 0;
  for (let turnIndex = turns.length - 1; turnIndex >= 0; turnIndex--) {
    const turn = turns[turnIndex];
    if (turn.role !== "assistant") continue;
    for (let itemIndex = turn.items.length - 1; itemIndex >= 0; itemIndex--) {
      const item = turn.items[itemIndex];
      if (item.kind !== "tool") continue;
      if (conventions.isSkillItem?.(item)) continue;
      if (!item.callId || preserved.has(item.callId)) continue;
      const cost = Math.max(1, Math.round(codec.estimateItem(item)));
      if (used >= budgetTokens) return preserved;
      if (preserved.size > 0 && used + cost > budgetTokens) return preserved;
      preserved.add(item.callId);
      used += cost;
    }
  }
  return preserved;
}
function findLatestTodoCallId(turns, conventions) {
  const todo = conventions.todo;
  if (!todo) return null;
  for (let turnIndex = turns.length - 1; turnIndex >= 0; turnIndex--) {
    const turn = turns[turnIndex];
    for (let itemIndex = turn.items.length - 1; itemIndex >= 0; itemIndex--) {
      const item = turn.items[itemIndex];
      if (item.kind === "tool" && todo.isTodoItem(item)) return item.callId;
    }
  }
  return null;
}
function transformCompactedPrefix(turns, ctx) {
  const result = [];
  let assistantGroup = [];
  const flushAssistantGroup = () => {
    if (assistantGroup.length === 0) return;
    if (!ctx.assistantSummaryKeys.has(assistantRunKey(assistantGroup))) {
      result.push(...assistantGroup);
    } else {
      result.push(collapseAssistantRun(assistantGroup, ctx));
    }
    assistantGroup = [];
  };
  for (const turn of turns) {
    if (turn.role === "user") {
      flushAssistantGroup();
      result.push(turn);
      continue;
    }
    assistantGroup.push(turn);
  }
  flushAssistantGroup();
  return result;
}
function turnText(turn) {
  return turn.items.filter(
    (item) => item.kind === "text" || item.kind === "synthetic"
  ).map((item) => item.text).filter(Boolean).join("\n\n");
}
function formatPrefixSummary(turns) {
  const userMessages = turns.filter((turn) => turn.role === "user" && !turn.ephemeral).flatMap(
    (turn) => turn.items.filter(
      (item) => item.kind === "text" || item.kind === "synthetic"
    ).map((item) => item.text.trim())
  ).filter(Boolean);
  const assistantFacts = turns.filter((turn) => turn.role === "assistant").map((turn) => turnText(turn).trim()).filter(Boolean);
  return formatSummarySections([
    [],
    [],
    [],
    [],
    userMessages.map(formatSummaryItem),
    assistantFacts.map(
      (text) => `Resume from prior assistant progress: ${formatSummaryItem(text)}`
    )
  ]);
}
function formatSummaryItem(text) {
  return truncate(oneLine(text).trim(), 600).replace("\n[...omitted]", " [...omitted]");
}
function stripAssistantItems(working, rawTailStartIndex, matches) {
  const changedTurns = /* @__PURE__ */ new Set();
  let changedItems = 0;
  for (let index = 0; index < rawTailStartIndex; index++) {
    const turn = working[index];
    if (!turn || turn.role !== "assistant") continue;
    const before = turn.items.length;
    turn.items = turn.items.filter((item) => !matches(item));
    const removed = before - turn.items.length;
    if (removed > 0) {
      changedTurns.add(turn.key);
      changedItems += removed;
    }
  }
  return { changedTurns, changedItems };
}
function stubToolItems(working, ctx, matches, outcome) {
  const changedTurns = /* @__PURE__ */ new Set();
  let changedItems = 0;
  for (let index = 0; index < ctx.rawTailStartIndex; index++) {
    const turn = working[index];
    if (!turn || turn.role !== "assistant") continue;
    let changed = false;
    turn.items = turn.items.map((item) => {
      if (item.kind !== "tool" || !matches(item)) return item;
      changed = true;
      changedItems++;
      return toolStub(item, ctx.conventions, outcome?.(item));
    });
    if (changed) changedTurns.add(turn.key);
  }
  return { changedTurns, changedItems };
}
function supersedeToolReads(working, ctx) {
  const newestByTarget = /* @__PURE__ */ new Map();
  for (let turnIndex = ctx.rawTailStartIndex - 1; turnIndex >= 0; turnIndex--) {
    const turn = working[turnIndex];
    if (!turn || turn.role !== "assistant") continue;
    for (let itemIndex = turn.items.length - 1; itemIndex >= 0; itemIndex--) {
      const item = turn.items[itemIndex];
      if (item.kind !== "tool") continue;
      const details = ctx.conventions.tool?.(item);
      const target = primaryToolTarget(details?.input);
      if (!details || !target) continue;
      const name = oneLine(details.name).trim();
      const identity = JSON.stringify([name, target.normalized]);
      if (!newestByTarget.has(identity)) {
        newestByTarget.set(identity, { name, target: target.normalized, itemKey: item.key });
      }
    }
  }
  return stubToolItems(
    working,
    ctx,
    (item) => {
      const details = ctx.conventions.tool?.(item);
      const target = primaryToolTarget(details?.input);
      if (!details || !target) return false;
      const name = oneLine(details.name).trim();
      const newest = newestByTarget.get(JSON.stringify([name, target.normalized]));
      return newest !== void 0 && newest.itemKey !== item.key;
    },
    (item) => {
      const details = ctx.conventions.tool?.(item);
      const target = primaryToolTarget(details?.input);
      if (!details || !target) return void 0;
      const name = oneLine(details.name).trim();
      const newest = newestByTarget.get(JSON.stringify([name, target.normalized]));
      if (!newest || newest.itemKey === item.key) return void 0;
      const error = details.error === void 0 ? "" : `; error: ${firstLine(details.error)}`;
      return `superseded by later ${newest.name} on ${newest.target}${error}`;
    }
  );
}
function purgeErrorInputs(working, ctx) {
  return stubToolItems(
    working,
    ctx,
    (item) => !ctx.preservedToolCallIds.has(item.callId) && ctx.conventions.tool?.(item).error !== void 0
  );
}
function stripToolItems(working, ctx, preserved) {
  const todo = ctx.conventions.todo;
  const latestTodoCallId = findLatestTodoCallId(
    working.slice(0, ctx.rawTailStartIndex),
    ctx.conventions
  );
  const changedTurns = /* @__PURE__ */ new Set();
  let changedItems = 0;
  for (let index = 0; index < ctx.rawTailStartIndex; index++) {
    const turn = working[index];
    if (!turn || turn.role !== "assistant") continue;
    const nextItems = [];
    let removedTools = 0;
    let latestTodoState = null;
    for (const item of turn.items) {
      if (item.kind !== "tool") {
        nextItems.push(item);
        continue;
      }
      if (preserved.has(item.callId)) {
        nextItems.push(item);
        continue;
      }
      if (todo?.isTodoItem(item) && item.callId === latestTodoCallId) {
        latestTodoState = `Latest todo state preserved: ${todo.format(item)}`;
      }
      nextItems.push(toolStub(item, ctx.conventions));
      removedTools++;
    }
    if (latestTodoState) nextItems.push(syntheticText(turn, latestTodoState));
    if (removedTools > 0) {
      turn.items = nextItems;
      changedTurns.add(turn.key);
      changedItems += removedTools;
    }
  }
  return { changedTurns, changedItems };
}
function toolStub(item, conventions, outcomeOverride) {
  const details = conventions.tool?.(item);
  const name = oneLine(details?.name || "tool");
  const target = primaryToolTarget(details?.input)?.display ?? `callId=${oneLine(item.callId)}`;
  const outcome = outcomeOverride ?? (details?.error === void 0 ? "ok" : `error: ${firstLine(details.error)}`);
  const text = `[tool:${name}] ${target} \u2014 ${outcome}`;
  return { kind: "synthetic", key: syntheticTextKey(item.key, text), text };
}
function primaryToolTarget(input) {
  const parsed = parseToolInput(input);
  if (typeof parsed === "string" || typeof parsed === "number" || typeof parsed === "boolean") {
    const display = oneLine(String(parsed)).trim();
    return display ? { display, normalized: display } : null;
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
  const record = parsed;
  const pathKeys = ["filePath", "file_path", "path", "filename", "directory", "dir"];
  const keys = [
    ...pathKeys,
    "command",
    "cmd",
    "key",
    "query",
    "pattern",
    "url",
    "uri",
    "id",
    "name"
  ];
  for (const key of keys) {
    const value = record[key];
    if (typeof value !== "string" && typeof value !== "number" && typeof value !== "boolean")
      continue;
    const display = oneLine(String(value)).trim();
    if (display) {
      const normalized = pathKeys.includes(key) ? normalizePath(display) : display;
      return { display, normalized };
    }
  }
  return null;
}
function normalizePath(value) {
  const path = value.replace(/\\/g, "/");
  const absolute = path.startsWith("/");
  const segments = [];
  for (const segment of path.split("/")) {
    if (!segment || segment === ".") continue;
    if (segment === ".." && segments.length > 0 && segments.at(-1) !== "..") {
      segments.pop();
    } else if (segment !== ".." || !absolute) {
      segments.push(segment);
    }
  }
  const normalized = `${absolute ? "/" : ""}${segments.join("/")}`;
  return normalized || (absolute ? "/" : ".");
}
function parseToolInput(input) {
  if (typeof input !== "string") return input;
  try {
    return JSON.parse(input);
  } catch {
    return input;
  }
}
function oneLine(value) {
  return value.replace(/\r\n|\n|\r/g, " ").replace(/\s+/g, " ");
}
function firstLine(value) {
  return value.split(/\r\n|\n|\r/, 1)[0];
}
function compactAssistantRuns(working, ctx) {
  const compacted = working.slice(0, ctx.rawTailStartIndex);
  if (ctx.selectRuns) {
    const selected = selectAssistantRunsToSummarize(compacted, working, ctx);
    for (const key of selected) ctx.assistantSummaryKeys.add(key);
  }
  const transformed = transformCompactedPrefix(compacted, ctx);
  const tail = working.slice(ctx.rawTailStartIndex);
  const changedTurns = /* @__PURE__ */ new Set();
  let changedItems = 0;
  for (const group of assistantGroups(compacted)) {
    if (!ctx.assistantSummaryKeys.has(group.key)) continue;
    let groupItems = 0;
    for (const turn of group.turns) {
      changedTurns.add(turn.key);
      groupItems += turn.items.length;
    }
    changedItems += Math.max(0, groupItems - 1);
  }
  working.length = 0;
  working.push(...transformed, ...tail);
  return { changedTurns, changedItems };
}
function selectAssistantRunsToSummarize(compacted, allTurns, ctx) {
  const needed = estimateTurns(allTurns, ctx.codec, ctx.estimator) + ctx.referenceTokens - ctx.targetTokens;
  if (needed <= 0) return /* @__PURE__ */ new Set();
  let selectedSavings = 0;
  const groups = assistantGroups(compacted).map((group) => {
    const before = estimateTurns(group.turns, ctx.codec, { overheadTokens: 0 });
    const summaryText = group.turns.map(turnText).filter(Boolean).join("\n\n");
    const after = Math.max(
      1,
      countTokens(truncate(summaryText, ASSISTANT_TEXT_PREVIEW_CHARS))
    );
    const savings = Math.max(0, Math.round(before - after));
    const age = compacted.length <= 1 ? 1 : 1 - group.endIndex / (compacted.length - 1);
    return {
      ...group,
      savings,
      score: savings * (1 + age)
    };
  }).filter((group) => group.savings > 0).sort((a, b) => b.score - a.score);
  const selected = /* @__PURE__ */ new Set();
  for (const group of groups) {
    selected.add(group.key);
    selectedSavings += group.savings;
    if (selectedSavings >= needed) break;
  }
  return selected;
}
function assistantGroups(turns) {
  const groups = [];
  let current = [];
  const flush = (endIndex) => {
    if (current.length === 0) return;
    groups.push({ key: assistantRunKey(current), turns: current, endIndex });
    current = [];
  };
  turns.forEach((turn, index) => {
    if (turn.role === "user") {
      flush(index - 1);
      return;
    }
    current.push(turn);
  });
  flush(turns.length - 1);
  return groups;
}
function collapseAssistantRun(group, ctx) {
  const first = group[0];
  if (!first) throw new Error("Cannot compact empty assistant turn");
  const key = assistantRunKey(group);
  const assistantText = group.map(turnText).filter(Boolean).join("\n\n");
  const existingSummary = ctx.assistantSummaries[key];
  if (!existingSummary) {
    ctx.summaryJobs.push({
      key,
      rangeStartMessageId: first.key,
      rangeEndMessageId: group.at(-1)?.key ?? first.key,
      transcriptRelativePath: ctx.transcriptRelativePath,
      prompt: formatAssistantSummaryPrompt(group, ctx.transcriptRelativePath, ctx.codec)
    });
  }
  const lines = ["[Assistant turn summary]"];
  lines.push(
    existingSummary?.trim() || truncate(assistantText.trim(), ASSISTANT_TEXT_PREVIEW_CHARS) || "Historical assistant/tool activity compactified."
  );
  let latestTodoState = null;
  for (const item of group.flatMap((turn) => turn.items)) {
    if (item.kind === "tool" && ctx.conventions.todo?.isTodoItem(item) && item.callId === ctx.latestTodoCallId) {
      latestTodoState = `Latest todo state preserved: ${ctx.conventions.todo.format(item)}`;
    }
    const note = ctx.conventions.itemNote?.(item);
    if (note) lines.push(note);
  }
  if (latestTodoState) lines.push(latestTodoState);
  lines.push(`Raw transcript: ${ctx.transcriptRelativePath}`);
  return {
    key: first.key,
    stamp: first.stamp,
    role: first.role,
    handle: first.handle,
    items: [
      {
        kind: "synthetic",
        key: `${first.key}_better_compact_compactified`,
        text: lines.join("\n")
      }
    ]
  };
}
function syntheticText(turn, text) {
  return { kind: "synthetic", key: syntheticTextKey(turn.key, text), text };
}

// ../core/src/ladder.ts
var TRIGGER_RATIO = 0.85;
var TARGET_RATIO = 0.3;
var MIN_TAIL_MESSAGES = 3;
var MIN_TAIL_USER_TURNS = 2;
var RECENT_TOOL_RESULT_BUDGET_TOKENS = 4e4;
function buildPlan(turns, inputs, spec) {
  const contextLimit = inputs.contextLimit;
  if (!contextLimit || contextLimit <= 0 || turns.length === 0) return null;
  const triggerRatio = inputs.triggerRatio ?? TRIGGER_RATIO;
  const targetRatio = inputs.targetRatio ?? TARGET_RATIO;
  const rawEstimateTokens = spec.codec.estimateTurns(turns);
  const providerReportedTokens = inputs.providerReportedTokens && inputs.providerReportedTokens > 0 ? inputs.providerReportedTokens : 0;
  const overheadTokens = providerReportedTokens > 0 ? Math.max(0, providerReportedTokens - rawEstimateTokens) : 0;
  const estimator = { overheadTokens };
  const beforeTokens = providerReportedTokens > 0 ? providerReportedTokens : rawEstimateTokens;
  const triggerTokens = Math.floor(contextLimit * triggerRatio);
  if (!inputs.force && Math.max(beforeTokens, rawEstimateTokens) < triggerTokens) return null;
  const wholeTurnTailStartIndex = findRawTailStartIndex(
    turns,
    Math.max(1, inputs.minTailMessages ?? MIN_TAIL_MESSAGES),
    Math.max(1, inputs.minTailUserTurns ?? MIN_TAIL_USER_TURNS)
  );
  const targetTokens = Math.floor(contextLimit * targetRatio);
  const selectedBoundary = selectTailBoundary(
    turns,
    wholeTurnTailStartIndex,
    triggerTokens,
    targetTokens,
    spec.codec
  );
  const prior = inputs.priorPlan;
  const priorBoundary = prior ? resolveTailBoundary(turns, prior) : null;
  const boundary = priorBoundary && compareBoundaries(selectedBoundary, priorBoundary) < 0 ? priorBoundary : selectedBoundary;
  const partition = partitionTurns(turns, boundary);
  const rawTailStartIndex = boundary.turnIndex;
  const compactedRange = partition.compactedRange;
  if (compactedRange.length === 0) return null;
  const compactedRangeHash = rangeHash(compactedRange);
  const transcriptRelativePath = inputs.citablePath(inputs.sessionKey, compactedRangeHash);
  const working = partition.turns;
  const stages = [];
  const summaryJobs = [];
  const expandedPrefix = priorBoundary !== null && compareBoundaries(boundary, priorBoundary) > 0;
  const priorPrefixSummary = prior?.prefixSummary ? stripTranscriptReference(prior.prefixSummary, prior.transcriptRelativePath) : void 0;
  const prefixSummaryResultKey = `prefix-summary:${compactedRangeHash}`;
  const prefixSummaryJobKey = expandedPrefix && priorPrefixSummary ? prefixSummaryResultKey : void 0;
  const assistantSummaries = {
    ...prior?.assistantSummaries ?? {},
    ...inputs.assistantSummaries ?? {}
  };
  const rolledPrefixSummary = assistantSummaries[prefixSummaryResultKey];
  delete assistantSummaries[prefixSummaryResultKey];
  const preservedToolCallIds = findRecentToolCallTail(
    compactedRange,
    inputs.recentToolResultBudgetTokens ?? RECENT_TOOL_RESULT_BUDGET_TOKENS,
    spec.codec,
    spec.conventions
  );
  applyPreservationFloor(
    preservedToolCallIds,
    priorBoundary ? partitionTurns(turns, priorBoundary).compactedRange : [],
    prior
  );
  const priorStages = new Set(
    (prior?.stages ?? []).filter((stage) => stage.status !== "skipped" && stage.status !== "failed").map((stage) => stage.name)
  );
  const ctx = {
    codec: spec.codec,
    conventions: spec.conventions,
    estimator,
    rawTailStartIndex: partition.rawTailStartIndex,
    transcriptRelativePath,
    preservedToolCallIds,
    latestTodoCallId: findLatestTodoCallId(compactedRange, spec.conventions),
    assistantSummaries,
    assistantSummaryKeys: new Set(prior?.assistantSummaryKeys ?? []),
    summaryJobs,
    selectRuns: true,
    targetTokens,
    referenceTokens: 0
  };
  const reference = synthesizeReferenceTurn(turns, compactedRange, ctx, compactedRangeHash);
  ctx.referenceTokens = reference ? spec.codec.estimateTurns([reference]) : 0;
  const projectedTokens = () => estimateTurns(working, spec.codec, estimator) + ctx.referenceTokens;
  for (const stage of spec.stages) {
    if (!stage.always && projectedTokens() <= targetTokens && !priorStages.has(stage.name)) {
      markTargetMet(stages);
      continue;
    }
    runStage(stages, working, estimator, spec.codec, stage, ctx);
  }
  let requiresCustomCompaction = false;
  let prefixSummary = inputs.prefixSummary ?? rolledPrefixSummary ?? (expandedPrefix ? void 0 : priorPrefixSummary);
  if (projectedTokens() >= triggerTokens || prior?.requiresCustomCompaction) {
    const newlyCompactedTurns = expandedPrefix && priorBoundary ? turnsBetweenBoundaries(turns, priorBoundary, boundary) : [];
    if (prefixSummaryJobKey && priorPrefixSummary && inputs.prefixSummary === void 0 && rolledPrefixSummary === void 0 && newlyCompactedTurns.length > 0) {
      summaryJobs.push({
        key: prefixSummaryJobKey,
        rangeStartMessageId: newlyCompactedTurns[0].key,
        rangeEndMessageId: newlyCompactedTurns.at(-1)?.key ?? newlyCompactedTurns[0].key,
        transcriptRelativePath,
        prompt: formatPrefixSummaryPrompt(
          priorPrefixSummary,
          newlyCompactedTurns,
          transcriptRelativePath,
          spec.codec
        )
      });
    }
    const currentTailStartIndex = partition.rawTailKey ? working.findIndex((turn) => turn.key === partition.rawTailKey) : working.length;
    const beforePrefix = projectedTokens();
    const result = applyPrefixSummary(
      working,
      currentTailStartIndex > 0 ? currentTailStartIndex : partition.rawTailStartIndex,
      transcriptRelativePath,
      prefixSummary,
      compactedRangeHash
    );
    const afterPrefix = estimateTurns(working, spec.codec, estimator);
    prefixSummary = result.prefixSummary;
    requiresCustomCompaction = result.changedTurns.size > 0;
    stages.push({
      name: "prefix-summary",
      label: "Last-resort prefix summary",
      beforeTokens: beforePrefix,
      afterTokens: afterPrefix,
      clearedTokens: Math.max(0, beforePrefix - afterPrefix),
      changedMessages: result.changedTurns.size,
      changedParts: result.changedItems,
      status: afterPrefix <= targetTokens ? "applied" : "failed"
    });
  }
  const plan = {
    sessionId: inputs.sessionKey,
    rangeHash: compactedRangeHash,
    contextLimit,
    beforeTokens,
    afterPruneTokens: estimateTurns(working, spec.codec, estimator),
    overheadTokens,
    triggerTokens,
    targetTokens,
    rawTailStartIndex,
    rawTailStartMessageId: turns[boundary.turnIndex]?.key ?? turns.at(-1)?.key ?? "",
    rawTailItemBoundary: recordedItemBoundary(turns, boundary),
    requiresCustomCompaction,
    preservedToolCallIds: [...ctx.preservedToolCallIds],
    transcript: {
      relativePath: transcriptRelativePath,
      content: "",
      messageIds: compactedRange.map((turn) => turn.key),
      turns: compactedRange
    },
    stages,
    summaryJobs,
    assistantSummaryKeys: [...ctx.assistantSummaryKeys],
    assistantSummaries: ctx.assistantSummaries,
    prefixSummary
  };
  plan.afterPruneTokens = estimateTurns(transformTurns(turns, rawTailStartIndex, plan, spec), spec.codec, estimator);
  return plan;
}
function transformTurns(turns, rawTailStartIndex, plan, spec) {
  const resolvedBoundary = resolveTailBoundary(turns, plan);
  if (!resolvedBoundary && plan.rawTailItemBoundary !== void 0) return turns;
  const boundary = resolvedBoundary ?? {
    turnIndex: rawTailStartIndex,
    itemIndex: 0
  };
  const partition = partitionTurns(turns, boundary);
  const originalPrefix = partition.compactedRange;
  if (plan.requiresCustomCompaction) {
    return partition.finalize([
      synthesizeSummaryTurn(
        originalPrefix,
        plan.prefixSummary || formatPrefixSummary(originalPrefix),
        plan.transcript.relativePath,
        plan.rangeHash
      ),
      ...partition.turns.slice(partition.rawTailStartIndex)
    ]);
  }
  const stageNames = new Set(plan.stages.map((stage) => stage.name));
  const working = partition.turns;
  const ctx = {
    codec: spec.codec,
    conventions: spec.conventions,
    estimator: { overheadTokens: plan.overheadTokens },
    rawTailStartIndex: partition.rawTailStartIndex,
    transcriptRelativePath: plan.transcript.relativePath,
    preservedToolCallIds: new Set(plan.preservedToolCallIds),
    latestTodoCallId: findLatestTodoCallId(originalPrefix, spec.conventions),
    assistantSummaries: plan.assistantSummaries,
    assistantSummaryKeys: new Set(plan.assistantSummaryKeys),
    summaryJobs: [],
    selectRuns: false,
    targetTokens: plan.targetTokens,
    referenceTokens: 0
  };
  for (const stage of spec.stages) {
    if (stage.name === "assistant-runs") continue;
    if (stageNames.has(stage.name)) stage.run(working, ctx);
  }
  let prefix = working.slice(0, partition.rawTailStartIndex);
  if (stageNames.has("assistant-runs")) {
    prefix = transformCompactedPrefix(prefix, ctx);
  }
  const result = [...prefix];
  const reference = synthesizeReferenceTurn(turns, originalPrefix, ctx, plan.rangeHash);
  if (reference) result.push(reference);
  result.push(...working.slice(partition.rawTailStartIndex));
  return partition.finalize(result);
}
function replayPlanSnapshot(turns, snapshot, spec, options = {}) {
  const boundary = resolveTailBoundary(turns, snapshot);
  if (!boundary || !matchesPlanSnapshot(turns, snapshot)) return null;
  const rawTailStartIndex = boundary.turnIndex;
  const overheadTokens = snapshot.overheadTokens ?? 0;
  const transformed = transformTurns(
    turns,
    rawTailStartIndex,
    {
      sessionId: snapshot.sessionId,
      rangeHash: snapshot.rangeHash,
      contextLimit: snapshot.contextLimit ?? Math.max(snapshot.beforeTokens, snapshot.targetTokens, 1),
      beforeTokens: snapshot.beforeTokens,
      afterPruneTokens: snapshot.afterPruneTokens,
      overheadTokens,
      triggerTokens: snapshot.triggerTokens,
      targetTokens: snapshot.targetTokens,
      rawTailStartIndex,
      rawTailStartMessageId: snapshot.rawTailStartMessageId,
      rawTailItemBoundary: snapshot.rawTailItemBoundary,
      requiresCustomCompaction: snapshot.requiresCustomCompaction,
      preservedToolCallIds: snapshot.preservedToolCallIds ?? [],
      assistantSummaryKeys: snapshot.assistantSummaryKeys ?? Object.keys(snapshot.assistantSummaries ?? {}),
      transcript: {
        relativePath: snapshot.transcriptRelativePath,
        content: "",
        messageIds: []
      },
      stages: snapshot.stages ?? [],
      summaryJobs: [],
      assistantSummaries: snapshot.assistantSummaries ?? {},
      prefixSummary: snapshot.prefixSummary
    },
    spec
  );
  if (!options.allowRegrown && spec.codec.estimateTurns(transformed) + overheadTokens >= snapshot.triggerTokens) {
    return null;
  }
  return transformed;
}
function matchesPlanSnapshot(turns, snapshot) {
  const boundary = resolveTailBoundary(turns, snapshot);
  if (!boundary) return false;
  const compactedRange = partitionTurns(turns, boundary).compactedRange;
  if (compactedRange.length === 0) return false;
  return rangeHash(compactedRange) === snapshot.rangeHash;
}
function createEngine(spec, ports) {
  return {
    async process({
      sessionKey,
      turns,
      contextLimit,
      triggerRatio,
      targetRatio,
      recentToolResultBudgetTokens,
      providerReportedTokens,
      force,
      summarize
    }) {
      let staleSnapshotCleared = false;
      let priorPlan;
      const cached = await ports.plans.load(sessionKey);
      if (cached && cached.sessionId === sessionKey) {
        const replayed = force ? null : replayPlanSnapshot(turns, cached, spec);
        if (replayed) return { outcome: "replayed", turns: replayed };
        staleSnapshotCleared = true;
        priorPlan = cached;
      }
      const inputs = {
        contextLimit,
        triggerRatio,
        targetRatio,
        recentToolResultBudgetTokens,
        providerReportedTokens,
        force,
        priorPlan,
        sessionKey,
        citablePath: ports.transcripts.citablePath
      };
      let plan = buildPlan(turns, inputs, spec);
      if (!plan) {
        if (staleSnapshotCleared) await ports.plans.save(sessionKey, null);
        return { outcome: "unchanged" };
      }
      if (summarize && plan.summaryJobs.length > 0) {
        try {
          const assistantSummaries = await summarize(plan.summaryJobs);
          if (Object.keys(assistantSummaries).length > 0) {
            plan = buildPlan(
              turns,
              {
                ...inputs,
                priorPlan: toPlanSnapshot(plan),
                assistantSummaries
              },
              spec
            ) ?? plan;
          }
        } catch (error) {
          ports.logger.warn("Summary scheduling failed; using deterministic fallback", {
            sessionId: sessionKey,
            error: error instanceof Error ? error.message : String(error)
          });
        }
      }
      await writeTranscript(plan, { transcripts: ports.transcripts, logger: ports.logger, codec: spec.codec });
      const transformed = transformTurns(turns, plan.rawTailStartIndex, plan, spec);
      await ports.plans.save(sessionKey, toPlanSnapshot(plan));
      ports.logger.info("Applied Better Compact staged pruning", {
        sessionId: plan.sessionId,
        beforeTokens: plan.beforeTokens,
        afterPruneTokens: plan.afterPruneTokens,
        transcript: plan.transcript.relativePath,
        stages: plan.stages.map((stage) => stage.name)
      });
      return { outcome: "planned", turns: transformed, plan };
    }
  };
}
function selectTailBoundary(turns, wholeTurnStartIndex, triggerTokens, targetTokens, codec) {
  let selected = { turnIndex: wholeTurnStartIndex, itemIndex: 0 };
  for (let turnIndex = wholeTurnStartIndex; turnIndex < turns.length; turnIndex++) {
    const turn = turns[turnIndex];
    if (turn.items.length === 0 || codec.estimateTurns([turn]) <= triggerTokens) continue;
    const itemIndex = rawSuffixItemIndex(turn, targetTokens, codec);
    if (itemIndex > 0) selected = { turnIndex, itemIndex };
  }
  return selected;
}
function rawSuffixItemIndex(turn, targetTokens, codec) {
  let firstRawIndex = turn.items.length;
  for (let index = turn.items.length - 1; index >= 0; index--) {
    const candidate = { ...turn, items: turn.items.slice(index) };
    if (codec.estimateTurns([candidate]) <= targetTokens) {
      firstRawIndex = index;
      continue;
    }
    if (firstRawIndex < turn.items.length) break;
    if (turn.items[index].kind === "tool") return turn.items.length;
    return index > 0 ? index : 0;
  }
  return firstRawIndex > 0 ? firstRawIndex : 0;
}
function resolveTailBoundary(turns, recorded) {
  const turnIndex = turns.findIndex((turn2) => turn2.key === recorded.rawTailStartMessageId);
  if (turnIndex < 0) return null;
  const itemBoundary = recorded.rawTailItemBoundary;
  if (itemBoundary === void 0) {
    return turnIndex > 0 ? { turnIndex, itemIndex: 0 } : null;
  }
  const turn = turns[turnIndex];
  const itemIndex = turn.items.findIndex((item) => item.key === itemBoundary.itemKey);
  if (itemIndex < 0) return null;
  const boundaryIndex = itemBoundary.side === "after" ? itemIndex + 1 : itemIndex;
  return boundaryIndex > 0 ? { turnIndex, itemIndex: boundaryIndex } : null;
}
function recordedItemBoundary(turns, boundary) {
  if (boundary.itemIndex === 0) return void 0;
  const turn = turns[boundary.turnIndex];
  const firstRawItem = turn.items[boundary.itemIndex];
  if (firstRawItem) return { itemKey: firstRawItem.key, side: "before" };
  const lastCompactedItem = turn.items[boundary.itemIndex - 1];
  return lastCompactedItem ? { itemKey: lastCompactedItem.key, side: "after" } : void 0;
}
function partitionTurns(turns, boundary) {
  const source = turns[boundary.turnIndex];
  if (!source || boundary.itemIndex === 0) {
    const cloned = cloneTurns(turns);
    return {
      turns: cloned,
      compactedRange: cloneTurns(turns.slice(0, boundary.turnIndex)),
      rawTailStartIndex: boundary.turnIndex,
      rawTailKey: cloned[boundary.turnIndex]?.key,
      finalize: (transformed) => transformed
    };
  }
  const compactedItems = source.items.slice(0, boundary.itemIndex);
  const rawItems = source.items.slice(boundary.itemIndex);
  const fragmentKey = JSON.stringify(compactedItems.map((item) => item.key));
  const compactedFragment = {
    ...source,
    items: compactedItems,
    fragmentKey
  };
  const before = cloneTurns(turns.slice(0, boundary.turnIndex));
  const after = cloneTurns(turns.slice(boundary.turnIndex + 1));
  if (rawItems.length === 0) {
    const partitioned2 = [...before, compactedFragment, ...after];
    const rawTailStartIndex2 = before.length + 1;
    return {
      turns: partitioned2,
      compactedRange: cloneTurns(partitioned2.slice(0, rawTailStartIndex2)),
      rawTailStartIndex: rawTailStartIndex2,
      rawTailKey: after[0]?.key,
      finalize: (transformed) => transformed
    };
  }
  const rawTailKey = `${source.key}:better-compact-raw:${rawItems[0].key}`;
  const rawFragment = { ...source, key: rawTailKey, items: rawItems };
  const partitioned = [...before, compactedFragment, rawFragment, ...after];
  const rawTailStartIndex = before.length + 1;
  return {
    turns: partitioned,
    compactedRange: cloneTurns(partitioned.slice(0, rawTailStartIndex)),
    rawTailStartIndex,
    rawTailKey,
    finalize(transformed) {
      const rawIndex = transformed.findIndex((turn) => turn.key === rawTailKey);
      if (rawIndex < 0) return cloneTurns(turns);
      const compactedIndex = transformed.findIndex(
        (turn, index) => index < rawIndex && turn.key === source.key
      );
      const compactedItems2 = compactedIndex >= 0 ? transformed[compactedIndex].items : [];
      const result = transformed.filter((_turn, index) => index !== compactedIndex);
      const adjustedRawIndex = compactedIndex >= 0 ? rawIndex - 1 : rawIndex;
      result[adjustedRawIndex] = {
        ...source,
        items: [...compactedItems2, ...transformed[rawIndex].items]
      };
      return result;
    }
  };
}
function compareBoundaries(left, right) {
  return left.turnIndex === right.turnIndex ? left.itemIndex - right.itemIndex : left.turnIndex - right.turnIndex;
}
function turnsBetweenBoundaries(turns, start, end) {
  if (compareBoundaries(end, start) <= 0) return [];
  const delta = [];
  for (let turnIndex = start.turnIndex; turnIndex <= end.turnIndex; turnIndex++) {
    const turn = turns[turnIndex];
    const startItem = turnIndex === start.turnIndex ? start.itemIndex : 0;
    const endItem = turnIndex === end.turnIndex ? end.itemIndex : turn.items.length;
    if (endItem <= startItem) continue;
    delta.push({
      ...turn,
      items: turn.items.slice(startItem, endItem),
      fragmentKey: JSON.stringify(
        turn.items.slice(startItem, endItem).map((item) => item.key)
      )
    });
  }
  return delta;
}
function runStage(stages, working, estimator, codec, stage, ctx) {
  const beforeTokens = estimateTurns(working, codec, estimator);
  const result = stage.run(working, ctx);
  const afterTokens = estimateTurns(working, codec, estimator);
  stages.push({
    name: stage.name,
    label: stage.label,
    beforeTokens,
    afterTokens,
    clearedTokens: Math.max(0, beforeTokens - afterTokens),
    changedMessages: result.changedTurns.size,
    changedParts: result.changedItems,
    status: result.changedTurns.size > 0 || result.changedItems > 0 ? "applied" : "skipped"
  });
}
function applyPreservationFloor(preservedToolCallIds, priorCompactedRange, prior) {
  if (!prior || priorCompactedRange.length === 0) return;
  const previouslyPreserved = new Set(prior.preservedToolCallIds ?? []);
  for (const turn of priorCompactedRange) {
    for (const item of turn.items) {
      if (item.kind === "tool" && item.callId && preservedToolCallIds.has(item.callId) && !previouslyPreserved.has(item.callId)) {
        preservedToolCallIds.delete(item.callId);
      }
    }
  }
}
function markTargetMet(stages) {
  const last = stages.at(-1);
  if (!last || last.status === "target-met") return;
  last.status = "target-met";
}
function applyPrefixSummary(working, rawTailStartIndex, transcriptRelativePath, prefixSummary, compactedRangeHash) {
  if (rawTailStartIndex <= 0) {
    return { changedTurns: /* @__PURE__ */ new Set(), changedItems: 0, prefixSummary: prefixSummary ?? "" };
  }
  const compacted = working.slice(0, rawTailStartIndex);
  const summary = stripTranscriptReference(
    prefixSummary?.trim() || formatPrefixSummary(compacted),
    transcriptRelativePath
  );
  const summaryTurn = synthesizeSummaryTurn(
    compacted,
    summary,
    transcriptRelativePath,
    compactedRangeHash
  );
  const changedTurns = new Set(compacted.map((turn) => turn.key));
  const changedItems = compacted.reduce((sum, turn) => sum + turn.items.length, 0);
  const tail = working.slice(rawTailStartIndex);
  working.length = 0;
  working.push(summaryTurn, ...tail);
  return { changedTurns, changedItems, prefixSummary: summary };
}
function synthesizeReferenceTurn(turns, compacted, ctx, compactedRangeHash = rangeHash(compacted)) {
  if (!turns.some((turn) => turn.role === "user")) return null;
  const hash = compactedRangeHash;
  const first = compacted[0]?.key ?? "unknown";
  const last = compacted.at(-1)?.key ?? "unknown";
  const key = `better_compact_context_${hash}`;
  const runIndex = assistantGroups(compacted).map((group) => formatReferenceRun(group.turns, ctx));
  const latestTodoState = formatLatestTodoState(compacted, ctx);
  return {
    key,
    stamp: 0,
    role: "user",
    items: [
      {
        kind: "synthetic",
        key,
        text: [
          "[Better Compact context pruning applied]",
          `Older assistant/tool-heavy context was compactified for this request. Raw messages ${first} through ${last} are preserved in the reference transcript below.`,
          "",
          "## Compacted Assistant Runs",
          ...runIndex.length > 0 ? runIndex : ["- (none)"],
          "",
          "## Reference Files",
          `- "${ctx.transcriptRelativePath}"`,
          "",
          "If exact prior wording, raw tool output, or omitted implementation detail is needed, inspect the reference file instead of guessing.",
          ...latestTodoState ? ["", latestTodoState] : []
        ].join("\n")
      }
    ]
  };
}
function formatReferenceRun(group, ctx) {
  const first = group[0]?.key ?? "unknown";
  const last = group.at(-1)?.key ?? first;
  const idRange = first === last ? first : `${first} through ${last}`;
  const touched = /* @__PURE__ */ new Set();
  for (const item of group.flatMap((turn) => turn.items)) {
    if (item.kind === "tool") {
      const details = ctx.conventions.tool?.(item);
      const name = referencePhrase(details?.name || "tool", 80);
      const target = primaryToolTarget(details?.input)?.normalized;
      touched.add(target ? `${name} ${referencePhrase(target, 160)}` : name);
    }
    const note = ctx.conventions.itemNote?.(item);
    if (note) touched.add(referencePhrase(note, 240));
  }
  const topicItem = group.flatMap((turn) => turn.items).find((item) => (item.kind === "text" || item.kind === "synthetic") && item.text.trim());
  const topic = topicItem && (topicItem.kind === "text" || topicItem.kind === "synthetic") ? referenceTopic(topicItem.text) : "(no assistant text)";
  const touchedText = formatTouchedReferences([...touched]);
  return `- ${idRange} \u2014 ${touchedText} \u2014 ${topic}`;
}
function formatLatestTodoState(compacted, ctx) {
  if (!ctx.latestTodoCallId || !ctx.conventions.todo) return null;
  for (const item of compacted.flatMap((turn) => turn.items)) {
    if (item.kind === "tool" && item.callId === ctx.latestTodoCallId && ctx.conventions.todo.isTodoItem(item)) {
      return `Latest todo state preserved: ${oneLineReference(ctx.conventions.todo.format(item))}`;
    }
  }
  return null;
}
function referenceTopic(value) {
  const firstLine2 = value.split(/\r\n|\n|\r/).map((line) => line.trim()).find(Boolean);
  if (!firstLine2) return "(no assistant text)";
  const firstSentence = firstLine2.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? firstLine2;
  return referencePhrase(firstSentence, 160);
}
function formatTouchedReferences(values) {
  if (values.length === 0) return "(no files/tools)";
  const selected = [];
  let length = 0;
  for (const value of values) {
    const separatorLength = selected.length > 0 ? 2 : 0;
    if (selected.length > 0 && length + separatorLength + value.length > 240) {
      selected.push("\u2026");
      break;
    }
    const entry = referencePhrase(value, 240);
    selected.push(entry);
    length += separatorLength + entry.length;
  }
  return selected.join(", ");
}
function referencePhrase(value, maxChars) {
  const normalized = oneLineReference(value);
  if (normalized.length <= maxChars) return normalized;
  const prefix = normalized.slice(0, Math.max(0, maxChars - 1));
  const wordBoundary = prefix.lastIndexOf(" ");
  return `${(wordBoundary > maxChars / 2 ? prefix.slice(0, wordBoundary) : prefix).trimEnd()}\u2026`;
}
function oneLineReference(value) {
  return value.replace(/\s+/g, " ").trim();
}
function synthesizeSummaryTurn(compacted, summary, transcriptRelativePath, compactedRangeHash = rangeHash(compacted)) {
  const key = `better_compact_summary_${compactedRangeHash}`;
  const referenceBlock = `## Reference Files
- "${transcriptRelativePath}"`;
  const normalizedSummary = stripTranscriptReference(summary, transcriptRelativePath);
  return {
    key,
    stamp: 0,
    role: "user",
    items: [
      {
        kind: "synthetic",
        key,
        text: [
          "[Context Summary]",
          normalizedSummary,
          "",
          referenceBlock
        ].join("\n")
      }
    ]
  };
}
function stripTranscriptReference(summary, transcriptRelativePath) {
  const trimmed = summary.trim();
  const referenceBlock = `## Reference Files
- "${transcriptRelativePath}"`;
  return trimmed.endsWith(referenceBlock) ? trimmed.slice(0, -referenceBlock.length).trimEnd() : trimmed;
}
function cloneTurns(turns) {
  return turns.map((turn) => ({ ...turn, items: [...turn.items] }));
}

// ../core/src/profiles.ts
var COMPACTION_PRESETS = {
  light: {
    preset: "light",
    triggerPercent: 85,
    targetPercent: 35,
    recentToolTokens: 4e4,
    summarizerConcurrency: 4
  },
  moderate: {
    preset: "moderate",
    triggerPercent: 75,
    targetPercent: 25,
    recentToolTokens: 3e4,
    summarizerConcurrency: 6
  },
  max: {
    preset: "max",
    triggerPercent: 60,
    targetPercent: 15,
    recentToolTokens: 12e3,
    summarizerConcurrency: 8
  }
};
var DEFAULT_CUSTOM_COMPACTION = {
  triggerPercent: 85,
  targetPercent: 35,
  recentToolTokens: 4e4,
  summarizerConcurrency: 4
};
function normalizeCompactionCustom(input) {
  return {
    triggerPercent: clampPercent(
      input?.triggerPercent,
      DEFAULT_CUSTOM_COMPACTION.triggerPercent
    ),
    targetPercent: clampPercent(input?.targetPercent, DEFAULT_CUSTOM_COMPACTION.targetPercent),
    recentToolTokens: clampInteger(
      input?.recentToolTokens,
      0,
      2e5,
      DEFAULT_CUSTOM_COMPACTION.recentToolTokens
    ),
    summarizerConcurrency: clampInteger(
      input?.summarizerConcurrency,
      1,
      16,
      DEFAULT_CUSTOM_COMPACTION.summarizerConcurrency
    )
  };
}
function resolveCompactionProfile(config, override) {
  const preset = normalizePreset(override?.preset ?? config.compaction.preset);
  const custom = normalizeCompactionCustom({
    ...config.compaction.custom,
    ...override?.custom ?? {}
  });
  if (preset === "custom") return { preset, ...custom };
  return COMPACTION_PRESETS[preset];
}
function normalizePreset(value) {
  return value === "light" || value === "moderate" || value === "max" || value === "custom" ? value : "light";
}
function normalizeSummaryEffort(value) {
  return value === "low" || value === "medium" || value === "high" || value === "max" ? value : "inherit";
}
function clampPercent(value, fallback) {
  return clampInteger(value, 1, 99, fallback);
}
function clampInteger(value, min, max, fallback) {
  const numeric = typeof value === "number" && Number.isFinite(value) ? Math.round(value) : fallback;
  return Math.max(min, Math.min(max, numeric));
}

// lib/private-storage.ts
import * as fs from "fs/promises";
import { constants } from "fs";
import { dirname, isAbsolute, join, relative, resolve, sep } from "path";
import { randomUUID } from "crypto";
function supportsDirectorySync(platform = process.platform) {
  return platform !== "win32";
}
async function ensurePrivateDirectory(path, root) {
  if (root) await assertNoSymlinkPath(root, path);
  try {
    const existing = await fs.lstat(path);
    if (existing.isSymbolicLink()) {
      throw new Error(`Refusing symlinked Better Compact directory: ${path}`);
    }
  } catch (error) {
    if (!(error instanceof Error && "code" in error && error.code === "ENOENT")) {
      throw error;
    }
  }
  await fs.mkdir(path, { recursive: true, mode: 448 });
  await fs.chmod(path, 448);
}
async function writePrivateFile(path, content, root) {
  const directory = dirname(path);
  await ensurePrivateDirectory(directory, root);
  const temporary = join(directory, `.${randomUUID()}.tmp`);
  let handle;
  try {
    handle = await fs.open(
      temporary,
      constants.O_CREAT | constants.O_EXCL | constants.O_WRONLY | constants.O_NOFOLLOW,
      384
    );
    await handle.writeFile(content, { encoding: "utf8" });
    await handle.sync();
    await handle.close();
    handle = void 0;
    if (root) await assertNoSymlinkPath(root, directory);
    await fs.rename(temporary, path);
    await fs.chmod(path, 384);
    if (supportsDirectorySync()) {
      const directoryHandle = await fs.open(directory, "r");
      try {
        await directoryHandle.sync();
      } finally {
        await directoryHandle.close();
      }
    }
  } catch (error) {
    await handle?.close().catch(() => {
    });
    await fs.rm(temporary, { force: true }).catch(() => {
    });
    throw error;
  }
}
async function securePrivateFile(path) {
  await fs.chmod(path, 384);
}
async function securePrivateTree(path) {
  let stat;
  try {
    stat = await fs.lstat(path);
  } catch {
    return;
  }
  if (stat.isSymbolicLink()) {
    throw new Error(`Refusing symlinked Better Compact path: ${path}`);
  }
  if (!stat.isDirectory()) {
    await fs.chmod(path, 384);
    return;
  }
  await fs.chmod(path, 448);
  const entries = await fs.readdir(path);
  await Promise.all(entries.map((entry) => securePrivateTree(join(path, entry))));
}
async function assertNoSymlinkPath(root, target) {
  const rootPath = resolve(root);
  const targetPath = resolve(target);
  const targetRelative = relative(rootPath, targetPath);
  if (targetRelative === ".." || targetRelative.startsWith(`..${sep}`) || isAbsolute(targetRelative)) {
    throw new Error(`Better Compact path escapes its root: ${target}`);
  }
  let current = rootPath;
  for (const component of targetRelative.split(sep).filter(Boolean)) {
    current = join(current, component);
    try {
      const stat = await fs.lstat(current);
      if (stat.isSymbolicLink()) {
        throw new Error(`Refusing symlinked Better Compact path: ${current}`);
      }
    } catch (error) {
      if (error instanceof Error && "code" in error && error.code === "ENOENT") {
        continue;
      }
      throw error;
    }
  }
}

// lib/config.ts
var VALID_CONFIG_KEYS = /* @__PURE__ */ new Set([
  "$schema",
  "enabled",
  "autoUpdate",
  "debug",
  "experimental",
  "experimental.allowSubAgents",
  "commands",
  "commands.enabled",
  "compaction",
  "compaction.automatic",
  "compaction.preset",
  "compaction.summaryEffort",
  "compaction.custom",
  "compaction.custom.triggerPercent",
  "compaction.custom.targetPercent",
  "compaction.custom.recentToolTokens",
  "compaction.custom.summarizerConcurrency",
  "compress",
  "compress.permission"
]);
function getConfigKeyPaths(obj, prefix = "") {
  const keys = [];
  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    keys.push(fullKey);
    if (obj[key] && typeof obj[key] === "object" && !Array.isArray(obj[key])) {
      keys.push(...getConfigKeyPaths(obj[key], fullKey));
    }
  }
  return keys;
}
function getInvalidConfigKeys(userConfig) {
  const userKeys = getConfigKeyPaths(userConfig);
  return userKeys.filter((key) => !VALID_CONFIG_KEYS.has(key));
}
function validateConfigTypes(config) {
  const errors = [];
  if (config.enabled !== void 0 && typeof config.enabled !== "boolean") {
    errors.push({ key: "enabled", expected: "boolean", actual: typeof config.enabled });
  }
  if (config.autoUpdate !== void 0 && typeof config.autoUpdate !== "boolean") {
    errors.push({ key: "autoUpdate", expected: "boolean", actual: typeof config.autoUpdate });
  }
  if (config.debug !== void 0 && typeof config.debug !== "boolean") {
    errors.push({ key: "debug", expected: "boolean", actual: typeof config.debug });
  }
  const experimental = config.experimental;
  if (experimental !== void 0) {
    if (typeof experimental !== "object" || experimental === null || Array.isArray(experimental)) {
      errors.push({ key: "experimental", expected: "object", actual: typeof experimental });
    } else if (experimental.allowSubAgents !== void 0 && typeof experimental.allowSubAgents !== "boolean") {
      errors.push({
        key: "experimental.allowSubAgents",
        expected: "boolean",
        actual: typeof experimental.allowSubAgents
      });
    }
  }
  const commands = config.commands;
  if (commands !== void 0) {
    if (typeof commands !== "object" || commands === null || Array.isArray(commands)) {
      errors.push({ key: "commands", expected: "object", actual: typeof commands });
    } else if (commands.enabled !== void 0 && typeof commands.enabled !== "boolean") {
      errors.push({
        key: "commands.enabled",
        expected: "boolean",
        actual: typeof commands.enabled
      });
    }
  }
  const compaction = config.compaction;
  if (compaction !== void 0) {
    if (typeof compaction !== "object" || compaction === null || Array.isArray(compaction)) {
      errors.push({ key: "compaction", expected: "object", actual: typeof compaction });
    } else {
      if (compaction.automatic !== void 0 && typeof compaction.automatic !== "boolean") {
        errors.push({
          key: "compaction.automatic",
          expected: "boolean",
          actual: typeof compaction.automatic
        });
      }
      if (compaction.preset !== void 0 && compaction.preset !== "light" && compaction.preset !== "moderate" && compaction.preset !== "max" && compaction.preset !== "custom") {
        errors.push({
          key: "compaction.preset",
          expected: '"light" | "moderate" | "max" | "custom"',
          actual: JSON.stringify(compaction.preset)
        });
      }
      if (compaction.summaryEffort !== void 0 && !["inherit", "low", "medium", "high", "max"].includes(compaction.summaryEffort)) {
        errors.push({
          key: "compaction.summaryEffort",
          expected: '"inherit" | "low" | "medium" | "high" | "max"',
          actual: JSON.stringify(compaction.summaryEffort)
        });
      }
      const custom = compaction.custom;
      if (custom !== void 0) {
        if (typeof custom !== "object" || custom === null || Array.isArray(custom)) {
          errors.push({ key: "compaction.custom", expected: "object", actual: typeof custom });
        } else {
          for (const key of ["triggerPercent", "targetPercent", "recentToolTokens", "summarizerConcurrency"]) {
            const value = custom[key];
            if (value !== void 0 && typeof value !== "number") {
              errors.push({ key: `compaction.custom.${key}`, expected: "number", actual: typeof value });
            }
          }
        }
      }
    }
  }
  const compress = config.compress;
  if (compress !== void 0) {
    if (typeof compress !== "object" || compress === null || Array.isArray(compress)) {
      errors.push({ key: "compress", expected: "object", actual: typeof compress });
    } else {
      const validValues = ["ask", "allow", "deny"];
      if (compress.permission !== void 0 && !validValues.includes(compress.permission)) {
        errors.push({
          key: "compress.permission",
          expected: '"ask" | "allow" | "deny"',
          actual: JSON.stringify(compress.permission)
        });
      }
    }
  }
  return errors;
}
function showConfigWarnings(ctx, configPath, configData, isProject) {
  const invalidKeys = getInvalidConfigKeys(configData);
  const typeErrors = validateConfigTypes(configData);
  if (invalidKeys.length === 0 && typeErrors.length === 0) {
    return;
  }
  const configType = isProject ? "project config" : "config";
  const messages = [];
  if (invalidKeys.length > 0) {
    const keyList = invalidKeys.slice(0, 3).join(", ");
    const suffix = invalidKeys.length > 3 ? ` (+${invalidKeys.length - 3} more)` : "";
    messages.push(`Unknown keys: ${keyList}${suffix}`);
  }
  if (typeErrors.length > 0) {
    for (const err of typeErrors.slice(0, 2)) {
      messages.push(`${err.key}: expected ${err.expected}, got ${err.actual}`);
    }
    if (typeErrors.length > 2) {
      messages.push(`(+${typeErrors.length - 2} more type errors)`);
    }
  }
  setTimeout(() => {
    try {
      ctx.client.tui.showToast({
        body: {
          title: `Better Compact: ${configType} warning`,
          message: `${configPath}
${messages.join("\n")}`,
          variant: "warning",
          duration: 7e3
        }
      });
    } catch {
    }
  }, 7e3);
}
var defaultConfig = {
  enabled: true,
  autoUpdate: false,
  debug: false,
  commands: {
    enabled: true
  },
  compaction: {
    automatic: true,
    preset: "light",
    summaryEffort: "inherit",
    custom: { ...DEFAULT_CUSTOM_COMPACTION }
  },
  experimental: {
    allowSubAgents: false
  },
  compress: {
    permission: "allow"
  }
};
var GLOBAL_CONFIG_DIR = process.env.XDG_CONFIG_HOME ? join2(process.env.XDG_CONFIG_HOME, "opencode") : join2(homedir(), ".config", "opencode");
var GLOBAL_CONFIG_PATH_JSONC = join2(GLOBAL_CONFIG_DIR, "better-compact.jsonc");
var GLOBAL_CONFIG_PATH_JSON = join2(GLOBAL_CONFIG_DIR, "better-compact.json");
var SCHEMA_URL = "https://raw.githubusercontent.com/AshishKumar4/better-compact/master/packages/opencode/better-compact.schema.json";
function findOpencodeDir(startDir) {
  let current = startDir;
  while (current !== "/") {
    const candidate = join2(current, ".opencode");
    if (existsSync(candidate) && statSync(candidate).isDirectory()) {
      return candidate;
    }
    const parent = dirname2(current);
    if (parent === current) {
      break;
    }
    current = parent;
  }
  return null;
}
function getConfigPaths(ctx) {
  const global = existsSync(GLOBAL_CONFIG_PATH_JSONC) ? GLOBAL_CONFIG_PATH_JSONC : existsSync(GLOBAL_CONFIG_PATH_JSON) ? GLOBAL_CONFIG_PATH_JSON : null;
  let configDir = null;
  const opencodeConfigDir = process.env.OPENCODE_CONFIG_DIR;
  if (opencodeConfigDir) {
    const configJsonc = join2(opencodeConfigDir, "better-compact.jsonc");
    const configJson = join2(opencodeConfigDir, "better-compact.json");
    configDir = existsSync(configJsonc) ? configJsonc : existsSync(configJson) ? configJson : null;
  }
  let project = null;
  if (ctx?.directory) {
    const opencodeDir = findOpencodeDir(ctx.directory);
    if (opencodeDir) {
      const projectJsonc = join2(opencodeDir, "better-compact.jsonc");
      const projectJson = join2(opencodeDir, "better-compact.json");
      project = existsSync(projectJsonc) ? projectJsonc : existsSync(projectJson) ? projectJson : null;
    }
  }
  return { global, configDir, project };
}
function createDefaultConfig() {
  if (!existsSync(GLOBAL_CONFIG_DIR)) {
    mkdirSync(GLOBAL_CONFIG_DIR, { recursive: true });
  }
  const configContent = `{
  "$schema": "${SCHEMA_URL}"
}
`;
  writeFileSync(GLOBAL_CONFIG_PATH_JSONC, configContent, "utf-8");
}
function loadConfigFile(configPath) {
  let fileContent = "";
  try {
    fileContent = readFileSync(configPath, "utf-8");
  } catch (error) {
    return {
      data: null,
      parseError: error instanceof Error ? error.message : "Failed to read config"
    };
  }
  try {
    const errors = [];
    const parsed = parse2(fileContent, errors, { allowTrailingComma: true });
    if (errors.length > 0) {
      return {
        data: null,
        parseError: `JSONC parse error at offset ${errors[0].offset}`
      };
    }
    if (parsed === void 0 || parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
      return { data: null, parseError: "Config root must be an object" };
    }
    return { data: parsed };
  } catch (error) {
    return { data: null, parseError: error.message || "Failed to parse config" };
  }
}
function mergeCompress(base, override) {
  if (!override) {
    return base;
  }
  return {
    permission: override.permission ?? base.permission
  };
}
function mergeCommands(base, override) {
  if (!override) {
    return base;
  }
  return {
    enabled: override.enabled ?? base.enabled
  };
}
function mergeCompaction(base, override) {
  if (!override) return base;
  return {
    automatic: override.automatic ?? base.automatic,
    preset: normalizePreset(override.preset ?? base.preset),
    summaryEffort: normalizeSummaryEffort(override.summaryEffort ?? base.summaryEffort),
    custom: normalizeCompactionCustom({
      ...base.custom,
      ...override.custom ?? {}
    })
  };
}
function mergeExperimental(base, override) {
  if (override === void 0) return base;
  return {
    allowSubAgents: override.allowSubAgents ?? base.allowSubAgents
  };
}
function deepCloneConfig(config) {
  return {
    ...config,
    commands: { enabled: config.commands.enabled },
    compaction: {
      automatic: config.compaction.automatic,
      preset: config.compaction.preset,
      summaryEffort: config.compaction.summaryEffort,
      custom: { ...config.compaction.custom }
    },
    experimental: { ...config.experimental },
    compress: { ...config.compress }
  };
}
function mergeLayer(config, data) {
  return {
    enabled: data.enabled ?? config.enabled,
    autoUpdate: data.autoUpdate ?? config.autoUpdate,
    debug: data.debug ?? config.debug,
    commands: mergeCommands(config.commands, data.commands),
    compaction: mergeCompaction(config.compaction, data.compaction),
    experimental: mergeExperimental(config.experimental, data.experimental),
    compress: mergeCompress(config.compress, data.compress)
  };
}
function scheduleParseWarning(ctx, title, message) {
  setTimeout(() => {
    try {
      ctx.client.tui.showToast({
        body: {
          title,
          message,
          variant: "warning",
          duration: 7e3
        }
      });
    } catch {
    }
  }, 7e3);
}
function getConfig(ctx, options) {
  let config = deepCloneConfig(defaultConfig);
  let unsafeLayer = false;
  const configPaths = getConfigPaths(ctx);
  if (!configPaths.global) {
    createDefaultConfig();
  }
  const layers = [
    { path: configPaths.global, name: "config", isProject: false },
    { path: configPaths.configDir, name: "configDir config", isProject: true },
    { path: configPaths.project, name: "project config", isProject: true }
  ];
  for (const layer of layers) {
    if (!layer.path) {
      continue;
    }
    const result = loadConfigFile(layer.path);
    if (result.parseError) {
      unsafeLayer = true;
      if (options?.warnings === false) continue;
      scheduleParseWarning(
        ctx,
        `Better Compact: Invalid ${layer.name}`,
        `${layer.path}
${result.parseError}
Using previous/default values`
      );
      continue;
    }
    if (!result.data) {
      continue;
    }
    const invalidKeys = getInvalidConfigKeys(result.data);
    const typeErrors = validateConfigTypes(result.data);
    if (invalidKeys.length > 0 || typeErrors.length > 0) {
      if (options?.warnings !== false) {
        showConfigWarnings(ctx, layer.path, result.data, layer.isProject);
      }
    }
    if (typeErrors.length > 0) {
      unsafeLayer = true;
      continue;
    }
    config = mergeLayer(config, result.data);
  }
  if (unsafeLayer) {
    config.enabled = false;
    config.commands.enabled = false;
    config.compaction.automatic = false;
    config.compress.permission = "deny";
    config.autoUpdate = false;
  }
  return config;
}

// lib/host-permissions.ts
var findLastMatchingRule = (rules, predicate) => {
  for (let index = rules.length - 1; index >= 0; index -= 1) {
    const rule = rules[index];
    if (rule && predicate(rule)) {
      return rule;
    }
  }
  return void 0;
};
var wildcardMatch = (value, pattern) => {
  const normalizedValue = value.replaceAll("\\", "/");
  let escaped = pattern.replaceAll("\\", "/").replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\?/g, ".");
  if (escaped.endsWith(" .*")) {
    escaped = escaped.slice(0, -3) + "( .*)?";
  }
  const flags = process.platform === "win32" ? "si" : "s";
  return new RegExp(`^${escaped}$`, flags).test(normalizedValue);
};
var getPermissionRules = (permissionConfigs) => {
  const rules = [];
  for (const permissionConfig of permissionConfigs) {
    if (!permissionConfig) {
      continue;
    }
    for (const [permission, value] of Object.entries(permissionConfig)) {
      if (value === "ask" || value === "allow" || value === "deny") {
        rules.push({ permission, pattern: "*", action: value });
        continue;
      }
      for (const [pattern, action] of Object.entries(value)) {
        if (action === "ask" || action === "allow" || action === "deny") {
          rules.push({ permission, pattern, action });
        }
      }
    }
  }
  return rules;
};
var compressDisabledByOpencode = (...permissionConfigs) => {
  const match = findLastMatchingRule(
    getPermissionRules(permissionConfigs),
    (rule) => wildcardMatch("compress", rule.permission)
  );
  return match?.pattern === "*" && match.action === "deny";
};
var resolveEffectiveCompressPermission = (basePermission, hostPermissions, agentName) => {
  if (basePermission === "deny") {
    return "deny";
  }
  return compressDisabledByOpencode(
    hostPermissions.global,
    agentName ? hostPermissions.agents[agentName] : void 0
  ) ? "deny" : basePermission;
};

// lib/logger.ts
import { chmod as chmod2, writeFile } from "fs/promises";
import { join as join3 } from "path";
import { homedir as homedir2 } from "os";
var Logger = class {
  logDir;
  enabled;
  constructor(enabled) {
    this.enabled = enabled;
    const configHome = process.env.XDG_CONFIG_HOME || join3(homedir2(), ".config");
    this.logDir = join3(configHome, "opencode", "logs", "better-compact");
  }
  async ensureLogDir() {
    await ensurePrivateDirectory(this.logDir);
  }
  formatData(data) {
    if (!data) return "";
    const parts = [];
    for (const [key, value] of Object.entries(data)) {
      if (value === void 0 || value === null) continue;
      if (Array.isArray(value)) {
        if (value.length === 0) continue;
        parts.push(
          `${key}=[${value.slice(0, 3).join(",")}${value.length > 3 ? `...+${value.length - 3}` : ""}]`
        );
      } else if (typeof value === "object") {
        const str = JSON.stringify(value);
        if (str.length < 50) {
          parts.push(`${key}=${str}`);
        }
      } else {
        parts.push(`${key}=${value}`);
      }
    }
    return parts.join(" ");
  }
  getCallerFile(skipFrames = 3) {
    const originalPrepareStackTrace = Error.prepareStackTrace;
    try {
      const err = new Error();
      Error.prepareStackTrace = (_, stack2) => stack2;
      const stack = err.stack;
      Error.prepareStackTrace = originalPrepareStackTrace;
      for (let i = skipFrames; i < stack.length; i++) {
        const filename = stack[i]?.getFileName();
        if (filename && !filename.includes("/logger.")) {
          const match = filename.match(/([^/\\]+)\.[tj]s$/);
          return match ? match[1] : filename;
        }
      }
      return "unknown";
    } catch {
      return "unknown";
    }
  }
  async write(level, component, message, data) {
    if (!this.enabled) return;
    try {
      await this.ensureLogDir();
      const timestamp = (/* @__PURE__ */ new Date()).toISOString();
      const dataStr = this.formatData(data);
      const logLine = `${timestamp} ${level.padEnd(5)} ${component}: ${message}${dataStr ? " | " + dataStr : ""}
`;
      const dailyLogDir = join3(this.logDir, "daily");
      await ensurePrivateDirectory(dailyLogDir);
      const logFile = join3(dailyLogDir, `${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.log`);
      await writeFile(logFile, logLine, { flag: "a", mode: 384 });
      await chmod2(logFile, 384);
    } catch (error) {
    }
  }
  info(message, data) {
    const component = this.getCallerFile(2);
    return this.write("INFO", component, message, data);
  }
  debug(message, data) {
    const component = this.getCallerFile(2);
    return this.write("DEBUG", component, message, data);
  }
  warn(message, data) {
    const component = this.getCallerFile(2);
    return this.write("WARN", component, message, data);
  }
  error(message, data) {
    const component = this.getCallerFile(2);
    return this.write("ERROR", component, message, data);
  }
  /**
   * Strips unnecessary metadata from messages for cleaner debug logs.
   *
   * Removed:
   * - All IDs (id, sessionID, messageID, parentID)
   * - summary, path, cost, model, agent, mode, finish, providerID, modelID
   * - step-start and step-finish parts entirely
   * - snapshot fields
   * - ignored text parts
   *
   * Kept:
   * - role, time (created only), tokens (input, output, reasoning, cache)
   * - text, reasoning, tool parts with content
   * - tool calls with: tool, callID, input, output, metadata
   */
  minimizeForDebug(messages) {
    return messages.map((msg) => {
      const minimized = {
        role: msg.info?.role
      };
      if (msg.info?.time?.created) {
        minimized.time = msg.info.time.created;
      }
      if (msg.info?.tokens) {
        minimized.tokens = {
          input: msg.info.tokens.input,
          output: msg.info.tokens.output,
          reasoning: msg.info.tokens.reasoning,
          cache: msg.info.tokens.cache
        };
      }
      if (msg.parts) {
        minimized.parts = msg.parts.map((part) => {
          if (part.type === "step-start" || part.type === "step-finish") {
            return null;
          }
          if (part.type === "text") {
            if (part.ignored) return null;
            const textPart = { type: "text", text: part.text };
            if (part.metadata) textPart.metadata = part.metadata;
            return textPart;
          }
          if (part.type === "reasoning") {
            const reasoningPart = { type: "reasoning", text: part.text };
            if (part.metadata) reasoningPart.metadata = part.metadata;
            return reasoningPart;
          }
          if (part.type === "tool") {
            const toolPart = {
              type: "tool",
              tool: part.tool,
              callID: part.callID
            };
            if (part.state?.status) {
              toolPart.status = part.state.status;
            }
            if (part.state?.input) {
              toolPart.input = part.state.input;
            }
            if (part.state?.output) {
              toolPart.output = part.state.output;
            }
            if (part.state?.error) {
              toolPart.error = part.state.error;
            }
            if (part.metadata) {
              toolPart.metadata = part.metadata;
            }
            if (part.state?.metadata) {
              toolPart.metadata = {
                ...toolPart.metadata || {},
                ...part.state.metadata
              };
            }
            if (part.state?.title) {
              toolPart.title = part.state.title;
            }
            return toolPart;
          }
          return null;
        }).filter(Boolean);
      }
      return minimized;
    });
  }
  async saveContext(sessionId, messages) {
    if (!this.enabled) return;
    try {
      if (!/^[a-zA-Z0-9._-]{1,160}$/.test(sessionId)) {
        throw new Error(`Invalid Better Compact session ID: ${sessionId}`);
      }
      const contextDir = join3(this.logDir, "context", sessionId);
      await ensurePrivateDirectory(contextDir, this.logDir);
      const minimized = this.minimizeForDebug(messages).filter(
        (msg) => msg.parts && msg.parts.length > 0
      );
      const timestamp = (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-");
      const contextFile = join3(contextDir, `${timestamp}.json`);
      await writePrivateFile(
        contextFile,
        JSON.stringify(minimized, null, 2),
        this.logDir
      );
    } catch (error) {
    }
  }
};

// lib/state/persistence.ts
import * as fs2 from "fs/promises";
import { existsSync as existsSync2 } from "fs";
import { homedir as homedir3 } from "os";
import { join as join4 } from "path";
var STORAGE_DIR = join4(
  process.env.XDG_DATA_HOME || join4(homedir3(), ".local", "share"),
  "opencode",
  "storage",
  "plugin",
  "better-compact"
);
async function ensureStorageDir() {
  await ensurePrivateDirectory(STORAGE_DIR);
}
async function secureSessionStorage() {
  await securePrivateTree(STORAGE_DIR);
}
var stateWrites = /* @__PURE__ */ new Map();
var boundaryPlanIndex;
function getSessionFilePath(sessionId) {
  if (!/^[a-zA-Z0-9._-]{1,160}$/.test(sessionId)) {
    throw new Error(`Invalid Better Compact session ID: ${sessionId}`);
  }
  return join4(STORAGE_DIR, `${sessionId}.json`);
}
async function writePersistedSessionState(sessionId, state, logger) {
  const filePath = getSessionFilePath(sessionId);
  const content = JSON.stringify(state, null, 2);
  const previous = stateWrites.get(sessionId) ?? Promise.resolve();
  const current = previous.catch(() => {
  }).then(() => writePrivateFile(filePath, content, STORAGE_DIR));
  stateWrites.set(sessionId, current);
  try {
    await current;
    boundaryPlanIndex = void 0;
  } finally {
    if (stateWrites.get(sessionId) === current) stateWrites.delete(sessionId);
  }
  logger.info("Saved session state to disk", { sessionId });
}
async function saveSessionState(sessionState, logger, sessionName) {
  if (!sessionState.sessionId) {
    return;
  }
  const state = {
    sessionName,
    boundary: {
      activePlan: sessionState.boundary.activePlan,
      job: sessionState.boundary.job
    },
    lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
  };
  try {
    await writePersistedSessionState(sessionState.sessionId, state, logger);
  } catch (error) {
    logger.error("Failed to save session state", {
      sessionId: sessionState.sessionId,
      error: error?.message
    });
    throw error;
  }
}
async function loadSessionState(sessionId, logger) {
  try {
    await ensureStorageDir();
    const filePath = getSessionFilePath(sessionId);
    if (!existsSync2(filePath)) {
      return null;
    }
    const content = await fs2.readFile(filePath, "utf-8");
    await securePrivateFile(filePath);
    const state = JSON.parse(content);
    if (!state || typeof state !== "object") {
      logger.warn("Invalid session state file, ignoring", { sessionId });
      return null;
    }
    logger.info("Loaded session state from disk", { sessionId });
    return state;
  } catch (error) {
    logger.warn("Failed to load session state", {
      sessionId,
      error: error?.message
    });
    return null;
  }
}
async function loadPersistedBoundaryPlans(logger) {
  if (!existsSync2(STORAGE_DIR)) return [];
  boundaryPlanIndex ??= (async () => {
    const files = (await fs2.readdir(STORAGE_DIR)).filter((file) => file.endsWith(".json")).sort();
    const states = await Promise.all(files.map((file) => loadSessionState(file.slice(0, -5), logger)));
    return states.map((state) => state?.boundary?.activePlan).filter((plan) => !!plan).sort((left, right) => right.createdAt - left.createdAt);
  })();
  return boundaryPlanIndex;
}

// lib/messages/shape.ts
function isMessageWithInfo(message) {
  if (!message || typeof message !== "object") {
    return false;
  }
  const info = message.info;
  const parts = message.parts;
  if (!info || typeof info !== "object") {
    return false;
  }
  return typeof info.id === "string" && info.id.length > 0 && typeof info.sessionID === "string" && info.sessionID.length > 0 && (info.role === "user" || info.role === "assistant") && info.time && typeof info.time === "object" && typeof info.time.created === "number" && Array.isArray(parts);
}
function filterMessages(messages) {
  if (!Array.isArray(messages)) {
    return [];
  }
  return messages.filter(isMessageWithInfo);
}
function filterMessagesInPlace(messages) {
  if (!Array.isArray(messages)) {
    return [];
  }
  let writeIndex = 0;
  for (const message of messages) {
    if (isMessageWithInfo(message)) {
      messages[writeIndex++] = message;
    }
  }
  messages.length = writeIndex;
  return messages;
}

// lib/state/utils.ts
var isMessageCompacted = (state, msg) => {
  if (!isMessageWithInfo(msg)) {
    return false;
  }
  return msg.info.time.created < state.lastCompaction;
};
async function isSubAgentSession(client, sessionID) {
  try {
    const result = await client.session.get({ path: { id: sessionID } });
    return !!result.data?.parentID;
  } catch (error) {
    return false;
  }
}
function findLastCompactionTimestamp(messages) {
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (!isMessageWithInfo(msg)) {
      continue;
    }
    if (msg.info.role === "assistant" && msg.info.summary === true) {
      return msg.info.time.created;
    }
  }
  return 0;
}
function countTurns(state, messages) {
  let turnCount = 0;
  for (const msg of messages) {
    if (!isMessageWithInfo(msg)) {
      continue;
    }
    if (isMessageCompacted(state, msg)) {
      continue;
    }
    const parts = Array.isArray(msg.parts) ? msg.parts : [];
    for (const part of parts) {
      if (part.type === "step-start") {
        turnCount++;
      }
    }
  }
  return turnCount;
}
function resetOnCompaction(state) {
  state.boundary = {
    job: null,
    activePlan: null
  };
}

// lib/state/state.ts
async function refreshSessionState(state, messages, logger) {
  const lastCompactionTimestamp = findLastCompactionTimestamp(messages);
  if (lastCompactionTimestamp > state.lastCompaction) {
    state.lastCompaction = lastCompactionTimestamp;
    resetOnCompaction(state);
    logger.info("Detected compaction - reset stale state", {
      timestamp: lastCompactionTimestamp
    });
    saveSessionState(state, logger).catch((error) => {
      logger.warn("Failed to persist state reset after compaction", {
        error: error instanceof Error ? error.message : String(error)
      });
    });
  }
  state.currentTurn = countTurns(state, messages);
}
function createSessionState(sessionId = null) {
  return {
    sessionId,
    isSubAgent: false,
    compressPermission: void 0,
    boundary: {
      job: null,
      activePlan: null
    },
    lastCompaction: 0,
    currentTurn: 0,
    modelContextLimit: void 0
  };
}
async function initializeSessionState(client, state, sessionId, logger, messages) {
  if (state.sessionId !== null && state.sessionId !== sessionId) {
    throw new Error(`Session state ${state.sessionId} cannot be initialized as ${sessionId}`);
  }
  state.sessionId = sessionId;
  const isSubAgent = await isSubAgentSession(client, sessionId);
  state.isSubAgent = isSubAgent;
  state.lastCompaction = findLastCompactionTimestamp(messages);
  state.currentTurn = countTurns(state, messages);
  const persisted = await loadSessionState(sessionId, logger);
  if (persisted === null) {
    return;
  }
  state.boundary.activePlan = persisted.boundary?.activePlan ?? null;
  state.boundary.job = persisted.boundary?.job ?? null;
}

// lib/state/runtime.ts
function createRuntimeState(client, logger) {
  const sessions = /* @__PURE__ */ new Map();
  const modelLimits = /* @__PURE__ */ new Map();
  const modelLimitRequests = /* @__PURE__ */ new Map();
  const scratchSessions = /* @__PURE__ */ new Set();
  const summaryScheduler = createSummaryScheduler(logger);
  const entry = (sessionId) => {
    const existing = sessions.get(sessionId);
    if (existing) return existing;
    const created = {
      state: createSessionState(sessionId),
      initialized: false
    };
    sessions.set(sessionId, created);
    return created;
  };
  return {
    summaryScheduler,
    get(sessionId) {
      return entry(sessionId).state;
    },
    peek(sessionId) {
      return sessions.get(sessionId)?.state;
    },
    async prepare(sessionId, messages) {
      const current = entry(sessionId);
      if (!current.initialized) {
        if (!current.initialization) {
          const initialization = initializeSessionState(
            client,
            current.state,
            sessionId,
            logger,
            messages
          ).then(() => {
            current.initialized = true;
          });
          current.initialization = initialization;
          void initialization.catch(() => {
            if (current.initialization === initialization) {
              current.initialization = void 0;
            }
          });
        }
        await current.initialization;
      } else {
        await refreshSessionState(
          current.state,
          messages,
          logger
        );
      }
      return current.state;
    },
    evict(sessionId) {
      sessions.delete(sessionId);
      summaryScheduler.reset(sessionId);
    },
    setModelLimit(providerId, modelId, limit) {
      if (Number.isFinite(limit) && limit > 0) {
        modelLimits.set(`${providerId}/${modelId}`, limit);
      }
    },
    getModelLimit(providerId, modelId) {
      return modelLimits.get(`${providerId}/${modelId}`);
    },
    async resolveModelLimit(providerId, modelId) {
      const key = `${providerId}/${modelId}`;
      const cached = modelLimits.get(key);
      if (cached) return cached;
      const existing = modelLimitRequests.get(key);
      if (existing) return existing;
      const request = (async () => {
        try {
          const response = await client.provider.list();
          const payload = response?.data ?? response;
          const providers = Array.isArray(payload) ? payload : Array.isArray(payload?.all) ? payload.all : Array.isArray(payload?.providers) ? payload.providers : [];
          const provider = providers.find((item) => item?.id === providerId);
          const model = provider?.models?.[modelId];
          const limit = model?.limit?.context;
          if (typeof limit === "number" && Number.isFinite(limit) && limit > 0) {
            modelLimits.set(key, limit);
            return limit;
          }
        } catch (error) {
          logger.warn("Failed to resolve model context limit", {
            providerId,
            modelId,
            error: error instanceof Error ? error.message : String(error)
          });
        }
        return void 0;
      })().finally(() => {
        if (modelLimitRequests.get(key) === request) modelLimitRequests.delete(key);
      });
      modelLimitRequests.set(key, request);
      return request;
    },
    trackScratch(sessionId) {
      scratchSessions.add(sessionId);
      return () => scratchSessions.delete(sessionId);
    },
    isScratch(sessionId) {
      return scratchSessions.has(sessionId);
    },
    startCompaction(sessionId, operation) {
      const current = entry(sessionId);
      if (current.compaction) return false;
      const tracked = Promise.resolve().then(operation).finally(() => {
        if (current.compaction === tracked) current.compaction = void 0;
      });
      current.compaction = tracked;
      return true;
    },
    activeCompaction(sessionId) {
      return sessions.get(sessionId)?.compaction;
    }
  };
}

// lib/messages/utils.ts
var LEGACY_PAIRED_TAG_REGEX = /<dcp[^>]*>[\s\S]*?<\/dcp[^>]*>/gi;
var LEGACY_UNPAIRED_TAG_REGEX = /<\/?dcp[^>]*>/gi;
var stripHallucinationsFromString = (text) => {
  return text.replace(LEGACY_PAIRED_TAG_REGEX, "").replace(LEGACY_UNPAIRED_TAG_REGEX, "");
};
var stripHallucinations = (messages) => {
  for (const message of messages) {
    for (const part of message.parts) {
      if (part.type === "text" && typeof part.text === "string") {
        part.text = stripHallucinationsFromString(part.text);
      }
      if (part.type === "tool" && part.state?.status === "completed" && typeof part.state.output === "string") {
        part.state.output = stripHallucinationsFromString(part.state.output);
      }
    }
  }
};

// lib/boundary/context.ts
import { existsSync as existsSync3 } from "fs";
import { join as join6 } from "path";

// lib/messages/query.ts
var getLastUserMessage = (messages, startIndex) => {
  const start = startIndex ?? messages.length - 1;
  for (let i = start; i >= 0; i--) {
    const msg = messages[i];
    if (!isMessageWithInfo(msg)) {
      continue;
    }
    if (msg.info.role === "user" && !isIgnoredUserMessage(msg)) {
      return msg;
    }
  }
  return null;
};
var isIgnoredUserMessage = (message) => {
  if (!isMessageWithInfo(message)) {
    return false;
  }
  if (message.info.role !== "user") {
    return false;
  }
  const parts = Array.isArray(message.parts) ? message.parts : [];
  if (parts.length === 0) {
    return true;
  }
  for (const part of parts) {
    if (!part.ignored) {
      return false;
    }
  }
  return true;
};

// lib/token-utils.ts
function getCurrentTokenUsage(state, messages) {
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (msg.info.role !== "assistant") {
      continue;
    }
    const assistantInfo = msg.info;
    if ((assistantInfo.tokens?.output || 0) <= 0) {
      continue;
    }
    if (state.lastCompaction > 0 && (msg.info.time.created < state.lastCompaction || msg.info.summary === true && msg.info.time.created === state.lastCompaction)) {
      return 0;
    }
    const total = assistantInfo.tokens?.total;
    if (typeof total === "number" && Number.isFinite(total) && total > 0) {
      return total;
    }
    const input = assistantInfo.tokens?.input || 0;
    const output = assistantInfo.tokens?.output || 0;
    const reasoning = assistantInfo.tokens?.reasoning || 0;
    const cacheRead = assistantInfo.tokens?.cache?.read || 0;
    const cacheWrite = assistantInfo.tokens?.cache?.write || 0;
    return input + output + reasoning + cacheRead + cacheWrite;
  }
  return 0;
}
function getCurrentParams(state, messages, logger) {
  const userMsg = getLastUserMessage(messages);
  if (!userMsg) {
    logger.debug("No user message found when determining current params");
    return {
      providerId: void 0,
      modelId: void 0,
      agent: void 0,
      variant: void 0
    };
  }
  const userInfo = userMsg.info;
  const agent = userInfo.agent;
  const providerId = userInfo.model.providerID;
  const modelId = userInfo.model.modelID;
  const variant = userInfo.model.variant;
  return { providerId, modelId, agent, variant };
}
var estimateOpenCodeTokens = countTokens;
var COMPACTED_TOOL_OUTPUT_PLACEHOLDER = "[Old tool result content cleared]";

// lib/context-estimate.ts
function estimateOpenCodeMessages(messages) {
  const modelLike = messages.map(toOpenCodeModelLikeMessage).filter((message) => message.parts.length > 0);
  return estimateOpenCodeTokens(JSON.stringify(modelLike));
}
function estimateOpenCodeToolPart(part) {
  return estimateOpenCodeTokens(JSON.stringify(toOpenCodeToolPart(part)));
}
function estimateContextBreakdown(messages) {
  const breakdown = {
    total: 0,
    user: 0,
    assistant: 0,
    reasoning: 0,
    tools: 0,
    references: 0,
    other: 0,
    toolCount: 0
  };
  for (const message of messages) {
    const isReference = isBetterCompactReference(message);
    for (const part of message.parts) {
      const estimate = estimatePart(message, part);
      if (estimate <= 0) continue;
      breakdown.total += estimate;
      if (isReference) {
        breakdown.references += estimate;
        continue;
      }
      if (part.type === "tool") {
        breakdown.tools += estimate;
        breakdown.toolCount++;
        continue;
      }
      if (part.type === "reasoning") {
        breakdown.reasoning += estimate;
        continue;
      }
      if (part.type === "text") {
        if (message.info.role === "user") breakdown.user += estimate;
        else if (message.info.role === "assistant") breakdown.assistant += estimate;
        else breakdown.other += estimate;
        continue;
      }
      breakdown.other += estimate;
    }
  }
  return breakdown;
}
function toOpenCodeModelLikeMessage(message) {
  if (message.info.role === "user") {
    return {
      role: "user",
      parts: message.parts.flatMap((part) => {
        if (part.type === "text" && !part.ignored && part.text !== "") return [{ type: "text", text: part.text }];
        if (part.type === "file") return [{ type: "file", mime: part.mime, filename: part.filename }];
        if (part.type === "compaction") return [{ type: "text", text: "What did we do so far?" }];
        if (part.type === "subtask") return [{ type: "text", text: "The following tool was executed by the user" }];
        return [];
      })
    };
  }
  return {
    role: message.info.role,
    parts: message.parts.flatMap((part) => {
      if (part.type === "text") return [{ type: "text", text: part.text }];
      if (part.type === "reasoning" && shouldIncludeReasoning(message)) return [{ type: "reasoning", text: part.text }];
      if (part.type === "tool") return [toOpenCodeToolPart(part)];
      return [];
    })
  };
}
function estimatePart(message, part) {
  if (message.info.role === "user") {
    const modelLike = toOpenCodeModelLikeMessage({ ...message, parts: [part] });
    return modelLike.parts.length > 0 ? estimateOpenCodeTokens(JSON.stringify(modelLike.parts)) : 0;
  }
  if (part.type === "tool") return estimateOpenCodeToolPart(part);
  if (part.type === "text") return estimateOpenCodeTokens(JSON.stringify({ type: "text", text: part.text }));
  if (part.type === "reasoning" && shouldIncludeReasoning(message)) return estimateOpenCodeTokens(JSON.stringify({ type: "reasoning", text: part.text }));
  return 0;
}
function toOpenCodeToolPart(part) {
  if (part.state?.status === "completed") {
    return {
      type: `tool-${part.tool}`,
      state: "output-available",
      toolCallId: part.callID,
      input: part.state.input,
      output: part.state.time?.compacted ? COMPACTED_TOOL_OUTPUT_PLACEHOLDER : part.state.output
    };
  }
  if (part.state?.status === "error") {
    return {
      type: `tool-${part.tool}`,
      state: "output-error",
      toolCallId: part.callID,
      input: part.state.input,
      errorText: part.state.error
    };
  }
  return {
    type: `tool-${part.tool}`,
    state: part.state?.status ?? "unknown",
    toolCallId: part.callID,
    input: part.state?.input
  };
}
function isBetterCompactReference(message) {
  if (message.info.id.startsWith("msg_better_compact_")) return true;
  return message.parts.some(
    (part) => part.type === "text" && /^\[(?:Better Compact|Context Summary)/.test(part.text.trim())
  );
}
function shouldIncludeReasoning(message) {
  const providerID = message.info.providerID ?? message.info.model?.providerID;
  return typeof providerID !== "string" || !providerID.includes("openai");
}

// lib/codec.ts
function partOf(item) {
  return item.handle;
}
function toolPartOf(item) {
  return item.handle;
}
function messageOf(turn) {
  return turn.handle;
}
var openCodeCodec = {
  encode(messages) {
    return messages.map((message) => ({
      key: message.info.id,
      stamp: message.info.time.created,
      role: message.info.role,
      ephemeral: isIgnoredNotification(message),
      handle: message,
      items: message.parts.map(encodePart)
    }));
  },
  decode(turns, messages) {
    return turns.map(
      (turn) => turn.handle ? decodeNativeTurn(turn) : decodeSyntheticTurn(turn, messages)
    );
  },
  estimateTurns(turns) {
    return estimateOpenCodeMessages(turns.map(estimableMessage));
  },
  estimateItem(item) {
    return estimateOpenCodeToolPart(toolPartOf(item));
  },
  transcriptLine(item) {
    if (item.kind === "synthetic") return item.text;
    return formatPart(partOf(item));
  },
  // Raw JSON keeps the transcript lossless: previews truncate long tool
  // payloads, and the transcript exists precisely for exact recall.
  transcriptDocument(turns) {
    const messages = turns.filter((turn) => turn.handle).map(messageOf);
    return [
      "# Better Compact Raw Transcript",
      "",
      "```json",
      JSON.stringify(messages, null, 2),
      "```",
      ""
    ].join("\n");
  }
};
var openCodeConventions = {
  isSkillItem: (item) => item.kind === "tool" && toolPartOf(item).tool === "skill",
  tool: (item) => {
    const part = toolPartOf(item);
    return {
      name: part.tool,
      input: part.state?.input,
      error: part.state?.status === "error" ? String(part.state.error ?? "") : void 0
    };
  },
  todo: {
    isTodoItem: (item) => item.kind === "tool" && toolPartOf(item).tool === "todowrite",
    format: (item) => item.kind === "tool" ? formatTodoInput(toolPartOf(item).state?.input) : "todo state unavailable"
  },
  itemNote: (item) => {
    if (item.kind !== "opaque") return null;
    const part = partOf(item);
    if (part.type !== "patch") return null;
    const files = Array.isArray(part.files) ? part.files.join(", ") : "unknown files";
    return `Patch recorded: ${files}`;
  }
};
var openCodeSpec = {
  codec: openCodeCodec,
  conventions: openCodeConventions,
  stages: [
    skillsStage,
    supersedeReadsStage,
    purgeErrorInputsStage,
    toolsOldStage,
    reasoningStage,
    toolsRemainingStage,
    assistantRunsStage
  ]
};
function sessionKeyOf(messages) {
  return messages[0]?.info.sessionID ?? "unknown-session";
}
function isIgnoredNotification(message) {
  return message.info.role === "user" && message.parts.length > 0 && message.parts.every((part) => "ignored" in part && part.ignored === true);
}
function encodePart(part) {
  switch (part.type) {
    case "text":
      return { kind: "text", key: part.id, text: part.text, handle: part };
    case "reasoning":
      return { kind: "reasoning", key: part.id, handle: part };
    case "tool":
      return { kind: "tool", key: part.id, callId: part.callID, handle: part };
    default:
      return { kind: "opaque", key: part.id, handle: part };
  }
}
function decodeNativeTurn(turn) {
  const message = messageOf(turn);
  return {
    info: message.info,
    parts: turn.items.map(
      (item) => item.kind === "synthetic" ? syntheticTextPart(item, turn.key, message.info.sessionID) : partOf(item)
    )
  };
}
function decodeSyntheticTurn(turn, messages) {
  const base = messages.find((message) => message.info.role === "user") ?? messages[0];
  if (!base) throw new Error("Cannot decode a synthetic turn without a base message");
  const item = turn.items[0];
  const text = item?.kind === "synthetic" ? item.text : "";
  return {
    info: {
      ...base.info,
      id: `msg_${turn.key}`,
      role: "user"
    },
    parts: [
      {
        id: `prt_${turn.key}`,
        messageID: `msg_${turn.key}`,
        sessionID: base.info.sessionID,
        type: "text",
        synthetic: true,
        text
      }
    ]
  };
}
function syntheticTextPart(item, messageId, sessionId) {
  return {
    id: item.key,
    messageID: messageId,
    sessionID: sessionId,
    type: "text",
    text: item.text
  };
}
function estimableMessage(turn) {
  const info = turn.handle ? messageOf(turn).info : { role: turn.role };
  return {
    info,
    parts: turn.items.map(
      (item) => item.kind === "synthetic" ? { type: "text", text: item.text } : partOf(item)
    )
  };
}
function formatPart(part) {
  if (part.type === "text") return part.text;
  if (part.type === "reasoning") return `[reasoning]
${part.text}`;
  if (part.type === "tool") {
    return [
      `[tool:${part.tool}] callID=${part.callID} status=${part.state?.status}`,
      `input=${previewJson(part.state?.input, 2e4)}`,
      part.state?.status === "completed" ? `output=${part.state.output}` : "",
      part.state?.status === "error" ? `error=${part.state.error}` : ""
    ].filter(Boolean).join("\n");
  }
  return `[${part.type}] ${previewJson(part, 2e4)}`;
}
function formatTodoInput(input) {
  if (!input || typeof input !== "object" || !Array.isArray(input.todos)) {
    return previewJson(input, 480) || "todo state unavailable";
  }
  const todos = input.todos;
  if (todos.length === 0) return "no todos";
  return todos.map((todo, index) => {
    if (!todo || typeof todo !== "object") return `${index + 1}. ${String(todo)}`;
    const item = todo;
    const content = typeof item.content === "string" ? item.content : JSON.stringify(todo);
    const status = typeof item.status === "string" ? item.status : "unknown";
    const priority = typeof item.priority === "string" ? item.priority : "unknown";
    return `${index + 1}. [${status}/${priority}] ${content}`;
  }).join("; ");
}
function previewJson(value, maxChars) {
  if (value === void 0) return "";
  try {
    return truncate(typeof value === "string" ? value : JSON.stringify(value), maxChars);
  } catch {
    return truncate(String(value), maxChars);
  }
}

// lib/boundary/fingerprint.ts
import { createHash as createHash2 } from "crypto";
function boundaryRangeHash(messages) {
  const seed = JSON.stringify(
    messages.map((message) => ({
      info: withoutTransportFields(message.info, ["id", "sessionID", "parentID"]),
      parts: message.parts.map(
        (part) => withoutTransportFields(part, ["id", "messageID", "sessionID"])
      )
    }))
  );
  return createHash2("sha256").update(seed).digest("hex").slice(0, 16);
}
function withoutTransportFields(value, fields) {
  const result = { ...value };
  for (const field of fields) delete result[field];
  return result;
}

// lib/boundary/transcripts.ts
import { join as join5 } from "path";
var PLUGIN_ROOT = ".opencode/better-compact";
var TRANSCRIPT_ROOT = `${PLUGIN_ROOT}/sessions`;
function transcriptCitablePath(sessionKey, rangeHash2) {
  return `${TRANSCRIPT_ROOT}/${safePathPart(sessionKey)}/${rangeHash2}.md`;
}
function createTranscriptStore(directory) {
  return {
    citablePath: transcriptCitablePath,
    async write(relativePath, content) {
      const absolutePath = join5(directory, relativePath);
      await writePrivateFile(join5(directory, PLUGIN_ROOT, ".gitignore"), "*\n!.gitignore\n", directory);
      await writePrivateFile(absolutePath, content, directory);
      return { absolutePath };
    }
  };
}
function safePathPart(value) {
  return value.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120) || "unknown";
}

// lib/boundary/context.ts
function buildBoundaryContextPlan(messages, options = {}) {
  return buildPlan(
    openCodeCodec.encode(messages),
    { ...options, sessionKey: sessionKeyOf(messages), citablePath: transcriptCitablePath },
    openCodeSpec
  );
}
function applyBoundaryPlanSnapshot(messages, snapshot, options = {}) {
  const replayed = replayPlanSnapshot(openCodeCodec.encode(messages), snapshot, openCodeSpec, options);
  if (!replayed) return false;
  replaceMessages(messages, openCodeCodec.decode(replayed, messages));
  return true;
}
function toBoundaryPlanSnapshot(plan, messages) {
  if (plan.rawTailItemBoundary !== void 0) return toPlanSnapshot(plan);
  const prefix = messages.slice(0, plan.rawTailStartIndex);
  return {
    ...toPlanSnapshot(plan),
    prefixFingerprint: boundaryRangeHash(prefix),
    compactedMessageCount: prefix.length
  };
}
function storeBoundaryPlan(state, plan, messages) {
  state.boundary.activePlan = toBoundaryPlanSnapshot(plan, messages);
}
async function findMatchingBoundaryPlan(sessionId, messages, directory, logger) {
  const plans = await loadPersistedBoundaryPlans(logger);
  const hashes = /* @__PURE__ */ new Map();
  for (const plan of plans) {
    if (plan.rawTailItemBoundary !== void 0) continue;
    const compactedCount = plan.compactedMessageCount;
    if (!plan.prefixFingerprint || !compactedCount || compactedCount >= messages.length) continue;
    const hash = hashes.get(compactedCount) ?? boundaryRangeHash(messages.slice(0, compactedCount));
    hashes.set(compactedCount, hash);
    if (hash !== plan.prefixFingerprint) continue;
    if (!existsSync3(join6(directory, plan.transcriptRelativePath))) continue;
    return {
      ...plan,
      sessionId,
      rawTailStartMessageId: messages[compactedCount].info.id,
      rangeHash: rangeHash(openCodeCodec.encode(messages.slice(0, compactedCount)))
    };
  }
  return null;
}
async function writeBoundaryTranscript(directory, plan, logger) {
  await writeTranscript(plan, { transcripts: createTranscriptStore(directory), logger, codec: openCodeCodec });
}
function replaceMessages(messages, next) {
  messages.length = 0;
  messages.push(...next);
}

// lib/boundary/engine.ts
async function processBoundaryTransform(input) {
  const ports = {
    transcripts: createTranscriptStore(input.directory),
    plans: {
      load: () => input.state.boundary.activePlan,
      save: async (_sessionKey, snapshot) => {
        const previous = input.state.boundary.activePlan;
        input.state.boundary.activePlan = snapshot ? stampForkIdentity(snapshot, input.messages) : null;
        try {
          await saveSessionState(input.state, input.logger);
        } catch (error) {
          input.state.boundary.activePlan = previous;
          throw error;
        }
      }
    },
    logger: input.logger
  };
  const profile = resolveCompactionProfile(input.config);
  const engine = createEngine(openCodeSpec, ports);
  const result = await engine.process({
    sessionKey: sessionKeyOf(input.messages),
    turns: openCodeCodec.encode(input.messages),
    contextLimit: input.state.modelContextLimit,
    triggerRatio: profile.triggerPercent / 100,
    targetRatio: profile.targetPercent / 100,
    recentToolResultBudgetTokens: profile.recentToolTokens,
    providerReportedTokens: input.providerReportedTokens,
    summarize: input.summarize
  });
  if (result.outcome === "unchanged") return null;
  const decoded = openCodeCodec.decode(result.turns, input.messages);
  input.messages.length = 0;
  input.messages.push(...decoded);
  return result.outcome === "planned" ? result.plan : null;
}
function stampForkIdentity(snapshot, messages) {
  if (snapshot.rawTailItemBoundary !== void 0) return snapshot;
  const tailIndex = messages.findIndex((message) => message.info.id === snapshot.rawTailStartMessageId);
  if (tailIndex <= 0) return snapshot;
  const prefix = messages.slice(0, tailIndex);
  return {
    ...snapshot,
    prefixFingerprint: boundaryRangeHash(prefix),
    compactedMessageCount: prefix.length
  };
}

// lib/boundary/progress.ts
import { randomUUID as randomUUID2 } from "crypto";
var BOUNDARY_PROGRESS_STAGES = [
  { id: "load", label: "Loaded session history" },
  { id: "scan", label: "Scanned context and token budget" },
  { id: "transcript", label: "Wrote raw transcript reference" },
  { id: "skills", label: "Pruned loaded skills" },
  { id: "supersede-reads", label: "Superseded repeated tool reads" },
  { id: "purge-error-inputs", label: "Purged stale failed tool inputs" },
  { id: "tools-old", label: "Pruned old tool calls/results" },
  { id: "reasoning", label: "Pruned thinking tokens" },
  { id: "tools-remaining", label: "Pruned remaining tool calls/results" },
  { id: "assistant-runs", label: "Summarized assistant turns" },
  { id: "prefix-summary", label: "Applied last-resort prefix summary" },
  { id: "store", label: "Stored Better Compact context plan" },
  { id: "report", label: "Published final report" }
];
function createBoundaryJob(input) {
  const now = input.startedAt ?? Date.now();
  const job = {
    id: input.id ?? `bc_${randomUUID2().replaceAll("-", "")}`,
    sessionId: input.sessionId,
    status: "running",
    currentStage: "Starting Better Compact",
    percent: 0,
    stages: BOUNDARY_PROGRESS_STAGES.map((stage) => ({ ...stage, status: "pending" })),
    logs: ["Starting Better Compact."],
    counters: { ...input.counters },
    startedAt: now,
    updatedAt: now
  };
  return job;
}
function startBoundaryJob(state, input) {
  const job = createBoundaryJob(input);
  state.boundary.job = job;
  return job;
}
function setBoundaryStage(state, id, status, detail, metrics) {
  const job = state.boundary.job;
  if (!job) return;
  const stage = job.stages.find((item) => item.id === id);
  if (!stage) return;
  stage.status = status;
  stage.detail = detail ?? stage.detail;
  if (metrics) Object.assign(stage, metrics);
  job.currentStage = status === "running" ? stage.label : job.currentStage;
  if (status === "completed" || status === "skipped" || status === "failed") {
    job.currentStage = stage.label;
  }
  touchBoundaryJob(job);
}
function appendBoundaryLog(state, message) {
  const job = state.boundary.job;
  if (!job) return;
  job.logs.push(message);
  if (job.logs.length > 80) job.logs = job.logs.slice(-80);
  touchBoundaryJob(job);
}
function updateBoundaryCounters(state, counters) {
  const job = state.boundary.job;
  if (!job) return;
  job.counters = { ...job.counters, ...counters };
  touchBoundaryJob(job);
}
function updateBoundaryPercent(state) {
  const job = state.boundary.job;
  if (!job) return;
  const completed = job.stages.filter(
    (stage) => stage.status === "completed" || stage.status === "skipped"
  ).length;
  const runningBonus = job.stages.some((stage) => stage.status === "running") ? 0.5 : 0;
  job.percent = Math.max(
    0,
    Math.min(99, Math.round((completed + runningBonus) / job.stages.length * 100))
  );
  touchBoundaryJob(job);
}
function completeBoundaryJob(state, detail) {
  const job = state.boundary.job;
  if (!job) return;
  job.status = "completed";
  job.currentStage = detail ?? "Complete";
  job.percent = 100;
  job.completedAt = Date.now();
  touchBoundaryJob(job);
}
function failBoundaryJob(state, error) {
  const job = state.boundary.job;
  if (!job) return;
  job.status = "failed";
  job.currentStage = "Failed";
  job.error = error;
  job.completedAt = Date.now();
  touchBoundaryJob(job);
}
function touchBoundaryJob(job) {
  job.updatedAt = Date.now();
}

// lib/boundary/report.ts
function formatBoundaryReport(plan, actualCurrentTokens) {
  const before = actualCurrentTokens && actualCurrentTokens > 0 ? actualCurrentTokens : plan.beforeTokens;
  const now = plan.afterPruneTokens;
  const reduced = Math.max(0, before - now);
  const reductionPercent = before > 0 ? Math.round(reduced / before * 100) : 0;
  const stageRows = plan.stages.filter((stage) => stage.status !== "skipped" || stage.clearedTokens > 0).map((stage) => {
    const icon = stage.clearedTokens > 0 ? "\u2713" : stage.status === "target-met" ? "\u2713" : "-";
    const detail = stage.clearedTokens > 0 ? `-${formatTokenCount(stage.clearedTokens)}` : "not needed";
    return `  ${icon} ${stage.label.padEnd(38)} ${detail}`;
  });
  return [
    "\u256D\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u256E",
    "\u2502                       Better Compact Complete                          \u2502",
    "\u2570\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u256F",
    "",
    "  Context window",
    formatContextWindowLine("Before", before, plan.contextLimit),
    formatContextWindowLine("Now", now, plan.contextLimit, "projected"),
    "",
    `  Reduced ${formatTokenCount(reduced)} (${reductionPercent}%)`,
    "",
    "  Actions",
    ...stageRows.length > 0 ? stageRows : ["  (no stages applied)"],
    "",
    "  Reference",
    `  ${plan.transcript.relativePath}`,
    `  ${plan.transcript.messageIds.length} archived messages; raw tail starts at ${plan.rawTailStartMessageId}`,
    Object.keys(plan.assistantSummaries).length > 0 ? `  ${Object.keys(plan.assistantSummaries).length} assistant summaries accepted` : void 0,
    "",
    "  Note: Now is Better Compact's projected active-history size. OpenCode's footer",
    "  updates after the next provider response and also includes system/tool schemas,",
    "  cache accounting, output, reasoning, and provider overhead."
  ].filter((line) => line !== void 0).join("\n");
}
function formatContextWindowLine(label, tokens, limit, suffix) {
  const width = 18;
  const boundedLimit = Math.max(1, limit);
  const ratio = tokens / boundedLimit;
  const filled = Math.max(0, Math.min(width, Math.round(Math.min(1, ratio) * width)));
  const percent = Math.round(ratio * 100);
  const suffixText = suffix ? ` ${suffix}` : "";
  return `  ${label.padEnd(6)} ${formatTokenCount(tokens).padStart(7)} / ${formatTokenCount(boundedLimit).padEnd(7)} [${"\u2588".repeat(filled)}${"\u2591".repeat(width - filled)}] ${String(percent).padStart(3)}%${suffixText}`;
}
function formatTokenCount(tokens) {
  if (tokens >= 1e6) return `${(tokens / 1e6).toFixed(1).replace(/\.0$/, "")}M`;
  if (tokens >= 1e3) return `${(tokens / 1e3).toFixed(1).replace(/\.0$/, "")}K`;
  return `${tokens}`;
}

// lib/boundary/summarizer.ts
async function summarizeBoundaryJobs(input) {
  if (input.jobs.length === 0 || !canRunScratchSession(input.client)) return {};
  return input.runtime.summaryScheduler.summarize({
    sessionKey: input.parentSessionId,
    jobs: input.jobs,
    summarizer: createScratchSummarizer(input),
    concurrency: input.concurrency,
    onProgress: input.onProgress
  });
}
function canRunScratchSession(client) {
  return typeof client?.session?.create === "function" && typeof client?.session?.prompt === "function" && typeof client?.session?.delete === "function";
}
function createScratchSummarizer(input) {
  return {
    async complete(job) {
      let scratchSessionId;
      let untrackScratch;
      try {
        const created = await input.client.session.create({
          body: {
            parentID: input.parentSessionId,
            title: `Better Compact summary ${job.rangeStartMessageId}`,
            agent: input.params.agent,
            model: input.params.providerId && input.params.modelId ? { providerID: input.params.providerId, modelID: input.params.modelId } : void 0,
            metadata: {
              betterCompactScratch: true,
              parentSessionId: input.parentSessionId,
              rangeStartMessageId: job.rangeStartMessageId,
              rangeEndMessageId: job.rangeEndMessageId
            }
          }
        });
        scratchSessionId = created?.data?.id ?? created?.id;
        if (!scratchSessionId) return null;
        untrackScratch = input.runtime.trackScratch(scratchSessionId);
        const response = await input.client.session.prompt({
          path: { id: scratchSessionId },
          body: {
            agent: input.params.agent,
            model: input.params.providerId && input.params.modelId ? { providerID: input.params.providerId, modelID: input.params.modelId } : void 0,
            variant: input.params.variant,
            parts: [{ type: "text", text: job.prompt }]
          }
        });
        return extractAssistantText(response?.data ?? response);
      } catch (error) {
        input.logger.warn("Better Compact scratch summarization failed", {
          rangeStartMessageId: job.rangeStartMessageId,
          rangeEndMessageId: job.rangeEndMessageId,
          error: error instanceof Error ? error.message : String(error)
        });
        return null;
      } finally {
        if (scratchSessionId) {
          try {
            await input.client.session.delete({ path: { id: scratchSessionId } });
          } catch (error) {
            input.logger.warn("Failed to delete Better Compact scratch session", {
              scratchSessionId,
              error: error instanceof Error ? error.message : String(error)
            });
          } finally {
            untrackScratch?.();
          }
        }
      }
    }
  };
}
function extractAssistantText(message) {
  const parts = Array.isArray(message?.parts) ? message.parts : [];
  return parts.filter((part) => part?.type === "text" && typeof part.text === "string").map((part) => part.text).join("\n\n").trim();
}

// lib/ui/notification.ts
async function sendIgnoredMessage(client, sessionID, text, params, logger) {
  const agent = params.agent || void 0;
  const variant = params.variant || void 0;
  const model = params.providerId && params.modelId ? {
    providerID: params.providerId,
    modelID: params.modelId
  } : void 0;
  try {
    await client.session.prompt({
      path: {
        id: sessionID
      },
      body: {
        noReply: true,
        agent,
        model,
        variant,
        parts: [
          {
            type: "text",
            text,
            ignored: true
          }
        ]
      }
    });
  } catch (error) {
    logger.error("Failed to send notification", { error: error.message });
  }
}

// lib/ui/utils.ts
function formatTokenCount2(tokens, compact) {
  const suffix = compact ? "" : " tokens";
  if (tokens >= 1e3) {
    return `${(tokens / 1e3).toFixed(1)}K`.replace(".0K", "K") + suffix;
  }
  return tokens.toString() + suffix;
}

// lib/commands/context.ts
function analyzeContextTokens(state, messages) {
  const activeMessages = cloneMessages(messages);
  if (state.boundary.activePlan && state.boundary.activePlan.sessionId === state.sessionId) {
    applyBoundaryPlanSnapshot(activeMessages, state.boundary.activePlan);
  }
  const estimated = estimateContextBreakdown(activeMessages);
  const reportedTotal = getCurrentTokenUsage(state, messages);
  return {
    reportedTotal,
    estimatedTotal: estimated.total,
    user: estimated.user,
    assistant: estimated.assistant,
    reasoning: estimated.reasoning,
    tools: estimated.tools,
    references: estimated.references,
    other: estimated.other,
    unattributed: Math.max(0, reportedTotal - estimated.total),
    toolCount: estimated.toolCount,
    toolsInContextCount: estimated.toolCount
  };
}
function formatContextMessage(breakdown) {
  const lines = [];
  const barWidth = 30;
  const categories = [
    { label: "User messages", value: breakdown.user, char: "\u2593" },
    { label: "Assistant text", value: breakdown.assistant, char: "\u2592" },
    { label: "Reasoning", value: breakdown.reasoning, char: "\u2592" },
    { label: `Tool calls/results (${breakdown.toolsInContextCount})`, value: breakdown.tools, char: "\u2591" },
    { label: "BC refs/summaries", value: breakdown.references, char: "\u2588" },
    { label: "Other visible history", value: breakdown.other, char: "\u2591" }
  ].filter((item) => item.value > 0);
  const maxLabelLen = Math.max(1, ...categories.map((category) => category.label.length));
  lines.push("\u256D\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u256E");
  lines.push("\u2502              Better Compact Context Analysis              \u2502");
  lines.push("\u2570\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u256F");
  lines.push("");
  lines.push("Reported by OpenCode:");
  lines.push(`  Current usage:             ~${formatTokenCount2(breakdown.reportedTotal)}`);
  lines.push("");
  lines.push("Estimated active history shape:");
  lines.push(`  Estimated visible history: ~${formatTokenCount2(breakdown.estimatedTotal)}`);
  if (breakdown.unattributed > 0) {
    lines.push(`  Unattributed/provider overhead/cache/system: ~${formatTokenCount2(breakdown.unattributed)}`);
  }
  lines.push("\u2500".repeat(60));
  lines.push("");
  if (categories.length === 0) {
    lines.push("  No visible history content found.");
  } else {
    for (const category of categories) {
      const bar = createBar(category.value, breakdown.estimatedTotal, barWidth, category.char);
      const percentage = breakdown.estimatedTotal > 0 ? (category.value / breakdown.estimatedTotal * 100).toFixed(1) : "0.0";
      const labelWithPct = `${category.label.padEnd(maxLabelLen)} ${percentage.padStart(5)}% `;
      const valueStr = formatTokenCount2(category.value).padStart(13);
      lines.push(`${labelWithPct}\u2502${bar.padEnd(barWidth)}\u2502${valueStr}`);
    }
  }
  lines.push("");
  lines.push("Notes:");
  lines.push("  Reported usage is provider/OpenCode token accounting and should match the footer.");
  lines.push("  Category percentages are OpenCode-style estimates over visible active history, not exact provider attribution.");
  lines.push("");
  return lines.join("\n");
}
async function handleContextCommand(ctx) {
  const { client, state, logger, sessionId, messages } = ctx;
  const message = formatContextMessage(analyzeContextTokens(state, messages));
  const params = getCurrentParams(state, messages, logger);
  await sendIgnoredMessage(client, sessionId, message, params, logger);
}
function createBar(value, maxValue, width, char) {
  if (maxValue <= 0) return "";
  const filled = Math.round(value / maxValue * width);
  return char.repeat(Math.max(0, filled));
}
function cloneMessages(messages) {
  return messages.map((message) => ({
    info: message.info,
    parts: [...message.parts]
  }));
}

// lib/commands/help.ts
var COMMANDS = [
  ["/better-compact", "Run staged context pruning now"],
  ["/better-compact context", "Show token usage breakdown for current session"],
  ["/better-compact stats", "Show pruning statistics"],
  ["/better-compact help", "Show this help"],
  ["/better-compact-settings", "Open Better Compact settings panel"]
];
function formatHelpMessage(state, config) {
  const commands = COMMANDS;
  const colWidth = Math.max(...commands.map(([cmd]) => cmd.length)) + 4;
  const lines = [];
  lines.push("\u256D\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u256E");
  lines.push("\u2502                         Better Compact Commands                         \u2502");
  lines.push("\u2570\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u256F");
  lines.push("");
  lines.push("  Better Compact preserves raw user messages first, prunes assistant/tool-heavy history in stages, and writes transcript refs for exact recall.");
  lines.push("");
  for (const [cmd, desc] of commands) {
    lines.push(`  ${cmd.padEnd(colWidth)}${desc}`);
  }
  lines.push("");
  return lines.join("\n");
}
async function handleHelpCommand(ctx) {
  const { client, state, logger, sessionId, messages } = ctx;
  const { config } = ctx;
  const message = formatHelpMessage(state, config);
  const params = getCurrentParams(state, messages, logger);
  await sendIgnoredMessage(client, sessionId, message, params, logger);
  logger.info("Help command executed");
}

// lib/commands/stats.ts
function buildStatsReport(state) {
  const plan = state.boundary.activePlan;
  const status = state.boundary.job?.status ?? null;
  if (!plan || plan.sessionId !== state.sessionId) {
    return {
      hasPlan: false,
      status,
      beforeTokens: 0,
      afterTokens: 0,
      clearedTokens: 0,
      targetTokens: 0,
      contextLimit: 0,
      transcriptPath: null,
      createdAt: null,
      stages: []
    };
  }
  return {
    hasPlan: true,
    status,
    beforeTokens: plan.beforeTokens,
    afterTokens: plan.afterPruneTokens,
    clearedTokens: Math.max(0, plan.beforeTokens - plan.afterPruneTokens),
    targetTokens: plan.targetTokens,
    contextLimit: plan.contextLimit,
    transcriptPath: plan.transcriptRelativePath || null,
    createdAt: plan.createdAt ?? null,
    stages: (plan.stages ?? []).map((stage) => ({
      label: stage.label,
      clearedTokens: stage.clearedTokens,
      status: stage.status
    }))
  };
}
function formatStatsMessage(report) {
  const lines = [];
  lines.push("\u256D\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u256E");
  lines.push("\u2502                Better Compact Statistics                  \u2502");
  lines.push("\u2570\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u256F");
  lines.push("");
  if (!report.hasPlan) {
    lines.push("No Better Compact plan is active for this session yet.");
    lines.push("Run /better-compact to prune historical context.");
    return lines.join("\n");
  }
  lines.push("Active pruning plan:");
  lines.push("\u2500".repeat(60));
  lines.push(`  Status:           ${report.status ?? "unknown"}`);
  lines.push(
    `  Context:          ~${formatTokenCount2(report.beforeTokens)} -> ~${formatTokenCount2(report.afterTokens)}`
  );
  lines.push(`  Cleared:          ~${formatTokenCount2(report.clearedTokens)}`);
  lines.push(`  Target:           ~${formatTokenCount2(report.targetTokens)}`);
  lines.push(`  Context limit:    ~${formatTokenCount2(report.contextLimit)}`);
  if (report.createdAt) {
    lines.push(`  Created:          ${new Date(report.createdAt).toISOString()}`);
  }
  if (report.transcriptPath) {
    lines.push(`  Transcript:       ${report.transcriptPath}`);
  }
  const appliedStages = report.stages.filter((stage) => stage.clearedTokens > 0);
  if (appliedStages.length > 0) {
    lines.push("");
    lines.push("Stages:");
    for (const stage of appliedStages) {
      lines.push(`  \u2192 ${stage.label}: ~${formatTokenCount2(stage.clearedTokens)} cleared`);
    }
  }
  return lines.join("\n");
}
async function handleStatsCommand(ctx) {
  const { client, state, logger, sessionId, messages } = ctx;
  const report = buildStatsReport(state);
  const message = formatStatsMessage(report);
  const params = getCurrentParams(state, messages, logger);
  await sendIgnoredMessage(client, sessionId, message, params, logger);
  logger.info("Stats command executed", {
    hasPlan: report.hasPlan,
    clearedTokens: report.clearedTokens,
    status: report.status
  });
}

// lib/compress-permission.ts
var compressPermission = (state, config) => {
  return state.compressPermission ?? config.compress.permission;
};
var syncCompressPermissionState = (state, config, hostPermissions, messages) => {
  const activeAgent = getLastUserMessage(messages)?.info.agent;
  state.compressPermission = resolveEffectiveCompressPermission(
    config.compress.permission,
    hostPermissions,
    activeAgent
  );
};

// lib/hooks.ts
function createSystemPromptHandler(runtime, logger, config) {
  return async (input, output) => {
    if (input.model?.limit?.context) {
      if (input.model.providerID && input.model.id) {
        runtime.setModelLimit(input.model.providerID, input.model.id, input.model.limit.context);
      }
      if (input.sessionID) {
        runtime.get(input.sessionID).modelContextLimit = input.model.limit.context;
      }
      logger.debug("Cached model context limit", { limit: input.model.limit.context });
    }
  };
}
function createChatMessageTransformHandler(client, runtime, logger, config, hostPermissions, workingDirectory = process.cwd(), loadConfig = () => config) {
  return async (_input, output) => {
    const currentConfig = loadConfig();
    if (!currentConfig.enabled) return;
    const receivedMessages = Array.isArray(output.messages) ? output.messages.length : 0;
    const messages = filterMessagesInPlace(output.messages);
    if (messages.length !== receivedMessages) {
      logger.warn("Skipping messages with unexpected shape during chat transform", {
        received: receivedMessages,
        usable: messages.length
      });
    }
    const sessionId = messages.find((message) => typeof message.info?.sessionID === "string")?.info.sessionID;
    if (!sessionId || runtime.isScratch(sessionId)) {
      return;
    }
    const state = await runtime.prepare(sessionId, messages);
    const currentParams = getCurrentParams(state, messages, logger);
    if (currentParams.providerId && currentParams.modelId) {
      state.modelContextLimit = await runtime.resolveModelLimit(
        currentParams.providerId,
        currentParams.modelId
      );
    }
    syncCompressPermissionState(state, currentConfig, hostPermissions, messages);
    if (state.isSubAgent && !currentConfig.experimental.allowSubAgents) {
      return;
    }
    stripHallucinations(messages);
    const effectivePermission = compressPermission(state, currentConfig);
    if (effectivePermission !== "deny" && !state.boundary.activePlan && messages.length >= 3) {
      const inherited = await findMatchingBoundaryPlan(sessionId, messages, workingDirectory, logger);
      if (inherited) {
        state.boundary.activePlan = inherited;
        await saveSessionState(state, logger).catch((error) => {
          logger.warn("Failed to persist inherited Better Compact plan", {
            error: error instanceof Error ? error.message : String(error)
          });
        });
      }
    }
    const automaticAllowed = currentConfig.compaction.automatic && effectivePermission === "allow";
    if (automaticAllowed) {
      await runAutomaticTransform({
        client,
        runtime,
        state,
        logger,
        config: currentConfig,
        workingDirectory,
        sessionId,
        messages,
        params: currentParams
      });
    } else if (state.boundary.activePlan && effectivePermission !== "deny") {
      applyBoundaryPlanSnapshot(messages, state.boundary.activePlan, { allowRegrown: true });
    }
    if (state.sessionId) {
      await logger.saveContext(state.sessionId, messages);
    }
  };
}
async function runAutomaticTransform(input) {
  try {
    let planned = null;
    const started = input.runtime.startCompaction(input.sessionId, async () => {
      planned = await processBoundaryTransform({
        state: input.state,
        logger: input.logger,
        config: input.config,
        directory: input.workingDirectory,
        messages: input.messages,
        providerReportedTokens: getCurrentTokenUsage(input.state, input.messages),
        summarize: (jobs) => summarizeBoundaryJobs({
          client: input.client,
          runtime: input.runtime,
          logger: input.logger,
          parentSessionId: input.sessionId,
          jobs,
          params: input.params,
          concurrency: resolveCompactionProfile(input.config).summarizerConcurrency
        })
      });
    });
    const active = input.runtime.activeCompaction(input.sessionId);
    if (!started) {
      await active?.catch(() => {
      });
      const latestPlan = input.state.boundary.activePlan;
      if (latestPlan) {
        applyBoundaryPlanSnapshot(input.messages, latestPlan, { allowRegrown: true });
      }
      return;
    }
    if (active) await active;
    if (planned) await showAutomaticCompactionToast(input.client, planned);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    input.logger.error("Automatic Better Compact failed; request continues unpruned", { error: message });
    try {
      await input.client.tui.showToast({
        body: {
          title: "Better Compact failed",
          message,
          variant: "error",
          duration: 7e3
        }
      });
    } catch {
    }
  }
}
async function showAutomaticCompactionToast(client, plan) {
  try {
    await client.tui.showToast({
      body: {
        title: "Better Compact applied",
        message: `${formatCompactTokens(plan.beforeTokens)} \u2192 ${formatCompactTokens(plan.afterPruneTokens)} projected context`,
        variant: "success",
        duration: 5e3
      }
    });
  } catch {
  }
}
function createCommandExecuteHandler(client, runtime, logger, config, workingDirectory, hostPermissions, loadConfig = () => config) {
  return async (input, output) => {
    const currentConfig = loadConfig();
    if (!currentConfig.enabled || !currentConfig.commands.enabled) {
      return;
    }
    if (input.command === "better-compact" || input.command === "better-compact-settings") {
      const messagesResponse = await client.session.messages({
        path: { id: input.sessionID }
      });
      const messages = filterMessages(messagesResponse.data || messagesResponse);
      const state = await runtime.prepare(input.sessionID, messages);
      syncCompressPermissionState(state, currentConfig, hostPermissions, messages);
      const effectivePermission = compressPermission(state, currentConfig);
      if (effectivePermission === "deny") {
        output.parts.length = 0;
        return;
      }
      const args = (input.arguments || "").trim().split(/\s+/).filter(Boolean);
      const subcommand = input.command === "better-compact-settings" ? "settings" : args[0]?.toLowerCase() || "compress";
      const commandCtx = {
        client,
        state,
        config: currentConfig,
        logger,
        sessionId: input.sessionID,
        messages
      };
      if (subcommand === "context") {
        await handleContextCommand(commandCtx);
        output.parts.length = 0;
        return;
      }
      if (subcommand === "stats") {
        await handleStatsCommand(commandCtx);
        output.parts.length = 0;
        return;
      }
      if (subcommand === "help") {
        await handleHelpCommand(commandCtx);
        output.parts.length = 0;
        return;
      }
      if (subcommand === "settings") {
        const params = getCurrentParams(state, messages, logger);
        await sendIgnoredMessage(
          client,
          input.sessionID,
          "Open Better Compact settings from the command palette with /better-compact-settings.",
          params,
          logger
        );
        output.parts.length = 0;
        return;
      }
      if (subcommand === "compress") {
        const started = runtime.startCompaction(input.sessionID, async () => {
          try {
            await runBetterCompact({
              client,
              runtime,
              state,
              logger,
              config: currentConfig,
              workingDirectory,
              sessionId: input.sessionID,
              messages
            });
          } catch (error) {
            logger.error("Better Compact command job failed", {
              error: error instanceof Error ? error.message : String(error)
            });
          }
        });
        if (!started) {
          const params = getCurrentParams(state, messages, logger);
          await sendIgnoredMessage(
            client,
            input.sessionID,
            "Better Compact is already running for this session.",
            params,
            logger
          );
        }
        output.parts.length = 0;
        return;
      }
      await handleHelpCommand(commandCtx);
      output.parts.length = 0;
      return;
    }
  };
}
function createChatMessageHandler(client, runtime, logger, config, workingDirectory, hostPermissions, loadConfig = () => config) {
  return async (input, output) => {
    const sentinel = output.parts.find(
      (part) => part?.type === "text" && part?.ignored === true && part?.metadata?.betterCompact === "run"
    );
    if (!sentinel) return;
    const currentConfig = loadConfig();
    if (!currentConfig.enabled) return;
    const messagesResponse = await client.session.messages({
      path: { id: input.sessionID }
    });
    const messages = filterMessages(messagesResponse.data || messagesResponse);
    const state = await runtime.prepare(input.sessionID, messages);
    const jobId = validBoundaryJobId(sentinel.metadata?.jobId);
    const jobStartedAt = validBoundaryJobStartedAt(sentinel.metadata?.jobStartedAt);
    const contextLimit = validBoundaryCounter(sentinel.metadata?.contextLimit);
    const currentTokens = validBoundaryCounter(sentinel.metadata?.currentTokens);
    const targetTokens = validBoundaryCounter(sentinel.metadata?.targetTokens);
    const requestedSummaryVariant = validSummaryVariant(sentinel.metadata?.summaryVariant);
    const messageModel = output.message?.model;
    const providerID = input.model?.providerID ?? messageModel?.providerID;
    const modelID = input.model?.modelID ?? messageModel?.modelID;
    const summaryVariant = requestedSummaryVariant && providerID === sentinel.metadata?.summaryProviderID && modelID === sentinel.metadata?.summaryModelID ? requestedSummaryVariant : void 0;
    syncCompressPermissionState(state, currentConfig, hostPermissions, messages);
    if (compressPermission(state, currentConfig) === "deny") {
      startBoundaryJob(state, {
        id: jobId,
        sessionId: input.sessionID,
        startedAt: jobStartedAt,
        counters: {
          beforeTokens: currentTokens,
          currentTokens,
          targetTokens,
          contextLimit
        }
      });
      failBoundaryJob(state, "Compression is denied by OpenCode permissions.");
      await saveSessionState(state, logger);
      return;
    }
    const started = runtime.startCompaction(input.sessionID, async () => {
      try {
        await runBetterCompact({
          client,
          runtime,
          state,
          logger,
          config: currentConfig,
          workingDirectory,
          sessionId: input.sessionID,
          messages,
          params: {
            providerId: providerID,
            modelId: modelID,
            agent: input.agent ?? output.message?.agent,
            variant: input.variant ?? output.message?.variant
          },
          compaction: sentinel.metadata?.compaction,
          contextLimit,
          currentTokens,
          jobId,
          jobStartedAt,
          summaryVariant
        });
      } catch (error) {
        logger.error("Better Compact TUI job failed", {
          error: error instanceof Error ? error.message : String(error)
        });
      }
    });
    if (!started) {
      try {
        await client.tui.showToast({
          body: {
            title: "Better Compact already running",
            message: "Wait for the active compaction to finish.",
            variant: "warning",
            duration: 5e3
          }
        });
      } catch {
      }
    }
  };
}
async function runBetterCompact(input) {
  const params = input.params ?? getCurrentParams(input.state, input.messages, input.logger);
  const profile = resolveCompactionProfile(input.config, input.compaction);
  const contextLimit = input.contextLimit && input.contextLimit > 0 ? input.contextLimit : input.state.modelContextLimit ?? 2e5;
  const reportedCurrentTokens = input.currentTokens && input.currentTokens > 0 ? input.currentTokens : getCurrentTokenUsage(input.state, input.messages);
  startBoundaryJob(input.state, {
    id: input.jobId,
    sessionId: input.sessionId,
    startedAt: input.jobStartedAt,
    counters: {
      beforeTokens: reportedCurrentTokens,
      currentTokens: reportedCurrentTokens,
      targetTokens: Math.round(contextLimit * profile.targetPercent / 100),
      contextLimit,
      stageClearedTokens: 0,
      clearedTokens: 0
    }
  });
  updateBoundaryCounters(input.state, {
    messages: input.messages.length,
    beforeTokens: reportedCurrentTokens,
    currentTokens: reportedCurrentTokens,
    contextLimit,
    stageClearedTokens: 0,
    clearedTokens: 0
  });
  const saveProgress = async () => {
    updateBoundaryPercent(input.state);
    await saveSessionState(input.state, input.logger);
  };
  const previousActivePlan = input.state.boundary.activePlan;
  try {
    setBoundaryStage(input.state, "load", "running", "Reading current OpenCode session history");
    updateBoundaryCounters(input.state, { messages: input.messages.length });
    appendBoundaryLog(input.state, `Loaded ${input.messages.length} messages from current session.`);
    setBoundaryStage(input.state, "load", "completed", `${input.messages.length} messages loaded`);
    await saveProgress();
    setBoundaryStage(input.state, "scan", "running", "Estimating context and selecting pruning stages");
    await saveProgress();
    const plan = buildBoundaryContextPlan(input.messages, {
      contextLimit,
      force: true,
      triggerRatio: profile.triggerPercent / 100,
      targetRatio: profile.targetPercent / 100,
      recentToolResultBudgetTokens: profile.recentToolTokens,
      providerReportedTokens: reportedCurrentTokens,
      priorPlan: input.state.boundary.activePlan ?? void 0
    });
    if (!plan) {
      setBoundaryStage(input.state, "scan", "skipped", "No eligible historical context found");
      appendBoundaryLog(input.state, "Better Compact did not find enough context to prune.");
      completeBoundaryJob(input.state, "No pruning needed");
      await saveSessionState(input.state, input.logger);
      await sendIgnoredMessage(
        input.client,
        input.sessionId,
        "Better Compact did not find enough context to prune.",
        params,
        input.logger
      );
      return;
    }
    updateBoundaryCounters(input.state, {
      beforeTokens: plan.beforeTokens,
      afterTokens: plan.afterPruneTokens,
      currentTokens: plan.beforeTokens,
      targetTokens: plan.targetTokens,
      contextLimit: plan.contextLimit,
      stageClearedTokens: 0,
      clearedTokens: Math.max(0, plan.beforeTokens - plan.afterPruneTokens)
    });
    setBoundaryStage(input.state, "scan", "completed", `Projected ${formatCompactTokens(plan.beforeTokens)} -> ${formatCompactTokens(plan.afterPruneTokens)}`);
    appendBoundaryLog(input.state, `Projected context reduction: ${formatCompactTokens(plan.beforeTokens)} -> ${formatCompactTokens(plan.afterPruneTokens)}.`);
    await saveProgress();
    setBoundaryStage(input.state, "transcript", "running", "Writing raw transcript reference");
    await saveProgress();
    await writeBoundaryTranscript(input.workingDirectory, plan, input.logger);
    updateBoundaryCounters(input.state, { archivedMessages: plan.transcript.messageIds.length });
    setBoundaryStage(input.state, "transcript", "completed", `${plan.transcript.messageIds.length} messages archived`);
    appendBoundaryLog(input.state, `Transcript written: ${plan.transcript.relativePath}`);
    await saveProgress();
    const appliedStageIds = new Set(plan.stages.map((stage) => stage.name));
    for (const stage of plan.stages) {
      if (plan.summaryJobs.length > 0 && (stage.name === "assistant-runs" || stage.name === "prefix-summary")) {
        continue;
      }
      const status = stage.status === "skipped" ? "skipped" : "completed";
      setBoundaryStage(
        input.state,
        stage.name,
        status,
        stage.clearedTokens > 0 ? `Cleared ${formatCompactTokens(stage.clearedTokens)}` : stage.status === "skipped" ? "No matching context" : "Applied",
        {
          beforeTokens: stage.beforeTokens,
          afterTokens: stage.afterTokens,
          clearedTokens: stage.clearedTokens,
          changedMessages: stage.changedMessages,
          changedParts: stage.changedParts
        }
      );
      updateBoundaryCounters(input.state, {
        currentTokens: stage.afterTokens,
        stageClearedTokens: stage.clearedTokens,
        clearedTokens: Math.max(0, plan.beforeTokens - stage.afterTokens)
      });
      appendBoundaryLog(input.state, `${stage.label}: ${formatCompactTokens(stage.clearedTokens)} cleared.`);
      await saveProgress();
    }
    for (const skippedStage of ["skills", "supersede-reads", "purge-error-inputs", "tools-old", "reasoning", "tools-remaining", "assistant-runs", "prefix-summary"]) {
      if (appliedStageIds.has(skippedStage)) continue;
      setBoundaryStage(input.state, skippedStage, "skipped", "Not needed");
    }
    await saveProgress();
    let finalPlan = plan;
    if (plan.summaryJobs.length > 0) {
      const summaryStage = plan.summaryJobs.some(
        (job) => !job.key.startsWith("prefix-summary:")
      ) ? "assistant-runs" : "prefix-summary";
      setBoundaryStage(
        input.state,
        summaryStage,
        "running",
        `${plan.summaryJobs.length} summary jobs queued`
      );
      updateBoundaryCounters(input.state, {
        summaryJobsTotal: plan.summaryJobs.length,
        summaryJobsDone: 0,
        summaryJobsSucceeded: 0,
        summaryJobsFailed: 0,
        stageClearedTokens: 0
      });
      appendBoundaryLog(input.state, `Running ${plan.summaryJobs.length} summary jobs in parallel.`);
      await saveProgress();
      const assistantSummaries = await summarizeBoundaryJobs({
        client: input.client,
        runtime: input.runtime,
        logger: input.logger,
        parentSessionId: input.sessionId,
        jobs: plan.summaryJobs,
        params: {
          ...params,
          variant: input.summaryVariant ?? params.variant
        },
        concurrency: profile.summarizerConcurrency,
        onProgress: async (event) => {
          updateBoundaryCounters(input.state, {
            summaryJobsTotal: event.total,
            summaryJobsDone: event.done,
            summaryJobsSucceeded: event.succeeded,
            summaryJobsFailed: event.failed
          });
          appendBoundaryLog(
            input.state,
            event.ok ? `Summarized assistant turn ${event.done}/${event.total}: ${event.rangeStartMessageId} -> ${event.rangeEndMessageId}.` : `Assistant turn summary failed ${event.done}/${event.total}: ${event.rangeStartMessageId} -> ${event.rangeEndMessageId}.`
          );
          await saveProgress();
        }
      });
      if (Object.keys(assistantSummaries).length > 0) {
        finalPlan = buildBoundaryContextPlan(input.messages, {
          contextLimit,
          force: true,
          assistantSummaries,
          triggerRatio: profile.triggerPercent / 100,
          targetRatio: profile.targetPercent / 100,
          recentToolResultBudgetTokens: profile.recentToolTokens,
          providerReportedTokens: reportedCurrentTokens,
          priorPlan: input.state.boundary.activePlan ?? void 0
        }) ?? plan;
      }
      setBoundaryStage(
        input.state,
        summaryStage,
        "completed",
        `${Object.keys(assistantSummaries).length}/${plan.summaryJobs.length} summaries accepted`
      );
      updateBoundaryCounters(input.state, {
        currentTokens: finalPlan.afterPruneTokens,
        stageClearedTokens: Math.max(0, plan.beforeTokens - finalPlan.afterPruneTokens),
        clearedTokens: Math.max(0, finalPlan.beforeTokens - finalPlan.afterPruneTokens)
      });
      const finalPrefixStage = finalPlan.stages.find((stage) => stage.name === "prefix-summary");
      if (finalPrefixStage) {
        setBoundaryStage(
          input.state,
          "prefix-summary",
          finalPrefixStage.status === "failed" ? "failed" : "completed",
          finalPrefixStage.clearedTokens > 0 ? `Cleared ${formatCompactTokens(finalPrefixStage.clearedTokens)}` : "Applied",
          {
            beforeTokens: finalPrefixStage.beforeTokens,
            afterTokens: finalPrefixStage.afterTokens,
            clearedTokens: finalPrefixStage.clearedTokens,
            changedMessages: finalPrefixStage.changedMessages,
            changedParts: finalPrefixStage.changedParts
          }
        );
      } else {
        setBoundaryStage(input.state, "prefix-summary", "skipped", "Not needed");
      }
      await saveProgress();
    }
    setBoundaryStage(input.state, "store", "running", "Persisting virtual context plan");
    await saveProgress();
    storeBoundaryPlan(input.state, finalPlan, input.messages);
    updateBoundaryCounters(input.state, {
      afterTokens: finalPlan.afterPruneTokens,
      currentTokens: finalPlan.afterPruneTokens,
      targetTokens: finalPlan.targetTokens,
      clearedTokens: Math.max(0, finalPlan.beforeTokens - finalPlan.afterPruneTokens)
    });
    setBoundaryStage(input.state, "store", "completed", "Virtual context plan stored");
    appendBoundaryLog(input.state, "Stored Better Compact plan for future model requests.");
    await saveProgress();
    setBoundaryStage(input.state, "report", "running", "Publishing final report");
    await saveProgress();
    await sendIgnoredMessage(
      input.client,
      input.sessionId,
      formatBoundaryReport(finalPlan, getCurrentTokenUsage(input.state, input.messages)),
      params,
      input.logger
    );
    setBoundaryStage(input.state, "report", "completed", "Final report published");
    completeBoundaryJob(input.state, "Complete");
    await saveSessionState(input.state, input.logger);
    input.logger.info("Better Compact virtual compaction plan stored", {
      sessionId: input.sessionId,
      rangeHash: finalPlan.rangeHash,
      requiresCustomCompaction: finalPlan.requiresCustomCompaction
    });
  } catch (error) {
    input.state.boundary.activePlan = previousActivePlan;
    const message = error instanceof Error ? error.message : String(error);
    appendBoundaryLog(input.state, `Failed: ${message}`);
    failBoundaryJob(input.state, message);
    await saveSessionState(input.state, input.logger).catch(() => {
    });
    await sendIgnoredMessage(input.client, input.sessionId, `Better Compact failed: ${message}`, params, input.logger);
    throw error;
  }
}
function validBoundaryJobId(value) {
  return typeof value === "string" && /^bc_[a-zA-Z0-9]{1,64}$/.test(value) ? value : void 0;
}
function validBoundaryJobStartedAt(value) {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0 ? value : void 0;
}
function validBoundaryCounter(value) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= Number.MAX_SAFE_INTEGER ? value : void 0;
}
function validSummaryVariant(value) {
  return typeof value === "string" && /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,63}$/.test(value) ? value : void 0;
}
function formatCompactTokens(tokens) {
  if (tokens >= 1e3) return `${(tokens / 1e3).toFixed(1).replace(/\.0$/, "")}K`;
  return String(tokens);
}
function createTextCompleteHandler() {
  return async (_input, output) => {
    output.text = stripHallucinationsFromString(output.text);
  };
}
function createEventHandler(runtime, logger) {
  return async (input) => {
    if (input.event.type === "session.compacted") {
      const sessionId = input.event.properties?.sessionID;
      const state = typeof sessionId === "string" ? runtime.peek(sessionId) : void 0;
      if (!state) return;
      state.boundary.activePlan = null;
      state.boundary.job = null;
      await saveSessionState(state, logger).catch((error) => {
        logger.warn("Failed to persist state reset after native compaction", {
          error: error instanceof Error ? error.message : String(error)
        });
      });
      return;
    }
    if (input.event.type === "session.deleted") {
      const sessionId = input.event.properties?.info?.id;
      if (typeof sessionId === "string") runtime.evict(sessionId);
    }
  };
}

// lib/auth.ts
function isSecureMode() {
  return !!process.env.OPENCODE_SERVER_PASSWORD;
}
function getAuthorizationHeader() {
  const password = process.env.OPENCODE_SERVER_PASSWORD;
  if (!password) return void 0;
  const username = process.env.OPENCODE_SERVER_USERNAME ?? "opencode";
  const credentials = Buffer.from(`${username}:${password}`).toString("base64");
  return `Basic ${credentials}`;
}
function configureClientAuth(client) {
  const authHeader = getAuthorizationHeader();
  if (!authHeader) {
    return client;
  }
  const innerClient = client._client || client.client;
  if (innerClient?.interceptors?.request) {
    innerClient.interceptors.request.use((request) => {
      if (!request.headers.has("Authorization")) {
        request.headers.set("Authorization", authHeader);
      }
      return request;
    });
  }
  return client;
}

// lib/update.ts
import { readFile as readFile2, rm as rm2 } from "fs/promises";
import { basename, dirname as dirname3, join as join7 } from "path";
import { fileURLToPath } from "url";
var PACKAGE_NAME = "better-compact";
function startAutoUpdate(ctx, enabled) {
  if (!enabled) return;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 1e4);
  void checkAutoUpdate(controller.signal).then((result) => {
    if (!result.updated) return;
    setTimeout(() => {
      ctx.client.tui.showToast({
        body: {
          title: "Better Compact update ready",
          message: `Updated ${result.name} from ${result.current} to ${result.latest}. Restart OpenCode to finish.`,
          variant: "info",
          duration: 7e3
        }
      });
    }, 5e3);
  }).catch(() => {
  }).finally(() => clearTimeout(timeout));
}
async function checkAutoUpdate(signal) {
  const packageDir = await findPackageDir(PACKAGE_NAME);
  if (!packageDir) return { updated: false };
  const pkg = await readPackageJson(join7(packageDir, "package.json"));
  if (!pkg?.name || !pkg.version) return { updated: false };
  const latest = await fetchLatestVersion(pkg.name, signal);
  if (!latest || !isVersionNewer(latest, pkg.version)) return { updated: false };
  const removeDir = await updateRemoveDir(packageDir, pkg.name);
  if (!removeDir) return { updated: false };
  try {
    await rm2(removeDir, { recursive: true, force: true });
  } catch {
    return {
      updated: false,
      error: "remove_failed",
      name: pkg.name,
      current: pkg.version,
      latest
    };
  }
  return { updated: true, name: pkg.name, current: pkg.version, latest };
}
async function findPackageDir(name) {
  let dir = dirname3(fileURLToPath(import.meta.url));
  for (; ; ) {
    const pkg = await readPackageJson(join7(dir, "package.json"));
    if (pkg?.name === name) return dir;
    const parent = dirname3(dir);
    if (parent === dir) return void 0;
    dir = parent;
  }
}
async function updateRemoveDir(packageDir, name) {
  const packageParent = dirname3(packageDir);
  const nodeModulesDir = basename(packageParent).startsWith("@") ? dirname3(packageParent) : packageParent;
  if (basename(nodeModulesDir) !== "node_modules") return void 0;
  const wrapperDir = dirname3(nodeModulesDir);
  const wrapperPkg = await readPackageJson(join7(wrapperDir, "package.json"));
  const spec = wrapperSpec(wrapperDir, name) ?? wrapperPkg?.dependencies?.[name];
  if (!spec || !isAutoUpdatableSpec(spec)) return void 0;
  return wrapperDir;
}
function wrapperSpec(wrapperDir, name) {
  if (name.startsWith("@")) {
    const [scope, pkg] = name.split("/");
    if (!scope || !pkg || basename(dirname3(wrapperDir)) !== scope) return void 0;
    const prefix2 = `${pkg}@`;
    const base2 = basename(wrapperDir);
    return base2.startsWith(prefix2) ? base2.slice(prefix2.length) : void 0;
  }
  const prefix = `${name}@`;
  const base = basename(wrapperDir);
  return base.startsWith(prefix) ? base.slice(prefix.length) : void 0;
}
function isAutoUpdatableSpec(spec) {
  const value = spec.trim();
  if (!value) return false;
  if (value === "latest" || value === "*") return true;
  if (/^[~^]/.test(value)) return true;
  if (/^(?:>=|>|<=|<)/.test(value)) return true;
  if (/\s+(?:\|\||-|[<>=])\s+/.test(value)) return true;
  return false;
}
async function readPackageJson(path) {
  try {
    const data = JSON.parse(await readFile2(path, "utf-8"));
    return data && typeof data === "object" ? data : void 0;
  } catch {
    return void 0;
  }
}
async function fetchLatestVersion(name, signal) {
  try {
    const response = await fetch(
      `https://registry.npmjs.org/${encodeURIComponent(name)}/latest`,
      {
        signal
      }
    );
    if (!response.ok) return void 0;
    const data = await response.json();
    if (!data || typeof data !== "object") return void 0;
    const version = data.version;
    return typeof version === "string" ? version : void 0;
  } catch {
    return void 0;
  }
}
function isVersionNewer(latest, current) {
  const next = parseVersion(latest);
  const prev = parseVersion(current);
  if (!next || !prev) return false;
  for (let i = 0; i < 3; i++) {
    if (next.parts[i] !== prev.parts[i]) return next.parts[i] > prev.parts[i];
  }
  if (!next.pre.length && prev.pre.length) return true;
  if (next.pre.length && !prev.pre.length) return false;
  for (let i = 0; i < Math.max(next.pre.length, prev.pre.length); i++) {
    const a = next.pre[i];
    const b = prev.pre[i];
    if (a === void 0) return false;
    if (b === void 0) return true;
    if (a === b) continue;
    const aNumber = /^\d+$/.test(a) ? Number(a) : void 0;
    const bNumber = /^\d+$/.test(b) ? Number(b) : void 0;
    if (aNumber !== void 0 && bNumber !== void 0) return aNumber > bNumber;
    if (aNumber !== void 0) return false;
    if (bNumber !== void 0) return true;
    return a > b;
  }
  return false;
}
function parseVersion(version) {
  const match = version.match(/^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+.+)?$/);
  if (!match) return void 0;
  return {
    parts: [Number(match[1]), Number(match[2]), Number(match[3])],
    pre: match[4]?.split(".") ?? []
  };
}

// index.ts
var RUNTIME_REGISTRY = /* @__PURE__ */ Symbol.for("better-compact.server.instances");
function registerServerInstance(client, directory) {
  const root = globalThis;
  root[RUNTIME_REGISTRY] ??= /* @__PURE__ */ new WeakMap();
  const directories = root[RUNTIME_REGISTRY].get(client) ?? /* @__PURE__ */ new Set();
  if (directories.has(directory)) return false;
  directories.add(directory);
  root[RUNTIME_REGISTRY].set(client, directories);
  return true;
}
var server = (async (ctx) => {
  const loadConfig = () => getConfig(ctx, { warnings: false });
  const config = getConfig(ctx);
  if (!config.enabled) {
    return {};
  }
  if (!registerServerInstance(ctx.client, ctx.directory)) {
    try {
      await ctx.client.tui.showToast({
        body: {
          title: "Duplicate Better Compact plugin",
          message: "Remove the duplicate local or npm plugin entry and restart OpenCode.",
          variant: "warning",
          duration: 7e3
        }
      });
    } catch {
    }
    return {};
  }
  const logger = new Logger(config.debug);
  await Promise.all([
    secureSessionStorage(),
    securePrivateTree(join8(ctx.directory, ".opencode", "better-compact"))
  ]);
  const runtime = createRuntimeState(ctx.client, logger);
  const hostPermissions = {
    global: void 0,
    agents: {}
  };
  if (isSecureMode()) {
    configureClientAuth(ctx.client);
  }
  logger.info("Better Compact initialized");
  startAutoUpdate(ctx, config.autoUpdate);
  return {
    "experimental.chat.system.transform": createSystemPromptHandler(runtime, logger, config),
    "experimental.chat.messages.transform": createChatMessageTransformHandler(
      ctx.client,
      runtime,
      logger,
      config,
      hostPermissions,
      ctx.directory,
      loadConfig
    ),
    "experimental.text.complete": createTextCompleteHandler(),
    "chat.message": createChatMessageHandler(
      ctx.client,
      runtime,
      logger,
      config,
      ctx.directory,
      hostPermissions,
      loadConfig
    ),
    "command.execute.before": createCommandExecuteHandler(
      ctx.client,
      runtime,
      logger,
      config,
      ctx.directory,
      hostPermissions,
      loadConfig
    ),
    event: createEventHandler(runtime, logger),
    tool: {},
    config: async (opencodeConfig) => {
      if (config.compress.permission !== "deny" && compressDisabledByOpencode(opencodeConfig.permission)) {
        config.compress.permission = "deny";
      }
      const mutableConfig = opencodeConfig;
      mutableConfig.compaction = {
        ...mutableConfig.compaction,
        auto: false
      };
      hostPermissions.global = opencodeConfig.permission;
      hostPermissions.agents = Object.fromEntries(
        Object.entries(opencodeConfig.agent ?? {}).map(([name, agent]) => [
          name,
          agent?.permission
        ])
      );
    }
  };
});
var index_default = server;
export {
  index_default as default
};
