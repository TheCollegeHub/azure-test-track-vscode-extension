import * as vscode from 'vscode';

export const associatedDecoration = vscode.window.createTextEditorDecorationType({
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    border: '1px solid green',
    borderRadius: '2px',
    after: {
        contentText: ' ✓ Associated',
        color: '#4CAF50',
        margin: '0 10px 0 10px',
        fontStyle: 'italic',
        fontWeight: 'bold',
    },
    
});

export const unassociatedDecoration = vscode.window.createTextEditorDecorationType({
    backgroundColor: 'rgba(255, 87, 34, 0.1)',
    border: '1px solid red',
    borderRadius: '2px',
    after: {
        contentText: ' ✗ Unassociated',
        color: '#FF5722',
        margin: '0 10px 0 10px',
        fontStyle: 'italic',
        fontWeight: 'bold',
    },
});