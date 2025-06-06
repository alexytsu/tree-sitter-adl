import XCTest
import SwiftTreeSitter
import TreeSitterAdl

final class TreeSitterAdlTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_adl())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading ADL grammar")
    }
}
