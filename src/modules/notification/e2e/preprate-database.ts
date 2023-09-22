import jwt from 'jsonwebtoken'
import { initializeProject } from '../../../../app'
import { AppDataSource } from '../../../data-source'
import { Token } from '../../../data/token'
import { RelationEntity } from '../../user/entity/relation.entity'
import { UserEntity } from '../../user/entity/user.entity'
import { hash } from '../../user/bll/user.service'

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
            private: true,
            email: 'email3@gmail.com',
            password: await hash('password3'),
        },
    ]
    await userRepo.save(mockUsers)

    const userTokens: Token[] = []
    for (let mockUser of mockUsers) {
        const token = jwt.sign({ userId: mockUser.id, username: mockUser.username, email: mockUser.username }, SECRET_KEY) as Token
        userTokens.push(token)
    }

    return { expressApp: app, tokens: userTokens }
}
