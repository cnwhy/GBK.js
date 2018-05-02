
## 目录说明
```
├── browser-source       生成浏览器版本的源文件
├── data                 GBK相关资源文件
├── datazip              压缩编码表相关的东西都在这里
├── dist
├── gulpfile.js          gulp配制
├── index.js             node版入口
├── src                  
└── test                 测试
```

## 压缩过程

### 先拿按 `GBK` 的有效码位顺序拿到对应 `Unicode` 值
[码区参考](https://zh.wikipedia.org/wiki/%E6%B1%89%E5%AD%97%E5%86%85%E7%A0%81%E6%89%A9%E5%B1%95%E8%A7%84%E8%8C%83)

<table class="wikitable">
<caption>GBK的编码范围</caption>
<tbody><tr>
<th>范围</th>
<th>第1字节</th>
<th>第2字节</th>
<th>编码数</th>
<th>字数</th>
</tr>
<tr>
<td>水准GBK/1</td>
<td><code>A1</code>–<code>A9</code></td>
<td><code>A1</code>–<code>FE</code></td>
<td align="right">846</td>
<td align="right">717</td>
</tr>
<tr>
<td>水准GBK/2</td>
<td><code>B0</code>–<code>F7</code></td>
<td><code>A1</code>–<code>FE</code></td>
<td align="right">6,768</td>
<td align="right">6,763</td>
</tr>
<tr>
<td>水准GBK/3</td>
<td><code>81</code>–<code>A0</code></td>
<td><code>40</code>–<code>FE</code> (<code>7F</code>除外)</td>
<td align="right">6,080</td>
<td align="right">6,080</td>
</tr>
<tr>
<td>水准GBK/4</td>
<td><code>AA</code>–<code>FE</code></td>
<td><code>40</code>–<code>A0</code> (<code>7F</code>除外)</td>
<td align="right">8,160</td>
<td align="right">8,160</td>
</tr>
<tr>
<td>水准GBK/5</td>
<td><code>A8</code>–<code>A9</code></td>
<td><code>40</code>–<code>A0</code> (<code>7F</code>除外)</td>
<td align="right">192</td>
<td align="right">166</td>
</tr>
<tr>
<td>用户定义</td>
<td><code>AA</code>–<code>AF</code></td>
<td><code>A1</code>–<code>FE</code></td>
<td align="right">564</td>
<td></td>
</tr>
<tr>
<td>用户定义</td>
<td><code>F8</code>–<code>FE</code></td>
<td><code>A1</code>–<code>FE</code></td>
<td align="right">658</td>
<td></td>
</tr>
<tr>
<td>用户定义</td>
<td><code>A1</code>–<code>A7</code></td>
<td><code>40</code>–<code>A0</code> (<code>7F</code>除外)</td>
<td align="right">672</td>
<td></td>
</tr>
<tr>
<th>合计：</th>
<th></th>
<th></th>
<th align="right">23,940</th>
<th align="right">21,886</th>
</tr>
</tbody></table>

> 最终拿到一个 `GBK` 码位顺序的 `Unicode` 数组 (不包含扩展码位)

### 转码
将数组转为 `x进制` 3位编码, 空码用 '#' 代替
>  (x 范围(40 - 89)) 小于40进制时,编码可能超过3位

### 压缩
1. 数组各项合并成一个字符串.  
2. 连续空码位压缩:  连续8个空码位 `########` => `#5$`
3. 连续前位字符相同压缩(分隔符为空格): `abb` `abc` `abd` `abe` `abf` => `ab!bcdef `
4. 在上一位基础上进一步压缩: `ab!bcdef ` => `ab!b%f `

压缩时占用了6个符号做特殊用途分别是:
- `#` 0x23 空码
- `$` 0x24 连续空码结束标志
- `!` 0x21 前两位相同标志
- `%` 0x25 第三位递增标志
- ` ` 0x20 前两位字符相同结束标志
- `"` 0x22 `javascript`占用(用 `\"` 或 `\'` 造成压缩效果变差).
> `ASCII` 可见字符是 `0x20 - 0x7e` 所以多进制转换可用字符为`0x26 - 0x7e` 共89个字符, 所以最大进制为89进制 

## 构建过程
1. `./datazip` 执行后会拿到 
	- `zipData` 压缩后的字符串
	- `unZipFn` 解压函数的源码 ()
	- `decodeFn` 压缩转x进制的反函数的源码
2. 替换 `./browser-source/*.js` 中的占位符
3. 输出