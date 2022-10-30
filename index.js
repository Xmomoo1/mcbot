const fs = require("fs");
const config = require("./config.json");
const { Client, Message, BaseGuildVoiceChannel, BitField, Collection } = require("discord.js")
const mineflayer = require("mineflayer")
const autoAuth = require("mineflayer-auto-auth")
const { Movements, pathfinder } = require("mineflayer-pathfinder")
const { GoalBreakBlock } = require("mineflayer-pathfinder/lib/goals");
const { GoalXZ, GoalBlock, GoalY, GoalNear } = require("mineflayer-pathfinder").goals
const autoeat = require('mineflayer-auto-eat')
const armorManager = require("mineflayer-armor-manager")
const client = new Client({
    intents: 3243773
})

client.commands = new Collection;


client.on("rateLimit", (data) => {
    console.log("Rate limit: ");
    console.log(data)
})

const bot = new mineflayer.createBot({
    host: "gothamnetwork.net",
    username: "mehh",
    version: "1.17.1",
    plugins: [autoAuth],
    AutoAuth: {
        password: "esraa123",
        logging: true
    }
})

console.log(mineflayer.bot)
bot.loadPlugin(pathfinder);
bot.loadPlugin(require('mineflayer-collectblock').plugin)
bot.loadPlugin(autoeat);
bot.loadPlugin(armorManager)

let mcData;
let defaultMove;

bot.on("spawn", () => {
    // bot.chat("mehh", "hi")
})
bot.on("serverAuth", () => {
    console.log("Logged in");
    bot.chat("mehh", "hi")
    mcData = require("minecraft-data")(bot.version);
    defaultMove = new Movements(bot, mcData);

    if (config.join_message.enabled) {
        if (config.join_message.isCommand) {
            bot.chat("/" + config.join_message.message);
        } else {
            bot.chat(config.join_message.message);
        }
    }
})

client.on("messageCreate", async (message) => {
    if (!message.content.startsWith(config.prefix)) {
        if (message.author.bot) return;
        if (message.channel.id == config.discord_log.chat_channel.channel_ID) {
            bot.chat(message.content);
        }
    }
})

client.on("ready", () => {
    console.log("I'm Ready!")
    const guild = client.guilds.cache.get(config.discord_log.guild_ID);
    if (!guild) return console.log("invalid guild id... disabling discord logging...");
    console.log("Guild check: done")

    const channel = guild.channels.cache.get(config.discord_log.chat_channel.channel_ID)
    console.log("Channel check: done")

    if (channel) {
        console.log("Channel hooked")

        bot.on("message", async (msg) => {
            const msgStr = msg.toString();
            const [completeMsg, username, message] = msgStr.match(/(.*) » (.*)/) || [msgStr];

            if (typeof (completeMsg) == "string") {
                try {
                    const c = client.channels.cache.find(ch => ch.id == config.discord_log.chat_channel.channel_ID);
                    config.discord_log.chat_channel.ignore.map(ch => {
                        if (completeMsg == ch) {
                            return;
                        }
                    })
                    config.discord_log.chat_channel.fast_replies.map(fr => {
                        for (const [key, value] of Object.entries(fr)) {
                            if (completeMsg == key) {
                                bot.chat(value);
                                break;
                            }
                        }
                    })
                    c.send("- " + completeMsg);
                } catch (e) {
                    return console.log("ERROR WHILE TRYING TO SEND MESSAGE TO DISCORD.\n\n" + e);
                }
            }
        })
    } else {
        return console.log("Invalid discord chat channel ID... Disabling chat logging...");
    }

})

