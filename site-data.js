// يقرأ محتوى الموقع من ملفات content/*.json (اللي بتتعدل من لوحة التحكم)
// ويحدّث الصفحات تلقائياً. لو فشل التحميل، الموقع يفضل بالنص الأصلي المكتوب في الصفحة.
(function () {
  'use strict';

  var NAMES = ['company', 'home', 'about', 'services', 'contact'];
  var data = {};

  function load(name) {
    return fetch('/content/' + name + '.json', { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .catch(function () { return null; });
  }

  function get(path) {
    var p = path.split('.');
    var file = data[p[0]];
    return file ? file[p[1]] : undefined;
  }

  function make(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text) e.textContent = text;
    return e;
  }

  function icon(name) {
    var i = document.createElement('i');
    var ok = /^fa-[a-z0-9-]+$/.test(name || '');
    i.className = 'fas ' + (ok ? name : 'fa-circle-check');
    return i;
  }

  var render = {
    cards: function (it) {
      var c = make('div', 'card');
      c.appendChild(icon(it.icon));
      c.appendChild(make('h3', '', it.title));
      c.appendChild(make('p', 'pre', it.text));
      return c;
    },
    services: function (it) {
      var c = make('section', 'card');
      c.appendChild(icon(it.icon));
      c.appendChild(make('h2', '', it.title));
      c.appendChild(make('p', 'pre', it.description));
      if (it.price) c.appendChild(make('span', 'price', 'السعر: ' + it.price));
      return c;
    },
    trucks: function (it) {
      var c = make('div', 'card truck-card');
      var img = document.createElement('img');
      img.src = it.image || '';
      img.alt = it.title || 'سيارة شفط تابعة لشركة المدثر';
      img.loading = 'lazy';
      c.appendChild(img);
      c.appendChild(make('h3', '', it.title));
      return c;
    },
    contacts: function (it) {
      var box = make('div', 'extra-contact');
      if (it.label) box.appendChild(make('strong', '', it.label));
      var raw = (it.number || '').trim();
      var tel = raw.replace(/[^\d+]/g, '');
      var wa = raw.replace(/[^\d]/g, '');
      var type = it.type || 'both';
      if (tel && (type === 'both' || type === 'call')) {
        var a = make('a', 'btn call-btn');
        a.href = 'tel:' + tel;
        a.appendChild(make('i', 'fas fa-phone'));
        a.appendChild(document.createTextNode(' ' + raw));
        box.appendChild(a);
      }
      if (wa && (type === 'both' || type === 'wa')) {
        var w = make('a', 'btn wa-btn');
        w.href = 'https://wa.me/' + wa;
        w.target = '_blank';
        w.rel = 'noopener';
        w.appendChild(make('i', 'fab fa-whatsapp'));
        w.appendChild(document.createTextNode(' واتساب'));
        box.appendChild(w);
      }
      return box;
    },
    bullets: function (it) {
      var text = typeof it === 'string'
        ? it
        : (it && (it.text  it.item  it[Object.keys(it)[0]]));
      return make('li', '', text);
    }
  };

  function apply() {
    // النصوص العادية
    document.querySelectorAll('[data-bind]').forEach(function (el) {
      var v = get(el.getAttribute('data-bind'));
      if (typeof v === 'string' && v.trim()) el.textContent = v.trim();
    });

    // الهاتف والواتساب
    var c = data.company || {};
    var phone = (c.phone || '').trim();
    var shown = (c.phone_display  '').trim()  phone;
    var wa = (c.whatsapp || '').replace(/[^\d]/g, '');

    if (phone) {
      var tel = phone.replace(/[^\d+]/g, '');
      document.querySelectorAll('a[href^="tel:"]').forEach(function (a) {
        a.setAttribute('href', 'tel:' + tel);
      });
    }
    if (shown) {
      document.querySelectorAll('[data-phone]').forEach(function (el) {
        el.textContent = shown;
      });
    }
    if (wa) {
      document.querySelectorAll('a[href^="https://wa.me/"]').forEach(function (a) {
        a.setAttribute('href', 'https://wa.me/' + wa);
      });
    }
    // القوائم (كروت، خدمات، صور، نقاط)
    document.querySelectorAll('[data-list]').forEach(function (box) {
      var arr = get(box.getAttribute('data-list'));
      var fn = render[box.getAttribute('data-render')];
      if (!Array.isArray(arr) || !fn) return;
      box.textContent = '';
      arr.forEach(function (it) { box.appendChild(fn(it)); });
    });
  }

  Promise.all(NAMES.map(load)).then(function (res) {
    NAMES.forEach(function (n, i) { if (res[i]) data[n] = res[i]; });
    apply();
  });
})();
