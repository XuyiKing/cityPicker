;(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as anonymous module.
        define(['jquery', 'DISTRICTS'], factory);
    } else if (typeof exports === 'object') {
        // Node / CommonJS
        factory(require('jquery'), require('DISTRICTS'));
    } else {
        // Browser globals.
        factory(jQuery, DISTRICTS);
    }
})(function ($, DISTRICTS) {

    'use strict';

    if (typeof DISTRICTS === 'undefined') {
        throw new Error('The file "dist.js" must be included first!');
    }

    var myDistpicker = function (options) {
        var settings = $.extend(true, {
            stopBy: '#animateModelBox',
            province: "",
            city: "",
            dist: "",
            provinceId: "",
            cityId: "",
            distId: ""
        }, options);
        var _this = this,
            $this = $(_this);
        // 判断绑定元素
        if (!$this.is('input')) {
            throw new Error('The trigger element must be input');
        }

        // 省市区
        var regEx = /^([\u4E00-\u9FA5\uf900-\ufa2d]+)\|(\w+)\|(\w)\w*$/i;
        var reg1 = /^[a-g]$/i,
            reg2 = /^[h-n]$/i,
            reg3 = /^[o-t]$/i,
            reg4 = /^[u-z]$/i;
        var regSet = {
            'A-G': reg1,
            'H-N': reg2,
            'O-T': reg3,
            'U-Z': reg4
        };

        var result = result || {};
        var match, letter, label;
        var temp, fallName;

        var init = function () {
            // 默认值
            var inputVal = $this.val();
            var inputArr = new Array();
            if (inputVal != '') {
                inputArr = inputVal.split("-");
            }
            settings.province = (!inputArr[0]) ? settings.province : inputArr[0];
            settings.city = (!inputArr[1]) ? settings.city : inputArr[1];
            settings.dist = (!inputArr[2]) ? settings.dist : inputArr[2];

            // 获取默认地址ID
            if (settings.province && !settings.provinceId) {
                $.each(DISTRICTS[100000], function (i, l) {
                    if (l == settings.province) {
                        settings.provinceId = i;
                    }
                })
            }
            if (settings.city && settings.provinceId != '' && !settings.cityId) {
                $.each(DISTRICTS[settings.provinceId], function (i, l) {
                    if (l == settings.city) {
                        settings.cityId = i;
                    }
                })
            }
            if (settings.dist && settings.cityId != '' && !settings.distId) {
                $.each(DISTRICTS[settings.cityId], function (i, l) {
                    if (l == settings.dist) {
                        settings.distId = i;
                    }
                })
            }

            // 给绑定元素添加附加元素
            var extra = '<span class="dist-title" style="display: none;">' +
                '<span data-label="province" data-code="' + settings.provinceId + '">' + settings.province + '</span>' +
                '<span data-label="city" data-code="' + settings.cityId + '">' + settings.city + '</span>' +
                '<span data-label="dist" data-code="' + settings.distId + '">' + settings.dist + '</span>' +
                '</span>';
            $this.after(extra);

            // 初始化选区
            $(settings.stopBy).append(
                '<div class=\'add_content hidden\' id=\'add_content\'>' +
                '<div class=\'add_heard\'>' +
                '<ul class="nav nav-pills dist-tab">' +
                '<li data-label="province" data-code="100000" class="active"><a href="javascript:;">省份</a></li>' +
                '<li data-label="city" data-code="' + settings.provinceId + '"><a href="javascript:;">城市</a></li>' +
                '<li data-label="dist" data-code="' + settings.cityId + '"><a href="javascript:;">县区</a></li>' +
                '</ul></div>' +
                '<div class=\'add_body col-xs-12\'>' +
                '</div></div>'
            );

            showTitle();
        };

        /**
         * 回显选区选中内容
         */
        var showTitle = function () {
            // 显示信息
            var showName = '', thisName;
            $(".dist-title").children("span").each(function () {
                thisName = $(this).text();
                if (thisName != '' && thisName != 'undefined') {
                    showName += !showName ? thisName : "-" + thisName;
                }
            });
            $this.val(showName);
        };

        // 初始化
        init();

        // 根据拼音分组
        var groupCity = function (id) {
            if (!DISTRICTS[id]) {
                return;
            }

            $.each(DISTRICTS[id], function (i, v) {
                if (!v) {
                    return false;
                }

                temp = $.pinYin.toPinYin(v);
                // DISTRICTS[id][i]
                fallName = v + "|" + temp + "|" + temp.substr(0, 1);
                match = regEx.exec(fallName); //exec
                if (!match[3]) {
                    return false;
                }
                letter = match[3].toUpperCase(); //转换字母为大写

                $.each(regSet, function (la, reg) {
                    if (reg.test(letter)) {
                        label = la;
                        if (!result[id]) {
                            result[id] = {};
                        }
                        if (!result[id][label]) {
                            result[id][label] = {};
                        }
                        if (!result[id][label][i]) {
                            result[id][label][i] = {};
                        }
                        result[id][label][i] = v;
                    }
                })
            });
        };

        // 默认展示省份
        groupCity(100000);

        // 绑定元素事件，展示地区
        $this.off("click").on("click", function () {
            if (!$('#add_content').hasClass("hidden")) {
                return false;
            }

            $(".dist-tab").find('li').removeClass('active');
            $(".dist-tab").find("li[data-label=province]").addClass("active");
            showCity();

            $('#add_content').removeClass('hidden');

            clickCity();

            tabClick();

            autoClose();
        });

        /**
         * 省市区展示
         *
         * @param id      {int}     父级ID
         * @param label   {string}  标识   province|city|dist
         * @param thisId  {int}     当前城市ID
         */
        var showCity = function (id, label, thisId) {
            var html = '';
            var empty = false;
            id = id || 100000;
            var cityArr = result[id];
            label = label || 'province';
            thisId = thisId || settings.provinceId;
            $.each(cityArr, function (letter, val) {
                if (val) {
                    html += '<div class=\'col-xs-12 pad-0\'>' +
                        '<div class=\'col-xs-2 pad-0 add_alphabet\'>' + letter + '</div>' +
                        ' <div class=\'col-xs-10 pad-0 add_name\'>';

                    $.each(val, function (i, v) {
                        if (i == id) {
                            empty = true;
                            return false;
                        }
                        html += '<div data-id="' + i + '" data-label="' + label + '" class=\'add_value';
                        if (i == thisId) {
                            html += ' active\'>' + v + '</div>';
                        } else {
                            html += '\'>' + v + '</div>';
                        }
                    });
                    html += '</div></div>';
                }
            });
            html = empty ? "" : html;
            $(".add_body").html(html);
        };

        /**
         * 点击选择城市
         */
        var clickCity = function () {
            // 点击
            $(".add_body").off("click").on("click", '.add_value', function () {
                var ob = $(this);
                var id = ob.data('id'),
                    label = ob.data("label");
                ob.siblings().removeClass('active');
                ob.addClass("active");
                if (label == 'province') {
                    settings.provinceId = id;
                }

                // 隐藏信息
                var titleObj = $(".dist-title").find("[data-label=" + label + "]");
                titleObj.text(ob.text());
                titleObj.attr("data-code", id);
                titleObj.nextAll('span').text("");
                titleObj.nextAll('span').attr("data-code", "");

                showTitle();

                groupCity(id);

                // 关闭选区
                if (!result[id]) {
                    $(".add_body").html("");
                    $('#add_content').addClass('hidden');
                    return false;
                }

                var ll = {
                    province: "city",
                    city: "dist"
                };
                // 3 tabs，切换到下一个tab，最后一个则关闭选区
                $(".dist-tab").find('li').removeClass('active');
                $(".dist-tab").find("li[data-label=" + ll[label] + "]").attr('data-code', id).addClass("active");
                $(".dist-tab").find("li[data-label=" + ll[label] + "]").nextAll('li').attr('data-code', "");

                showCity(id, ll[label]);
            })
        };

        /**
         * 省市区分组点击
         */
        var tabClick = function () {
            $('.add_heard ul li').off('click').on('click', function () {
                var ob = $(this);
                var label = ob.attr('data-label') || ob.data("label"),
                    pid = ob.attr("data-code") || ob.data("code");

                var titleObj = $(".dist-title").find("[data-label=" + label + "]");
                var id = titleObj.attr("data-code");
                // 没有上级ID，和本级ID则不会进行切换
                if (!pid && !id) {
                    return false;
                }

                // 拼音分组为缓存则缓存
                if (!result[pid]) {
                    groupCity(pid);
                }

                showCity(pid, label, id);

                $(this).siblings().removeClass('active');
                $(this).addClass('active');
            });
        };

        /**
         * 选区自动关闭
         */
        var autoClose = function () {
            $(document).click(function (e) {
                var $target = $(e.target);
                if ($this.is($target) || $('#add_content').find($target).length > 0 || $target.hasClass('add_value')) {
                    $('#add_content').removeClass('hidden');
                } else if (!$('#add_content').hasClass('hidden')) {
                    $('#add_content').addClass('hidden');
                }
            })
        }
    };

    $.fn.myDistpicker = myDistpicker;
});