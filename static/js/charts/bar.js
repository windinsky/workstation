windinsky.define( 'charts/bar' , [ 'jquery' , 'd3' ] , function( require , exports , module ){

    var d3 = require( 'd3' );
    var $  = require( 'jquery' );
    var colors = d3.scale.category20c().domain( d3.range(20) );

    function Bar( con , opts ){
        
        this.data = [];
        this.__prop__ = $.extend( this.default_prop , opts );
        this.con = d3.select( con );

        var svg = this.svg = this.con
          .append( 'svg' )
          .attr("xmlns","http://www.w3.org/2000/svg")
          .attr( 'class' , '__chart_' + this.name )

        this.reset_size();

    }

    Bar.prototype.reset_size = function(){

        var rect = this.con.node().getBoundingClientRect();
        this.width = rect.width;
        this.height = rect.height;

        this.svg.attr( 'width' , this.width )
                .attr( 'height' , this.height )
    };

    Bar.prototype.default_prop = {
        skin : 'dark'
        , axis : true
        , ticks : true
        , max : undefined
        , min : undefined
        , padding : 40
    };

    Object.defineProperty( Bar.prototype , 'name' , {
        writable : false
        , value : 'bar'
    });

    Object.defineProperty( Bar.prototype , 'data' , {
    
        set : function( new_data ){
            this.__data__ = new_data;
        }
        , get : function(){
            return this.__data__;
        }

    });

    Bar.prototype.data = function( data ){

        if( data ){
            this.__data__ = data;
        }else{
            return this.__data__;
        }

    };

    Bar.prototype.remove_data_set = function( data_index ){
        
        this.data.splice( data_index , 1 );
        return this;

    };

    Bar.prototype.render = function(){

        if( this.el ){
            this.refresh();
        }else{
            this._render();
        }

        return this;
    };

    Bar.prototype.format_error = 'data format error, only accept [ [k1,num1],[k2,num2] ... ] or [ v1 , v2 , v3 ]';

    Bar.prototype.add_data_set = function( data ){

        var self = this;

        if( !data || !data instanceof Array ) throw this.format_error;

        data.forEach( function( item , i ){
            if( item === null || item === undefined ) throw self.format_error;
            if( item instanceof Array ){
                if( !item[1] || !item[1].toFixed ) throw self.format_error;
            }else{
                if( !item.toFixed ) return this.format_error;
                data[i] = [ (i+1).toString() , item ];
            }
        });

        this.data.push( data );

        return this;

    };

    Bar.prototype.add_data = function( data ){

        return this.append_datas( [ data ] );

    };

    Bar.prototype.append_datas = function( data ){

        console.assert( data && data instanceof Array && data.length === this.data.length , 'data 数目和当前数据不一致' );

        var self = this;

        data.forEach( function( d , i ){

            console.assert( d !== undefined && d !== null , this.format_error );

            if( d instanceof Array ){
                console.assert( d[1] !== undefined && d[1] !== null && d[1].toFixed , this.format_error );
            }
            if( d.toFixed ){
                data[i] = [ self.data[0].length.toString() , d ];
            }

            self.data[i].push( data[i] );
        
        });

        return this;

    }

    Bar.prototype._render = function(){

        this.xScale = d3.scale.ordinal();

        this.yScale = d3.scale.linear();

        this.yAxis = d3.svg.axis().scale( this.yScale ).orient( 'left' ).ticks( 5 );
        this.xAxis = d3.svg.axis().scale( this.xScale ).orient( 'bottom' ).ticks( 20 );

        this.svg.append( 'g' ).attr( 'class' , 'x axis' );
        this.svg.append( 'g' ).attr( 'class' , 'y axis' );

        this.refresh();

        return this;
    
    };

    Bar.prototype.refresh = function(){
        
        this.reset_size();

        var self = this;
        var p = this.__prop__.padding;

        if( !this.data.length ){
            this.svg.selectAll( 'g.bars,g.labels,g.lines,g.points' ).classed( 'hide' , true );
            return alert( 'no data left to display' );
        }

        // flatten data;
        var count = this.data[0].length;
        console.assert( this.data.every( function( arr ){
            return arr.length === count;
        }));

        var _data = [];

        for( var i = 0 ; i < this.data[0].length ; i++ ){
            for( var j = 0 ; j < this.data.length ; j++ ){
                _data.push( this.data[j][i] )
            }
        }

        var x_domain = self.data[0].map( function(item){ return item[0]; } )
        , y_domain = [ 0 , d3.max( _data.map( function(item){ return item[1]; } ) ) ]
        , x_range  = [ p , this.width - 2*p ]
        , y_range  = [ this.height - 2*p , p ];

        this.xScale.domain( x_domain ).rangeBands( x_range , .3 , .3 );
        this.yScale.domain( y_domain ).range( y_range );

        
        
        this.svg.select('.x.axis')
                .transition()
                .duration( 0 )
                .call( this.xAxis.outerTickSize( 3 ).innerTickSize( -this.height + 3*p ).tickPadding( 10 ) )
                .attr( "transform" , "translate( " + 0 + " ," + ( this.height - p*2 ) + ")" )

        this.svg.select('.y.axis')
                .transition()
                .duration( 0 )
                .call( this.yAxis.outerTickSize( 3 ).innerTickSize( -this.width + 3*p ) )
                .attr( "transform" , "translate(" + p + ", " + 0 + " )" )


        // only display lines when there is one set data
        if( this.data.length === 1 ){

            var lines = this.svg.select( 'g.lines' );
            if( lines.empty() ){

                lines = this.svg.append( 'g' )
                                .attr( 'class' , 'lines' );

                lines.append( 'path' )
                     .attr( 'class' , 'line' );
            
            }

            lines.classed( 'hide' , false );

            var lineFunction = d3.svg.line()
                  .x( function( d , i ){
                      var scale_mark = self.data[0].map( function( item ){ return item[0]; } )[ parseInt( i/self.data.length ) ];
                      return self.xScale( scale_mark ) + self.xScale.rangeBand()/2;
                  })
                  .y( function( d ){
                      return self.yScale( d[1] );
                  })
                  .interpolate("monotone");

            this.svg.selectAll( 'path.line' )
                    .transition()
                    .duration(0)
                    .attr( 'd' , lineFunction( this.data[0] ) )
                    .attr( 'class' , 'line' )

            var points = this.svg.selectAll( 'g.points' );

            if( points.empty() ){
                
                points = this.svg.append( 'g' )
                                 .attr( 'class' , 'points' );

            }

            points.classed( 'hide' , false );

            var point = points.selectAll( 'circle.point' ).data( this.data[0] );
            point.enter().append( 'circle' )

            point.transition()
                  .attr( 'cx' , function( d , i ){
                      return self.xScale( d[0] ) + self.xScale.rangeBand()/2;
                  })
                  .attr( 'cy' , function( d ){
                      return self.yScale( d[1] );
                  })
                  .style( 'transform-origin' , function( d , i ){
                      return  ( self.xScale( i ) + self.xScale.rangeBand()/2 ) + 'px ' + self.yScale( d[1] ) + 'px' ;
                  });

            point.exit()
                  .transition()
                  .attr( 'x' , this.width )
                  .remove();
        
        }else{
            
            this.svg.selectAll( 'g.lines , g.points ' ).classed( 'hide' , true )
                    .transition()
                    .duration( 500 )

        }

        var label_con = this.svg.selectAll( 'g.labels' );

        if( label_con.empty() ){
            label_con = this.svg.append( 'g' ).attr( 'class' , 'labels' );
        }

        label_con.classed( 'hide' , false );
        
        var labels = label_con.selectAll( 'text.label' ).data( _data );

        labels.enter()
              .append( 'text' )
              .attr( 'class' , 'label' )

        labels.transition()
              .duration( 0 )
              .attr( 'x' , function( d , i ){
                  var scale_mark = self.data[0].map( function( item ){ return item[0]; } )[ parseInt( i/self.data.length ) ];
                  return self.xScale( scale_mark ) + (i%self.data.length)*self.xScale.rangeBand() / self.data.length + self.xScale.rangeBand() / 2 / self.data.length;
              })
              .attr( 'y' , function( d ){
                  return self.yScale( d[1] ) - 10;
              })
              .text( function( d ){
                  return d[1];
              })
              .style( 'text-anchor' , 'middle' );



        labels.exit()
              .transition()
              .duration( 0 )
              .attr( 'x' , self.width )
              .remove();

        var bar_con = this.svg.select( 'g.bars' );

        if( bar_con.empty() ){
            bar_con = this.svg.append( 'g' ).attr( 'class' , 'bars' );
        }

        bar_con.classed( 'hide' , false );

        var bars = bar_con.selectAll('rect.bar')
                          .data( _data );


        bars.enter()
            .append( 'rect' )

        bars.transition()
            .duration( 500 )
            .attr( 'class' , 'bar' )
            .attr( 'x' , function( d , i ){
                var scale_mark = self.data[0].map( function( item ){ return item[0]; } )[ parseInt( i/self.data.length ) ];
                return self.xScale( scale_mark ) + (i%self.data.length)*self.xScale.rangeBand() / self.data.length;
            })
            .attr( 'y' , function( d ){
                return self.yScale( d[1] );
            })
            .attr( 'fill' , function( d , i ){
                return colors( i%self.data.length%20 );
            })
            .attr( 'width' , function(){
                return self.xScale.rangeBand() / self.data.length;
            })
            .attr( 'height' , function( d , i ){
                return self.height - 2*p - self.yScale( d[1] );
            });
        
        bars.exit()
            .transition()
            .attr( 'x' , this.width )
            .remove();

        return this;

    };

    Bar.prototype.prop = function( props ){
        
        if( props ){
            $.extend( this.__prop__ , props );
        }else{
            return this.__prop__;
        }

    }

    module.exports = Bar;

});
