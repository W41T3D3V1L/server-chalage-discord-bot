const { Client, GatewayIntentBits, Partials, Events, EmbedBuilder } = require('discord.js');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMembers
  ],
  partials: [Partials.Channel],
});

const CORRECT_ANSWER = "BHFlag{DeadPotato-NET4.exe_09/08/2024_22:42:13}";
const MAX_WINNERS = 2;
const ROLE_NAME = "server testers";
let winners = [];

client.once(Events.ClientReady, () => {
  console.log(`✅ Bot logged in as ${client.user.tag}`);
  postChallenge();
});

async function postChallenge() {
  const channel = await client.channels.fetch(process.env.CHANNEL_ID);
  if (!channel) return;

  const embed = new EmbedBuilder()
    .setTitle("🔐 **Server Testers Challenge**")
    .setDescription(
      "**We are recruiting 2 elite testers for the `server testers` role!**\n\n" +
      "**👉 Challenge Link:** [Click Here](https://drive.google.com/file/d/1eQDjIMBrjc0oteVmLer0_EHn3cgJcpsE/view?usp=sharing)\n\n" +
      "**📝 Submit your answer in DM to this bot.**\n\n" +
      "**✅ Correct Flag Format:**\n```diff\n+ BHFlag{*******}\n```"
    )
    .setColor(0x00ff99)
    .setFooter({ text: "Only first 2 correct submissions will win!" });

  channel.send({ embeds: [embed] });
}

client.on(Events.MessageCreate, async (message) => {
  if (message.channel.type !== 1 || message.author.bot) return;

  const userAnswer = message.content.trim();

  if (winners.length >= MAX_WINNERS) {
    const closedEmbed = new EmbedBuilder()
      .setTitle("⛔ **Challenge Closed**")
      .setDescription("**We’ve already received 2 correct submissions. Better luck next time!**")
      .setColor(0xff0000);
    return message.reply({ embeds: [closedEmbed] });
  }

  if (userAnswer === CORRECT_ANSWER) {
    const guild = await client.guilds.fetch(process.env.GUILD_ID);
    const member = await guild.members.fetch(message.author.id);
    const role = guild.roles.cache.find(r => r.name === ROLE_NAME);

    if (!role) {
      const errorEmbed = new EmbedBuilder()
        .setTitle("❌ **Role Not Found**")
        .setDescription("**The `server testers` role does not exist. Please contact the admin.**")
        .setColor(0xff0000);
      return message.reply({ embeds: [errorEmbed] });
    }

    if (winners.includes(message.author.id)) {
      const dupEmbed = new EmbedBuilder()
        .setTitle("⚠️ **Already Submitted**")
        .setDescription("**You have already submitted the correct flag and been awarded the role.**")
        .setColor(0xffcc00);
      return message.reply({ embeds: [dupEmbed] });
    }

    await member.roles.add(role);
    winners.push(message.author.id);

    const successEmbed = new EmbedBuilder()
      .setTitle("✅ **Correct Answer!**")
      .setDescription(`**You’ve been added to the \`${ROLE_NAME}\` role. Congratulations!**`)
      .setColor(0x00ff00);
    await message.reply({ embeds: [successEmbed] });

    if (winners.length === MAX_WINNERS) {
      const announceChannel = await client.channels.fetch(process.env.CHANNEL_ID);
      const winnerMentions = winners.map(id => `<@${id}>`).join('\n');
      const finalEmbed = new EmbedBuilder()
        .setTitle("🎉 **Challenge Closed**")
        .setDescription(`**Here are the 2 winners:**\n\n${winnerMentions}\n\n**👏 Congratulations!**`)
        .setColor(0x0000ff);
      announceChannel.send({ embeds: [finalEmbed] });
    }

  } else {
    const wrongEmbed = new EmbedBuilder()
      .setTitle("❌ **Incorrect Flag**")
      .setDescription("**That’s not the correct flag. Try again!**")
      .setColor(0xff6600);
    message.reply({ embeds: [wrongEmbed] });
  }
});

client.login(process.env.DISCORD_TOKEN);
