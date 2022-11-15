import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { setRootPath } from './config';

export class ProjectsTreeProvider implements vscode.TreeDataProvider<Item> {
    rootPath?: string;
    projects: string[] = [];

    constructor() {
        // get the root path
        this.rootPath = vscode.workspace.getConfiguration("projects-plus-plus").get<string>("rootPath");

        // get projects
        let projects = vscode.workspace.getConfiguration("projects-plus-plus").get<Array<string>>("projects");
        if (projects) {
            this.projects = projects;
        }

        // if the root path is not set, show a open dialog for the user to select a folder
        if (!this.rootPath) {
            setRootPath();
        }
    }

    getTreeItem(element: Item): vscode.TreeItem {
        return element;
    }

    getChildren(element?: Item): Thenable<Item[]> {
        if (element) {
            return new Promise(resolve => vscode.workspace.fs.readDirectory(element.uri).then((entries) => {
                resolve(entries.filter((entry) => {
                    return entry[1] === vscode.FileType.Directory;
                }).map((entry) => {
                    let fullPath = path.join(element.uri.fsPath, entry[0]);
                    return new Item(
                        entry[0],
                        this.projects.includes(fullPath) ? "project" : "folder",
                        vscode.Uri.joinPath(element.uri, entry[0])
                    );
                }));
            }));
        } else {
            if (!this.rootPath) {
                this.rootPath = vscode.workspace.getConfiguration("projects-plus-plus").get("rootPath");
            }
            if (this.rootPath) {
                return Promise.resolve([new Item(this.rootPath, "folder", vscode.Uri.file(this.rootPath))]);
            } else {
                setRootPath();
                return Promise.reject("Root path not set");
            }
        }
    }

    private _onDidChangeTreeData: vscode.EventEmitter<Item | undefined> = new vscode.EventEmitter<Item | undefined>();
    readonly onDidChangeTreeData: vscode.Event<Item | undefined> = this._onDidChangeTreeData.event;

    refresh(): void {
        this._onDidChangeTreeData.fire(undefined);
    }
}

class Item extends vscode.TreeItem {
    iconPath?: vscode.Uri | vscode.ThemeIcon;

    constructor(
        public readonly name: string,
        public readonly type: string,
        public readonly uri: vscode.Uri
    ) {
        super(name, type == "folder" ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None);
        this.iconPath = new vscode.ThemeIcon(type);
    }
}