import { Controller, Get, Post, Req, Res, Body,Query } from '@nestjs/common';
import { UserService } from './user.service';


@Controller('')
export class UserController {
    constructor(private readonly userService: UserService) { }

    // jsonp回调给其它域名设置cookie
    @Get('/setCookie')
    setCookie(@Query() query, @Res() res): Promise<Object> {
        console.log('参数为：',query)
        // 调用的域名下的cookie会覆盖增加一个叫token的字段
        res.setHeader( 'Set-Cookie', `token=${query.token}`);
        // 允许跨域：blocked by CORS policy
        res.setHeader( 'Access-Control-Allow-Origin', '*');
        return res.json({
            code: 0,
            msg: '成功'
        })
    }

    // jsonp实现不跳转获取token,把其它域的token从jsonp的body内反回
    @Get('/getTicket')
    getCookie(@Req() req, @Res() res): Promise<Object> {
        return this.userService.getTicket(req, res);
    }

    // 取用户信息，需要登录cookie
    @Get('/getUserInfo')
    getUserInfo(@Req() req, @Res() res): Promise<Object> {
        return this.userService.getUserInfo(req, res);
    }

    // login页面验证本域的cookie
    @Get('/authorize')
    authorize(@Req() req): Promise<Object> {
        return this.userService.authorize(req);
    }

    // login页面登录授权，取得cookie
    @Post('/login')
    login(@Body() body, @Res() res, @Req() req): Promise<Object> {
        return this.userService.login(body.username, body.password, res, req);
    }

    // 登出
    @Get('/logout')
    logout(@Req() req): Promise<Object> {
        return this.userService.logout(req);
    }
}
