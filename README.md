# StartAnyShell

## About

Start any shell from Visual Studio Code, configurable from your user settings.

It will start in the currently opened folder, or when no folder is open, it will start in the folder of the active file. 
 
## Usage 

For now, starting a shell is a two-step process:

- Fire the 'Start Shell' command from the command palette (or bind a key to the command 'startanyshell.startShell')
- Launch any of the predefined or custom shells (see configuration section below)

> It is not possible (that I know of) for an extension to dynamically register a top-level command.
> VsCode only reads commands from the extension manifest on startup.

## Configuration

Open your user settings and copy the shell commands you would like to use, or create your own:

```json
	// Shell commands, see default for examples.
	"startanyshell.shells": [
		{
			"description": "Windows Command Prompt",
			"command": "start cmd /k \"cd /d %path%\""
		},
		{
			"description": "Windows Powershell",
			"command": "start powershell.exe -noexit -command \"cd \"%path%\"\""
		},
		{
			"description": "Developer Command Prompt for VS2015",
			"command": "start \"Developer Command Prompt for VS2015\" cmd /k \"cd /d %path% & \"C:\\Program Files (x86)\\Microsoft Visual Studio 14.0\\Common7\\Tools\\VsDevCmd.bat\"\""
		}
	]
```

## Usage 

Open the command palette (F1 / Ctrl+Shift+P), and look for 'Start shell'.

## License
[MIT](LICENSE)