/**
 * @file A tree-sitter grammar for Algebraic Data Language (ADL)
 * @author Alex Su <alexanderytsu@gmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: "adl",

  rules: {
    // TODO: add the actual grammar rules
    source_file: $ => "hello"
  }
});
