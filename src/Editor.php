<?php

declare(strict_types=1);

namespace BlockClassAutocomplete;

final class Editor
{
    public function __construct(
        private readonly string $dir,
        private readonly string $file,
    ) {
    }

    public function register(): self
    {
        \add_action('enqueue_block_editor_assets', [$this, 'assets']);

        return $this;
    }

    public function assets(): void
    {
        $asset = [
            'dependencies' => [],
            'version' => '',
        ];

        if (\is_file($path = $this->dir.'/build/index.asset.php')) {
            $asset = require $path;
        }

        \wp_enqueue_script(
            'block-class-autocomplete',
            \plugins_url('build/index.js', $this->file),
            $asset['dependencies'],
            $asset['version'],
        );

        \wp_enqueue_style(
            'block-class-autocomplete',
            \plugins_url('build/index.css', $this->file),
            [],
            $asset['version'],
        );
    }
}
