function handleHelp(fullCommand) {
  const helpCommands = {
    help: 'Displays a list of available commands. Type "help [command]" for more information on a specific command.',
    connect: 'Connects to the alien network.',
    exploit: 'Exploits weaknesses in the alien systems.',
    shutdown: 'Shuts down the alien systems.'
  };

  const commandParts = fullCommand.split(/\s+/).slice(1);
  const command = commandParts.length > 0 ? commandParts[0] : '';

  if (command === '') {
    let helpMessage = 'Available commands:';
    for (const cmd in helpCommands) {
      helpMessage += `\n- ${cmd}`;
    }
    return helpMessage;
  } else if (helpCommands.hasOwnProperty(command)) {
    return `${command}: ${helpCommands[command]}`;
  } else {
    return 'Unknown command. Type "help" for a list of available commands.';
  }
}
