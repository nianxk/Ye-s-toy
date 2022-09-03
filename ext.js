var list = document.querySelector('input[type="password"');
if (list && list.length) {
    for (var i = 0; i < list.length; i++) {
        var dom = list[i];
        dom.type = 'text';
    }
}