/*! my-project-name 2016-03-11 */
windinsky.define("articles/index",["jquery"],function(a,b,c){$(".trash").click(function(){var a=$(this).parents("li:first").attr("id").split("_")[1];$.ajax({url:"/articles/delete",data:{id:a},dataType:"json",type:"delete",success:function(a){var b=$("#article_"+a.id);b.fadeOut(function(){b.remove()})}})})});