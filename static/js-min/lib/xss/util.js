/*! my-project-name 2016-03-11 */
windinsky.define("lib/xss/util",[],function(a,b,c){c.exports={indexOf:function(a,b){var c,d;if(Array.prototype.indexOf)return a.indexOf(b);for(c=0,d=a.length;d>c;c++)if(a[c]===b)return c;return-1},forEach:function(a,b,c){var d,e;if(Array.prototype.forEach)return a.forEach(b,c);for(d=0,e=a.length;e>d;d++)b.call(c,a[d],d,a)},trim:function(a){return String.prototype.forEach?a.trim():a.replace(/(^\s*)|(\s*$)/g,"")}}});