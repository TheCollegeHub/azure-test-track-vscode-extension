# Change Log
## 1.2.0

### **New Features** 

### **Command for Associating Tests:**

A new command has been added to automatically associate automated tests with code blocks based on the comment containing the `ADO_IDs: TC_1234, TC_4321` pattern. The command scans the code, finds the mentioned test IDs and associates them to **Azure Test Case**.


To associate tests with a code block, insert a comment like:

Javascript/Typescript
```javascript
// ADO_IDs: TC_1234, TC_5678
test('Your Scenario Name', async () => {
  // Your Code Here
});

// Or 

// ADO_IDs: TC_1234, TC_5678
it('Your Scenario Name', async () => {
  // Your Code Here
});
``` 

Python
```python
# ADO_IDs: TC_1234, TC_5678 (Could be here)
@pytest.mark.parametrize("input, expected", [
    (1, 2),
    (2, 4), 
])
# ADO_IDs: TC_1234, TC_5678 (Or Could be here)
def test_scenario_name(page: Page):
    ## Your Code Hwere
```
This indicates that the tests with IDs TC_1234 and TC_5678 can be associated to Azure Test Case easier via `Associate IDs from Comments` command.

**How to Use:**

1. In the test file, add the ***comments*** with the test IDs in the format `ADO_IDs: TC_1234, TC_5678` above the test function.
2. Run the `Associate IDs from Comments` command in VS Code and select the `Test Type`.
    - The system will look for comments with the ***ADO_IDs*** pattern and automatically associate the automated tests with the corresponding IDs to ***Azure Test Case***.


### **Visualizing Associations:**

Test lines with associated tests will be highlighted with a green decoration showing `✓ Associated (TC_1234, TC_4321)` next to the line.
Code lines without associated tests will be highlighted with a red decoration showing `✗ Unassociated (TC_9876)`.
The associations are visually displayed within the editor, making it easy to see which lines are already associated with some **Azure Test Case.**

**How to Use:**

1. In the test file, run the `View/Hide All Associated Automated Tests` command.
2. Look at your code. Lines of code associated with test cases will have a green indicator `✓ Associated`, and unassociated lines will have a red indicator `✗ Unassociated`.
3. To Hide the labels that is being displayed, run the `View/Hide All Associated Automated Tests` command again.

**Note:** If you update the content (e.g., add new comments or modify the existing associations), the decorations may not immediately reflect the changes.
To refresh and view the updated associations, use the `View/Hide All Associated Automated Tests` command again. This will ensure that the editor correctly refreshes the state and displays the new associations or updates. 

## 1.1.0
### Added

- **Python support:** The extension now recognizes test functions in Python, specifically those defined with `def test_`.
    - Added mechanism to detect `def test_` pattern for Python files.
    - Now extracts the test case name from Python methods (e.g., `def test_scenario_title`).

### Improved
- **Test name extraction:** Enhanced test name extraction to support both JavaScript/TypeScript (`test() or it()`) and Python (`def test_`).

## 1.0.0

Initial release of azure-test-track-vscode-extension with basic functionality to associate tests with Azure DevOps test cases.

