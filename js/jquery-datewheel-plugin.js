(function( $ ) {
  function daysInMonth(m, y) {
    return 32 - new Date(y, m, 32).getDate();
  }
  
  function getVal($dw, valname) {
    return parseInt($dw.find('.' + valname + ' .dwstrip span:first-child').text());
  }
  
  function setVal($dw, valname, val) {
    var $strip = $dw.find('.' + valname + ' .dwstrip');
    
    var c = $strip.children().length;
    
    while (c-- > 0 && parseInt($('span:first-child', $strip).text()) != val) {
      rol($strip);
    }
  }
  
  function nextStrip($strip) {
    return $strip.parent().nextAll('div:first').find('.dwstrip');
  }
  
  function addDivs($target, className, start, end) {
    var $p = $('<div/>', {'class':className});
    var $c = $('<div/>', {'class':'dwstrip'});
    $c.css({left:0});
    
    for (var i = start; i <= end; i++) {
      if (i == start) {
        $c.append($('<span/>', {text:'' + i, 'class':'dwfirst'}));
      } else {
        $c.append($('<span/>', {text:'' + i}));
      }
    }
    
    $p.append($c);
    $target.append($p);
  }
  
  function ror($strip) {
    var $s = $strip.children().last().remove();
    $strip.prepend($s);

    if ($($strip.children()[1]).hasClass('dwfirst')) {
      var $ns = nextStrip($strip);
      
      if ($ns) {
        ror($ns);
      }
    }    
    
    return $s;
  }
  
  function rol($strip) {    
    var $s = $strip.children().first().remove();
    $strip.append($s);

    if ($strip.children().first().hasClass('dwfirst')) {
      var $ns = nextStrip($strip);
      
      if ($ns) {
        rol($ns);
      }
    }

    return $s;
  }

  function adjustDays($dw) {
    var $strip = $('.dwd .dwstrip', $dw);
    var md = daysInMonth(getVal($dw, 'dwm')-1, getVal($dw, 'dwy'));
    var cd = $strip.children().length;
    
    if (md == cd) {
      return;
    }
    
    if (md > cd) {
      var $fd = $('.dwfirst', $strip);
      var $cs = $strip.children().first();
      
      for (var i = cd + 1; i <= md; i++) {
        var $nd = $fd.before($('<span/>', {text:i + ''}));
      }
      
      while (parseInt($strip.children().first().text()) != parseInt($cs.text())) {
        $strip.append($strip.children().first().remove());
      }
    } else {
      while (parseInt($strip.children().first().text()) > md) {
        $strip.prepend($strip.children().last().remove());
      }
      
      $('span', $strip).each(function () {
        var $this = $(this);
        
        if (parseInt($this.text()) > md) {
          $this.remove();
        }
      });
    }
    
  }
  
  function scrollStrip($strip, dx) {
    var nl = parseInt($strip.css('left')) + dx;
    var checkDays = false;
    var $dw = $strip.parents('.datewheel');
    var db = getVal($dw, 'dwy') * 100 + getVal($dw, 'dwm');
    
    while (nl > 0) {
      var $s = ror($strip);
      
      nl -= $s.outerWidth(true);
      
      adjustDays($dw);
    }
    
    while ($strip.children().first().is(':hidden')) {
      rol($strip);
    }
    
    while (nl < -$strip.children().first().outerWidth(true)) {
      var $s = rol($strip);
      
      nl += $s.outerWidth(true);

      adjustDays($dw);
    }
        
    $strip.css({left:nl});
  }
  
  var methods = {
     init : function( options ) {
      
       return this.each(function(){
         
         var $this = $(this),
              data = $this.data('datewheel');
          
          if (!data) {
            if (!options) {
              options = {};
            }
            
            defaults = {
                basedate: new Date(1970, 0, 1),
                date: new Date()
            };
            
            $.extend(defaults, options);
            
            options = defaults;
            
            $this.addClass('datewheel');
            
            $this.append('<span>m:</span>');
            addDivs($this, 'dwmin', 0, 59);
            $this.append('<span>h:</span>');
            addDivs($this, 'dwh', 0, 23);
            $this.append('<span>d:</span>');
            addDivs($this, 'dwd', 1, 31);
            $this.append('<span>m:</span>');
            addDivs($this, 'dwm', 1, 12);            
            $this.append('<span>y:</span>');
            addDivs($this, 'dwy norepeat', options.basedate.getFullYear(), options.basedate.getFullYear() + 100);
            
            $(document).bind('click.datewheel', methods.click);
              
            if ($('html.touch').length) {
              $(document).bind('touchstart.datewheel', methods.mousedown);
              $(document).bind('touchmove.datewheel', methods.mousemove);
              $(document).bind('touchend.datewheel', methods.mouseup);
            } else {
              $(document).bind('mousedown.datewheel', methods.mousedown);
              $(document).bind('mousemove.datewheel', methods.mousemove);
              $(document).bind('mouseup.datewheel', methods.mouseup);
            }
            
            $this.data('datewheel', options);
            
            $this.datewheel('date', options.date);
          }
       });
     },
     date : function(newdate) {
        var $this = $(this);

        if (newdate == undefined) {          
          return new Date(getVal($this, 'dwy'), getVal($this, 'dwm')-1, getVal($this, 'dwd'), getVal($this, 'dwh'), getVal($this, 'dwmin'));
        } else {
          setVal($this, 'dwy', newdate.getFullYear());
          setVal($this, 'dwm', newdate.getMonth()+1);
          setVal($this, 'dwd', newdate.getDate());
          setVal($this, 'dwh', newdate.getHours());
          setVal($this, 'dwmin', newdate.getMinutes());
          
          $this.trigger('datewheel.changed');          
          
          return newdate;
        }
     },
     click : function (event) {
      var $s = $(event.target);
      
      if (!$s.parent('.dwstrip').length) {
        return;
      }
      
      var $strip = $($(event.target).closest('.dwstrip')[0]);
      
      if ($strip.length) {
        setVal($strip.parents('.datewheel'), $strip.parent().attr('class'), parseInt($s.text()));
      }
     },
     mousedown : function (event) {
      var $strip = $($(event.target).closest('.dwstrip')[0]);
      
      if ($strip.length) {
        $.fn.datewheel.capture = $($(event.target).closest('.datewheel')[0]);
        var $dw = $.fn.datewheel.capture;
        var options = $dw.data('datewheel');
        
        options.strip = $strip;
                
        options.lastX = event.clientX;
        options.lastY = event.clientY;        
      }
     },
     mousemove : function (event) {
      var $dw = $.fn.datewheel.capture;
      
      if ($dw) {
        var options = $dw.data('datewheel');
        var $strip = options.strip;
        var dx = event.clientX - options.lastX;
        
        scrollStrip($strip, dx);

        $dw.trigger('datewheel.changing');
        
        options.lastX = event.clientX;
        options.lastY = event.clientY;
      }
     },
     mouseup : function (event) {
      var $dw = $.fn.datewheel.capture;
      if ($dw) {
        var options = $dw.data('datewheel');
        
        var $s = $(options.strip.children()[0]);
        var sl = parseInt(options.strip.css('left'));
        
        
        if (Math.abs(sl) > $s.outerWidth()/2) {
          rol(options.strip);
        }
        
        options.strip.css({left: 0});
        
        options.strip = null;
        $.fn.datewheel.capture = null;

        $dw.trigger('datewheel.changed');
      }
     },
     destroy : function( ) {

       return this.each(function(){

         var $this = $(this),
             data = $this.data('datewheel');

         // Namespacing FTW
         $(window).unbind('.datewheel');
         $this.removeData('datewheel');
       });

     },
     setdate : function () {}
  };

  $.fn.datewheel = function( method ) {
    if ( methods[method] ) {
      return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof method === 'object' || ! method ) {
      return methods.init.apply( this, arguments );
    } else {
      $.error( 'Method ' +  method + ' does not exist on jQuery.datewheel' );
    }
  };

})( jQuery );
