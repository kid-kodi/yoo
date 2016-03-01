/*
 * spa.nav.js
 * Avatar feature module
*/

/*jslint         browser : true, continue : true,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true
*/
/*global $, spa */

spa.nav = (function () {
  'use strict';
  //---------------- BEGIN MODULE SCOPE VARIABLES --------------
  var
    configMap = {
      set_page_anchor : null,
      people_model    : null,

      settable_map : {
        set_page_anchor : true,
        people_model    : true
      }
    },

    stateMap  = {
      drag_map     : null,
      $drag_target : null,
      drag_bg_color: undefined
    },

    jqueryMap = {},

    updateNav,
    setJqueryMap, onTapNav,     
    onLogin,      onLogout,
    configModule, initModule;
  //----------------- END MODULE SCOPE VARIABLES ---------------

  //------------------- BEGIN UTILITY METHODS ------------------
  //--------------------- BEGIN DOM METHODS --------------------
  setJqueryMap = function ( $container ) {
    jqueryMap = { $container : $container };
  };

  updateNav = function ( $target ){
    var css_map, url;

    //$target.css({ 'background-color' : '#fff' });
    $target.addClass('spa-x-active');

    url = $target.attr( 'data-id' );

    //alert(url);

    configMap.set_page_anchor( url );
  };
  //---------------------- END DOM METHODS ---------------------

  //------------------- BEGIN EVENT HANDLERS -------------------
  onTapNav = function ( event ){
    var css_map,
      $elem_target = $('.spa-nav-box'),
      $target = $( event.elem_target ).closest('.spa-nav-box');

      $elem_target.css({ 'background-color' : 'transparent' });
      $elem_target.removeClass( 'spa-x-active' );

    if ( $target.length === 0 ){ return false; }
    updateNav( $target );
  };

  onLogin = function ( event, login_user ){
    var
      is_default, default_class, $target,
      permission_list = [],
      list_html  = String(),
      $nav       = $(this),
      people_db  = configMap.people_model.get_db(),
      user       = configMap.people_model.get_user(),
      $box;

    $nav.empty();
    // if the user is logged out, do not render
    if ( user.get_is_anon() ){ return false;}
    
    permission_list = user.permissions;


    for (var i = 0; i < permission_list.length; i++) {
      var 
        class_item, class_icon, permission, url, name;

      default_class = '';
      class_item    = 'spa-nav-box';
      permission    = permission_list[i];
      class_icon    = permission_list[i].icon;
      url           = permission_list[i].url;
      name          = permission_list[i].name;


      is_default = permission_list[i].is_default;

      if(is_default){
        default_class = 'spa-x-active';
      }

      list_html
        += '<div class="' +  class_item + ' ' + default_class
        + '" data-id="' + String( url ) + '">'
        +  '<span class="icon '+ class_icon +'"></span>'
        +  '<span class="text">'+spa.util_b.encodeHtml( name ) 
        + '</span></div>';
    }
    $nav.html( list_html );

    $target = $nav.find('.spa-nav-box.spa-x-active');
    if ( $target.length === 0 ){ return false; }
    updateNav( $target );

    return false;
  };

  onLogout = function ( event, logout_user ){
    jqueryMap.$container.empty();
  };
  //-------------------- END EVENT HANDLERS --------------------

  //------------------- BEGIN PUBLIC METHODS -------------------
  // Begin public method /configModule/
  // Example  : spa.nav.configModule({...});
  // Purpose  : Configure the module prior to initialization,
  //   values we do not expect to change during a user session.
  // Action   :
  //   The internal configuration data structure (configMap)
  //   is updated  with provided arguments. No other actions
  //   are taken.
  // Returns  : none
  // Throws   : JavaScript error object and stack trace on
  //            unacceptable or missing arguments
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
  // Example    : spa.nav.initModule( $container );
  // Purpose    : Directs the module to begin offering its feature
  // Arguments  : $container - container to use
  // Action     : Provides avatar interface for chat users
  // Returns    : none
  // Throws     : none
  //
  initModule = function ( $container ) {
    setJqueryMap( $container );

    // bind model global events
    $.gevent.subscribe( $container, 'spa-login',   onLogin  );
    $.gevent.subscribe( $container, 'spa-logout',  onLogout );

    // bind actions
    $container
      .bind( 'utap',       onTapNav       );

    return true;
  };
  // End public method /initModule/

  // return public methods
  return {
    configModule : configModule,
    initModule   : initModule
  };
  //------------------- END PUBLIC METHODS ---------------------
}());
