<?php

declare(strict_types=1);

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

require_once __DIR__.'/vendor/autoload.php';

(new BlockClassAutocomplete\Editor(__FILE__))->register();
(new BlockClassAutocomplete\RestApi())->register();
