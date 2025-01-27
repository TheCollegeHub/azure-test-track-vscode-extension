import * as vscode from 'vscode';
import * as path from 'path';

export function extractTestCaseName(editor: vscode.TextEditor, startLine: number): string | null {
    let testCaseName = '';
    let line = startLine;
    let collecting = false;

    while (line < editor.document.lineCount) {
        const currentLine = editor.document.lineAt(line).text.trim();
        const language = editor.document.languageId;

        if (language === 'python') {
            const pythonMatch = /^def\s+(test_\w+)\s*\(/.exec(currentLine);
            if (pythonMatch) {
                testCaseName = pythonMatch[1];
                break;
            }
        } else if (language === 'javascript' || language === 'typescript') {
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
        }
        
        line++;
    }

    return applyRelativePathToTestCaseName(editor, testCaseName);
}

export function extractTestCaseNamesFromDocument(editor: vscode.TextEditor): { testCaseName: string, lineNumber: number }[] {
    const testCaseNames: { testCaseName: string, lineNumber: number }[] = [];
    let line = 0;
    const language = editor.document.languageId;

    while (line < editor.document.lineCount) {
        const currentLine = editor.document.lineAt(line).text.trim();

        if (language === 'python') {
            const pythonMatch = /^def\s+(test_\w+)\s*\(/.exec(currentLine);
            if (pythonMatch) {
                testCaseNames.push({ testCaseName: pythonMatch[1], lineNumber: line });
            }
        } else if (language === 'javascript' || language === 'typescript') {
            const match = /'(.*?)'/.exec(currentLine);
            if (/^(test|it)\s*\(/.test(currentLine) && match) {
                testCaseNames.push({ testCaseName: match[1], lineNumber: line });
            }
        }
        
        line++;
    }

    return testCaseNames;
}

export function extractTestCaseIds(editor: vscode.TextEditor, line: number): string[] | null {
    const document = editor.document;
    let testCaseIds: string[] = [];

    for (let i = line - 1; i >= 0; i--) {
        const text = document.lineAt(i).text;

        const match = text.match(/ADO_IDs:\s*((?:TC_\d+,?\s*)+)/);

        if (match) {
            const ids = match[0].match(/TC_(\d+)/g);

            if (ids) {
                testCaseIds = ids.map((id) => id.replace('TC_', '').trim());
            }
        }
        if (testCaseIds.length > 0) { break; }
    }

    return testCaseIds.length > 0 ? testCaseIds : null;
}

export function applyRelativePathToTestCaseName(editor: vscode.TextEditor, testCaseName: string){
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
