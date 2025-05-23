import valueParser from 'postcss-value-parser';
import type { FunctionNode, Node, WordNode } from 'postcss-value-parser';
import type { Declaration, Result } from 'postcss';
import { pluginOptions } from './index';
export declare function isVarNode(node: Node): boolean;
export declare function validateArgumentsAndTypes(node: FunctionNode, decl: Declaration, result: Result, options: pluginOptions): valueParser.Dimension[] | undefined;
export declare function optionallyWarn(decl: Declaration, result: Result, message: string, options: pluginOptions): void;
export declare function functionNodeToWordNode(fn: FunctionNode): WordNode;
eclare function filterOnlyWords(node: Node): boolean;
/**
 * Try to compute a calculation from a Node.
 *
 * This validates that the calculation has a valid order which is:
 * - `{Number} {Operation} {Number} ...`
 *
 * Only basic arithmetic operations are allowed, and it has to be separate words
 * similarly to how CSS calc works:
 *
 * - `sin(3.14159 * 2)` -> is valid
 * - `sin(3.14159*2)` -> is not valid
 *
 *
 * @param {FunctionNode} nodes Nodes to be parsed
 * @param {Boolean} ignoreUnit Whether units are ignored or converted to radians
 * @return {FunctionNode} Returns the node, if it managed to calculate, it will
 * simplify inner nodes.
 * @see https://www.w3.org/TR/css-values-4/#trig-funcs
 */
export declare function computeCalculation(nodes: Node[], ignoreUnit?: boolean): Node[];
export declare function functionNodeToWordNode(fn: FunctionNode): WordNode;
/**
 * Formats a number that's intended to be put into CSS.
 *
 * Due to processing of Number(number.toFixed(decimals)) this will get
 * rid of ending zeroes, usually helping with the rounding which is the
 * intended effect.
 *
 * For example, converting 4.71238898038469 radians into deg leads to
 * 270.000000000669786 which is going to result as 270 unless a
 * precision of 10 is chosen.
 *
 * @param {Number} number Number to be formatted
 * @param {Number} decimals Precision of decimals, CSS doesn't usually handle further than 5.
 */
export declare function formatResultingNumber(number: number, decimals: number): string;
export declare function parseNumber(value: string): false | {
    number: any;
    unit: string;
};
declare type validateNodeReturn = [WordNode, number] | undefined;
export declare function validateNode(node: FunctionNode, parseUnit?: boolean): validateNodeReturn;
export { toRad, toDeg };
