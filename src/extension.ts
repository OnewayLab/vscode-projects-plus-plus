/**
 * @fileoverview Extension entry point
 * @author huangcb01@foxmail.com (Canbin Huang)
 * @license MIT License. See LICENSE in the project root for license information.
 */

import { window, commands, ExtensionContext } from 'vscode'
import { ProjectsTreeProvider } from './treeview'
import * as configuration from './configuration'

export function activate(context: ExtensionContext) {
    const projectsTreeProvider = new ProjectsTreeProvider()
    window.registerTreeDataProvider('projects', projectsTreeProvider)

    commands.registerCommand(
        "projects-plus-plus.setGlobalRootPath",
        () => {
            window.showOpenDialog({
                canSelectFiles: false,
                canSelectFolders: true,
                canSelectMany: false,
            }).then(uris => {
                if (uris) {
                    configuration.rootPath.set(uris[0].fsPath, true)
                }
            })
        }
    )
    commands.registerCommand(
        "projects-plus-plus.setWorkspaceRootPath",
        () => {
            window.showOpenDialog({
                canSelectFiles: false,
                canSelectFolders: true,
                canSelectMany: false,
            }).then(uris => {
                if (uris) {
                    configuration.rootPath.set(uris[0].fsPath, false)
                }
            })
        }
    )
    commands.registerCommand(
        'projects-plus-plus.refreshProjects',
        () => projectsTreeProvider.refresh()
    )
    commands.registerCommand(
        'projects-plus-plus.openInWorkspace',
        item => projectsTreeProvider.openInWorkspace(item)
    )
    commands.registerCommand(
        'projects-plus-plus.openInNewWindow',
        item => projectsTreeProvider.openInNewWindow(item)
    )
    commands.registerCommand(
        'projects-plus-plus.removeFromWorkspace',
        () => projectsTreeProvider.removeFromWorkspace()
    )
    commands.registerCommand(
        'projects-plus-plus.create',
        item => projectsTreeProvider.create(item)
    )
    commands.registerCommand(
        'projects-plus-plus.delete',
        item => projectsTreeProvider.delete(item)
    )
    commands.registerCommand(
        'projects-plus-plus.markAsProject',
        item => projectsTreeProvider.markAsProject(item)
    )
    commands.registerCommand(
        'projects-plus-plus.markAsFolder',
        item => projectsTreeProvider.markAsFolder(item)
    )
}

export function deactivate() { }
