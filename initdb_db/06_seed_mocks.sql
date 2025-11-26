INSERT INTO hackathon
  (name, description, image_link, start_date, end_date, registration_end_date,
   mode, city, team_members_minimum, team_members_limit, registration_link, prize_fund, status)
VALUES
-- 1. Москва, офлайн
('МосТех Хак 2026',
 'Городские сервисы: транспорт, экология, обращения граждан. Кластеры: AI, гео, интеграции.',
 'https://storage.yandexcloud.net/teamfinder-hackathons-images/hackathons/1/cover.jpg',
 '2026-02-07T10:00:00+03:00', '2026-02-09T19:00:00+03:00', '2026-02-03T23:59:59+03:00',
 'offline', 'Москва', 2, 5, 'https://mostech-hack.ru/register', '₽3,000,000', 'open'),
-- 2. Санкт-Петербург, гибрид
('Neva Data Challenge',
 'Data Engineering & Analytics: Kafka, Lakehouse, дешёвые витрины и real-time отчётность.',
 'https://storage.yandexcloud.net/teamfinder-hackathons-images/hackathons/2/cover.jpg',
 '2026-03-14T09:30:00+03:00', '2026-03-16T18:30:00+03:00', '2026-03-10T23:59:59+03:00',
 'hybrid', 'Санкт-Петербург', 2, 6, 'https://nevadata.ru/apply', '₽1,800,000', 'open'),
-- 3. Казань, онлайн
('Tatarstan AI Weekend',
 'ML-кейсы для промышленности и GovTech. Менторинг от индустрии.',
 'https://storage.yandexcloud.net/teamfinder-hackathons-images/hackathons/3/cover.jpg',
 '2026-01-24T10:00:00+03:00', '2026-01-26T18:00:00+03:00', '2026-01-20T23:59:59+03:00',
 'online', 'Казань', 1, 5, 'https://aiweekend-rt.ru', '₽900,000', 'open'),
-- 4. Новосибирск, офлайн
('Siberia Cloud & DevOps',
 'Kubernetes, GitOps, observability, FinOps. Трек по CI/CD и безопасности цепочки поставок.',
 'https://storage.yandexcloud.net/teamfinder-hackathons-images/hackathons/4/cover.jpg',
 '2026-04-18T09:00:00+03:00', '2026-04-19T20:00:00+03:00', '2026-04-14T23:59:59+03:00',
 'offline', 'Новосибирск', 3, 6, 'https://sibcloud.dev/register', '₽2,200,000', 'open'),
-- 5. Нижний Новгород, гибрид
('Volga Mobility Hack',
 'Мобильные суперприложения: билеты, карты, рутины и UGC. iOS/Android + backend.',
 'https://storage.yandexcloud.net/teamfinder-hackathons-images/hackathons/5/cover.jpg',
 '2026-05-23T10:00:00+03:00', '2026-05-24T19:00:00+03:00', '2026-05-19T23:59:59+03:00',
 'hybrid', 'Нижний Новгород', 2, 5, 'https://volga-mob.ru', '₽1,200,000', 'open'),
-- 6. Екатеринбург, онлайн
('Ural CyberSec CTF&Hack',
 'CTF + продуктовые задания по DevSecOps, SAST/DAST, secrets, runtime security.',
 'https://storage.yandexcloud.net/teamfinder-hackathons-images/hackathons/6/cover.jpg',
 '2026-06-13T09:00:00+03:00', '2026-06-14T18:00:00+03:00', '2026-06-09T23:59:59+03:00',
 'online', 'Екатеринбург', 1, 4, 'https://ural-sec.ru', '₽700,000', 'open'),
-- 7. Самара, офлайн
('Samara Industrial AI',
 'Компьютерное зрение, предиктивная аналитика, оптимизация техпроцессов.',
 'https://storage.yandexcloud.net/teamfinder-hackathons-images/hackathons/7/cover.jpg',
 '2026-07-04T09:00:00+03:00', '2026-07-06T17:30:00+03:00', '2026-06-30T23:59:59+03:00',
 'offline', 'Самара', 2, 6, 'https://samara-ai.pro/apply', '₽1,500,000', 'open'),
-- 8. Краснодар, гибрид
('South AgroTech Hack',
 'Агро-аналитика: NDVI, прогноз урожайности, логистика и сбыт.',
 'https://storage.yandexcloud.net/teamfinder-hackathons-images/hackathons/8/cover.jpg',
 '2026-08-22T09:00:00+03:00', '2026-08-23T20:00:00+03:00', '2026-08-18T23:59:59+03:00',
 'hybrid', 'Краснодар', 2, 5, 'https://agrotech-south.ru/register', '₽1,000,000', 'open'),
-- 9. Пермь, офлайн
('Perm Digital Breakers',
 'Городские сервисы и туризм: рекомендации маршрутов, AR-гиды, витрины событий.',
 'https://storage.yandexcloud.net/teamfinder-hackathons-images/hackathons/9/cover.jpg',
 '2026-09-12T10:00:00+03:00', '2026-09-14T18:00:00+03:00', '2026-09-08T23:59:59+03:00',
 'offline', 'Пермь', 2, 5, 'https://perm-hack.ru', '₽800,000', 'closed'),
-- 10. Владивосток, офлайн
('Pacific SmartPort Hack',
 'Логистика и портовые операции: ETA, очередь причалов, энергоэффективность.',
 'https://storage.yandexcloud.net/teamfinder-hackathons-images/hackathons/10/cover.jpg',
 '2026-10-03T09:00:00+10:00', '2026-10-05T17:00:00+10:00', '2026-09-29T23:59:59+10:00',
 'offline', 'Владивосток', 3, 7, 'https://smartport-pac.ru/apply', '₽2,800,000', 'open'),
-- 11. Тюмень, онлайн
('Oil&Energy ML Lab',
 'Прогноз дебита, отказов, оптимизация режимов добычи. Open data + синтетика.',
 'https://storage.yandexcloud.net/teamfinder-hackathons-images/hackathons/24/cover.jpg',
 '2026-03-28T10:00:00+03:00', '2026-03-29T18:00:00+03:00', '2026-03-25T23:59:59+03:00',
 'online', 'Тюмень', 1, 5, 'https://energy-ml.tyu.ru', '₽1,300,000', 'open');
