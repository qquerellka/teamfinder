

<section class="main-section">
    <!-- <img src="../static/Ellipse 33.svg" class = "background" alt=""> -->
    <div class="text">
        <p>Команда найдется для каждого</p>
    </div>
    <div class="main-text">
        <h1>Начни</h1>
        <h1 class="gradient-text">Хакатонить</h1> 
    </div>
    <div class="main-buttons">
        <a href="">Свободные агенты</a>
        <a href="">Найти команду</a>
        <a href="">Создать анкету</a>
    </div> 
</section>
<section class="popular-roles">
    <h2 class="title">Популярные роли</h2>
    <div class="roles-grid">
      <div class="role">
        <div class="role-name">Backend</div>
        <div class="role-teams">14 команд</div>
      </div>
      <div class="role">
        <div class="role-name">Frontend</div>
        <div class="role-teams">14 команд</div>
      </div>
      <div class="role">
        <div class="role-name">Fullstack dev</div>
        <div class="role-teams">14 команд</div>
      </div>
      <div class="role">
        <div class="role-name">Аналитик данных</div>
        <div class="role-teams">14 команд</div>
      </div>
      <div class="role">
        <div class="role-name">Product manager</div>
        <div class="role-teams">14 команд</div>
      </div>
      <div class="role">
        <div class="role-name">UX / UI дизайнер</div>
        <div class="role-teams">14 команд</div>
      </div>
      <div class="role">
        <div class="role-name">IOS / Android dev</div>
        <div class="role-teams">14 команд</div>
      </div>
      <div class="role">
        <div class="role-name">ML engineer</div>
        <div class="role-teams">14 команд</div>
      </div>
      <div class="role">
        <div class="role-name">DevOps инженер</div>
        <div class="role-teams">14 команд</div>
      </div>
    </div>
    <div class="more-roles">Ещё роли</div>

</section>


<style>
    * {
        color: #fff;
    }
    .main-section {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        margin-top: 147px;
    }
    .main-text {
        text-align: center;
        margin: 72px 0 72px;
    }
    .main-buttons {
        margin-bottom: 128px;
    }
    .gradient-text {
        /* padding: 20px 0; */
        background-image: linear-gradient(90deg, #E5469A, #FBA31C); /* Задаем градиент */
        -webkit-background-clip: text; /* Обрезаем фон по тексту */
        -webkit-text-fill-color: transparent; /* Делаем цвет текста прозрачным */
    }
    
    p {
        font-family: 'Igra Sans Variable';
        font-size: 24px;
        line-height: 130%;
        letter-spacing: 5%;
        padding: 0;
        margin: 0;
    }
    h1 {
        font-family: 'Igra Sans Variable';
        font-size: 200px;
        line-height: 160px;
        letter-spacing: -3%;
        font: 400;
        padding: 0;
        margin: 0;
    }
    h2 {
        font-family: 'Igra Sans Variable';
        font-size: 200px;
        letter-spacing: -3%;
        font: 400;
        padding: 0;
        margin: 0;
    }
    a {
        font-family: 'Noto Sans Display Variable';
        color: white;
        max-width: 164px;
        text-decoration: none;
        padding: 3px 50px;
        border: 3px solid;
        border-color: #fff;
        border-radius: 50px;
        font-size: 24px;
        margin:0 18px;
    }
    a:hover {
        transition: all 0.5s ease; /* Применить плавный переход ко всем свойствам */
        color: #000;
        background-color: #fff;
        /* background-color: #45a049; */
    }



    /* General styles */

.popular-roles {
  text-align: center;
  padding: 0 136px;
  margin-top: 198px;
}

/* Title styles */
.title {
  font-size: 2rem;
  margin-bottom: 20px;
  color: white;
}

/* Grid container */
.roles-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

/* Role card styles */
.role {
    font-family: 'Noto Sans Display Variable';
    display: flex;
    flex-direction: column;
    background-color: rgba(28, 28, 28, 1); /* Черный цвет с прозрачностью 80% */
    border: 2px solid #fff;
    border-radius: 12px;
    padding: 20px;
    text-align: left;
    transition: transform 0.2s, border-color 0.2s;
    cursor: pointer;
}

/* .role:hover {
    transform: translateY(-5px);
    border-color: rgba(255, 255, 255, 0.6);
} */

/* Role name styles */
.role-name {
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 10px;
}

/* Teams count styles */
.role-teams {
  font-size: 0.9rem;
  color: #aaaaaa;
}

/* More roles link */
.more-roles {
  margin-top: 20px;
  font-size: 1rem;
  color: #aaa;
  cursor: pointer;
  transition: color 0.2s;
}

.more-roles:hover {
  color: white;
}

/* Responsive design */
/* @media (max-width: 768px) {
  .roles-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .roles-grid {
    grid-template-columns: 1fr;
  }
} */

</style>