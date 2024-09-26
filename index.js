require('dotenv').config();
const { OpenAI } = require('openai');
const { Client, GatewayIntentBits } = require('discord.js');
 
//openAI Key
const openai = new OpenAI ({
    apiKey: process.env.OPEN_API_KEY
    });

//gets R6 PC Status
async function getR6Status() {
    const apiUrl =  'https://game-status-api.ubisoft.com/v1/instances?appIds=e3d5ea9e-50bd-43b7-88bf-39794f4e3d40,fb4cc4c9-2063-461d-a1e8-84a7d36525fc,4008612d-3baf-49e4-957a-33066726a7bc,6e3c99c9-6c3f-43f4-b4f6-f1a3143f2764,76f580d5-7f50-47cc-bbc1-152d000bfe59';

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('API call failed with status ${response.status}');
        }
        const data = await response.json();

        const currentStatus = data[0].Status;

        return currentStatus;
    } catch (error) {
        console.log(error.message);
        return 'Failed to fetch status'
    }
}
//gets S&P 500 
async function getSPXMarketStats() {
    const apiUrl = 'https://stockcharts.com/j-sum/sum?cmd=msummary&view=I&r=1719620442400';
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('API call failed with status ${response.status}');
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
//gets NYA market status 
async function getNYAMarketStats() {
    const apiUrl = 'https://stockcharts.com/j-sum/sum?cmd=msummary&view=I&r=1719620442400';
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('API call failed with status ${response.status}');
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

//asynchronous interface functions
client.on('messageCreate', async (message) => {

    if (message.content === '!commands') {
        message.channel.send('👨‍💻 Commands 👨‍💻\n\n➡️ !status will check the current status of R6 PC server\n\n➡️ !stocks will get the S&P 500 and NYA price, price change, and percentage change\n\n➡️ Ask the bot a question by typing "hey neil" followed by the question\n\nMade by: https://teejmcsteez.tech/');
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
    if (message.content.startsWith('hey neil')) {
        const userMsg = message.content.replace('hey neil', '').trim();        
        const chatResp = await openai.chat.completions.create({
                messages: [{role: 'user', content: userMsg}],
                model: 'gpt-3.5-turbo',
            });
        
        message.channel.send(chatResp.choices[0].message.content);
        message.channel.send('Responses Provided by ChatGPT 3.5T.')
        console.log('User Requested Chat Response');
    }

    if (message.content.startsWith('Hey neil')) {
        const userMsg = message.content.replace('Hey neil', '').trim();        
        const chatResp = await openai.chat.completions.create({
                messages: [{role: 'user', content: userMsg}],
                model: 'gpt-3.5-turbo',
            });
        
        message.channel.send(chatResp.choices[0].message.content);
        message.channel.send('Responses Provided by ChatGPT 3.5T.')
        console.log('User Requested Chat Response');
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
