<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie', '_ignition/*', 'auth/*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['http://localhost:5173'], // Tu React
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true, // <--- ESTO ES LO IMPORTANTE (Cookies)
];