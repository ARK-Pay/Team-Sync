import type { RuleModule } from '../../ts-eslint/Rule';
import * as BaseRuleTester from '../../ts-eslint/RuleTester';
import type { DependencyConstraint } from './dependencyConstraints';
declare const TS_ESLINT_PARSER = "@typescript-eslint/parser";
type RuleTesterConfig = Omit<BaseRuleTester.RuleTesterConfig, 'parser'> & {
    parser: typeof TS_ESLINT_PARSER;
    /**
     * Constraints that must pass in the current environment for any tests to run
     */
    dependencyConstraints?: DependencyConstraint;
};
interface InvalidTestCase<TMessageIds extends string, TOptions extends Readonly<unknown[]>> extends BaseRuleTester.InvalidTestCase<TMessageIds, TOptions> {
    /**
     * Constraints that must pass in the current environment for the test to run
     */
    dependencyConstraints?: DependencyConstraint;
}
interface ValidTestCase<TOptions extends Readonly<unknown[]>> extends BaseRuleTester.ValidTestCase<TOptions> {
    /**
     * Constraints that must pass in the current environment for the test to run
     */
    dependencyConstraints?: DependencyConstraint;
}
interface RunTests<TMessageIds extends string, TOptions extends Readonly<unknown[]>> {
    readonly valid: readonly (ValidTestCase<TOptions> | string)[];
    readonly invalid: readonly InvalidTestCase<TMessageIds, TOptions>[];
}
type AfterAll = (fn: () => void) => void;
declare class RuleTester extends BaseRuleTester.RuleTester {
    #private;
    /**
     * If you supply a value to this property, the rule tester will call this instead of using the version defined on
     * the global namespace.
     */
    static get afterAll(): AfterAll;
    static set afterAll(value: AfterAll | undefined);
    private get staticThis();
    constructor(baseOptions: RuleTesterConfig);
    private getFilename;
    run<TMessageIds extends string, TOptions extends Readonly<unknown[]>>(name: string, rule: RuleModule<TMessageIds, TOptions>, testsReadonly: RunTests<TMessageIds, TOptions>): void;
}
/**
 * Simple no-op tag to mark code samples as "should not format with prettier"
 *   for the internal/plugin-test-formatting lint rule
 */
declare function noFormat(raw: TemplateStringsArray, ...keys: string[]): string;
export { noFormat, RuleTester };
export type { InvalidTestCase, ValidTestCase, RunTests };
//# sourceMappingURL=RuleTester.d.ts.map */
    readonly output?: string | null;
}
interface TestCaseError<TMessageIds extends string> {
    /**
     * The 1-based column number of the reported start location.
     */
    readonly column?: number;
    /**
     * The data used to fill the message template.
     */
    readonly data?: Readonly<Record<string, unknown>>;
    /**
     * The 1-based column number of the reported end location.
     */
    readonly endColumn?: number;
    /**
     * The 1-based line number of the reported end location.
     */
    readonly endLine?: number;
    /**
     * The 1-based line number of the reported start location.
     */
    readonly line?: number;
    /**
     * Reported message ID.
     */
    readonly messageId: TMessageIds;
    /**
     * Reported suggestions.
     */
    readonly suggestions?: readonly SuggestionOutput<TMessageIds>[] | null;
    /**
     * The type of the reported AST node.
     */
    readonly type?: AST_NODE_TYPES | AST_TOKEN_TYPES;
}
/**
 * @param text a string describing the rule
 * @param callback the test callback
 */
type RuleTesterTestFrameworkFunction = (text: string, callback: () => void) => void;
interface RunTests<TMessageIds extends string, TOptions extends Readonly<unknown[]>> {
    readonly valid: readonly (ValidTestCase<TOptions> | string)[];
    readonly invalid: readonly InvalidTestCase<TMessageIds, TOptions>[];
}
interface RuleTesterConfig extends Linter.Config {
    readonly parser: string;
    readonly parserOptions?: Readonly<ParserOptions>;
}
declare class RuleTesterBase {
    /**
     * Creates a new instance of RuleTester.
     * @param testerConfig extra configuration for the tester
     */
    constructor(testerConfig?: RuleTesterConfig);
    /**
     * Adds a new rule test to execute.
     * @param ruleName The name of the rule to run.
     * @param rule The rule to test.
     * @param test The collection of tests to run.
     */
    run<TMessageIds extends string, TOptions extends Readonly<unknown[]>>(ruleName: string, rule: RuleModule<TMessageIds, TOptions>, tests: RunTests<TMessageIds, TOptions>): void;
    /**
     * If you supply a value to this property, the rule tester will call this instead of using the version defined on
     * the global namespace.
     */
    static get describe(): RuleTesterTestFrameworkFunction;
    static set describe(value: RuleTesterTestFrameworkFunction | undefined);
    /**
     * If you supply a value to this property, the rule tester will call this instead of using the version defined on
     * the global namespace.
     */
    static get it(): RuleTesterTestFrameworkFunction;
    static set it(value: RuleTesterTestFrameworkFunction | undefined);
    /**
     * If you supply a value to this property, the rule tester will call this instead of using the version defined on
     * the global namespace.
     */
    static get itOnly(): RuleTesterTestFrameworkFunction;
    static set itOnly(value: RuleTesterTestFrameworkFunction | undefined);
    /**
     * Define a rule for one particular run of tests.
     */
    defineRule<TMessageIds extends string, TOptions extends Readonly<unknown[]>>(name: string, rule: RuleModule<TMessageIds, TOptions> | RuleCreateFunction<TMessageIds, TOptions>): void;
}
declare const RuleTester_base: typeof RuleTesterBase;
declare class RuleTester extends RuleTester_base {
}
export { InvalidTestCase, SuggestionOutput, RuleTester, RuleTesterConfig, RuleTesterTestFrameworkFunction, RunTests, TestCaseError, ValidTestCase, };
//# sourceMappingURL=RuleTester.d.ts.map