/**
 * @fileoverview Tree view of extension Projects++ for Visual Studio Code.
 * @author huangcb01@foxmail.com (Canbin Huang)
 * @license MIT
 */

import { window, workspace, env, commands } from 'vscode'
import { Uri, TreeDataProvider, TreeItem, TreeItemCollapsibleState, EventEmitter, FileType, ThemeIcon } from 'vscode'
import * as path from 'path'
import * as templates from './template'
import * as fs from 'fs'

export class ProjectsTreeProvider implements TreeDataProvider<Item> {
    private rootPath?: string
    private projects: Set<string>
    private _onDidChangeTreeData = new EventEmitter<Item | undefined | null | void>()
    public readonly onDidChangeTreeData = this._onDidChangeTreeData.event

    constructor() {
        // get the root path
        this.rootPath = workspace.getConfiguration("projects-plus-plus").get<string>("rootPath")

        // get projects
        let projects = workspace.getConfiguration("projects-plus-plus").get<Array<string>>("projects")
        this.projects = projects ? new Set(projects) : new Set()

        // subscribe to configuration changes
        workspace.onDidChangeConfiguration((event) => {
            if (event.affectsConfiguration("projects-plus-plus")) {
                this.refresh()
            }
        })
    }

    getTreeItem(element: Item): TreeItem {
        return element
    }

    getChildren(element?: Item): Thenable<Item[]> {
        if (element) {
            return Promise.resolve(
                workspace.fs.readDirectory(element.uri).then(entries =>
                    entries.filter(entry =>
                        entry[1] === FileType.Directory && !entry[0].startsWith(".")
                    ).map(entry =>
                        new Item(
                            entry[0],
                            this.projects.has(path.join(element.uri.fsPath, entry[0])) ? "project" : "folder",
                            Uri.joinPath(element.uri, entry[0])
                        )
                    )
                )
            )
        } else {
            if (this.rootPath) {
                return Promise.resolve([new Item(this.rootPath, "folder", Uri.file(this.rootPath), true)])
            } else {
                return Promise.reject("Projects++: Root path not set")
            }
        }
    }

    /**
     * Set the root path to retrieve projects from.
     * @param global Whether to set the root path globally or for the current workspace.
     */
    setRootPath(global: boolean = false) {
        window.showOpenDialog({
            canSelectFiles: false,
            canSelectFolders: true,
            canSelectMany: false,
        }).then(uris => {
            if (uris) {
                workspace.getConfiguration("projects-plus-plus").update("rootPath", uris[0].fsPath, global)
            }
        })
    }

    /**
     * Reload rootPath and projects from configuration and refresh the tree view.
     */
    refresh() {
        // get root path
        this.rootPath = workspace.getConfiguration("projects-plus-plus").get<string>("rootPath")

        // get projects
        let projects = workspace.getConfiguration("projects-plus-plus").get<Array<string>>("projects")
        this.projects = projects ? new Set(projects) : new Set()

        // update tree view
        this._onDidChangeTreeData.fire()
    }

    /**
     * Add the selected folder to the workspace.
     */
    openInWorkspace(item: Item) {
        workspace.updateWorkspaceFolders(
            workspace.workspaceFolders ? workspace.workspaceFolders.length : 0,
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
        const originalClipboard = await env.clipboard.readText()
        await commands.executeCommand("copyFilePath")
        const filePath = await env.clipboard.readText()
        env.clipboard.writeText(originalClipboard)

        const workspaceFolder = workspace.getWorkspaceFolder(Uri.file(filePath))
        if (workspaceFolder) {
            workspace.updateWorkspaceFolders(
                workspace.workspaceFolders ? workspace.workspaceFolders.indexOf(workspaceFolder) : 0,
                1
            )
        }
    }

    /**
     * Create a folder or project using a template.
     */
    async create(item: Item) {
        const template = await window.showQuickPick(
            [
                { label: "folder", description: "Create a new folder" },
                ...(await templates.getTemplates()).map(template => ({
                    label: template[0],
                    description: template[1]
                }))
            ],
            { placeHolder: "Select a template" }
        )
        if (template) {
            const type = template.label === "folder" ? "folder" : "project"
            const name = await window.showInputBox({
                prompt: "Enter the name of the new " + type,
                placeHolder: "New " + type
            })
            if (name) {
                const targetUri = Uri.joinPath(item.uri, name)
                if (type === "project") {
                    const sourceUri = Uri.file(path.join(template.description, template.label))
                    workspace.fs.copy(sourceUri, targetUri).then(() => {
                        workspace.fs.delete(Uri.joinPath(targetUri, ".git"), { recursive: true })
                    })
                    this.projects.add(targetUri.fsPath)
                    await workspace.getConfiguration("projects-plus-plus").update("projects", Array.from(this.projects))
                    workspace.updateWorkspaceFolders(
                        workspace.workspaceFolders ? workspace.workspaceFolders.length : 0,
                        null,
                        { uri: targetUri }
                    )
                } else {
                    workspace.fs.createDirectory(targetUri)
                    this.refresh()
                }
            }
        }
    }

    delete(item: Item) {
        this.markAsFolder(item)
        workspace.fs.delete(item.uri, { recursive: true })
        this.refresh()
    }

    markAsProject(item: Item) {
        this.projects.add(item.uri.fsPath)
        workspace.getConfiguration("projects-plus-plus").update("projects", Array.from(this.projects), false)
    }

    markAsFolder(item: Item) {
        this.projects.delete(item.uri.fsPath)
        workspace.getConfiguration("projects-plus-plus").update("projects", Array.from(this.projects), false)
        this.refresh()
    }
}

class Item extends TreeItem {
    iconPath?: Uri | ThemeIcon

    constructor(
        name: string,
        public readonly type: "project" | "folder",
        public readonly uri: Uri,
        expanded = false
    ) {
        super(
            name,
            type == "project" ? TreeItemCollapsibleState.None :
                expanded ? TreeItemCollapsibleState.Expanded :
                    TreeItemCollapsibleState.Collapsed,
        )
        this.contextValue = type
        this.iconPath = new ThemeIcon(fs.existsSync(path.join(uri.fsPath, ".git")) ? "git-branch" : type)
    }
}