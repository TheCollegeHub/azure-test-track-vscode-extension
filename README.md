# Azure Test Track - Extension (VS CODE)

It is an extension designed to simplify the integration between your automated tests and Azure DevOps. It allows you to easily associate your tests with Azure DevOps test cases, automatically populating the Associated Automation tab with all relevant information and updating the automation status to Automated. This tool aims to enhance traceability and efficiency in the testing process, ensuring quick and accurate linking between code and tests in Azure DevOps.

To know more about the full package of `azure-test-track` and know more things you can do, please, check this link: [azure-test-track](https://github.com/TheCollegeHub/azure-test-track)

## Features

The azure-test-track extension provides functionalities for associating automated tests with Azure DevOps test cases. It offers two different commands for associating tests with Azure DevOps:

- Associate Test Case (Auto): Automatically associates the test case based on the test name extracted from the code.
- Associate Test Case (Custom): Manually associate the test case by entering the test name and ID.

### Features:
- Automatically associates test cases with the related automation code.
- Supports associating test cases based on pre-defined automation test names.
- Allows users to manually associate tests by specifying the test case ID and name.
- Supports multiple test types: Unit, Component, and E2E.
- Provides a convenient way to integrate with Azure DevOps and track test cases.

    Tip: You can use this extension to streamline your testing process in Azure DevOps, improving the traceability and automation of test management.

## Requirements

This extension has the following requirements:

VS Code version: 1.95 or later.
Azure DevOps Setup: Ensure you have the following environment variables set up for Azure DevOps:
- ADO_ORGANIZATION
- ADO_PROJECT
- ADO_PERSONAL_ACCESS_TOKEN
- ADO_COMPANY_EMAIL

## How to Use
To associate a test case manually, follow these steps:

### Option 1
1. **Select the test line:** Click on the line where your test case is defined, which should start with test( or it(.

2. **Right-click and select the command:** Right-click the selected line and choose the `Associate Test to Azure DevOps using Test Name` option from the context menu to manually associate the test filling the Test Case ID and Test Case Type.

### Option 2
1. **Use the command palette:** Alternatively, press Ctrl+Shift+P (Windows/Linux) or Cmd+Shift+P (macOS), type `Associate Test to Azure DevOps filling Test Name`, and select the command to manually enter all necessary information for the association.

2. **Fill in the details:** A series of prompts will appear asking you to:

    - Enter the Test Case ID in Azure DevOps.
    - Provide the Test Case Name.
    - Choose the type of test (Unit, Component, or E2E).

After filling in all the details, the extension will associate the test case with the specified automation code.

**Note:** In your Azure Devops Test Case, the `Associated Automation` tab will be filled with all this informations and the `Automation Status` will be changed by `Automated`.

## Known Issues

- Currently, the extension only supports associating tests based on text patterns such as `test(`, `it(` or `def test_` - *if you see it works for javascript, typescript and python* - for filling Test Case Name automatically but you can still use this extension and fill the name manually through command `Associate Test to Azure DevOps filling Test Name`  
- There may be issues with environment variable configurations not being recognized when VS Code is run in certain environments.

## Release Notes

See the [ChangeLog](CHANGELOG.md)

-----
**Enjoy!**
