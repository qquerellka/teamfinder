# Концептуальная модель (Teamfinder)

**Сущности:** User, Hackathon, Application, Team, TeamMember, Vacancy, Invite, Response, Notification, (Events).

**Связи (кардинальности):**
- User 1—n Application
- Hackathon 1—n Application
- Hackathon 1—n Team
- Team 1—n TeamMember
- User 1—n TeamMember (инвариант: один user в одной команде на один хакатон)
- Team 1—n Vacancy
- Application 1—n Response (на вакансии)
- Vacancy 1—n Response
- Team 1—n Invite (команда приглашает анкеты)
- Application 1—n Invite
- User 1—n Notification
- (Events) User/Hackathon → ProductEvent (для аналитики)
