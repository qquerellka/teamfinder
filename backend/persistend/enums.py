from enum import Enum


# -----------------------------------------------------------------------------
# РОЛИ НА ХАКАТОНЕ
# -----------------------------------------------------------------------------
class RoleType(str, Enum):
    DevOps = "DevOps"
    GameDev = "GameDev"
    MobileDev = "MobileDev"
    ProductManager = "Product manager"
    DS = "DS"
    ML = "ML"
    Fullstack = "Fullstack"
    Backend = "Backend"
    Frontend = "Frontend"
    Designer = "Designer"
    Analytics = "Analytics"
    QA = "QA"


# -----------------------------------------------------------------------------
# СТАТУС АНКЕТЫ (application_status)
# -----------------------------------------------------------------------------
class ApplicationStatus(str, Enum):
    draft = "draft"
    published = "published"
    hidden = "hidden"


# -----------------------------------------------------------------------------
# РЕЖИМ И СТАТУС ХАКАТОНА
# -----------------------------------------------------------------------------
class HackathonMode(str, Enum):
    online = "online"
    offline = "offline"
    hybrid = "hybrid"


class HackathonStatus(str, Enum):
    open = "open"
    closed = "closed"


# -----------------------------------------------------------------------------
# СТАТУС КОМАНДЫ (team_status)
# -----------------------------------------------------------------------------
class TeamStatus(str, Enum):
    forming = "forming"
    ready = "ready"


# -----------------------------------------------------------------------------
# СТАТУС ВАКАНСИИ (vacancy_status)
# -----------------------------------------------------------------------------
class VacancyStatus(str, Enum):
    open = "open"
    closed = "closed"


# -----------------------------------------------------------------------------
# СТАТУС ИНВАЙТА (invite_status)
# -----------------------------------------------------------------------------
class InviteStatus(str, Enum):
    pending = "pending"
    accepted = "accepted"
    rejected = "rejected"
    expired = "expired"


# -----------------------------------------------------------------------------
# СТАТУС ОТКЛИКА (response_status)
# -----------------------------------------------------------------------------
class ResponseStatus(str, Enum):
    pending = "pending"
    accepted = "accepted"
    rejected = "rejected"
    withdrawn = "withdrawn"


# -----------------------------------------------------------------------------
# ДОСТИЖЕНИЯ (achiev_place)
# -----------------------------------------------------------------------------
class AchievementPlace(str, Enum):
    firstPlace = "firstPlace"
    secondPlace = "secondPlace"
    thirdPlace = "thirdPlace"
    finalyst = "finalyst"
    participant = "participant"


# -----------------------------------------------------------------------------
# ТИПЫ НОТИФИКАЦИЙ (notif_type)
# -----------------------------------------------------------------------------
class NotifType(str, Enum):
    info = "info"
    warning = "warning"

    response_accept = "response:accept"
    response_decline = "response:decline"

    invitation_new = "invitation:new"
    invitation_reject = "invitation:reject"
    invitation_accept = "invitation:accept"

    team_entry = "team:entry"
    team_leave = "team:leave"
    team_kicked = "team:kicked"
    
class InviteStatus(str, Enum):
    pending  = "pending"
    accepted = "accepted"
    rejected = "rejected"
    expired  = "expired"


class ResponseStatus(str, Enum):
    pending   = "pending"
    accepted  = "accepted"
    rejected  = "rejected"
    withdrawn = "withdrawn"