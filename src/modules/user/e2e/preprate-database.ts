import jwt from 'jsonwebtoken'
import { initializeProject } from '../../../../app'
import { AppDataSource } from '../../../data-source'
import { Token } from '../../../data/token'
import { hash } from '../bll/user.service'
import { UserEntity } from '../entity/user.entity'
import { RelationEntity } from '../entity/relation.entity'
const SECRET_KEY = process.env.SECRET_KEY!

export const prepare = async () => {
    const app = await initializeProject()

    const userRepo = AppDataSource.getRepository(UserEntity)
    const relationRepo = AppDataSource.getRepository(RelationEntity)
    const mockUsers = [
        {
            id: 1,
            username: 'user_one',
            email: 'email1@gmail.com',
            password: await hash('password1'),
        },
        {
            id: 2,
            username: 'user_two',
            email: 'email2@gmail.com',
            password: await hash('password2'),
        },
        {
            id: 3,
            username: 'user_three',
            email: 'email3@gmail.com',
            password: await hash('password3'),
        },
        {
            id: 4,
            username: 'user_four',
            email: 'email4@gmail.com',
            private: true,
            password: await hash('password4'),
        },
        {
            id: 5,
            username: 'user_five',
            email: 'email5@gmail.com',
            private: true,
            password: await hash('password5'),
        },
        {
            id: 6,
            username: 'user_six',
            email: 'email6@gmail.com',
            private: true,
            password: await hash('password6'),
        },
    ]
    await userRepo.save(mockUsers)

    await relationRepo.save([{ userA: 3, userB: 1, status: 'Blocked' }])
    const userTokens: Token[] = []
    for (let mockUser of mockUsers) {
        const token = jwt.sign({ userId: mockUser.id, username: mockUser.username, email: mockUser.username }, SECRET_KEY) as Token
        userTokens.push(token)
    }

    return { expressApp: app, tokens: userTokens }
}
