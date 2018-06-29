# cityPicker
省市区级联，城市按照拼音首字母分组，支持默认值展示

City cascaded selection plug-in

-  [Demo](http://xuyiKing.github.io/cityPicker)

## 插件(plugin)
基于jquery，html+css+js实现

Base on jquery, ment with html+css+js

##Release History

###v1.1.0
Add function to get the code：


## Main

```
js/
├── dist.js      ( 4 KB)
├── zh2Pinyin.js     (98 KB)
└── myDistpicker.js     ( 7 KB)
```

## Getting started

### Installation

Include files:

```html
<script src="js/jquery-2.1.1.min.js"></script>
<script src="js/dist.js"></script>
<script src="js/zh2Pinyin.js"></script>
<script src="js/myDistpicker.js"></script>
```

Create HTML elements:

```html
<div style="position:relative;"><!-- container -->
  <input name=""  readonly id="dist">
</div>
```

Initialize with `$.fn.myDistpicker` method

Basic

```js
$('#dist').myDistpicker();
```

