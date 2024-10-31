/**
 * @fileoverview Configuration manager of extension Projects++ for Visual Studio Code.
 * @author huangcb01@foxmail.com (Canbin Huang)
 * @license MIT License. See LICENSE in the project root for license information.
 */

import { Uri, workspace } from 'vscode';

/**
 * Root path to retrieve projects from.
 */
export var rootPath = {
    /**
     * Get the root path.
     * @returns The root path or undefined if not set.
     */
    get(): string | undefined {
        return workspace.getConfiguration("projects-plus-plus").get<string>("rootPath");
    },

    /**
     * Set the root path.
     * @param path The path to set.
     * @param global Whether to set the root path globally or for the current workspace.
     */
    set(path: string, global = false): Thenable<void> {
        return workspace.getConfiguration("projects-plus-plus").update("rootPath", path, global);
    }
};

/**
 * Template Folder.
 */
export var templateFolders = {
    get(): string[] | undefined {
        return workspace.getConfiguration("projects-plus-plus").get<string[]>("templateFolders");
    }
};

/**
 * Project paths.
 */
export var projects = {
    get(): string[] {
        return workspace.getConfiguration("projects-plus-plus").get<string[]>("projects") || [];
    },
    set(projects: string[]): Thenable<void> {
        return workspace.getConfiguration("projects-plus-plus").update("projects", projects, false);
    }
};

/**
 * Folders opened in the current workspace.
 */
export var workspaceFolders = {
    get(): string[] {
        return workspace.workspaceFolders?.map(folder => folder.uri.fsPath) || [];
    },
    add(folderUri: Uri) {
        workspace.updateWorkspaceFolders(
            workspace.workspaceFolders ? workspace.workspaceFolders.length : 0,
            null,
            { uri: folderUri }
        );
    },
    remove(folderUri: Uri) {
        const workspaceFolder = workspace.getWorkspaceFolder(folderUri);
        if (workspaceFolder) {
            workspace.updateWorkspaceFolders(
                workspace.workspaceFolders ? workspace.workspaceFolders.indexOf(workspaceFolder) : 0,
                1
            );
        }
    }
};

/**
 * Register callbacks for configuration changes.
 */
export function registerConfigurationChangeCallback(callback: () => void) {
    workspace.onDidChangeConfiguration(event => {
        if (event.affectsConfiguration("projects-plus-plus")) {
            callback();
        }
    });
}