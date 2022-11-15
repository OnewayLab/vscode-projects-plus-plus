import * as vscode from 'vscode'

export function setRootPath() {
    vscode.window.showInformationMessage("Please set the root path where you want to search for projects")
    vscode.window.showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
    }).then((uris) => {
        if (uris) {
            var rootPath = uris[0].fsPath
            vscode.workspace.getConfiguration("projects-plus-plus").update("rootPath", rootPath, false)
        }
    })
}