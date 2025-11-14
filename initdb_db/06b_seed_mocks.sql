INSERT INTO hackathon
  (name, description, image_link, start_date, end_date, registration_end_date,
   mode, city, team_members_minimum, team_members_limit, registration_link, prize_fund, status)
VALUES
-- 1. Москва, офлайн
('МосТех Хак 2026',
 'Городские сервисы: транспорт, экология, обращения граждан. Кластеры: AI, гео, интеграции.',
 'https://cdn.example.ru/hacks/mostech2026.png',
 '2026-02-07 10:00:00+03', '2026-02-09 19:00:00+03', '2026-02-03 23:59:59+03',
 'offline', 'Москва', 2, 5, 'https://mostech-hack.ru/register', '₽3,000,000', 'open'),

-- 2. Санкт-Петербург, гибрид
('Neva Data Challenge',
 'Data Engineering & Analytics: Kafka, Lakehouse, дешёвые витрины и real-time отчётность.',
 'https://cdn.example.ru/hacks/neva-data.jpg',
 '2026-03-14 09:30:00+03', '2026-03-16 18:30:00+03', '2026-03-10 23:59:59+03',
 'hybrid', 'Санкт-Петербург', 2, 6, 'https://nevadata.ru/apply', '₽1,800,000', 'open'),

-- 3. Казань, онлайн
('Tatarstan AI Weekend',
 'ML-кейсы для промышленности и GovTech. Менторинг от индустрии.',
 'https://cdn.example.ru/hacks/tatar-ai.webp',
 '2026-01-24 10:00:00+03', '2026-01-26 18:00:00+03', '2026-01-20 23:59:59+03',
 'online', 'Казань', 1, 5, 'https://aiweekend-rt.ru', '₽900,000', 'open'),

-- 4. Новосибирск, офлайн
('Siberia Cloud & DevOps',
 'Kubernetes, GitOps, observability, FinOps. Трек по CI/CD и безопасности цепочки поставок.',
 'https://cdn.example.ru/hacks/sib-devops.png',
 '2026-04-18 09:00:00+03', '2026-04-19 20:00:00+03', '2026-04-14 23:59:59+03',
 'offline', 'Новосибирск', 3, 6, 'https://sibcloud.dev/register', '₽2,200,000', 'open'),

-- 5. Нижний Новгород, гибрид
('Volga Mobility Hack',
 'Мобильные суперприложения: билеты, карты, рутины и UGC. iOS/Android + backend.',
 'https://cdn.example.ru/hacks/volga-mob.jpg',
 '2026-05-23 10:00:00+03', '2026-05-24 19:00:00+03', '2026-05-19 23:59:59+03',
 'hybrid', 'Нижний Новгород', 2, 5, 'https://volga-mob.ru', '₽1,200,000', 'open'),

-- 6. Екатеринбург, онлайн
('Ural CyberSec CTF&Hack',
 'CTF + продуктовые задания по DevSecOps, SAST/DAST, secrets, runtime security.',
 'https://cdn.example.ru/hacks/ural-cybersec.png',
 '2026-06-13 09:00:00+03', '2026-06-14 18:00:00+03', '2026-06-09 23:59:59+03',
 'online', 'Екатеринбург', 1, 4, 'https://ural-sec.ru', '₽700,000', 'open'),

-- 7. Самара, офлайн
('Samara Industrial AI',
 'Компьютерное зрение, предиктивная аналитика, оптимизация техпроцессов.',
 'https://cdn.example.ru/hacks/samara-ind-ai.jpg',
 '2026-07-04 09:00:00+03', '2026-07-06 17:30:00+03', '2026-06-30 23:59:59+03',
 'offline', 'Самара', 2, 6, 'https://samara-ai.pro/apply', '₽1,500,000', 'open'),

-- 8. Краснодар, гибрид
('South AgroTech Hack',
 'Агро-аналитика: NDVI, прогноз урожайности, логистика и сбыт.',
 'https://cdn.example.ru/hacks/agro-south.webp',
 '2026-08-22 09:00:00+03', '2026-08-23 20:00:00+03', '2026-08-18 23:59:59+03',
 'hybrid', 'Краснодар', 2, 5, 'https://agrotech-south.ru/register', '₽1,000,000', 'open'),

-- 9. Пермь, офлайн
('Perm Digital Breakers',
 'Городские сервисы и туризм: рекомендации маршрутов, AR-гиды, витрины событий.',
 'https://cdn.example.ru/hacks/perm-breakers.png',
 '2026-09-12 10:00:00+03', '2026-09-14 18:00:00+03', '2026-09-08 23:59:59+03',
 'offline', 'Пермь', 2, 5, 'https://perm-hack.ru', '₽800,000', 'closed'),

-- 10. Владивосток, офлайн
('Pacific SmartPort Hack',
 'Логистика и портовые операции: ETA, очередь причалов, энергоэффективность.',
 'https://cdn.example.ru/hacks/pacific-port.jpg',
 '2026-10-03 09:00:00+10', '2026-10-05 17:00:00+10', '2026-09-29 23:59:59+10',
 'offline', 'Владивосток', 3, 7, 'https://smartport-pac.ru/apply', '₽2,800,000', 'open'),

-- 11. Тюмень, онлайн
('Oil&Energy ML Lab',
 'Прогноз дебита, отказов, оптимизация режимов добычи. Open data + синтетика.',
 'https://cdn.example.ru/hacks/oil-ml.png',
 '2026-03-28 10:00:00+03', '2026-03-29 18:00:00+03', '2026-03-25 23:59:59+03',
 'online', 'Тюмень', 1, 5, 'https://energy-ml.tyu.ru', '₽1,300,000', 'open'),

-- 12. Сочи, гибрид
('ResortTech Experience',
 'Туризм и гостеприимство: динамическое ценообразование, отзывы, удержание.',
 'https://cdn.example.ru/hacks/resorttech.jpg',
 '2026-05-09 09:00:00+03', '2026-05-11 18:00:00+03', '2026-05-05 23:59:59+03',
 'hybrid', 'Сочи', 2, 6, 'https://resorttech.sochi/register', '₽1,600,000', 'open');
