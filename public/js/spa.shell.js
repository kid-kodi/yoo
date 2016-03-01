/*
 * spa.shell.js
 * Shell module for SPA
*/

/*jslint         browser : true, continue : true,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true
*/
/*global $, spa */

spa.shell = (function () {
  'use strict';
  //---------------- BEGIN MODULE SCOPE VARIABLES --------------
  var
    configMap = {
      anchor_schema_map : {
        chat  : { opened : true, closed : true },
        page  : true
      },
      resize_interval : 200,
      main_html : String()
        + '<div class="spa-shell-head">'
          + '<div class="spa-shell-head-logo">'
            + '<h1>YOO!</h1>'
          + '</div>'
          + '<div class="spa-shell-head-search">'
            + '<form class="spa-shell-head-search-form">'
              + '<input type="text"/>'
              + '<input type="submit" style="display:none"/>'
              + '<div class="spa-shell-head-search-send">'
                + '<span class="ion-android-search"></span>'
              + '</div>'
            + '</form>'
          + '</div>'
          + '<div class="spa-shell-head-notif">'
            + '<div class="ion-android-social"></div>'
            + '<div class="ion-chatboxes"></div>'
            + '<div class="ion-android-earth"></div>'
          + '</div>'
          + '<div class="spa-shell-head-acct"></div>'
        + '</div>'
        + '<div class="spa-shell-main">'
          + '<div class="spa-shell-main-nav"></div>'
          + '<div class="spa-shell-main-content"></div>'
          + '<div class="spa-shell-main-people"></div>'
        + '</div>'
        + '<div class="spa-shell-foot"></div>'
        + '<div class="spa-shell-modal"></div>'
        + '<div class="spa-shell-flash"></div>'
    },
    stateMap = {
      $container  : undefined,
      anchor_map  : {},
      resize_idto : undefined
    },
    jqueryMap = {},

    setJqueryMap,   
    copyAnchorMap,  changeAnchorPart, onHashchange,
    onTapAcct,      onLogin,          onLogout,
    setPageAnchor,  initModule;
  //----------------- END MODULE SCOPE VARIABLES ---------------

  //------------------- BEGIN UTILITY METHODS ------------------
  // Returns copy of stored anchor map; minimizes overhead
  copyAnchorMap = function () {
    return $.extend( true, {}, stateMap.anchor_map );
  };
  //-------------------- END UTILITY METHODS -------------------

  //--------------------- BEGIN DOM METHODS --------------------
  // Begin DOM method /setJqueryMap/
  setJqueryMap = function () {
    var $container = stateMap.$container;

    jqueryMap = {
      $container : $container,
      $foot      : $container.find('.spa-shell-foot'),
      $acct      : $container.find('.spa-shell-head-acct'),
      $nav       : $container.find('.spa-shell-main-nav'),
      $people    : $container.find('.spa-shell-main-people'),
      $content   : $container.find('.spa-shell-main-content')
    };
  };
  // End DOM method /setJqueryMap/

  // Begin DOM method /changeAnchorPart/
  // Purpose    : Changes part of the URI anchor component
  // Arguments  :
  //   * arg_map - The map describing what part of the URI anchor
  //     we want changed.
  // Returns    :
  //   * true  - the Anchor portion of the URI was updated
  //   * false - the Anchor portion of the URI could not be updated
  // Actions    :
  //   The current anchor rep stored in stateMap.anchor_map.
  //   See uriAnchor for a discussion of encoding.
  //   This method
  //     * Creates a copy of this map using copyAnchorMap().
  //     * Modifies the key-values using arg_map.
  //     * Manages the distinction between independent
  //       and dependent values in the encoding.
  //     * Attempts to change the URI using uriAnchor.
  //     * Returns true on success, and false on failure.
  //
  changeAnchorPart = function ( arg_map ) {
    var
      anchor_map_revise = copyAnchorMap(),
      bool_return       = true,
      key_name, key_name_dep;

    // Begin merge changes into anchor map
    KEYVAL:
    for ( key_name in arg_map ) {
      if ( arg_map.hasOwnProperty( key_name ) ) {

        // skip dependent keys during iteration
        if ( key_name.indexOf( '_' ) === 0 ) { continue KEYVAL; }

        // update independent key value
        anchor_map_revise[key_name] = arg_map[key_name];

        // update matching dependent key
        key_name_dep = '_' + key_name;
        if ( arg_map[key_name_dep] ) {
          anchor_map_revise[key_name_dep] = arg_map[key_name_dep];
        }
        else {
          delete anchor_map_revise[key_name_dep];
          delete anchor_map_revise['_s' + key_name_dep];
        }
      }
    }
    // End merge changes into anchor map

    // Begin attempt to update URI; revert if not successful
    try {
      $.uriAnchor.setAnchor( anchor_map_revise );
    }
    catch ( error ) {
      // replace URI with existing state
      $.uriAnchor.setAnchor( stateMap.anchor_map,null,true );
      bool_return = false;
    }
    // End attempt to update URI...

    return bool_return;
  };
  // End DOM method /changeAnchorPart/
  //--------------------- END DOM METHODS ----------------------

  //------------------- BEGIN EVENT HANDLERS -------------------
  // Begin Event handler /onHashchange/
  // Purpose    : Handles the hashchange event
  // Arguments  :
  //   * event - jQuery event object.
  // Settings   : none
  // Returns    : false
  // Actions    :
  //   * Parses the URI anchor component
  //   * Compares proposed application state with current
  //   * Adjust the application only where proposed state
  //     differs from existing and is allowed by anchor schema
  //
  onHashchange = function ( event ) {
    var
      _s_page_previous, _s_page_proposed, s_page_proposed,
      _s_chat_previous, _s_chat_proposed, s_chat_proposed,
      anchor_map_proposed,
      is_chat_ok = true, is_page_ok = true,
      anchor_map_previous = copyAnchorMap();

    // attempt to parse anchor
    try { anchor_map_proposed = $.uriAnchor.makeAnchorMap(); }
    catch ( error ) {
      $.uriAnchor.setAnchor( anchor_map_previous, null, true );
      return false;
    }
    stateMap.anchor_map = anchor_map_proposed;


    // convenience vars for page
    _s_page_previous = anchor_map_previous._s_page;
    _s_page_proposed = anchor_map_proposed._s_page;

    // Begin adjust page component if changed
    if ( ! anchor_map_previous
     || _s_page_previous !== _s_page_proposed
    ) {
      s_page_proposed = anchor_map_proposed.page;

      spa.home.setPosition( 'closed' );
      spa.rec.setPosition( 'closed' );
      spa.proc.setPosition( 'closed' );
      spa.stock.setPosition( 'closed' );
      spa.rappo.setPosition( 'closed' );
      spa.admin.setPosition( 'closed' );

      switch ( s_page_proposed ) {

        case 'acceuil' :
          is_page_ok = spa.home.setPosition( 'opened' );
          break;

        case 'reception' :
          is_page_ok = spa.rec.setPosition( 'opened' );
          break;

        case 'processus' :
          is_page_ok = spa.proc.setPosition( 'opened' );
          break;

        case 'stockage' :
          is_page_ok = spa.stock.setPosition( 'opened' );
          break;

        case 'rapport' :
          is_page_ok = spa.rappo.setPosition( 'opened' );
          break;

        case 'administration' :
          is_page_ok = spa.admin.setPosition( 'opened' );
          break;

        default :
          //spa.users.setPosition( 'closed' );
          delete anchor_map_proposed.page;
          $.uriAnchor.setAnchor( anchor_map_proposed, null, true );
      }
    }
    // End adjust chat component if changed


    // Begin revert anchor if slider change denied
    if ( ! is_page_ok ) {
      if ( anchor_map_previous ) {
        $.uriAnchor.setAnchor( anchor_map_previous, null, true );
        stateMap.anchor_map = anchor_map_previous;
      }
      else {
        delete anchor_map_proposed.page;
        $.uriAnchor.setAnchor( anchor_map_proposed, null, true );
      }
    }
    // End revert anchor if slider change denied

    return false;
  };
  // End Event handler /onHashchange/

  onTapAcct = function ( event ) {
    var acct_text, user_name, user = spa.model.people.get_user();
    if ( user.get_is_anon() ) {
      user_name = prompt( 'Please sign-in' );
      spa.model.people.login( user_name );
      jqueryMap.$acct.html( '<div>... processing ...</div>' );
    }
    else {
     spa.model.people.logout();
    }
    return false;
  };

  onLogin = function ( event, login_user ) {
    var acct_html = String();

    acct_html 
    += '<img src="'+login_user.avtr+'"/>'
    +  '<div>'+ login_user.name +'</div>';

    jqueryMap.$acct.html( acct_html );
  };

  onLogout = function ( event, logout_user ) {
    jqueryMap.$acct.html( '<div>Please sign-in</div>' );
    setPageAnchor('');
  };
  //-------------------- END EVENT HANDLERS --------------------

  //---------------------- BEGIN CALLBACKS ---------------------

  // Begin callback method /setPageAnchor/
  // Example  : setPageAnchor( 'closed' );
  // Purpose  : Change the page component of the anchor
  // Arguments:
  //   * position_type - may be 'closed' or 'opened'
  // Action   :
  //   Changes the URI anchor parameter 'page' to the requested
  //   value if possible.
  // Returns  :
  //   * true  - requested anchor part was updated
  //   * false - requested anchor part was not updated
  // Throws   : none
  //
  setPageAnchor = function ( page_name ) {
    return changeAnchorPart({ page : page_name });
  };
  // End callback method /setChatAnchor/

  //----------------------- END CALLBACKS ----------------------

  //------------------- BEGIN PUBLIC METHODS -------------------
  // Begin Public method /initModule/
  // Example   : spa.shell.initModule( $('#app_div_id') );
  // Purpose   :
  //   Directs the Shell to offer its capability to the user
  // Arguments :
  //   * $container (example: $('#app_div_id')).
  //     A jQuery collection that should represent 
  //     a single DOM container
  // Action    :
  //   Populates $container with the shell of the UI
  //   and then configures and initializes feature modules.
  //   The Shell is also responsible for browser-wide issues
  //   such as URI anchor and cookie management
  // Returns   : none 
  // Throws    : none
  //
  initModule = function ( $container ) {
    // load HTML and map jQuery collections
    stateMap.$container = $container;
    $container.html( configMap.main_html );
    setJqueryMap();

    // configure uriAnchor to use our schema
    $.uriAnchor.configModule({
      schema_map : configMap.anchor_schema_map
    });

    // configure and initialize feature modules
    spa.nav.configModule({
      set_page_anchor : setPageAnchor,
      people_model    : spa.model.people
    });
    spa.nav.initModule( jqueryMap.$nav );

    spa.chat.configModule({
      chat_model      : spa.model.chat,
      people_model    : spa.model.people
    });
    spa.chat.initModule( jqueryMap.$foot );

    spa.avtr.configModule({
      chat_model   : spa.model.chat,
      people_model : spa.model.people
    });
    spa.avtr.initModule( jqueryMap.$people );

    spa.home.configModule({
      set_page_anchor : setPageAnchor,
      people_model    : spa.model.people
    });
    spa.home.initModule( jqueryMap.$content );

    spa.rec.configModule({
      set_page_anchor : setPageAnchor,
      people_model    : spa.model.people
    });
    spa.rec.initModule( jqueryMap.$content );

    spa.proc.configModule({
      set_page_anchor : setPageAnchor,
      people_model    : spa.model.people
    });
    spa.proc.initModule( jqueryMap.$content );

    spa.stock.configModule({
      set_page_anchor : setPageAnchor,
      people_model    : spa.model.people
    });
    spa.stock.initModule( jqueryMap.$content );

    spa.rappo.configModule({
      set_page_anchor : setPageAnchor,
      people_model    : spa.model.people
    });
    spa.rappo.initModule( jqueryMap.$content );

    spa.admin.configModule({
      set_page_anchor : setPageAnchor,
      people_model    : spa.model.people
    });
    spa.admin.initModule( jqueryMap.$content );

    // Handle URI anchor change events.
    // This is done /after/ all feature modules are configured
    // and initialized, otherwise they will not be ready to handle
    // the trigger event, which is used to ensure the anchor
    // is considered on-load
    //
    $(window)
      .bind( 'hashchange', onHashchange )
      .trigger( 'hashchange' );

    $.gevent.subscribe( $container, 'spa-login',  onLogin  );
    $.gevent.subscribe( $container, 'spa-logout', onLogout );

    jqueryMap.$acct
      .html( '<div>Please sign-in</div>' )
      .bind( 'utap', onTapAcct );
  };
  // End PUBLIC method /initModule/

  return { initModule : initModule };
  //------------------- END PUBLIC METHODS ---------------------
}());
