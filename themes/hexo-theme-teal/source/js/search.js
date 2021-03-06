(function (window, document, undefined) {

    var $ = document.querySelector.bind(document);
    var even = ('ontouchstart' in window && /Mobile|Android|iOS|iPhone|iPad|iPod|Windows Phone|KFAPWI/i.test(navigator.userAgent))
        ? 'touchstart'
        : 'click';
    var noop = function () {
    };
    var root = $('html');
    var searchIco = $('#search');
    var searchWrap = $('#search-wrap');
    var keyInput = $('#key');
    var back = $('#back');
    var searchPanel = $('#search-panel');
    var searchResult = $('#search-result');
    var searchTpl = $('#search-tpl').innerHTML;
    var JSON_DATA = (window.BLOG.ROOT + '/content.json').replace(/\/{2}/g, '/');
    var searchData;

    function loadData(success) {

        if (!searchData) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', JSON_DATA, true);

            xhr.onload = function () {
                if (this.status >= 200 && this.status < 300) {
                    var res = JSON.parse(this.response);
                    searchData = res instanceof Array ? res : res.posts;
                    success(searchData);
                } else {
                    console.error(this.statusText);
                }
            };

            xhr.onerror = function () {
                console.error(this.statusText);
            };

            xhr.send();

        } else {
            success(searchData);
        }
    }

    function tpl(html, data) {
        return html.replace(/\{\w+\}/g, function (str) {
            var prop = str.replace(/\{|\}/g, '');
            return data[prop] || '';
        });
    }

    var Control = {
        show: function () {
            window.innerWidth < 760 ? root.classList.add('lock-size') : noop;
            searchPanel.classList.add('in');
        },
        hide: function () {
            window.innerWidth < 760 ? root.classList.remove('lock-size') : noop;
            searchPanel.classList.remove('in');
        }
    };

    function formatDateTime(date) {
        var y = date.getFullYear();
        var m = date.getMonth() + 1;
        m = m < 10 ? ('0' + m) : m;
        var d = date.getDate();
        d = d < 10 ? ('0' + d) : d;
        return y + '-' + m + '-' + d;  
    };

    function render(data) {
        var html = '';
        if (data.length) {

            html = data.map(function (post) {

                return tpl(searchTpl, {
                    title: post.title,
                    path: (window.BLOG.ROOT + '/' + post.path).replace(/\/{2,}/g, '/'),
                    date: formatDateTime(new Date(post.date)),
                    tags: post.tags.map(function (tag) {
                        return '<span>#' + tag.name + '</span>'
                    }).join('')
                });

            }).join('');

        } else {
            html = '<li class="tips"><i class="icon icon-coffee icon-3x"></i><p>Results not found!</p></li>';
        }

        searchResult.innerHTML = html;
    }

    function regtest(raw, regExp) {
        regExp.lastIndex = 0;
        return regExp.test(raw);
    }

    function matcher(post, regExp) {
        return regtest(post.title, regExp) || post.tags.some(function (tag) {
            return regtest(tag.name, regExp);
        }) || regtest(post.text, regExp);
    }

    function search(e) {
        var key = this.value.trim();
        if (!key) {
            return;
        }

        var regExp = new RegExp(key.replace(/[ ]/g, '|'), 'gmi');

        loadData(function (data) {

            var result = data.filter(function (post) {
                return matcher(post, regExp);
            });

            render(result);
            Control.show();
        })

        e.preventDefault();
    }


    searchIco.addEventListener(even, function () {
        searchWrap.classList.toggle('in');
        keyInput.value = '';
        searchWrap.classList.contains('in') ? keyInput.focus() : keyInput.blur();
    });

    back.addEventListener(even, function () {
        searchWrap.classList.remove('in');
        Control.hide();
    });

    document.addEventListener(even, function (e) {
        if (e.target.id !== 'key' && even === 'click') {
            Control.hide();
        }
    });

    keyInput.addEventListener('input', search);
    keyInput.addEventListener(even, search);

})(window, document);
