import * as vscode from 'vscode'
import * as path from 'path'
import { setRootPath } from './config'

export class ProjectsTreeProvider implements vscode.TreeDataProvider<Item> {
    private rootPath?: string
    private projects: string[] = []
    private _onDidChangeTreeData: vscode.EventEmitter<Item | undefined> = new vscode.EventEmitter<Item | undefined>()
    readonly onDidChangeTreeData: vscode.Event<Item | undefined> = this._onDidChangeTreeData.event

    constructor() {
        // get the root path
        this.rootPath = vscode.workspace.getConfiguration("projects-plus-plus").get<string>("rootPath")

        // get projects
        let projects = vscode.workspace.getConfiguration("projects-plus-plus").get<Array<string>>("projects")
        if (projects) {
            this.projects = projects
        }

        // if the root path is not set, show a open dialog for the user to select a folder
        if (!this.rootPath) {
            setRootPath()
        }
    }

    getTreeItem(element: Item): vscode.TreeItem {
        return element
    }

    getChildren(element?: Item): Thenable<Item[]> {
        if (element) {
            return new Promise(resolve => vscode.workspace.fs.readDirectory(element.uri).then((entries) => {
                resolve(entries.filter((entry) => {
                    return entry[1] === vscode.FileType.Directory
                }).map((entry) => {
                    let fullPath = path.join(element.uri.fsPath, entry[0])
                    return new Item(
                        entry[0],
                        this.projects.includes(fullPath) ? "project" : "folder",
                        vscode.Uri.joinPath(element.uri, entry[0])
                    )
                }))
            }))
        } else {
            if (!this.rootPath) {
                this.rootPath = vscode.workspace.getConfiguration("projects-plus-plus").get("rootPath")
            }
            if (this.rootPath) {
                return Promise.resolve([new Item(this.rootPath, "folder", vscode.Uri.file(this.rootPath))])
            } else {
                setRootPath()
                return Promise.reject("Root path not set")
            }
        }
    }

    refresh(): void {
        this._onDidChangeTreeData.fire(undefined)
    }

    openProject(item: Item): void {
        vscode.workspace.updateWorkspaceFolders(
            vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders.length : 0,
            null,
            { uri: item.uri }
        )
    }

    newFolder(item: Item): void {
        vscode.window.showInputBox({
            prompt: "Enter the name of the new folder",
            placeHolder: "New folder"
        }).then((folderName) => {
            if (folderName) {
                vscode.workspace.fs.createDirectory(vscode.Uri.joinPath(item.uri, folderName))
            }
            this.refresh()
        })
    }

    delete(item: Item): void {
        vscode.workspace.fs.delete(item.uri, { recursive: true })
        this.refresh()
    }

    markAsProject(item: Item): void {
        let projects = vscode.workspace.getConfiguration("projects-plus-plus").get<Array<string>>("projects")
        if (projects) {
            this.projects = projects
        }
        this.projects.push(item.uri.fsPath)
        vscode.workspace.getConfiguration("projects-plus-plus").update("projects", this.projects, false)
        this.refresh()
    }

    markAsFolder(item: Item): void {
        let projects = vscode.workspace.getConfiguration("projects-plus-plus").get<Array<string>>("projects")
        if (projects) {
            this.projects = projects
        }
        this.projects = this.projects.filter((project) => {
            return project !== item.uri.fsPath
        })
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