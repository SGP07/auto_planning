const weekDisplay = document.getElementById('currentWeek');
const prevWeekBtn = document.getElementById('prevWeek');
const nextWeekBtn = document.getElementById('nextWeek');

// Function to format date as "dd mmm" (e.g., "24 Feb")
const formatDate = (date) => {
  const options = { day: 'numeric', month: 'short' };
  return new Intl.DateTimeFormat('en-US', options).format(date);
};

// Function to update week display
const updateWeekDisplay = (startOfWeek, endOfWeek) => {
  weekDisplay.textContent = `${formatDate(startOfWeek)} - ${formatDate(endOfWeek)}`;
};
// Get the current date
let currentDate = new Date();
let weekOffset = 0; // Initialize week offset

// Find the first day of the current week (assuming Monday is the first day of the week)
let startOfWeek = new Date(currentDate);
startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + (currentDate.getDay() === 0 ? -6 : 1) + weekOffset * 7); // Monday

// Find the last day of the current week
let endOfWeek = new Date(startOfWeek);
endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday

// Update week display with the current week
updateWeekDisplay(startOfWeek, endOfWeek);

// Event listener for previous week button
prevWeekBtn.addEventListener('click', () => {
  weekOffset--; // Move back 1 week
  startOfWeek.setDate(startOfWeek.getDate() - 7); // Monday of the new week
  endOfWeek.setDate(endOfWeek.getDate() - 7); // Sunday of the new week
  updateWeekDisplay(startOfWeek, endOfWeek);
});

// Event listener for next week button
nextWeekBtn.addEventListener('click', () => {
  weekOffset++; // Move forward 1 week
  startOfWeek.setDate(startOfWeek.getDate() + 7); // Monday of the new week
  endOfWeek.setDate(endOfWeek.getDate() + 7); // Sunday of the new week
  updateWeekDisplay(startOfWeek, endOfWeek);
});



document.getElementById('uploadForm').addEventListener('submit', async function(event) {
  event.preventDefault();
  
  const fileInput = document.getElementById('file');
  const file = fileInput.files[0];
  const group1 = document.getElementById('group1').value.toUpperCase();
  const group2 = document.getElementById('group2').value.toUpperCase();
  const flip = document.getElementById('flip').value === 'true';

  const formData = new FormData();
  formData.append('file', file, file.name);

  try {
    const url = `https://auto-planner-by-rayan-api.vercel.app/uploadfile/?tp=${group1}&td=${group2}&selected_week=${weekOffset}&flip=${flip}`; 
    const response = await fetch(url, {
      method: 'POST',
      body: formData
    });
    const data = await response.json();

    // Display the HTML result
    const resultContainer = document.getElementById('resultContainer');
    resultContainer.innerHTML = data.html;
    console.log("loaded")

    // Add CSS to <style> tag in <head>
    const styleTag = document.createElement('style');
    styleTag.innerHTML = data.css;
    document.head.appendChild(styleTag);
  } catch (error) {
    alert('An error occurred');
    console.error(error);
  }
});

document.addEventListener('DOMContentLoaded', function() {
  var feedbackButton = document.getElementById('toggleFeedback');
  var feedbackIframe = document.getElementById('feedback');

  feedbackButton.addEventListener('click', function() {
    if (feedbackIframe.style.display === 'none') {
      feedbackIframe.style.display = 'block';
    } else {
      feedbackIframe.style.display = 'none';
    }
  });
});
