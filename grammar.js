/**
 * @file A tree-sitter grammar for Algebraic Data Language (ADL)
 * @author Alex Su <alexanderytsu@gmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: "adl",

  extras: ($) => [$.comment, /\s/],

  word: ($) => $.identifier,

  rules: {
    source_file: ($) => optional($.module_definition),

    scoped_name: ($) => seq($.identifier, repeat(seq(".", $.identifier))),

    definition_preamble: ($) =>
      repeat1(choice($.annotation_decorator, $.docstring)),

    module_definition: ($) =>
      seq(
        optional($.definition_preamble),
        "module",
        field("name", $.scoped_name),
        field("body", $.module_body),
        optional(";")
      ),

    module_body: ($) =>
      seq(
        "{",
        repeat(
          choice(
            $.import_declaration,
            $.annotation_declaration,
            $.type_definition,
            $.newtype_definition,
            $.struct_definition,
            $.union_definition
          )
        ),
        "}"
      ),

    import_declaration: ($) =>
      seq("import", field("path", $.import_path), optional(";")),

    import_path: ($) => seq($.scoped_name, optional(".*")),

    type_name: ($) => $.identifier,

    version: ($) => token(seq("#", /\d+/)),

    type_parameters: ($) =>
      seq("<", $.identifier, repeat(seq(",", $.identifier)), ">"),

    type_expression: ($) =>
      seq(
        field("name", $.scoped_name),
        optional(field("arguments", $.type_arguments))
      ),

    type_arguments: ($) =>
      seq("<", $.type_expression, repeat(seq(",", $.type_expression)), ">"),

    newtype_definition: ($) =>
      seq(
        optional($.definition_preamble),
        "newtype",
        field("name", $.type_name),
        optional(field("version", $.version)),
        optional(field("parameters", $.type_parameters)),
        "=",
        field("type", $.type_expression),
        optional(seq("=", field("default", $.json_value))),
        optional(";")
      ),

    type_definition: ($) =>
      seq(
        optional($.definition_preamble),
        "type",
        field("name", $.type_name),
        optional(field("version", $.version)),
        optional(field("parameters", $.type_parameters)),
        "=",
        field("type", $.type_expression),
        optional(";")
      ),

    struct_definition: ($) =>
      seq(
        optional($.definition_preamble),
        "struct",
        field("name", $.type_name),
        optional(field("version", $.version)),
        optional(field("parameters", $.type_parameters)),
        field("body", $.field_block),
        optional(";")
      ),

    union_definition: ($) =>
      seq(
        optional($.definition_preamble),
        "union",
        field("name", $.type_name),
        optional(field("version", $.version)),
        optional(field("parameters", $.type_parameters)),
        field("body", $.field_block),
        optional(";")
      ),

    field_block: ($) => seq("{", repeat($.field), "}"),

    field: ($) =>
      seq(
        optional($.definition_preamble),
        field("type", $.type_expression),
        field("name", $.field_name),
        optional(seq("=", field("default", $.json_value))),
        optional(";")
      ),

    field_name: ($) => $.identifier,

    annotation_decorator: ($) =>
      seq("@", field("name", $.scoped_name), optional(field("value", $.json_value))),

    annotation_declaration: ($) =>
      seq(
        "annotation",
        field("target", $.scoped_name),
        optional(seq("::", field("field", $.field_name))),
        field("type", $.scoped_name),
        field("value", $.json_value),
        optional(";")
      ),

    comment: ($) => seq("//", /[^\n]*/),

    docstring: ($) => seq("///", /[^\n]*/),

    json_value: ($) =>
      choice(
        "null",
        "true",
        "false",
        $.json_number,
        $.json_string,
        $.json_array,
        $.json_object
      ),

    json_number: ($) => /-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/,

    json_string: ($) =>
      token(
        seq(
          '"',
          repeat(
            choice(
              /[^"\\]/,
              seq(
                "\\",
                choice(
                  '"',
                  "\\",
                  "/",
                  "b",
                  "f",
                  "n",
                  "r",
                  "t",
                  seq("u", /[0-9a-fA-F]{4}/)
                )
              )
            )
          ),
          '"'
        )
      ),

    json_array: ($) =>
      seq(
        "[",
        optional(seq($.json_value, repeat(seq(",", $.json_value)))),
        "]"
      ),

    json_object: ($) =>
      seq(
        "{",
        optional(seq($.json_object_pair, repeat(seq(",", $.json_object_pair)))),
        "}"
      ),

    json_object_pair: ($) => seq($.json_string, ":", $.json_value),

    identifier: ($) => /[a-zA-Z][a-zA-Z0-9_]*/,
  },
});
