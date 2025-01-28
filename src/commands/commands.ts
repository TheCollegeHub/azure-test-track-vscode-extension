import * as vscode from 'vscode';
import { applyRelativePathToTestCaseName, extractTestCaseIds, extractTestCaseName, extractTestCaseNamesFromDocument } from './extractors';
import { getWorkItemById } from "@thecollege/azure-test-track";
import { associateTestCase } from './association';
import { associatedDecoration, unassociatedDecoration } from '../decorators/association-decoretor';
import { checkEnvironmentVariables } from '../utils/utils';
const testTypes = ['Unit', 'Component', "API", "E2E"];

const cache = new Map<string, { testCaseId: string; isAssociated: boolean }[]>();

export async function associateTestCaseCommand(editor: vscode.TextEditor) {
            const position = editor.selection.active;
    
            let testCaseName = extractTestCaseName(editor, position.line);
            if (!testCaseName) {
                vscode.window.showErrorMessage('Unable to extract test case name.');
                return;
            }
    
            const testCaseId = await vscode.window.showInputBox({ prompt: 'Enter the Test Case ID in Azure DevOps' });
            if (testCaseId === undefined) {
                return;
            }
    
            const testCaseType = await vscode.window.showQuickPick(testTypes, { placeHolder: 'Choose the Test Type' });
            if (testCaseType === undefined) {
                return;
            }
    
            if (!testCaseId || !testCaseName || !testCaseType) {
                vscode.window.showErrorMessage('Incomplete information. Association canceled.');
                return;
            }
    
            await associateTestCase(testCaseId, testCaseName, testCaseType);
    
}

export async function associateTestCaseCustomCommand() {
    const testCaseId = await vscode.window.showInputBox({ prompt: 'Enter the Test Case ID in Azure DevOps' });
    if (testCaseId === undefined) {
        return;
    }

    const testCaseName = await vscode.window.showInputBox({ prompt: 'Enter the Test Case Name in Azure DevOps' });
    if (testCaseId === undefined) {
        return;
    }

    const testCaseType = await vscode.window.showQuickPick(testTypes, { placeHolder: 'Choose the Test Type' });
    if (testCaseType === undefined) {
        return;
    }

    if (!testCaseId || !testCaseName || !testCaseType) {
        vscode.window.showErrorMessage('Incomplete information. Association canceled.');
        return;
    }

    await associateTestCase(testCaseId, testCaseName, testCaseType);
}

export async function associateTestCaseIdsFromComments(editor: vscode.TextEditor) {
    const testCaseNames = extractTestCaseNamesFromDocument(editor);

    if (testCaseNames.length === 0) {
        vscode.window.showErrorMessage('No test cases found in the file.');
        return;
    }

    console.log(testCaseNames);

    const testCaseType = await vscode.window.showQuickPick(testTypes, { placeHolder: 'Choose the Test Type' });
    if (testCaseType === undefined) {
        return;
    }


    for (const { testCaseName, lineNumber } of testCaseNames) {
        const testCaseIds = extractTestCaseIds(editor, lineNumber);

        if (!testCaseIds) {
            vscode.window.showErrorMessage(`No ADO_ID found above the test case '${testCaseName}'.`);
            continue;
        }

        for (const testCaseId of testCaseIds) {
            await associateTestCase(testCaseId, applyRelativePathToTestCaseName(editor, testCaseName)!, testCaseType);
        }

        vscode.window.showInformationMessage(`IDs successfully associated with the test case '${testCaseName}'.`);
    }
}

