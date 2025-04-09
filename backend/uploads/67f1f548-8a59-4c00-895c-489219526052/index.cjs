"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.convertError = convertError;
exports.convertFile = convertFile;
const convertTokens = require("./convertTokens.cjs");
const convertComments = require("./convertComments.cjs");
const convertAST = require("./convertAST.cjs");
function convertFile(ast, code, tokLabels, visitorKeys) {
  ast.tokens = convertTokens(ast.tokens, code, tokLabels);
  convertComments(ast.comments);
  convertAST(ast, visitorKeys);
  return ast;
}
function convertError(err) {
  if (err instanceof SyntaxError) {
    err.lineNumber = err.loc.line;
    err.column = err.loc.column;
  }
  return err;
}

//# sourceMappingURL=index.cjs.map
ge", _asyncToGenerator(function* ({
  signal,
  port,
  action,
  payload
}) {
  let response;
  try {
    if (babel.init) yield babel.init;
    response = {
      result: yield handleMessage(action, payload)
    };
  } catch (error) {
    response = {
      error,
      errorData: Object.assign({}, error)
    };
  }
  try {
    port.postMessage(response);
  } catch (_unused) {
    port.postMessage({
      error: new Error("Cannot serialize worker response")
    });
  } finally {
    port.close();
    Atomics.store(signal, 0, 1);
    Atomics.notify(signal, 0);
  }
}));

//# sourceMappingURL=index.cjs.map
