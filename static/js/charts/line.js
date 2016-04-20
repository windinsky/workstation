windinsky.define( 'charts/line' , [ 'jquery' , 'd3' , 'charts/bar' ] , function( require , exports , module ){

    var Bar      = require( 'charts/bar' )
        , d3     = require( 'd3' )
        , $      = require( 'jquery' )

        , colors = d3.scale
                     .category20c()
                     .domain( d3.range(20) );

    function Line( con , opts ){

        Bar.call( this , con , opts );
        
    };

    $.extend( Line.prototype , Bar.prototype );

    Object.defineProperty( Line.prototype , 'name' , {
        writable : false
        , value : 'line'
    });

    Line.prototype.refresh = function(){
        
        this.reset_size();

        var self = this
            , p  = this.__prop__.padding;

        if( !this.data.length ){

            this.svg.selectAll( 'g.lines,g.labels,g.points' )
                    .classed( 'hide' , true );

            return alert( 'no data left to display' );

        }

        this.svg.selectAll( 'g.lines,g.labels,g.points' )
                .classed( 'hide' , false );

        // flatten data
        var _data = [];

        for( var i = 0 ; i < this.data[0].length ; i++ ){
            for( var j = 0 ; j < this.data.length ; j++ ){
                _data.push( this.data[j][i] )
            }
        }

        var values = _data.map( function( item ){ return item[1]; } )

        var x_domain   = d3.range( self.data[0].length )
            , y_domain = [ d3.min( values ) , d3.max( values ) ]
            , x_range  = [ p , this.width - 2*p ]
            , y_range  = [ this.height - 2*p , p ]

        this.xScale.domain( x_domain ).rangePoints( x_range , 0 );
        this.yScale.domain( y_domain ).range( y_range );
        
        this.svg.select('.x.axis')
                .transition()
                .duration( 0 )
                .call(
                    this.xAxis
                        .outerTickSize( 3 )
                        .innerTickSize( -this.height + 3*p )
                        .tickPadding( 10 ) 
                )
                .attr( "transform" , "translate( " + 0 + " ," + ( this.height - p*2 ) + ")" )

        this.svg.select('.y.axis')
                .transition()
                .duration( 0 )
                .call(
                    this.yAxis
                        .outerTickSize( 3 )
                        .innerTickSize( -this.width + 3*p )
                )
                .attr( "transform" , "translate(" + p + ", " + 0 + " )" )

        var y_min_val = d3.min(
            self.data.reduce( function( a , b ){
                return a.concat(b);
            }).map( function( item ){
                return item[1];
            })
        );

        var lines = self.svg.selectAll( 'g.lines' );

        if( lines.empty() ){

            lines = self.svg.append( 'g' )
                            .attr( 'class' , 'lines' );

        }

        var lineFunction = d3.svg.line()
                                 .x( function( d , i ){
                                     return self.xScale( i );
                                 })
                                 .y( function( d ){
                                     return self.yScale( d[1] );
                                 })
                                 .interpolate( self.__prop__.style || "monotone");

        var line = lines.selectAll( 'path.line' ).data( self.data );

        line.enter()
            .append( 'path' )
            .attr( 'class' , 'line' )
            .attr( 'stroke' , function( d , i ){ return colors( i%20 ) } )
            .attr( 'd' , function( d ){
                return lineFunction( d );
                //return lineFunction( d ) + 'L' + self.xScale( d.length - 1 ) + ',' + self.yScale( y_min_val ) + 'L' + self.xScale( 0 ) + ',' + self.yScale( y_min_val ) + 'Z'
            });


        line.transition()
            .duration(0)
            line.attr( 'd' , function( d ){
                return lineFunction( d );
                //return lineFunction( d ) + 'L'+self.xScale( d.length - 1 ) + ',' + self.yScale( y_min_val ) + 'L' + self.xScale( 0 ) + ',' + self.yScale( y_min_val ) + 'Z'
            })
            .attr( 'class' , 'line' )
            .attr( 'stroke' , function( d , i ){ return colors( i%20 ) } )

        line.exit()
            .transition()
            .attr( 'opacity' , 0 )
            .remove();


        var points = self.svg.selectAll( 'g.points' );

        if( points.empty() ){
            
            points = self.svg.append( 'g' )
                             .attr( 'class' , 'points' );

        }

        //var point = points.selectAll( 'circle.point' ).data( self.data.reduce( function( a , b ){ return a.concat( b ); } ) );

        //point.enter()
        //     .append( 'circle' )
        //     .attr( 'class' , 'point' )
        //     .attr( 'cx' , function( d , i ){
        //         return self.xScale( i%self.data[0].length );
        //     })
        //     .attr( 'cy' , function( d ){
        //         return self.yScale( d[1] );
        //     })
        //     .attr( 'r' , 3 );

        //point.transition()
        //     .attr( 'cx' , function( d , i ){
        //         return self.xScale( i%self.data[0].length );
        //     })
        //     .attr( 'cy' , function( d ){
        //         return self.yScale( d[1] );
        //     })
        //     .style( 'transform-origin' , function( d , i ){
        //         return self.xScale( i%self.data[0].length ) + 'px ' + self.yScale( d[1] ) + 'px' ;
        //     });

        //     console.log(point);

        //point.exit()
        //     .transition()
        //     .attr( 'x' , self.width )
        //     .remove();


        return this;

    };

    module.exports = Line;

});
