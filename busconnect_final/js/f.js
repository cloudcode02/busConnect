const toggleBtn = document.getElementById('lightToggle');
const fileItems = document.querySelectorAll('.file-item');

toggleBtn.addEventListener('click', () => {
  // 1. Get the current state and flip it
  const currentState = toggleBtn.getAttribute('data-state');
  const newState = currentState === 'on' ? 'off' : 'on';
  
  // 2. Update the button text and state attribute
  toggleBtn.setAttribute('data-state', newState);
  toggleBtn.textContent = newState === 'on' 
    ? 'Lights ON (Show Root Files)' 
    : 'Lights OFF (Show Foldered Files)';

  // 3. Filter the files
  fileItems.forEach(item => {
    const isInFolder = item.getAttribute('data-in-folder') === 'true';

    if (newState === 'off') {
      // Lights OFF: Show ONLY files in folders (hide root files)
      if (isInFolder) {
        item.classList.remove('hidden');
      } else {
        item.classList.add('hidden');
      }
    } else {
      // Lights ON: Show ONLY files NOT in folders (hide subfolder files)
      if (!isInFolder) {
        item.classList.remove('hidden');
      } else {
        item.classList.add('hidden');
      }
    }
  });
});

// Run once on load to establish the initial "Lights OFF" view
toggleBtn.click();

function toggleFaq(el) {
      const item = el.parentElement;
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    }