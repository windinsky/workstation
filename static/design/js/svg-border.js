var SVG_BORDER_NAMESPACE = {};


function SVGBorder(element , opts){

	opts = opts || {};
	
	var default_cfg = {
		
		inside: false,
		shape: 'rectangle'	// accept rectangle,diamond,circle,oval

	}

	for(var i in default_cfg){
		default_cfg.hasOwnProperty(i) 
		&& opts[i] === undefined
		&& (opts[i] = default_cfg[i]);
	}

	var r = element.getBoundingClientRect()
		, ct = document.clientTop || document.body.clientTop || 0
		, cl = document.clientLeft || document.body.clientLeft || 0
		, st = document.documentElement.scrollTop || document.body.scrollTop || 0
		, sl = document.documentElement.scrollLeft || document.body.scrollLeft || 0
		, rect = [ r.width , r.height ]
		, offset = [ r.top + ct + st , r.left + cl + sl ];

	this.svg = SVG_BORDER_NAMESPACE.__create_svg(rect,offset,opts);

}

SVG_BORDER_NAMESPACE.__create_svg = function(rect , offset , opts){

	if(!opts.inside){
		rect[0]+=2;
		rect[1]+=2;
		offset[0]-=1;
		offset[1]-=1;
	}

	switch(opts.shape){
		case 'rectangle':
			return SVG_BORDER_NAMESPACE.createRect(rect,offset,opts);
		case 'diamond':
			return SVG_BORDER_NAMESPACE.createDiamond(rect,offset,opts);
		case 'circle':
			return SVG_BORDER_NAMESPACE.createCircle(rect,offset,opts);
		case 'oval':
			return SVG_BORDER_NAMESPACE.createOval(rect,offset,opts);
	}

};

SVG_BORDER_NAMESPACE.createRect = function(rect,offset,opts){
	
	rect[0] += 10;
	rect[1] += 10;
	offset[0] -= 5;
	offset[1] -= 5;

	var svgDoc = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	SVG_BORDER_NAMESPACE.__apply_attrs(svgDoc,{
		width: rect[0],
		height: rect[1]
	});
	SVG_BORDER_NAMESPACE.__apply_styles(svgDoc,{
		position:'absolute',
		top: offset[0] + 'px',
		left: offset[1] + 'px'
	});

	var d = ['M5,5','H'+(rect[0]-5),'V'+(rect[1]-5),'H5','Z'].join(' ');
	var path = document.createElementNS('http://www.w3.org/2000/svg','path');
	var id = 'rect_path_' + new Date().getTime() + parseInt(Math.random()*1000);
	SVG_BORDER_NAMESPACE.__apply_attrs(path,{
		'stroke-width':1,
		'stroke':'rgba(255,255,255,.5)',
		'fill':'rgba(255,255,255,.3)',
		'r':'5',
		d:d,
		id:id
	});
	svgDoc.appendChild(path);

	var circle = document.createElementNS('http://www.w3.org/2000/svg','circle');
	SVG_BORDER_NAMESPACE.__apply_attrs(circle,{
		'r':5,
		fill:opts.color || 'white'
	});
	var animate = document.createElementNS('http://www.w3.org/2000/svg','animate');
	SVG_BORDER_NAMESPACE.__apply_attrs(animate,{
		'attributeName':'r',
		'from':'1',
		'to':'5',
		'begin':'0s',
		'dur':'0.8s',
		'repeatCount':'indefinite'
	});
	circle.appendChild(animate);
	animate = document.createElementNS('http://www.w3.org/2000/svg','animate');
	SVG_BORDER_NAMESPACE.__apply_attrs(animate,{
		'attributeName':'fill-opacity',
		'from':'1',
		'to':'0.5',
		'begin':'0s',
		'dur':'0.8s',
		'repeatCount':'indefinite'
	});
	circle.appendChild(animate);
	var animateMotion = document.createElementNS('http://www.w3.org/2000/svg','animateMotion');
	SVG_BORDER_NAMESPACE.__apply_attrs(animateMotion,{
		'dur':'2s',
		'repeatCount':'indefinite',
	});

	var mpath = document.createElementNS('http://www.w3.org/2000/svg','mpath');
	mpath.setAttributeNS("http://www.w3.org/1999/xlink", "href", "#"+id);


	animateMotion.appendChild(mpath);
	circle.appendChild(animateMotion);
	svgDoc.appendChild(circle);
	document.body.appendChild(svgDoc);

	return svgDoc;

}

SVG_BORDER_NAMESPACE.__apply_attrs = function(ele,attrs){
	for(var i  in attrs) attrs.hasOwnProperty(i) && ele.setAttribute(i,attrs[i]);
}

SVG_BORDER_NAMESPACE.__apply_styles = function(ele,styles){
	for(var i in styles) styles.hasOwnProperty(i) && (ele.style[i] = styles[i]);
}
