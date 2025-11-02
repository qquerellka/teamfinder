-- Принять инвайт (actor = владелец анкеты)
CREATE OR REPLACE FUNCTION accept_invite(p_invite_id BIGINT, p_actor_user_id BIGINT)
RETURNS VOID AS $$
DECLARE
  v_team_id BIGINT;
  v_app_id BIGINT;
  v_role TEXT;
  v_hack_id BIGINT;
  v_user_id BIGINT;
BEGIN
  SELECT i.team_id, i.application_id, i.invited_role, t.hackathon_id, a.user_id
    INTO v_team_id, v_app_id, v_role, v_hack_id, v_user_id
  FROM invite i
  JOIN team t ON t.id=i.team_id
  JOIN application a ON a.id=i.application_id
  WHERE i.id=p_invite_id AND i.status='pending'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invite not found or not pending';
  END IF;

  IF v_user_id <> p_actor_user_id THEN
    RAISE EXCEPTION 'Only owner of application can accept invite';
  END IF;

  -- Вставка участника (триггер проверит "1 команда на хак")
  INSERT INTO team_member(team_id, user_id, role, is_captain)
  VALUES (v_team_id, v_user_id, v_role, FALSE);

  -- Скрыть анкету / пометить joined
  UPDATE application SET joined=TRUE, status='hidden' WHERE id=v_app_id;

  -- Закрыть другие инвайты и отклики этого пользователя по этому хакатону
  UPDATE invite i SET status='expired'
  FROM application a, team t
  WHERE i.application_id=a.id AND a.user_id=v_user_id
    AND t.id=i.team_id AND t.hackathon_id=v_hack_id
    AND i.id<>p_invite_id AND i.status='pending';

  UPDATE response r SET status='rejected'
  FROM application a, vacancy v, team t
  WHERE r.application_id=a.id AND a.user_id=v_user_id
    AND v.id=r.vacancy_id AND t.id=v.team_id AND t.hackathon_id=v_hack_id
    AND r.status='pending';

  PERFORM 1 FROM event_type WHERE code='invite.accept';
  INSERT INTO product_event(user_id, hackathon_id, team_id, type_id)
  SELECT v_user_id, v_hack_id, v_team_id, et.id FROM event_type et WHERE et.code='invite.accept';

  INSERT INTO product_event(user_id, hackathon_id, team_id, type_id)
  SELECT v_user_id, v_hack_id, v_team_id, et.id FROM event_type et WHERE et.code='team.member.join';
END;
$$ LANGUAGE plpgsql;

-- Принять отклик (actor = капитан соответствующей команды)
CREATE OR REPLACE FUNCTION accept_response(p_response_id BIGINT, p_actor_user_id BIGINT)
RETURNS VOID AS $$
DECLARE
  v_vac_id BIGINT;
  v_app_id BIGINT;
  v_role TEXT;
  v_team_id BIGINT;
  v_hack_id BIGINT;
  v_user_id BIGINT;
  v_is_captain BOOLEAN;
BEGIN
  SELECT r.vacancy_id, r.application_id, r.desired_role,
         v.team_id, t.hackathon_id, a.user_id
  INTO v_vac_id, v_app_id, v_role, v_team_id, v_hack_id, v_user_id
  FROM response r
  JOIN vacancy v ON v.id=r.vacancy_id
  JOIN team t ON t.id=v.team_id
  JOIN application a ON a.id=r.application_id
  WHERE r.id=p_response_id AND r.status='pending'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Response not found or not pending';
  END IF;

  -- Проверить, что actor - капитан этой команды
  SELECT is_captain INTO v_is_captain
  FROM team_member WHERE team_id=v_team_id AND user_id=p_actor_user_id;

  IF NOT FOUND OR v_is_captain IS FALSE THEN
    RAISE EXCEPTION 'Only team captain can accept response';
  END IF;

  -- Вставка участника
  INSERT INTO team_member(team_id, user_id, role, is_captain)
  VALUES (v_team_id, v_user_id, v_role, FALSE);

  -- Скрыть анкету
  UPDATE application SET joined=TRUE, status='hidden' WHERE id=v_app_id;

  -- Закрыть прочие предложения
  UPDATE invite i SET status='expired'
  FROM application a, team t
  WHERE i.application_id=a.id AND a.user_id=v_user_id
    AND t.id=i.team_id AND t.hackathon_id=v_hack_id
    AND i.status='pending';

  UPDATE response r SET status='rejected'
  FROM application a, vacancy v, team t
  WHERE r.application_id=a.id AND a.user_id=v_user_id
    AND v.id=r.vacancy_id AND t.id=v.team_id AND t.hackathon_id=v_hack_id
    AND r.id<>p_response_id AND r.status='pending';

  -- События
  INSERT INTO product_event(user_id, hackathon_id, team_id, type_id)
  SELECT v_user_id, v_hack_id, v_team_id, et.id FROM event_type et WHERE et.code='response.accept';

  INSERT INTO product_event(user_id, hackathon_id, team_id, type_id)
  SELECT v_user_id, v_hack_id, v_team_id, et.id FROM event_type et WHERE et.code='team.member.join';
END;
$$ LANGUAGE plpgsql;
