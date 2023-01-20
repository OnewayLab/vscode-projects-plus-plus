import * as vscode from 'vscode'
import * as path from 'path'

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
                    ).map(entry =>
                        new Item(
                            entry[0],
                            this.projects.has(path.join(element.uri.fsPath, entry[0])) ? "project" : "folder",
                            vscode.Uri.joinPath(element.uri, entry[0])
                        )
                    )
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

    setRootPath() {
        vscode.window.showOpenDialog({
            canSelectFiles: false,
            canSelectFolders: true,
            canSelectMany: false,
        }).then(uris => {
            if (uris) {
                vscode.workspace.getConfiguration("projects-plus-plus").update("rootPath", uris[0].fsPath, false)
            }
        })
    }

    refresh() {
        this._onDidChangeTreeData.fire()
    }

    openInWorkspace(item: Item) {
        vscode.workspace.updateWorkspaceFolders(
            vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders.length : 0,
            null,
            { uri: item.uri }
        )
    }

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
        vscode.workspace.getConfiguration("projects-plus-plus").update("projects", this.projects, false)
    }

    markAsFolder(item: Item) {
        this.projects.delete(item.uri.fsPath)
        vscode.workspace.getConfiguration("projects-plus-plus").update("projects", this.projects, false)
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
            type == "folder" ?
                vscode.TreeItemCollapsibleState.Collapsed :
                vscode.TreeItemCollapsibleState.None,
        )
        this.contextValue = type
        this.iconPath = new vscode.ThemeIcon(type)
    }
}