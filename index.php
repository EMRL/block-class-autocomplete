<?php
/**
 * Plugin Name: Block Class Autocomplete
 * Description: Enables autocomplete for block classes in the Advanced tab.
 * Requires at least: 6.3
 * Requires PHP: 8.1
 * Version: 1.0.0
 * Author: EMRL, Corey Worrell
 * License: GPL-2.0-or-later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: block-class-autocomplete
 */

define('BLOCK_CLASS_AUTOCOMPLETE_FILE', __FILE__);
define('BLOCK_CLASS_AUTOCOMPLETE_DIR', __DIR__);

require_once BLOCK_CLASS_AUTOCOMPLETE_DIR.'/src/Editor.php';
require_once BLOCK_CLASS_AUTOCOMPLETE_DIR.'/src/RestApi.php';

(new BlockClassAutocomplete\Editor(
    dir: BLOCK_CLASS_AUTOCOMPLETE_DIR,
    file: BLOCK_CLASS_AUTOCOMPLETE_FILE,
))->register();

(new BlockClassAutocomplete\RestApi())->register();
