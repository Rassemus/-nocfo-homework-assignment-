
// Returns the current date
export const DateNow = () => {
    return new Date();
  }
//Returns date string (date - month - year)
export const DateToString = (date) => {
    const dateString = `${date.getDate()}-${date.getMonth()}-${date.getFullYear()}`
    return dateString;
  }

// Returns the days to the next task
export const DateCounter = (dateNow, nextDate) => {
    if(nextDate){
        const daysTo = Math.floor((new Date(nextDate) - dateNow) / (1000 * 60 * 60 * 24))
        return daysTo;
    }else{
        return;
    }
  }
//Returns true or false depending on whether the condition is fulfilled
export const IsAlert = (daysToNext, alertLvl) => {
  const isAlert = daysToNext < alertLvl;
  return isAlert;
}