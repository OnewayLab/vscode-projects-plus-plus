/**
 * @fileoverview Tree view of extension Projects++ for Visual Studio Code.
 * @author huangcb01@foxmail.com (Canbin Huang)
 * @license MIT
 */

import * as vscode from 'vscode'
import * as path from 'path'
import * as fs from 'fs'

export class ProjectsTreeProvider implements vscode.TreeDataProvider<Item> {
    private rootPath?: string
    private projects: Set<string>
    private _onDidChangeTreeData = new vscode.EventEmitter<Item | undefined | null | void>()
    public readonly onDidChangeTreeData = this._onDidChangeTreeData.event

    constructor() {
        // get the root path
        this.rootPath = vscode.workspace.getConfiguration("projects-plus-plus").get<string>("rootPath")

        // get projects
        let projects = vscode.workspace.getConfiguration("projects-plus-plus").get<Array<string>>("projects")
        this.projects = projects ? new Set(projects) : new Set()

        // subscribe to configuration changes
        vscode.workspace.onDidChangeConfiguration((event) => {
            if (event.affectsConfiguration("projects-plus-plus")) {
                this.refresh()
            }
        })
    }

    getTreeItem(element: Item): vscode.TreeItem {
        return element
    }

    getChildren(element?: Item): Thenable<Item[]> {
        if (element) {
            return Promise.resolve(
                vscode.workspace.fs.readDirectory(element.uri).then(entries =>
                    entries.filter(entry =>
                        entry[1] === vscode.FileType.Directory && !entry[0].startsWith(".")
                    ).map(entry => {
                        let fullPath = path.join(element.uri.fsPath, entry[0])
                        return new Item(
                            entry[0],
                            this.projects.has(fullPath) ? "project" :
                                fs.existsSync(path.join(fullPath, ".git")) ? "git-branch" : "folder",
                            vscode.Uri.joinPath(element.uri, entry[0])
                        )
                    })
                )
            )
        } else {
            if (this.rootPath) {
                return Promise.resolve([new Item(this.rootPath, "folder", vscode.Uri.file(this.rootPath))])
            } else {
                return Promise.reject("Root path not set")
            }
        }
    }

    /**
     * Set the root path to retrieve projects from.
     * @param global Whether to set the root path globally or for the current workspace.
     */
    setRootPath(global: boolean = false) {
        vscode.window.showOpenDialog({
            canSelectFiles: false,
            canSelectFolders: true,
            canSelectMany: false,
        }).then(uris => {
            if (uris) {
                vscode.workspace.getConfiguration("projects-plus-plus").update("rootPath", uris[0].fsPath, global)
            }
        })
    }

    /**
     * Reload rootPath and projects from configuration and refresh the tree view.
     */
    refresh() {
        // get root path
        this.rootPath = vscode.workspace.getConfiguration("projects-plus-plus").get<string>("rootPath")

        // get projects
        let projects = vscode.workspace.getConfiguration("projects-plus-plus").get<Array<string>>("projects")
        this.projects = projects ? new Set(projects) : new Set()

        // update tree view
        this._onDidChangeTreeData.fire()
    }

    /**
     * Add the selected folder to the workspace.
     */
    openInWorkspace(item: Item) {
        vscode.workspace.updateWorkspaceFolders(
            vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders.length : 0,
            null,
            { uri: item.uri }
        )
    }

    /**
     * Remove the selected folder from the workspace.
     */
    async removeFromWorkspace() {
        // VSCode doesn't provide a way to get the selected folder in the explorer
        // so we have to use "copyFilePath" command and get it from the clipboard :(
        // Thanks to @JeremyFunk for the idea (https://github.com/microsoft/vscode/issues/3553#issuecomment-1098562676)
        const originalClipboard = await vscode.env.clipboard.readText()
        await vscode.commands.executeCommand("copyFilePath")
        const filePath = await vscode.env.clipboard.readText()
        vscode.env.clipboard.writeText(originalClipboard)

        const workspaceFolder = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(filePath))
        if (workspaceFolder) {
            vscode.workspace.updateWorkspaceFolders(
                vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders.indexOf(workspaceFolder) : 0,
                1
            )
        }
    }

    newFolder(item: Item) {
        vscode.window.showInputBox({
            prompt: "Enter the name of the new folder",
            placeHolder: "New folder"
        }).then(folderName => {
            if (folderName) {
                vscode.workspace.fs.createDirectory(vscode.Uri.joinPath(item.uri, folderName))
            }
            this.refresh()
        })
    }

    delete(item: Item) {
        this.markAsFolder(item)
        vscode.workspace.fs.delete(item.uri, { recursive: true })
        this.refresh()
    }

    markAsProject(item: Item) {
        this.projects.add(item.uri.fsPath)
        vscode.workspace.getConfiguration("projects-plus-plus").update("projects", Array.from(this.projects), false)
    }

    markAsFolder(item: Item) {
        this.projects.delete(item.uri.fsPath)
        vscode.workspace.getConfiguration("projects-plus-plus").update("projects", Array.from(this.projects), false)
        this.refresh()
    }
}

class Item extends vscode.TreeItem {
    iconPath?: vscode.Uri | vscode.ThemeIcon

    constructor(
        name: string,
        public readonly type: string,
        public readonly uri: vscode.Uri
    ) {
        super(
            name,
            type == "project" ? vscode.TreeItemCollapsibleState.None : vscode.TreeItemCollapsibleState.Collapsed,
        )
        this.contextValue = type
        this.iconPath = new vscode.ThemeIcon(type)
    }
}