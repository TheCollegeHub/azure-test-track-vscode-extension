import * as vscode from 'vscode';
import { associtedTestCaseToAutomation } from '@thecollege/azure-test-track';
import { checkEnvironmentVariables } from '../utils/utils';

export async function associateTestCase(testCaseId: string, testCaseName: string, testCaseType: string) {
    try {

        checkEnvironmentVariables();

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


