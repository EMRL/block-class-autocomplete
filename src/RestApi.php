<?php

declare(strict_types=1);

namespace BlockClassAutocomplete;

final class RestApi
{
    public function register(): self
    {
        \add_action('rest_api_init', [$this, 'routes']);

        return $this;
    }

    public function routes(): void
    {
        \register_rest_route('block-class-autocomplete/v1', '/suggestions', [
            'methods' => \WP_REST_Server::READABLE,
            'callback' => [$this, 'suggestions'],
            'permission_callback' => fn (): bool => \current_user_can('edit_posts'),
        ]);
    }

    public function suggestions(): \WP_REST_Response
    {
        return new \WP_REST_Response(\apply_filters('block-class-autocomplete/suggestions', []));
    }
}
