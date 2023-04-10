document.addEventListener('DOMContentLoaded', function() {
  const inputElem = document.getElementById('input');
  const outputElem = document.getElementById('output');

  function addOutput(text) {
    outputElem.innerHTML += text + '\n';
    outputElem.scrollTop = outputElem.scrollHeight;
  }

  inputElem.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
      const command = inputElem.value.trim();
      if (command) {
        addOutput('> ' + command, true);
        handleCommand(command);
        inputElem.value = '';
      }
    }
  });

  function handleCommand(command) {
    if (command.startsWith('help')) {
      const helpMessage = handleHelp(command);
      addOutput(helpMessage, false);
    } else {
      typeText('Unknown command. Type "help" for a list of available commands.');
    }
  }

  function typeText(text, callback) {
    inputElem.disabled = true; // Disable the input element during typing
    let index = 0;
    const lines = text.split('\n');

    function typeNextLine() {
      let lineIndex = 0;
      const line = lines[index];

      function typeNextCharacter() {
        const minDelay = 1; // Minimum typing delay in milliseconds
        const maxDelay = 50; // Maximum typing delay in milliseconds
        const typingDelay = Math.random() * (maxDelay - minDelay) + minDelay;

        setTimeout(() => {
          outputElem.innerHTML += line.charAt(lineIndex);
          lineIndex++;

          if (lineIndex < line.length) {
            typeNextCharacter();
          } else {
            outputElem.innerHTML += '\n';
            index++;
            if (index < lines.length) {
              typeNextLine();
            } else {
              outputElem.scrollTop = outputElem.scrollHeight;
              inputElem.disabled = false; // Re-enable the input element after typing
              inputElem.focus(); // Focus the input element after typing
              if (callback) {
                callback();
              }
            }
          }
        }, typingDelay);
      }

      typeNextCharacter();
    }

    typeNextLine();
  }

  function addOutput(text, isPlayerCommand = false) {
    if (isPlayerCommand) {
      outputElem.innerHTML += text + '\n';
      outputElem.scrollTop = outputElem.scrollHeight;
    } else {
      typeText(text);
    }
  }

  typeText('Welcome to Alienware: Terminal Override! \nType "help" for a list of available commands.');
});
