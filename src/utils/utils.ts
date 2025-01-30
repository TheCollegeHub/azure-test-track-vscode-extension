import * as vscode from 'vscode';

export function checkEnvironmentVariables() {
    const organization = process.env.ADO_ORGANIZATION;
    const project = process.env.ADO_PROJECT;
    const token = process.env.ADO_PERSONAL_ACCESS_TOKEN;
    const email = process.env.ADO_COMPANY_EMAIL;

    if (!organization || !project || !token || !email) {
        vscode.window.showErrorMessage('Environment variables are not configured correctly.');
        return;
    }
}

export function showErrorInStatusBar(message: string, duration: number = 5000) {
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBarItem.text = `$(error) ${message}`;
    statusBarItem.color = new vscode.ThemeColor('errorForeground'); 
    statusBarItem.show();
    setTimeout(() => statusBarItem.dispose(), duration);
}
