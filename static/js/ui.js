const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');
const tabContainer = document.querySelector('.tab-container');
const systemInfoBox = document.getElementById('system-info-box');

if (tabContainer) {
  tabContainer.style.opacity = '0';
  tabContainer.style.transform = 'translateY(10px)';
  requestAnimationFrame(() => {
    tabContainer.style.transition = 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out';
    tabContainer.style.opacity = '1';
    tabContainer.style.transform = 'translateY(0)';
  });
}

if (systemInfoBox) {
  systemInfoBox.style.opacity = '0';
  systemInfoBox.style.transform = 'translateY(10px)';
  requestAnimationFrame(() => {
    systemInfoBox.style.transition = 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out';
    systemInfoBox.style.opacity = '1';
    systemInfoBox.style.transform = 'translateY(0)';
  });
}

tabButtons.forEach(button => {
  button.addEventListener('click', () => {
    const targetTab = button.getAttribute('data-tab');
    
    if (button.classList.contains('active')) return;
    
    const currentActiveContent = document.querySelector('.tab-content.active');
    const targetContent = document.getElementById(`${targetTab}-tab`);
    
    if (currentActiveContent) {
      currentActiveContent.style.opacity = '0';
      currentActiveContent.style.transform = 'translateY(10px)';
    }
    
    setTimeout(() => {
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => {
        content.classList.remove('active');
      });
      
      button.classList.add('active');
      if (targetContent) {
        if (targetTab === 'history') {
          const historyList = document.getElementById('full-history-list');
          if (historyList && historyList.innerHTML.includes('Loading history...')) {
            historyList.style.opacity = '0';
          }
        }
        
        targetContent.classList.add('active');
        targetContent.style.opacity = '0';
        targetContent.style.transform = 'translateY(10px)';
        
        requestAnimationFrame(() => {
          targetContent.style.opacity = '1';
          targetContent.style.transform = 'translateY(0)';
          
          if (targetTab === 'history') {
            const historyList = document.getElementById('full-history-list');
            if (historyList) {
              setTimeout(() => {
                historyList.style.opacity = '1';
              }, 100);
            }
            loadFullHistory();
          }
        });
      }
    }, 200);
  });
});