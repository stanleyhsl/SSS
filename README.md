### 单点登录demo

实现一个单点登录的框架；多个不同域名的网站，只要在一个网站登录，其它网站可直接登录
原理：同一浏览器下多个窗口间利用其中一个窗口(login)存贮的cookie记录登录状态；
1. 打开任意一个网站时，先使用jsonp跨域请求login域的后端接口，验证当前login页面的登录状态(有效cookie),
2. 获得token;如果有cookie可用，则认为是已经登录，如果没有，则在本网站登录。
3. 本域登录成功后，再用jsonp把有效的token设置到login域的cookie内，供不同域的其它页面使用。

** 关键点在于浏览器的一个机制，调用jsonp时，会自动带上这个域的cookie，而这个域的服务器在验证cookie后，会把这个cookie/token放在响应体内返回给本页面的ajax jsonp; 这样我们就拿到了其它域的cookie.

demo使用的第三方库:
nestjs,mysql,redis,vue
hosts 伪造不同的域；
nginx 把不同地域的请求代理到一个nestjs sever以减少demo代码量


### 学习历程
1. 最开始使用的方法是，需要登录的各种域都要重定向到第三方页面，利用第三方页面的cookie缓存登录信息，没有缓存时，则需要在第三方页面登录；
2. 后来使用jsonp跨域的方法，实现了：a.不重定向调用第三方页面cookie;b.在本域登录成功后，把token设置到login域
3. 例子里的代码是旧的，原理更新了，注意理解。

### 运行方法
1. 安装好mysql,在代码app.module.ts里设置好msql登录密码用户名，使用sso_test.sql 建库。
2. 安装redis，安装nginx,并使用nginx.conf配置好代理；启动nginx
3. 配置好伪域名，mac里设置好hosts
```
  127.0.0.1   casa.com
  127.0.0.1   casb.com
  127.0.0.1   login.com
```
4. yarn; yarn start
5. 浏览器：
http://casb.com:1280/
http://casa.com:1280/
两个页面重定向到login.com实现单点登录,这个代码可以改造成本页面登录，也实现单点。


### 项目跑起来有点麻烦
可以直接看代码

