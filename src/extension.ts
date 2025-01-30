import * as vscode from 'vscode';
import { associateTestCaseCommand, associateTestCaseCustomCommand, associateTestCaseIdsFromComments, setDecorationsForAssociatedAutomatedTests } from './commands/commands';
import { associatedDecoration, unassociatedDecoration } from './decorators/association-decoretor';
let decoratedEditors = new Map<string, boolean>();

function getEditor() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage('No file is open.');
        return;
    }
    return editor;
}

export function activate(context: vscode.ExtensionContext) {
    const associateTestCommand = vscode.commands.registerCommand('extension.associateTestCase', async () => {
        const editor = getEditor();
        await associateTestCaseCommand(editor!);
    });

    const associateTestCommandCustom = vscode.commands.registerCommand('extension.associateTestCaseCustom', async () => {
        await associateTestCaseCustomCommand();
    });

    const associateTestCaseIdsCommand = vscode.commands.registerCommand('extension.associateTestCaseIdsFromComments', async () => {
        const editor = getEditor();
        await associateTestCaseIdsFromComments(editor!);
    });

    const setDecorationsForAssociatedAutomatedTestsCommand = vscode.commands.registerCommand('extension.setDecorationsForAssociatedAutomatedTests', async () => {
        const editor = getEditor();

        const filePath = editor!.document.uri.fsPath;
        const isDecorated = decoratedEditors.get(filePath) ?? false;

        if (isDecorated) {
            editor!.setDecorations(associatedDecoration, []);
            editor!.setDecorations(unassociatedDecoration, []);
            decoratedEditors.delete(filePath);
        } else {
            await setDecorationsForAssociatedAutomatedTests(editor!);
            decoratedEditors.set(filePath, true);
        }
    });

    context.subscriptions.push(associateTestCommand);
    context.subscriptions.push(associateTestCommandCustom);
    context.subscriptions.push(associateTestCaseIdsCommand);
    context.subscriptions.push(setDecorationsForAssociatedAutomatedTestsCommand);


    vscode.window.onDidChangeTextEditorSelection((e) => {
        const editor = e.textEditor;
        if (editor) {
            const position = editor.selection.active;
            const lineText = editor.document.lineAt(position.line).text;
            const language = editor.document.languageId;
            console.log(`Detected language: ${language}`);

            let isTestLine = false;
    
            if (language === "python") {
                isTestLine = /^def\s+test_\w*\s*\(/.test(lineText);
            } else if (language === "javascript" || language === "typescript") {
                isTestLine = /^(test|it)\(/.test(lineText);
            }

            const contextKey = 'editorHasTestCase';
            vscode.commands.executeCommand('setContext', contextKey, isTestLine); 
            
            console.log({
                lineText,
                language,
                isTestLine,
            });
            
        }
    });

    vscode.window.onDidChangeActiveTextEditor((editor) => {
        if (!editor) { return; }

        const filePath = editor.document.uri.fsPath;
        const isDecorated = decoratedEditors.get(filePath) ?? false;

        if (isDecorated) {
            setDecorationsForAssociatedAutomatedTests(editor);
        }
    });
}

export function deactivate() {}
