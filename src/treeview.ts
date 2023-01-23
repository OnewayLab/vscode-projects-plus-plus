/**
 * @fileoverview Tree view of extension Projects++ for Visual Studio Code.
 * @author huangcb01@foxmail.com (Canbin Huang)
 * @license MIT License. See LICENSE in the project root for license information.
 */

import { window, workspace, env, commands } from 'vscode'
import { Uri, TreeDataProvider, TreeItem, TreeItemCollapsibleState, EventEmitter, FileType, ThemeIcon } from 'vscode'
import * as path from 'path'
import * as fs from 'fs'
import * as template from './template'
import * as configuration from './configuration'

export class ProjectsTreeProvider implements TreeDataProvider<Item> {
    private rootPath?: string
    private projects: Set<string>
    private _onDidChangeTreeData = new EventEmitter<Item | undefined | null | void>()
    public readonly onDidChangeTreeData = this._onDidChangeTreeData.event

    constructor() {
        // get the root path and projects
        this.rootPath = configuration.rootPath.get()
        this.projects = new Set(configuration.projects.get())

        // register on configuration changes
        configuration.registerConfigurationChangeCallback(() => this.refresh())
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
     * Reload rootPath and projects from configuration and refresh the tree view.
     */
    refresh() {
        // get root path and projects
        this.rootPath = configuration.rootPath.get()
        this.projects = new Set(configuration.projects.get())

        // update tree view
        this._onDidChangeTreeData.fire()
    }

    /**
     * Add the selected folder to the workspace.
     */
    openInWorkspace(item: Item) {
        configuration.workspaceFolders.add(item.uri)
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

        configuration.workspaceFolders.remove(Uri.file(filePath))
    }

    /**
     * Create a folder or project using a template.
     */
    async create(item: Item) {
        const selectedTemplate = await window.showQuickPick(
            [
                { label: "folder", description: "Create a new folder" },
                ...(await template.getTemplates()).map(t => ({
                    label: t[0],
                    description: t[1]
                }))
            ],
            { placeHolder: "Select a template" }
        )
        if (selectedTemplate) {
            const type = selectedTemplate.label === "folder" ? "folder" : "project"
            const name = await window.showInputBox({
                prompt: "Enter the name of the new " + type,
                placeHolder: "New " + type
            })
            if (name) {
                const targetUri = Uri.joinPath(item.uri, name)
                if (type === "project") {
                    const sourceUri = Uri.file(path.join(selectedTemplate.description, selectedTemplate.label))
                    workspace.fs.copy(sourceUri, targetUri).then(() => {
                        workspace.fs.delete(Uri.joinPath(targetUri, ".git"), { recursive: true })
                    })
                    this.projects.add(targetUri.fsPath)
                    await configuration.projects.set(Array.from(this.projects))
                    configuration.workspaceFolders.add(targetUri)
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
        configuration.projects.set(Array.from(this.projects))
    }

    markAsFolder(item: Item) {
        this.projects.delete(item.uri.fsPath)
        configuration.projects.set(Array.from(this.projects))
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