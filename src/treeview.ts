import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { setRootPath } from './config';

export class ProjectsTreeProvider implements vscode.TreeDataProvider<Item> {
    rootPath?: string;

    constructor() {
        // get the root path
        this.rootPath = vscode.workspace.getConfiguration("projects-plus-plus").get("rootPath");

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
                resolve(entries.map((entry) => {
                    return new Item(
                        entry[0],
                        entry[1] === vscode.FileType.Directory ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None,
                        vscode.Uri.joinPath(element.uri, entry[0])
                    );
                }));
            }));
        } else {
            if (!this.rootPath) {
                this.rootPath = vscode.workspace.getConfiguration("projects-plus-plus").get("rootPath");
            }
            if (this.rootPath) {
                return Promise.resolve([new Item(this.rootPath, vscode.TreeItemCollapsibleState.Expanded, vscode.Uri.file(this.rootPath))]);
            } else {
                setRootPath();
                return Promise.reject("Root path not set");
            }
        }
    }
}

class Item extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly uri: vscode.Uri
    ) {
        super(label, collapsibleState);
    }
}