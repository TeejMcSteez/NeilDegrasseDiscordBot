//Reminder Interface
function parseMessage(input) {
    const regex = /^(.*?)(\d+-\d+-\d+)(?::(\d+):(\d+))?$/; // Input formatting
    const match = input.match(regex); // Matches users input to formatted input and if not throws error

    if (!match) {
        throw new Error("Invalid Input format!");
        // try {
        //        const checkRegex = /^(.*?)(\d+):(\d+)?$/; 

        // } catch (error) {
        //     console.log(`Invalid input format and could not normalize: ${error.message}`);
        //     message.channel.send(`Invalid Input format: ${error.message}`);
        // }
    }
    //extracting message and date
    const message = match[1].trim();
    const year = parseInt(match[2].split('-')[0], 10); //extracts year
    const month = parseInt(match[2].split('-')[1], 10); //extracts year
    const day = parseInt(match[2].split('-')[2], 10); //extracts year
    const hr = match[3] ? parseInt(match[3], 10) : 8; //parses hour and if no hour is selected defaults to hr 8 (am)
    const min = match[4] ? parseInt(match[4], 10) : 0; //parses hour and if no hour is selected defaults to min 0 (am)

    return {
        message, 
        year, 
        month, 
        day,    
        hr, 
        min
    };
}
// Starts interval for reminders
function startCountdown(userMsg, name, callback) {
    const reminders = [];

    const data = parseMessage(userMsg);

    const targetDate = new Date(); // creates new date object (I think)
    targetDate.setFullYear(data.year, data.month - 1, data.day); // modifys date to the user specified date
    targetDate.setHours(data.hr, data.min, 0, 0); // modifys hour to user specified hours 
    const msg = data.message;
    const USER_NAME = name; 
    let now = new Date(); //getting current date to find offsetf
    console.log(`\nCurrent Date of Request ${now}`);
    reminders.push({msg, tgtDay: data.day, tgtMonth: data.month, tgtYear: data.year, tgtHr: data.hr, tgtMin: data.min, name: USER_NAME}); //
    console.log("New reminder started for user ID " + USER_NAME);

    // checking time diff
    const interval = setInterval(() => {
        
        now = new Date();

        reminders.forEach((reminder, index) => {
            let timeDiff = false;// Error here the time difference subtraction does not work prob have to check each integer a pop
            if ((reminder.tgtDay - now.getDate()) <= 0 && ((reminder.tgtMonth - 1) - now.getMonth()) <= 0 && (reminder.tgtYear - now.getFullYear()) <= 0 && (reminder.tgtHr - now.getHours()) <= 0 && (reminder.tgtMin - now.getMinutes()) <= 0) {
                timeDiff = true;
            } else {
                // Used for debug
                // console.log(`Reminder ${index + 1}`);
                // console.log(`Year in UTC ${now.getFullYear()}`);
                // console.log(`Month in UTC ${now.getMonth()}`);
                // console.log(`Day in UTC ${now.getDate()}`);
                // console.log(`Hour in UTC ${now.getHours()}`);
                // console.log(`Minute in UTC ${now.getMinutes()}`);
                
                // console.log(`\nReminder ${index + 1}`);
                // console.log(`User Year ${reminder.tgtYear}`);
                // console.log(`User Month ${reminder.tgtMonth}`);
                // console.log(`User Day ${reminder.tgtDay}`);
                // console.log(`User Hour ${reminder.tgtHr}`);
                // console.log(`User Minute ${reminder.tgtMin}`);

                // console.log(`\nReminder ${index + 1}`);
                // console.log(`math year ${reminder.tgtYear - now.getFullYear()}`);
                // console.log(`math month ${(reminder.tgtMonth - 1) - now.getMonth()}`);
                // console.log(`math day ${reminder.tgtDay - now.getDate()}`);
                // console.log(`math hours ${reminder.tgtHr - now.getHours()}`);
                // console.log(`math minutes ${reminder.tgtMin - now.getMinutes()}`);
            }

            if (timeDiff === true) {
                callback(reminder);
                reminders.splice(index, 1);
                
            }

            if (reminders.length === 0) {
                clearInterval(interval);
                console.log("\nReminder Interval cleared\n");
            }
        });

    }, 1000); //check every second
}
// Logging Interface
let logs = [], counter = 0;
function checkUser(id) {
    if (logs.length === 0) { // If there are no logs returns 0 to continue
        console.log("There are no users to check");
        counter++;
        return 0;
    } 

    const user = logs.find(user => user.USER_ID === id);
    const MAX_RESPONSE_LENGTH = 5000;
    //if there is a matching user and response length is greater than make returns 1
    if (user && user.RESP_LENGTH > MAX_RESPONSE_LENGTH) {
        console.log(`User ${user.USER_ID} has reached limit\nUsers Current Length: ${user.RESP_LENGTH}`);
        return 1;
    }

    return 0;
}
function logResponse(id, len) {
   const existingUser = logs.findIndex(user => user.USER_ID === id);

   if (existingUser !== -1) {
        logs[existingUser].RESP_LENGTH += len;
        console.log(`User ${logs[existingUser].USER_ID} is at length ${logs[existingUser].RESP_LENGTH}`);
   } else {
        logs.push({USER_ID: id, RESP_LENGTH: len, Start: new Date().getDate()});
        console.log(`New user ${id} added with length ${len}`);
        console.log("Started Interval for timing");
   }
   if (counter === 1) { // Upon first user input starts timer
        startTimer();
   }
}
function startTimer() {
      // Upon calling function starts interval to know when to clear the log (everyday)
      let logInterval = setInterval(function() {
        let now = new Date();
        logs.forEach(user => {
            if (user.Start < now.getDate() || (now.getDate() === 1 && user.Start > 27)) { // if the next day is here or past OR it is the first of the month then clears users response length 
                clearUsersLengths();
                user.Start = now.getDate();
                console.log(`\nLogs Cleared on ${now.getFullYear()}-${now.getMonth()}-${now.getDate()}:${now.getHours()}:${now.getMinutes()}`);
            }
        }); 
    },  600000); // Executes every 10 minutes
}
function clearUsersLengths() {
    logs.forEach(user => {
        user.RESP_LENGTH = 0;
        console.log(`Cleared user ${user.USER_ID}: Response Lenght = ${user.RESP_LENGTH}`);
    });
}
//exporting functions
module.exports = {startCountdown, checkUser, logResponse};