/*! my-project-name 2016-03-11 */
windinsky.define("lib/tween",[],function(a,b,c){var d={linear:function(a,b,c,d){return a*c/d+b},easeIn:function(a,b,c,d){return c*(a/=d)*a+b},easeOut:function(a,b,c,d){return-c*(a/=d)*(a-2)+b},easeInOut:function(a,b,c,d){return(a/=d/2)<1?c/2*a*a+b:-c/2*(--a*(a-2)-1)+b}};c.exports=d});