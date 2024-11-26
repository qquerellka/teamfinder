<script>
	// let { children } = $props();
    import '@fontsource-variable/noto-sans-display';
</script>

<header class="navbar">
    <!-- Логотип слева -->
    <div class="logo">
        <a href="/">
            <img class="logo-img" src="teamfinder.svg" alt="Логотип компании">
        </a>
    </div>

    <!-- Кнопки навигации в центре -->
    <nav class="nav-links">
        <ul>
            <li><a href="hakatons">Хакатоны</a></li>
            <li><a href="teams">Команды</a></li>
            <li><a href="profiles">Анкеты</a></li>
            <li><a href="community">Сообщества</a></li>
            <li><a href="about">О проекте</a></li>
        </ul>
    </nav>

    <!-- Кнопка входа справа -->
    <div class="login-button">
        <a href="auth" class="login-button">Вход</a>
    </div>
</header>

<slot />

<style>
    /* noto-sans-display-latin-wght-normal */
    @font-face {
        font-family: 'Igra Sans Variable';
        font-style: normal;
        font-display: swap;
        font-weight: 100 900;
        src: url("$lib/fonts/IgraSans.otf");
    }
    /* noto-sans-display-latin-wght-normal */
    @font-face {
        font-family: 'Noto Sans Display Variable';
        font-style: normal;
        font-display: swap;
        font-weight: 100 900;
        src: url("$lib/fonts/NotSansDisplay.ttf");
    }
    /* Стили для навигационной панели */
    .navbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background-color: #010101;
        max-width: 1664px;
        padding: 18px 0;
    }

    a, button {
        font-family: 'Noto Sans Display Variable';
    }

    .logo-img {
        max-height: 56px;
        max-width: 232px;
    }

    ul {
        align-items: center;
    }

    /* Стили для навигационных ссылок */
    .nav-links ul {
        list-style: none;
        display: flex;
        padding: 0;
    }

    .nav-links li {
        margin: 0 15px;
    }

    .nav-links a {
        color: white;
        text-decoration: none;
        font-size: 24px;
    }

    .nav-links a:hover {
        text-decoration: underline;
    }

    /* Кнопка входа */
    .login-button a {
        color: white;
        max-width: 164px;
        text-decoration: none;
        padding: 3px 50px;
        border: 3px solid;
        border-color: #fff;
        border-radius: 50px;
        font-size: 24px;
    }
    .login-button a:hover {
        transition: all 0.5s ease; /* Применить плавный переход ко всем свойствам */
        color: #000;
        background-color: #fff;
        /* background-color: #45a049; */
    }



</style>

<!-- {@render children()} -->