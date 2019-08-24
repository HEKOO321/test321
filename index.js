// Load up the discord.js library
const Discord = require("discord.js");
const config = require("./config.json");
const SQLite = require("better-sqlite3");
const sql = new SQLite('./scores.sqlite');

// This is your client. Some people call it `bot`, some people call it `self`, 
// some might call it `cootchie`. Either way, when you see `client.something`, or `bot.something`,
// this is what we're refering to. Your client.
const client = new Discord.Client();
const https = require('https');
const Cleverbot = require("cleverbot-node");
const clbot = new Cleverbot;

// Here we load the config.json file that contains our token and our prefix values. 
const responseObject = {
  "hi": "Hi!",
  "hello": "Hello!",
  "helloo": "Hello!",
  "hey": "Hello!",
  "heyy": "Hello!",
  "hiii": "Hello!",
  "hola": "Hola amigo!",
  "ily": "I love you too!",
  "lol": "ROFL.",
  "espe": "EmperialsPE is for lyfe.",
  "bye": "See you honey!",
  "bai": "See you honey!",
  "gtg": "I gotta go too!",
  "omg": "OMG!",
  "wtf": "Wednesday, Thursday, Friday. We know what you mean ;)",
  "nice": "Your cheeks are nice, no homo :D"
};

// config.token contains the bot's token
// config.prefix contains the message prefix.
var request = require('request');
var axios = require('axios');
client.on("ready", () => {
  // This event will run if the bot starts, and logs in, successfully.
  console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`); 
  // Example of changing the bot's playing game to something useful. `client.user` is what the
  // docs refer to as the "ClientUser".
  client.user.setActivity(`SkyBlock`);
    const table = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'scores';").get();
    if (!table['count(*)']) {
        // If the table isn't there, create it and setup the database correctly.
        sql.prepare("CREATE TABLE scores (id TEXT PRIMARY KEY, user TEXT, guild TEXT, points INTEGER, level INTEGER);").run();
        // Ensure that the "id" row is always unique and indexed.
        sql.prepare("CREATE UNIQUE INDEX idx_scores_id ON scores (id);").run();
        sql.pragma("synchronous = 1");
        sql.pragma("journal_mode = wal");
    }
    client.getScore = sql.prepare("SELECT * FROM scores WHERE user = ? AND guild = ?");
    client.setScore = sql.prepare("INSERT OR REPLACE INTO scores (id, user, guild, points, level) VALUES (@id, @user, @guild, @points, @level);");
});

client.on("guildCreate", guild => {
  // This event triggers when the bot joins a guild.
  console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
  client.user.setActivity(`Serving ${client.guilds.size} servers`);
});

client.on("guildDelete", guild => {
  // this event triggers when the bot is removed from a guild.
  console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
  client.user.setActivity(`Serving ${client.guilds.size} servers`);
});


client.on("message", async message => {
  // This event will run on every single message received, from any channel or DM.

  // It's good practice to ignore other bots. This also makes your bot ignore itself
  // and not get into a spam loop (we call that "botception").
  if(message.author.bot) return;

  // Also good practice to ignore any message that does not start with our prefix,
  // which is set in the configuration file.
  if(message.content.indexOf(config.prefix) !== 0) return;

  // Here we separate our "command" name, and our "arguments" for the command.
  // e.g. if we have the message "+say Is this the real life?" , we'll get the following:
  // command = say
  // args = ["Is", "this", "the", "real", "life?"]
  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  // Let's go with a few common example commands! Feel free to delete or change those.
  if(responseObject[message.content]) {
    message.channel.send(responseObject[message.content]);
  }
  if(command === "ping") {
    // Calculates ping between sending a message and editing it, giving a nice round-trip latency.
    // The second ping is an average latency between the bot and the websocket server (one-way, not round-trip)
    const m = await message.channel.send("Ping?");
    m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`);
  }
  if(command === "test") {
  	axios.get('http://pmbanners.azurewebsites.net/play.emperials.net/json')
  .then(response => {
    console.log(response.data.currentPlayers);
   message.channel.send("Tesing is finhsed. Successful. Permission granted." + response.data.currentPlayers);
  });
    // Calculates ping between sending a message and editing it, giving a nice round-trip latency.
    // The second ping is an average latency between the bot and the websocket server (one-way, not round-trip)
    message.channel.send("Tesing is finhsed. Successful. Permission granted.");

  }

  const swearWords = ["darn", "shucks", "frak", "shite"];
