import * as vscode from 'vscode'
import { ProjectsTreeProvider } from './treeview'

export function activate(context: vscode.ExtensionContext) {
	const projectsTreeProvider = new ProjectsTreeProvider()
	vscode.window.registerTreeDataProvider('projects', projectsTreeProvider)

	vscode.commands.registerCommand(
		"projects-plus-plus.setRootPath",
		() => projectsTreeProvider.setRootPath()
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
		'projects-plus-plus.newFolder',
		item => projectsTreeProvider.newFolder(item)
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
