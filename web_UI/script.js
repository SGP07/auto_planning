// DOM Elements
const weekDisplay = document.getElementById('currentWeek');
const prevWeekBtn = document.getElementById('prevWeek');
const nextWeekBtn = document.getElementById('nextWeek');
const uploadForm = document.getElementById('uploadForm');
const resultContainer = document.getElementById('resultContainer');
const messageContainer = document.getElementById('messageContainer');
const loadingCircle = document.getElementById('loadingCircle');
const feedbackButton = document.getElementById('toggleFeedback');
const feedbackIframe = document.getElementById('feedback');
const colorPickers = {
  CM: document.getElementById("CMcolorPicker"),
  TP: document.getElementById("TPcolorPicker"),
  TD: document.getElementById("TDcolorPicker")
};

// Date handling
let currentDate = new Date();
let weekOffset = 0;
let startOfWeek = new Date(currentDate);
let day = startOfWeek.getDay(); // Get current day (0-6)
startOfWeek.setDate(startOfWeek.getDate() - (day === 0 ? 6 : day - 1)); // Adjust to Monday

let endOfWeek = new Date(startOfWeek);
endOfWeek.setDate(startOfWeek.getDate() + 6);

// Helper functions
const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short' }).format(date);
};

const updateWeekDisplay = () => {
  weekDisplay.textContent = `${formatDate(startOfWeek)} - ${formatDate(endOfWeek)}`;
};

const displayMessage = (message, isSuccess) => {
  messageContainer.textContent = message;
  messageContainer.style.display = 'block';
  messageContainer.style.backgroundColor = isSuccess ? '#4CAF50' : '#f44336';
  setTimeout(() => messageContainer.style.display = 'none', 3000);
};

const toggleLoadingCircle = (show) => {
  loadingCircle.style.display = show ? 'flex' : 'none';
};

const displayPlanningMessage = (group1, group2) => {
  const messageElement = document.createElement('h3');
  messageElement.innerHTML = `Groups: ${group1} and ${group2}<br>Week: ${formatDate(startOfWeek)} - ${formatDate(endOfWeek)}`;
  resultContainer.prepend(messageElement);
};

// Week navigation
const updateWeek = (offset) => {
  weekOffset += offset;
  startOfWeek.setDate(startOfWeek.getDate() + offset * 7);
  endOfWeek.setDate(endOfWeek.getDate() + offset * 7);
  updateWeekDisplay();
};

// Color handling
const setColor = () => {
  Object.entries(colorPickers).forEach(([className, input]) => {
    document.querySelectorAll(`.${className}`).forEach(element => {
      element.style.backgroundColor = input.value;
    });
  });
  localStorage.setItem('selectedColors', JSON.stringify(Object.fromEntries(
    Object.entries(colorPickers).map(([key, input]) => [key, input.value])
  )));
};

// Form submission
const handleSubmit = async (event) => {
  event.preventDefault();
  const fileInput = document.getElementById('file');
  const file = fileInput.files[0];
  const group1 = document.getElementById('group1').value.trim().toUpperCase();
  const group2 = document.getElementById('group2').value.trim().toUpperCase();
  const flip = document.getElementById('flip').value === 'true';

  if (!file) return displayMessage('Please select a file', false);

  toggleLoadingCircle(true);
  const formData = new FormData();
  formData.append('file', file, file.name);

  try {
    let url = `https://auto-planning.vercel.app/uploadfile/?selected_week=${weekOffset}&flip=${flip}`;
    if (group1) url += `&tp=${group1}`;
    if (group2) url += `&td=${group2}`;
    
    const response = await fetch(url, { method: 'POST', body: formData });
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();

    resultContainer.innerHTML = data.html;
    const styleTag = document.createElement('style');
    styleTag.innerHTML = data.css;
    document.head.appendChild(styleTag);

    displayMessage('Submitted successfully', true);
    displayPlanningMessage(group1, group2);

    localStorage.setItem('apiResult', JSON.stringify({
      message: `Groups: ${group1 || ''} ${group2 ? `and ${group2}` : ''}<br>Week: ${formatDate(startOfWeek)} - ${formatDate(endOfWeek)}`,
      data: data
    }));
  } catch (error) {
    console.error('Error:', error);
    displayMessage('An error occurred. Please try again.', false);
  } finally {
    toggleLoadingCircle(false);
  }
};
// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Load saved data
  const savedData = JSON.parse(localStorage.getItem('apiResult'));
  if (savedData) {
    const messageElement = document.createElement('h3');
    messageElement.innerHTML = savedData.message;
    resultContainer.appendChild(messageElement);
    resultContainer.innerHTML += savedData.data.html;

    const styleTag = document.createElement('style');
    styleTag.innerHTML = savedData.data.css;
    document.head.appendChild(styleTag);
  }

  const savedColors = JSON.parse(localStorage.getItem('selectedColors'));
  if (savedColors) {
    Object.entries(savedColors).forEach(([key, value]) => {
      colorPickers[key].value = value;
    });
    setColor();
  }

  updateWeekDisplay();
});

prevWeekBtn.addEventListener('click', () => updateWeek(-1));
nextWeekBtn.addEventListener('click', () => updateWeek(1));
uploadForm.addEventListener('submit', handleSubmit);
feedbackButton.addEventListener('click', () => {
  feedbackIframe.style.display = feedbackIframe.style.display === 'none' ? 'block' : 'none';
});

Object.values(colorPickers).forEach(input => input.addEventListener('input', setColor));

// Image download
$("#downloadImage").on('click', function(){
  html2canvas($("#resultContainer")[0]).then(canvas => {
    const imageData = canvas.toDataURL("image/jpg");
    const newData = imageData.replace(/^data:image\/jpg/, "data:application/octet-stream");
    this.href = newData;
  });
});