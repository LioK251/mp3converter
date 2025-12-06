function showModal(title, message, options = {}) {
  const modal = document.getElementById('custom-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalMessage = document.getElementById('modal-message');
  const modalButtons = document.getElementById('modal-buttons');
  const modalClose = document.getElementById('modal-close');
  
  if (!modal) return;
  
  modalTitle.textContent = title;
  modalMessage.textContent = message;
  modalButtons.innerHTML = '';
  
  const closeModal = () => {
    modal.classList.add('hidden');
  };
  
  if (options.confirm) {
    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = options.confirmText || 'OK';
    confirmBtn.className = 'px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium hover-effect';
    confirmBtn.onclick = () => {
      closeModal();
      if (options.onConfirm) options.onConfirm();
    };
    modalButtons.appendChild(confirmBtn);
    
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = options.cancelText || 'Cancel';
    cancelBtn.className = 'px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white font-medium hover-effect';
    cancelBtn.onclick = () => {
      closeModal();
      if (options.onCancel) options.onCancel();
    };
    modalButtons.appendChild(cancelBtn);
  } else {
    const okBtn = document.createElement('button');
    okBtn.textContent = options.okText || 'OK';
    okBtn.className = 'px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium hover-effect';
    okBtn.onclick = () => {
      closeModal();
      if (options.onOk) options.onOk();
    };
    modalButtons.appendChild(okBtn);
  }
  
  modalClose.onclick = closeModal;
  modal.onclick = (e) => {
    if (e.target === modal) closeModal();
  };
  
  modal.classList.remove('hidden');
}

function showAlert(message, title = 'Alert') {
  return new Promise((resolve) => {
    showModal(title, message, {
      onOk: () => resolve(true)
    });
  });
}

function showConfirm(message, title = 'Confirm') {
  return new Promise((resolve) => {
    showModal(title, message, {
      confirm: true,
      onConfirm: () => resolve(true),
      onCancel: () => resolve(false)
    });
  });
}