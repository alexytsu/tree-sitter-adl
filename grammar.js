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
    source_file: ($) =>  
      $.module_definition,

    module_definition: ($) =>
      seq("module", $.module_name, $.module_body),

    module_name: ($) =>
      $.identifier,

    module_body: ($) =>
      seq(
        "{", 
        repeat(
          choice(
            $.struct_definition,
            $.union_definition,
            $.type_definition
          )
        ), 
        "};"
      ),

    type_definition: ($) =>
      seq("type", $.type_name, "=", $.type_body, ";"),

    type_name: ($) =>
      $.identifier,

    type_body: ($) =>
      $.identifier,

    struct_definition: ($) =>
      seq("struct", $.struct_name, $.struct_body),

    struct_name: ($) => 
      $.identifier,

    struct_body: ($) =>
      seq("{", repeat($.struct_field), "};"),

    struct_field: ($) => 
      seq($.field_type, $.field_name, ";"),

    union_definition: ($) =>
      seq("union", $.union_name, $.union_body),

    union_name: ($) =>
      $.identifier,

    union_body: ($) =>
      seq("{", repeat($.union_field), "};"),

    union_field: ($) =>
      seq($.field_type, $.field_name, ";"),

    field_type: ($) => 
      $.identifier,

    field_name: ($) => 
      $.identifier,

    identifier: ($) => /[a-zA-Z][a-zA-Z0-9_]*/,
  },
});
