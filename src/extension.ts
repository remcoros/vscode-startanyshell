'use strict';

import * as vscode from 'vscode';
import * as child_process from 'child_process';
import * as path from 'path';

interface ShellCommand {
    description: string,
    command: string;
}

export function activate(context: vscode.ExtensionContext) {
	console.log('StartAnyShell is now active.');

	var launchShell = vscode.commands.registerCommand("startanyshell.startShell", () => {
		let doc = vscode.window.activeTextEditor.document;
		let rootPath = vscode.workspace.rootPath;
		
		// TODO: option to open at workspace level or file level
		if (!rootPath && !doc.isUntitled) rootPath = path.dirname(doc.uri.fsPath);
		if (!rootPath) rootPath = ".";
		
		let options: vscode.QuickPickOptions = { matchOnDescription: false, placeHolder: "Launch any shell in: " + rootPath };
		let items = [];

		vscode.window.showQuickPick(getShells(context), options).then((item) => {
			if (!item) return;
			if (!item.label) return;

			child_process.exec(formatCommand(item.shell.command, rootPath, context));
		});

		context.subscriptions.push(launchShell);
	});
}

function getShells(context: vscode.ExtensionContext) {
	let section = vscode.workspace.getConfiguration('startanyshell');
	let shells: ShellCommand[] = section.get<ShellCommand[]>("shells", []);

	return shells.map(shell => {
		return { label: shell.description, description: shell.command, context, shell: shell };
	});
}

function formatCommand(command: string, rootPath: string, context: vscode.ExtensionContext) {
	return command
		.replace('%path%', rootPath);
	// TODO: add more tokens or eval();
}