function formatTime(time) {
  if (!time) return null;
  
  // Handling PostgreSQL TIME type "HH:MM:SS"
  if (typeof time === 'string') {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours % 12 || 12;
    return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;
  }
  
  // Handle Date objects
  if (time instanceof Date) {
    const hours = time.getHours();
    const minutes = time.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours % 12 || 12;
    return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;
  }

  console.error('Invalid time format:', time);
  return null;
}

module.exports = {
  formatTime
}; 