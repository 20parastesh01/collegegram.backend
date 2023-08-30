import fs from 'fs'
import { OAuth2Client } from 'google-auth-library'
import { google } from 'googleapis'
import MailComposer from 'nodemailer/lib/mail-composer'
import readline from 'readline'
import nodemailer from 'nodemailer'
import path from 'path'
import { services } from '../registry/layer-decorators'
import { EmailService } from '../modules/email/bll/email.service'
import { Email } from '../data/email'

const SCOPES = ['https://www.googleapis.com/auth/gmail.send']
const TOKEN_PATH = path.join(process.cwd(), 'token.json')
const from = process.env.GMAIL_FROM

const authorize = async () => {
    const credentials = JSON.parse(fs.readFileSync(process.cwd() + '/credentials.json').toString())
    const { client_secret, client_id, redirect_uris } = credentials.installed
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0])
    let tokens: any = {}
    try {
        const tokenFile = TOKEN_PATH
        tokens = JSON.parse(fs.readFileSync(tokenFile, 'utf-8'))

        oAuth2Client.setCredentials(tokens)
        if (tokens.expiry_date <= Date.now()) {
            const refreshedTokens = await oAuth2Client.refreshAccessToken()
            tokens = refreshedTokens.credentials
            fs.writeFileSync(tokenFile, JSON.stringify(tokens))
        }
    } catch (err) {
        tokens = await getNewToken(oAuth2Client)
        const tokenFile = path.join(process.cwd(), 'token.json')
        fs.writeFileSync(tokenFile, JSON.stringify(tokens))
    }
    return oAuth2Client
}

async function getNewToken(oauth2Client: OAuth2Client): Promise<any> {
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    })

    console.log('Authorize this app by visiting this URL:', authUrl)

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    })

    return new Promise((resolve, reject) => {
        rl.question('Enter the code from that page here: ', async (code) => {
            rl.close()

            try {
                const { tokens } = await oauth2Client.getToken(code)
                oauth2Client.setCredentials(tokens)
                resolve(tokens)
            } catch (err) {
                reject(err)
            }
        })
    })
}

const user = process.env.EMAIL_USER
const pass = process.env.EMAIL_PASS

export const sendEmail = (to: Email, subject: string, content: string, reason: string) => {
    const transporter = nodemailer.createTransport({
        service: 'Zoho',
        auth: {
            user,
            pass,
        },
    })
    const mailOptions = {
        from: user,
        to,
        subject,
        html: content,
    }
    const emailService = services['EmailService'] as EmailService
    if (emailService) {
        emailService.createEmail(to, subject, content, reason)
    }
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Error:', error)
        } else {
            console.log('Email sent:', info.response)
        }
    })
}

export const sendGmail = async (to: string, subject: string, content: string) => {
    try {
        const auth = await authorize()
        const options = {
            from,
            to,
            subject,
            html: content,
            textEncoding: 'base64',
        }

        const gmail = google.gmail({ version: 'v1', auth })
        const mailComposer = new MailComposer(options as any)
        const message = await mailComposer.compile().build()
        const rawMessage = Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
        const params = {
            userId: 'me',
            resource: {
                raw: rawMessage,
            },
        }
        const result = await gmail.users.messages.send(params)
        return { result }
    } catch (e) {
        console.log(e)
        return { error: e }
    }
}
