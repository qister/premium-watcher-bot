import { Telegraf } from 'telegraf'
import ms from 'ms'

require('dotenv').config()

const token = process.env.TOKEN as string

const bot = new Telegraf(token)

bot.on('message', async (ctx) => {
  try {
    const { user } = await bot.telegram.getChatMember(ctx.chat.id, ctx.from.id)

    // Тут должна быть проверка что это не именно этот бот
    if (!user.is_premium && !user.is_bot) {
      // await bot.telegram.banChatMember(ctx.chat.id, ctx.from.id)
      // await bot.telegram.unbanChatMember(ctx.chat.id, ctx.from.id)

      await bot.telegram.restrictChatMember(ctx.chat.id, ctx.from.id, {
        permissions: { can_send_messages: false },
        until_date: Math.round((Date.now() + ms('1m')) / 1000),
      })

      await ctx.replyWithHTML(
        `Пользователь <a href="tg://user?id=${user.id}">${user.first_name}</a> не может писать сообщения во всех чатах по команде админа. 
Причина: нет денег на премиум`,
      )
    }
  } catch (error) {
    console.error(error)
  }
})

if (process.env.NODE_ENV === 'production') {
  bot
    .launch({
      webhook: {
        domain: process.env.DOMAIN ?? '',
        port: Number(process.env.PORT!) ?? 8000,
      },
    })
    .then(() => {
      console.log('Bot started at production')
    })
} else {
  bot.launch().then(() => {
    console.log('Bot started locally')
  })
}