client.on("messageCreate", async (message) => {
    if (message.author.id == client.user.id || message.author.bot) return
    config.discord_log.usersID.discord_IDS.map(userID => {
        if (message.author.id == userID) {
            if (message.channel.id == config.discord_log.chat_channel.channel_ID) {
                if (message.content.startsWith("!")) return
                bot.chat(message.content)
                console.log(message.content)
            }
        }
    })
    switch (message.content) {
        case config.prefix + "come":
            console.log("Command ran: Come")
            if (message.author.username == "Xmomoo") {
                console.log("By: Xmomoo")
                const Xmomoo = "Raplta"
                let target = bot.players[Xmomoo] ? bot.players[Xmomoo].entity : null;
                if (!target) return message.reply("I cant see u nigga");
                let p = target.position;

                bot.pathfinder.setMovements(defaultMove);
                bot.pathfinder.setGoal(new GoalNear(p.x, p.y, p.z), 1)
                //bot.pathfinder.goto(new GoalNear(p.x, p.y, p.z, 1))
                //bot.navigate.to(target.position)
            } else if (message.author.username == "Badhatalaf") {
                console.log("By: Bad")
                let target = bot.players[message.author.username] ? bot.players[message.author.username].entity : null;
                if (!target) return message.reply("I cant see u nigga");

                let p = target.position;

                bot.pathfinder.setMovements(defaultMove);
                bot.pathfinder.setGoal(new GoalXZ(p.x, p.z))
            }
            break
        case config.prefix + "tpa":
            console.log("Command ran: Tpa")
            if (message.author.username == "Xmomoo") {
                console.log("By: Xmomoo")
                bot.chat("/tpa Raplta")
            } else if (message.author.username == "Badhatalaf") {
                console.log("By: Bad")
                bot.chat(`/tpa ${message.author.username}`)
            }
            break
        case config.prefix + "tpaccept":
            console.log("Command ran: Tpaccept")
            if (message.author.username == "Xmomoo") {
                console.log("By: Xmomoo")
                bot.chat("/tpaccept")
            } else if (message.author.username == "Badhatalaf") {
                console.log("By: Bad")
                bot.chat(`/tpaccept`)
            }
            break
        case config.prefix + "pos":
            message.reply(`(x) ${bot.entity.position.x}, (y)${bot.entity.position.y}, (z)${bot.entity.position.z}`)
            break
        case config.prefix + "get stone":
            async function getStone() {

                bot.collectBlock.chestLocations = bot.findBlocks({
                    matching: mcData.blocksByName.chest.id,
                    maxDistance: 16,
                    count: 999999 // Get as many chests as we can
                })
                const stone = bot.findBlock({
                    matching: mcData.blocksByName.stone.id,
                    maxDistance: 2000
                })
                //if(stone) {
                bot.pathfinder.allow1by1towers = false
                bot.yawSpeed = 0.022;
                bot.pathfinder.goto(new GoalBlock(stone.position.x, stone.position.y, stone.position.z)).then(block => {
                    bot.dig(stone, true)
                    getStone()
                })
                // getStone()
                //}
            }
            getStone()
            break
        case config.prefix + "move":
            bot.pathfinder.goto(new GoalXZ(bot.entity.position.x + 1, bot.entity.position.z))
            break
        case config.prefix + "rtp":
            bot.chat("/rtp")
            break
        case config.prefix + "inv":
            function itemToString(item) {
                if (item) {
                    return `${item.name} x ${item.count}`
                } else {
                    return '(nothing)'
                }
            }
            const items = bot.inventory.items()
            const output = items.map(itemToString).join('\n')
            if (output) {
                message.reply(`${output}`)
            } else {
                message.reply(`empty`)
            }
            break
        case config.prefix + "yp":
            message.reply(`Yaw ${bot.entity.yaw}, pitch: ${bot.entity.pitch}`)
            break
        case config.prefix + "dep":
            const chest = bot.findBlocks({
                matching: mcData.blocksByName.chest.id,
                maxDistance: 16,
                count: 1
            })
            bot.openContainer(chest)
            bot.inventory.items().map(i => {
                console.log(i)
                //chest.deposit(i.type, null, i.amount)
            })

            break
        case config.prefix + "serv":
            bot.chat("/survival");
            break
        case config.prefix + "arena":
            bot.chat("/arena")
            bot.setControlState("forward", true)
            await sleep(10000)
            bot.setControlState("forward", false)
            break
        case config.prefix + "armor":
            bot.armorManager.equipAll()
            break
        case config.prefix + "health":
            message.reply(`Health: ${bot.health}/ 20\nFood: ${bot.food} / 20`)
            break
        case config.prefix + "quit":
            bot.quit()
            break;
        case config.prefix + "players":
            await message.reply(`${bot.players}`)
            break
        case config.prefix + "farm":
            console.log("farm")
            function blockToSow() {
                return bot.findBlock({
                    point: bot.entity.position,
                    matching: mcData.blocksByName.farmland.id,
                    maxDistance: 6,
                    useExtraInfo: (block) => {
                        const blockAbove = bot.blockAt(block.position.offset(0, 1, 0))
                        return !blockAbove || blockAbove.type === 0
                    }
                })
            }

            function blockToHarvest() {
                return bot.findBlock({
                    point: bot.entity.position,
                    maxDistance: 6,
                    matching: (block) => {
                        return block && block.type === mcData.blocksByName.wheat.id && block.metadata === 7
                    }
                })
            }

            async function loop() {
                try {
                    while (1) {
                        const toHarvest = blockToHarvest()
                        if (toHarvest) {
                            await bot.dig(toHarvest)
                        } else {
                            break
                        }
                    }
                    while (1) {
                        const toSow = blockToSow()
                        if (toSow) {
                            await bot.equip(mcData.itemsByName.wheat_seeds.id, 'hand')
                            await bot.placeBlock(toSow, new Vec3(0, 1, 0))
                        } else {
                            break
                        }
                    }
                } catch (e) {
                    console.log(e)
                }

                // No block to harvest or sow. Postpone next loop a bit
                console.log("starting..")
                setTimeout(loop, 1000)
                console.log("started")
            }
            break
    }
    if (message.content.startsWith("dig down to")) {
        const Ylevel = message.content.split("dig down to")
        bot.pathfinder.setGoal(new GoalY(Ylevel[1]))
    } else if (message.content.startsWith("throw")) {
        const data1 = message.content.split("throw")
        console.log(data1)
        // const data2 = data1.shift()
        // console.log(data2)
    }
})

// bot.on("kicked", (reason) => {
//     console.log("kicked for " + reason)
// })


// bot.on('health', () => {
//     if (bot.food === 20) bot.autoEat.disable()
//     else bot.autoEat.enable()
// })

// function sleep(ms) {
//     return new Promise((resolve) => {
//         setTimeout(resolve, ms);
//     });
// }

// client.login("MTAxNDkyODU3MzE1ODY2NjMxMQ.Gnmtfd._k0XOnnZfcg9iINHGIBUoU6pGUTtjwUgkT8cpQ")

client.login(config.discord_log.bot_token)

module.exports = bot, client;