/*! my-project-name 2016-03-11 */
windinsky.define("article/edit",["jquery","lib/clearHtmlTag","localstorage","ui/confirm"],function(a,b,c){function d(){AutoSave.stop(k),AutoSave.updateCfg({namespace:k,url:"/articles/save"});var a=AutoSave.getRecords(k);a.length&&a.forEach(function(a){id==a.id&&ckeditor.setData(a.content)}),AutoSave.EventEmitter.on("articles_save_ok",function(a){f("#id").val()||f("#id").val(a[i].data.id)}),AutoSave.EventEmitter.on("articles_save_err",function(a){var b=a[0],c=a[1];c.error.code==windinsky.cfg.error_code.DATABASE.CONFLICT&&(AutoSave.removeRecord(k,function(a){return a.id==b.id}),new g("Auto save failed, your article has been modified on other client,you can save your version as a new article or load the new version(you would lose all your changes)",{yesBtn:"save mine as a new one",noBtn:"load latest version",callback:{yes:function(){f.ajax({data:{title:b.title,content:b.content},url:"/articles/save",type:"post",success:function(a){location.href="/article/show?id="+a.data.id},error:function(a){alert("save error"+a)}})},no:function(){var a=c.error.latest_record;f("#id").val(a.id),f("#title").val(a.title),ckeditor.setData(a.content),f(".tag").attr("checked",!1),a.tags.forEach(function(a){f("#tag_"+a.id).attr("checked","checked")})}}}))}),AutoSave.start(k)}function e(){if(l)return l=!l;var a,b=f("#id").val();if(a={id:b,title:f("#title").val(),content:ckeditor.getData(),fake_id:f("#fake_id").val(),tags:f(".tag:checked").map(function(a){return this.id.split("_")[1]}).toArray().join(","),updated_at:f("#updated_at").val()},a.title&&a.title!=j||a.content){var c=AutoSave.getRecords(k),d=!1;c.every(function(e,g){return e.id===b||e.fake_id===f("#fake_id").val()?(c[g]=a,AutoSave.updateRecords(k,c),d=!0,!1):!0}),!d&&AutoSave.addRecord(k,a)}}var f=a("jquery"),g=a("ui/confirm"),h=a("lib/clearHtmlTag"),j="New article",k="articles",l=!1;global.AutoSave?d():__localstorage_loaded.once("end",d),f("#title").on("keyup",function(){e(),f(".selected > span:first").html(h.process(this.value))}),ckeditor.on("change",e),f(".tag").change(e),f("#add_tag").click(function(){var a=f("#new_tag:visible");if(a.length){var b=a.val();if(!b)return alert("Are you kidding?");f.ajax({url:"/tags/save",data:{name:b,type:"article"},type:"post",dataType:"json",success:function(a){1==a.success&&(f('<input type="checkbox" value="'+a.data.id+'" checked class="tag" id="tag_'+a.data.id+'"/><label for="tag_'+a.data.id+'">'+b+"</label>").insertBefore("#new_tag"),f("#add_tag").html("+"),f("#new_tag").val("").hide())}})}else a=f("#new_tag"),a.show(),this.innerHTML="ok"})});