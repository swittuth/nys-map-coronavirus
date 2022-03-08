const current_date = new Date();
current_date.setDate(current_date.getDate() + 210);

console.log(current_date.getFullYear());

// getDate() is get the current day of the month 
// getMonth() returns the index of month 0-11 -> need to add one 
// getFullYear() to get year 
