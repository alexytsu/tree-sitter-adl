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

    definition_preamble: ($) => repeat1(choice($.annotation, $.docstring)),

    module_definition: ($) =>
      seq(
        optional($.definition_preamble),
        "module",
        $.scoped_name,
        $.module_body
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
        "};"
      ),

    import_declaration: ($) => seq("import", $.import_path, ";"),

    import_path: ($) => seq($.scoped_name, optional(".*")),

    type_name: ($) => $.identifier,

    type_parameters: ($) =>
      seq("<", $.scoped_name, repeat(seq(",", $.scoped_name)), ">"),

    type_expression: ($) =>
      choice(
        $.primitive_type,
        $.scoped_name,
        seq($.scoped_name, $.type_arguments)
      ),

    type_arguments: ($) =>
      seq("<", $.type_expression, repeat(seq(",", $.type_expression)), ">"),

    primitive_type: ($) =>
      choice(
        "Int8",
        "Int16",
        "Int32",
        "Int64",
        "Word8",
        "Word16",
        "Word32",
        "Word64",
        "Bool",
        "Void",
        "Float",
        "Double",
        "String",
        "Bytes",
        "Json",
        seq("Vector", $.type_arguments),
        seq("StringMap", $.type_arguments),
        seq("Nullable", $.type_arguments),
        seq("TypeToken", $.type_arguments)
      ),

    newtype_definition: ($) =>
      seq(
        optional($.definition_preamble),
        "newtype",
        $.type_name,
        optional($.type_parameters),
        "=",
        $.type_expression,
        optional(seq("=", $.json_value)),
        ";"
      ),

    type_definition: ($) =>
      seq(
        optional($.definition_preamble),
        "type",
        $.type_name,
        optional($.type_parameters),
        "=",
        $.type_expression,
        ";"
      ),

    struct_definition: ($) =>
      seq(
        optional($.definition_preamble),
        "struct",
        $.type_name,
        optional($.type_parameters),
        $.field_block
      ),

    union_definition: ($) =>
      seq(
        optional($.definition_preamble),
        "union",
        $.type_name,
        optional($.type_parameters),
        $.field_block
      ),

    field_block: ($) => seq("{", repeat($.field), "};"),

    field: ($) =>
      seq(
        optional($.definition_preamble),
        $.type_expression,
        $.identifier,
        optional(seq("=", $.json_value)),
        ";"
      ),

    annotation: ($) => seq("@", $.scoped_name, optional($.json_value)),

    annotations: ($) => repeat1($.annotation),

    annotation_declaration: ($) =>
      seq(
        optional($.definition_preamble),
        "annotation",
        seq($.scoped_name, repeat(seq("::", $.field_reference))),
        $.scoped_name,
        $.json_value,
        ";"
      ),

    field_reference: ($) => seq($.identifier),

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
