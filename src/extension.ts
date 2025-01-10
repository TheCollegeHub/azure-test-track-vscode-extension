import * as vscode from 'vscode';
import { associtedTestCaseToAutomation } from '@thecollege/azure-test-track';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
    const associateTestCommand = vscode.commands.registerCommand('extension.associateTestCase', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No file is open.');
            return;
        }

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

        const testCaseType = await vscode.window.showQuickPick(['Unit', 'Component', "E2E"], { placeHolder: 'Choose the Test Type' });
        if (testCaseType === undefined) {
            return;
        }

        if (!testCaseId || !testCaseName || !testCaseType) {
            vscode.window.showErrorMessage('Incomplete information. Association canceled.');
            return;
        }

        await associateTestCase(testCaseId, testCaseName, testCaseType);
    });

    const associateTestCommandCustom = vscode.commands.registerCommand('extension.associateTestCaseCustom', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No file is open.');
            return;
        }

        const testCaseId = await vscode.window.showInputBox({ prompt: 'Enter the Test Case ID in Azure DevOps' });
        if (testCaseId === undefined) {
            return;
        }

        const testCaseName = await vscode.window.showInputBox({ prompt: 'Enter the Test Case Name in Azure DevOps' });
        if (testCaseId === undefined) {
            return;
        }

        const testCaseType = await vscode.window.showQuickPick(['Unit', 'Component', "E2E"], { placeHolder: 'Choose the Test Type' });
        if (testCaseType === undefined) {
            return;
        }

        if (!testCaseId || !testCaseName || !testCaseType) {
            vscode.window.showErrorMessage('Incomplete information. Association canceled.');
            return;
        }

        await associateTestCase(testCaseId, testCaseName, testCaseType);
    });

    context.subscriptions.push(associateTestCommand);
    context.subscriptions.push(associateTestCommandCustom);


    vscode.window.onDidChangeTextEditorSelection((e) => {
        const editor = e.textEditor;
        if (editor) {
            const position = editor.selection.active;
            const lineText = editor.document.lineAt(position.line).text;

            const isTestLine = /^(test|it)\(/.test(lineText);
            const contextKey = 'editorHasTestCase';
            vscode.commands.executeCommand('setContext', contextKey, isTestLine); 
        }
    });;
}

async function associateTestCase(testCaseId: string, testCaseName: string, testCaseType: string) {
    try {

        const organization = process.env.ADO_ORGANIZATION;
        const project = process.env.ADO_PROJECT;
        const token = process.env.ADO_PERSONAL_ACCESS_TOKEN;
        const email = process.env.ADO_COMPANY_EMAIL;
    
        if (!organization || !project || !token || !email) {
            vscode.window.showErrorMessage('Environment variables are not configured correctly.');
            return;
        }

        await associtedTestCaseToAutomation(
            testCaseId,
            testCaseName,
            testCaseType
        );
        vscode.window.showInformationMessage(`Test successfully associated with test case ${testCaseId}!`);
    } catch (error) {
        if (error instanceof Error) {
            vscode.window.showErrorMessage(`Error associating test: ${error.message}`);
        } else {
            vscode.window.showErrorMessage('Error associating test: unknown error.');
        }
    }
}

function extractTestCaseName(editor: vscode.TextEditor, startLine: number): string | null {
    let testCaseName = '';
    let line = startLine;
    let collecting = false;

    while (line < editor.document.lineCount) {
        const currentLine = editor.document.lineAt(line).text.trim();
        
        if (collecting) {
            testCaseName += currentLine;
        }

        if (/^(test|it)\s*\(/.test(currentLine)) {
            collecting = true; 
            testCaseName = currentLine; 
        }

        const match = /'(.*?)'/.exec(testCaseName); 
        if (match) {
            testCaseName = match[1]; 
            break;
        }

        line++;
    }

    if (testCaseName) {
        
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        const fileName = editor.document.fileName;

        const projectRoot = path.basename(workspaceFolder!); 

       
        if (workspaceFolder && fileName.startsWith(workspaceFolder)) {
            const relativePath = fileName.substring(workspaceFolder.length + 1); 
            const relativeProjectPath = path.posix.join(projectRoot, relativePath);
            return `${relativeProjectPath} - "${testCaseName}"`;
        }
    }

    return null;
}

export function deactivate() {}
