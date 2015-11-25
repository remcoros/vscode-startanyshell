'use strict';

import {window, workspace, commands, ExtensionContext, QuickPickItem, QuickPickOptions} from 'vscode';
import * as child_process from 'child_process';
import * as path from 'path';

interface ShellCommand {
    description: string,
    command: string;
}

interface ShellQuickPickItem extends QuickPickItem {
    shell: ShellCommand
}

export function activate(context: ExtensionContext) {
    console.log('StartAnyShell is now active.');

    const startShell = commands.registerCommand("startanyshell.startShell", () => {
        let rootPath = workspace.rootPath;
		
        // TODO: option to open at workspace level or file level
        if (!rootPath) {
            let editor = window.activeTextEditor;
            if (editor && editor.document && editor.document.uri) {
                rootPath = path.dirname(editor.document.uri.fsPath);
            }
        };

        if (!rootPath || rootPath == "") rootPath = ".";

        let options: QuickPickOptions = { matchOnDescription: false, placeHolder: "Launch any shell in: " + rootPath };

        Promise.resolve(window.showQuickPick(getShells(context), options))
            .then((item) => {
                if (!item) return;
                if (!item.shell) return;

                child_process.exec(formatCommand(item.shell.command, rootPath, context));
            })
            .catch(error => {
                window.showErrorMessage(error.message || error);
            });
    });

    context.subscriptions.push(startShell);
}

function getShells(context: ExtensionContext): Promise<ShellQuickPickItem[]> {
    return new Promise(resolve=> {
        let section = workspace.getConfiguration('startanyshell');
        let shells: ShellCommand[] = section.get<ShellCommand[]>("shells", []);

        resolve(shells.map(shell => {
            return { label: shell.description, description: shell.command, context, shell: shell };
        }));
    });
}

function formatCommand(command: string, rootPath: string, context: ExtensionContext) {
    return command
        .replace('%path%', rootPath);
    // TODO: add more tokens or eval();
}