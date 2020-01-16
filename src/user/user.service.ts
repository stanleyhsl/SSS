import { Injectable, Req, Res } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from '../entities/users.entity';
import { Repository, ChildEntity } from 'typeorm';
import axios from 'axios';

const jwt = require('jsonwebtoken');
const redisClient = require('../../db/redis.js');
const random = require('string-random');

const tokenConfig = {
    secret: 'token-secret',
    expiresIn: 60 * 60 * 24
}

@Injectable()
export class UserService {
    constructor(@InjectRepository(Users)
    private readonly usersRepository: Repository<Users>) { }

    async getTicket(@Req() req, @Res() res): Promise<Object> {
        const _callback = req.query.callback;
        const { cookie } = req.headers;
        const ticket = random(16);
        if (cookie) {
            const token = cookie.split('=')[1];
            const tokenExists = await redisClient.exists(token);
            if (tokenExists) {
                await redisClient.set(ticket, token)
                const responseData = {
                    code: 0,
                    msg: '用户已登录',
                    data: {
                        ticket
                    }
                };
                if (_callback) {
                    // 这两步设置发送也是NODE.JS发送JSONP必备
                    res.type('text/javascript');
                    res.send(_callback + '(' + JSON.stringify(responseData) + ')');
                    return;
                }
            }
        }
        return res.json({
            code: 900,
            msg: 'token不存在'
        });
    }

    async getUserInfo(@Req() req, @Res() res): Promise<Object> {
        // 判断token是否还存在于redis中并验证token是否有效, 取得用户名和用户id
        const { authorization, referer, cookie } = req.headers;
        const hostName = referer?referer.split('/')[2].split(':')[0]:'localhost';
        const ticket = authorization;
        if (cookie) {
            const token = cookie.split('=')[1];
            const tokenExists = await redisClient.exists(token);
            if (tokenExists) {
                const { username, id } = await jwt.verify(token, tokenConfig.secret)
                await redisClient.del(ticket);
                return res.json({
                    code: 0,
                    msg: '用户已登录',
                    data: {
                        username,
                        id,
                    }
                })
            }
        }
        if (authorization) {
            const ticketExists = await redisClient.exists(ticket);
            if (ticketExists) {
                const token = await redisClient.get(ticket);
                const { username, id } = await jwt.verify(token, tokenConfig.secret)
                res.setHeader(
                    'Set-Cookie',
                    `token=${token};domain=${hostName};max-age=${tokenConfig.expiresIn};httpOnly`)
                await redisClient.del(ticket);
                return res.json({
                    code: 0,
                    msg: '用户已登录',
                    data: {
                        username,
                        id,
                    }
                })
            }
        }
        return res.json({
            code: 900,
            msg: 'token不存在'
        });
    }

    async authorize(@Req() req): Promise<Object> {
        const { cookie } = req.headers;
        if (cookie) {
            const token = cookie.split('=')[1];
            const tokenExists = await redisClient.exists(token);
            if (tokenExists) {
                return {
                    code: 0,
                    msg: '用户已登录',
                }
            }
        }
        return {
            code: 900,
            msg: 'token不存在'
        };
    }

    async login(username: string, password: string, @Res() res, @Req() req): Promise<Object> {
        const user = await this.usersRepository
            .createQueryBuilder('user')
            .where('user.username = :username', { username: username })
            .getOne();
        const { cookie } = req.headers;
        if (cookie){
            const token = cookie.split('=')[1];
            const tokenExists = await redisClient.exists(token);
            if (tokenExists) {
                await redisClient.del(token);
            }
        }
        if (user && password == user.password) {
            const newToken = jwt.sign(
                { username, id: user.id },
                tokenConfig.secret,
                { expiresIn: tokenConfig.expiresIn }
            )
            await redisClient.set(newToken, 'something')
            res.setHeader(
                'Set-Cookie',
                `token=${newToken};domain=login.com;max-age=${tokenConfig.expiresIn};httpOnly`)
            return res.json({
                code: 0,
                msg: '登录成功',
                data: {
                    username,
                    id: user.id,
                }
            })
        } else if (!user) {
            return res.json({
                code: 1,
                msg: '用户名不存在'
            })
        }
        return res.json({
            code: 3,
            msg: '密码错误'
        })
    }

    async logout(@Req() req) {
        const { cookie } = req.headers;
        if (cookie) {
            const token = cookie.split('=')[1];
            await redisClient.del(token);
            return {
                code: 0,
                msg: '登出成功'
            }
        }
        return {
            code: 900,
            msg: '未登录'
        }
    }
}