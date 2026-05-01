<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';
                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    if (prefersDark) document.documentElement.classList.add('dark');
                }
            })();
        </script>

        <style>
            /* The "Poppin" Experience: Clean, balanced, and smooth */
            html {
                scroll-behavior: smooth;
                background-color: #ffffff;
                /* Standard weight for the whole site */
                font-weight: 400; 
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
            }
            
            html.dark {
                background-color: #022c22;
            }

            /* Custom Emerald Scrollbar */
            ::-webkit-scrollbar {
                width: 10px;
            }
            ::-webkit-scrollbar-track {
                background: #f8fafc;
            }
            ::-webkit-scrollbar-thumb {
                background: #10b981;
                border-radius: 20px;
                border: 2px solid #f8fafc;
            }

            /* Emerald selection for a branded feel */
            ::selection {
                background-color: #d1fae5;
                color: #065f46;
            }

            /* Global non-bold overrides for UI elements */
            button, input, optgroup, select, textarea {
                font-weight: 500; /* Medium for readability, but not bold */
            }
        </style>

        <title inertia>{{ config('app.name', 'Qourte Salon Logo') }}</title>
        
        <link rel="preconnect" href="https://fonts.bunny.net">
        {{-- Loading Outfit (Primary) and Bricolage (Accent) --}}
        {{-- Focus on weights 400 (Regular) and 500 (Medium) for that clean look --}}
        <link href="https://fonts.bunny.net/css?family=outfit:400,500,600|bricolage-grotesque:400,500" rel="stylesheet" />

        {{-- Favicon - Multiple sizes for all devices and browsers --}}
        <link rel="icon" type="image/png" sizes="16x16" href="/logo.png">
        <link rel="icon" type="image/png" sizes="32x32" href="/logo.png">
        <link rel="icon" type="image/png" sizes="48x48" href="/logo.png">
        <link rel="icon" type="image/png" sizes="192x192" href="/logo.png">
        <link rel="icon" type="image/png" sizes="512x512" href="/logo.png">
        
        {{-- Apple Touch Icon for iOS devices --}}
        <link rel="apple-touch-icon" sizes="180x180" href="/logo.png">
        
        {{-- Fallback favicon --}}
        <link rel="shortcut icon" href="logo.png">

        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    {{-- font-normal (400) ensures the text isn't bold by default --}}
    <body class="antialiased bg-white text-slate-700 font-normal" style="font-family: 'Outfit', sans-serif;">
        @inertia
    </body>
</html>