export async function setDecorationsForAssociatedAutomatedTests(editor: vscode.TextEditor) {
    const testCaseNames = extractTestCaseNamesFromDocument(editor);

    if (testCaseNames.length === 0) {
        vscode.window.showErrorMessage('No test cases found in the file.');
        return;
    }

    const associatedLines: vscode.Range[] = [];
    const unassociatedLines: vscode.Range[] = [];

    const processedTestCaseNames = new Set<string>();

    for (const { testCaseName, lineNumber } of testCaseNames) {
        if (processedTestCaseNames.has(testCaseName)) {
            continue;
        }

        processedTestCaseNames.add(testCaseName);

        const cacheEntries = cache.get(testCaseName) || [];

        const testCaseIds = extractTestCaseIds(editor, lineNumber);

        if (!testCaseIds) {
            vscode.window.showErrorMessage(`No ADO_ID found above the test case '${testCaseName}'.`);
            continue;
        }

        if (!cacheEntries.length) {
          
            testCaseIds?.forEach(testCaseId => {
                cacheEntries.push({ testCaseId, isAssociated: false });
            });
        }

        const statusPromises = testCaseIds!.map(async (testCaseId) => {
            checkEnvironmentVariables();
            const workItemInfo = await getWorkItemById(testCaseId);
            console.log(workItemInfo.value[0].fields["Microsoft.VSTS.TCM.AutomationStatus"]);

            const existingTestCase = cacheEntries.find(item => item.testCaseId === testCaseId);

            if (existingTestCase) {
                existingTestCase.isAssociated = workItemInfo.value[0].fields["Microsoft.VSTS.TCM.AutomationStatus"] === "Automated"; 
            }

            cache.set(testCaseName, [...cacheEntries]);

            if (existingTestCase && existingTestCase.isAssociated) {
                associatedLines.push(new vscode.Range(lineNumber, 0, lineNumber, 0));
            } else {
                unassociatedLines.push(new vscode.Range(lineNumber, 0, lineNumber, 0));
            }
        });

        await Promise.all(statusPromises);
    }

    if (associatedLines.length > 0) {
        const consolidatedDecorations = new Map<number, Set<string>>();

        associatedLines.forEach((range) => {
            const lineNumber = range.start.line;

        
            const testCaseName = extractTestCaseNamesFromDocument(editor).find(test => test.lineNumber === lineNumber)?.testCaseName;
            const cacheEntries = cache.get(testCaseName!);

            const associatedIds = cacheEntries?.filter(entry => entry.isAssociated).map(entry => entry.testCaseId) || [];

            if (consolidatedDecorations.has(lineNumber)) {
                const existingIds = consolidatedDecorations.get(lineNumber)!;
                associatedIds.forEach((id) => existingIds.add(id));
            } else {
                consolidatedDecorations.set(lineNumber, new Set(associatedIds));
            }
        });

        const decorations = Array.from(consolidatedDecorations.entries()).map(([lineNumber, idsSet]) => {
            const idsArray = Array.from(idsSet);
            return {
                range: new vscode.Range(lineNumber, 0, lineNumber, 0),
                renderOptions: {
                    after: { contentText: `✓ Associated (${idsArray.join(", ")})` }
                }
                
            };
        });

        editor.setDecorations(associatedDecoration, decorations);
    }
    
    
    if (unassociatedLines.length > 0) {
        const consolidatedUnassociatedDecorations = new Map<number, Set<string>>();
    
        unassociatedLines.forEach((range) => {
            const lineNumber = range.start.line;
    
            const testCaseName = extractTestCaseNamesFromDocument(editor).find(test => test.lineNumber === lineNumber)?.testCaseName;
            const cacheEntries = cache.get(testCaseName!);
    
            const unassociatedIds = cacheEntries?.filter(entry => !entry.isAssociated).map(entry => entry.testCaseId) || [];
    
            if (consolidatedUnassociatedDecorations.has(lineNumber)) {
                const existingIds = consolidatedUnassociatedDecorations.get(lineNumber)!;
                unassociatedIds.forEach((id) => existingIds.add(id));
            } else {
                consolidatedUnassociatedDecorations.set(lineNumber, new Set(unassociatedIds));
            }
        });
    
        const unassociatedDecorations = Array.from(consolidatedUnassociatedDecorations.entries()).map(([lineNumber, idsSet]) => {
            const idsArray = Array.from(idsSet);
            return {
                range: new vscode.Range(lineNumber, 0, lineNumber, 0),
                renderOptions: {
                    after: { contentText: `✗ Unassociated (${idsArray.join(", ")})` }
                }
            };
        });
    
        editor.setDecorations(unassociatedDecoration, unassociatedDecorations);
    }
}
