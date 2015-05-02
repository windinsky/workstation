function getSelectedTextNodes(){
	var s = document.getSelection();
	if(s.isCollapsed){
		return [];
	}else{
		var elms = [];
		var range = s.getRangeAt(0);
		return getAllTextNodes(range)
		nodes.forEach(function(node){
			if(node.offset){
				var range = document.createRange();
				if(node.direction == 1){
					range.setStart(node.el,node.offset);
					range.setEnd(node.el,node.el.textContent.length);
				}
				if(node.direction == -1){
					range.setStart(node.el,0);
					range.setEnd(node.el,node.offset);
				}
				var span = document.createElement('span');
				span.style.color = 'red';
				return range.surroundContents(span);
			}
			var has_surrouded = false,tmp = node.el,surrounder = null;
			while(tmp && !tmp.nextSibling){
				if(tmp.nodeName == 'span' && tmp.getAttribute('data-w-editor-wrapper') !== null){
					has_surrouded = true;
					surrounder = tmp;
					break;
				}
				tmp = tmp.parentNode;
			}
			if(has_surrouded){
				surrounder.style.color = 'red';
				return;
			}
			
			var range = document.createRange();
			range.selectNode(node.el);
			var span = document.createElement('span');
			span.style.color = 'red';
			return range.surroundContents(span);
		})
	}
}
function findText(node,direction){
	var tmp = node;
	while(tmp){
		if(tmp.nodeType === 3) {
			if(tmp.textContent.replace(/\s+/g,'') != ''){
				return tmp;
			}else{
				tmp = direction == 1 ? tmp.nextSibling : tmp.previousSibling;
				continue;
			}
		}
		if(tmp.innerText.replace(/\s+/g,'') != ''){
			var iterator = document.createTreeWalker(tmp,NodeFilter.SHOW_TEXT,null,false);
			return (direction == 1 ? iterator.firstChild() : iterator.lastChild());
		}
		tmp = direction == 1 ? tmp.nextSibling : tmp.previousSibling;
	}
	tmp = node.parentNode;
	while(!(direction == 1 ? tmp.nextSibling : tmp.previousSibling)){
		tmp = tmp.parentNode;
	}
	return findText(direction == 1 ? tmp.nextSibling : tmp.previousSibling,direction);
}
function nextTextNode(node,offset){
	var n;
	if(offset === 0){
		n = document.body;
	}else{
		if(!node.childNodes[offset]){
			n = node;
			while(!n.nextSibling){
				n = n.parentNode;
			}
			n = n.nextSibling;
		}else{
			if(node.childNodes[offset].nodeType === 3){
				return node.childNodes[offset];
			}
			n = node.childNodes[offset];
		}
	}
	return findText(n,1);
}
function prevTextNode(node,offset){
	var n;
	if(offset === node.childNodes.length){
		n = document.body;
	}else{
		if(offset === 0){
			n = node;
			while(!n.previousSibling){
				n = n.parentNode;
			}
			n = n.previousSibling;
		}else{
			if(node.childNodes[offset].nodeType === 3){
				return node.childNodes[offset];
			}
			n = node.childNodes[offset - 1];
		}
	}
	return findText(n,-1);	
}
function getAllTextNodes(range){
	var ancestor = commonAncestor(range.startContainer,range.endContainer);
	var nodes = [];
	var r = range.cloneRange();
	
	// get first half text
	if(r.startOffset !== 0){
		nodes.push({
			el: r.startContainer,
			offset: r.startOffset,
			direction: 1
		});
		r.setStartAfter(r.startContainer);
	}

	// get end half text
	if(r.endContainer.nodeType === 3 && r.endOffset != r.endContainer.textContent.length){
		nodes.push({
			el: r.endContainer,
			offset: r.endOffset,
			direction: -1
		});
		r.setEndBefore(r.endContainer);
	}
	
	// reset start
	while(r.startOffset === 0 && r.startContainer.nodeName != 'body'){
		r.setStartBefore(r.startContainer);
	}
	// reset end
	if(r.endContainer.nodeType == 3){
		if(r.endOffset === r.endContainer.textContent.length){
			r.setEndAfter(r.endContainer);
		}
	}
	while(r.endContainer.childNodes.length === r.endOffset && r.endContainer.nodeName != 'body'){
		r.setEndAfter(r.endContainer);
	}
	
	var startNode = nextTextNode(r.startContainer,r.startOffset);
	var endNode = prevTextNode(r.endContainer,r.endOffset);

	var n, a=[], pastStart = false, reachEnd = false, walk = document.createNodeIterator(ancestor,NodeFilter.SHOW_TEXT,{
		acceptNode: function(node) {
			var result = null;
			if(node === startNode){
				pastStart = true;
			}
			if(pastStart && !reachEnd){
				result = NodeFilter.FILTER_ACCEPT;
			}
			if(node === endNode){
				reachEnd = true;
			}
			return result;
		}
	},true);
	var n = walk.nextNode();
	while(n && n.nodeType === 3) {
		nodes.push({
			el:n
		});
		n = walk.nextNode();
	}
	return nodes;
}
function commonAncestor(node1,node2){
	var tmp1 = node1, tmp2 = node2, arr1 = [], arr2 = [];
	while(tmp1.parentNode != null){
		arr1.unshift(tmp1.parentNode);
		tmp1 = tmp1.parentNode;
	}
	while(tmp2.parentNode != null){
		arr2.unshift(tmp2.parentNode);
		tmp2 = tmp2.parentNode;
	}
	var i = 0;
	while(arr1[i]){
		if(arr1[i] != arr2[i]) return arr1[i-1];
		i++;
	}
	// if it comes to here, node1 and node2 must be siblings or the same node
	return node1.parentNode;
}
//function commonAncestor(node1,node2){
//	var tmp1 = node1,tmp2 = node2;
//	// find node1's first parent whose nodeType == 1
//	while(tmp1.nodeType != 1){
//		tmp1 = tmp1.parentNode;
//	}
//	// insert an invisible span contains a strange character that no one 
//	// would use
//	// if you need to use this function many times,create the span outside
//	// so you can use it without creating every time
//	var span = document.createElement('span')
//		, strange_char = '\uee99';
//	span.style.display='none';
//	span.innerHTML = strange_char;
//	tmp1.appendChild(span);
//	// find node2's first parent which contains that odd character, that 
//	// would be the node we are looking for
//	while((tmp2.innerHTML || tmp2.textContent).indexOf(strange_char) == -1){
//		tmp2 = tmp2.parentNode;
//	}
//	// remove that dirty span
//	tmp1.removeChild(span);
//	return tmp2;
//}
