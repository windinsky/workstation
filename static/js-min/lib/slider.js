/*! my-project-name 2016-03-11 */
windinsky.define("lib/slider",["jquery","lib/tween"],function(a,b,c){var d=a("jquery"),e=a("lib/tween"),f=function(a,b){this.container=a;var c={unitCounts:1,time:0,beginingPositoin:0,druation:20};this.opts=d.extend(c,b),this.init(),this.addEvents()};f.prototype={init:function(){var a=this,b=this.container.children().first(),c=b.children();a.unit=c.outerWidth()+parseInt(c.css("marginRight"))+parseInt(c.css("marginLeft")),b.width(a.unit*c.length),a.opts.changePositioin=a.container.width()},addEvents:function(){var a=this.opts;a.prev.click(this.prev.bind(this)),a.next.click(this.next.bind(this))},prev:function(){var a=this,b=a.opts,c=a.container;if(0==c[0].scrollLeft){var d=c.children(":first").children();d.first().before(d.slice(d.length-b.unitCounts)),c[0].scrollLeft+=b.changePositioin,b.beginingPositoin+=b.changePositioin}var f=setInterval(function(){var a=b.time,d=b.beginingPositoin,g=-b.changePositioin,h=b.druation;b.time<=b.druation?function(){c[0].scrollLeft=parseInt(e.easeInOut(a,d,g,h)),b.time++}():function(){clearInterval(f),b.time=0,b.beginingPositoin+=-b.changePositioin}()},20)},next:function(){var a=this,b=a.opts,c=a.container,d=setInterval(function(){var f=b.time,g=b.beginingPositoin,h=b.changePositioin,i=b.druation;b.time<=b.druation?function(){c[0].scrollLeft=parseInt(e.easeInOut(f,g,h,i)),b.time++}():function(){if(clearInterval(d),b.time=0,b.beginingPositoin+=b.changePositioin,b.beginingPositoin+a.unit*b.unitCounts==c.children().first().width()){var e=c.children(":first").children();e.last().after(e.slice(0,b.unitCounts)),c[0].scrollLeft-=b.changePositioin,b.beginingPositoin-=b.changePositioin}}()},20)}},c.exports=f});