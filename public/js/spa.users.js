/*
 * spa.users.js
 * Template for browser feature modules
 *
 * Michael S. Mikowski - mike.mikowski@gmail.com
 * Copyright (c) 2011-2012 Manning Publications Co.
*/

/*jslint         browser : true, continue : true,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true
*/

/*global $, spa */

spa.users = (function () {

  //---------------- BEGIN MODULE SCOPE VARIABLES --------------
  var
    configMap = {
      users_html : String()
      + '<div class="spa-users">'
        + '<h1>Utilisateurs</h1>'
      + '</div>',

      settable_map : {
        people_model    : true,
        set_page_anchor : true
      },
      people_model    : null,
      set_page_anchor : null
    },
    stateMap  = { 
      $append_target : null,
      position_type  : 'closed' 
    },
    jqueryMap = {},

    setPosition,
    onLogin,      onLogout,
    setJqueryMap, configModule, initModule;
  //----------------- END MODULE SCOPE VARIABLES ---------------

  //------------------- BEGIN UTILITY METHODS ------------------
  // example : getTrimmedString
  //-------------------- END UTILITY METHODS -------------------

  //--------------------- BEGIN DOM METHODS --------------------
  // Begin DOM method /setJqueryMap/
  setJqueryMap = function () {
    var $append_target = stateMap.$append_target,
    $users        = $append_target.find( '.spa-users' );

    jqueryMap = { 
      $users  : $users 
    };
  };
  // End DOM method /setJqueryMap/

  // Begin public method /setPosition/
  // Example   : spa.chat.setPosition( 'closed' );
  // Purpose   : Move the chat slider to the requested position
  // Arguments :
  //   * position_type - enum('closed', 'opened', or 'hidden')
  //   * callback - optional callback to be run end at the end
  //     of slider animation.  The callback receives a jQuery
  //     collection representing the slider div as its single
  //     argument
  // Action    :
  //   This method moves the slider into the requested position.
  //   If the requested position is the current position, it
  //   returns true without taking further action
  // Returns   :
  //   * true  - The requested position was achieved
  //   * false - The requested position was not achieved
  // Throws    : none
  //
  setPosition = function ( position_type, callback ) {
    //alert(position_type);
    // position type of 'opened' is not allowed for anon user;
    // therefore we simply return false; the shell will fix the
    // uri and try again.
    if ( position_type === 'opened'
      && configMap.people_model.get_user().get_is_anon()
    ){ return false; }

    // prepare animate parameters
    switch ( position_type ){
      case 'opened' :
      jqueryMap.$users.css({ display : 'block'});
      break;

      case 'closed' :
      jqueryMap.$users.css({ display : 'none'})
      break;

      // bail for unknown position_type
      default : jqueryMap.$users.css({ display : 'none'});
    }
    return true;
  };
  // End public DOM method /setSliderPosition/

  //---------------------- END DOM METHODS ---------------------

  //------------------- BEGIN EVENT HANDLERS -------------------
  onLogin = function ( event, login_user ) {
    configMap.set_page_anchor( 'opened' );
  };

  onLogout = function ( event, logout_user ) {
    configMap.set_page_anchor( 'closed' );
  };
  //-------------------- END EVENT HANDLERS --------------------



  //------------------- BEGIN PUBLIC METHODS -------------------
  // Begin public method /configModule/
  // Purpose    : Adjust configuration of allowed keys
  // Arguments  : A map of settable keys and values
  //   * color_name - color to use
  // Settings   :
  //   * configMap.settable_map declares allowed keys
  // Returns    : true
  // Throws     : none
  //
  configModule = function ( input_map ) {
    spa.util.setConfigMap({
      input_map    : input_map,
      settable_map : configMap.settable_map,
      config_map   : configMap
    });
    return true;
  };
  // End public method /configModule/

  // Begin public method /initModule/
  // Purpose    : Initializes module
  // Arguments  :
  //  * $append_target the jquery element used by this feature
  // Returns    : true
  // Throws     : none
  //
  initModule = function ( $append_target ) {
    stateMap.$append_target = $append_target;
    $append_target.html( configMap.users_html );
    setJqueryMap();
    return true;
  };
  // End public method /initModule/

  // return public methods
  return {
    setPosition  : setPosition,
    configModule : configModule,
    initModule   : initModule
  };
  //------------------- END PUBLIC METHODS ---------------------
}());
