import { FC, useState } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";

import { getHackathonPath } from "@/shared/routing/paths";
import { HackathonCard } from "@/entities/hackathon/ui/HackathonCard";
import { useHackathonsQuery } from "@/entities/hackathon/api/hooks";
import { Input } from "@telegram-apps/telegram-ui";
import { useDebouncedValue } from "@/shared/helpers/useDebounceValue";
import { InputSection, SText } from "@/shared/ui";

export const HackathonList: FC = () => {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 800);

  const q = debouncedSearch.trim() || undefined;

  const { data } = useHackathonsQuery({ q });

  return (
    <InputSection>
      <Input
        placeholder="Название хакатона"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {data.items.length === 0 ? (
        <NotFound>
          <SText>Ничего не нашлось :(</SText>
        </NotFound>
      ) : (
        <Grid>
          {data.items.map((h) => (
            <CardLink key={h.id} to={getHackathonPath(`${h.id}`)}>
              <HackathonCard hackathon={h} />
            </CardLink>
          ))}
        </Grid>
      )}
    </InputSection>
  );
};

const Grid = styled.section`
  display: grid;
  gap: 12px;
`;

const CardLink = styled(Link)`
  display: block;
  text-decoration: none;
  color: inherit;
`;

const NotFound = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
`;
