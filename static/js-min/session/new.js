/*! my-project-name 2016-03-11 */
windinsky.define("session/new",["jquery"],function(a,b,c){var d=a("jquery");d("#go").click(function(){ga("send","event","点击","登录","冬季促销")}),d(document).on("keydown",function(a){13==a.keyCode&&d("#login").submit()})});