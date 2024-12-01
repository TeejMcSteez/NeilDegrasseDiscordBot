// TODO:
//Test the new reminder interface in prod
require('dotenv').config();
const { OpenAI } = require('openai');
const { Client, GatewayIntentBits } = require('discord.js');

const reminders = [];
 
//openAI Key
const openai = new OpenAI ({
    apiKey: process.env.OPEN_API_KEY
    });

//gets R6 PC Status w/ basic JSON parsing
async function getR6Status() {
    const apiUrl =  'https://game-status-api.ubisoft.com/v1/instances?appIds=e3d5ea9e-50bd-43b7-88bf-39794f4e3d40,fb4cc4c9-2063-461d-a1e8-84a7d36525fc,4008612d-3baf-49e4-957a-33066726a7bc,6e3c99c9-6c3f-43f4-b4f6-f1a3143f2764,76f580d5-7f50-47cc-bbc1-152d000bfe59';

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`API call failed with status ${response.status}`);
        }
        const data = await response.json();

        const currentStatus = data[0].Status;

        return currentStatus;
    } catch (error) {
        console.log(error.message);
        return 'Failed to fetch status'
    }
}
//gets S&P 500 w/ basic JSON parsing
async function getSPXMarketStats() {
    const apiUrl = 'https://stockcharts.com/j-sum/sum?cmd=msummary&view=I&r=1719620442400';
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`API call failed with status ${response.status}`);
        }
        const data = await response.json();

        const spxName = data["Major Markets"]["$SPX"]["name"];
        const spxClose = data["Major Markets"]["$SPX"]["close"];
        const spxChange = data["Major Markets"]["$SPX"]["chg"];
        const spxPctChange = data["Major Markets"]["$SPX"]["pct"];

        const marketStatus = [spxName, spxClose, spxChange, spxPctChange]

        return marketStatus;

    } catch (error) {
        console.log(error.message);
    }

}
//gets NYA market status w/ basic JSON parsing
async function getNYAMarketStats() {
    const apiUrl = 'https://stockcharts.com/j-sum/sum?cmd=msummary&view=I&r=1719620442400';
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`API call failed with status ${response.status}`);
        }
        const data = await response.json();

        const NYAName = data["Major Markets"]["$NYA"]["name"];
        const NYAClose = data["Major Markets"]["$NYA"]["close"];
        const NYAChange = data["Major Markets"]["$NYA"]["chg"];
        const NYAPctChange = data["Major Markets"]["$NYA"]["pct"];

        const marketStatus = [NYAName, NYAClose, NYAChange, NYAPctChange];

        return marketStatus;

    } catch (error) {
        console.log(error.message);
    }

}

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
                console.log("\nInterval cleared\n");
            }
        });

    }, 1000); //check every second
}

//create discord client and indentify what modules it will be using
const client = new Client({ intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    ]
 });
//discord bot token
const TOKEN = process.env.DISCORD_BOT_TOKEN;
//once ready displays to console
client.once('ready', () => {
    console.log('Bot is running');
    
});

