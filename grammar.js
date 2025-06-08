/**
 * @file A tree-sitter grammar for Algebraic Data Language (ADL)
 * @author Alex Su <alexanderytsu@gmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: "adl",

  extras: ($) => [ $.comment, /\s/ ],

  conflicts: ($) => [
    [$.module_body, $.docstring_block],
  ],

  rules: {
    source_file: ($) =>  
      $.module_definition,

    module_definition: ($) =>
      seq("module", $.module_name, $.module_body),

    module_name: ($) =>
      prec.right(seq($.identifier, repeat(seq(".", $.identifier)))),

    module_body: ($) =>
      seq(
        "{", 
        repeat(
          choice(
            $.import_declaration,
            $.struct_definition,
            $.union_definition,
            $.type_definition,
            $.newtype_definition,
            $.annotation_declaration,
            $.docstring
          )
        ), 
        "};"
      ),

    import_declaration: ($) =>
      seq("import", $.import_path, ";"),

    import_path: ($) =>
      choice(
        seq($.module_name, ".*"),
        $.scoped_name,
        $.module_name
      ),

    scoped_name: ($) =>
      seq($.module_name, ".", $.identifier),

    type_definition: ($) =>
      seq(
        optional($.annotations),
        optional($.docstring_block),
        "type", 
        $.type_name, 
        optional($.type_parameters),
        "=", 
        $.type_expression, 
        ";"
      ),

    newtype_definition: ($) =>
      seq(
        optional($.annotations),
        optional($.docstring_block),
        "newtype", 
        $.type_name, 
        optional($.type_parameters),
        "=", 
        $.type_expression,
        optional(seq("=", $.json_value)),
        ";"
      ),

    type_name: ($) =>
      $.identifier,

    type_parameters: ($) =>
      seq("<", $.identifier, repeat(seq(",", $.identifier)), ">"),

    type_expression: ($) =>
      choice(
        $.primitive_type,
        $.scoped_name,
        $.identifier,
        seq($.scoped_name, $.type_arguments),
        seq($.identifier, $.type_arguments)
      ),

    type_arguments: ($) =>
      seq("<", $.type_expression, repeat(seq(",", $.type_expression)), ">"),

    primitive_type: ($) =>
      choice(
        "Int8", "Int16", "Int32", "Int64",
        "Word8", "Word16", "Word32", "Word64",
        "Bool", "Void", "Float", "Double",
        "String", "Bytes", "Json",
        seq("Vector", $.type_arguments),
        seq("StringMap", $.type_arguments),
        seq("Nullable", $.type_arguments),
        seq("TypeToken", $.type_arguments)
      ),

    struct_definition: ($) =>
      seq(
        optional($.annotations),
        optional($.docstring_block),
        "struct", 
        $.struct_name,
        optional($.type_parameters),
        $.struct_body
      ),

    struct_name: ($) => 
      $.identifier,

    struct_body: ($) =>
      seq("{", repeat($.struct_field), "};"),

    struct_field: ($) => 
      seq(
        optional($.annotations),
        optional($.docstring_block),
        $.field_type, 
        $.field_name,
        optional(seq("=", $.json_value)),
        ";"
      ),

    union_definition: ($) =>
      seq(
        optional($.annotations),
        optional($.docstring_block),
        "union", 
        $.union_name,
        optional($.type_parameters),
        $.union_body
      ),

    union_name: ($) =>
      $.identifier,

    union_body: ($) =>
      seq("{", repeat($.union_field), "};"),

    union_field: ($) =>
      seq(
        optional($.annotations),
        optional($.docstring_block),
        $.field_type, 
        $.field_name,
        optional(seq("=", $.json_value)),
        ";"
      ),

    field_type: ($) => 
      $.type_expression,

    field_name: ($) => 
      $.identifier,

    annotations: ($) =>
      repeat1($.annotation),

    annotation: ($) =>
      choice(
        seq("@", choice($.scoped_name, $.identifier), optional($.json_value)),
      ),

    annotation_declaration: ($) =>
      seq(
        optional($.docstring_block),
        "annotation",
        $.identifier,
        $.identifier,
        $.json_object,
        ";"
      ),

    comment: ($) =>
      seq("//", /[^\n]*/),

    docstring: ($) =>
      seq("///", /[^\n]*/),

    docstring_block: ($) =>
      repeat1($.docstring),

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

    json_number: ($) =>
      /-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/,

    json_string: ($) =>
      seq(
        '"',
        repeat(choice(
          /[^"\\]/,
          seq("\\", choice(
            '"', '\\', '/', 'b', 'f', 'n', 'r', 't',
            seq('u', /[0-9a-fA-F]{4}/)
          ))
        )),
        '"'
      ),

    json_array: ($) =>
      seq(
        "[",
        optional(seq(
          $.json_value,
          repeat(seq(",", $.json_value))
        )),
        "]"
      ),

    json_object: ($) =>
      seq(
        "{",
        optional(seq(
          $.json_object_pair,
          repeat(seq(",", $.json_object_pair))
        )),
        "}"
      ),

    json_object_pair: ($) =>
      seq($.json_string, ":", $.json_value),

    identifier: ($) => /[a-zA-Z][a-zA-Z0-9_]*/,
  },
});
