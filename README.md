> 一个小而快的GBK库,支持浏览器

### 说明：
- 编码表是经过简单压缩的，只有不到40k(gzip 后20k)。
	> 正常的编码表最少要到200K左右
- 本库不包含GBK自定义（扩展）码区。
- 浏览器请使用 `dist/` 路径下的文件
- 内存占用和一般的gbk库差不多，但加载时会解压编码表，加载时间稍多

## API
### GBK.encode({BbyteArry}) 解码GBK编码的 `ByteArray` 返回字符串

### GBK.decode({string})