//async functions
client.on('messageCreate', async (message) => {

    if (message.content === '!commands') {
        message.channel.send(`👨‍💻 Commands 👨‍💻\n\n➡️ !status will check the current status of R6 PC server\n\n➡️ !stocks will get the S&P 500 and NYA price, price change, and percentage change\n\n➡️ !remind "message" year-month-day:hour:minute will set a reminder that @'s the user with the message they've added \n\n➡️ Ask the bot a question by typing "hey neil or neil" followed by the question\n\nMade by: https://teejmcsteez.tech/`);
    }

    if (message.content === '!status') {
        const currentStatus = await getR6Status();
        console.log("User Requested" + currentStatus);
        message.channel.send('Current R6 Status on PC: ' + currentStatus);
    }

    if (message.content === "!stocks") {
        let SPXcurrentMarket = [];
        SPXcurrentMarket.push(await getSPXMarketStats());
        console.log("User Requested" + SPXcurrentMarket);

        message.channel.send(
            SPXcurrentMarket[0][0] + " close is " + SPXcurrentMarket[0][1] + "$ with the current market change being " + SPXcurrentMarket[0][2] + "$ and the percentage change being " + SPXcurrentMarket[0][3] + "%" 
        );

        let NYAcurrentMarket = [];
        NYAcurrentMarket.push(await getNYAMarketStats());
        console.log("User Requested" + NYAcurrentMarket);
        
        message.channel.send(
            NYAcurrentMarket[0][0] + " close is " + NYAcurrentMarket[0][1] + "$ with the current market change being " + NYAcurrentMarket[0][2] + "$ and the percentage change being " + NYAcurrentMarket[0][3] + "%"
        );


        //footer
        message.channel.send(
            "Source: https://stockcharts.com/freecharts/marketsummary.html"
        );
    }

    //start of the OpenAPI Client
    // TODO:
    // replace all the conditionals with some better kind of Q'ing logic like !chat or etc.also add functionality to send chunked data for responses over 2000 words
    if (message.content.startsWith('hey neil') || message.content.startsWith('neil?') || message.content.startsWith('Neil?') || message.content.endsWith('neil?') || message.content.endsWith('Neil?') || message.content.startsWith('neil')) {
        let userMsg = message.content.replace('hey neil', '').trim(); // Trims prompt off message and removes whitespace 
        userMsg = message.content.replace('neil?', '').trim();
        userMsg = message.content.replace('Neil?', '').trim();

        const chatResp = await openai.chat.completions.create({
                messages: [{role: 'user', content: userMsg}],
                model: 'gpt-4o-mini',
            });
        // Checking the length of GPT response  is > 2000
        let resp = chatResp.choices[0].message.content;
        let respLength = resp.length;
        // Chunk handling for response 
        if (respLength > 2000) {
            while (respLength > 2000) {
                message.channel.send(chatResp.choices[0].message.content.slice(0, 2000)); // Slices sent text off array
                respLength -= 2000; // subtracts from response length 
            }
            message.channel.send(chatResp.choices[0].message.content);
        } else {
            message.channel.send(chatResp.choices[0].message.content);
            message.channel.send('Responses Provided by ChatGPT 4o Mini');
            console.log('User Requested Chat Response');
        }
    }

    // if (message.content.startsWith('Hey neil')) {//added secondary interface just in case
    //     const userMsg = message.content.replace('Hey neil', '').trim();        
    //     const chatResp = await openai.chat.completions.create({
    //             messages: [{role: 'user', content: userMsg}],
    //             model: 'gpt-4o-mini',
    //         });
        
    //     message.channel.send(chatResp.choices[0].message.content);
    //     message.channel.send('Responses Provided by ChatGPT 4o Mini')
    //     console.log('User Requested Chat Response');
    //}

    // Reminder Interface
    if (message.content.startsWith('!remind')) {
        let userName = message.author.id; // stores users ID to @
        let userMsg = message.content.replace('!remind ', '').trim(); // Trims reminder off the message for proper handling
        try {
            if (!userName) {
                throw new Error(`There is no username, Verification:${userName}`);
            }

            console.log(`${userName} requested a reminder set`); // Displays the user that requested a reminder to console

            startCountdown(userMsg, userName,(reminder) => { // Starts interval for reminders and setups callback for reminders to send message upon callback
                message.channel.send(`Reminder for <@${reminder.name}>: ${reminder.msg}`);
            });

        } catch (error) {
            message.channel.send(`Failed to set reminder, @${userName}: "${userMsg}"`); // If the users input format is incorrect then display an error
            console.log("Error ", error.message);
        }
        message.channel.send(`reminder added for <@${userName}> succesfully!`); // Displays to console that reminder is successfully added
        console.log(`Reminder request from User ID ${userName} set succesfully`); // Logs reminder request
    }
    
    //something to stop me from getting mad also kind've an easter eggS
    if (message.content === "fuck you") {
        message.channel.send('No, fuck you ')
    }

    if (message.content === "nvm") {
        message.channel.send('its okay i forgive you')
    }
    
});//end async

//starts client
client.login(TOKEN);
