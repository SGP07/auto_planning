const weekDisplay = document.getElementById('currentWeek');
const prevWeekBtn = document.getElementById('prevWeek');
const nextWeekBtn = document.getElementById('nextWeek');


// Load the saved API result from localStorage when the website loads
document.addEventListener('DOMContentLoaded', function() {
  const savedData = localStorage.getItem('apiResult');
  if (savedData) {
    const data = JSON.parse(savedData);
    const resultContainer = document.getElementById('resultContainer');

    // Append the saved message and API result
    const messageContainer = document.createElement('h3');
    messageContainer.innerHTML = data.message;
    resultContainer.appendChild(messageContainer);
    resultContainer.innerHTML += data.data.html;

    // Add CSS to <style> tag in <head>
    const styleTag = document.createElement('style');
    styleTag.innerHTML = data.data.css;
    document.head.appendChild(styleTag);
  }
});


// Function to format date as "dd mmm" (e.g., "24 Feb")
const formatDate = (date) => {
  const options = { day: 'numeric', month: 'short' };
  return new Intl.DateTimeFormat('en-US', options).format(date);
};

// Function to update week display
const updateWeekDisplay = (startOfWeek, endOfWeek) => {
  weekDisplay.textContent = `${formatDate(startOfWeek)} - ${formatDate(endOfWeek)}`;
};

// Function to display a message
const displayMessage = (message, isSuccess) => {
  const messageContainer = document.getElementById('messageContainer');
  messageContainer.textContent = message;
  messageContainer.style.display = 'block';
  messageContainer.style.backgroundColor = isSuccess ? '#4CAF50' : '#f44336'; // Green for success, red for error
  setTimeout(() => {
    messageContainer.style.display = 'none'; // Hide the message after 3 seconds
  }, 3000);
};

// Function to show the loading circle
const showLoadingCircle = () => {
  document.getElementById('loadingCircle').style.display = 'block';
};

// Function to hide the loading circle
const hideLoadingCircle = () => {
  document.getElementById('loadingCircle').style.display = 'none';
};

const displayPlanningMessage = (group1, group2, startOfWeek, endOfWeek) => {
  const messageContainer = document.createElement('h3');
  const formattedStartOfWeek = formatDate(startOfWeek);
  const formattedEndOfWeek = formatDate(endOfWeek);
  messageContainer.innerHTML = `Groups: ${group1} and ${group2}<br>Week: ${formattedStartOfWeek} - ${formattedEndOfWeek}`;
  document.getElementById('resultContainer').prepend(messageContainer);
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
  
    // Check if the file is selected
    if (!file) {
      displayMessage('Please select a file', false, 'error'); // Display error message
      return;
    }
  
    // Check if any field is empty
    if (group1.trim() === '' || group2.trim() === '') {
      displayMessage('Please fill in all fields', false, 'error'); // Display error message
      return;
    }
  
    showLoadingCircle(); // Show the loading circle
  
    const formData = new FormData();
    formData.append('file', file, file.name);
  
    try {
      const url = `https://auto-planning.vercel.app/uploadfile/?tp=${group1}&td=${group2}&selected_week=${weekOffset}&flip=${flip}`;
  
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
  
      displayMessage('Submitted successfully', true, 'success');
      displayPlanningMessage(group1, group2, startOfWeek, endOfWeek);
     // Save the API result to localStorage
     const apiResult = {
      message: `Groups: ${group1} and ${group2}<br>Week: ${formatDate(startOfWeek)} - ${formatDate(endOfWeek)}`,
      data: data
    };
    localStorage.setItem('apiResult', JSON.stringify(apiResult));
    } catch (error) {
      alert('An error occurred');
      console.error(error);
    } finally {
      hideLoadingCircle(); // Hide the loading circle
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
