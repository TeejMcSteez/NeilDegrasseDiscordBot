require('dotenv').config();
const { OpenAI } = require('openai');
const { Client, GatewayIntentBits } = require('discord.js');
const {startCountdown, logResponse, checkUser} = require('./utils.js'); 

//gets R6 PC Status w/ basic JSON parsing
async function getR6Status() {
    const apiUrl =  'https://game-status-api.ubisoft.com/v1/instances?appIds=e3d5ea9e-50bd-43b7-88bf-39794f4e3d40,fb4cc4c9-2063-461d-a1e8-84a7d36525fc,4008612d-3baf-49e4-957a-33066726a7bc,6e3c99c9-6c3f-43f4-b4f6-f1a3143f2764,76f580d5-7f50-47cc-bbc1-152d000bfe59';

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`API call failed with status ${response.status}`);
        }
        const data = await response.json();

        const currentStatus = data[0].Status; // data to collect from websites JSON file

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
        // data to collect from websites JSON file
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
        // data to collect from websites JSON file
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
 
//openAI Key
const openai = new OpenAI ({
    apiKey: process.env.OPEN_API_KEY
    });


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
    // replace all the conditionals with some better kind of Q'ing logic like !chat or etc.also make chunking of messages better maybe expand them into an array and directly send the array? Do more research
    if (message.content.startsWith('hey neil') || message.content.startsWith('neil?') || message.content.startsWith('Neil?') || message.content.endsWith('neil?') || message.content.endsWith('Neil?') || message.content.startsWith('neil')) {
        let userMsg = message.content.replace('hey neil', '').trim(); // Trims prompt off message and removes whitespace 
        userMsg = message.content.replace('neil?', '').trim(); // Trims prompt off message and removes whitespace 
        userMsg = message.content.replace('Neil?', '').trim(); // Trims prompt off message and removes whitespace 
    
        if (checkUser(message.author.id) === 0) { // Checks if author has reached max response length
            const chatResp = await openai.chat.completions.create({
                    messages: [{role: 'user', content: userMsg}],
                    model: 'gpt-4o-mini',
                });
            // Checking the length of GPT response  is > 2000 or 5000
            let resp = chatResp.choices[0].message.content;
            let respLength = resp.length;

            try {
                logResponse(message.author.id, respLength);
            } catch (error) {
                console.log(error.message);
            }

            // Chunk handling for response 
            if (respLength > 2000) {
                let len = respLength;
                let index = 0 // Start of slice
                let MAX_BOUND = 2000 // End of first slice
                while (len > 2000) { // Sends each message 2000 words at a time
                    message.channel.send(resp.slice(index, MAX_BOUND)); 
                    index += 2000; // updates starting position up 2000
                    MAX_BOUND += 2000 // Moves max bound up 2000 to account for new max position
                    len -= 2000; // Subtracts sliced amount from response length to check updated length
                }
                message.channel.send(resp.slice(index, respLength)); // Once length < 2000 sends the rest of the message by starting at the updated index and ending at the remaining length
                message.channel.send('Responses Provided by ChatGPT 4o Mini');
                console.log('User Requested Chat Response');
            } else { // If response can be sent in one message sends it
                message.channel.send(resp);
                message.channel.send('Responses Provided by ChatGPT 4o Mini');
                console.log('User Requested Chat Response');
            }
        } else {
            message.channel.send("You have reached max response length for today . . . Download the app stop using my bot");
        }
    }
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
            message.channel.send(`Failed to set reminder <@${userName}>: **"${userMsg}"** is of invalid format. \nFormat is "**!remind** ***message*** **20xx-xx-xx:hr:mn**"`); // If the users input format is incorrect then display an error
            console.log("Error ", error.message);
        }
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