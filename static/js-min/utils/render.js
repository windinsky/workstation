/*! my-project-name 2016-03-11 */
windinsky.define("utils/render",["lib/ejs"],function(a,b,c){var d=a("lib/ejs");c.exports=function(a,b){var c=document.getElementById(a);return c?(c=c.innerHTML,b.__open="<?",b.__close="?>",d.render(c,b)):(console.log("missing template node "+a),"")}});