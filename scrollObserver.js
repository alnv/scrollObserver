/*
 *
 * scrollObserver.js
 *
 * Copyright 2015 Alexander Naumov
 *
 * @license MIT
 */

/**
 * scrollObserver
 *
 * @author Alexander Naumov
 * @web http://www.alexandernaumov.de
 */
var scrollObserver = function(_options)
{
	

	var requestAnimationFrame;
	var options;
	var scrollY = 0;
	var elements = null;
	var trigger = {};

	/**
     * create raf
	 * http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
	 */
	var createRaf = function()
	{
		
		var raf = window.requestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			function(callback)
			{
				window.setTimeout(callback, 1000 / 60);
			}
		
		return raf;
	}

	/**
     * initialize requestAnimationFrame
     */
	var initRaf = function()
	{
		requestAnimationFrame = createRaf();
	}

	/**
     * start animate with custom fps
     */
	var animateFPS = function()
	{
		
		setTimeout( function() 
		{
			requestAnimationFrame(animateFPS);
			update();

		}, 1000 / options.fps );

	}

	/**
	 * no custom fsp
	 */
	var animateDefault = function()
	{
		requestAnimationFrame(animateDefault);
		update();
	}

	/**
	 * update scrollY Position & check trigger obj
	 */
	var update = function()
	{
		
		getGlobalYPosition();

		for ( var index in trigger )
		{
			callMainController(trigger[index]);
		}
	}
	
	/**
	 * check if position match any dom-element(data-scene)
	 * @param trigger obj 
	 */
	var callMainController = function(_object)
	{	

		//past bottom
		if( ( scrollY > _object.triggerEnd && scrollY > _object.triggerStart ) && !_object.past )
		{
			
			_object.past = true;
			_object.direction = "down";
			_object.yGlobPx = scrollY;
			_object.yPt = 100; 
			_object.yPx = _object.triggerEnd; 
			execController( _object, 'pastBottom' );

			for (var index in _object.subScenes )
			{
				callSubController( _object, _object.subScenes[index] );
			}

		}

		//arrived bottom
		if( ( scrollY < _object.triggerEnd && _object.past ) )
		{

			_object.past = false;
			_object.direction = "up";
			_object.yGlobPx = scrollY;
			_object.yPt = 100;
			_object.yPx = _object.triggerEnd;
			execController( _object, 'arrivedBottom' );

			for (var index in _object.subScenes )
			{
				callSubController( _object, _object.subScenes[index] );
			}

		}


		// animate
		if( ( scrollY > _object.triggerStart && scrollY < _object.triggerEnd ) && ( _object.yGlobPx !== scrollY ) )
		{

			_object.yPt = calcCurrentTriggerPositionInProzent( _object.triggerStart, _object.triggerEnd );
			_object.yPx = calcCurrentTriggerPositionInPixel( _object.triggerStart );
			_object.direction = getDirection( _object.yGlobPx );
			_object.yGlobPx = scrollY;
			execController( _object, 'animate' );

			for (var index in _object.subScenes )
			{
				callSubController( _object, _object.subScenes[index] );
			}


		}

		//arrived top 
		if( ( scrollY >= _object.triggerStart && !_object.arrive ) )
		{	
			
			_object.arrive = true;
			_object.direction = "down";
			_object.yGlobPx = scrollY;
			_object.yPt = 0;
			_object.yPx = 0;
			execController( _object, 'arrivedTop' );

			for (var index in _object.subScenes )
			{
				callSubController( _object, _object.subScenes[index] );
			}


		}

		//past top
		if( ( scrollY <= _object.triggerStart && _object.arrive ) && ( _object.yGlobPx !== scrollY ) )
		{	
			
			_object.arrive = false;
			_object.direction = "up";
			_object.yGlobPx = scrollY;
			_object.yPt = 0;
			_object.yPx = 0; 
			execController( _object, 'pastTop' );

			for (var index in _object.subScenes )
			{
				callSubController( _object, _object.subScenes[index] );
			}

		}

	}
	
	/**
	 * check if position match any dom-element (data-sub-controller)
	 * @param trigger obj, trigger obj
	 */
	var callSubController = function( _parentObject, _childObject )
	{
		//past bottom
		if( ( _parentObject.yPt >= _childObject.sceneEnd && _parentObject.yPt >= _childObject.sceneBegin ) && !_childObject.past )
		{

			_childObject.past = true;
			_childObject.direction = "down";
			_childObject.yGlobPx = scrollY;
			_childObject.yPt = 100; 
			_childObject.yPx = ( _parentObject.height / 100 ) * ( _childObject.sceneEnd - _childObject.sceneBegin );
			execController( _childObject, 'pastBottom' );
			
			
		}

		//arrived bottom
		if( ( _parentObject.yPt < _childObject.sceneEnd && _childObject.past ) )
		{
			
			_childObject.past = false;
			_childObject.direction = "up";
			_childObject.yGlobPx = scrollY;
			_childObject.yPt = 100;
			_childObject.yPx = ( _parentObject.height / 100 ) * ( _childObject.sceneEnd - _childObject.sceneBegin );

			execController( _childObject, 'arrivedBottom' );
			

		}


		// animate
		if( ( _parentObject.yPt > _childObject.sceneBegin && _parentObject.yPt < _childObject.sceneEnd ) && ( _childObject.yGlobPx !== _parentObject.yPt ) )
		{

			
			_childObject.direction = getDirection( _childObject.yGlobPx );
			_childObject.yGlobPx = scrollY;
			_childObject.yPx = _parentObject.yPx - ( ( _parentObject.height / 100 ) *  _childObject.sceneBegin );
			_childObject.yPt = ( ( _parentObject.yPt -  _childObject.sceneBegin ) / (  _childObject.sceneEnd -  _childObject.sceneBegin )  ) * 100;
			execController( _childObject, 'animate' );

		}

		//arrived top 
		if( ( _parentObject.yPt > _childObject.sceneBegin &&  !_childObject.arrive ) )
		{
			_childObject.arrive = true;
			_childObject.direction = "down";
			_childObject.yGlobPx = scrollY;
			_childObject.yPt = 0;
			_childObject.yPx = 0;
			execController( _childObject, 'arrivedTop' );
		}

		//past top
		if( ( _parentObject.yPt <= _childObject.sceneBegin && _childObject.arrive ) )
		{	
			_childObject.arrive = false;
			_childObject.direction = "up";
			_childObject.yGlobPx = scrollY;
			_childObject.yPt = 0;
			_childObject.yPx = 0; 
			execController( _childObject, 'pastTop' );

		}
	}



	/**
	 * call controller function
	 * @param trigger obj, String (= state-> pastTop, arrivedTop, animate, arrivedBottom, pastBottom)
	 */
	var execController = function( _object,  _state)
	{
		if( _object.controller !== null )
		{
			options.controllers[_object.controller]( _object, _state );
		}
	}

	/**
	 * get current window scroll position and add an offset
	 */
	var getGlobalYPosition = function(  )
	{
		scrollY = window.scrollY + getTrigger();
	}

	/**
	 * get current scroll direction
	 */
	var getDirection = function( currY )
	{	
		
		if( scrollY > currY )
		{
			return "down";
		}
		if( scrollY < currY )
		{
			return "up";
		}
	}

	/**
	 * current position-y in % from current scene
	 */
	var calcCurrentTriggerPositionInProzent = function( startPos, endPos )
	{
		
		return ( ( scrollY - startPos ) / ( endPos - startPos )  ) * 100;
	}

	/**
	 * current postiony-y in px from current scene
	 */
	var calcCurrentTriggerPositionInPixel = function( startPos )
	{
		
		return scrollY - startPos;
	}

	/**
	 * init requestAnimationFrame and start animate
	 */
	var startAnimation = function()
	{
		
		initRaf();
		
		if( options.fps > 0 )
		{
			animateFPS();
		}
		else
		{
			animateDefault();
		}

	}

	/**
	 * set events handler
	 */
	var setEventHandler = function()
	{
		document.addEventListener( 'touchmove', onMoveEvent, false );
		document.addEventListener( 'scroll', onScrollEvent, false );
		window.addEventListener( 'resize', onResizeEvent );
	}

	/**
	 * event handler
	 */
	var onMoveEvent = function()
	{
		getGlobalYPosition();
	}
	var onScrollEvent = function()
	{
		getGlobalYPosition();
	}
	var onResizeEvent = function()
	{
		getGlobalYPosition();
		onResize();
	}

	/**
	 * get custom options
	 */
	var initOptions = function()
	{

		_options = _options || {};

		//default
		options =
		{
			fps: 0,
			triggerOffset: 0,
			controllers: {}
		}

		//override
		for (var option in _options)
		{
			options[option] = _options[option];
		}

	}

	/**
	 * get current offset in %
	 */
	var getTrigger = function()
	{
		
		return ( ( window.innerHeight / 100 ) * options.triggerOffset );
	}

	/**
	 * set elements var
	 */
	var setElements = function()
	{
		
		elements = elements !== null ? elements : document.querySelectorAll('[data-scene]');
		getScenes();

	}

	/**
	 * init trigger object
	 */
	var getScenes = function getSubScenes( _parentScene )
	{

		
		var _i = 0;
		var _ctlNameAttr = 'data-controller';
		var _scenes = elements;
		var _trigger = {};

		if( _parentScene !== undefined )
		{
			_scenes = _parentScene.querySelectorAll('[data-sub-scene]');
		}

		/**
		 *
		 */
		while ( _i < _scenes.length )
		{

			var _scene =  _scenes[ _i ];
			
			/**
			 *
			 */
			if( _parentScene !== undefined )
			{
			
				_ctlNameAttr = 'data-sub-controller';
			
			}

			/**
			 *
			 */
			var _controller = _scene.getAttribute(_ctlNameAttr) || null;
			var _triggerStart =  _scene.offsetTop;
			var _triggerEnd =  ( _scene.offsetHeight + _scene.offsetTop );

			/**
			 *
			 */
			_trigger[ _i ] = 
			{

				index: _i,
				triggerStart: _triggerStart,
				triggerEnd: _triggerEnd,
				controller: _controller,
				height: ( _triggerEnd - _triggerStart ),
				past: false,
				arrive: true,
				direction: 'down',
				yGlobPx: scrollY,
				yPx: scrollY - _triggerStart,
				yPt: ( ( scrollY - _triggerStart ) / ( _triggerEnd - _triggerStart )  ) * 100

			}
			
			/**
			 *
			 */
			if( _parentScene === undefined )
			{
				
				//parent
				_trigger[ _i ]['subScenes'] = getSubScenes( _scene );

			}
			else
			{

				//sub
				_trigger[ _i ]['sceneBegin'] = parseInt( _scene.getAttribute('data-scene-begin') ) || 0;
				_trigger[ _i ]['sceneEnd'] = parseInt( _scene.getAttribute('data-scene-end') ) || 100;


			}
			
			_i++;
		
		}
		
		if( _parentScene === undefined )
		{
			trigger = _trigger;
		}
		else
		{
			return _trigger;
		}

	}

	/**
	 * set trigger obj on onresize
	 */
	var onResize = function _onResize( _subtrigger, _sceneIndex )
	{
		
		var _elements = elements;
		var _i = 0;
		var _el;
		var _triggerStart;
		var _triggerEnd;
		var _triggerObj;

		_triggerObj = _subtrigger === undefined ? trigger : _subtrigger;

		if( _subtrigger !== undefined )
		{
			_elements = elements[_sceneIndex].querySelectorAll('[data-sub-scene]');
		}

		while( _i < _elements.length )
		{
			_el = _elements[_i];
			
			_triggerStart = _el.offsetTop;
			_triggerEnd = _el.offsetHeight + _el.offsetTop;

			_triggerObj[_i].triggerStart = _triggerStart;
			_triggerObj[_i].triggerEnd = _triggerEnd;
			_triggerObj[_i].height = _triggerEnd - _triggerStart;
			
			if( _subtrigger === undefined )
			{
				_onResize( _triggerObj[_i]['subScenes'], _i);
			}

			_i++;
		}
	
	}


	/**
	 * construct
	 */
	var construct = (function()
	{
		initOptions();
		getGlobalYPosition();
		setElements();
		setEventHandler();
		startAnimation();

	})();
}