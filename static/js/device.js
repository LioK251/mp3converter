function updateDeviceInputs() {
  const deviceToggle = document.getElementById('device-toggle');
  const deviceInput = document.getElementById('device-input');
  const deviceInputYoutube = document.getElementById('device-input-youtube');
  if (deviceToggle) {
    const device = deviceToggle.checked ? 'cuda' : 'cpu';
    if (deviceInput) deviceInput.value = device;
    if (deviceInputYoutube) deviceInputYoutube.value = device;
    localStorage.setItem('transkunDevice', device);
  }
}

const deviceToggle = document.getElementById('device-toggle');
const savedDevice = localStorage.getItem('transkunDevice') || 'cuda';
if (deviceToggle) {
  deviceToggle.checked = savedDevice === 'cuda';
  updateDeviceInputs();
  deviceToggle.addEventListener('change', updateDeviceInputs);
}

