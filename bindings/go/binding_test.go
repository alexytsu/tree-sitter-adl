package tree_sitter_adl_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_adl "github.com/adl-lang/tree-sitter-adl/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_adl.Language())
	if language == nil {
		t.Errorf("Error loading ADL grammar")
	}
}
