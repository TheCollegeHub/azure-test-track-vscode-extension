# Change Log

## 1.1.0
### Added

- **Python support:** The extension now recognizes test functions in Python, specifically those defined with `def test_`.
    - Added mechanism to detect `def test_` pattern for Python files.
    - Now extracts the test case name from Python methods (e.g., `def test_scenario_title`).

### Improved
- **Test name extraction:** Enhanced test name extraction to support both JavaScript/TypeScript (`test() or it()`) and Python (`def test_`).

## 1.0.0

Initial release of azure-test-track-vscode-extension with basic functionality to associate tests with Azure DevOps test cases.

