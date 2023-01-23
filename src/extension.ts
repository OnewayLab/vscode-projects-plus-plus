/**
 * @fileoverview Extension entry point
 * @author huangcb01@foxmail.com (Canbin Huang)
 * @license MIT
 */

import * as vscode from 'vscode'
import { ProjectsTreeProvider } from './treeview'

export function activate(context: vscode.ExtensionContext) {
	const projectsTreeProvider = new ProjectsTreeProvider()
	vscode.window.registerTreeDataProvider('projects', projectsTreeProvider)

	vscode.commands.registerCommand(
		"projects-plus-plus.setGlobalRootPath",
		() => projectsTreeProvider.setRootPath(true)
	)
	vscode.commands.registerCommand(
		"projects-plus-plus.setWorkspaceRootPath",
		() => projectsTreeProvider.setRootPath(false)
	)
	vscode.commands.registerCommand(
		'projects-plus-plus.refreshProjects',
		() => projectsTreeProvider.refresh()
	)
	vscode.commands.registerCommand(
		'projects-plus-plus.openInWorkspace',
		item => projectsTreeProvider.openInWorkspace(item)
	)
	vscode.commands.registerCommand(
		'projects-plus-plus.removeFromWorkspace',
		() => {
			projectsTreeProvider.removeFromWorkspace()
		}
	)
	vscode.commands.registerCommand(
		'projects-plus-plus.create',
		item => projectsTreeProvider.create(item)
	)
	vscode.commands.registerCommand(
		'projects-plus-plus.delete',
		item => projectsTreeProvider.delete(item)
	)
	vscode.commands.registerCommand(
		'projects-plus-plus.markAsProject',
		item => projectsTreeProvider.markAsProject(item)
	)
	vscode.commands.registerCommand(
		'projects-plus-plus.markAsFolder',
		item => projectsTreeProvider.markAsFolder(item)
	)
}

export function deactivate() { }
