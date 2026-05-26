export const getStandardizedToday = () => {
  const date = new Date();
  
  const offset = 5.5 * 60 * 60 * 1000; 
  const istTime = new Date(date.getTime() + (date.getTimezoneOffset() * 60000) + offset);
  
  const year = istTime.getFullYear();
  const month = String(istTime.getMonth() + 1).padStart(2, "0");
  const day = String(istTime.getDate()).padStart(2, "0");
  
  return `${year}-${month}-${day}`; // Always matches "YYYY-MM-DD" cleanly
};