if( swearWords.some(word => message.content.includes(word)) ) {
  message.reply("Oh no you said a bad word!!!");
  // Or just do message.delete();
}
   if(command === "info") {
 const embed = new Discord.RichEmbed();
 request('https://minecraftpocket-servers.com/api/?object=servers&element=detail&key=yaFjJsbnJL6bRozEPWc6jh18CU1yN87etk', { json: true }, (err, res, body) => {
  if (err) { return console.log(err); }
embed.setColor(0xED360F);
embed.setDescription(body.players + ` Player(s).`);
embed.addField(`SkyBlock`, body.players + ` Player(s)`).setAuthor(`Global`);
embed.addField(`Version`, "v" +body.version);
embed.setThumbnail("https://a.imge.to/2019/05/30/vV5Mk.png");
message.channel.send( { embed: embed } );
});
  }
    if(command === "vote") {
        const embed = new Discord.RichEmbed();
        request('https://minecraftpocket-servers.com/api/?object=servers&element=detail&key=yaFjJsbnJL6bRozEPWc6jh18CU1yN87etk', { json: true }, (err, res, body) => {
            if (err) { return console.log(err); }
            embed.setColor(0xED360F);
            embed.setDescription(body.votes + ` Vote(s)`);
            embed.addField(`Total Score`, body.score + ` Score`).setAuthor(`Total Votes`);
            embed.addField(`Rank`, body.rank);
            embed.addField("Link", "Vote [here](https://discordjs.guide/ 'optional hovertext') and support the server!");
            embed.setTimestamp();
            embed.setFooter("Thank you for voting!");
            embed.setThumbnail("https://a.imge.to/2019/05/30/vV5Mk.png");
            message.channel.send( { embed: embed } );
        });
    }
  if(command === "info1") {
 const embed = new Discord.RichEmbed();
 https.get('https://pmbanners.azurewebsites.net/play.emperials.net/json', (resp) => {
  let data = '';

  // A chunk of data has been recieved.
  resp.on('data', (chunk) => {
    data += chunk;
  });

  // The whole response has been received. Print out the result.
  resp.on('end', () => {
    console.log(JSON.parse(data).explanation);
    embed.setColor(0xED360F);
embed.setDescription(JSON.parse(data).currentPlayers + ` Player(s).`);
embed.addField(`SkyBlock`, JSON.parse(data).currentPlayers + ` Player(s)`).setAuthor(`Global`);
embed.addField(`Anarchy`, `Offline`);
embed.setThumbnail("https://a.imge.to/2019/05/30/vV5Mk.png");
message.channel.send( { embed: embed } );
  });

}).on("error", (err) => {
  console.log("Error: " + err.message);
});
  }
  if (command === "mcCommand") {
        var url = 'http://mcapi.us/server/status?ip=' + mcIP + '&port=' + mcPort;
        request(url, function(err, response, body) {
            if(err) {
                console.log(err);
                return message.reply('Error getting Minecraft server status...');
            }
            body = JSON.parse(body);
            var status = '*Minecraft server is currently offline*';
            if(body.online) {
                status = '**Minecraft** server is **online**  -  ';
                if(body.players.now) {
                    status += '**' + body.players.now + '** people are playing!';
                } else {
                    status += '*Nobody is playing!*';
                }
            }
             message.channel.send(status);
        });
   }

    if (command === "announce") {
        // Check if you can delete the message
        if (message.member.hasPermission('ADMINISTRATOR')) {
            if (message.deletable) message.delete();

            if (args.length < 0) return message.reply(`Nothing to say?`).then(m => m.delete(5000));

            // Role color
            const roleColor = message.guild.me.highestRole.hexColor;
            if (args[0].toLowerCase() === "ping") {
                message.channel.send("[@everyone]" + "\n\n" + args.slice(1).join(" "));
            } else {
                // If the first argument is embed, send an embed,
                // otherwise, send a normal message
                if (args[0].toLowerCase() === "embed") {
                    const embed = new Discord.RichEmbed()
                        .setDescription(args.slice(1).join(" "))
                        .setColor(0xED360F)
                        .setTimestamp()

                    message.channel.send(embed);

                } else {
                    message.channel.send(args.join(" "));
                }

            }
        } else {
            message.channel.send("You don't have permission to use this command.");
        }
    }

   if(command === "help") {
   	const embed = new Discord.RichEmbed();
   	embed.setColor(0xED360F);
   	embed.setThumbnail("https://a.imge.to/2019/05/30/vV5Mk.png");
   	embed.setAuthor("My specialities:", "https://a.imge.to/2019/05/30/vV5Mk.png");
   	embed.addField("IP", "Check EmperialsPE server IP.");
   	embed.addField("Info", "Check online player(s) on all server(s).");
       embed.addField("Vote", "Check online server voting status.");
   	embed.addField("Links", "Link(s) relating the server.");
   	embed.addField("Ping", "See your ping.");
   	embed.setFooter("Thank you for viewing my specialities.", "https://a.imge.to/2019/05/30/vV5Mk.png");
       message.channel.send( { embed: embed } );
   	const heart = client.emojis.find(emoji => emoji.name === "heart");
   }
    if(command === "links") {
        const embed = new Discord.RichEmbed();
        embed.setColor(0xED360F);
        embed.setThumbnail("https://a.imge.to/2019/05/30/vV5Mk.png");
        embed.addField("Shop", "https://shop.emperials.com/");
        embed.addField("Discord", "https://discord.emperials.com/");
        embed.addField("Vote", "https://vote.emperials.com/");
        embed.addField("Employee Application", "ihttps://apply.emperials.com/");
        message.channel.send( { embed: embed } );
        const heart = client.emojis.find(emoji => emoji.name === "heart");
    }

    if(command === "ip") {
        const embed = new Discord.RichEmbed();
        embed.setColor(0xED360F);
        embed.setThumbnail("https://a.imge.to/2019/05/30/vV5Mk.png");
        embed.addField("IP", "play.emperials.net");
        embed.addField("Port", "19132");
        embed.setFooter("We hope to see you there!");
        message.channel.send( { embed: embed } );
        const heart = client.emojis.find(emoji => emoji.name === "heart");
    }
  if(command === "kick") {
    // This command must be limited to mods and admins. In this example we just hardcode the role names.
    // Please read on Array.some() to understand this bit:
    // https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/some?
    if(!message.member.roles.some(r=>["Administrator", "Moderator"].includes(r.name)) )
      return message.reply("Sorry, you don't have permissions to use this!");

    // Let's first check if we have a member and if we can kick them!
    // message.mentions.members is a collection of people that have been mentioned, as GuildMembers.
    // We can also support getting the member by ID, which would be args[0]
    let member = message.mentions.members.first() || message.guild.members.get(args[0]);
    if(!member)
      return message.reply("Please mention a valid member of this server");
    if(!member.kickable)
      return message.reply("I cannot kick this user! Do they have a higher role? Do I have kick permissions?");

    // slice(1) removes the first part, which here should be the user mention or ID
    // join(' ') takes all the various parts to make it a single string.
    let reason = args.slice(1).join(' ');
    if(!reason) reason = "No reason provided";

    // Now, time for a swift kick in the nuts!
    await member.kick(reason)
      .catch(error => message.reply(`Sorry ${message.author} I couldn't kick because of : ${error}`));
    message.reply(`${member.user.tag} has been kicked by ${message.author.tag} because: ${reason}`);

  }

  if(command === "ban") {
    // Most of this command is identical to kick, except that here we'll only let admins do it.
    // In the real world mods could ban too, but this is just an example, right? ;)
    if(!message.member.roles.some(r=>["Administrator"].includes(r.name)) )
      return message.reply("Sorry, you don't have permissions to use this!");

    let member = message.mentions.members.first();
    if(!member)
      return message.reply("Please mention a valid member of this server");
    if(!member.bannable)
      return message.reply("I cannot ban this user! Do they have a higher role? Do I have ban permissions?");

    let reason = args.slice(1).join(' ');
    if(!reason) reason = "No reason provided";

    await member.ban(reason)
      .catch(error => message.reply(`Sorry ${message.author} I couldn't ban because of : ${error}`));
    message.reply(`${member.user.tag} has been banned by ${message.author.tag} because: ${reason}`);
  }

  if(command === "purge") {
    // This command removes all messages from all users in the channel, up to 100.

    // get the delete count, as an actual number.
    const deleteCount = parseInt(args[0], 10);

    // Ooooh nice, combined conditions. <3
    if(!deleteCount || deleteCount < 2 || deleteCount > 100)
      return message.reply("Please provide a number between 2 and 100 for the number of messages to delete");

    // So we get our messages, and delete them. Simple enough, right?
    const fetched = await message.channel.fetchMessages({limit: deleteCount});
    message.channel.bulkDelete(fetched)
      .catch(error => message.reply(`Couldn't delete messages because of: ${error}`));
  }
});
client.on("message", message => {
    if (message.channel.type === "dm") {
        clbot.write(message.content, (response) => {
            message.channel.startTyping();
            setTimeout(() => {
                message.channel.send(response.output).catch(console.error);
                message.channel.stopTyping();
            }, Math.random() * (1 - 3) + 1 * 1000);
        });
    }
});
client.on("message", message => {
    if (message.author.bot) return;
    let score;
    if (message.guild) {
        score = client.getScore.get(message.author.id, message.guild.id);
        if (!score) {
            score = { id: `${message.guild.id}-${message.author.id}`, user: message.author.id, guild: message.guild.id, points: 0, level: 1 }
        }
        score.points++;
        const curLevel = Math.floor(0.1 * Math.sqrt(score.points));
        if(score.level < curLevel) {
            score.level++;
            message.reply(`You've leveled up to level **${curLevel}**! Ain't that dandy?`);
        }
        client.setScore.run(score);
    }
    if (message.content.indexOf(config.prefix) !== 0) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    if(command === "points") {
        const embed = new Discord.RichEmbed()
            .setAuthor("You are on level "+score.level+" with " +score.points+" point(s)!")
            .setFooter("You can view top member(s) by typing /leaderboard!", "https://a.imge.to/2019/05/30/vV5Mk.png")
            .setColor(0xED360F);
        return message.channel.send({embed});
    }
    if(command === "leaderboard") {
        const top10 = sql.prepare("SELECT * FROM scores WHERE guild = ? ORDER BY points DESC LIMIT 10;").all(message.guild.id);

        // Now shake it and show it! (as a nice embed, too!)
        const embed = new Discord.RichEmbed()
            .setTitle("Leaderboard")
            .setDescription("Top Ten discord Member(s).")
            .setColor(0xED360F)
            .setFooter("Thank you vor viewing top ten member(s)!", "https://a.imge.to/2019/05/30/vV5Mk.png")
            .setThumbnail("https://a.imge.to/2019/05/30/vV5Mk.png");

        for(const data of top10) {
            embed.addField(client.users.get(data.user).tag, `${data.points} points (level ${data.level})`);
        }
        return message.channel.send({embed});
    }
    // Command-specific code here!
});
client.login(config.token);