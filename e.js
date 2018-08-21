var $ = function (query, root) {
  if (query[0] == '<') {
    var t = document.createElement('div');
    t.innerHTML = query;
    return [...t.childNodes];
  }
  root = root || document;
  return [...root.querySelectorAll(query)];
};

var anchor = $('#main h2.heading')[0];
var root = $('<div style="text-align: center"><input type="text" placeholder="enter filter such as needle -needle" style="width:80%"/></div>')[0];
if (anchor) {
    anchor.parentNode.insertBefore(root, anchor.nextSibling);
}
var input = root.firstChild;
var filter_name = 'ao3lter_story';
input.onchange = function () {
  treat_input(this.value);
  localStorage[filter_name] = this.value;
};
if (localStorage[filter_name] && /\S/.test(localStorage[filter_name])) {
  input.value = localStorage[filter_name];
  input.onchange();
}

function treat_input (input) {
    var criteria_shorthand = {
        "bookmarks": "bookmark",
        "c": "char",
        "chapters": "chapter",
        "comments": "comment",
        "f": "fandom",
        "hits": "hit",
        "kudos": "kudo",
        "u": "updated",
        "w": "word",
        "words": "word",
    };
    function treat_token (content, criteria, op) {
        criteria = criteria || ":";
        var operator = criteria.slice(-1);
        criteria = criteria_shorthand[criteria.slice(0, -1)] || criteria.slice(0, -1);
        crit[op][criteria] = crit[op][criteria] || [];
        crit[op][criteria].push(content);
    }

    var crit = {'':{}, '-': {}, '~': {}};

    input = input.toLowerCase().replace(/(?:^|\s)([~-])?([a-z]+:)?"([^"]*)"/ig, function(_, op, criteria, content){
        treat_token(content, criteria, op || '');
        return ' ';
    });

    input.replace(/(?:^|\s)([~-])?([a-z]+:)?(\S+)/ig, function(_, op, criteria, content){
        treat_token(content, criteria, op || '');
    });
    /* TODO: maybe optimize results per page by making an real search */
    var match_time = function (diff_days, term) {
        var factor = {
            w: 7,
            y: 365,
            m: 30,
        };
        var comp = (val, op) => val === op;
        if (term[0] === '<') {
            term = term.slice(1);
            comp = (val, op) => val < op;
        }
        if (term[0] === '>') {
            term = term.slice(1);
            comp = (val, op) => val > op;
        }
        var match = term.match(/^\s*(\d+)\s*([a-z]*)\s*$/i);
        var op = +match[1] * (factor[match[2].slice(0,1).toLowerCase()] || 1);
        return comp(diff_days, op);
    };
    var match_num = function (key, term, el) {
        var comp = (val, op) => val === op;
        if (term[0] === '<') {
            term = term.slice(1);
            comp = (val, op) => val < op;
        }
        if (term[0] === '>') {
            term = term.slice(1);
            comp = (val, op) => val > op;
        }
        var num = +($('dd.'+key, el)[0].innerText.split('/')[0].replace(/,/g, ''));
        return comp(num, term);
    };
    var criteria_accepted = {
        bookmark: function (term, el) {
            return match_num('bookmarks', term, el);
        },
        chapter: function (term, el) {
            return match_num('chapters', term, el);
        },
        char: function (term, el) {
            return $('li.relationships,li.characters', el).some(function (n) {
                var text = n.innerText.toLowerCase();
                return text.indexOf(term) !== -1;
            });
        },
        comment: function (term, el) {
            return match_num('comments', term, el);
        },
        fandom: function (term, el) {
            return $('.fandoms a.tag', el).some(function (n) {
                var text = n.innerText.toLowerCase();
                return text.indexOf(term) !== -1;
            });
        },
        hit: function (term, el) {
            return match_num('hits', term, el);
        },
        kudo: function (term, el) {
            return match_num('kudos', term, el);
        },
        is: function (term, el) {
            if (term === "complete") {
                return $('.complete-yes', el).length > 0;
            }
            if (term === "crossover") {
                return $('.fandoms a.tag', el).length > 1;
            }
            if (term === "ongoing") {
                return $('.complete-no', el).length > 0;
            }
            return $('span.category', el)[0].getAttribute('title').toLowerCase().split(', ').indexOf(term) !== -1 ||
                   $('span.rating', el)[0].getAttribute('title')[0].toLowerCase() === term;
        },
        lang: function (term, el) {
            var lang = $('dd.language', el).innerText;
            return lang.toLowerCase().indexOf(term) !== -1;
        },
        pair: function (term, el) {
            return $('li.relationships', el).some(function (n) {
                var text = n.innerText.toLowerCase();
                if (/^[<>]?[0-9]+$/.test(term)) {
                    var comp = (val, op) => val === op;
                    if (term[0] === '<') {
                        term = term.slice(1);
                        comp = (val, op) => val < op;
                    }
                    if (term[0] === '>') {
                        term = term.slice(1);
                        comp = (val, op) => val > op;
                    }
                    var pairs = textnd_content.match(/\[([^\]]+)\]/g) || []
                    if (comp(text.split[pair].split('/').length, term)) {
                        return true;
                    }
                }
                return term.split('/').filter(
                    term => term.slice(0, 1) === '-' ? text.indexOf(term.slice(1)) !== -1 : text.indexOf(term) === -1
                ).length === 0;
            });
        },
        tag: function (term, el) {
            return $('a.tag', el).some(function (n) {
                var text = n.innerText.toLowerCase();
                return text.indexOf(term) !== -1;
            });
        },
        updated: function (term, el) {
            var diff_days = (+new Date()/1000 - new Date($('p.datetime', el)[0].innerText)/1000)/86400;
            return match_time(diff_days, term);
        },
        word: function (term, el) {
            return match_num('words', term, el);
        },
        '': function (term, el) {
            var text = el.innerText.toLowerCase();
            return text.indexOf(term) !== -1;
        },
    };

    var rejecting = [[], new Set()];

    var try_reject = function (rejecting) {
        if (rejecting[0].length === 0) {
            return;
        }
        rejecting[0].forEach(e => e.style.display = 'none');
        var info = $('<li class="blurb reject" style="font-weight: bold; font-style: italic; text-align: center;"/>');
        info.forEach(e => rejecting[0][0].parentNode.insertBefore(e, rejecting[0][0]));
        info.forEach(e => e.innerText = rejecting[0].length + ' hidden because did not match '+[...rejecting[1]].join(', '))
        rejecting[0] = [];
        rejecting[1].clear();
    };
    rejecting[0].forEach(e => e.style.display = 'none')
    $('.blurb.reject').forEach(e => e.remove())
    $('.bookmark.blurb,.work.blurb').forEach(e => e.style.display = '');
    $('.bookmark.blurb,.work.blurb').forEach(function (e) {
        var crit_nomatch = new Set();
        var any_nomatch = new Set();
        op_loop:
        for (var op in crit) {
            for (var criteria in crit[op]) {
                for (var term of crit[op][criteria]) {
                    try {
                        var result = (criteria_accepted[criteria] || function () { return true; })(term, e);
                        switch (op) {
                            case "~":
                                // result is ok if at least one ~ token is true
                                if (result) {
                                    any_nomatch.clear();
                                    continue op_loop;
                                }
                                any_nomatch.add(op + (criteria ? criteria + ':' : '') + term);
                                break;
                            case "-":
                                result = !result;
                            default:
                                if (!result) {
                                    crit_nomatch.add(op + (criteria ? criteria + ':' : '') + term);
                                }
                        }
                    } catch (err) {
                        console.log('[ao3lter]: error applying '+criteria+':'+term+' for '+e.firstElementChild.getAttribute('href')+' on '+location.href+' ('+err+')');
                    }
                }
            }
        }
        if (crit_nomatch.size || any_nomatch.size) {
            rejecting[0].push(e);
            rejecting[1] = new Set([...rejecting[1], ...crit_nomatch, ...any_nomatch]);
            return;
        }
        try_reject(rejecting);
    });
    try_reject(rejecting);
}
